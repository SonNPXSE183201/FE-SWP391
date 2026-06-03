import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { User, Mail, Lock, Briefcase, Tags, Loader2, Image as ImageIcon } from 'lucide-react';
import { authApi } from '../../api/auth.api';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    portfolioUrl: '',
    specialtyTags: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    try {
      setIsLoading(true);
      const tagsArray = formData.specialtyTags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await authApi.registerAssistant({
        userName: formData.userName,
        email: formData.email,
        passwordHash: formData.password,
        fullName: formData.fullName,
        portfolioUrl: formData.portfolioUrl,
        specialtyTags: tagsArray,
      });

      toast.success('Đăng ký thành công! Vui lòng chờ Admin duyệt.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex">
      {/* Left Side - Image Background */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-slate-900 border-r border-slate-800 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent z-10" />
        <img 
          src="/images/assistant_bg.png" 
          alt="Digital Art Workspace" 
          className="absolute inset-0 w-full h-full object-cover object-center opacity-90 transition-transform duration-[20s] hover:scale-110 ease-linear"
        />
        <div className="absolute bottom-16 left-12 right-12 z-20">
          <h2 className="text-5xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
            Manga Studio <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
              Workspace
            </span>
          </h2>
          <p className="text-slate-300 text-lg max-w-md drop-shadow-md">
            Trở thành mảnh ghép quan trọng giúp các Mangaka hàng đầu hoàn thiện những tác phẩm xuất sắc nhất.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center p-8 sm:p-12 xl:px-24 xl:py-12 relative overflow-y-auto max-h-screen custom-scrollbar">
        {/* Background Orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-xl mx-auto relative z-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Tạo tài khoản Assistant
            </h1>
            <p className="text-slate-400">Điền thông tin bên dưới để bắt đầu hành trình của bạn.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* UserName */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Tên đăng nhập</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="userName"
                    required
                    value={formData.userName}
                    onChange={handleChange}
                    className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-xl pl-11 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600 shadow-inner"
                    placeholder="johndoe123"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-xl pl-11 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600 shadow-inner"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Mật khẩu</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-xl pl-11 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600 shadow-inner"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Xác nhận mật khẩu</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    minLength={6}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-xl pl-11 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600 shadow-inner"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-slate-300">Họ và tên / Bút danh</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <ImageIcon className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-xl pl-11 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600 shadow-inner"
                    placeholder="Ví dụ: Nguyễn Văn A (A-chan)"
                  />
                </div>
              </div>

              {/* Portfolio URL */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-slate-300">Link Portfolio (ArtStation, Drive...)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    type="url"
                    name="portfolioUrl"
                    required
                    value={formData.portfolioUrl}
                    onChange={handleChange}
                    className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-xl pl-11 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600 shadow-inner"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Specialty Tags */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-slate-300">Kỹ năng chuyên môn (Cách nhau bằng dấu phẩy)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Tags className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="specialtyTags"
                    required
                    value={formData.specialtyTags}
                    onChange={handleChange}
                    className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-xl pl-11 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600 shadow-inner"
                    placeholder="Vẽ nền, Đổ bóng, Vẽ hiệu ứng..."
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-medium py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Tạo tài khoản'
                )}
              </button>
            </div>

            <p className="text-center text-slate-400 text-sm mt-6">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-colors">
                Đăng nhập ngay
              </Link>
            </p>
          </form>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(51, 65, 85, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(51, 65, 85, 0.8);
        }
      `}</style>
    </div>
  );
};
