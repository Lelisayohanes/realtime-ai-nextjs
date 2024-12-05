import { ChatHistory } from '../types/ChatHistory';

export const mockChatHistory: ChatHistory[] = [
  {
    id: '1',
    title: 'Initial Chat',
    timestamp: new Date().toISOString(),
    model: 'GPT-3.5',
    preview: 'Hello! How can I help you today?',
    text: 'Hello! How can I help you today?'
  },
  {
    id: '2',
    title: 'Project Discussion',
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    model: 'GPT-4',
    preview: 'Let\'s discuss your project requirements',
    text: 'Let\'s discuss your project requirements and how I can assist you.'
  },
  {
    id: '3',
    title: 'Code Review',
    timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    model: 'GPT-4',
    preview: 'I can help review your code',
    text: 'I can help review your code and suggest improvements.'
  }
]; 