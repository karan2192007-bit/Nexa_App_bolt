import { motion } from 'framer-motion';
import { User, Sparkles } from 'lucide-react';
import { Message } from '../db/database';

interface ChatMessageProps {
  message: Message;
  index: number;
}

export const ChatMessage = ({ message, index }: ChatMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
        delay: index * 0.05
      }}
      className={`flex gap-4 mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <motion.div
          className="flex-shrink-0 w-10 h-10 rounded-full glass flex items-center justify-center"
          style={{
            background: `radial-gradient(circle at 30% 30%, var(--color-secondary), var(--color-primary))`,
            boxShadow: '0 0 20px var(--color-glow)'
          }}
          animate={{
            boxShadow: [
              '0 0 20px var(--color-glow)',
              '0 0 30px var(--color-glow)',
              '0 0 20px var(--color-glow)'
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <Sparkles size={18} className="text-white" />
        </motion.div>
      )}

      <motion.div
        className={`max-w-[70%] relative ${isUser ? 'order-first' : ''}`}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <div
          className={`glass px-6 py-4 rounded-2xl ${
            isUser
              ? 'rounded-tr-sm'
              : 'rounded-tl-sm'
          }`}
          style={{
            borderColor: isUser ? 'var(--color-accent)' : 'var(--color-primary)',
            borderWidth: '1px',
            background: isUser
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(139, 92, 246, 0.1)'
          }}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--color-text)' }}>
            {message.content}
          </p>
        </div>

        <div className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </motion.div>

      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full glass flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent), var(--color-secondary))',
            borderColor: 'var(--color-accent)',
            borderWidth: '1px'
          }}
        >
          <User size={18} className="text-white" />
        </div>
      )}
    </motion.div>
  );
};
