/** Thể loại — `value` gửi API/DB, `label` hiển thị tiếng Việt. */

export type GenreDefinition = {
  value: string;
  label: string;
};

export type GenreGroup = {
  id: string;
  label: string;
  hint: string;
  genres: readonly GenreDefinition[];
};

const DEMOGRAPHIC_GENRES: readonly GenreDefinition[] = [
  { value: 'Shōnen', label: 'Nam thiếu niên' },
  { value: 'Shōjo', label: 'Nữ thiếu niên' },
  { value: 'Seinen', label: 'Nam thanh niên' },
  { value: 'Josei', label: 'Nữ thanh niên' },
  { value: 'Kodomo', label: 'Thiếu nhi' },
];

const THEME_GENRES: readonly GenreDefinition[] = [
  { value: 'Action', label: 'Hành động' },
  { value: 'Comedy', label: 'Hài hước' },
  { value: 'Romance', label: 'Lãng mạn' },
  { value: 'Fantasy', label: 'Kỳ ảo' },
  { value: 'Sci-Fi', label: 'Khoa học viễn tưởng' },
  { value: 'Horror', label: 'Kinh dị' },
  { value: 'Mystery', label: 'Bí ẩn' },
  { value: 'Thriller', label: 'Ly kỳ' },
  { value: 'Sports', label: 'Thể thao' },
  { value: 'Historical', label: 'Lịch sử' },
  { value: 'Slice of Life', label: 'Đời thường' },
  { value: 'Mecha', label: 'Cơ giáp' },
  { value: 'Isekai', label: 'Xuyên không' },
];

export const GENRE_GROUPS: readonly GenreGroup[] = [
  {
    id: 'demographic',
    label: 'Đối tượng độc giả',
    hint: 'Phân loại theo độ tuổi và giới tính mục tiêu',
    genres: DEMOGRAPHIC_GENRES,
  },
  {
    id: 'theme',
    label: 'Chủ đề & bối cảnh',
    hint: 'Thể loại nội dung và bối cảnh câu chuyện',
    genres: THEME_GENRES,
  },
];

/** Alias seed / dữ liệu cũ → nhãn Việt */
const GENRE_LABEL_ALIASES: Record<string, string> = {
  Shounen: 'Nam thiếu niên',
  Shoujo: 'Nữ thiếu niên',
  'Phiêu lưu': 'Phiêu lưu',
  Adventure: 'Phiêu lưu',
  Drama: 'Kịch tính',
  Supernatural: 'Siêu nhiên',
  Psychological: 'Tâm lý',
};

const ALL_GENRE_DEFINITIONS = [...DEMOGRAPHIC_GENRES, ...THEME_GENRES];

export const GENRE_LABELS: Record<string, string> = {
  ...Object.fromEntries(ALL_GENRE_DEFINITIONS.map((g) => [g.value, g.label])),
  ...GENRE_LABEL_ALIASES,
};

export const GENRE_OPTIONS = ALL_GENRE_DEFINITIONS.map((g) => g.value);

export const getGenreLabel = (value: string): string =>
  GENRE_LABELS[value.trim()] ?? value.trim();

export const filterGenresByQuery = (query: string): readonly GenreGroup[] => {
  const q = query.trim().toLowerCase();
  if (!q) return GENRE_GROUPS;

  return GENRE_GROUPS.map((group) => ({
    ...group,
    genres: group.genres.filter(
      (g) => g.label.toLowerCase().includes(q) || g.value.toLowerCase().includes(q),
    ),
  })).filter((group) => group.genres.length > 0);
};
