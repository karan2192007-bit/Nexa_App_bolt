import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Palette, Bell } from 'lucide-react';
import { VibeMode } from '../utils/nexaTools';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVibe: VibeMode;
  onVibeChange: (vibe: VibeMode) => void;
}

const vibes: { value: VibeMode; label: string; description: string }[] = [
  { value: 'electric', label: 'Electric', description: 'Cyber-purple and electric chrome' },
  { value: 'blood-red', label: 'Blood Red', description: 'Dead serious mode' },
  { value: 'chilling', label: 'Chilling', description: 'Soft and relaxed blue' },
  { value: 'stark-white', label: 'Stark White', description: 'Minimal and clean' },
  { value: 'blushing', label: 'Blushing', description: 'Playful pink vibes' },
  { value: 'aggressive', label: 'Aggressive', description: 'Fast and fiery orange' },
  { value: 'cyber-chrome', label: 'Cyber Chrome', description: 'Matrix green energy' }
];

export const SettingsModal = ({ isOpen, onClose, currentVibe, onVibeChange }: SettingsModalProps) => {
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('Nexa AI', {
          body: 'Notifications enabled! I can now send you alerts.',
          icon: '/vite.svg'
        });
      }
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
            <div className="glass-strong rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col"
              style={{ borderColor: 'var(--color-primary)', borderWidth: '1px' }}
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Settings size={24} style={{ color: 'var(--color-primary)' }} />
                  <h2 className="text-2xl font-bold">Settings</h2>
                </div>

                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Palette size={20} style={{ color: 'var(--color-accent)' }} />
                    <h3 className="text-lg font-semibold">Mood Ring (Vibe)</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {vibes.map((vibe) => (
                      <motion.button
                        key={vibe.value}
                        onClick={() => onVibeChange(vibe.value)}
                        className={`glass p-4 rounded-lg text-left transition-all ${
                          currentVibe === vibe.value ? 'glass-strong' : ''
                        }`}
                        style={{
                          borderColor: currentVibe === vibe.value ? 'var(--color-primary)' : 'transparent',
                          borderWidth: '1px'
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="font-semibold mb-1">{vibe.label}</div>
                        <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          {vibe.description}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Bell size={20} style={{ color: 'var(--color-accent)' }} />
                    <h3 className="text-lg font-semibold">Notifications</h3>
                  </div>

                  <motion.button
                    onClick={requestNotificationPermission}
                    className="glass px-4 py-3 rounded-lg w-full text-left"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="font-semibold mb-1">Enable Push Notifications</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      Let Nexa send you notifications for check-ins and important updates
                    </div>
                  </motion.button>
                </div>

                <div className="glass p-4 rounded-lg">
                  <h3 className="text-sm font-semibold mb-2">API Configuration</h3>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    Configure your custom 120b model API endpoint in the <code className="glass px-2 py-1 rounded text-xs">nexa-config.json</code> file at the project root.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
