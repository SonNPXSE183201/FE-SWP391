import React, { useState } from 'react';
import { BriefcaseBusiness, Save, ExternalLink, Star, Award, TrendingUp, CheckCircle, Tag, Link as LinkIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const AssistantProfilePage = () => {
  const [loading, setLoading] = useState(false);
  const [portfolioUrl, setPortfolioUrl] = useState('https://behance.net/my-portfolio');
  const [skills, setSkills] = useState<string[]>(['Lineart', 'Background', 'Screentone', 'Coloring']);
  const [newSkill, setNewSkill] = useState('');

  // Mock stats
  const stats = {
    rating: 4.8,
    tasksCompleted: 42,
    completionRate: 98,
    totalIncome: 155000000,
  };

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Đã cập nhật hồ sơ thành công');
    }, 800);
  };

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newSkill.trim() !== '') {
      e.preventDefault();
      if (!skills.includes(newSkill.trim())) {
        setSkills([...skills, newSkill.trim()]);
      }
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  return (
    <div className="max-w-5xl">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <BriefcaseBusiness size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="page-header__title">Hồ sơ nghề nghiệp</h1>
            <p className="page-header__subtitle">Thẻ kỹ năng, thống kê và đánh giá của bạn</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col - Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-bg-secondary border border-border-custom rounded-xl p-6">
            <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <Award size={20} className="text-brand" /> Thành tích
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-bg-surface rounded-lg">
                <span className="text-text-secondary flex items-center gap-2">
                  <Star size={16} className="text-yellow-400" /> Đánh giá TB
                </span>
                <span className="font-bold text-text-primary">{stats.rating}/5.0</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-bg-surface rounded-lg">
                <span className="text-text-secondary flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-400" /> Task hoàn thành
                </span>
                <span className="font-bold text-text-primary">{stats.tasksCompleted}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-bg-surface rounded-lg">
                <span className="text-text-secondary flex items-center gap-2">
                  <TrendingUp size={16} className="text-blue-400" /> Tỷ lệ hoàn thành
                </span>
                <span className="font-bold text-text-primary">{stats.completionRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col - Edit Profile */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-bg-secondary border border-border-custom rounded-xl p-6">
            <h2 className="text-lg font-bold text-text-primary mb-6">Thông tin nghề nghiệp</h2>
            
            <div className="space-y-6">
              {/* Portfolio */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary flex items-center gap-2">
                  <LinkIcon size={16} /> Link Portfolio (Behance, ArtStation...)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    className="flex-1 bg-bg-surface border border-border-custom rounded-lg px-4 py-2 focus:outline-none focus:border-brand text-text-primary"
                    placeholder="https://"
                  />
                  <a 
                    href={portfolioUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-center px-4 bg-bg-surface hover:bg-bg-primary border border-border-custom rounded-lg text-text-secondary transition-colors"
                  >
                    <ExternalLink size={18} />
                  </a>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-text-primary flex items-center gap-2">
                  <Tag size={16} /> Thẻ Kỹ năng (Chuyên môn)
                </label>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {skills.map(skill => (
                    <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand/10 border border-brand/20 text-brand rounded-lg text-sm font-medium">
                      {skill}
                      <button 
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-red-400 transition-colors ml-1"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>

                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={handleAddSkill}
                  className="w-full bg-bg-surface border border-border-custom rounded-lg px-4 py-2 focus:outline-none focus:border-brand text-text-primary"
                  placeholder="Nhập kỹ năng và nhấn Enter (VD: Đi nét, Đổ màu...)"
                />
              </div>

              {/* Save Button */}
              <div className="pt-6 border-t border-border-custom flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-lg font-medium transition-colors"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Save size={18} /> Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
