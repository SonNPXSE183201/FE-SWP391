import { useState } from 'react';
import { AnimatedModal } from '../../../components/common/animation';
import {
  X, Plus, ChevronLeft, Trash2, CheckCircle2, AlertTriangle, FileText, Code, Clock, Eye, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useContractTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate
} from '../hooks/useContract';
import { motion, AnimatePresence } from 'framer-motion';

interface ContractTemplatesModalProps {
  open: boolean;
  onClose: () => void;
}

const TEMPLATE_PLACEHOLDERS = [
  { key: '{{MangakaFullName}}', desc: 'Họ tên thật của tác giả' },
  { key: '{{MangakaPenName}}', desc: 'Bút danh của tác giả' },
  { key: '{{MangakaCitizenId}}', desc: 'Số CCCD/Hộ chiếu' },
  { key: '{{MangakaCitizenIdIssueDate}}', desc: 'Ngày cấp CCCD' },
  { key: '{{MangakaCitizenIdIssuePlace}}', desc: 'Nơi cấp CCCD' },
  { key: '{{MangakaEmail}}', desc: 'Email liên hệ của tác giả' },
  { key: '{{MangakaPhoneNumber}}', desc: 'Số điện thoại của tác giả' },
  { key: '{{SeriesTitle}}', desc: 'Tên bộ truyện' },
  { key: '{{SeriesGenre}}', desc: 'Thể loại bộ truyện' },
  { key: '{{PublicationSchedule}}', desc: 'Lịch đăng truyện chính thức' },
  { key: '{{BaseGenkouryoPrice}}', desc: 'Đơn giá nhuận bút (số)' },
  { key: '{{BasePrice}}', desc: 'Đơn giá nhuận bút kèm đơn vị VND' },
  { key: '{{ApprovedProductionBudget}}', desc: 'Ngân sách cấp vốn sản xuất' },
  { key: '{{ExpirationDate}}', desc: 'Hạn cuối ký hợp đồng' },
  { key: '{{Date}}', desc: 'Ngày ký hợp đồng hiện tại (dd/MM/yyyy)' },
  { key: '{{Day}}', desc: 'Ngày ký hiện tại (dd)' },
  { key: '{{Month}}', desc: 'Tháng ký hiện tại (MM)' },
  { key: '{{Year}}', desc: 'Năm ký hiện tại (yyyy)' },
];

export const ContractTemplatesModal = ({ open, onClose }: ContractTemplatesModalProps) => {
  const { data: templates = [], isLoading } = useContractTemplates();
  const createMutation = useCreateTemplate();
  const updateMutation = useUpdateTemplate();
  const deleteMutation = useDeleteTemplate();

  const [viewMode, setViewMode] = useState<'list' | 'create' | 'preview'>('list');
  const [selectedHtml, setSelectedHtml] = useState<string>('');
  const [selectedVersion, setSelectedVersion] = useState<number>(1);
  const [newContent, setNewContent] = useState<string>('');
  const [newIsActive, setNewIsActive] = useState<boolean>(true);

  const handleCreate = async () => {
    if (!newContent.trim()) {
      toast.error('Nội dung mẫu hợp đồng không được để trống.');
      return;
    }

    try {
      await createMutation.mutateAsync({ content: newContent, isActive: newIsActive });
      toast.success('Tạo mẫu hợp đồng thành công!');
      setViewMode('list');
      setNewContent('');
      setNewIsActive(true);
    } catch {
      toast.error('Có lỗi xảy ra khi tạo mẫu hợp đồng.');
    }
  };

  const handleActivate = async (id: number, content: string) => {
    try {
      await updateMutation.mutateAsync({ id, content, isActive: true });
      toast.success('Đã kích hoạt mẫu hợp đồng thành công!');
    } catch {
      toast.error('Không thể kích hoạt mẫu hợp đồng.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mẫu hợp đồng này không? Thao tác này không thể hoàn tác.')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Đã xóa mẫu hợp đồng thành công!');
    } catch {
      toast.error('Không thể xóa mẫu hợp đồng.');
    }
  };

  return (
    <AnimatedModal
      open={open}
      onClose={onClose}
      panelClassName="relative bg-bg-secondary border border-border-custom rounded-2xl shadow-lg-custom w-full max-w-4xl"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-custom">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center">
            <FileText size={16} className="text-brand" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary">Quản lý mẫu hợp đồng</h3>
            <p className="text-xs text-text-muted mt-0.5">Thiết lập mẫu cấu trúc HTML để xuất PDF hợp đồng</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface border-none bg-transparent cursor-pointer transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {viewMode === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-muted font-medium">
                  Tổng số: {templates.length} mẫu hợp đồng
                </span>
                <button
                  type="button"
                  onClick={() => setViewMode('create')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand hover:bg-brand-hover text-white text-xs font-semibold rounded-xl border-none cursor-pointer shadow-brand transition-colors"
                >
                  <Plus size={14} />
                  Tạo mẫu mới
                </button>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-muted">
                  <Clock className="animate-spin text-brand" size={32} />
                  <span className="text-sm">Đang tải danh sách mẫu...</span>
                </div>
              ) : templates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border-custom rounded-2xl bg-bg-surface gap-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary">Chưa có mẫu hợp đồng nào</h4>
                    <p className="text-xs text-text-muted mt-1 max-w-xs leading-relaxed">
                      Hãy bắt đầu bằng việc tạo mẫu hợp đồng mới có định dạng HTML để gán vào các dự án.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border border-border-custom rounded-2xl overflow-hidden bg-bg-surface">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-bg-secondary text-text-secondary text-xs font-medium border-b border-border-custom">
                        <th className="px-5 py-3.5">Phiên bản</th>
                        <th className="px-5 py-3.5">Trạng thái</th>
                        <th className="px-5 py-3.5">Ngày tạo</th>
                        <th className="px-5 py-3.5 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-custom">
                      {templates.map((t) => (
                        <tr key={t.id} className="text-sm hover:bg-bg-secondary/50 transition-colors">
                          <td className="px-5 py-4 font-semibold text-text-primary">
                            Mẫu số #{t.version}
                          </td>
                          <td className="px-5 py-4">
                            {t.isActive ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                                <CheckCircle2 size={12} />
                                Đang hoạt động
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-text-muted/10 text-text-muted text-xs font-medium border border-text-muted/10">
                                Không hoạt động
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-xs text-text-secondary">
                            {t.createAt ? new Date(t.createAt).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : '—'}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedHtml(t.content ?? '');
                                  setSelectedVersion(t.version ?? 1);
                                  setViewMode('preview');
                                }}
                                className="p-1.5 hover:bg-bg-surface text-text-secondary hover:text-text-primary rounded-lg border-none bg-transparent cursor-pointer transition-colors"
                                title="Xem trước HTML"
                              >
                                <Eye size={16} />
                              </button>

                              {!t.isActive && (
                                <button
                                  type="button"
                                  onClick={() => handleActivate(t.id!, t.content ?? '')}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg border-none cursor-pointer transition-colors"
                                >
                                  Kích hoạt
                                </button>
                              )}

                              {!t.isActive && (
                                <button
                                  type="button"
                                  onClick={() => handleDelete(t.id!)}
                                  className="p-1.5 hover:bg-danger/10 text-text-muted hover:text-danger rounded-lg border-none bg-transparent cursor-pointer transition-colors"
                                  title="Xóa mẫu"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {viewMode === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              <div className="flex items-center justify-between border-b border-border-custom pb-3">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary bg-transparent border-none cursor-pointer transition-colors"
                >
                  <ChevronLeft size={14} />
                  Quay lại danh sách
                </button>
                <span className="text-sm font-semibold text-text-primary">Tạo mẫu hợp đồng HTML mới</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Editor form */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                      <Code size={14} className="text-brand" />
                      Nội dung HTML của mẫu hợp đồng
                    </label>
                    <textarea
                      rows={18}
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Nhập code HTML ở đây. Bạn phải sử dụng các thẻ div, p, table, class để làm đẹp hợp đồng..."
                      className="w-full p-4 bg-bg-surface border border-border-custom rounded-2xl text-xs font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 transition-colors resize-none leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="newIsActive"
                      checked={newIsActive}
                      onChange={(e) => setNewIsActive(e.target.checked)}
                      className="w-4 h-4 rounded border-border-custom text-brand bg-bg-surface focus:ring-brand cursor-pointer"
                    />
                    <label htmlFor="newIsActive" className="text-xs font-medium text-text-secondary cursor-pointer selection:bg-transparent">
                      Kích hoạt sử dụng ngay (Mẫu cũ sẽ tự động bị tắt)
                    </label>
                  </div>
                </div>

                {/* Info & Placeholders Helper Panel */}
                <div className="space-y-4">
                  <div className="bg-brand/5 border border-brand/20 rounded-2xl p-4 space-y-2">
                    <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5 uppercase tracking-wide">
                      <Sparkles size={14} className="text-brand animate-pulse" />
                      Lưu ý soạn thảo HTML
                    </h4>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Để xuất PDF đẹp và chuẩn kích thước A4, hãy bao bọc nội dung bằng một thẻ container có class cố định, sử dụng inline-style hoặc style blocks.
                    </p>
                    <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                      Chữ ký điện tử:
                    </p>
                    <p className="text-[11px] text-text-muted leading-relaxed">
                      Đặt 2 thẻ div đại diện chữ ký bên A và bên B để hệ thống tự ghi chữ ký:
                      <code className="block mt-1 p-1 bg-bg-surface border border-border-custom rounded text-[10px] text-brand">
                        {`<div class="signature-note">...</div>`}
                      </code>
                    </p>
                  </div>

                  <div className="border border-border-custom rounded-2xl bg-bg-surface overflow-hidden">
                    <div className="px-4 py-3 bg-bg-secondary border-b border-border-custom">
                      <h4 className="text-xs font-semibold text-text-primary">Danh sách từ khóa (Placeholders)</h4>
                      <p className="text-[10px] text-text-muted mt-0.5">Click vào từ khóa để copy nhanh</p>
                    </div>
                    <div className="divide-y divide-border-custom max-h-80 overflow-y-auto">
                      {TEMPLATE_PLACEHOLDERS.map((ph) => (
                        <div
                          key={ph.key}
                          onClick={() => {
                            navigator.clipboard.writeText(ph.key);
                            toast.success(`Đã copy: ${ph.key}`);
                          }}
                          className="px-4 py-2 hover:bg-bg-secondary/40 cursor-pointer flex flex-col gap-0.5 transition-colors group"
                        >
                          <span className="text-xs font-mono font-bold text-brand group-hover:text-brand-hover">
                            {ph.key}
                          </span>
                          <span className="text-[10px] text-text-muted">
                            {ph.desc}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-custom">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="px-4 py-2 border border-border-custom hover:bg-bg-surface text-text-secondary rounded-xl text-xs font-semibold bg-transparent cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand hover:bg-brand-hover text-white text-xs font-semibold rounded-xl border-none cursor-pointer shadow-brand disabled:bg-brand/50 disabled:cursor-not-allowed transition-colors"
                >
                  {createMutation.isPending && <Clock className="animate-spin" size={14} />}
                  Lưu mẫu hợp đồng
                </button>
              </div>
            </motion.div>
          )}

          {viewMode === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border-custom pb-3">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary bg-transparent border-none cursor-pointer transition-colors"
                >
                  <ChevronLeft size={14} />
                  Quay lại danh sách
                </button>
                <span className="text-sm font-semibold text-text-primary">Xem trước HTML mẫu số #{selectedVersion}</span>
              </div>

              <div className="border border-border-custom rounded-2xl bg-bg-surface overflow-hidden">
                <div className="px-4 py-2 bg-bg-secondary border-b border-border-custom text-[11px] text-text-muted flex items-center gap-1">
                  <AlertTriangle size={12} className="text-warning shrink-0" />
                  Đây là giao diện HTML thô. Bản PDF thật khi gửi ký sẽ tự động thay thế toàn bộ từ khóa.
                </div>
                <div className="p-6 max-h-[500px] overflow-y-auto bg-white text-black font-sans leading-relaxed text-sm select-text selection:bg-brand/20">
                  {selectedHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: selectedHtml }} />
                  ) : (
                    <div className="text-center text-text-muted py-12">Nội dung mẫu rỗng hoặc không tải được.</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedModal>
  );
};
