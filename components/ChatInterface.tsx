
import React, { useState, useRef, useEffect } from 'react';
import { GeminiService } from '../geminiService';
import { Message, MessageSource } from '../types';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'System initialized. Prism AI is online. Database connected. How can I assist you today?', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const assistantId = (Date.now() + 1).toString();
      let assistantContent = '';
      let collectedSources: MessageSource[] = [];
      
      setMessages(prev => [...prev, { 
        id: assistantId, 
        role: 'assistant', 
        content: '', 
        timestamp: Date.now(),
        sources: []
      }]);

      const history = messages.map(m => ({ 
        role: m.role, 
        parts: [{ text: m.content }] 
      }));

      // Create a persistent history for the stream session
      const stream = GeminiService.chatStream(input, history);
      
      for await (const chunk of stream) {
        // Handle Tool Calls (Database)
        if (chunk.functionCalls) {
          for (const fc of chunk.functionCalls) {
            console.log("Database Tool Called:", fc.name, fc.args);
            
            let result = "ok";
            if (fc.name === 'db_insert') {
              const records = JSON.parse(localStorage.getItem('prism_db') || '[]');
              const newRecord = {
                _id: Math.random().toString(36).substr(2, 9),
                collection: fc.args.collection,
                data: fc.args.document,
                createdAt: Date.now()
              };
              records.push(newRecord);
              localStorage.setItem('prism_db', JSON.stringify(records));
              result = "Successfully stored in " + fc.args.collection;
            } else if (fc.name === 'db_find') {
              const records = JSON.parse(localStorage.getItem('prism_db') || '[]');
              const query = (fc.args.query as string).toLowerCase();
              const found = records.filter((r: any) => 
                JSON.stringify(r.data).toLowerCase().includes(query) || 
                r.collection.toLowerCase().includes(query)
              );
              result = found.length > 0 ? JSON.stringify(found) : "No records found.";
            }

            // In a real sendMessage loop, we would sendToolResponse back.
            // For this streaming implementation, we inject a confirmation message.
            assistantContent += `\n*[Accessing Neural DB: ${result}]*\n`;
          }
        }

        // Handle Text
        if (chunk.text) {
          assistantContent += chunk.text;
        }
        
        // Handle Sources
        if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
          const sources = chunk.candidates[0].groundingMetadata.groundingChunks
            .filter(ch => ch.web)
            .map(ch => ({ uri: ch.web?.uri || '', title: ch.web?.title || 'Source' }));
          
          if (sources.length > 0) {
            const newSources = sources.filter(ns => !collectedSources.some(cs => cs.uri === ns.uri));
            collectedSources = [...collectedSources, ...newSources];
          }
        }

        setMessages(prev => prev.map(m => 
          m.id === assistantId ? { ...m, content: assistantContent, sources: collectedSources } : m
        ));
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'system', 
        content: 'System Error: Connection to neural cluster lost.', 
        timestamp: Date.now() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950/20">
      <header className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="font-semibold text-gray-200">Prism Core v3.2 <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 ml-2">DB CONNECTED</span></span>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/10' 
                : m.role === 'system'
                ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                : 'glass text-gray-100'
            }`}>
              <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">{m.content}</div>
              
              {m.sources && m.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/10">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Reference Buffer</span>
                  <div className="flex flex-wrap gap-2">
                    {m.sources.map((source, idx) => (
                      <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[11px] text-indigo-300">
                        <i className="fa-solid fa-earth-americas text-[10px]"></i>
                        <span className="truncate max-w-[150px]">{source.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className={`text-[10px] mt-2 opacity-40 ${m.role === 'user' ? 'text-right' : ''}`}>
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="glass rounded-2xl p-4 flex gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-.3s]"></div>
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-.5s]"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-800 bg-gray-950/40 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask Prism AI (DB & Search enabled)..."
              rows={1}
              className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none max-h-40"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`mb-2 p-3 rounded-full transition-all duration-300 ${
              input.trim() && !isLoading ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-600'
            }`}
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
