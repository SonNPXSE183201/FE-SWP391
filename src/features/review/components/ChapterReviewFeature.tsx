import { useState } from 'react';
import { ReviewQueue } from './ReviewQueue';
import { ChapterQCReview } from './ChapterQCReview';

export const ChapterReviewFeature = () => {
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

  if (activeChapterId) {
    return (
      <ChapterQCReview
        chapterId={activeChapterId}
        onBack={() => setActiveChapterId(null)}
      />
    );
  }

  return <ReviewQueue onSelect={setActiveChapterId} />;
};
