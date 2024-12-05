import { Grip } from 'lucide-react';
import React from 'react';

interface Agent {
  id: string;
  name: string;
  description: string;
}

interface AIAgentsProps {
  agents: Agent[];
  onSelectAgent: (id: string) => void;
  selectedAgentId?: string | null;
}

const AIAgents: React.FC<AIAgentsProps> = ({ agents, onSelectAgent, selectedAgentId }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, agent: Agent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(agent));
  };

  return (
    <div className="min-w-[700px] h-full flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden font-sans text-base max-w-[100px] bg-gray-100">
      <div className="px-4 pt-6 font-semibold border-b border-gray-200 dark:border-gray-700 text-center">
        <h2 className='flex items-center gap-2 text-center'>AI Agents </h2>
      </div>
      
      <div className="p-2">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className={`
              p-3 m-2 cursor-grab border border-gray-200 dark:border-gray-700 rounded-md
              transition-all duration-200 relative flex justify-between items-center
              hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] active:cursor-grabbing
              ${selectedAgentId === agent.id ? 'bg-sky-50 dark:bg-sky-900 border-blue-500 hover:bg-sky-100 dark:hover:bg-sky-800' : ''}
            `}
            draggable
            onDragStart={(e) => handleDragStart(e, agent)}
            onClick={() => onSelectAgent(agent.id)}
          >
            <div className="flex items-center gap-2 opacity-80 text-center">
              <div className='px-4'>
                <Grip size={16} />
              </div>
              {agent.name}
            </div>
            {selectedAgentId === agent.id && (
              <span className="text-xs  py-0.5 bg-blue-500  rounded-full font-medium px-4 text-green-600 ">
                Active
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIAgents; 