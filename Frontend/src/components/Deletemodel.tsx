import React from 'react';

// --- TYPE DEFINITIONS ---
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
}

// --- COMPONENT ---
const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName = "this item"
}) => {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        
        {/* Close Icon Header */}
        <button style={styles.closeCornerBtn} onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        {/* Warning Icon Graphic */}
        <div style={styles.iconContainer}>
          <svg style={styles.warningIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Content */}
        <h3 style={styles.title}>Delete Confirmation</h3>
        <p style={styles.message}>
          Are you sure you want to delete <strong style={styles.highlight}>{itemName}</strong>? 
          This action cannot be undone and all associated data will be permanently removed.
        </p>

        {/* Actions */}
        <div style={styles.buttonGroup}>
          <button 
            style={styles.cancelButton} 
            onClick={onClose}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            Cancel
          </button>
          <button 
            style={styles.deleteButton} 
            onClick={onConfirm}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
          >
            Delete Permanently
          </button>
        </div>

      </div>
    </div>
  );
};

export default DeleteModal;

// --- ENHANCED INLINE STYLES ---
const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.4)', // Dark premium tint
    backdropFilter: 'blur(4px)', // Modern frosted glass effect
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    animation: 'fadeIn 0.2s ease-out',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    padding: '32px',
    maxWidth: '440px',
    width: '90%',
    textAlign: 'center',
    position: 'relative',
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  closeCornerBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    fontSize: '16px',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '50%',
    transition: 'color 0.2s',
  },
  iconContainer: {
    width: '56px',
    height: '56px',
    backgroundColor: '#fee2e2', // Soft red circle
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0 auto 20px auto',
  },
  warningIcon: {
    width: '28px',
    height: '28px',
    color: '#ef4444', // Warning Red
  },
  title: {
    margin: '0 0 10px 0',
    color: '#1e293b',
    fontSize: '22px',
    fontWeight: 600,
  },
  message: {
    margin: '0 0 28px 0',
    color: '#64748b',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  highlight: {
    color: '#0f172a',
    fontWeight: 600,
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  cancelButton: {
    flex: 1,
    padding: '12px 20px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  deleteButton: {
    flex: 1,
    padding: '12px 20px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)',
    transition: 'all 0.2s ease',
  }
};