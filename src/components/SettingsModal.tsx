import React, { useState } from 'react';
import { UserProfile } from '../types/index.ts';
import { Settings, X, Save, RotateCcw, Volume2, Globe, Shield } from 'lucide-react';

interface SettingsModalProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onResetData: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  user,
  onUpdateUser,
  onResetData,
  onClose,
}) => {
  const [name, setName] = useState(user.name);
  const [city, setCity] = useState(user.city || 'دمشق');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  const syrianCities = [
    'دمشق',
    'ريف دمشق',
    'حلب',
    'حمص',
    'اللاذقية',
    'طرطوس',
    'حماة',
    'السويداء',
    'درعا',
    'القنيطرة',
    'دير الزور',
    'الحسكة',
    'الرقة',
    'إدلب',
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ name, city });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel rounded-3xl p-5 border border-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.3)] flex flex-col gap-4 text-right">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base text-white">إعدادات الحساب والبوت</span>
            <Settings className="w-5 h-5 text-cyan-400" />
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-3.5">
          {/* User Name */}
          <div className="flex flex-col gap-1.5 text-right">
            <label className="text-xs font-bold text-slate-200">الاسم المستعار / الكامل:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-3 rounded-2xl bg-[#091524] border border-cyan-500/30 text-white text-xs font-medium focus:outline-none focus:border-cyan-400 text-right"
            />
          </div>

          {/* City */}
          <div className="flex flex-col gap-1.5 text-right">
            <label className="text-xs font-bold text-slate-200">المحافظة / المدينة في سوريا:</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="p-3 rounded-2xl bg-[#091524] border border-cyan-500/30 text-white text-xs font-medium focus:outline-none focus:border-cyan-400 text-right"
            >
              {syrianCities.map((c) => (
                <option key={c} value={c} className="bg-[#091524] text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Sound toggle */}
          <div className="p-3 rounded-2xl bg-[#081729] border border-cyan-500/20 flex items-center justify-between">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={() => setSoundEnabled(!soundEnabled)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">المؤثرات الصوتية والاهتزاز</span>
              <Volume2 className="w-4 h-4 text-cyan-400" />
            </div>
          </div>

          {/* Reset Demo Data Button */}
          <button
            type="button"
            onClick={onResetData}
            className="p-2.5 rounded-xl border border-rose-500/30 text-rose-300 hover:bg-rose-950/40 text-xs font-bold flex items-center justify-center gap-2 transition-colors mt-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة ضبط البيانات التجريبية لحالتها الأولى</span>
          </button>

          {/* Submit */}
          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saved ? '✓ تم حفظ التغييرات' : 'حفظ الإعدادات'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
