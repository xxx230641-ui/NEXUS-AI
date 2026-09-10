import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Image as ImageIcon, Check, Sparkles, User, Camera } from 'lucide-react';
import { Button } from './Button';
import { useLang } from '../../hooks/useLang';

export const PRESET_AVATARS = [
  { id: 'av-1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80', labelAr: 'تقني محترف', labelEn: 'Tech Lead' },
  { id: 'av-2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80', labelAr: 'مستشار أعمال', labelEn: 'Executive' },
  { id: 'av-3', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=250&auto=format&fit=crop&q=80', labelAr: 'مصممة نصوص', labelEn: 'Designer' },
  { id: 'av-4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80', labelAr: 'مهندس برمجيات', labelEn: 'Developer' },
  { id: 'av-5', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80', labelAr: 'إدارة وتخطيط', labelEn: 'Manager' },
  { id: 'av-6', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=250&auto=format&fit=crop&q=80', labelAr: 'مطور ذكاء اصطناعي', labelEn: 'AI Engineer' },
  { id: 'av-7', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=250&auto=format&fit=crop&q=80', labelAr: 'محلل بيانات', labelEn: 'Data Analyst' },
  { id: 'av-8', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=250&auto=format&fit=crop&q=80', labelAr: 'باحث علمي', labelEn: 'Researcher' },
];

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  onSelectAvatar: (newAvatarUrl: string) => void;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  onSelectAvatar,
}) => {
  const { lang, isRTL } = useLang();
  const [selected, setSelected] = useState<string>(currentAvatar);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'gallery' | 'studio'>('studio');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError(lang === 'ar' ? 'يرجى اختيار ملف صورة صالح.' : 'Please select a valid image file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError(lang === 'ar' ? 'حجم الصورة كبير جداً (الحد الأقصى 10 ميجابايت).' : 'Image size too large (max 10MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setSelected(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const finalUrl = customUrl.trim() || selected;
    onSelectAvatar(finalUrl);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-hover)]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-[var(--text-primary)]">
                  {lang === 'ar' ? 'تغيير صورة البروفايل' : 'Change Profile Picture'}
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {lang === 'ar' ? 'اختر صورة من استديو الهاتف أو من الصور الجاهزة' : 'Pick from device studio gallery or preset avatars'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-surface)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Selected Preview */}
          <div className="p-4 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] flex items-center justify-center gap-4">
            <div className="relative">
              <img
                src={selected}
                alt="Selected Avatar Preview"
                className="w-20 h-20 rounded-2xl object-cover border-4 border-[var(--accent)] shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 bg-[var(--accent)] text-white p-1 rounded-full text-xs shadow-md">
                <Check className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-sm space-y-1">
              <span className="font-bold text-[var(--text-primary)] block">
                {lang === 'ar' ? 'الصورة المحددة حالياً' : 'Currently Selected Photo'}
              </span>
              <span className="text-xs text-[var(--text-secondary)] block">
                {selected.startsWith('data:')
                  ? (lang === 'ar' ? 'صورة مرفوعة من الاستديو' : 'Uploaded from studio')
                  : (lang === 'ar' ? 'صورة شخصية عالية الدقة' : 'High resolution avatar')}
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-[var(--border-subtle)] bg-[var(--bg-hover)] p-1.5 gap-1">
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'studio'
                  ? 'bg-[var(--bg-surface)] text-[var(--accent)] shadow-sm border border-[var(--border-subtle)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>{lang === 'ar' ? 'استديو الهاتف' : 'Phone Gallery'}</span>
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'gallery'
                  ? 'bg-[var(--bg-surface)] text-[var(--accent)] shadow-sm border border-[var(--border-subtle)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>{lang === 'ar' ? 'صور بروفايل جاهزة' : 'Preset Avatars'}</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-5 overflow-y-auto space-y-4">
            {activeTab === 'studio' ? (
              <div className="space-y-4 text-center">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 border-2 border-dashed border-[var(--accent)]/40 hover:border-[var(--accent)] rounded-2xl bg-[var(--accent)]/5 hover:bg-[var(--accent)]/10 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group"
                >
                  <div className="p-4 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-extrabold text-sm text-[var(--text-primary)]">
                      {lang === 'ar' ? 'انقر لاختيار صورة من استديو الهاتف' : 'Click to select photo from phone gallery'}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      {lang === 'ar' ? 'يدعم صور PNG, JPG, WEBP (حتى 10MB)' : 'Supports PNG, JPG, WEBP (up to 10MB)'}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" type="button" className="pointer-events-none mt-1">
                    {lang === 'ar' ? 'فتح المعرض' : 'Open Gallery'}
                  </Button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                {uploadError && (
                  <p className="text-xs text-[var(--error)] font-bold bg-[var(--error)]/10 p-2.5 rounded-xl">
                    ⚠️ {uploadError}
                  </p>
                )}

                {/* Optional Custom URL input */}
                <div className="pt-3 border-t border-[var(--border-subtle)] text-start space-y-1.5">
                  <label className="block text-xs font-bold text-[var(--text-secondary)]">
                    {lang === 'ar' ? 'أو أدخل رابط صورة مباشرة (URL):' : 'Or enter direct image URL:'}
                  </label>
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => {
                      setCustomUrl(e.target.value);
                      if (e.target.value.trim()) {
                        setSelected(e.target.value.trim());
                      }
                    }}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-bold text-[var(--text-secondary)] mb-2">
                  {lang === 'ar' ? 'اختر إحدى صور البروفايل المصممة جاهزة:' : 'Select one of our preset profile avatars:'}
                </p>

                <div className="grid grid-cols-4 sm:grid-cols-4 gap-3">
                  {PRESET_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        setSelected(av.url);
                        setCustomUrl('');
                      }}
                      className={`relative group rounded-2xl overflow-hidden border-2 transition-all p-1 ${
                        selected === av.url
                          ? 'border-[var(--accent)] bg-[var(--accent)]/10 scale-105 shadow-md'
                          : 'border-[var(--border-subtle)] hover:border-[var(--accent)]/50 bg-[var(--bg-hover)]'
                      }`}
                    >
                      <img
                        src={av.url}
                        alt={av.labelEn}
                        className="w-full h-16 sm:h-20 object-cover rounded-xl"
                      />
                      {selected === av.url && (
                        <div className="absolute top-2 right-2 bg-[var(--accent)] text-white p-1 rounded-full text-xs shadow-md">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                      <span className="block text-[10px] font-bold text-center text-[var(--text-secondary)] mt-1 truncate px-0.5">
                        {lang === 'ar' ? av.labelAr : av.labelEn}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-hover)] flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={onClose} type="button">
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} type="button" icon={<Check className="w-4 h-4" />}>
              {lang === 'ar' ? 'تأكيد وحفظ الصورة' : 'Confirm & Save Avatar'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
