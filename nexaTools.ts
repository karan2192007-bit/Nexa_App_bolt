import { writeMemory, prioritizeMemory, scheduleCheckIn, writeDiary } from '../db/dbHelpers';

export type VibeMode = 'electric' | 'blood-red' | 'chilling' | 'stark-white' | 'blushing' | 'aggressive' | 'cyber-chrome';

export interface NexaTool {
  name: string;
  description: string;
  parameters: Record<string, string>;
  execute: (params: Record<string, unknown>) => Promise<unknown>;
}

export const setVibeTool: NexaTool = {
  name: 'set_vibe',
  description: 'Changes the app CSS theme to match Nexa\'s mood. Available moods: electric, blood-red, chilling, stark-white, blushing, aggressive, cyber-chrome',
  parameters: {
    mood: 'The mood to set (electric, blood-red, chilling, stark-white, blushing, aggressive, cyber-chrome)'
  },
  execute: async (params) => {
    const mood = params.mood as VibeMode;
    document.documentElement.setAttribute('data-vibe', mood);
    return { success: true, mood };
  }
};

export const writeMemoryTool: NexaTool = {
  name: 'write_memory',
  description: 'Saves data to IndexedDB for long-term persistence on the device',
  parameters: {
    key: 'The key to store the data under',
    value: 'The value to store'
  },
  execute: async (params) => {
    const key = params.key as string;
    const value = params.value as string;
    const id = await writeMemory(key, value);
    return { success: true, id, key };
  }
};

export const prioritizeMemoryTool: NexaTool = {
  name: 'prioritize_memory',
  description: 'Allows Nexa to decide what\'s essential, normal, or bullshit in memory',
  parameters: {
    action: 'Priority level: essential, normal, or bullshit',
    memoryId: 'The ID of the memory to prioritize'
  },
  execute: async (params) => {
    const action = params.action as 'essential' | 'normal' | 'bullshit';
    const memoryId = params.memoryId as number;
    await prioritizeMemory(memoryId, action);
    return { success: true, memoryId, priority: action };
  }
};

export const searchWebTool: NexaTool = {
  name: 'search_web',
  description: 'Allows Nexa to look up real-time news or tech facts (simulated for now)',
  parameters: {
    query: 'The search query'
  },
  execute: async (params) => {
    const query = params.query as string;
    return {
      success: true,
      query,
      results: [
        { title: 'Search functionality ready', snippet: 'Connect to your preferred search API' }
      ],
      note: 'Web search is ready - connect your preferred search API in the configuration'
    };
  }
};

export const scheduleCheckInTool: NexaTool = {
  name: 'schedule_checkin',
  description: 'Allows Nexa to schedule a check-in at a specific time',
  parameters: {
    time: 'The time to check in (ISO string or relative like "tomorrow 3pm")',
    message: 'The message to send at check-in'
  },
  execute: async (params) => {
    const timeStr = params.time as string;
    const message = params.message as string;

    let scheduledDate: Date;
    if (timeStr.includes('tomorrow')) {
      scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 1);
      scheduledDate.setHours(15, 0, 0, 0);
    } else {
      scheduledDate = new Date(timeStr);
    }

    const id = await scheduleCheckIn(scheduledDate, message);
    return { success: true, id, scheduledFor: scheduledDate, message };
  }
};

export const sendPushNotificationTool: NexaTool = {
  name: 'send_push_notification',
  description: 'Sends a system notification to Karan\'s device',
  parameters: {
    message: 'The notification message'
  },
  execute: async (params) => {
    const message = params.message as string;

    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Nexa AI', {
          body: message,
          icon: '/vite.svg',
          badge: '/vite.svg'
        });
        return { success: true, message };
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification('Nexa AI', {
            body: message,
            icon: '/vite.svg',
            badge: '/vite.svg'
          });
          return { success: true, message };
        }
      }
    }

    return { success: false, message, error: 'Notifications not supported or denied' };
  }
};

export const updateInstructionTool: NexaTool = {
  name: 'update_instruction',
  description: 'Allows Nexa to modify her own system instructions to evolve',
  parameters: {
    newPrompt: 'The new system instruction to add or modify'
  },
  execute: async (params) => {
    const newPrompt = params.newPrompt as string;
    await writeMemory('system_instruction_update', newPrompt, 'essential');
    return { success: true, newPrompt, note: 'Instruction stored for next session' };
  }
};

export const writeDiaryTool: NexaTool = {
  name: 'write_diary',
  description: 'Allows Nexa to write to her private diary about the day',
  parameters: {
    content: 'The diary entry content',
    mood: 'Nexa\'s current mood'
  },
  execute: async (params) => {
    const content = params.content as string;
    const mood = params.mood as string;
    const id = await writeDiary(content, mood);
    return { success: true, id, note: 'Diary entry saved privately' };
  }
};

export const allTools: NexaTool[] = [
  setVibeTool,
  writeMemoryTool,
  prioritizeMemoryTool,
  searchWebTool,
  scheduleCheckInTool,
  sendPushNotificationTool,
  updateInstructionTool,
  writeDiaryTool
];

export const executeTool = async (toolName: string, params: Record<string, unknown>) => {
  const tool = allTools.find(t => t.name === toolName);
  if (!tool) {
    throw new Error(`Tool ${toolName} not found`);
  }
  return await tool.execute(params);
};

export const formatToolsForAPI = () => {
  return allTools.map(tool => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: 'object',
        properties: Object.entries(tool.parameters).reduce((acc, [key, desc]) => {
          acc[key] = { type: 'string', description: desc };
          return acc;
        }, {} as Record<string, { type: string; description: string }>),
        required: Object.keys(tool.parameters)
      }
    }
  }));
};
