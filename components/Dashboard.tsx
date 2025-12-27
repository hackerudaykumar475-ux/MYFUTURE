
import React from 'react';
import { ToolType, Tool } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface DashboardProps {
  tools: Tool[];
  onSelectTool: (tool: ToolType) => void;
}

const data = [
  { name: 'Mon', usage: 400 },
  { name: 'Tue', usage: 300 },
  { name: 'Wed', usage: 600 },
  { name: 'Thu', usage: 800 },
  { name: 'Fri', usage: 500 },
  { name: 'Sat', usage: 900 },
  { name: 'Sun', usage: 1100 },
];

const Dashboard: React.FC<DashboardProps> = ({ tools, onSelectTool }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10">
      <header>
        <h1 className="text-4xl font-bold mb-2">Welcome back, <span className="prism-text">Commander</span></h1>
        <p className="text-gray-400">Prism system is active and running optimally.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-2xl border-l-4 border-blue-500">
          <span className="text-gray-400 text-sm font-medium">Uptime</span>
          <div className="text-2xl font-bold mt-1">99.98%</div>
        </div>
        <div className="glass p-6 rounded-2xl border-l-4 border-indigo-500">
          <span className="text-gray-400 text-sm font-medium">Processing Load</span>
          <div className="text-2xl font-bold mt-1">12.4 TFLOPS</div>
        </div>
        <div className="glass p-6 rounded-2xl border-l-4 border-purple-500">
          <span className="text-gray-400 text-sm font-medium">Active Agents</span>
          <div className="text-2xl font-bold mt-1">24 Parallel</div>
        </div>
        <div className="glass p-6 rounded-2xl border-l-4 border-pink-500">
          <span className="text-gray-400 text-sm font-medium">Latency</span>
          <div className="text-2xl font-bold mt-1">~42ms</div>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <i className="fa-solid fa-toolbox text-indigo-400"></i> AI Toolkit
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.filter(t => t.id !== ToolType.DASHBOARD).map((tool) => (
            <button
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className="group glass p-6 rounded-2xl text-left hover:scale-[1.02] transition-all duration-300 border border-gray-800 hover:border-indigo-500/50"
            >
              <div className={`w-12 h-12 rounded-xl bg-${tool.color}-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <i className={`fa-solid ${tool.icon} text-${tool.color}-400 text-xl`}></i>
              </div>
              <h3 className="text-lg font-bold mb-1">{tool.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{tool.description}</p>
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                Launch Module <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </div>
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-6 rounded-2xl h-80">
          <h3 className="text-lg font-semibold mb-6">Neural Activity (Tokens/Sec)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                itemStyle={{ color: '#818cf8' }}
              />
              <Area type="monotone" dataKey="usage" stroke="#6366f1" fillOpacity={1} fill="url(#colorUsage)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass p-6 rounded-2xl h-80">
          <h3 className="text-lg font-semibold mb-6">Module Efficiency</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                cursor={{ fill: '#374151', opacity: 0.4 }}
              />
              <Bar dataKey="usage" fill="#a855f7" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
