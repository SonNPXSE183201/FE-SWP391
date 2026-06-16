// Legacy BoardVotingFeature — replaced by src/features/voting/components/VotingFeature.tsx
// This file is kept for backward compatibility but redirects to the new VotingFeature.

import { Vote } from 'lucide-react';
import { PageScaffold } from '../../../components/common/PageScaffold';

export const BoardVotingFeature = () => {
  return (
    <PageScaffold title="Board Voting" subtitle="Trang này đã được chuyển sang module Voting mới" icon={Vote}>
      <div className="text-center py-10 text-text-muted">
        <p>Vui lòng truy cập <strong>/board/voting</strong> để sử dụng tính năng Voting mới.</p>
      </div>
    </PageScaffold>
  );
};
