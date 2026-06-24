# Báo Cáo Tiến Độ — Duy Anh (anht876)

> **Repo:** `SonNPXSE183201/FE-SWP391`  
> **Nhánh:** `feature/board-voting-api`  
> **Pull Request:** [#65 — Feature/board voting api](https://github.com/SonNPXSE183201/FE-SWP391/pull/65)  
> **Ngày cập nhật:** 23/06/2026  
> **Gateway:** `http://localhost:5000/api/v1`

---

## 1. Tóm tắt

| Hạng mục | Trạng thái |
|---|---|
| Task được giao (Voting, Ranking, Approval) | **Hoàn thành code** |
| PR đã tạo & push | **#65** — chờ review |
| Merge vào `dev` | **Chưa** — cần approve từ `phucplhse183189` hoặc `SonNPXSE183201` |
| Test thủ công trên local | **Đã test** — list voting + gọi API vote |

**Kết luận:** Phần việc FE của Duy Anh theo `TaskFrontend.md` (mục Voting / Ranking) **đã xong**. Còn lại bước quy trình: **review → merge PR #65**.

---

## 2. Task đã hoàn thành

| ID | Nội dung | Kết quả |
|---|---|---|
| **F-P0-3** | Unmock `voting.api.ts`, sửa path & mapper DTO | ✅ |
| **F-P1-2** | Unmock board vote trong `rankingApi.ts` | ✅ |
| **F-P1-4** | Deprecate `approval.api` → chuyển sang `voting.api` | ✅ |
| **F-DONE** | Ranking data entry F4.4 (tab nhập liệu) | ✅ (PR trước đó) |

---

## 3. Chi tiết thay đổi

### 3.1 Voting — `voting.api.ts` (F-P0-3)

- `USE_MOCK = false`
- `fetchVotingList` → `GET /api/votes/pending`
- Map `SeriesDto` → `VotingSeriesItem` (title, mangaka, genre, budget, …)
- `submitVote` → `POST /api/series/{seriesId}/vote` với `VoteSeriesRequestDto` (`approved`, `comment`, `recommendedBudget`)
- `fetchVotingDetail` → lấy từ list (BE không có `GET /api/votes/{id}`)
- Dev fallback mock chỉ khi API lỗi hoặc list rỗng

### 3.2 Ranking board vote — `rankingApi.ts` (F-P1-2)

- `USE_MOCK_BOARD_VOTE = false`
- `submitRankingVote` → `POST /api/ranking/votes` (`seriesId`, `action`, `comment`)
- Dev fallback khi BE chưa deploy endpoint (404)

### 3.3 Approvals — `approval.api.ts` + route (F-P1-4)

- Bỏ mock `/api/approvals/*` (BE không có)
- Delegate sang `votingApi`: list pending, approve, reject
- `/board/approvals` redirect → `/board/voting`
- Dashboard Board: link ngân sách trỏ `/board/voting`

### 3.4 Hỗ trợ dev / tích hợp (kèm PR)

| File | Mục đích |
|---|---|
| `vite.config.ts` | Proxy `/api`, `/hubs` → Gateway `:5000` (tránh CORS) |
| `.env.example` | `VITE_API_URL` trống khi dev |
| `src/api/axios.ts` | Base URL same-origin qua proxy |
| `src/hooks/useSignalR.ts` | Hub path qua proxy |
| `src/features/tasks/api/task.api.ts` | Extension payload camelCase (`days`, `reason`) |
| `src/features/review/api/review.api.ts` | Fallback danh sách series chờ Editor |

---

## 4. Pull Request #65

**Commits chính (so với `dev`):**

```
f0f9241 feat(board): unmock voting/ranking APIs and deprecate approvals route
0910cdf merge: sync origin/dev into feature/board-voting-api
255a803 feat(voting,review): unmock board vote API and wire QC checklist to approve
```

**13 file thay đổi** — tổng ~300 dòng thêm, ~194 dòng xóa.

**Trạng thái PR:** Open — **Review required** (chờ Phúc hoặc Son approve).

---

## 5. Kết quả test (local)

| Bước | Kết quả |
|---|---|
| Login Board `board.le@mangapublishing.com` / `12345` | ✅ |
| `/board/voting` hiển thị *Học Viện Siêu Nhiên* (data BE) | ✅ |
| `GET /api/votes/pending` → 200 | ✅ |
| `POST /api/series/2/vote` được gọi khi bỏ phiếu | ✅ |
| Vote lần 2 → 403 *"Bạn đã bỏ phiếu..."* | ✅ Đúng logic BE (seed đã có phiếu) |
| `npm run build` (pre-push hook) | ✅ |

**Tài khoản test:** mật khẩu chung seed — `12345`

---

## 6. Định nghĩa hoàn thành (DoD) — phần Duy Anh

| Module | Điều kiện | Trạng thái |
|---|---|---|
| `voting.api.ts` | `GET /votes/pending` + `POST /series/{id}/vote` + mapper | ✅ Code |
| `rankingApi.ts` | Board vote gọi `POST /ranking/votes` | ✅ Code |
| `approval.api.ts` | Không mock; dùng voting | ✅ Code |
| Merge `dev` | PR #65 merged | ⏳ Chờ team |

---

## 7. Việc **không** thuộc phạm vi Duy Anh

Các mục sau nằm trong báo cáo team chung, **không** do Duy Anh phụ trách:

| Việc | Owner |
|---|---|
| Commit ~40 file local (Canvas, Upload, Profile, AcceptFund) | Phúc |
| Fix script `test-week-abc.mjs` (Dispute 404) | Phúc |
| Rebase PR #47, #50 (conflict) | Team / theo phân công |
| BE deploy `POST /api/ranking/votes` | Son / BE |

---

## 8. Việc cần làm tiếp

### Duy Anh

- [ ] Nhắc reviewer approve **PR #65**
- [ ] Sau merge: `git checkout dev && git pull` để đồng bộ

### Reviewer (Phúc / Son)

- [ ] Review & approve PR #65
- [ ] Merge vào nhánh `dev` (không merge thẳng `main` nếu team quy ước flow qua `dev`)

---

## 9. Tiến độ E2E (ước lượng sau khi merge PR #65)

| Luồng | Trước | Sau merge (ước tính) |
|---|---|---|
| **1 — Series & Funding** | ~45–50% (voting mock) | **~85%** |
| **4 — Ranking & Cancel** | ~25–55% (board vote mock) | **~70%** (phụ thuộc BE `ranking/votes`) |

---

*Báo cáo này phản ánh trạng thái sau khi push nhánh `feature/board-voting-api` và mở PR #65 (23/06/2026).*
