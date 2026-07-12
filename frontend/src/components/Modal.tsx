import { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string; // e.g. "max-w-md", "max-w-lg"
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = "max-w-md",
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[#1D1A39]/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-xl w-full ${maxWidth} p-6 max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg text-[#1D1A39]">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#662549]/50 hover:text-[#662549] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>{children}</div>

        {footer && <div className="flex gap-3 mt-6 pt-1">{footer}</div>}
      </div>
    </div>
  );
}