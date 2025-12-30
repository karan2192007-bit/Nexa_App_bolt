import Dexie, { Table } from 'dexie';

export interface Chat {
  id?: number;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id?: number;
  chatId: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isProactive?: boolean;
}

export interface Memory {
  id?: number;
  key: string;
  value: string;
  priority: 'essential' | 'normal' | 'bullshit';
  createdAt: Date;
  updatedAt: Date;
}

export interface DiaryEntry {
  id?: number;
  date: Date;
  content: string;
  mood: string;
}

export interface CheckIn {
  id?: number;
  scheduledFor: Date;
  message: string;
  completed: boolean;
}

export class NexaDatabase extends Dexie {
  chats!: Table<Chat>;
  messages!: Table<Message>;
  memories!: Table<Memory>;
  diary!: Table<DiaryEntry>;
  checkIns!: Table<CheckIn>;

  constructor() {
    super('NexaAI');
    this.version(1).stores({
      chats: '++id, createdAt, updatedAt',
      messages: '++id, chatId, timestamp',
      memories: '++id, key, priority, createdAt',
      diary: '++id, date',
      checkIns: '++id, scheduledFor, completed'
    });
  }
}

export const db = new NexaDatabase();
