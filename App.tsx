import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Header from './components/Header';
import WallpaperGrid from './components/WallpaperGrid';
import InputArea from './components/InputArea';
import ImageViewer from './components/ImageViewer';
import { generateWallpapers } from './services/geminiService';
import { Wallpaper, AspectRatio, GenerationGroup } from './types';

const App: React.FC = () => {
  // Store groups of generations instead of flat list
  const [generations, setGenerations] = useState<GenerationGroup[]>([]);
  const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (prompt: string, aspectRatio: AspectRatio, referenceImageBase64?: string) => {
    setIsLoading(true);
    
    // Create a new generation group with "loading" status
    const newGroup: GenerationGroup = {
      id: uuidv4(),
      prompt,
      wallpapers: [],
      timestamp: Date.now(),
      status: 'loading',
      aspectRatio
    };

    // Append the new group (Chat style: Newest at bottom)
    setGenerations(prev => [...prev, newGroup]);
    
    // Scroll to bottom to show the new skeleton
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);

    try {
      const images = await generateWallpapers({ 
        prompt, 
        aspectRatio,
        referenceImage: referenceImageBase64 
      });

      const newWallpapers: Wallpaper[] = images.map(url => ({
        id: uuidv4(),
        url,
        prompt,
        createdAt: Date.now(),
        aspectRatio: aspectRatio
      }));

      // Update the group with success status and images
      setGenerations(prev => prev.map(g => {
        if (g.id === newGroup.id) {
          return { ...g, wallpapers: newWallpapers, status: 'success' };
        }
        return g;
      }));
      
      // Clear reference after successful generation
      setReferenceImage(null); 

    } catch (error: any) {
      console.error("Generation failed", error);
      
      let errorMessage = "Failed to generate wallpapers. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes('quota') || error.message.includes('429')) {
             errorMessage = "API Quota exceeded. Please try again later.";
        } else {
             errorMessage = error.message;
        }
      }

      // Update group with error status and message
      setGenerations(prev => prev.map(g => {
         if (g.id === newGroup.id) {
           return { ...g, status: 'error', errorMessage };
         }
         return g;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemix = (wallpaper: Wallpaper) => {
    setReferenceImage(wallpaper.url);
    setInputPrompt(wallpaper.prompt); 
    setSelectedWallpaper(null); 
  };

  const handleReferenceSelect = (base64: string) => {
    setReferenceImage(base64);
  };

  return (
    <div className="min-h-screen bg-background text-white selection:bg-primary/30">
      <Header />
      
      <main className="pt-20 pb-48 min-h-screen">
         {/* Pass groups instead of flat list */}
         <WallpaperGrid 
           generations={generations} 
           onSelect={setSelectedWallpaper} 
         />
      </main>

      <InputArea 
        onGenerate={handleGenerate} 
        isLoading={isLoading}
        referenceImage={referenceImage}
        onClearReference={() => setReferenceImage(null)}
        onReferenceSelect={handleReferenceSelect}
        initialPrompt={inputPrompt}
      />

      <ImageViewer 
        wallpaper={selectedWallpaper} 
        onClose={() => setSelectedWallpaper(null)} 
        onRemix={handleRemix}
      />
    </div>
  );
};

export default App;