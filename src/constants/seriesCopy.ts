/** Thuật ngữ thống nhất — ngân sách / cấp vốn cho bản phác thảo truyện. */

export const NEMU_BUDGET_LABEL = 'Ngân sách bản phác thảo';
export const NEMU_BUDGET_LABEL_SHORT = 'Ngân sách đề xuất';
export const NEMU_BUDGET_HINT =
  'Số tiền đề xuất để hoàn thiện file bản phác thảo. Hội đồng quyết định mức cấp vốn thực tế khi biểu quyết.';
export const NEMU_BUDGET_REQUIRED = 'Ngân sách bản phác thảo là bắt buộc';
export const NEMU_MANUSCRIPT_LABEL = 'Bản phác thảo truyện';
export const NEMU_MANUSCRIPT_UPLOAD_HINT =
  'Tải lên file bản phác thảo (PDF). Lưu trên hệ thống trước khi gửi xét duyệt.';
export const NEMU_FUNDING_LABEL = 'Vốn sản xuất cấp phát';

export const CREATE_SERIES_WORKFLOW_HELP = [
  'Bước 1: Lưu hồ sơ bản nháp kèm thông tin series và ngân sách đề xuất.',
  'Bước 2: Trên trang chi tiết, tải lên file bản phác thảo (PDF).',
  'Bước 3: Gửi xét duyệt → Biên tập viên thẩm định → Hội đồng biểu quyết cấp vốn.',
] as const;

export const GENRE_PICKER_HELP = [
  'Chọn ít nhất một thể loại; có thể chọn nhiều (ví dụ: Nam thiếu niên + Hành động + Kỳ ảo).',
  'Đối tượng độc giả: phân loại theo độ tuổi và giới tính mục tiêu.',
  'Chủ đề và bối cảnh: nội dung và không gian câu chuyện.',
] as const;

export const NEMU_BUDGET_HELP = [
  'Mức bạn nhập chỉ là đề xuất — không phải số tiền chắc chắn được cấp.',
  'Hội đồng biên tập quyết định ngân sách thực tế khi biểu quyết; có thể cao hoặc thấp hơn đề xuất.',
  'Vốn chỉ chuyển vào ví sau khi hợp đồng được lập và bạn xác nhận ký kết.',
  'Dùng các mức gợi ý số tiền đầy đủ để chọn nhanh, hoặc nhập số tùy chỉnh.',
] as const;

export const MANGAKA_ROLE_LABEL = 'Tác giả manga';
export const MANGAKA_PROPOSED_LABEL = 'Tác giả đề xuất';
export const BOARD_LABEL = 'Hội đồng biên tập';
export const SERIES_DRAFT_STATUS_LABEL = 'Bản nháp';
export const SUBMIT_FOR_REVIEW_LABEL = 'Gửi xét duyệt';
export const BUDGET_BOARD_SUBTITLE = 'Đề xuất · Hội đồng quyết định mức cấp vốn thực tế';
export const CREATE_SERIES_DRAFT_NOTE =
  'Series được lưu ở trạng thái Bản nháp — chưa gửi Hội đồng cho đến khi bạn nộp xét duyệt.';
export const PREVIEW_WAIT_BOARD_LABEL = 'Chờ Hội đồng duyệt';
export const PREVIEW_AFTER_CREATE_HINT =
  'Sau khi tạo, bạn có thể tải lên bản phác thảo và gửi xét duyệt.';
export const COVER_UPLOAD_LABEL = 'tải lên ảnh bìa';
export const MANUSCRIPT_UPLOADING_LABEL = 'Đang tải lên và lưu bản phác thảo…';
export const MANUSCRIPT_DROP_HINT = 'Kéo thả hoặc bấm để chọn file PDF';

export const MANGAKA_RESUBMIT_NOTE_LABEL = 'Ghi chú gửi Biên tập viên';
export const MANGAKA_RESUBMIT_NOTE_HINT =
  'Giải thích thay đổi (ví dụ: lý do chấp nhận hoặc điều chỉnh ngân sách). Biên tập viên sẽ đọc trước khi xét duyệt lại.';
export const MANGAKA_RESUBMIT_NOTE_PLACEHOLDER =
  'Ví dụ: Tôi đồng ý mức ngân sách 2.200.000 đ vì phù hợp phạm vi bản phác thảo hiện tại…';
