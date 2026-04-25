import React from 'react';
import { motion } from 'framer-motion';
import { ImagePlus, Upload, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

const GalleryEmpty = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center py-28 text-center"
    >
      {/* Animated icon */}
      <div className="relative mb-8">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-2xl bg-accent-soft/60 flex items-center justify-center"
        >
          <ImagePlus size={36} className="text-accent" strokeWidth={1.5} />
        </motion.div>

        {/* Floating dots */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          className="absolute -top-1 -right-2 w-3 h-3 rounded-full bg-success"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.8 }}
          className="absolute -bottom-1 -left-2 w-2.5 h-2.5 rounded-full bg-warning"
        />
      </div>

      <h2 className="text-h2 font-medium text-fg-primary mb-2">Your gallery is empty</h2>
      <p className="text-small text-fg-tertiary max-w-[340px] mb-8 leading-relaxed">
        Upload images to get started. Our AI will automatically analyze, tag, and organize them for you.
      </p>

      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          size="md"
          icon={<Upload size={14} />}
          trailingIcon={<ArrowRight size={14} />}
          onClick={() => navigate('/upload')}
        >
          Upload images
        </Button>
        <span className="text-[11px] text-fg-tertiary">or drag & drop anywhere</span>
      </div>
    </motion.div>
  );
};

export default GalleryEmpty;
