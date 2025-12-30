import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { VaultModal } from './components/VaultModal';
import { SettingsModal } from './components/SettingsModal';
import { createChat, getChats, getMessages, addMessage, deleteChat, updateChatTitle } from './db/dbHelpers';
import { sendMessage, sendGestureEvent } from './services/nexaApi';
import { Chat, Message as DBMessage } from './db/database';
import { VibeMode } from './utils/nexaTools';
import configData from '../nexa-config.json';

const config = configData;

function App() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<DBMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentVibe, setCurrentVibe] = useState<VibeMode>('electric');

  const lastActivityRef = useRef<number>(Date.now());
  const heartbeatIntervalRef = useRef<NodeJS.Timeout>();
  const isPageVisibleRef = useRef<boolean>(true);

  useEffect(() => {
    loadChats();
    document.documentElement.setAttribute('data-vibe', currentVibe);

    const handleVisibilityChange = () => {
      isPageVisibleRef.current = !document.hidden;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (currentChatId) {
      loadMessages(currentChatId);
      startHeartbeat();
    } else {
      stopHeartbeat();
    }

    return () => {
      stopHeartbeat();
    };
  }, [currentChatId]);

  const startHeartbeat = () => {
    stopHeartbeat();

    if (config.heartbeat.enabled) {
      const intervalMs = config.heartbeat.intervalMinutes * 60 * 1000;
      const minSilenceMs = 2 * 60 * 1000;

      heartbeatIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const timeSinceLastActivity = now - lastActivityRef.current;

        if (
          isPageVisibleRef.current &&
          currentChatId &&
          timeSinceLastActivity >= minSilenceMs &&
          !isLoading
        ) {
          triggerProactiveMessage();
        }
      }, intervalMs);
    }
  };

  const stopHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = undefined;
    }
  };

  const triggerProactiveMessage = async () => {
    if (!currentChatId) return;

    const proactivePrompt = config.heartbeat.proactivePrompts[
      Math.floor(Math.random() * config.heartbeat.proactivePrompts.length)
    ];

    const currentMessages = await getMessages(currentChatId);
    const formattedMessages = currentMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    formattedMessages.push({
      role: 'system',
      content: proactivePrompt
    });

    setIsLoading(true);

    try {
      const response = await sendMessage(formattedMessages);

      await addMessage(currentChatId, 'assistant', response.content, true);
      await loadMessages(currentChatId);

      lastActivityRef.current = Date.now();
    } catch (error) {
      console.error('Proactive message failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChats = async () => {
    const loadedChats = await getChats();
    setChats(loadedChats);

    if (loadedChats.length > 0 && !currentChatId) {
      setCurrentChatId(loadedChats[0].id!);
    }
  };

  const loadMessages = async (chatId: number) => {
    const loadedMessages = await getMessages(chatId);
    setMessages(loadedMessages);
  };

  const handleNewChat = async () => {
    const chatId = await createChat('New Chat');
    await loadChats();
    setCurrentChatId(chatId);
    setIsMobileSidebarOpen(false);
  };

  const handleSelectChat = async (chatId: number) => {
    setCurrentChatId(chatId);
    setIsMobileSidebarOpen(false);
  };

  const handleDeleteChat = async (chatId: number) => {
    await deleteChat(chatId);
    await loadChats();

    if (currentChatId === chatId) {
      const remainingChats = await getChats();
      setCurrentChatId(remainingChats.length > 0 ? remainingChats[0].id! : null);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!currentChatId) {
      await handleNewChat();
      return;
    }

    lastActivityRef.current = Date.now();

    await addMessage(currentChatId, 'user', content);
    await loadMessages(currentChatId);

    const currentMessages = await getMessages(currentChatId);

    if (currentMessages.length === 1) {
      const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
      await updateChatTitle(currentChatId, title);
      await loadChats();
    }

    setIsLoading(true);

    try {
      const formattedMessages = currentMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await sendMessage(formattedMessages);

      await addMessage(currentChatId, 'assistant', response.content);
      await loadMessages(currentChatId);

      lastActivityRef.current = Date.now();
    } catch (error) {
      console.error('Send message failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGesture = async (gesture: 'petting' | 'tickling') => {
    if (!currentChatId || isLoading) return;

    lastActivityRef.current = Date.now();
    setIsLoading(true);

    try {
      const currentMessages = await getMessages(currentChatId);
      const formattedMessages = currentMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await sendGestureEvent(gesture, formattedMessages);

      await addMessage(currentChatId, 'assistant', response.content);
      await loadMessages(currentChatId);

      lastActivityRef.current = Date.now();
    } catch (error) {
      console.error('Gesture handling failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVibeChange = (vibe: VibeMode) => {
    setCurrentVibe(vibe);
    document.documentElement.setAttribute('data-vibe', vibe);
  };

  const currentChat = chats.find(chat => chat.id === currentChatId);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#000000' }}>
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onOpenVault={() => setIsVaultOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onGesture={handleGesture}
        isMobileOpen={isMobileSidebarOpen}
        onMobileToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      <ChatArea
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        currentChatTitle={currentChat?.title || 'New Chat'}
      />

      <VaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentVibe={currentVibe}
        onVibeChange={handleVibeChange}
      />
    </div>
  );
}

export default App;
