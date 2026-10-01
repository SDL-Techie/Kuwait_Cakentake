import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Lock, MessageSquare, AlertTriangle, Loader2, ShieldAlert } from 'lucide-react';
import { storefrontApi } from '../../services/directApiService';
import './DeleteAccount.css';

type Step = 'password' | 'reason' | 'done';

const REASON_OPTIONS = [
  'I no longer use this app',
  'I have privacy concerns',
  'I created a duplicate account',
  'I had a bad experience',
  'Other',
];

const DeleteAccount: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('password');
  const [password, setPassword] = useState('');
  const [reasonOption, setReasonOption] = useState('');
  const [reasonDetail, setReasonDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const goBack = () => {
    if (step === 'reason') { setStep('password'); return; }
    navigate('/profile');
  };

  const handleContinue = () => {
    if (!password) {
      setError('Please enter your password');
      return;
    }
    setError('');
    setStep('reason');
  };

  const handleSubmit = async () => {
    const reason = reasonOption === 'Other'
      ? reasonDetail.trim()
      : reasonDetail.trim()
        ? `${reasonOption} — ${reasonDetail.trim()}`
        : reasonOption;

    if (!reasonOption) {
      setError('Please select a reason');
      return;
    }
    if (reasonOption === 'Other' && !reasonDetail.trim()) {
      setError('Please tell us a bit more');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await storefrontApi.requestAccountDeletion({ password, reason });
      setStep('done');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  return (
    <div className="da-page">
      {step !== 'done' && (
        <button className="da-back-btn" onClick={goBack}>
          <ChevronLeft size={20} />
        </button>
      )}

      {/* ── Progress dots ── */}
      {step !== 'done' && (
        <div className="da-progress">
          <span className={`da-dot ${step === 'password' ? 'active' : 'done'}`} />
          <span className={`da-dot ${step === 'reason' ? 'active' : ''}`} />
        </div>
      )}

      <div className="da-content">
        <AnimatePresence mode="wait">
          {/* ── STEP 1: PASSWORD ── */}
          {step === 'password' && (
            <motion.div
              key="password"
              className="da-card"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              <div className="da-icon-badge da-icon-lock">
                <Lock size={22} />
              </div>
              <h1>Confirm your password</h1>
              <p className="da-subtitle">
                For your security, please re-enter your password before we continue
                with deleting your account.
              </p>

              <div className="da-field">
                <label>Password</label>
                <input
                  type="password"
                  autoFocus
                  inputMode="text"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleContinue()}
                />
              </div>

              {error && (
                <div className="da-error">
                  <AlertTriangle size={14} /> {error}
                </div>
              )}

              <button className="da-btn-primary" onClick={handleContinue}>
                Continue
              </button>
              <button className="da-btn-ghost" onClick={() => navigate('/profile')}>
                Cancel
              </button>
            </motion.div>
          )}

          {/* ── STEP 2: REASON ── */}
          {step === 'reason' && (
            <motion.div
              key="reason"
              className="da-card"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              <div className="da-icon-badge da-icon-message">
                <MessageSquare size={22} />
              </div>
              <h1>Why are you leaving?</h1>
              <p className="da-subtitle">
                Your feedback helps us improve. This will be reviewed by our team
                before your account is deleted.
              </p>

              <div className="da-reason-options">
                {REASON_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    className={`da-reason-chip ${reasonOption === opt ? 'active' : ''}`}
                    onClick={() => { setReasonOption(opt); setError(''); }}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div className="da-field">
                <label>{reasonOption === 'Other' ? 'Tell us more *' : 'Additional details (optional)'}</label>
                <textarea
                  rows={4}
                  placeholder="Type here..."
                  value={reasonDetail}
                  onChange={e => { setReasonDetail(e.target.value); setError(''); }}
                />
              </div>

              {error && (
                <div className="da-error">
                  <AlertTriangle size={14} /> {error}
                </div>
              )}

              <button className="da-btn-danger" onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 size={16} className="da-spin" /> Submitting...
                  </>
                ) : (
                  'Submit Deletion Request'
                )}
              </button>
              <button className="da-btn-ghost" onClick={() => setStep('password')}>
                Back
              </button>
            </motion.div>
          )}

          {/* ── STEP 3: DONE ── */}
          {step === 'done' && (
            <motion.div
              key="done"
              className="da-card da-card-done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="da-icon-badge da-icon-warning">
                <ShieldAlert size={26} />
              </div>
              <h1>Request Submitted</h1>
              <p className="da-subtitle">
                Your account will be permanently deleted within a week once our
                team reviews your request. You've been logged out and won't be
                able to log back in while this is pending.
              </p>
              <button className="da-btn-primary" onClick={handleFinish}>
                Done
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DeleteAccount;