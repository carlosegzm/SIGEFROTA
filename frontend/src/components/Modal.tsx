import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/30 backdrop-blur-md p-4 transition-all">
      <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(24,42,58,0.25)] w-full max-w-lg max-h-[90vh] flex flex-col border border-gray-100 overflow-hidden">
        <div className="flex justify-between items-center px-8 py-6 border-b border-gray-50 bg-gray-50/50">
          <h3 className="text-xl font-extrabold text-primary tracking-tight">{title}</h3>
          <button aria-label="Fechar" onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-full">
            <X size={24} />
          </button>
        </div>
        <div className="p-8 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
