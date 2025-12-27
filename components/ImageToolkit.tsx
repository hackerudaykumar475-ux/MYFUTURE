
import React, { useState } from 'react';
import { GeminiService } from '../geminiService';

const ImageToolkit: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16">("1:1");
  const [generatedImages, setGeneratedImages] = useState<{url: string, prompt: string}[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const url = await GeminiService.generateImage(prompt, aspectRatio);
      setGeneratedImages(prev => [{ url, prompt }, ...prev]);
    } catch (err) {
      console.error(err);
      alert("System overload: Image synthesis failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full">
      <div className="w-full md:w-80 border-r border-gray-800 p-6 space-y-8 bg-gray-900/20 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold mb-2">Vision Synthesis</h2>
          <p className="text-xs text-gray-400">Transform abstract thought into high-fidelity visuals.</p>
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Descriptive Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-32 bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-pink-500/50 outline-none resize-none"
            placeholder="A cybernetic city floating in a gas giant's atmosphere, cinematic lighting, hyper-realistic..."
          />
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Dimensions</label>
          <div className="grid grid-cols-3 gap-2">
            {(["1:1", "16:9", "9:16"] as const).map((ratio) => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`py-2 px-1 rounded-lg border text-xs font-medium transition-all ${
                  aspectRatio === ratio 
                    ? 'bg-pink-500/20 border-pink-500/50 text-pink-400' 
                    : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            prompt.trim() && !isGenerating
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:scale-[1.02] active:scale-95 text-white shadow-lg shadow-pink-500/20'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          }`}
        >
          {isGenerating ? (
            <><i className="fa-solid fa-spinner animate-spin"></i> Synthesizing...</>
          ) : (
            <><i className="fa-solid fa-wand-magic-sparkles"></i> Generate Image</>
          )}
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto bg-gray-950/40">
        <div className="max-w-6xl mx-auto space-y-8">
          {generatedImages.length === 0 && !isGenerating ? (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center opacity-30">
              <div className="w-24 h-24 mb-6 rounded-3xl border-2 border-dashed border-gray-600 flex items-center justify-center">
                <i className="fa-regular fa-image text-4xl"></i>
              </div>
              <h3 className="text-2xl font-semibold">Visual Buffer Empty</h3>
              <p className="max-w-xs mt-2">Enter a prompt to begin visual generation.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isGenerating && (
                <div className="aspect-square glass rounded-2xl animate-pulse flex flex-col items-center justify-center border-dashed border-pink-500/30">
                  <div className="w-12 h-12 rounded-full border-t-2 border-pink-500 animate-spin"></div>
                  <span className="mt-4 text-xs text-pink-500 font-medium">RENDERING...</span>
                </div>
              )}
              {generatedImages.map((img, idx) => (
                <div key={idx} className="group relative overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 transition-all hover:scale-[1.02]">
                  <img src={img.url} alt={img.prompt} className="w-full h-auto object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                    <p className="text-xs text-white line-clamp-3 mb-4">{img.prompt}</p>
                    <div className="flex gap-2">
                      <a href={img.url} download="prism-vision.png" className="flex-1 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-center text-xs font-bold backdrop-blur-md">
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageToolkit;
