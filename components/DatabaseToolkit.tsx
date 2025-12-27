
import React, { useState, useEffect } from 'react';
import { DBRecord } from '../types';

const DatabaseToolkit: React.FC = () => {
  const [records, setRecords] = useState<DBRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = () => {
    const data = JSON.parse(localStorage.getItem('prism_db') || '[]');
    setRecords(data);
  };

  useEffect(() => {
    loadData();
    // Refresh interval for live feedback
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const clearDB = () => {
    if (confirm('Are you sure you want to flush all neural memory?')) {
      localStorage.setItem('prism_db', '[]');
      setRecords([]);
    }
  };

  const filteredRecords = records.filter(r => 
    r.collection.toLowerCase().includes(searchTerm.toLowerCase()) ||
    JSON.stringify(r.data).toLowerCase().includes(searchTerm.toLowerCase())
  ).reverse();

  const collections = Array.from(new Set(records.map(r => r.collection)));

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <header className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/10">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <i className="fa-solid fa-database text-amber-500"></i>
            Neural Memory Browser
          </h1>
          <p className="text-sm text-gray-400">Connected to PrismDB Cluster (Local Context)</p>
        </div>
        <button 
          onClick={clearDB}
          className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold hover:bg-red-500/20 transition-all"
        >
          Flush Data
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Collections */}
        <aside className="w-64 border-r border-gray-800 bg-gray-950/20 p-4 space-y-4 overflow-y-auto">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Collections</h2>
          <div className="space-y-1">
            <button className="w-full text-left px-3 py-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-sm font-medium">
              all_records ({records.length})
            </button>
            {collections.map(c => (
              <button key={c} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-400 text-sm transition-colors">
                {c}
              </button>
            ))}
          </div>
        </aside>

        {/* Main: Records Viewer */}
        <div className="flex-1 flex flex-col p-6 space-y-6 overflow-hidden">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Query database records..."
              className="w-full bg-gray-900/50 border border-gray-800 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {filteredRecords.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                <i className="fa-solid fa-microchip text-5xl mb-4"></i>
                <h3 className="text-xl font-bold">Neural Buffer Empty</h3>
                <p className="text-sm max-w-xs mt-2">Prism AI has not stored any data yet. Ask it to "remember" something in the Chat.</p>
              </div>
            ) : (
              filteredRecords.map((record) => (
                <div key={record._id} className="glass rounded-xl overflow-hidden border-gray-800">
                  <div className="bg-gray-800/50 px-4 py-2 flex justify-between items-center border-b border-gray-800">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-amber-500 uppercase font-bold tracking-tighter">ID: {record._id}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold border border-amber-500/20">
                        {record.collection}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500">
                      {new Date(record.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-4 bg-gray-950/50 font-mono text-xs text-green-400 whitespace-pre overflow-x-auto">
                    {typeof record.data === 'string' 
                      ? record.data 
                      : JSON.stringify(record.data, null, 2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseToolkit;
