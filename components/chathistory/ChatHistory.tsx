import React, { useState } from 'react';
import { Edit, Grid2X2, NotebookIcon, Settings } from 'lucide-react';

interface ChatHistoryProps {
  history: Array<{ preview: string }>;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ history }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`
      bg-gray-100
      font-sans
      border-r border-gray-200 dark:border-gray-800
      h-screen
      flex flex-col
      dark:bg-gray-900
      transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-[50px]' : 'w-[280px]'}
    `}>
      {/* Header Actions */}
      <div className="flex items-center justify-between p-4">
        <NotebookIcon 
          className="w-5 h-5 text-gray-600 dark:text-gray-400 cursor-pointer" 
          onClick={toggleCollapse} 
        />
        {!isCollapsed && <Edit className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
      </div>

      {/* Only show the rest of the content when not collapsed */}
      {!isCollapsed && (
        <>
          {/* Quick Actions */}
          <div className="px-4 mb-4">
            <div className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
              <span className="text-sm font-medium">Lorem Ipsum</span>
            </div>
            <div className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
              <Grid2X2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium">Explore our models</span>
            </div>
          </div>

          {/* Time-based Sections */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Previous 7 Days</div>
              {history.slice(0, 3).map((item, index) => (
                <div key={index} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer mb-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.preview}</span>
                </div>
              ))}
            </div>

            <div className="px-4 mt-4">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Previous 30 Days</div>
              {history.slice(3).map((item, index) => (
                <div key={index} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer mb-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.preview}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade Plan */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <div className="text-sm font-medium">Upgrade plan</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">More access to the best models</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatHistory; 