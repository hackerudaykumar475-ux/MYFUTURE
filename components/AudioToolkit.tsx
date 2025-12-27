
import React, { useState } from 'react';
import { GeminiService } from '../geminiService';

const AudioToolkit: React.FC = () => {
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!text.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const base64Data = await GeminiService.generateSpeech(text);
      
      // Raw PCM conversion helper
      const decode = (base64: string) => {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
      };

      const rawBytes = decode(base64Data);
      
      // To play PCM in browser we need to wrap it or use AudioContext
      // For simplicity in this UI, we'll use a specialized decoder logic 
      // typically we'd wrap it in a WAV header or use AudioContext.
      // Here we simulate the presence of the result.
      setAudioUrl(`data:audio/pcm;base64,${base64Data}`); 
      
      // Trigger native playback using AudioContext as per guidelines
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const dataInt16 = new Int16Array(rawBytes.buffer);
      const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();

    } catch (err) {
      console.error(err);
      alert("Voice processor failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-10 flex flex-col items-center justify-center max-w-3xl mx-auto w-full">
      <div className="w-20 h-20 rounded-3xl prism-gradient flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20">
        <i className="fa-solid fa-waveform text-3xl text-white"></i>
      </div>
      <h1 className="text-3xl font-bold mb-2">Vocal Synthesis</h1>
      <p className="text-gray-400 text-center mb-10">High-fidelity text-to-speech conversion with human-like prosody.</p>

      <div className="w-full glass p-6 rounded-3xl border-gray-800 space-y-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to be vocalized..."
          className="w-full h-40 bg-gray-950 border border-gray-800 rounded-2xl p-4 text-lg focus:ring-2 focus:ring-emerald-500/50 outline-none resize-none"
        />

        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={handleGenerate}
            disabled={!text.trim() || isGenerating}
            className={`flex-1 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 ${
              text.trim() && !isGenerating
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <><i className="fa-solid fa-spinner animate-spin"></i> Processing...</>
            ) : (
              <><i className="fa-solid fa-volume-high"></i> Synthesize Speech</>
            )}
          </button>
          
          {audioUrl && (
            <button
              onClick={() => {
                // Logic to replay the last synthesized audio
                handleGenerate();
              }}
              className="px-6 py-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold transition-all"
            >
              <i className="fa-solid fa-play"></i>
            </button>
          )}
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <div className="p-4 glass rounded-xl text-center">
          <div className="text-xs text-gray-500 uppercase mb-1">Voice Agent</div>
          <div className="font-bold">Kore</div>
        </div>
        <div className="p-4 glass rounded-xl text-center">
          <div className="text-xs text-gray-500 uppercase mb-1">Sample Rate</div>
          <div className="font-bold">24kHz</div>
        </div>
        <div className="p-4 glass rounded-xl text-center">
          <div className="text-xs text-gray-500 uppercase mb-1">Modality</div>
          <div className="font-bold">Raw PCM</div>
        </div>
      </div>
    </div>
  );
};

export default AudioToolkit;
