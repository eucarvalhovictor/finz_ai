
import React from 'react';
import { CloseIcon } from './icons/Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center md:p-4"
      onClick={onClose}
    >
      <div
        className="bg-card w-full h-full md:h-auto md:max-w-lg md:rounded-2xl border-0 md:border border-border relative animate-fade-in-up flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho Fixo */}
        <div className="flex-none flex justify-between items-center p-4 md:p-6 border-b border-border bg-card md:rounded-t-2xl">
          <h3 className="text-xl font-bold text-text-primary">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 bg-white/5 rounded-full text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
            aria-label="Fechar"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Corpo com Rolagem */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
