import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function runScript(scriptName) {
  console.log(`\n=================================================================`);
  console.log(`🚀 BƯỚC: Chạy file ${scriptName}`);
  console.log(`=================================================================\n`);
  
  const result = spawnSync('node', [join(__dirname, scriptName)], { stdio: 'inherit' });
  
  if (result.status !== 0) {
    console.error(`\n❌ THẤT BẠI: Quá trình chạy ${scriptName} bị lỗi (Mã thoát: ${result.status})`);
    console.error(`⚠️  Dừng toàn bộ quá trình Automation Testing!`);
    process.exit(1);
  }
}

console.log("🌟 BẮT ĐẦU QUÁ TRÌNH AUTOMATION & E2E TESTING TỰ ĐỘNG 🌟\n");

// BƯỚC 1: Cập nhật và đồng bộ TypeScript Interfaces từ OpenAPI (Swagger)
// Đảm bảo Frontend luôn dùng Data Types mới nhất từ Backend trước khi test.
runScript('e2e-1-generate-types.mjs');

// BƯỚC 2: Kiểm tra sức khỏe hệ thống (Health Check)
// Ping toàn bộ các API cốt lõi (Login, Wallet, Admin) xem Backend có đang chạy ổn định không.
runScript('e2e-2-api-check.mjs');

// BƯỚC 3: Chạy kịch bản người dùng cuối (End-to-End Flows)
// Tự động mô phỏng các luồng nghiệp vụ phức tạp (Vote, Review, Cấp vốn, Phân xử).
runScript('e2e-3-test-flows.mjs');

console.log("\n✅ TẤT CẢ CÁC BÀI TEST TỰ ĐỘNG ĐÃ VƯỢT QUA THÀNH CÔNG! HỆ THỐNG ĐÃ SẴN SÀNG.");
