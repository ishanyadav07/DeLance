import { ethers } from 'ethers';
import TrustLanceABI from '../contracts/TrustLance.json';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export interface Job {
  client: string;
  freelancer: string;
  amount: string;
  description: string;
  workLink: string;
  status: number;
}

export const getContract = async (withSigner = false) => {
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

export const createJob = async (description: string, amountInEth: string) => {
  const contract = await getContract(true);
  const amountInWei = ethers.parseEther(amountInEth);
  
  const tx = await contract.createJob(description, { value: amountInWei });
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

export const getJob = async (jobId: number): Promise<Job> => {
  const contract = await getContract();
  const job = await contract.getJob(jobId);
  
  return {
    client: job[0],
    freelancer: job[1],
    amount: ethers.formatEther(job[2]),
    description: job[3],
    workLink: job[4],
    status: Number(job[5]),
  };
};

export const getJobCount = async (): Promise<number> => {
  const contract = await getContract();
  const count = await contract.jobCount();
  return Number(count);
};
