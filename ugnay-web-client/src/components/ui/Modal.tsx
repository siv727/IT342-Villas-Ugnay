import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

export default function Modal({ open, onClose, title, children, actions }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] w-full max-w-md p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mb-6">{children}</div>
        {actions && <div className="flex justify-end gap-3">{actions}</div>}
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: string;
  loading?: boolean;
}

export function ConfirmModal({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirm', variant = 'danger', loading = false }: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </>
      }
    >
      <p className="text-sm text-neutral-700">{description}</p>
    </Modal>
  );
}
