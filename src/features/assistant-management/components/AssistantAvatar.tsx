import { useState } from 'react';
import { resolveMediaUrl } from '../../../utils/resolveMediaUrl';
import { getInitials } from '../../series/utils/assistantInvite.utils';

const ASSISTANT_AVATAR_GRADIENT = 'from-emerald-400 via-emerald-500 to-teal-600';

interface AssistantAvatarProps {
  name?: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'w-9 h-9 text-xs rounded-lg',
  md: 'w-12 h-12 text-sm rounded-xl',
  lg: 'w-20 h-20 text-xl rounded-2xl',
  xl: 'w-24 h-24 text-2xl rounded-2xl',
};

export const AssistantAvatar = ({
  name,
  avatarUrl,
  size = 'md',
  className = '',
}: AssistantAvatarProps) => {
  const [imgError, setImgError] = useState(false);
  const resolvedUrl = avatarUrl ? resolveMediaUrl(avatarUrl) : '';
  const showImage = resolvedUrl && !imgError;

  return (
    <div
      className={`${sizeMap[size]} shrink-0 overflow-hidden border-2 border-bg-secondary shadow-lg ring-1 ring-white/10 flex items-center justify-center font-bold text-white bg-gradient-to-br ${ASSISTANT_AVATAR_GRADIENT} ${className}`}
    >
      {showImage ? (
        <img
          src={resolvedUrl}
          alt={name || 'Avatar'}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        getInitials(name)
      )}
    </div>
  );
};
