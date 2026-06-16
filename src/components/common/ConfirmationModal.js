import React from 'react';
import { X } from 'lucide-react';

const ConfirmationModal = ({
  isOpen,
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  confirmLabel,
  cancelText = 'Cancel',
  confirmButtonClass,
  confirmVariant,
  isLoading = false,
}) => {
  const displayIsOpen = isOpen !== undefined ? isOpen : open;
  if (!displayIsOpen) return null;

  // Support both confirmText and confirmLabel
  const displayConfirmText = confirmText || confirmLabel || 'Confirm';

  // Determine button styles based on variant
  let btnClass = confirmButtonClass;
  if (!btnClass) {
    if (confirmVariant === 'destructive') {
      btnClass = 'bg-red-600 hover:bg-red-700 shadow-red-600/20';
    } else {
      btnClass = 'bg-[#981B1F] hover:bg-[#7a1619] shadow-[#981B1F]/20';
    }
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'
      onClick={!isLoading ? onClose : undefined}
    >
      <div
        className='bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl transform transition-all scale-100 relative'
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={isLoading}
          className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50'
        >
          <X className='w-5 h-5' />
        </button>
        <h3 className='text-lg font-bold text-gray-900 mb-2'>{title}</h3>
        <p className='text-gray-500 mb-6'>{message}</p>
        <div className='flex justify-end gap-3'>
          <button
            onClick={onClose}
            disabled={isLoading}
            className='px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors disabled:opacity-50'
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-white font-medium transition-colors shadow-lg disabled:opacity-50 ${btnClass}`}
          >
            {isLoading ? 'Processing...' : displayConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
