import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { downloadBackup, restoreBackup } from "../../services/backupService";;
import "./BackupRestore.css";

const BackupRestore: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [loadingRestore, setLoadingRestore] = useState(false);

  const handleBackup = async () => {
    try {
      setLoadingBackup(true);

      const data = await downloadBackup();

      const blob = new Blob([data], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `cakentake_backup_${Date.now()}.json`;

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

      toast.success("Backup downloaded successfully");
    } catch (error: any) {
      // responseType is "blob", so an error body also comes back as a blob —
      // try to parse it as JSON to surface the real backend message.
      let message = "Backup failed";
      const data = error?.response?.data;
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          const parsed = JSON.parse(text);
          message = parsed?.message || message;
        } catch {
          // fall through to default message
        }
      } else {
        message = data?.message || message;
      }
      toast.error(message);
    } finally {
      setLoadingBackup(false);
    }
  };

  const handleRestore = async () => {
    if (!file) {
      toast.error("Please select a backup file");
      return;
    }

    try {
      setLoadingRestore(true);

      const res = await restoreBackup(file);

      toast.success(res.message || "Restore completed");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Restore failed");
    } finally {
      setLoadingRestore(false);
    }
  };

  return (
    <div className="backup-restore-container">
      <h2>Database Backup & Restore</h2>
      <p className="subtitle">
        Securely export your data records or recover structural point backups.
      </p>

      <div className="backup-section">
        <p className="section-title">Database Export</p>
        <button
          className="btn-backup"
          onClick={handleBackup}
          disabled={loadingBackup}
        >
          {loadingBackup ? "Creating Backup..." : "Download Backup (JSON)"}
        </button>
      </div>

      <hr className="divider" />

      <div className="restore-section">
        <p className="section-title">Database Import</p>
        <div className="file-upload-wrapper">
          <input
            type="file"
            accept=".json"
            className="file-upload-input"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <button
          className="btn-restore"
          onClick={handleRestore}
          disabled={loadingRestore}
        >
          {loadingRestore ? "Restoring..." : "Restore Database"}
        </button>
      </div>
    </div>
  );
};

export default BackupRestore;