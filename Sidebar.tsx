import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, Archive, Trash2, Menu, X, Settings } from 'lucide-react';
import { CoreSphere } from './CoreSphere';
import { Chat } from '../db/database';

interface SidebarProps {
  chats: Chat[];
  currentChatId: number | null;
  onSelectChat: (chatId: number) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: number) => void;
  onOpenVault: () => void;
  onOpenSettings: () => void;
  onGesture: (gesture: 'petting' | 'tickling') => void;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
}

export const Sidebar = ({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onOpenVault,
  onOpenSettings,
  onGesture,
  isMobileOpen,
  onMobileToggle
}: SidebarProps) => {
  const [hoveredChat, setHoveredChat] = useState<number | null>(null);

  return (
    <>
      <button
        onClick={onMobileToggle}
        className="lg:hidden fixed top-4 left-4 z-50 glass p-2 rounded-lg"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <AnimatePresence>
        {(isMobileOpen || window.innerWidth >= 1024) && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed lg:relative w-80 h-screen glass-strong border-r border-white/10 flex flex-col z-40"
          >
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-center mb-6">
                <CoreSphere onGesture={onGesture} />
              </div>

              <h1 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Nexa AI
              </h1>

              <button
                onClick={onNewChat}
                className="w-full glass hover:glass-strong px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105"
                style={{
                  borderColor: 'var(--color-primary)',
                  color: 'var(--color-text)'
                }}
              >
                <Plus size={20} />
                <span>New Chat</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
              <div className="space-y-2">
                {chats.map((chat) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="relative"
                    onMouseEnter={() => setHoveredChat(chat.id!)}
                    onMouseLeave={() => setHoveredChat(null)}
                  >
                    <button
                      onClick={() => onSelectChat(chat.id!)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 group ${
                        currentChatId === chat.id
                          ? 'glass-strong'
                          : 'hover:glass'
                      }`}
                      style={{
                        borderColor: currentChatId === chat.id ? 'var(--color-primary)' : 'transparent',
                        borderWidth: '1px'
                      }}
                    >
                      <MessageSquare size={18} style={{ color: 'var(--color-primary)' }} />
                      <span className="flex-1 truncate text-sm">{chat.title}</span>

                      {hoveredChat === chat.id && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(chat.id!);
                          }}
                          className="p-1 hover:bg-red-500/20 rounded transition-colors"
                        >
                          <Trash2 size={14} className="text-red-400" />
                        </motion.button>
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-white/10 space-y-2">
              <button
                onClick={onOpenVault}
                className="w-full glass hover:glass-strong px-4 py-2 rounded-lg flex items-center gap-3 transition-all duration-200"
              >
                <Archive size={18} style={{ color: 'var(--color-accent)' }} />
                <span className="text-sm">Nexa Vault</span>
              </button>

              <button
                onClick={onOpenSettings}
                className="w-full glass hover:glass-strong px-4 py-2 rounded-lg flex items-center gap-3 transition-all duration-200"
              >
                <Settings size={18} style={{ color: 'var(--color-accent)' }} />
                <span className="text-sm">Settings</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
