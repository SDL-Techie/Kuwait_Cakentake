import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import './PWAInstall.css';

const PWAInstall: React.FC = () => {
  const deferredPromptRef = useRef<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [installSupported, setInstallSupported] = useState(false);
  const [alreadyInstalled, setAlreadyInstalled] = useState(false);
  const [showFallbackInstallText, setShowFallbackInstallText] = useState(false);
  const [requestedInstall, setRequestedInstall] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
   
      e.preventDefault();
      deferredPromptRef.current = e;
      setInstallSupported(true);
    };

    const appInstalledHandler = () => {
      setAlreadyInstalled(true);
      setShowPopup(false);
    };

    const manualTriggerHandler = async () => {
      setRequestedInstall(true);

      if (deferredPromptRef.current && !alreadyInstalled) {
        const promptEvent = deferredPromptRef.current;
        promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult?.outcome === 'accepted') {
         
          setAlreadyInstalled(true);
        } else {
         
        }
        deferredPromptRef.current = null;
        setInstallSupported(false);
        setShowPopup(false);
        return;
      }

      if (!deferredPromptRef.current && !alreadyInstalled) {
        setShowFallbackInstallText(true);
      }
      setShowPopup(true);
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);
    window.addEventListener('appinstalled', appInstalledHandler);
    window.addEventListener('triggerPwaInstall', manualTriggerHandler);

    const standaloneMatch = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
    if (standaloneMatch) {
      setAlreadyInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener);
      window.removeEventListener('appinstalled', appInstalledHandler);
      window.removeEventListener('triggerPwaInstall', manualTriggerHandler);
    };
  }, [alreadyInstalled]);

  const handleInstall = async () => {
    if (alreadyInstalled) {
      setShowFallbackInstallText(true);
      return;
    }

    const promptEvent = deferredPromptRef.current;
    if (!promptEvent) {
      setShowFallbackInstallText(true);
      return;
    }

    promptEvent.prompt();
    const choiceResult = await promptEvent.userChoice;
    if (choiceResult?.outcome === 'accepted') {
   
      setAlreadyInstalled(true);
    } else {
      
    }
    deferredPromptRef.current = null;
    setInstallSupported(false);
    setShowPopup(false);
  };

  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div 
          className="rasi-pwa-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="rasi-pwa-modal"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
          >
            <button className="rasi-pwa-close" onClick={() => setShowPopup(false)}>
              <X size={20} />
            </button>
            <div className="rasi-pwa-icon">🍰ྀི⋆˙⟡</div>
            <h3>Install CakenTake Web App</h3>
            <p>Install the app for faster access and special offers directly from your home screen.</p>
            <div className="rasi-pwa-actions">
              <button className="rasi-pwa-install-btn" onClick={handleInstall}>
                <Download size={18} /> Install App
              </button>
              <button className="rasi-pwa-dismiss-btn" onClick={() => setShowPopup(false)}>
                Dismiss
              </button>
            {showFallbackInstallText && (
              <div className="rasi-pwa-fallback-text">
                If the native install prompt did not appear, use your browser menu and choose "Add to Home Screen" or "Install App".
              </div>
            )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAInstall;