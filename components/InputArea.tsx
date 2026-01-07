import React, { useState, useEffect, useRef } from 'react';
import { SparklesIcon, RemixIcon, CloseIcon, PlusIcon } from './Icons';
import { AspectRatio } from '../types';

interface InputAreaProps {
  onGenerate: (prompt: string, aspectRatio: AspectRatio, referenceImage?: string) => void;
  isLoading: boolean;
  referenceImage: string | null;
  onClearReference: () => void;
  onReferenceSelect: (base64: string) => void;
  initialPrompt: string;
}

const InputArea: React.FC<InputAreaProps> = ({ 
  onGenerate, 
  isLoading, 
  referenceImage, 
  onClearReference,
  onReferenceSelect,
  initialPrompt 
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update local state when initialPrompt changes (e.g. from Remix action)
  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    
    // Pass the base64 data (stripping header) if reference exists
    let refImageBase64: string | undefined = undefined;
    if (referenceImage) {
        // format is data:image/png;base64,.....
        // We need to strip the prefix
        const parts = referenceImage.split(',');
        refImageBase64 = parts.length > 1 ? parts[1] : referenceImage;
    }
    
    onGenerate(prompt, aspectRatio, refImageBase64);
    setPrompt(""); // Clear prompt after generate
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onReferenceSelect(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const ratios: { value: AspectRatio; label: string; icon: string }[] = [
    { value: "9:16", label: "Portrait", icon: "h-6 w-3.5 border-2 rounded-sm" },
    { value: "1:1", label: "Square", icon: "h-5 w-5 border-2 rounded-sm" },
    { value: "16:9", label: "Landscape", icon: "h-3.5 w-6 border-2 rounded-sm" },
    { value: "3:4", label: "3:4", icon: "h-5 w-4 border-2 rounded-sm" },
    { value: "4:3", label: "4:3", icon: "h-4 w-5 border-2 rounded-sm" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-t border-white/10 p-4 pb-safe">
      <div className="max-w-3xl mx-auto w-full flex flex-col gap-3">
        
        {/* Reference Image Indicator */}
        {referenceImage && (
          <div className="flex items-center gap-3 bg-secondary/80 p-2 rounded-lg w-fit animate-in slide-in-from-bottom-2 fade-in">
             <div className="relative h-12 w-8 rounded overflow-hidden border border-white/20">
               <img src={referenceImage} alt="Reference" className="w-full h-full object-cover" />
             </div>
             <div className="flex flex-col">
               <span className="text-xs text-primary font-medium uppercase tracking-wider flex items-center gap-1">
                 <RemixIcon className="w-3 h-3" /> Reference Active
               </span>
               <span className="text-xs text-white/50 max-w-[150px] truncate">Using image</span>
             </div>
             <button 
               onClick={onClearReference}
               className="ml-2 p-1 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors"
             >
               <CloseIcon className="w-4 h-4" />
             </button>
          </div>
        )}

        {/* Aspect Ratio Selector */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {ratios.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setAspectRatio(r.value)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap
                ${aspectRatio === r.value 
                  ? 'bg-white text-black' 
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}
              `}
            >
              <div className={`${r.icon} ${aspectRatio === r.value ? 'border-black' : 'border-current'}`} />
              {r.label}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          {/* File Upload Input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-[50px] w-[50px] rounded-2xl flex items-center justify-center bg-secondary hover:bg-secondary/80 border border-white/10 text-white transition-colors flex-shrink-0"
            title="Upload Reference Image"
          >
             <PlusIcon className="w-6 h-6" />
          </button>

          <div className="relative flex-1">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your vibe... (e.g. 'Neon city in rain')"
              className="w-full bg-surface border-white/10 border rounded-2xl px-4 py-3 pr-12 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none min-h-[50px] max-h-[120px]"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className={`
              h-[50px] w-[50px] rounded-2xl flex items-center justify-center transition-all duration-300 flex-shrink-0
              ${!prompt.trim() || isLoading 
                ? 'bg-secondary text-white/20 cursor-not-allowed' 
                : 'bg-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] hover:bg-primary/90 hover:scale-105 active:scale-95'}
            `}
          >
            {isLoading ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
               <SparklesIcon className="w-6 h-6" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InputArea;