import {api} from './api';

// Download database backup
export const downloadBackup = async () => {
  const response = await api.post("/backup", null, {
    responseType: "blob",
  });

  return response.data;
};

// Restore database
export const restoreBackup = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/restore", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};