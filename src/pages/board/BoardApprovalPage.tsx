import { Navigate } from 'react-router-dom';

/** @deprecated Dùng /board/voting — BE không có /api/approvals */
export const BoardApprovalPage = () => {
  return <Navigate to="/board/voting" replace />;
};
