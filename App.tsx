
import React, { useState, useEffect } from 'react';
import { ToolType, Tool } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import ImageToolkit from './components/ImageToolkit';
import VideoToolkit from './components/VideoToolkit';
import AudioToolkit from './components/AudioToolkit';
import DatabaseToolkit from './components/DatabaseToolkit';

const TOOLS: Tool[] = [
  { id: ToolType.DASHBOARD, name: 'Home', description: 'System overview', icon: 'fa-house', color: 'indigo' },
  { id: ToolType.CHAT, name: 'Chat', description: 'Intelligent conversation', icon: 'fa-comments', color: 'blue' },
  { id: ToolType.IMAGE, name: 'Vision', description: 'Image generation', icon: 'fa-wand-magic-sparkles', color: 'pink' },
  { id: ToolType.VIDEO, name: 'Motion', description: 'Video synthesis', icon: 'fa-video', color: 'purple' },
  { id: ToolType.AUDIO, name: 'Voice', description: 'Speech synthesis', icon: 'fa-microphone', color: 'emerald' },
  { id: ToolType.DATABASE, name: 'Database', description: 'Neural memory storage', icon: 'fa-database', color: 'amber' },
];

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.DASHBOARD);

  const renderContent = () => {
    switch (activeTool) {
      case ToolType.DASHBOARD:
        return <Dashboard onSelectTool={setActiveTool} tools={TOOLS} />;
      case ToolType.CHAT:
        return <ChatInterface />;
      case ToolType.IMAGE:
        return <ImageToolkit />;
      case ToolType.VIDEO:
        return <VideoToolkit />;
      case ToolType.AUDIO:
        return <AudioToolkit />;
      case ToolType.DATABASE:
        return <DatabaseToolkit />;
      default:
        return <Dashboard onSelectTool={setActiveTool} tools={TOOLS} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#030712] overflow-hidden">
      <Sidebar 
        tools={TOOLS} 
        activeTool={activeTool} 
        onSelectTool={setActiveTool} 
      />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
