import { useState, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode, type ChangeEvent } from 'react';
import { Eye, EyeOff, Lock, Search, Upload } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-xs font-semibold text-neutral-700">{label}</label>}
      <input
        className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-white outline-none transition-all
          ${error ? 'border-error focus:border-error' : 'border-neutral-grey focus:border-primary focus:ring-3 focus:ring-primary-light'}
          placeholder:text-neutral-400`}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function PasswordInput({ label, error, className = '', ...props }: PasswordInputProps) {
  const [show, setShow] = useState(false);
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-xs font-semibold text-neutral-700">{label}</label>}
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          className={`w-full border rounded-lg px-3 py-2.5 pr-10 text-sm bg-white outline-none transition-all
            ${error ? 'border-error focus:border-error' : 'border-neutral-grey focus:border-primary focus:ring-3 focus:ring-primary-light'}
            placeholder:text-neutral-400`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}

interface ReadOnlyInputProps {
  label?: string;
  value: string;
  icon?: LucideIcon;
  className?: string;
}

export function ReadOnlyInput({ label, value, icon: Icon = Lock, className = '' }: ReadOnlyInputProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-xs font-semibold text-neutral-700">{label}</label>}
      <div className="relative">
        <input
          type="text"
          value={value}
          disabled
          className="w-full border border-neutral-100 rounded-lg px-3 py-2.5 pr-10 text-sm bg-neutral-100 text-neutral-400 cursor-not-allowed"
        />
        <Icon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
      </div>
    </div>
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function TextArea({ label, error, className = '', rows = 3, ...props }: TextAreaProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-xs font-semibold text-neutral-700">{label}</label>}
      <textarea
        rows={rows}
        className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-white outline-none transition-all resize-none
          ${error ? 'border-error focus:border-error' : 'border-neutral-grey focus:border-primary focus:ring-3 focus:ring-primary-light'}
          placeholder:text-neutral-400`}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export function Select({ label, error, children, className = '', ...props }: SelectProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-xs font-semibold text-neutral-700">{label}</label>}
      <select
        className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-white outline-none transition-all appearance-none
          ${error ? 'border-error' : 'border-neutral-grey focus:border-primary focus:ring-3 focus:ring-primary-light'}
        `}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}

interface FileUploadProps {
  label?: string;
  accept?: string;
  onChange: (file: File) => void;
  fileName?: string;
  className?: string;
}

export function FileUpload({ label, accept, onChange, fileName, className = '' }: FileUploadProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) onChange(e.target.files[0]);
  };
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-xs font-semibold text-neutral-700">{label}</label>}
      <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-neutral-grey rounded-lg bg-neutral-50 p-6 cursor-pointer hover:border-accent transition-colors">
        <Upload className="h-6 w-6 text-neutral-400" />
        <span className="text-sm text-neutral-400">
          {fileName || 'Click to upload or drag & drop'}
        </span>
        <input type="file" accept={accept} className="hidden" onChange={handleChange} />
      </label>
    </div>
  );
}

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-neutral-grey rounded-full pl-10 pr-4 py-2.5 text-sm bg-white outline-none
          focus:border-primary focus:ring-3 focus:ring-primary-light placeholder:text-neutral-400"
      />
    </div>
  );
}
