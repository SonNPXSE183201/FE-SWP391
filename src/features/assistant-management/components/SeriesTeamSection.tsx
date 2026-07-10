import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { BookOpen, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRemoveSeriesTeamMember, useSeriesTeam } from '../../series/hooks/useSeriesTeam';
import { useSeriesDetail } from '../../series/hooks/useSeries';
import { getTeamComposition } from '../../series/utils/teamComposition.utils';
import { TeamRoleTable } from './TeamRoleTable';

interface SeriesTeamSectionProps {
  seriesId: string;
}

export const SeriesTeamSection = ({ seriesId }: SeriesTeamSectionProps) => {
  const { data: series, isLoading: seriesLoading } = useSeriesDetail(seriesId);
  const { data: members = [], isLoading: teamLoading } = useSeriesTeam(seriesId);
  const removeMutation = useRemoveSeriesTeamMember(seriesId);

  const composition = useMemo(() => getTeamComposition(members), [members]);

  const handleRemove = async (assistantId: number, role: string) => {
    try {
      await removeMutation.mutateAsync({ assistantId, roleToRemove: role });
      toast.success('Đã gỡ thành viên khỏi nhóm');
    } catch {
      toast.error('Không gỡ được thành viên');
    }
  };  if (seriesLoading || teamLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={28} className="animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate">
            {series?.title ?? `Series #${seriesId}`}
          </p>
          <p className="text-xs text-text-muted mt-0.5">
            {members.length} thành viên · {composition.filledCount}/{composition.totalRoles} vai trò đã có
          </p>
        </div>
        <Link
          to={`/mangaka/series/${seriesId}`}
          className="inline-flex items-center gap-1 text-xs text-brand hover:text-brand-hover no-underline shrink-0"
        >
          <BookOpen size={13} />
          Về trang series
        </Link>
      </div>

      <TeamRoleTable
        items={composition.items}
        filledCount={composition.filledCount}
        totalRoles={composition.totalRoles}
        onRemoveMember={handleRemove}
      />
    </div>
  );
};
