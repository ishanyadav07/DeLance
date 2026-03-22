import { ethers } from 'ethers';
import TrustLanceABI from '../contracts/TrustLance.json';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// This is a placeholder address. The user needs to deploy the contract and update this.
const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';

export interface BlockchainJob {
  client: string;
  freelancer: string;
  amount: string;
  description: string;
  workLink: string;
  status: number;
}

export const getContract = async (providerOrSigner: ethers.Provider | ethers.Signer) => {
  return new ethers.Contract(CONTRACT_ADDRESS, TrustLanceABI, providerOrSigner);
};

export const createJobOnChain = async (description: string, amountInEth: string) => {
  if (!window.ethereum) throw new Error('No crypto wallet found. Please install MetaMask.');
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = await getContract(signer);
  
  const tx = await contract.createJob(description, {
    value: ethers.parseEther(amountInEth)
  });
  
  const receipt = await tx.wait();
  // Find the JobCreated event
  const event = receipt.logs.find((log: any) => {
    try {
      const parsed = contract.interface.parseLog(log);
      return parsed?.name === 'JobCreated';
    } catch (e) {
      return false;
    }
  });

  if (event) {
    const parsed = contract.interface.parseLog(event);
    return { hash: tx.hash, jobId: Number(parsed?.args[0]) };
  }
  
  return { hash: tx.hash, jobId: null };
};

export const acceptJobOnChain = async (jobId: number) => {
  if (!window.ethereum) throw new Error('No crypto wallet found. Please install MetaMask.');
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = await getContract(signer);
  
  const tx = await contract.acceptJob(jobId);
  return await tx.wait();
};

export const submitWorkOnChain = async (jobId: number, workLink: string) => {
  if (!window.ethereum) throw new Error('No crypto wallet found. Please install MetaMask.');
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = await getContract(signer);
  
  const tx = await contract.submitWork(jobId, workLink);
  return await tx.wait();
};

export const approveWorkOnChain = async (jobId: number) => {
  if (!window.ethereum) throw new Error('No crypto wallet found. Please install MetaMask.');
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = await getContract(signer);
  
  const tx = await contract.approveWork(jobId);
  return await tx.wait();
};

export const getJobFromChain = async (jobId: number): Promise<BlockchainJob> => {
  if (!window.ethereum) throw new Error('No crypto wallet found. Please install MetaMask.');
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = await getContract(provider);
  
  const job = await contract.getJob(jobId);
  return {
    client: job[0],
    freelancer: job[1],
    amount: ethers.formatEther(job[2]),
    description: job[3],
    workLink: job[4],
    status: Number(job[5])
  };
};
