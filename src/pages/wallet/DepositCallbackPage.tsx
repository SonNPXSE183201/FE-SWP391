import { DepositCallbackFeature } from '../../features/wallet/components/DepositCallbackFeature';

export const DepositCallbackPage = () => {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="w-full max-w-lg bg-bg-secondary border border-border-custom rounded-2xl shadow-lg-custom p-6">
        <DepositCallbackFeature />
      </div>
    </div>
  );
};
