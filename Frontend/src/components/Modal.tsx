/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './components.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
  id?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, width = '500px', id }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div id={id} className="sage-modal-overlay" onClick={onClose}>
      <div 
        className="sage-modal-content" 
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sage-modal-header">
          <h3>{title}</h3>
          <button className="sage-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="sage-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};
