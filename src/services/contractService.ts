import { ethers } from 'ethers';
import TrustLanceABI from '../contracts/TrustLance.json';

const getSafeAddress = (address: string | undefined) => {
  if (!address) return null;
  const trimmed = address.trim();
  if (!trimmed) return null;
  try {
    return ethers.getAddress(trimmed);
  } catch (e) {
    try {
      return ethers.getAddress(trimmed.toLowerCase());
    } catch (e2) {
      console.error('Invalid address format:', address);
      return null;
    }
  }
};

console.log('Raw VITE_CONTRACT_ADDRESS:', import.meta.env.VITE_CONTRACT_ADDRESS);
console.log('Raw VITE_USDC_ADDRESS:', import.meta.env.VITE_USDC_ADDRESS);

export const CONTRACT_ADDRESS = getSafeAddress(import.meta.env.VITE_CONTRACT_ADDRESS);
export const USDC_ADDRESS = getSafeAddress(import.meta.env.VITE_USDC_ADDRESS);

console.log('Normalized Contract Address:', CONTRACT_ADDRESS);
console.log('Normalized USDC Address:', USDC_ADDRESS);

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

export const deployMockUSDC = async () => {
  if (!window.ethereum) throw new Error('MetaMask is not installed');
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  const MockUSDC_ABI = [
    "constructor()",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function mint(address to, uint256 amount) public"
  ];
  
  // Minimal bytecode for a Mock USDC (ERC20 with 6 decimals)
  // This is a simplified version. In a real app, we'd use the full artifact.
  // For now, I'll advise the user to use Remix for deployment as it's safer.
  throw new Error('Please deploy the Mock USDC contract in Remix using the code provided in the previous message, then update your VITE_USDC_ADDRESS secret.');
};

export const createJob = async (description: string, amount: string, tokenAddress: string = USDC_ADDRESS) => {
  const contract = await getContract(true);
  
  console.log('--- Debugging createJob ---');
  console.log('Token Address:', tokenAddress);
  console.log('Contract Address:', CONTRACT_ADDRESS);
  
  const tokenContract = await getERC20Contract(tokenAddress, true);
  
  // Fetch decimals dynamically
  let decimals = 6;
  try {
    const d = await tokenContract.decimals();
    decimals = Number(d);
    console.log('Token Decimals:', decimals);
  } catch (e) {
    console.warn('Failed to fetch decimals, defaulting to 6:', e);
  }

  const amountInUnits = ethers.parseUnits(amount, decimals);
  
  const provider = new ethers.BrowserProvider(window.ethereum!);
  const signer = await provider.getSigner();
  const userAddress = await signer.getAddress();
  console.log('User Address:', userAddress);
  
  const network = await provider.getNetwork();
  const currentChainId = network.chainId;
  console.log('Network Name:', network.name);
  console.log('Current Chain ID:', currentChainId.toString());
  
  const normalizedTokenAddress = ethers.getAddress(tokenAddress);
  console.log('Checking code for address:', normalizedTokenAddress);

  // Verify that the token address is actually a contract
  let code = '0x';
  try {
    code = await provider.getCode(normalizedTokenAddress);
    console.log('Token Contract Code Length:', code.length);
  } catch (codeErr) {
    console.warn('Failed to fetch contract code:', codeErr);
  }

  if (code === '0x' || code === '0x0') {
    console.warn(`[DIAGNOSTIC] No contract code found at ${normalizedTokenAddress} on Chain ${currentChainId}.`);
    console.warn('This usually means the address is an EOA (wallet) or the contract is not deployed on this specific RPC node.');
    
    // We'll allow it to proceed to the next step to see if the actual call fails
    // This helps diagnose if getCode is just being weird or if the contract is truly missing
  }

  if (!CONTRACT_ADDRESS) {
    throw new Error('Contract address is not configured.');
  }

  const normalizedContractAddress = ethers.getAddress(CONTRACT_ADDRESS);
  let contractCode = '0x';
  try {
    contractCode = await provider.getCode(normalizedContractAddress);
    console.log('Main Contract Code Length:', contractCode.length);
  } catch (err) {
    console.warn('Failed to fetch main contract code:', err);
  }

  if (contractCode === '0x' || contractCode === '0x0') {
    throw new Error(`Your TrustLance contract at ${normalizedContractAddress} was not found on Chain ${currentChainId}. 
    
    This usually means:
    1. You are on the wrong network in MetaMask (should be Sepolia).
    2. You haven't updated your VITE_CONTRACT_ADDRESS secret with the correct address after deploying.`);
  }

  // Check if both are missing - strong indicator of wrong network/RPC
  if ((code === '0x' || code === '0x0') && (contractCode === '0x' || contractCode === '0x0')) {
    throw new Error(`CRITICAL: Neither the USDC token nor your TrustLance contract were found on Chain ${currentChainId}. 
    
    This is a strong indicator that your MetaMask is connected to a network where these contracts don't exist. 
    Please double-check your network settings and ensure you are on the Sepolia Testnet.`);
  }

  // Check if the token is allowed in the contract
  console.log('Checking if token is allowed in contract...');
  try {
    const isAllowed = await contract.allowedTokens(normalizedTokenAddress);
    console.log('Is Token Allowed:', isAllowed);
    if (!isAllowed) {
      throw new Error(`The token ${normalizedTokenAddress} is NOT allowed by your TrustLance contract. 
      
      This happens if you deployed the contract with a different USDC address in the constructor. 
      To fix this:
      1. Redeploy the TrustLance contract in Remix.
      2. Pass ${normalizedTokenAddress} into the constructor array.
      3. Update your VITE_CONTRACT_ADDRESS secret with the new address.`);
    }
  } catch (allowedErr) {
    console.warn('Failed to check allowedTokens (contract might not have this mapping):', allowedErr);
  }

  console.log('Calling allowance...');
  let allowance = BigInt(0);
  try {
    allowance = await tokenContract.allowance(userAddress, CONTRACT_ADDRESS);
    console.log('Allowance:', allowance.toString());
  } catch (allowanceErr: any) {
    console.warn('Error checking allowance:', allowanceErr);
    if (allowanceErr.code === 'CALL_EXCEPTION' || allowanceErr.code === 'BAD_DATA') {
       console.error(`The USDC contract at ${tokenAddress} returned no data for allowance.`);
       // We'll proceed to balance check to see if that also fails
    } else {
      throw allowanceErr;
    }
  }
    
  // Check balance
  let balance = BigInt(0);
  try {
    balance = await tokenContract.balanceOf(userAddress);
    console.log('User USDC Balance:', balance.toString());
  } catch (balanceErr: any) {
    console.error('Error checking balance:', balanceErr);
    if (balanceErr.code === 'CALL_EXCEPTION' || balanceErr.code === 'BAD_DATA') {
      throw new Error(`The USDC contract at ${tokenAddress} returned no data. 
      This means the address is NOT a smart contract on Chain ${currentChainId}. 
      
      Please ensure:
      1. Your MetaMask is on the CORRECT Sepolia network.
      2. If you are using a local fork or a private testnet, you MUST deploy a Mock USDC and use its address.`);
    }
    throw balanceErr;
  }
    
  if (balance < amountInUnits) {
    throw new Error(`Insufficient USDC balance. You have ${ethers.formatUnits(balance, decimals)} USDC but need ${amount}.`);
  }

  if (allowance < amountInUnits) {
    // If allowance is not enough, we need to approve first
    console.log('Insufficient allowance, calling approve...');
    try {
      const approveTx = await tokenContract.approve(CONTRACT_ADDRESS, amountInUnits);
      await approveTx.wait();
      console.log('Approval successful');
    } catch (approveErr: any) {
      console.error('Error approving token:', approveErr);
      throw new Error(`Failed to approve USDC. The contract at ${tokenAddress} might not be a valid ERC20 token on this network.`);
    }
  }

  console.log('Creating job on contract...');
  console.log('Arguments:', { description, amountInUnits: amountInUnits.toString(), tokenAddress });
  
  try {
    const tx = await contract.createJob(description, amountInUnits, tokenAddress);
    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt.hash);
    
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
  } catch (createErr: any) {
    console.error('Error in createJob contract call:', createErr);
    
    // Try to decode the revert reason
    if (createErr.data) {
      try {
        const decodedError = contract.interface.parseError(createErr.data);
        console.error('Decoded revert reason:', decodedError);
        throw new Error(`Contract reverted: ${decodedError?.name || 'Unknown reason'}`);
      } catch (e) {
        // If it's a string revert
        throw new Error(`Contract reverted: ${createErr.reason || createErr.message}`);
      }
    }
    
    throw createErr;
  }
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
