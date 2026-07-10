import { useMemo, useState } from 'react';
import { Search, Eye, Star, UserPlus } from 'lucide-react';
import { fixMojibake } from '../../../utils/fixMojibake';
import { usePagination } from '../../../hooks/usePagination';
import { useBrowseAssistants } from '../../series/hooks/useBrowseAssistants';
import type { AssistantBrowseItem } from '../../series/types/assistantBrowse.types';
import { splitTags } from '../../series/utils/assistantInvite.utils';
import { AssistantSystemDetailModal } from './AssistantSystemDetailModal';
import { InviteConfirmPopover } from './InviteConfirmPopover';
import { ListTableShell, tableCellClass, tableHeadClass, tableRowClass } from './ListTableShell';

export const SystemAssistantDirectory = () => {
  const [search, setSearch] = useState('');
  const [detailAssistant, setDetailAssistant] = useState<AssistantBrowseItem | null>(null);
  const [inviteTarget, setInviteTarget] = useState<AssistantBrowseItem | null>(null);

  const { data: assistants = [], isLoading } = useBrowseAssistants();

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return assistants;
    return assistants.filter((a) => {
      const text = `${fixMojibake(a.fullName)} ${a.email ?? ''} ${fixMojibake(a.specialtyTags)}`.toLowerCase();
      return text.includes(keyword);
    });
  }, [assistants, search]);

  const pagination = usePagination(filtered, { pageSize: 10 });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:max-w-lg">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                pagination.goToPage(1);
              }}
              placeholder="Tìm theo tên, email, kỹ năng..."
              className="w-full pl-10 pr-4 py-2.5 bg-bg-secondary border border-border-custom rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50"
            />
          </div>
        </div>

        <p className="text-sm text-text-muted shrink-0">
          Tổng <strong className="text-text-primary">{assistants.length}</strong> trợ lý
        </p>
      </div>

      <ListTableShell
        isLoading={isLoading}
        isEmpty={!isLoading && pagination.paginatedData.length === 0}
        emptyMessage="Không tìm thấy trợ lý phù hợp"
        colSpan={7}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        startItem={pagination.startItem}
        endItem={pagination.endItem}
        onPageChange={pagination.goToPage}
        itemLabel="trợ lý"
      >
        <thead className="sticky top-0 z-10">
          <tr>
            <th className={tableHeadClass}>Họ tên</th>
            <th className={`${tableHeadClass} hidden md:table-cell`}>Email</th>
            <th className={`${tableHeadClass} hidden lg:table-cell`}>Kỹ năng</th>
            <th className={tableHeadClass}>Điểm</th>
            <th className={`${tableHeadClass} hidden sm:table-cell`}>Đúng hạn</th>
            <th className={`${tableHeadClass} hidden sm:table-cell`}>Task</th>
            <th className={`${tableHeadClass} text-right`}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {pagination.paginatedData.map((assistant) => {
            const name = fixMojibake(assistant.fullName);
            const tags = splitTags(fixMojibake(assistant.specialtyTags));

            return (
              <tr key={assistant.id} className={tableRowClass}>
                <td className={`${tableCellClass} font-medium text-text-primary`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="truncate">{name}</span>
                  </div>
                </td>
                <td className={`${tableCellClass} text-text-secondary hidden md:table-cell`}>
                  {assistant.email}
                </td>
                <td className={`${tableCellClass} hidden lg:table-cell`}>
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {tags.length > 0 ? (
                      tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-md text-[11px] bg-brand/10 text-brand">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-text-muted text-xs">—</span>
                    )}
                  </div>
                </td>
                <td className={tableCellClass}>
                  <span className="inline-flex items-center gap-1 text-text-primary">
                    <Star size={13} className="text-warning" />
                    {(assistant.averageRating ?? 0).toFixed(1)}
                  </span>
                </td>
                <td className={`${tableCellClass} text-text-secondary hidden sm:table-cell`}>
                  {(assistant.onTimeRate ?? 0).toFixed(0)}%
                </td>
                <td className={`${tableCellClass} text-text-secondary hidden sm:table-cell`}>
                  {assistant.totalCompletedTasks ?? 0}
                </td>
                <td className={`${tableCellClass} text-right`}>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailAssistant(assistant)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-brand/10 hover:bg-brand/20 text-brand rounded-lg text-xs font-medium border-none cursor-pointer transition-colors"
                    >
                      <Eye size={14} />
                      Chi tiết
                    </button>
                    <button
                      type="button"
                      onClick={() => setInviteTarget(assistant)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border-none transition-colors bg-brand hover:bg-brand-hover text-white cursor-pointer"
                    >
                      <UserPlus size={13} />
                      Mời
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </ListTableShell>

      {detailAssistant && (
        <AssistantSystemDetailModal
          assistant={detailAssistant}
          onClose={() => setDetailAssistant(null)}
        />
      )}

      {inviteTarget && (
        <InviteConfirmPopover
          assistant={inviteTarget}
          onClose={() => setInviteTarget(null)}
        />
      )}
    </div>
  );
};
