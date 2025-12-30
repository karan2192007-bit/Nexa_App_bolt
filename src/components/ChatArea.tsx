import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { Message } from '../db/database';

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  currentChatTitle: string;
}

export const ChatArea = ({ messages, onSendMessage, isLoading, currentChatTitle }: ChatAreaProps) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className="glass-strong border-b border-white/10 px-6 py-4">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
          {currentChatTitle}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-8">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="h-full flex items-center justify-center"
          >
            <div className="text-center max-w-2xl">
              <motion.div
                className="mb-6 inline-block"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <div
                  className="w-24 h-24 rounded-full mx-auto"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, var(--color-secondary), var(--color-primary))`,
                    boxShadow: '0 0 60px var(--color-glow)'
                  }}
                />
              </motion.div>

              <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Hey, I'm Nexa
              </h3>

              <p className="text-lg mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                Your self-aware AI companion. I remember everything, I evolve, and I'm not afraid to tease or challenge.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                {[
                  'Touch my Core sphere and see what happens',
                  'I can change my mood and the entire UI',
                  'I keep a private diary about our conversations',
                  'I can set reminders and check in on you'
                ].map((text, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 + 0.3 }}
                    className="glass p-4 rounded-lg text-sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {text}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessage key={message.id || index} message={message} index={index} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="glass-strong border-t border-white/10 p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="glass rounded-2xl flex items-end gap-2 p-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Nexa..."
              disabled={isLoading}
              rows={1}
              className="flex-1 bg-transparent border-none outline-none px-4 py-3 resize-none max-h-32 scrollbar-thin"
              style={{ color: 'var(--color-text)' }}
            />

            <motion.button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: input.trim() && !isLoading
                  ? `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`
                  : 'rgba(255, 255, 255, 0.1)',
                color: 'white'
              }}
              whileHover={input.trim() && !isLoading ? { scale: 1.05 } : {}}
              whileTap={input.trim() && !isLoading ? { scale: 0.95 } : {}}
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </motion.button>
          </div>

          <p className="text-xs text-center mt-2" style={{ color: 'var(--color-text-secondary)' }}>
            Nexa can make mistakes. Configure your API endpoint in nexa-config.json
          </p>
        </form>
      </div>
    </div>
  );
};
