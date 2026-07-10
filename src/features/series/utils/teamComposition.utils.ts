import { fixMojibake } from '../../../utils/fixMojibake';
import { TEAM_ROLE_DEFINITIONS, TEAM_ROLES, type TeamRole } from '../constants/teamRoles';

export type TeamRoleStatus = 'filled' | 'pending' | 'missing';

export interface RoleMember {
  assistantId: number;
  assistantName: string | null;
  status: string;
}

export interface TeamRoleCompositionItem {
  role: TeamRole;
  description: string;
  criteria: string;
  status: TeamRoleStatus;
  memberNames: string[];
  pendingCount: number;
  roleMembers: RoleMember[];
}

export interface TeamCompositionSummary {
  items: TeamRoleCompositionItem[];
  filledCount: number;
  totalRoles: number;
  isComplete: boolean;
  suggestedInviteRole: TeamRole;
  nextMissingRole: TeamRole | null;
}

interface TeamMemberLike {
  assistantId?: number;
  roleInTeam?: string | null;
  status?: string | null;
  assistantName?: string | null;
}

const normalizeRole = (role: string) => fixMojibake(role).trim();

export const getTeamComposition = (members: TeamMemberLike[]): TeamCompositionSummary => {
  const items: TeamRoleCompositionItem[] = TEAM_ROLE_DEFINITIONS.map((def) => {
    const roleMembers = members.filter(
      (m) => {
        if ((m.status ?? '') === 'Removed') return false;
        const roles = (m.roleInTeam ?? '').split(',').map(normalizeRole);
        return roles.includes(def.role);
      }
    );
    const active = roleMembers.filter((m) => (m.status ?? '') === 'Active');
    const pending = roleMembers.filter((m) => (m.status ?? '') === 'Pending');

    let status: TeamRoleStatus = 'missing';
    if (active.length > 0) status = 'filled';
    else if (pending.length > 0) status = 'pending';

    return {
      role: def.role,
      description: def.description,
      criteria: def.criteria,
      status,
      memberNames: active.map((m) => fixMojibake(m.assistantName) || '—'),
      pendingCount: pending.length,
      roleMembers: roleMembers.map((m) => ({
        assistantId: m.assistantId ?? 0,
        assistantName: fixMojibake(m.assistantName),
        status: m.status ?? '',
      })),
    };
  });

  const filledCount = items.filter((i) => i.status === 'filled').length;
  const nextMissingRole = items.find((i) => i.status === 'missing')?.role ?? null;
  const nextPendingRole = items.find((i) => i.status === 'pending')?.role ?? null;

  return {
    items,
    filledCount,
    totalRoles: TEAM_ROLES.length,
    isComplete: filledCount === TEAM_ROLES.length,
    suggestedInviteRole: nextMissingRole ?? nextPendingRole ?? TEAM_ROLES[0],
    nextMissingRole,
  };
};
