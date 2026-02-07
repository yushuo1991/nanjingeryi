import React from 'react';
import PropTypes from 'prop-types';
import { X } from '../icons';

/**
 * ModalBase - Reusable modal/dialog component
 *
 * A flexible modal component with backdrop, slide-up animation, and consistent styling.
 * Supports both bottom sheet (mobile) and centered (desktop) layouts.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {string} [props.title] - Modal title
 * @param {React.ReactNode} [props.icon] - Icon component to display next to title
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} [props.className] - Additional CSS classes for content area
 * @param {boolean} [props.centered] - Use centered layout instead of bottom sheet (default: false)
 * @param {boolean} [props.showCloseButton] - Show close button in header (default: true)
 */
const ModalBase = React.memo(({
  isOpen,
  onClose,
  title,
  icon,
  children,
  className = '',
  centered = false,
  showCloseButton = true,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black/40 z-50 flex ${centered ? 'items-center justify-center p-4' : 'items-end justify-center'}`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-gradient-to-b from-white/95 to-slate-50/95 backdrop-blur-2xl ${
          centered ? 'rounded-2xl max-w-md w-full' : 'rounded-t-[32px] w-full'
        } max-h-[90vh] overflow-y-auto animate-slide-up border-t border-white/80 shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-4 py-3 flex items-center justify-between z-10">
            {title && (
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {icon}
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X size={20} className="text-slate-500" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={`p-4 ${className}`}>
          {children}
        </div>
      </div>
    </div>
  );
});

ModalBase.displayName = 'ModalBase';

ModalBase.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  icon: PropTypes.node,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  centered: PropTypes.bool,
  showCloseButton: PropTypes.bool,
};

ModalBase.defaultProps = {
  title: undefined,
  icon: undefined,
  className: '',
  centered: false,
  showCloseButton: true,
};

export default ModalBase;
