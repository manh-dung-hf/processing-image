import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Upload, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

const TimelineEmpty = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      {/* Animated icon cluster */}
      <div className="relative mb-6">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-2xl bg-accent-soft flex items-center justify-center"
        >
          <Clock size={28} className="text-accent" />
        </motion.div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-warning-soft flex items-center justify-center"
        >
          <div className="w-2 h-2 rounded-full bg-warning" />
        </motion.div>
      </div>

      <h2 className="text-h2 font-medium text-fg-primary mb-2">No timeline yet</h2>
      <p className="text-small text-fg-tertiary max-w-[320px] mb-8 leading-relaxed">
        Upload your first image to start building your visual timeline. Each image will appear here sorted by date.
      </p>

      <Button
        variant="primary"
        size="md"
        icon={<Upload size={14} />}
        trailingIcon={<ArrowRight size={14} />}
        onClick={() => navigate('/upload')}
      >
        Upload images
      </Button>
    </motion.div>
  );
};

export default TimelineEmpty;
