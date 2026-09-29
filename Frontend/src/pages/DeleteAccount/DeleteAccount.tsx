import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Lock,
  MessageSquare,
  AlertTriangle,
  Loader2,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { storefrontApi } from '../../services/directApiService';
import './DeleteAccount.css';

type Step = 'password' | 'reason' | 'done';
type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

const STATUS_TOKEN_KEY = 'cakentakeDeletionRequestToken';

const REASON_OPTIONS = [
  'I no longer use this app',
  'I have privacy concerns',
  'I created a duplicate account',
  'I had a bad experience',
  'Other',
];

const DeleteAccount: React.FC = () => {
  const navigate = useNavigate();
  const storedToken = localStorage.getItem(STATUS_TOKEN_KEY) || '';

  const [step, setStep] = useState<Step>(storedToken ? 'done' : 'password');
  const [identifier, setIdentifier] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return String(user?.email || user?.phone_no || user?.phone || '');
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [reasonOption, setReasonOption] = useState('');
  const [reasonDetail, setReasonDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusChecking, setStatusChecking] = useState(false);
  const [error, setError] = useState('');
  const [statusToken, setStatusToken] = useState(storedToken);
  const [requestStatus, setRequestStatus] = useState<RequestStatus>('PENDING');
  const [statusMessage, setStatusMessage] = useState(
    'Your account deletion request is being processed and will be completed within 7 days.',
  );

  const goBack = () => {
    if (step === 'reason') { setStep('password'); return; }
    navigate('/profile');
  };

  const handleContinue = () => {
    if (!localStorage.getItem('token') && !identifier.trim()) {
      setError('Please enter your email address or phone number');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }
    setError('');
    setStep('reason');
  };

  const buildReason = () => {
    if (!reasonOption) return reasonDetail.trim() || 'Not provided';
    if (reasonOption === 'Other') return reasonDetail.trim() || 'Other';
    return reasonDetail.trim()
      ? `${reasonOption} — ${reasonDetail.trim()}`
      : reasonOption;
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      const reason = buildReason();
      const token = localStorage.getItem('token');
      const response = token
        ? await storefrontApi.requestAccountDeletion({ password, reason })
        : await storefrontApi.requestAccountDeletionPublic({
            identifier: identifier.trim(),
            password,
            reason,
          });

      const requestToken = String(response?.data?.status_token || '').trim();
      if (requestToken) {
        localStorage.setItem(STATUS_TOKEN_KEY, requestToken);
        setStatusToken(requestToken);
      }
      setRequestStatus(String(response?.data?.status || 'PENDING').toUpperCase() as RequestStatus);
      setStatusMessage(
        response?.data?.message ||
          'Your account deletion request has been received and will be processed within 7 days.',
      );
      setStep('done');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const checkStatus = useCallback(async (silent = false) => {
    if (!statusToken) return;
    if (!silent) setStatusChecking(true);
    try {
      const response = await storefrontApi.getAccountDeletionStatus(statusToken);
      const nextStatus = String(response?.data?.status || 'PENDING').toUpperCase() as RequestStatus;
      setRequestStatus(nextStatus);
      if (response?.data?.message) setStatusMessage(response.data.message);
    } catch (err: any) {
      if (!silent) {
        setError(err?.response?.data?.error || 'Unable to check deletion status right now.');
      }
    } finally {
      if (!silent) setStatusChecking(false);
    }
  }, [statusToken]);

  useEffect(() => {
    if (step !== 'done' || !statusToken || requestStatus !== 'PENDING') return;
    void checkStatus(true);
    const timer = window.setInterval(() => void checkStatus(true), 10000);
    return () => window.clearInterval(timer);
  }, [step, statusToken, requestStatus, checkStatus]);

  const handleFinish = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const statusIcon = requestStatus === 'APPROVED'
    ? <CheckCircle2 size={26} />
    : <ShieldAlert size={26} />;

  return (
    <div className="da-page">
      {step !== 'done' && (
        <button className="da-back-btn" onClick={goBack}>
          <ChevronLeft size={20} />
        </button>
      )}

      {step !== 'done' && (
        <div className="da-progress">
          <span className={`da-dot ${step === 'password' ? 'active' : 'done'}`} />
          <span className={`da-dot ${step === 'reason' ? 'active' : ''}`} />
        </div>
      )}

      <div className="da-content">
        <AnimatePresence mode="wait">
          {step === 'password' && (
            <motion.div
              key="password"
              className="da-card"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              <div className="da-icon-badge da-icon-lock"><Lock size={22} /></div>
              <h1>Confirm your password</h1>
              <p className="da-subtitle">
                For your security, please re-enter your password before submitting
                an account deletion request.
              </p>

              {!localStorage.getItem('token') && (
                <div className="da-field">
                  <label>Email address or phone number</label>
                  <input
                    type="text"
                    inputMode="email"
                    autoComplete="username"
                    placeholder="Enter your registered email or phone"
                    value={identifier}
                    onChange={e => { setIdentifier(e.target.value); setError(''); }}
                  />
                </div>
              )}

              <div className="da-field">
                <label>Password</label>
                <input
                  type="password"
                  autoFocus
                  inputMode="text"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleContinue()}
                />
              </div>

              {error && <div className="da-error"><AlertTriangle size={14} /> {error}</div>}

              <button className="da-btn-primary" onClick={handleContinue}>Continue</button>
              <button className="da-btn-ghost" onClick={() => navigate('/profile')}>Cancel</button>
            </motion.div>
          )}

          {step === 'reason' && (
            <motion.div
              key="reason"
              className="da-card"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              <div className="da-icon-badge da-icon-message"><MessageSquare size={22} /></div>
              <h1>Confirm account deletion</h1>
              <p className="da-subtitle">
                Your feedback is optional. After submission, your request is sent
                directly to the CakeNTake owner/admin team and will be completed
                within 7 days.
              </p>

              <div className="da-reason-options">
                {REASON_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    className={`da-reason-chip ${reasonOption === opt ? 'active' : ''}`}
                    onClick={() => { setReasonOption(reasonOption === opt ? '' : opt); setError(''); }}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div className="da-field">
                <label>Additional feedback (optional)</label>
                <textarea
                  rows={4}
                  placeholder="You may leave this blank"
                  value={reasonDetail}
                  onChange={e => { setReasonDetail(e.target.value); setError(''); }}
                />
              </div>

              <div className="da-warning-note">
                Account access is paused after this request is submitted. The
                account and associated personal data will be removed when the
                deletion process is completed.
              </div>

              {error && <div className="da-error"><AlertTriangle size={14} /> {error}</div>}

              <button className="da-btn-danger" onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <><Loader2 size={16} className="da-spin" /> Submitting...</>
                ) : 'Submit Deletion Request'}
              </button>
              <button className="da-btn-ghost" onClick={() => setStep('password')}>Back</button>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div
              key="done"
              className="da-card da-card-done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`da-icon-badge ${requestStatus === 'APPROVED' ? 'da-icon-success' : 'da-icon-warning'}`}>
                {statusIcon}
              </div>
              <h1>
                {requestStatus === 'APPROVED'
                  ? 'Account Deleted'
                  : requestStatus === 'REJECTED'
                    ? 'Request Update'
                    : 'Request Submitted'}
              </h1>
              <p className="da-subtitle">{statusMessage}</p>

              {requestStatus === 'PENDING' && (
                <p className="da-status-hint">
                  You can keep or revisit this page to check the request status.
                  This private status page will confirm when the deletion is completed.
                </p>
              )}

              {statusToken && requestStatus === 'PENDING' && (
                <button
                  className="da-btn-secondary"
                  onClick={() => void checkStatus(false)}
                  disabled={statusChecking}
                >
                  {statusChecking ? <Loader2 size={16} className="da-spin" /> : <RefreshCw size={16} />}
                  Check Status
                </button>
              )}

              {error && <div className="da-error"><AlertTriangle size={14} /> {error}</div>}

              <button className="da-btn-primary" onClick={handleFinish}>Done</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DeleteAccount;
