// src/Card.js
import React from 'react';
import { motion } from 'framer-motion';

function Card({ children }) {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}

export default Card;
