import { AssistantInvitesFeature } from '../../features/assistant-management/components/AssistantInvitesFeature';
import { PageScaffold } from '../../components/common/PageScaffold';
import { Users } from 'lucide-react';

export const AssistantInvitesPage = () => {
  return (
    <PageScaffold
      title="Lời mời tham gia dự án"
      subtitle="Quản lý các lời mời tham gia nhóm dự án do Mangaka gửi đến bạn."
      icon={Users}
    >
      <div className="mt-6">
        <AssistantInvitesFeature />
      </div>
    </PageScaffold>
  );
};
