import React, { useEffect, useState } from 'react';
import { Trash2, UserX, Loader2, Inbox } from 'lucide-react';
import { accountDeletionApi } from '../../services/directApiService';
import './AccountDeletionRequests.css';

interface DeletionRequest {
  id: number;
  user_name: string;
  user_email: string;
  user_phone: string;
  reason: string;
  status: string;
  requested_at: string;
}

const STATUS_TABS = ['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const;

const AccountDeletionRequests: React.FC = () => {
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await accountDeletionApi.list(statusFilter);
      setRequests(res.data.requests || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleApprove = async (id: number) => {
    if (!window.confirm("This will complete the customer's account deletion request and permanently remove/anonymize personal data. Continue?")) return;
    setActingId(id);
    try {
      await accountDeletionApi.approve(id);
      load();
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (id: number) => {
    const note = window.prompt('Reason this deletion request cannot be completed (optional):') || '';
    setActingId(id);
    try {
      await accountDeletionApi.reject(id, note);
      load();
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="adr-container">
      <div className="adr-header">
        <div className="adr-header-text">
          <h1>Account Deletion Requests</h1>
          <p>Complete customer-initiated deletion requests within the stated processing window.</p>
        </div>
        <span className="adr-count-badge">{requests.length} {statusFilter.toLowerCase()}</span>
      </div>

      <div className="adr-tabs">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            className={`adr-tab ${statusFilter === tab ? 'active' : ''}`}
            onClick={() => setStatusFilter(tab)}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="adr-table-card">
        {loading ? (
          <div className="adr-loading">
            <Loader2 size={22} className="adr-spin" />
            <span>Loading requests...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="adr-empty">
            <Inbox size={28} />
            <p>No {statusFilter !== 'ALL' ? statusFilter.toLowerCase() : ''} requests found</p>
          </div>
        ) : (
          <div className="adr-table-scroll">
            <table className="adr-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Reason</th>
                  <th>Requested</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div className="adr-user-cell">
                        <div className="adr-avatar">
                          {r.user_name?.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                        </div>
                        <span className="adr-user-name">{r.user_name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="adr-contact-cell">
                        <span>{r.user_email || '—'}</span>
                        <span className="adr-muted">{r.user_phone || '—'}</span>
                      </div>
                    </td>
                    <td className="adr-reason-cell">{r.reason}</td>
                    <td className="adr-muted">{new Date(r.requested_at).toLocaleString()}</td>
                    <td>
                      <span className={`adr-status-pill adr-status-${r.status.toLowerCase()}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      {r.status === 'PENDING' ? (
                        <div className="adr-actions">
                          <button
                            className="adr-btn adr-btn-approve"
                            disabled={actingId === r.id}
                            onClick={() => handleApprove(r.id)}
                          >
                            {actingId === r.id ? <Loader2 size={14} className="adr-spin" /> : <Trash2 size={14} />}
                            Complete Deletion
                          </button>
                          <button
                            className="adr-btn adr-btn-reject"
                            disabled={actingId === r.id}
                            onClick={() => handleReject(r.id)}
                          >
                            <UserX size={14} />
                            Unable to Complete
                          </button>
                        </div>
                      ) : (
                        <span className="adr-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountDeletionRequests;