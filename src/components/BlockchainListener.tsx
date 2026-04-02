import React, { useEffect } from 'react';
import { ethers } from 'ethers';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import TrustLanceABI from '../contracts/TrustLance.json';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS ? ethers.getAddress(import.meta.env.VITE_CONTRACT_ADDRESS.trim().toLowerCase()) : null;

export const BlockchainListener: React.FC = () => {
  useEffect(() => {
    if (!window.ethereum || !CONTRACT_ADDRESS) return;

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, TrustLanceABI, provider);

    const handleJobCreated = async (jobId: bigint, client: string, amount: bigint, token: string) => {
      console.log('Event: JobCreated', { jobId, client, amount, token });
      // This is usually handled by the frontend immediately after tx, 
      // but we can add logic here to ensure sync if needed.
    };

    const handleJobAccepted = async (jobId: bigint, freelancer: string) => {
      console.log('Event: JobAccepted', { jobId, freelancer });
      try {
        const jobsRef = collection(db, 'jobs');
        const q = query(jobsRef, where('contractJobId', '==', Number(jobId)));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const jobDoc = querySnapshot.docs[0];
          await updateDoc(doc(db, 'jobs', jobDoc.id), {
            status: 'in_progress',
            freelancerWallet: freelancer,
            updatedAt: new Date()
          });
          console.log(`Synced job ${jobDoc.id} to in_progress`);
        }
      } catch (err) {
        console.error('Error syncing JobAccepted event:', err);
      }
    };

    const handleWorkSubmitted = async (jobId: bigint, workLink: string) => {
      console.log('Event: WorkSubmitted', { jobId, workLink });
      try {
        const jobsRef = collection(db, 'jobs');
        const q = query(jobsRef, where('contractJobId', '==', Number(jobId)));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const jobDoc = querySnapshot.docs[0];
          await updateDoc(doc(db, 'jobs', jobDoc.id), {
            status: 'reviewing',
            workLink: workLink,
            updatedAt: new Date()
          });
        }
      } catch (err) {
        console.error('Error syncing WorkSubmitted event:', err);
      }
    };

    const handlePaymentReleased = async (jobId: bigint, freelancer: string, amount: bigint) => {
      console.log('Event: PaymentReleased', { jobId, freelancer, amount });
      try {
        const jobsRef = collection(db, 'jobs');
        const q = query(jobsRef, where('contractJobId', '==', Number(jobId)));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const jobDoc = querySnapshot.docs[0];
          await updateDoc(doc(db, 'jobs', jobDoc.id), {
            status: 'completed',
            updatedAt: new Date()
          });
        }
      } catch (err) {
        console.error('Error syncing PaymentReleased event:', err);
      }
    };

    const handleRefunded = async (jobId: bigint, amount: bigint) => {
      console.log('Event: Refunded', { jobId, amount });
      try {
        const jobsRef = collection(db, 'jobs');
        const q = query(jobsRef, where('contractJobId', '==', Number(jobId)));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const jobDoc = querySnapshot.docs[0];
          await updateDoc(doc(db, 'jobs', jobDoc.id), {
            status: 'refunded',
            updatedAt: new Date()
          });
        }
      } catch (err) {
        console.error('Error syncing Refunded event:', err);
      }
    };

    // Attach listeners
    contract.on('JobCreated', handleJobCreated);
    contract.on('JobAccepted', handleJobAccepted);
    contract.on('WorkSubmitted', handleWorkSubmitted);
    contract.on('PaymentReleased', handlePaymentReleased);
    contract.on('Refunded', handleRefunded);

    return () => {
      contract.removeAllListeners();
    };
  }, []);

  return null; // This component doesn't render anything
};
