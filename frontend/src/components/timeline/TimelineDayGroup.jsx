import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import TimelineCard from './TimelineCard';

const TimelineDayGroup = ({ label, date, images, groupIndex }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: groupIndex * 0.12,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative"
    >
      {/* Day header */}
      <div className="flex items-center gap-3 mb-4 pl-10 relative">
        {/* Dot on the timeline */}
        <div className="absolute left-[3px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full bg-surface border-[1.5px] border-border-strong flex items-center justify-center">
          <Calendar size={9} className="text-fg-tertiary" />
        </div>

        <div className="flex items-baseline gap-2">
          <h3 className="text-[14px] font-medium text-fg-primary">{label}</h3>
          <span className="text-[11px] text-fg-tertiary tabular-nums">{date}</span>
        </div>
        <div className="flex-1 h-[0.5px] bg-border ml-2" />
        <span className="text-[11px] text-fg-tertiary tabular-nums flex-shrink-0">
          {images.length} {images.length === 1 ? 'image' : 'images'}
        </span>
      </div>

      {/* Cards */}
      <div>
        {images.map((image, idx) => (
          <TimelineCard key={image.id} image={image} index={idx} />
        ))}
      </div>
    </motion.section>
  );
};

export default TimelineDayGroup;
