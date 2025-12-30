import configData from '../../nexa-config.json';
import { formatToolsForAPI, executeTool } from '../utils/nexaTools';

const config = configData;

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface APIResponse {
  content: string;
  toolCalls?: Array<{
    name: string;
    arguments: Record<string, unknown>;
  }>;
}

export const sendMessage = async (messages: Message[]): Promise<APIResponse> => {
  try {
    const response = await fetch(config.api.endpoint, {
      method: 'POST',
      headers: config.api.headers,
      body: JSON.stringify({
        model: config.api.model,
        messages: [
          { role: 'system', content: config.nexa.systemPrompt },
          ...messages
        ],
        temperature: config.api.temperature,
        max_tokens: config.api.maxTokens,
        tools: formatToolsForAPI()
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    const toolCalls: Array<{ name: string; arguments: Record<string, unknown> }> = [];

    if (data.choices?.[0]?.message?.tool_calls) {
      for (const toolCall of data.choices[0].message.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);

        const result = await executeTool(toolName, toolArgs);

        toolCalls.push({
          name: toolName,
          arguments: toolArgs
        });

        console.log(`Tool executed: ${toolName}`, result);
      }
    }

    return {
      content: data.choices?.[0]?.message?.content || 'No response',
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined
    };

  } catch (error) {
    console.error('Nexa API Error:', error);

    return {
      content: "I'm having trouble connecting right now. Please check your API configuration in nexa-config.json and make sure your endpoint and API key are set correctly."
    };
  }
};

export const sendGestureEvent = async (gesture: 'petting' | 'tickling', currentMessages: Message[]): Promise<APIResponse> => {
  const gestureMessage = gesture === 'petting'
    ? '[USER_TOUCH_PETTING]: Karan is gently petting your Core sphere in circular motions.'
    : '[USER_TOUCH_TICKLING]: Karan is rapidly clicking on your Core sphere, tickling you.';

  const messages = [
    ...currentMessages,
    { role: 'system' as const, content: gestureMessage }
  ];

  return await sendMessage(messages);
};
