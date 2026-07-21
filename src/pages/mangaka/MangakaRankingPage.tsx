import { MangakaRankingFeature } from '../../features/ranking/components/MangakaRankingFeature';

export const MangakaRankingPage = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Bảng xếp hạng</h1>
        <p className="text-sm text-text-muted mt-1">
          Theo dõi thứ hạng các bộ truyện đang phát hành dựa trên đánh giá của độc giả
        </p>
      </div>

      <MangakaRankingFeature />
    </div>
  );
};
