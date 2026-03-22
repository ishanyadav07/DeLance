import React from 'react';
import { ResponsiveCard } from '../components/ui/ResponsiveCard';
import { motion } from 'motion/react';

export const Showcase = () => {
  const demoCards = [
    {
      id: 1,
      image: 'https://picsum.photos/seed/audit/800/600',
      title: 'Smart Contract Security Audit for DeFi Protocol',
      description: 'Comprehensive security review of Solidity smart contracts for a high-volume yield optimization protocol on Base.',
      tags: ['Solidity', 'Security', 'EVM'],
      price: '4.50 ETH',
    },
    {
      id: 2,
      image: 'https://picsum.photos/seed/frontend/800/600',
      title: 'dApp Frontend Architecture & Design System',
      description: 'Build a minimal, high-performance dashboard for a ZK-based identity protocol using React and Tailwind CSS.',
      tags: ['React', 'Tailwind', 'Wagmi'],
      price: '12,500 USDC',
    },
    {
      id: 3,
      image: 'https://picsum.photos/seed/zk/800/600',
      title: 'ZK-Rollup Proof Generation Optimization',
      description: 'Research and optimize ZK-Rollup proof generation times for a next-generation Layer 2 scaling solution.',
      tags: ['Cryptography', 'Rust', 'L2'],
      price: '8.00 ETH',
    },
    {
      id: 4,
      image: 'https://picsum.photos/seed/design/800/600',
      title: 'DeFi Index User Experience Design',
      description: 'Design the end-to-end user experience for a new decentralized index protocol focusing on accessibility.',
      tags: ['UI Design', 'Figma', 'Web3 UX'],
      price: '6,000 USDC',
    },
    {
      id: 5,
      image: 'https://picsum.photos/seed/bot/800/600',
      title: 'High-Frequency MEV Trading Bot Development',
      description: 'Develop a high-frequency trading bot for MEV opportunities on Ethereum using Flashbots and Go.',
      tags: ['Python', 'Flashbots', 'Go'],
      price: '15.00 ETH',
    },
    {
      id: 6,
      image: 'https://picsum.photos/seed/indexer/800/600',
      title: 'Solana Blockchain Data Indexer Service',
      description: 'Build a robust, low-latency indexer for Solana blockchain data using Anchor and Node.js.',
      tags: ['Solana', 'Anchor', 'Node'],
      price: '3,500 USDC',
    },
    {
      id: 7,
      image: 'https://picsum.photos/seed/dao/800/600',
      title: 'DAO Governance Framework Implementation',
      description: 'Implement a custom governance framework for a large-scale decentralized autonomous organization.',
      tags: ['Governance', 'Solidity', 'DAO'],
      price: '5.20 ETH',
    },
    {
      id: 8,
      image: 'https://picsum.photos/seed/wallet/800/600',
      title: 'Multi-Signature Wallet Security Layer',
      description: 'Add an additional layer of security to an existing multi-signature wallet implementation.',
      tags: ['Security', 'Wallet', 'Cryptography'],
      price: '7,500 USDC',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-12">
        <h1 className="text-4xl font-headline font-extrabold tracking-tight mb-4 uppercase">
          Responsive <span className="text-primary">Card Showcase</span>
        </h1>
        <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">
          A demonstration of the fully responsive card UI component, adjusting its layout and grid columns based on screen size.
        </p>
      </header>

      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {demoCards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <ResponsiveCard 
              image={card.image}
              title={card.title}
              description={card.description}
              tags={card.tags}
              price={card.price}
              onButtonClick={() => alert(`Clicked on ${card.title}`)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
