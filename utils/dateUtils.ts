import { ChatHistory } from '../types/ChatHistory';

export const groupChatsByDate = (chats: ChatHistory[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  const lastMonth = new Date(today);
  lastMonth.setDate(lastMonth.getDate() - 30);

  const groups: { [key: string]: ChatHistory[] } = {};

  chats.forEach(chat => {
    const chatDate = new Date(chat.timestamp);
    chatDate.setHours(0, 0, 0, 0);

    let groupKey: string;

    if (chatDate.getTime() === today.getTime()) {
      groupKey = 'Today';
    } else if (chatDate.getTime() === yesterday.getTime()) {
      groupKey = 'Yesterday';
    } else if (chatDate > lastWeek) {
      groupKey = 'Previous 7 days';
    } else if (chatDate > lastMonth) {
      groupKey = 'Previous 30 days';
    } else {
      groupKey = chatDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(chat);
  });

  // Sort chats within each group by timestamp (newest first)
  Object.keys(groups).forEach(key => {
    groups[key].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  });

  return groups;
}; 