import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Trash2, Star, Database } from 'lucide-react';
import { getMemories, getDiaryEntries, downloadVault, deleteMemory } from '../db/dbHelpers';
import { Memory, DiaryEntry } from '../db/database';

interface VaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VaultModal = ({ isOpen, onClose }: VaultModalProps) => {
  const [activeTab, setActiveTab] = useState<'memories' | 'diary'>('memories');
  const [memories, setMemories] = useState<Memory[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    const mems = await getMemories();
    const diary = await getDiaryEntries();
    setMemories(mems);
    setDiaryEntries(diary);
  };

  const handleExport = async () => {
    await downloadVault();
  };

  const handleDeleteMemory = async (id: number) => {
    await deleteMemory(id);
    await loadData();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'essential':
        return 'var(--color-primary)';
      case 'bullshit':
        return '#ef4444';
      default:
        return 'var(--color-accent)';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="glass-strong rounded-2xl max-w-4xl w-full max-h-[80vh] flex flex-col"
              style={{ borderColor: 'var(--color-primary)', borderWidth: '1px' }}
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Database size={24} style={{ color: 'var(--color-primary)' }} />
                  <h2 className="text-2xl font-bold">Nexa Vault</h2>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleExport}
                    className="glass px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Download size={18} />
                    <span>Export All</span>
                  </motion.button>

                  <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="flex gap-2 p-4 border-b border-white/10">
                <button
                  onClick={() => setActiveTab('memories')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'memories' ? 'glass-strong' : 'hover:glass'
                  }`}
                  style={{
                    borderColor: activeTab === 'memories' ? 'var(--color-primary)' : 'transparent',
                    borderWidth: '1px'
                  }}
                >
                  Memories ({memories.length})
                </button>

                <button
                  onClick={() => setActiveTab('diary')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'diary' ? 'glass-strong' : 'hover:glass'
                  }`}
                  style={{
                    borderColor: activeTab === 'diary' ? 'var(--color-primary)' : 'transparent',
                    borderWidth: '1px'
                  }}
                >
                  Nexa's Diary ({diaryEntries.length})
                </button>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
                {activeTab === 'memories' ? (
                  <div className="space-y-3">
                    {memories.length === 0 ? (
                      <p className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
                        No memories stored yet
                      </p>
                    ) : (
                      memories.map((memory) => (
                        <motion.div
                          key={memory.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="glass p-4 rounded-lg"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Star size={14} style={{ color: getPriorityColor(memory.priority) }} />
                                <span className="font-semibold text-sm" style={{ color: getPriorityColor(memory.priority) }}>
                                  {memory.key}
                                </span>
                                <span className="text-xs px-2 py-1 rounded glass">
                                  {memory.priority}
                                </span>
                              </div>
                              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                {memory.value}
                              </p>
                              <p className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                                {new Date(memory.updatedAt).toLocaleDateString()}
                              </p>
                            </div>

                            <button
                              onClick={() => handleDeleteMemory(memory.id!)}
                              className="p-2 hover:bg-red-500/20 rounded transition-colors"
                            >
                              <Trash2 size={16} className="text-red-400" />
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {diaryEntries.length === 0 ? (
                      <p className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
                        Nexa hasn't written in her diary yet
                      </p>
                    ) : (
                      diaryEntries.map((entry) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="glass p-4 rounded-lg"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-semibold">
                              {new Date(entry.date).toLocaleDateString([], {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                            <span className="text-xs px-2 py-1 rounded glass" style={{ color: 'var(--color-accent)' }}>
                              Mood: {entry.mood}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--color-text-secondary)' }}>
                            {entry.content}
                          </p>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
