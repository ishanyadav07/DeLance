import React from 'react';
import { ResponsiveCard } from '../components/ui/ResponsiveCard';
import { motion } from 'motion/react';

export const Showcase = () => {
  const demoCards = [
    {
      id: 1,
      image: 'https://picsum.photos/seed/audit/800/600',
      title: 'Security Audit for E-commerce Platform',
      description: 'Comprehensive security review of a high-volume e-commerce platform.',
      tags: ['Security', 'Node.js', 'React'],
      price: '$4,500',
    },
    {
      id: 2,
      image: 'https://picsum.photos/seed/frontend/800/600',
      title: 'SaaS Frontend Architecture & Design System',
      description: 'Build a minimal, high-performance dashboard for a new SaaS product using React and Tailwind CSS.',
      tags: ['React', 'Tailwind', 'TypeScript'],
      price: '$12,500',
    },
    {
      id: 3,
      image: 'https://picsum.photos/seed/zk/800/600',
      title: 'Database Query Optimization',
      description: 'Research and optimize complex database queries for a large-scale enterprise application.',
      tags: ['PostgreSQL', 'Performance', 'Backend'],
      price: '$8,000',
    },
    {
      id: 4,
      image: 'https://picsum.photos/seed/design/800/600',
      title: 'Fintech User Experience Design',
      description: 'Design the end-to-end user experience for a new fintech application focusing on accessibility.',
      tags: ['UI Design', 'Figma', 'UX'],
      price: '$6,000',
    },
    {
      id: 5,
      image: 'https://picsum.photos/seed/bot/800/600',
      title: 'High-Frequency Trading Bot Development',
      description: 'Develop a high-frequency trading bot for stock market opportunities using Python and Go.',
      tags: ['Python', 'Trading', 'Go'],
      price: '$15,000',
    },
    {
      id: 6,
      image: 'https://picsum.photos/seed/indexer/800/600',
      title: 'Real-time Data Indexer Service',
      description: 'Build a robust, low-latency indexer for real-time financial data using Node.js and Redis.',
      tags: ['Redis', 'Data', 'Node.js'],
      price: '$3,500',
    },
    {
      id: 7,
      image: 'https://picsum.photos/seed/dao/800/600',
      title: 'Internal Governance Framework Implementation',
      description: 'Implement a custom governance and voting framework for a large-scale organization.',
      tags: ['Governance', 'Internal Tools', 'React'],
      price: '$5,200',
    },
    {
      id: 8,
      image: 'https://picsum.photos/seed/wallet/800/600',
      title: 'Payment Gateway Security Layer',
      description: 'Add an additional layer of security to an existing payment gateway implementation.',
      tags: ['Security', 'Payments', 'Cryptography'],
      price: '$7,500',
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
