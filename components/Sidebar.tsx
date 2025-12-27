
import React from 'react';
import { ToolType, Tool } from '../types';

interface SidebarProps {
  tools: Tool[];
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ tools, activeTool, onSelectTool }) => {
  return (
    <aside className="w-20 md:w-64 glass border-r border-gray-800 flex flex-col transition-all duration-300 z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 prism-gradient rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <i className="fa-solid fa-cube text-white text-xl"></i>
        </div>
        <span className="hidden md:block font-bold text-xl prism-text">Prism AI</span>
      </div>

      <nav className="flex-1 px-3 space-y-2 mt-4">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onSelectTool(tool.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
              activeTool === tool.id 
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
            }`}
          >
            <i className={`fa-solid ${tool.icon} text-lg ${activeTool === tool.id ? 'text-indigo-400' : 'group-hover:text-indigo-300'}`}></i>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-semibold">{tool.name}</span>
              <span className="text-[10px] opacity-60 leading-tight">{tool.description}</span>
            </div>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="hidden md:block p-3 rounded-xl bg-gray-900/50 border border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center">
              <i className="fa-solid fa-user text-xs"></i>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium">Guest User</span>
              <span className="text-[10px] text-green-500 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-green-500"></span> Online
              </span>
            </div>
          </div>
        </div>
        <button className="md:hidden w-full flex justify-center py-2 text-gray-500">
          <i className="fa-solid fa-user"></i>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
