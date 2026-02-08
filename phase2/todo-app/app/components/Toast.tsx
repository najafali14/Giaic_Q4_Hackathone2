// app/components/Toast.tsx
import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ message, type = 'info', onClose }: ToastProps) {
  const bgColor = {
    success: 'bg-secondary',
    error: 'bg-red-500', // Keep red for errors
    info: 'bg-primary',
  }[type];

  return (
    <div
      className={twMerge(
        clsx(
          "fixed bottom-4 right-4 p-4 rounded-lg shadow-xl text-white max-w-sm z-50",
          bgColor
        )
      )}
      role="alert"
    >
      <div className="flex justify-between items-center">
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-white opacity-80 hover:opacity-100 focus:outline-none"
          aria-label="Close toast"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
