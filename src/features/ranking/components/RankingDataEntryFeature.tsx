import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Upload, Loader2, Database } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rankingApi } from '../api/rankingApi';
import type { components } from '../../../api/generated/schema';

type RankingInputRow = {
  key: string;
  seriesId: string;
  voteCount: string;
};

const emptyRow = (): RankingInputRow => ({
  key: crypto.randomUUID(),
  seriesId: '',
  voteCount: '',
});

export const RankingDataEntryFeature = () => {
  const [recordedDate, setRecordedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<RankingInputRow[]>([emptyRow(), emptyRow(), emptyRow()]);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: components['schemas']['CreateRankingsDto']) =>
      rankingApi.submitRankingData(payload),
    onSuccess: () => {
      toast.success('Đã nhập dữ liệu bình chọn thành công!');
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
      setRows([emptyRow(), emptyRow(), emptyRow()]);
    },
    onError: () => toast.error('Nhập dữ liệu thất bại. Vui lòng thử lại.'),
  });

  const updateRow = (key: string, field: 'seriesId' | 'voteCount', value: string) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const removeRow = (key: string) => setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.key !== key)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const records = rows
      .filter((r) => r.seriesId.trim() && r.voteCount.trim())
      .map((r) => ({
        SeriesId: Number(r.seriesId),
        VoteCount: Number(r.voteCount),
      }));

    if (records.length === 0) {
      toast.error('Vui lòng nhập ít nhất 1 dòng SeriesId + VoteCount');
      return;
    }

    if (records.some((r) => Number.isNaN(r.SeriesId!) || Number.isNaN(r.VoteCount!))) {
      toast.error('SeriesId và VoteCount phải là số hợp lệ');
      return;
    }

    mutation.mutate({
      Records: records,
      RecordedDate: new Date(recordedDate).toISOString(),
    });
  };

  const handleCsvImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const parsed: RankingInputRow[] = lines.map((line) => {
        const [seriesId, voteCount] = line.split(/[,;\t]/).map((s) => s.trim());
        return { key: crypto.randomUUID(), seriesId: seriesId || '', voteCount: voteCount || '' };
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
    <div className="animate-fade-in space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <Database size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="page-header__title">Nhập liệu Ranking (F4.4)</h1>
            <p className="page-header__subtitle">Board nhập số phiếu bình chọn độc giả theo Series</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-bg-secondary border border-border-custom rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Ngày ghi nhận</label>
            <input
              type="date"
              value={recordedDate}
              onChange={(e) => setRecordedDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary"
            />
          </div>
          <label className="inline-flex items-center gap-2 px-4 py-2.5 border border-border-custom rounded-xl text-sm text-text-secondary hover:bg-bg-surface cursor-pointer">
            <Upload size={16} />
            Import CSV
            <input
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleCsvImport(e.target.files[0])}
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-text-muted border-b border-border-custom">
                <th className="pb-3 pr-4">Series ID</th>
                <th className="pb-3 pr-4">Vote Count</th>
                <th className="pb-3 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom">
              {rows.map((row) => (
                <tr key={row.key}>
                  <td className="py-3 pr-4">
                    <input
                      type="number"
                      value={row.seriesId}
                      onChange={(e) => updateRow(row.key, 'seriesId', e.target.value)}
                      placeholder="VD: 12"
                      className="w-full px-3 py-2 bg-bg-surface border border-border-custom rounded-lg text-text-primary"
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <input
                      type="number"
                      min={0}
                      value={row.voteCount}
                      onChange={(e) => updateRow(row.key, 'voteCount', e.target.value)}
                      placeholder="VD: 1500"
                      className="w-full px-3 py-2 bg-bg-surface border border-border-custom rounded-lg text-text-primary"
                    />
                  </td>
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => removeRow(row.key)}
                      className="p-2 text-text-muted hover:text-danger border-none bg-transparent cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border-custom rounded-xl text-sm text-text-secondary hover:bg-bg-surface border-none cursor-pointer"
          >
            <Plus size={16} />
            Thêm dòng
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-sm font-medium border-none cursor-pointer disabled:opacity-50"
          >
            {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : null}
            Gửi dữ liệu Ranking
          </button>
        </div>

        <p className="text-[11px] text-text-muted">
          CSV format: <code>SeriesId,VoteCount</code> mỗi dòng. API: <code>POST /api/rankings</code>
        </p>
      </form>
    </div>
  );
};
