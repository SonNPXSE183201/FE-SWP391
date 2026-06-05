import { useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

const MAX_FILE_SIZE_MB = 20;
const ACCEPTED_TYPE = 'application/pdf';

export const useNameUpload = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nameFile, setNameFile] = useState<File | null>(null);
  const [nameFileName, setNameFileName] = useState('');

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`File phác thảo không được vượt quá ${MAX_FILE_SIZE_MB}MB`);
      return;
    }
    if (file.type !== ACCEPTED_TYPE) {
      toast.error('Vui lòng chọn file PDF');
      return;
    }

    setNameFile(file);
    setNameFileName(file.name);
    toast.success('Upload bản phác thảo thành công!');
  }, []);

  const removeFile = useCallback(() => {
    setNameFile(null);
    setNameFileName('');
    // Reset input so re-upload of same file triggers onChange
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    fileInputRef,
    nameFile,
    nameFileName,
    handleFileChange,
    removeFile,
    openFilePicker,
  };
};
