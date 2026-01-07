import React from 'react';
import { Sparkles, Download, RefreshCw, X, Image as ImageIcon, Share2, Plus, ZoomIn, ZoomOut, Copy, Check } from 'lucide-react';

export const SparklesIcon = ({ className }: { className?: string }) => <Sparkles className={className} />;
export const DownloadIcon = ({ className }: { className?: string }) => <Download className={className} />;
export const RemixIcon = ({ className }: { className?: string }) => <RefreshCw className={className} />;
export const CloseIcon = ({ className }: { className?: string }) => <X className={className} />;
export const ImageIconIcon = ({ className }: { className?: string }) => <ImageIcon className={className} />;
export const ShareIcon = ({ className }: { className?: string }) => <Share2 className={className} />;
export const PlusIcon = ({ className }: { className?: string }) => <Plus className={className} />;
export const ZoomInIcon = ({ className }: { className?: string }) => <ZoomIn className={className} />;
export const ZoomOutIcon = ({ className }: { className?: string }) => <ZoomOut className={className} />;
export const CopyIcon = ({ className }: { className?: string }) => <Copy className={className} />;
export const CheckIcon = ({ className }: { className?: string }) => <Check className={className} />;