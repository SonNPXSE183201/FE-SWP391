import { useState } from 'react';
import { generateUUID } from '../../../utils/uuid';
import toast from 'react-hot-toast';
import { Plus, Trash2, Upload, Loader2, Database, ListChecks } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rankingApi } from '../api/ranking.api';
import type { components } from '../../../api/generated/schema';
import { useSeriesList } from '../../series';
import { CustomDatePicker } from '../../../components/common/CustomDatePicker';
import { CustomSelect } from '../../../components/common/CustomSelect';
import { HelpTip } from '../../../components/common/HelpTip';
import {
  MotionTableRow,
  containerVariants,
  listItemVariants,
} from '../../../components/common/animation';
import { motion } from 'framer-motion';

type RankingInputRow = {
  key: string;
  seriesId: string;
  voteCount: string;
};

const emptyRow = (): RankingInputRow => ({
  key: generateUUID(),
  seriesId: '',
  voteCount: '',
});

export const RankingDataEntryFeature = () => {
  const [recordedDate, setRecordedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<RankingInputRow[]>([emptyRow(), emptyRow(), emptyRow()]);
  const queryClient = useQueryClient();

  // UX Improvement: Only fetch series that are "In Production"
  const { data: seriesList = [] } = useSeriesList({ pageSize: 1000, status: 'In Production' });
  const seriesOptions = seriesList.map((s) => ({
    value: s.id?.toString() || '',
    label: `#${s.id} - ${s.title || 'Không có tựa đề'}`, // UX Improvement: Show ID to match with CSV easily
  }));

  const mutation = useMutation({
    mutationFn: (payload: components['schemas']['CreateRankingsDto']) =>
      rankingApi.submitRankingData(payload),
    onSuccess: () => {
      toast.success('Đã nhập dữ liệu bình chọn thành công!');
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
      setRows([emptyRow(), emptyRow(), emptyRow()]);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Nhập dữ liệu thất bại. Vui lòng thử lại.';
      toast.error(message);
    },
  });

  const updateRow = (key: string, field: 'seriesId' | 'voteCount', value: string) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const removeRow = (key: string) => setRows((prev) => prev.filter((r) => r.key !== key));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const records = rows
      .filter((r) => r.seriesId.trim() && r.voteCount.trim())
      .map((r) => ({
        seriesId: Number(r.seriesId),
        voteCount: Number(r.voteCount),
      }));

    if (records.length === 0) {
      toast.error('Vui lòng nhập ít nhất 1 dòng SeriesId + VoteCount');
      return;
    }

    if (records.some((r) => Number.isNaN(r.seriesId!) || Number.isNaN(r.voteCount!))) {
      toast.error('SeriesId và VoteCount phải là số hợp lệ');
      return;
    }

    mutation.mutate({
      records,
      recordedDate: new Date(recordedDate).toISOString(),
    });
  };

  const handleCsvImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const parsed: RankingInputRow[] = lines.map((line) => {
        const [seriesId, voteCount] = line.split(/[,;\t]/).map((s) => s.trim());
        return { key: generateUUID(), seriesId: seriesId || '', voteCount: voteCount || '' };
      });
      if (parsed.length === 0) {
        toast.error('File CSV trống hoặc không đúng định dạng');
        return;
      }
      setRows(parsed);
      toast.success(`Đã import ${parsed.length} dòng`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 w-full">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center border border-brand/10 shadow-sm">
            <ListChecks size={24} className="text-brand" />
          </div>
          <div>
            <h1 className="page-header__title text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-text-secondary">Nhập liệu Bảng xếp hạng</h1>
            <p className="page-header__subtitle text-sm text-text-muted mt-1">Hội đồng nhập số phiếu bình chọn của độc giả theo từng Bộ truyện</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-bg-secondary border border-border-custom rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 pb-4 border-b border-border-custom">
          <div className="w-full max-w-[280px]">
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-semibold text-text-primary">Ngày ghi nhận</label>
              <HelpTip content="Ngày chốt số lượng phiếu bình chọn để đưa lên Bảng xếp hạng" />
            </div>
            <CustomDatePicker
              value={recordedDate}
              onChange={setRecordedDate}
              className="w-full"
            />
          </div>
          <label className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm font-medium text-text-primary hover:bg-brand/5 hover:text-brand hover:border-brand/30 cursor-pointer transition-all shadow-sm group">
            <Upload size={18} className="text-text-muted group-hover:text-brand transition-colors" />
            Nhập từ tệp CSV
            <input
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleCsvImport(e.target.files[0])}
            />
          </label>
        </div>

        <div className="overflow-hidden border border-border-custom rounded-xl bg-bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-secondary text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                <th className="py-3 px-4 w-1/2">
                  <div className="flex items-center gap-2">
                    Bộ truyện
                    <HelpTip content="Chỉ hiển thị các bộ truyện đang xuất bản. Bạn có thể chọn truyện từ danh sách hoặc nhập bằng CSV (Cột SeriesId)" />
                  </div>
                </th>
                <th className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    Số lượng phiếu
                    <HelpTip content="Số lượng phiếu bầu được ghi nhận cho bộ truyện này" />
                  </div>
                </th>
                <th className="py-3 px-4 w-16 text-center">Xóa</th>
              </tr>
            </thead>
            <motion.tbody
              className="divide-y divide-border-custom"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-text-muted">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-bg-secondary flex items-center justify-center">
                        <Database size={24} className="opacity-40" />
                      </div>
                      <p>Chưa có dòng dữ liệu nào.<br/>Hãy thêm mới hoặc import từ file CSV.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <MotionTableRow
                    key={row.key}
                    variants={listItemVariants}
                    className="group hover:bg-bg-secondary/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <CustomSelect
                        options={seriesOptions}
                        value={row.seriesId}
                        onChange={(value) => updateRow(row.key, 'seriesId', value)}
                        placeholder="Chọn bộ truyện..."
                        maxHeight="170px"
                        className="w-full"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min={0}
                        value={row.voteCount}
                        onChange={(e) => updateRow(row.key, 'voteCount', e.target.value)}
                        placeholder="VD: 1500"
                        className="w-full px-4 py-2.5 bg-bg-secondary border border-border-custom focus:border-brand focus:ring-1 focus:ring-brand rounded-xl text-text-primary outline-none transition-all"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(row.key)}
                        className="p-2 text-text-muted hover:text-white hover:bg-danger/80 border-none bg-transparent rounded-lg cursor-pointer transition-colors"
                        title="Xóa dòng"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </MotionTableRow>
                ))
              )}
            </motion.tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={addRow}
          className="w-full py-3 border-2 border-dashed border-border-custom hover:border-brand/40 hover:bg-brand/5 hover:text-brand rounded-xl text-sm font-medium text-text-secondary transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Thêm dòng nhập liệu
        </button>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={mutation.isPending || rows.length === 0}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-hover text-white rounded-xl text-sm font-semibold border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand/20 hover:shadow-brand/40"
          >
            {mutation.isPending ? <Loader2 size={18} className="animate-spin" /> : null}
            Xác nhận & Gửi dữ liệu Bảng xếp hạng
          </button>
        </div>
      </form>
    </div>
  );
};

