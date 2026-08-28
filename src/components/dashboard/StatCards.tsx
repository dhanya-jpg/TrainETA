import React from 'react';
import { motion } from 'motion/react';
import { AnalyticsSummary } from '../../types';

interface StatCardsProps {
  analytics: AnalyticsSummary;
  onCardClick?: (type: string) => void;
}

export const StatCards: React.FC<StatCardsProps> = ({ analytics, onCardClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <motion.div 
        onClick={() => onCardClick?.('active')}
        className="bg-surface-dark text-ink p-8 rounded-[2rem] cursor-pointer group flex flex-col justify-between min-h-[200px]"
      >
        <div className="flex items-center gap-2 text-sm font-mono-code uppercase tracking-widest text-ink/60">
          Active Train & Status
        </div>
        <div className="font-display text-7xl sm:text-[120px] leading-[0.85] tracking-tight mt-4">
          {analytics.activeTrainsCount}
        </div>
      </motion.div>

      <motion.div 
        onClick={() => onCardClick?.('delayed')}
        className="bg-surface-dark text-ink p-8 rounded-[2rem] cursor-pointer group flex flex-col justify-between min-h-[200px]"
      >
        <div className="flex items-center gap-2 text-sm font-mono-code uppercase tracking-widest text-ink/60">
          Predicted Arrival @ BSB
        </div>
        <div className="font-display text-accent text-7xl sm:text-[120px] leading-[0.85] tracking-tight mt-4">
          Aug 28<br/>03:05
        </div>
      </motion.div>
    </div>
  );
};
