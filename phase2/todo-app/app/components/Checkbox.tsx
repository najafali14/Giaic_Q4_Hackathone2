// app/components/Checkbox.tsx
import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function Checkbox({ checked, onCheckedChange, id, className, ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      className={twMerge(
        clsx(
          "h-5 w-5 rounded border-border text-primary focus:ring-primary focus:outline-none",
          "bg-card", // Use card background for checkbox
          className
        )
      )}
      {...props}
    />
  );
}
