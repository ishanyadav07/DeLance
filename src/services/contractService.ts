import { ethers } from 'ethers';
import TrustLanceABI from '../contracts/TrustLance.json';

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS ? ethers.getAddress(import.meta.env.VITE_CONTRACT_ADDRESS.trim().toLowerCase()) : null;
export const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS ? ethers.getAddress(import.meta.env.VITE_USDC_ADDRESS.trim().toLowerCase()) : null;

console.log('Contract Address:', CONTRACT_ADDRESS);
console.log('USDC Address:', USDC_ADDRESS);

const validateAddresses = () => {
  if (!CONTRACT_ADDRESS) {
    throw new Error('VITE_CONTRACT_ADDRESS is not defined. Please add it to the Secrets panel in AI Studio.');
  }
  if (!USDC_ADDRESS) {
    throw new Error('VITE_USDC_ADDRESS is not defined. Please add it to the Secrets panel in AI Studio.');
  }
};

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function balanceOf(address account) public view returns (uint256)"
];

export interface Job {
  client: string;
  freelancer: string;
  amount: string;
  description: string;
  workLink: string;
  status: number;
  token: string;
}

export const getContract = async (withSigner = false) => {
  validateAddresses();
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  
  if (withSigner) {
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, TrustLanceABI, signer);
  }
  
  return new ethers.Contract(CONTRACT_ADDRESS, TrustLanceABI, provider);
};

export const getERC20Contract = async (tokenAddress: string, withSigner = false) => {
  if (!tokenAddress) {
    throw new Error('Token address is required for ERC20 contract instance');
  }
  const normalizedAddress = ethers.getAddress(tokenAddress);
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  
  if (withSigner) {
    const signer = await provider.getSigner();
    return new ethers.Contract(normalizedAddress, ERC20_ABI, signer);
  }
  
  return new ethers.Contract(normalizedAddress, ERC20_ABI, provider);
};

export const approveToken = async (amount: string, tokenAddress: string = USDC_ADDRESS) => {
  const tokenContract = await getERC20Contract(tokenAddress, true);
  const amountInUnits = ethers.parseUnits(amount, 6); // USDC has 6 decimals
  
  const tx = await tokenContract.approve(CONTRACT_ADDRESS, amountInUnits);
  await tx.wait();
  return tx;
};

export const createJob = async (description: string, amount: string, tokenAddress: string = USDC_ADDRESS) => {
  const contract = await getContract(true);
  const amountInUnits = ethers.parseUnits(amount, 6); // USDC has 6 decimals
  
  // 1. Check allowance first
  const tokenContract = await getERC20Contract(tokenAddress, true);
  const signer = await (new ethers.BrowserProvider(window.ethereum!)).getSigner();
  const allowance = await tokenContract.allowance(await signer.getAddress(), CONTRACT_ADDRESS);
  
  if (allowance < amountInUnits) {
    // If allowance is not enough, we need to approve first
    const approveTx = await tokenContract.approve(CONTRACT_ADDRESS, amountInUnits);
    await approveTx.wait();
  }

  const tx = await contract.createJob(description, amountInUnits, tokenAddress);
  const receipt = await tx.wait();
  
  // Find the JobCreated event to get the jobId
  const event = receipt.logs.find((log: any) => {
    try {
      const parsedLog = contract.interface.parseLog(log);
      return parsedLog?.name === 'JobCreated';
    } catch (e) {
      return false;
    }
  });

  if (event) {
    const parsedLog = contract.interface.parseLog(event);
    return Number(parsedLog?.args.jobId);
  }
  
  return null;
};

export const acceptJob = async (jobId: number) => {
  const contract = await getContract(true);
  const tx = await contract.acceptJob(jobId);
  await tx.wait();
  return tx;
};

export const submitWork = async (jobId: number, workLink: string) => {
  const contract = await getContract(true);
  const tx = await contract.submitWork(jobId, workLink);
  await tx.wait();
  return tx;
};

export const approveWork = async (jobId: number) => {
  const contract = await getContract(true);
  const tx = await contract.approveWork(jobId);
  await tx.wait();
  return tx;
};

export const refund = async (jobId: number) => {
  const contract = await getContract(true);
  const tx = await contract.refund(jobId);
  await tx.wait();
  return tx;
};

export const getJob = async (jobId: number): Promise<Job> => {
  const contract = await getContract();
  const job = await contract.getJob(jobId);
  
  return {
    client: job[0],
    freelancer: job[1],
    amount: ethers.formatUnits(job[2], 6), // Assuming USDC 6 decimals
    description: job[3],
    workLink: job[4],
    status: Number(job[5]),
    token: job[6] ? ethers.getAddress(job[6]) : USDC_ADDRESS
  };
};

export const getJobCount = async (): Promise<number> => {
  const contract = await getContract();
  const count = await contract.jobCount();
  return Number(count);
};
