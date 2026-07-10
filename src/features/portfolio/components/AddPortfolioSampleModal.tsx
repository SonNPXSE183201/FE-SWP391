import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useUploadPortfolioSample, useUploadPortfolioImage } from '../hooks/usePortfolio';
import { getAxiosErrorMessage } from '../../../api/apiResponse';

interface AddPortfolioSampleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddPortfolioSampleModal = ({ isOpen, onClose }: AddPortfolioSampleModalProps) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const uploadImageMutation = useUploadPortfolioImage();
  const createSampleMutation = useUploadPortfolioSample();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('image/')) {
        setFile(droppedFile);
        setPreviewUrl(URL.createObjectURL(droppedFile));
      } else {
        toast.error('Vui lòng chọn file hình ảnh.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Vui lòng chọn ảnh.');
      return;
    }
    if (!title.trim()) {
      toast.error('Vui lòng nhập tên tác phẩm.');
      return;
    }
    if (!category.trim()) {
      toast.error('Vui lòng nhập thể loại/nhãn.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // 1. Upload ảnh lên lưu trữ
      const uploadRes = await uploadImageMutation.mutateAsync(file);
      const imageUrl = uploadRes.data?.data;
      
      if (!imageUrl) {
        throw new Error('Không thể lấy đường dẫn ảnh.');
      }

      // 2. Tạo sample trong database
      await createSampleMutation.mutateAsync({
        title,
        category,
        imageUrl,
      });

      toast.success('Thêm ảnh vào Portfolio thành công!');
      resetForm();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(getAxiosErrorMessage(error, 'Đã có lỗi xảy ra.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setCategory('');
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-bg-secondary rounded-2xl shadow-2xl border border-border-custom overflow-hidden z-10 flex flex-col max-h-full"
          >
            <div className="px-6 py-4 border-b border-border-custom flex items-center justify-between shrink-0 bg-bg-secondary">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <ImageIcon size={20} className="text-brand" />
                Thêm ảnh Portfolio
              </h3>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-surface rounded-lg transition-colors cursor-pointer border-none bg-transparent disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="add-portfolio-form" onSubmit={handleSubmit} className="space-y-5">
                {/* File Upload Area */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Ảnh mẫu <span className="text-danger">*</span></label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-4 transition-colors text-center ${
                      previewUrl ? 'border-brand bg-brand/5' : 'border-border-custom hover:border-brand/50 bg-bg-surface'
                    } cursor-pointer relative overflow-hidden`}
                    onClick={() => !isSubmitting && fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileSelect}
                      disabled={isSubmitting}
                    />
                    
                    {previewUrl ? (
                      <div className="relative aspect-video w-full">
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                          <p className="text-white text-sm font-medium flex items-center gap-2">
                            <Upload size={16} /> Đổi ảnh khác
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 flex flex-col items-center justify-center text-text-muted">
                        <div className="w-12 h-12 bg-bg-secondary rounded-full flex items-center justify-center mb-3 text-text-secondary">
                          <Upload size={24} />
                        </div>
                        <p className="text-sm font-medium text-text-primary mb-1">Click hoặc Kéo thả ảnh vào đây</p>
                        <p className="text-xs">PNG, JPG, WEBP (Tối đa 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Fields */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-primary">Tên tác phẩm <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Nhập tên tác phẩm..."
                      className="w-full bg-bg-surface border border-border-custom rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand"
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-primary">Thể loại / Nhãn <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="VD: Đi nét, Background, Nhân vật..."
                      className="w-full bg-bg-surface border border-border-custom rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-border-custom flex items-center justify-end gap-3 bg-bg-secondary shrink-0">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary bg-transparent border border-transparent hover:bg-bg-surface rounded-lg transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                form="add-portfolio-form"
                disabled={isSubmitting || !file || !title || !category}
                className="flex items-center gap-2 px-5 py-2 bg-brand hover:bg-brand-hover text-white rounded-lg text-sm font-medium transition-colors border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Tải lên
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
