import { TeamRole } from '../../series/constants/teamRoles';

export const BASE_ACCEPTANCE_CRITERIA = `### 1. Kỹ thuật (Technical)
- [ ] File nộp đúng định dạng (PNG trong suốt / PSD...).
- [ ] Độ phân giải đạt chuẩn; không vỡ hạt khi phóng to.
- [ ] Kích thước khớp đúng vùng giao; không lệch, không thừa viền trắng.
- [ ] Nền trong suốt; không che layer gốc bằng nền trắng.
- [ ] Nét sạch, không lem; không còn nét phác thảo thừa.

### 2. Mỹ thuật (Art)
- [ ] Phong cách nét đồng bộ với phần còn lại của trang / bộ truyện.
- [ ] Hướng đổ bóng & nguồn sáng đồng nhất với vùng xung quanh.
- [ ] Bố cục cân đối; không che mất chi tiết quan trọng.

### 3. Nội dung (Content)
- [ ] Vẽ đúng mô tả task Mangaka đã giao.
- [ ] Đúng phạm vi phân vùng; không vẽ thêm / thiếu ngoài brief.
- [ ] Đã sửa hết góp ý từ lần nghiệm thu trước (nếu là bản sửa).`;

export const ACCEPTANCE_CRITERIA_TEMPLATES: Record<TeamRole, string> = {
  'Vẽ nền': `- [ ] Vẽ đúng phạm vi vùng được khoanh và bám sát bố cục sketch.
- [ ] Giữ đúng phối cảnh, đường chân trời và vị trí các công trình.
- [ ] Thể hiện rõ nhà cửa, tháp chuông và đường phố theo phong cách Gothic của Serafeld.
- [ ] Không thay đổi hoặc che khuất nhân vật, khung thoại và chi tiết ngoài vùng giao.
- [ ] Nét sạch, không lem, không còn nét phác thảo thừa.
- [ ] Chi tiết nền vừa phải, không lấn át nhân vật chính.
- [ ] Nền trong suốt, không có viền trắng và không che layer gốc.
- [ ] File đúng kích thước và khớp vị trí khi ghép lại trang.`,
  
  'Kẻ nét': `**TIÊU CHÍ ƯU TIÊN (KẺ NÉT):**\n- [ ] Nét đều, đúng brief, không lệch tỉ lệ.\n- [ ] Đồng bộ độ dày nét nhân vật / đồ vật.\n\n${BASE_ACCEPTANCE_CRITERIA}`,
  
  'Dán tone & Đổ bóng': `**TIÊU CHÍ ƯU TIÊN (DÁN TONE & ĐỔ BÓNG):**\n- [ ] Tone dán đúng vùng, không lem ra ngoài nét.\n- [ ] Đổ bóng tạo khối hợp lý, đồng bộ phong cách trang đen trắng.\n\n${BASE_ACCEPTANCE_CRITERIA}`,
  
  'Tô màu': `**TIÊU CHÍ ƯU TIÊN (TÔ MÀU):**\n- [ ] Màu sạch viền, không tràn (flat color).\n- [ ] Shading nhất quán, VFX màu không che khuất nhân vật chính.\n\n${BASE_ACCEPTANCE_CRITERIA}`,
  
  'Vẽ hiệu ứng': `**TIÊU CHÍ ƯU TIÊN (VẼ HIỆU ỨNG):**\n- [ ] SFX đúng hướng / cảm giác của action.\n- [ ] Speed line hợp lý, hiệu ứng không làm rối khung tranh.\n\n${BASE_ACCEPTANCE_CRITERIA}`,
  
  'Vẽ thoại': `**TIÊU CHÍ ƯU TIÊN (VẼ THOẠI):**\n- [ ] Bong bóng thoại đúng loại, không che nhân vật.\n- [ ] Font chữ đồng bộ, dễ đọc (Narration / Speech).\n\n${BASE_ACCEPTANCE_CRITERIA}`,
  
  'Vẽ đạo cụ': `**TIÊU CHÍ ƯU TIÊN (VẼ ĐẠO CỤ):**\n- [ ] Chi tiết đạo cụ (vũ khí, xe cộ...) vẽ chuẩn tỉ lệ.\n- [ ] Phối cảnh đạo cụ khớp hoàn toàn với khung tranh.\n\n${BASE_ACCEPTANCE_CRITERIA}`,
  
  'Làm sạch nét': `**TIÊU CHÍ ƯU TIÊN (LÀM SẠCH NÉT):**\n- [ ] Bản scan sạch hoàn toàn, không dính hạt / bụi.\n- [ ] Xóa triệt để nét phác thảo.\n- [ ] Nét liền mạch, không bị run hay đứt khúc.\n\n${BASE_ACCEPTANCE_CRITERIA}`,
};
