import { db, Chat, Message, Memory, DiaryEntry, CheckIn } from './database';

export const createChat = async (title: string = 'New Chat'): Promise<number> => {
  const id = await db.chats.add({
    title,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return id;
};

export const getChats = async (): Promise<Chat[]> => {
  return await db.chats.orderBy('updatedAt').reverse().toArray();
};

export const updateChatTitle = async (chatId: number, title: string) => {
  await db.chats.update(chatId, { title, updatedAt: new Date() });
};

export const deleteChat = async (chatId: number) => {
  await db.messages.where('chatId').equals(chatId).delete();
  await db.chats.delete(chatId);
};

export const addMessage = async (chatId: number, role: 'user' | 'assistant' | 'system', content: string, isProactive = false): Promise<number> => {
  const id = await db.messages.add({
    chatId,
    role,
    content,
    timestamp: new Date(),
    isProactive
  });
  await db.chats.update(chatId, { updatedAt: new Date() });
  return id;
};

export const getMessages = async (chatId: number): Promise<Message[]> => {
  return await db.messages.where('chatId').equals(chatId).sortBy('timestamp');
};

export const writeMemory = async (key: string, value: string, priority: 'essential' | 'normal' | 'bullshit' = 'normal'): Promise<number> => {
  const existing = await db.memories.where('key').equals(key).first();

  if (existing) {
    await db.memories.update(existing.id!, { value, priority, updatedAt: new Date() });
    return existing.id!;
  } else {
    return await db.memories.add({
      key,
      value,
      priority,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
};

export const getMemories = async (): Promise<Memory[]> => {
  return await db.memories.toArray();
};

export const prioritizeMemory = async (id: number, priority: 'essential' | 'normal' | 'bullshit') => {
  await db.memories.update(id, { priority, updatedAt: new Date() });
};

export const deleteMemory = async (id: number) => {
  await db.memories.delete(id);
};

export const writeDiary = async (content: string, mood: string): Promise<number> => {
  return await db.diary.add({
    date: new Date(),
    content,
    mood
  });
};

export const getDiaryEntries = async (): Promise<DiaryEntry[]> => {
  return await db.diary.orderBy('date').reverse().toArray();
};

export const scheduleCheckIn = async (scheduledFor: Date, message: string): Promise<number> => {
  return await db.checkIns.add({
    scheduledFor,
    message,
    completed: false
  });
};

export const getCheckIns = async (): Promise<CheckIn[]> => {
  return await db.checkIns.where('completed').equals(false).toArray();
};

export const completeCheckIn = async (id: number) => {
  await db.checkIns.update(id, { completed: true });
};

export const exportAllData = async () => {
  const chats = await db.chats.toArray();
  const messages = await db.messages.toArray();
  const memories = await db.memories.toArray();
  const diary = await db.diary.toArray();
  const checkIns = await db.checkIns.toArray();

  return {
    exportDate: new Date().toISOString(),
    chats,
    messages,
    memories,
    diary,
    checkIns
  };
};

export const downloadVault = async () => {
  const data = await exportAllData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nexa-vault-${new Date().toISOString()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
