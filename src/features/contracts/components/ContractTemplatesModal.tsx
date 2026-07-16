import { useState, useRef, useEffect } from 'react';
import { AnimatedModal } from '../../../components/common/animation';
import {
  X, Plus, ChevronLeft, Trash2, CheckCircle2, AlertTriangle, FileText, Clock, Eye, Sparkles,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Table, Heading1, Heading2, Type
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

const DEFAULT_CONTRACT_TEMPLATE = `
<div style="font-family: 'Times New Roman', Times, serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 30px; color: #000; background-color: #fff;">
  <div style="text-align: center; margin-bottom: 20px;">
    <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>
    <strong>Độc lập - Tự do - Hạnh phúc</strong><br>
    <div style="width: 150px; border-bottom: 1px solid #000; margin: 8px auto 0 auto;"></div>
  </div>

  <h2 style="text-align: center; margin-top: 30px; margin-bottom: 30px; font-size: 20px;">
    <strong>HỢP ĐỒNG HỢP TÁC SẢN XUẤT TRUYỆN TRANH</strong>
  </h2>

  <p style="text-align: center; font-style: italic; margin-bottom: 30px;">
    Số: {{SeriesId}}/HĐ-MPS/{{Year}}
  </p>

  <p>Hôm nay, ngày {{Day}} tháng {{Month}} năm {{Year}}, tại văn phòng Công ty TNHH Manga Publishing System, chúng tôi gồm các bên dưới đây:</p>

  <p><strong>BÊN A: CÔNG TY TNHH MANGA PUBLISHING SYSTEM (ĐƠN VỊ ĐẦU TƯ)</strong></p>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
    <tbody>
      <tr>
        <td style="width: 25%; padding: 4px 0;">Đại diện:</td>
        <td style="padding: 4px 0;">{{PlatformRepresentativeName}}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0;">Chức vụ:</td>
        <td style="padding: 4px 0;">{{PlatformRepresentativeRole}}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0;">Địa chỉ:</td>
        <td style="padding: 4px 0;">{{PlatformAddress}}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0;">Email:</td>
        <td style="padding: 4px 0;">{{PlatformEmail}}</td>
      </tr>
    </tbody>
  </table>

  <p><strong>BÊN B: TÁC GIẢ (MANGAKA)</strong></p>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
    <tbody>
      <tr>
        <td style="width: 25%; padding: 4px 0;">Họ và tên:</td>
        <td style="padding: 4px 0;">{{MangakaFullName}}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0;">Bút danh:</td>
        <td style="padding: 4px 0;">{{MangakaPenName}}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0;">Số CCCD:</td>
        <td style="padding: 4px 0;">{{MangakaCitizenId}}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0;">Ngày cấp:</td>
        <td style="padding: 4px 0;">{{MangakaCitizenIdIssueDate}} tại {{MangakaCitizenIdIssuePlace}}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0;">Số điện thoại:</td>
        <td style="padding: 4px 0;">{{MangakaPhoneNumber}}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0;">Email:</td>
        <td style="padding: 4px 0;">{{MangakaEmail}}</td>
      </tr>
    </tbody>
  </table>

  <p>Sau khi bàn bạc thống nhất, hai bên đồng ý ký kết Hợp đồng hợp tác sản xuất tác phẩm truyện tranh với các điều khoản cụ thể sau đây:</p>

  <p><strong>ĐIỀU 1: NỘI DUNG HỢP TÁC</strong></p>
  <p>Bên B đồng ý hợp tác sản xuất và phát hành độc quyền tác phẩm truyện tranh có thông tin như sau:</p>
  <ul>
    <li><strong>Tên tác phẩm:</strong> {{SeriesTitle}}</li>
    <li><strong>Thể loại:</strong> {{SeriesGenre}}</li>
    <li><strong>Lịch xuất bản:</strong> {{PublicationSchedule}}</li>
  </ul>

  <p><strong>ĐIỀU 2: KINH PHÍ SẢN XUẤT VÀ PHƯƠNG THỨC THANH TOÁN</strong></p>
  <p>1. Tổng kinh phí đầu tư sản xuất được Bên A phê duyệt cấp cho Bên B để thực hiện tác phẩm này là: <strong>{{ApprovedProductionBudget}} VND</strong>. Khoản kinh phí này sẽ được chuyển vào ví quỹ thiết lập sản xuất của Bên B ngay sau khi hợp đồng có hiệu lực.</p>
  <p>2. Đơn giá nhuận bút cơ bản Bên A trả cho Bên B đối với các trang truyện hợp lệ (đã QC đạt chuẩn) là: <strong>{{BasePrice}}</strong>.</p>

  <p><strong>ĐIỀU 3: CHỮ KÝ CỦA CÁC BÊN</strong></p>
  <table style="width: 100%; border-collapse: collapse; margin-top: 30px;">
    <tbody>
      <tr>
        <td style="width: 50%; border: none; text-align: center; font-weight: bold; vertical-align: top; padding: 10px;">
          ĐẠI DIỆN BÊN A
          <div class="signature-note" style="margin-top: 15px; font-weight: normal; color: #6b7280; font-style: italic;">
            (Chưa ký điện tử)
          </div>
        </td>
        <td style="width: 50%; border: none; text-align: center; font-weight: bold; vertical-align: top; padding: 10px;">
          ĐẠI DIỆN BÊN B
          <div class="signature-note" style="margin-top: 15px; font-weight: normal; color: #6b7280; font-style: italic;">
            (Chưa ký điện tử)
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>
`;

export const ContractTemplatesModal = ({ open, onClose }: ContractTemplatesModalProps) => {
  const { data: templates = [], isLoading } = useContractTemplates();
  const createMutation = useCreateTemplate();
  const updateMutation = useUpdateTemplate();
  const deleteMutation = useDeleteTemplate();

  const [viewMode, setViewMode] = useState<'list' | 'create' | 'preview'>('list');
  const [selectedHtml, setSelectedHtml] = useState<string>('');
  const [selectedVersion, setSelectedVersion] = useState<number>(1);
  
  // Editor States
  const [editMode, setEditMode] = useState<'wysiwyg' | 'code'>('wysiwyg');
  const [newContent, setNewContent] = useState<string>(DEFAULT_CONTRACT_TEMPLATE);
  const [newIsActive, setNewIsActive] = useState<boolean>(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync contentEditable innerHTML with state on editMode change
  useEffect(() => {
    if (editMode === 'wysiwyg' && editorRef.current) {
      editorRef.current.innerHTML = newContent;
    }
  }, [editMode, viewMode]);

  const handleCreate = async () => {
    if (!newContent.trim()) {
      toast.error('Nội dung mẫu hợp đồng không được để trống.');
      return;
    }

    try {
      await createMutation.mutateAsync({ content: newContent, isActive: newIsActive });
      toast.success('Tạo mẫu hợp đồng thành công!');
      setViewMode('list');
      setNewContent(DEFAULT_CONTRACT_TEMPLATE);
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

  // Auto-Insert Placeholder at Cursor Position
  const handleInsertPlaceholder = (key: string) => {
    if (editMode === 'code') {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);

      const updatedVal = before + key + after;
      setNewContent(updatedVal);

      // Restore cursor position after state updates
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + key.length, start + key.length);
      }, 50);
      toast.success(`Đã chèn: ${key}`);
    } else {
      // WYSIWYG Insertion using Document Selection API
      if (editorRef.current) {
        editorRef.current.focus();
      }
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(key);
        range.insertNode(textNode);
        
        // Move selection range immediately after the inserted placeholder
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);

        // Sync HTML content state
        if (editorRef.current) {
          setNewContent(editorRef.current.innerHTML);
        }
        toast.success(`Đã chèn: ${key}`);
      } else {
        // Fallback if no selection range
        setNewContent((prev) => prev + key);
        if (editorRef.current) {
          editorRef.current.innerHTML = editorRef.current.innerHTML + key;
        }
        toast.success(`Đã chèn: ${key}`);
      }
    }
  };

  // WYSIWYG command helper
  const executeCommand = (command: string, value: string = '') => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setNewContent(editorRef.current.innerHTML);
    }
  };

  // WYSIWYG Insert Table Template
  const handleInsertTable = () => {
    const tableHtml = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px;">
        <tbody>
          <tr>
            <td style="width: 50%; border: none; text-align: center; font-weight: bold; vertical-align: top; padding: 10px;">
              ĐẠI DIỆN BÊN A
              <div class="signature-note" style="margin-top: 15px; font-weight: normal; color: #6b7280; font-style: italic;">
                (Chưa ký điện tử)
              </div>
            </td>
            <td style="width: 50%; border: none; text-align: center; font-weight: bold; vertical-align: top; padding: 10px;">
              ĐẠI DIỆN BÊN B
              <div class="signature-note" style="margin-top: 15px; font-weight: normal; color: #6b7280; font-style: italic;">
                (Chưa ký điện tử)
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    `;
    
    if (editMode === 'wysiwyg') {
      if (editorRef.current) {
        editorRef.current.focus();
      }
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = tableHtml.trim();
        const tableNode = tempDiv.firstChild;
        if (tableNode) {
          range.insertNode(tableNode);
          range.setStartAfter(tableNode);
          range.setEndAfter(tableNode);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } else {
        setNewContent((prev) => prev + tableHtml);
      }
      
      if (editorRef.current) {
        setNewContent(editorRef.current.innerHTML);
      }
      toast.success('Đã chèn bảng chữ ký mẫu!');
    } else {
      // In Code view, insert raw table HTML
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      setNewContent(before + tableHtml + after);
      toast.success('Đã chèn mã HTML bảng chữ ký!');
    }
  };

  return (
    <AnimatedModal
      open={open}
      onClose={onClose}
      panelClassName="relative bg-bg-secondary border border-border-custom rounded-2xl shadow-lg-custom w-[96vw] mx-auto my-4 max-h-[92vh] flex flex-col overflow-hidden max-w-[1520px]"
    >
      <style>{`
        .a4-landscape-editor table {
          width: 100% !important;
          max-width: 100% !important;
          table-layout: fixed !important;
        }
        .a4-landscape-editor img {
          max-width: 100% !important;
        }
        .a4-landscape-editor p, .a4-landscape-editor div, .a4-landscape-editor span, .a4-landscape-editor td, .a4-landscape-editor li, .a4-landscape-editor h1, .a4-landscape-editor h2, .a4-landscape-editor h3 {
          word-break: break-word !important;
          overflow-wrap: break-word !important;
          white-space: pre-wrap !important;
        }
      `}</style>
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-custom shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center">
            <FileText size={16} className="text-brand" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary">Quản lý mẫu hợp đồng</h3>
            <p className="text-xs text-text-muted mt-0.5">Soạn thảo trực quan hoặc sửa đổi mã HTML để in PDF hợp đồng</p>
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

      <div className="p-6 overflow-y-auto flex-1">
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
                <div className="border border-border-custom rounded-2xl overflow-hidden bg-bg-surface shrink-0">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] text-left border-collapse">
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
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-primary">Tạo mẫu hợp đồng mới</span>
                </div>
              </div>

              {/* Mode Tabs Selector */}
              <div className="flex items-center gap-1 bg-bg-secondary p-1 border border-border-custom rounded-xl w-fit">
                <button
                  type="button"
                  onClick={() => setEditMode('wysiwyg')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium border-none cursor-pointer transition-all ${
                    editMode === 'wysiwyg'
                      ? 'bg-brand/15 text-brand font-semibold shadow-sm'
                      : 'bg-transparent text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Soạn thảo trực quan (WYSIWYG)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Sync content to textarea if needed
                    setEditMode('code');
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium border-none cursor-pointer transition-all ${
                    editMode === 'code'
                      ? 'bg-brand/15 text-brand font-semibold shadow-sm'
                      : 'bg-transparent text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Xem mã HTML (Code View)
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Editor form */}
                <div className="xl:col-span-3 space-y-4">
                  {editMode === 'wysiwyg' ? (
                    /* WYSIWYG Editor Mode */
                    <div className="border border-border-custom rounded-2xl overflow-hidden bg-bg-surface flex flex-col min-h-[460px]">
                      {/* Editor Toolbar */}
                      <div className="flex items-center gap-1 p-2 bg-bg-secondary border-b border-border-custom flex-wrap shrink-0 select-none">
                        <button
                          type="button"
                          onClick={() => executeCommand('bold')}
                          className="p-1.5 hover:bg-bg-surface text-text-secondary hover:text-text-primary rounded-lg border-none bg-transparent cursor-pointer"
                          title="In đậm (Bold)"
                        >
                          <Bold size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => executeCommand('italic')}
                          className="p-1.5 hover:bg-bg-surface text-text-secondary hover:text-text-primary rounded-lg border-none bg-transparent cursor-pointer"
                          title="In nghiêng (Italic)"
                        >
                          <Italic size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => executeCommand('underline')}
                          className="p-1.5 hover:bg-bg-surface text-text-secondary hover:text-text-primary rounded-lg border-none bg-transparent cursor-pointer"
                          title="Gạch chân (Underline)"
                        >
                          <Underline size={15} />
                        </button>

                        <div className="w-px h-5 bg-border-custom mx-1" />

                        <button
                          type="button"
                          onClick={() => executeCommand('formatBlock', 'H1')}
                          className="p-1.5 hover:bg-bg-surface text-text-secondary hover:text-text-primary rounded-lg border-none bg-transparent cursor-pointer"
                          title="Tiêu đề 1"
                        >
                          <Heading1 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => executeCommand('formatBlock', 'H2')}
                          className="p-1.5 hover:bg-bg-surface text-text-secondary hover:text-text-primary rounded-lg border-none bg-transparent cursor-pointer"
                          title="Tiêu đề 2"
                        >
                          <Heading2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => executeCommand('formatBlock', 'P')}
                          className="p-1.5 hover:bg-bg-surface text-text-secondary hover:text-text-primary rounded-lg border-none bg-transparent cursor-pointer"
                          title="Văn bản thường"
                        >
                          <Type size={15} />
                        </button>

                        <div className="w-px h-5 bg-border-custom mx-1" />

                        <button
                          type="button"
                          onClick={() => executeCommand('justifyLeft')}
                          className="p-1.5 hover:bg-bg-surface text-text-secondary hover:text-text-primary rounded-lg border-none bg-transparent cursor-pointer"
                          title="Căn lề trái"
                        >
                          <AlignLeft size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => executeCommand('justifyCenter')}
                          className="p-1.5 hover:bg-bg-surface text-text-secondary hover:text-text-primary rounded-lg border-none bg-transparent cursor-pointer"
                          title="Căn lề giữa"
                        >
                          <AlignCenter size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => executeCommand('justifyRight')}
                          className="p-1.5 hover:bg-bg-surface text-text-secondary hover:text-text-primary rounded-lg border-none bg-transparent cursor-pointer"
                          title="Căn lề phải"
                        >
                          <AlignRight size={15} />
                        </button>

                        <div className="w-px h-5 bg-border-custom mx-1" />

                        <button
                          type="button"
                          onClick={() => executeCommand('insertUnorderedList')}
                          className="p-1.5 hover:bg-bg-surface text-text-secondary hover:text-text-primary rounded-lg border-none bg-transparent cursor-pointer"
                          title="Danh sách không thứ tự"
                        >
                          <List size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => executeCommand('insertOrderedList')}
                          className="p-1.5 hover:bg-bg-surface text-text-secondary hover:text-text-primary rounded-lg border-none bg-transparent cursor-pointer"
                          title="Danh sách số"
                        >
                          <ListOrdered size={15} />
                        </button>

                        <div className="w-px h-5 bg-border-custom mx-1" />

                        <button
                          type="button"
                          onClick={handleInsertTable}
                          className="inline-flex items-center gap-1 px-2 py-1.5 hover:bg-bg-surface text-text-secondary hover:text-brand rounded-lg border-none bg-transparent cursor-pointer text-xs font-semibold"
                          title="Chèn bảng chữ ký"
                        >
                          <Table size={15} className="text-emerald-400" />
                          Chèn bảng chữ ký
                        </button>
                      </div>
                      
                      {/* WYSIWYG Editable Board in horizontal A4 sheet container */}
                      <div className="flex-1 bg-bg-secondary/40 border border-border-custom/50 rounded-xl p-4 overflow-auto min-h-[460px] max-h-[600px]">
                        <div
                          ref={editorRef}
                          contentEditable
                          onInput={(e) => setNewContent(e.currentTarget.innerHTML)}
                          className="outline-none shadow-md border border-border-custom bg-white text-black select-text a4-landscape-editor mx-auto block"
                          style={{
                            width: '297mm',
                            maxWidth: '297mm',
                            minHeight: '210mm',
                            paddingTop: '20mm',
                            paddingRight: '20mm',
                            paddingBottom: '20mm',
                            paddingLeft: '30mm',
                            boxSizing: 'border-box',
                            fontFamily: 'Times New Roman, Georgia, serif',
                            fontSize: '15px',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word'
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    /* HTML Code Editor Mode */
                    <div className="space-y-1.5">
                      <textarea
                        ref={textareaRef}
                        rows={20}
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="Nhập mã nguồn HTML thô tại đây..."
                        className="w-full p-4 bg-bg-surface border border-border-custom rounded-2xl text-xs font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 transition-colors resize-none leading-relaxed min-h-[460px]"
                      />
                      <button
                        type="button"
                        onClick={handleInsertTable}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-secondary hover:bg-bg-surface text-text-secondary hover:text-brand border border-border-custom rounded-xl cursor-pointer text-xs font-medium"
                      >
                        <Table size={13} className="text-emerald-400" />
                        Chèn mã bảng chữ ký mẫu
                      </button>
                    </div>
                  )}

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
                      Tự động chèn từ khóa
                    </h4>
                    <p className="text-[11px] text-text-secondary leading-relaxed">
                      Đặt con trỏ chuột vào vị trí cần chèn trong ô soạn thảo, sau đó **nhấn vào từ khóa màu tím bên dưới**. Biến sẽ tự động được gán vào đúng vị trí đó!
                    </p>
                  </div>

                  <div className="border border-border-custom rounded-2xl bg-bg-surface overflow-hidden">
                    <div className="px-4 py-3 bg-bg-secondary border-b border-border-custom">
                      <h4 className="text-xs font-semibold text-text-primary">Bấm để chèn nhanh từ khóa</h4>
                      <p className="text-[10px] text-text-muted mt-0.5">Biến sẽ tự động dán vào chỗ con trỏ chuột</p>
                    </div>
                    <div className="divide-y divide-border-custom max-h-80 overflow-y-auto">
                      {TEMPLATE_PLACEHOLDERS.map((ph) => (
                        <div
                          key={ph.key}
                          onClick={() => handleInsertPlaceholder(ph.key)}
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
                <div className="bg-bg-secondary/40 p-4 overflow-auto max-h-[550px]">
                  <div 
                    className="bg-white text-black shadow-md border border-border-custom select-text mx-auto block a4-landscape-editor"
                    style={{
                      width: '297mm',
                      minHeight: '210mm',
                      paddingTop: '20mm',
                      paddingRight: '20mm',
                      paddingBottom: '20mm',
                      paddingLeft: '30mm',
                      boxSizing: 'border-box',
                      fontFamily: 'Times New Roman, Georgia, serif',
                      fontSize: '15px'
                    }}
                  >
                    {selectedHtml ? (
                      <div dangerouslySetInnerHTML={{ __html: selectedHtml }} />
                    ) : (
                      <div className="text-center text-text-muted py-12">Nội dung mẫu rỗng hoặc không tải được.</div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedModal>
  );
};
