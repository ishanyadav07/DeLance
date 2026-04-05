import { db } from '../firebase';
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, Timestamp, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firebaseErrors';

export enum TransactionType {
  ESCROW_DEPOSIT = 'escrow_deposit',
  PAYOUT = 'payout',
  REFUND = 'refund',
  FEE = 'fee'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface Transaction {
  id?: string;
  jobId: string;
  milestoneId?: string;
  fromId: string;
  toId: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  type: TransactionType;
  txHash?: string;
  createdAt: Timestamp | any;
}

export const recordTransaction = async (transaction: Omit<Transaction, 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'transactions'), {
      ...transaction,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'transactions');
  }
};

export const getUserTransactions = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'transactions'),
      where('fromId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const q2 = query(
      collection(db, 'transactions'),
      where('toId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const [fromSnap, toSnap] = await Promise.all([getDocs(q), getDocs(q2)]);
    
    const transactions = [
      ...fromSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)),
      ...toSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction))
    ];

    // Sort by date descending
    return transactions.sort((a, b) => {
      const dateA = a.createdAt?.toMillis?.() || 0;
      const dateB = b.createdAt?.toMillis?.() || 0;
      return dateB - dateA;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'transactions');
    return [];
  }
};

export const subscribeToUserTransactions = (userId: string, callback: (transactions: Transaction[]) => void) => {
  const qFrom = query(
    collection(db, 'transactions'),
    where('fromId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const qTo = query(
    collection(db, 'transactions'),
    where('toId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  let fromTxs: Transaction[] = [];
  let toTxs: Transaction[] = [];

  const updateAndCallback = () => {
    const combined = [...fromTxs];
    toTxs.forEach(tx => {
      if (!combined.find(t => t.id === tx.id)) {
        combined.push(tx);
      }
    });
    
    const sorted = combined.sort((a, b) => {
      const dateA = a.createdAt?.toMillis?.() || 0;
      const dateB = b.createdAt?.toMillis?.() || 0;
      return dateB - dateA;
    });
    
    callback(sorted);
  };

  const unsubFrom = onSnapshot(qFrom, (snapshot) => {
    fromTxs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
    updateAndCallback();
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'transactions');
  });

  const unsubTo = onSnapshot(qTo, (snapshot) => {
    toTxs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
    updateAndCallback();
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'transactions');
  });

  return () => {
    unsubFrom();
    unsubTo();
  };
};
