
import React, { useState, useEffect } from 'react';
import { GeminiService } from '../geminiService';

// The global declaration was removed to avoid conflicting with the pre-defined AIStudio type in the environment.

const VideoToolkit: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      // Use window.aistudio directly as it is pre-configured in the environment
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setHasKey(selected);
    };
    checkKey();
  }, []);

  const handleOpenKey = async () => {
    // Open the key selection dialog
    await (window as any).aistudio.openSelectKey();
    // Guideline: Assume the key selection was successful after triggering openSelectKey()
    setHasKey(true);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setVideoUrl(null);
    setStatus('Initializing Veo engine...');

    try {
      let operation = await GeminiService.startVideoGeneration(prompt);
      
      while (!operation.done) {
        setStatus('Synthesizing frames... this may take a few minutes.');
        await new Promise(resolve => setTimeout(resolve, 8000));
        operation = await GeminiService.pollVideoOperation(operation);
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
        setStatus('');
      }
    } catch (err: any) {
      console.error(err);
      // Guideline: If key is invalid, reset and prompt user to select again
      if (err.message?.includes('Requested entity was not found')) {
        setHasKey(false);
        await (window as any).aistudio.openSelectKey();
        setHasKey(true);
      } else {
        alert('Synthesis interrupted. Neural buffers overloaded.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  if (!hasKey) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
          <i className="fa-solid fa-key text-3xl text-purple-400"></i>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Billing Verification Required</h2>
          <p className="text-gray-400 max-w-md mt-2">
            High-fidelity video synthesis requires a paid API key from a billing-enabled Google Cloud Project.
          </p>
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-purple-400 hover:underline text-sm mt-2 block"
          >
            Read about billing setup
          </a>
        </div>
        <button
          onClick={handleOpenKey}
          className="px-8 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold transition-all"
        >
          Select API Key
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-10 flex flex-col max-w-5xl mx-auto w-full">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold mb-3">Motion Synthesis <span className="text-sm font-mono opacity-40">VEO 3.1</span></h1>
        <p className="text-gray-400">Generate high-fidelity cinemagraphs and motion sequences from natural language.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 flex-1">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 rounded-2xl border-gray-800">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Motion Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-40 bg-gray-950 border border-gray-800 rounded-xl p-4 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none resize-none mb-6"
              placeholder="A futuristic car speeding through a neon rainforest, rain droplets on the camera lens, 4k resolution, cinematic..."
            />
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 ${
                prompt.trim() && !isGenerating
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-purple-500/20 active:scale-95 text-white'
                  : 'bg-gray-800 text-gray-600 cursor-not-allowed'
              }`}
            >
              {isGenerating ? (
                <><i className="fa-solid fa-spinner animate-spin"></i> Processing...</>
              ) : (
                <><i className="fa-solid fa-play"></i> Synthesize Motion</>
              )}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
            <div className="flex gap-3">
              <i className="fa-solid fa-circle-info text-indigo-400 mt-1"></i>
              <div className="text-xs text-indigo-300/80 leading-relaxed">
                Video generation typically takes 2-3 minutes. The engine is simulating 720p resolution at 24fps.
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col h-full">
          <div className="flex-1 glass rounded-3xl overflow-hidden relative flex items-center justify-center min-h-[400px]">
            {isGenerating ? (
              <div className="text-center p-10 flex flex-col items-center">
                <div className="w-16 h-16 relative mb-6">
                  <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
                </div>
                <h3 className="text-xl font-bold mb-2">Generating Sequence</h3>
                <p className="text-gray-400 text-sm max-w-xs">{status}</p>
                <div className="w-full max-w-xs h-1.5 bg-gray-800 rounded-full mt-6 overflow-hidden">
                  <div className="h-full bg-purple-500 animate-[loading_20s_ease-in-out_infinite]"></div>
                </div>
              </div>
            ) : videoUrl ? (
              <div className="w-full h-full">
                <video src={videoUrl} controls autoPlay loop className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="text-center opacity-20">
                <i className="fa-solid fa-clapperboard text-7xl mb-4"></i>
                <p className="font-semibold">Awaiting synthesis parameters</p>
              </div>
            )}
          </div>
          {videoUrl && (
            <div className="mt-4 flex justify-end">
              <a href={videoUrl} download="prism-motion.mp4" className="px-6 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 font-bold text-sm transition-all flex items-center gap-2">
                <i className="fa-solid fa-download"></i> Save Video
              </a>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default VideoToolkit;
