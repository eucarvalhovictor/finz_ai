
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
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 overflow-hidden"
      onClick={onClose}
    >
      <div
        className="bg-card w-full h-[100dvh] md:h-auto md:max-h-[90vh] md:max-w-lg md:rounded-2xl border-0 md:border border-border relative animate-fade-in-up flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho Fixo */}
        <div className="flex-none flex justify-between items-center px-4 py-3 md:p-4 border-b border-border bg-card md:rounded-t-2xl z-10">
          <h3 className="text-lg md:text-xl font-bold text-text-primary">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 bg-white/5 rounded-full text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
            aria-label="Fechar"
          >
            <CloseIcon className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>
        
        {/* Corpo Flexível */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-6 custom-scrollbar flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
