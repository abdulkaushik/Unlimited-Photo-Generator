import React from 'react';
import { SparklesIcon } from './Icons';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-md border-b border-white/5 h-16 flex items-center justify-center">
      <div className="flex items-center gap-2">
        <div className="bg-primary/20 p-1.5 rounded-lg">
           <SparklesIcon className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          Unlimited Photo Generator
        </h1>
      </div>
    </header>
  );
};

export default Header;