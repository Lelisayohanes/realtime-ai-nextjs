'use client'
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { RealtimeClient } from '@openai/realtime-api-beta';
import { ItemType } from '@openai/realtime-api-beta/dist/lib/client.js';
import { WavRecorder, WavStreamPlayer } from '../lib/wavtools/index.js';
import { instructions } from '../utils/conversation_config';
import { WavRenderer } from '../utils/wav_renderer';
import { X,  Zap, ArrowUp, ArrowDown, User } from 'react-feather';
import { Button } from '../components/button/Button';
import { Toggle } from '../components/toggle/Toggle';
import InternalHeader from '../components/internalheader/InternalHeader';
import LeftChatHistory from '../components/chathistory/ChatHistory';
import AIAgents from '../components/aiagents/AIAgents';
import { mockChatHistory } from '../data/mockChatHistory';
import { ChatHistory } from '../types/ChatHistory';

const LOCAL_RELAY_SERVER_URL: string = process.env.NEXT_PUBLIC_LOCAL_RELAY_SERVER_URL || '';

interface RealtimeEvent {
  time: string;
  source: 'client' | 'server';
  count?: number;
  event: { [key: string]: any };
}

interface Agent {
  id: string;
  name: string;
  description: string;
}

// Custom hook for managing position
const usePosition = () => {
  const [pos, setPos] = useState(() => ({
    x: typeof window !== 'undefined' ? 0 : 0,
    y: 100
  }));

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPos({ x: window.innerWidth - 600, y: 100 });
    }
  }, []);

  return [pos, setPos] as const;
};
export default function ChatPage() {
  // API Key management
  const apiKey = React.useMemo(() => {
    if (typeof window === 'undefined') return ''; // Check for browser environment
    
    return LOCAL_RELAY_SERVER_URL
      ? ''
      : localStorage.getItem('tmp::voice_api_key') ||
        prompt('OpenAI API Key') ||
        '';
  }, []);

  React.useEffect(() => {
    if (apiKey !== '') {
      localStorage.setItem('tmp::voice_api_key', apiKey);
    }
  }, [apiKey]);

  // State management
  const [history] = React.useState<ChatHistory[]>(mockChatHistory);
  const [agents] = React.useState<Agent[]>([
    { 
      id: "1", 
      name: "Software Engineer", 
      description: "A software engineer is a professional who designs, develops, and maintains software systems." 
    },
    { 
      id: "2", 
      name: "Data Scientist", 
      description: "A data scientist is a professional who uses statistical and computational methods to analyze data and extract insights." 
    },
    // ... other agents
  ]);

  // Refs for audio handling
  const wavRecorderRef = useRef<WavRecorder>(
    new WavRecorder({ sampleRate: 24000 })
  );
  const wavStreamPlayerRef = useRef<WavStreamPlayer>(
    new WavStreamPlayer({ sampleRate: 24000 })
  );
  const clientRef = useRef<RealtimeClient>(
    new RealtimeClient(
      LOCAL_RELAY_SERVER_URL 
        ? { url: LOCAL_RELAY_SERVER_URL } 
        : {
          apiKey: apiKey,
          dangerouslyAllowAPIKeyInBrowser: true,
        }
    )
  );

  // Canvas and scroll refs
  const clientCanvasRef = useRef<HTMLCanvasElement>(null);
  const serverCanvasRef = useRef<HTMLCanvasElement>(null);
  const eventsScrollHeightRef = useRef(0);
  const eventsScrollRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<string>(new Date().toISOString());

  // State variables
  const [items, setItems] = useState<ItemType[]>([]);
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([]);
  const [expandedEvents, setExpandedEvents] = useState<{[key: string]: boolean}>({});
  const [isConnected, setIsConnected] = useState(false);
  const [canPushToTalk, setCanPushToTalk] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);


  // Replace the direct window usage with the custom hook
  const [position, ] = usePosition();
  const [dragging, setDragging] = useState(false);
  const [, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Utility functions
  const formatTime = useCallback((timestamp: string) => {
    const startTime = startTimeRef.current;
    const t0 = new Date(startTime).valueOf();
    const t1 = new Date(timestamp).valueOf();
    const delta = t1 - t0;
    const hs = Math.floor(delta / 10) % 100;
    const s = Math.floor(delta / 1000) % 60;
    const m = Math.floor(delta / 60_000) % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(m)}:${pad(s)}.${pad(hs)}`;
  }, []);

  // Rest of the implementation includes
  // 1. All the handler functions (connect, disconnect, recording, etc.)
  // 2. useEffect hooks for audio visualization and API setup
  // 3. The complete JSX structure with Tailwind classes
  // 4. Event handling and real-time updates
   // Handler Functions
   const resetAPIKey = useCallback(() => {
    const apiKey = prompt('OpenAI API Key');
    if (apiKey !== null) {
      localStorage.clear();
      localStorage.setItem('tmp::voice_api_key', apiKey);
      window.location.reload();
    }
  }, []);

  const connectConversation = useCallback(async () => {
    try {
      const client = clientRef.current;
      const wavRecorder = wavRecorderRef.current;
      const wavStreamPlayer = wavStreamPlayerRef.current;

      if (!client || !wavRecorder || !wavStreamPlayer) {
        console.error('Required references not initialized');
        return;
      }

      startTimeRef.current = new Date().toISOString();
      setIsConnected(true);
      setRealtimeEvents([]);
      setItems(client.conversation.getItems());

      // Connect client first
      await client.connect();

      // Then initialize audio components
      await wavRecorder.begin();
      await wavStreamPlayer.connect();

      // Send initial message
      await client.sendUserMessageContent([
        {
          type: 'input_text',
          text: 'Hello!',
        },
      ]);

      // Only start recording if client is connected and VAD is enabled
      if (client.isConnected() && client.getTurnDetectionType() === 'server_vad') {
        await wavRecorder.record((data) => {
          if (client.isConnected()) {
            client.appendInputAudio(data.mono);
          }
        });
      }
    } catch (error) {
      console.error('Error connecting:', error);
      setIsConnected(false);
    }
  }, []);

  const disconnectConversation = useCallback(async () => {
    setIsConnected(false);
    setRealtimeEvents([]);
    setItems([]);

    const client = clientRef.current;
    client.disconnect();

    const wavRecorder = wavRecorderRef.current;
    await wavRecorder.end();

    const wavStreamPlayer = wavStreamPlayerRef.current;
    await wavStreamPlayer.interrupt();
  }, []);


  const startRecording = async () => {
    setIsRecording(true);
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;
    
    const trackSampleOffset = await wavStreamPlayer.interrupt();
    if (trackSampleOffset?.trackId) {
      const { trackId, offset } = trackSampleOffset;
      await client.cancelResponse(trackId, offset);
    }
    await wavRecorder.record((data) => client.appendInputAudio(data.mono));
  };

  const stopRecording = async () => {
    setIsRecording(false);
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    await wavRecorder.pause();
    client.createResponse();
  };

  const changeTurnEndType = async (value: string) => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    
    if (value === 'none' && wavRecorder.getStatus() === 'recording') {
      await wavRecorder.pause();
    }
    
    client.updateSession({
      turn_detection: value === 'none' ? null : { type: 'server_vad' },
    });
    
    if (value === 'server_vad' && client.isConnected()) {
      await wavRecorder.record((data) => client.appendInputAudio(data.mono));
    }
    setCanPushToTalk(value === 'none');
  };

  const onSelectAgent = (id: string) => {
    if (id === '') {
      setSelectedAgent(null);
    } else {
      const agent = agents.find(a => a.id === id);
      if (agent) {
        setSelectedAgent(agent);
        const client = clientRef.current;
        const agentInstructions = `${agent.description} this means the user know you as you expert in this area therefore when you start the conversation start by saying i am ia agent and my profession is ${agent.name}, how can i help you with my profession`;
        client.updateSession({ instructions: agentInstructions });
      }
    }
  };

  // Drag and Drop handlers


  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    try {
      const agentData = JSON.parse(e.dataTransfer.getData('application/json'));
      setSelectedAgent(agentData);
      
      const client = clientRef.current;
      const agentInstructions = `${agentData.description} this means the user know you as you expert in this area therefore when you start the conversation start by saying i am ia agent and my profession is ${agentData.name}, how can i help you with my profession`;
      
      client.updateSession({ instructions: agentInstructions });
      
      client.sendUserMessageContent([
        { 
          type: 'input_text', 
          text: `I am ia agent and my profession is ${agentData.name}, how can I help you with my profession?`
        }
      ]);
    } catch (error) {
      console.error('Error parsing dropped agent data:', error);
    }
  };

  // ... after the handler functions

// Auto-scroll for events
useEffect(() => {
    if (eventsScrollRef.current) {
      const eventsEl = eventsScrollRef.current;
      const scrollHeight = eventsEl.scrollHeight;
      if (scrollHeight !== eventsScrollHeightRef.current) {
        eventsEl.scrollTop = scrollHeight;
        eventsScrollHeightRef.current = scrollHeight;
      }
    }
  }, [realtimeEvents]);
  
  // Auto-scroll for conversation
  useEffect(() => {
    const conversationEls = document.querySelectorAll('[data-conversation-content]');
    conversationEls.forEach((el) => {
      const conversationEl = el as HTMLDivElement;
      conversationEl.scrollTop = conversationEl.scrollHeight;
    });
  }, [items]);
  
  // Audio visualization setup
  useEffect(() => {
    let isLoaded = true;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const clientCanvas = clientCanvasRef.current;
    const serverCanvas = serverCanvasRef.current;
    let clientCtx: CanvasRenderingContext2D | null = null;
    let serverCtx: CanvasRenderingContext2D | null = null;
  
    const render = () => {
      if (!isLoaded) return;
  
      // Client audio visualization
      if (clientCanvas) {
        if (!clientCanvas.width || !clientCanvas.height) {
          clientCanvas.width = clientCanvas.offsetWidth;
          clientCanvas.height = clientCanvas.offsetHeight;
        }
        clientCtx = clientCtx || clientCanvas.getContext('2d');
        if (clientCtx) {
          clientCtx.clearRect(0, 0, clientCanvas.width, clientCanvas.height);
          const result = wavRecorder.recording
            ? wavRecorder.getFrequencies('voice')
            : { values: new Float32Array([0]) };
          WavRenderer.drawBars(
            clientCanvas,
            clientCtx,
            result.values,
            '#0099ff',
            14,
            0,
            8
          );
        }
      }
  
      // Server audio visualization
      if (serverCanvas) {
        if (!serverCanvas.width || !serverCanvas.height) {
          serverCanvas.width = serverCanvas.offsetWidth;
          serverCanvas.height = serverCanvas.offsetHeight;
        }
        serverCtx = serverCtx || serverCanvas.getContext('2d');
        if (serverCtx) {
          serverCtx.clearRect(0, 0, serverCanvas.width, serverCanvas.height);
          const result = wavStreamPlayer.analyser
            ? wavStreamPlayer.getFrequencies('voice')
            : { values: new Float32Array([0]) };
          WavRenderer.drawBars(
            serverCanvas,
            serverCtx,
            result.values,
            '#009900',
            14,
            0,
            8
          );
        }
      }
  
      requestAnimationFrame(render);
    };
    render();
  
    return () => {
      isLoaded = false;
    };
  }, []);
  
  // API and audio setup
  useEffect(() => {
    const client = clientRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;
  
    // Set up initial configuration
    client.updateSession({ 
      instructions,
      input_audio_transcription: { model: 'whisper-1' }
    });

    // Event handlers
    const handleRealtimeEvent = (realtimeEvent: RealtimeEvent) => {
      setRealtimeEvents(prev => {
        const lastEvent = prev[prev.length - 1];
        if (lastEvent?.event.type === realtimeEvent.event.type) {
          lastEvent.count = (lastEvent.count || 0) + 1;
          return [...prev.slice(0, -1), lastEvent];
        }
        return [...prev, realtimeEvent];
      });
    };

    const handleError = (error: Error) => {
      console.error('Client error:', error);
    };

    const handleInterruption = async () => {
      const trackSampleOffset = await wavStreamPlayer.interrupt();
      if (trackSampleOffset?.trackId) {
        await client.cancelResponse(
          trackSampleOffset.trackId, 
          trackSampleOffset.offset
        );
      }
    };

    const handleConversationUpdate = async ({ item, delta }: any) => {
      if (delta?.audio) {
        wavStreamPlayer.add16BitPCM(delta.audio, item.id);
      }
      if (item.status === 'completed' && item.formatted.audio?.length) {
        const wavFile = await WavRecorder.decode(
          item.formatted.audio, 
          24000, 
          24000
        );
        item.formatted.file = wavFile;
      }
      setItems(client.conversation.getItems());
    };

    // Add event listeners
    client.on('realtime.event', handleRealtimeEvent);
    client.on('error', handleError);
    client.on('conversation.interrupted', handleInterruption);
    client.on('conversation.updated', handleConversationUpdate);

    // Cleanup function
    return () => {
      client.off('realtime.event', handleRealtimeEvent);
      client.off('error', handleError);
      client.off('conversation.interrupted', handleInterruption);
      client.off('conversation.updated', handleConversationUpdate);
      client.reset();
    };
  }, [/* dependencies should be added here if needed */]);

  // ... previous code ...

return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Left Sidebar - Chat History */}
      <div className="flex-none">
        <LeftChatHistory history={history} />
      </div>
  
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 ">
          <InternalHeader />
          {!LOCAL_RELAY_SERVER_URL && (
            <div className='flex items-center gap-2 bg-gray-100 rounded-full '>
            <Button
              icon={User}
              iconPosition="end"
              buttonStyle="flush"
              label={`Key: `}
              onClick={resetAPIKey}
            />
            </div>
          )}
        </div>
  
        {/* Main Chat Area */}
        <div 
          className="flex-1 overflow-hidden"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="h-full flex flex-col">
            {/* Selected Agent Banner - updated background */}
            {selectedAgent && (
              <div className="bg-blue-50/50 dark:bg-blue-900/30 p-3 border-b border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between max-w-3xl mx-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      Active Agent:
                    </span>
                    <span className="text-blue-800 dark:text-blue-300">
                      {selectedAgent.name}
                    </span>
                  </div>
                  <button 
                    onClick={() => onSelectAgent('')}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
  
            {/* Audio Visualization - with smaller container */}
            <div 
              style={{
                position: 'fixed',
                left: `${position.x}px`,
                top: `${position.y}px`,
                cursor: dragging ? 'grabbing' : 'grab',
              }}
              className="w-40 border-l border-gray-200 dark:border-gray-700"
              onMouseDown={(e) => {
                setDragging(true);
                const rect = e.currentTarget.getBoundingClientRect();
                setDragOffset({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top
                });
              }}
            >
              {/* <div className="p-2 bg-gray-100 dark:bg-gray-800">
                <div className="h-20 flex flex-col gap-2">
                  <div>Drag me wherever</div>
                  <div className="flex-1 relative">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 top-[50%]  left-[10%] font-semibold">Input</div>
                    <canvas ref={clientCanvasRef} className="absolute inset-0" />
                  </div>
                  <div className="flex-1 relative">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-semibold">Output</div>
                    <canvas ref={serverCanvasRef} className="absolute inset-0" />
                  </div>
                </div>
              </div> */}
            </div>
  
            {/* Events Log - removed background from event cards */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="max-w-3xl mx-auto p-4">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Events
                  </h3>
                </div>
                <div ref={eventsScrollRef} className="space-y-2">
                  {!realtimeEvents.length && (
                    <div className="text-gray-500 dark:text-gray-400 text-sm">
                      Awaiting connection...
                    </div>
                  )}
                  {realtimeEvents.map((realtimeEvent, ) => (
                    <div 
                      key={realtimeEvent.event.event_id}
                      className="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                    >
                      <div className="p-3 flex items-start gap-3">
                        <div className="text-xs font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {formatTime(realtimeEvent.time)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div 
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => {
                              const id = realtimeEvent.event.event_id;
                              setExpandedEvents(prev => ({
                                ...prev,
                                [id]: !prev[id]
                              }));
                            }}
                          >
                            <div className={`
                              flex items-center gap-1 px-2 py-1 rounded text-xs 
                              ${realtimeEvent.source === 'client' 
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                : 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'}
                            `}>
                              {realtimeEvent.source === 'client' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                              <span>{realtimeEvent.source}</span>
                            </div>
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                              {realtimeEvent.event.type}
                              {realtimeEvent.count && ` (${realtimeEvent.count})`}
                            </div>
                          </div>
                          {expandedEvents[realtimeEvent.event.event_id] && (
                            <pre className="mt-2 p-2 text-xs bg-gray-50 dark:bg-gray-900 rounded overflow-auto">
                              {JSON.stringify(realtimeEvent.event, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
  
            {/* Chat Messages - removed background */}
            <div className="border-t border-gray-200 dark:border-gray-700 overflow-y-auto max-h-64">
              <div className="max-w-3xl mx-auto p-4  min-h-36">
                    <h3>Conversation</h3>

                <div className="space-y-4" data-conversation-content>
                  {!items.length && (
                    <div className="text-gray-500 dark:text-gray-400 text-sm">
                      Awaiting connection...
                    </div>
                  )}
                  {items.map((item) => (
                    <div 
                      key={item.id}
                      className={`
                        flex gap-4 
                        
                        ${item.role === 'user' ? 'justify-end' : 'justify-start'}
                      `}
                    >
                      <div className={`
                        max-w-[80%] rounded-lg p-4 overflow-y-auto
                        
                        ${item.role === 'user' 
                          ? ' text-black'
                          : ' dark:bg-gray-800'}
                      `}>
                        {item.formatted.transcript || item.formatted.text || '...'}
                        {item.formatted.file && (
                          <audio
                            src={item.formatted.file.url}
                            controls
                            className="mt-2"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
  
            {/* Controls - removed background */}
            <div className="border-t border-gray-200 dark:border-gray-700">
              <div className="max-w-3xl mx-auto p-4">
                <div className="flex items-center gap-4">
                  <Toggle
                    defaultValue={false}
                    labels={['Manual', 'VAD']}
                    values={['none', 'server_vad']}
                    onChange={(_, value) => changeTurnEndType(value)}
                  />
                  
                  <div className="flex-1" />
                  
                  {isConnected && canPushToTalk && (
                    <Button
                      label={isRecording ? 'Release to send' : 'Push to talk'}
                      buttonStyle={isRecording ? 'alert' : 'regular'}
                      disabled={!isConnected || !canPushToTalk}
                      onMouseDown={startRecording}
                      onMouseUp={stopRecording}
                    />
                  )}
                  
                  <Button
                    label={isConnected ? 'Disconnect' : 'Connect'}
                    iconPosition={isConnected ? 'end' : 'start'}
                    icon={isConnected ? X : Zap}
                    buttonStyle={isConnected ? 'regular' : 'action'}
                    onClick={isConnected ? disconnectConversation : connectConversation}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      {/* Right Sidebar - AI Agents */}
      <div className="flex w-1/5">
        <AIAgents 
          agents={agents}
          onSelectAgent={onSelectAgent}
          selectedAgentId={selectedAgent?.id}
        />
      </div>
    </div>
  );
}