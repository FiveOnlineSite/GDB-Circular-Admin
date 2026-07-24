import React, { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Delete',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  isLoading = false,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = isLoading || internalLoading;

  useEffect(() => {
    if (!isOpen) {
      setInternalLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'
      onClick={!loading ? onClose : undefined}
    >
      <div
        className='bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl transform transition-all scale-100 relative'
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={loading}
          className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50'
        >
          <X className='w-5 h-5' />
        </button>
        <h3 className='text-lg font-bold text-gray-900 mb-2'>{title}</h3>
        <p className='text-gray-500 mb-6'>{message}</p>
        <div className='flex justify-end gap-3'>
          <button
            onClick={onClose}
            disabled={loading}
            className='px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors disabled:opacity-50'
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              const result = onConfirm?.();
              if (result && typeof result.then === 'function') {
                try {
                  setInternalLoading(true);
                  await result;
                } finally {
                  setInternalLoading(false);
                }
              }
            }}
            disabled={loading}
            className='px-4 py-2 rounded-lg bg-[#3a5f9e] text-white hover:bg-[#325186] font-medium transition-colors shadow-lg shadow-[#3a5f9e]/20 disabled:opacity-50'
          >
            {loading ? (
              <span className='inline-flex items-center gap-2'>
                <Loader2 className='h-4 w-4 animate-spin' />
                Deleting...
              </span>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
