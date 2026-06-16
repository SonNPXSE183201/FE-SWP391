export const BEAUTIFUL_MOCK_SERIES = [
  {
    id: '1',
    title: 'Huyền Thoại Samurai',
    synopsis: 'Một câu chuyện bi tráng về người võ sĩ đạo cuối cùng chiến đấu chống lại sự cai trị của máy móc ở thời kỳ Edo giả tưởng. Hành trình đẫm máu và nước mắt để tìm lại thanh kiếm linh thiêng đã bị đánh cắp.',
    genre: ['Action', 'Adventure', 'Historical'],
    coverImageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    mangakaName: 'Oda Eiichiro',
    status: 'Active',
    views: 125000,
    votes: 94,
    chapterCount: 24,
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-06-10T10:00:00Z'
  },
  {
    id: '2',
    title: 'Lạc Giữa Ngân Hà',
    synopsis: 'Khi con tàu vũ trụ chở theo 5.000 cư dân cuối cùng của Trái Đất bị hỏng động cơ và trôi dạt vào một hố đen, cơ trưởng trẻ tuổi phải đưa ra những quyết định sinh tử để cứu lấy nhân loại.',
    genre: ['Sci-Fi', 'Mystery', 'Drama'],
    coverImageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    mangakaName: 'Urasawa Naoki',
    status: 'Active',
    views: 98000,
    votes: 88,
    chapterCount: 15,
    createdAt: '2026-02-20T08:00:00Z',
    updatedAt: '2026-06-12T10:00:00Z'
  },
  {
    id: '3',
    title: 'Vườn Hoa Mùa Đông',
    synopsis: 'Câu chuyện tình cảm học đường nhẹ nhàng về một cô gái mù mang trong mình khả năng nhìn thấy cảm xúc của người khác thông qua những bông hoa vô hình mọc ra từ trái tim họ.',
    genre: ['Romance', 'Drama', 'Slice of Life'],
    coverImageUrl: 'https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=600&auto=format&fit=crop&q=80',
    mangakaName: 'Shinkai Makoto',
    status: 'Pending_Approval',
    views: 45000,
    votes: 52,
    chapterCount: 5,
    createdAt: '2026-05-10T08:00:00Z',
    updatedAt: '2026-05-15T10:00:00Z'
  },
  {
    id: '4',
    title: 'Bóng Đêm Đô Thị',
    synopsis: 'Ở thành phố CyberTokyo rực rỡ ánh đèn neon, một thám tử tư với cánh tay máy đang truy lùng một tên sát nhân hàng loạt chỉ nhắm vào những cyborg cao cấp. Sự thật đen tối đằng sau tập đoàn công nghệ lớn nhất thế giới dần được hé lộ.',
    genre: ['Action', 'Thriller', 'Cyberpunk'],
    coverImageUrl: 'https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=600&auto=format&fit=crop&q=80',
    mangakaName: 'Kishimoto Masashi',
    status: 'UnderReview',
    views: 32000,
    votes: 35,
    chapterCount: 8,
    createdAt: '2026-04-05T08:00:00Z',
    updatedAt: '2026-06-01T10:00:00Z'
  },
  {
    id: '5',
    title: 'Thợ Săn Yêu Quái',
    synopsis: 'Những câu chuyện dân gian Nhật Bản về Yêu quái (Yokai) được hiện đại hóa. Nam sinh trung học với con mắt âm dương lập giao ước với một đại yêu quái để bảo vệ gia đình mình.',
    genre: ['Supernatural', 'Action', 'Fantasy'],
    coverImageUrl: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=600&auto=format&fit=crop&q=80',
    mangakaName: 'Akutami Gege',
    status: 'Active',
    views: 215000,
    votes: 450,
    chapterCount: 45,
    createdAt: '2025-11-20T08:00:00Z',
    updatedAt: '2026-06-15T10:00:00Z'
  }
];

export const BEAUTIFUL_MOCK_CHAPTERS = [
  {
    id: 'c1',
    seriesId: '1',
    chapterNumber: 1,
    title: 'Thanh kiếm rỉ sét',
    status: 'Published',
    pageCount: 3,
    createdAt: '2026-01-20T08:00:00Z',
    updatedAt: '2026-01-25T10:00:00Z'
  },
  {
    id: 'c2',
    seriesId: '1',
    chapterNumber: 2,
    title: 'Bóng ma đêm trăng',
    status: 'Pending_Approval',
    pageCount: 2,
    createdAt: '2026-02-01T08:00:00Z',
    updatedAt: '2026-02-05T10:00:00Z'
  }
];

export const BEAUTIFUL_MOCK_PAGES = [
  {
    id: 'p1',
    chapterId: 'c1',
    pageNumber: 1,
    imageUrl: 'https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=800&auto=format&fit=crop&q=80',
    status: 'Approved'
  },
  {
    id: 'p2',
    chapterId: 'c1',
    pageNumber: 2,
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
    status: 'Approved'
  },
  {
    id: 'p3',
    chapterId: 'c1',
    pageNumber: 3,
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
    status: 'Approved'
  }
];
