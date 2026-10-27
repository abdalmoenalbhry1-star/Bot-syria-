import React, { useState } from 'react';
import { TaskItem, AppLanguage } from '../types/index.ts';
import { isExpiredAfter6Hours, getRemainingTimeString } from '../utils/rules.ts';
import { getTranslation } from '../utils/translations.ts';
import {
  ClipboardCheck,
  Send,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Upload,
  Image,
  X,
  AlertCircle,
  Check,
  Users,
  Timer,
} from 'lucide-react';

interface TasksViewProps {
  tasks: TaskItem[];
  onSubmitProof: (taskId: string, proofImage: string, proofNote?: string) => void;
  onBack: () => void;
  language?: AppLanguage;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onSubmitProof,
  onBack,
  language = 'ar',
}) => {
  const [activeTab, setActiveTab] = useState<'available' | 'pending' | 'completed'>('available');
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [proofImage, setProofImage] = useState<string>('');
  const [proofNote, setProofNote] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const t = getTranslation(language);
  const isArabic = language === 'ar';

  // Available tasks: status === 'available' AND seatsLeft > 0
  const availableTasks = tasks.filter((t) => t.status === 'available' && t.seatsLeft > 0);

  // Tasks in pending admin review
  const pendingTasks = tasks.filter((t) => t.status === 'pending_review');

  // Approved/Completed tasks within 6 hours
  const completedTasks = tasks.filter(
    (t) => t.status === 'approved' && !isExpiredAfter6Hours(t.approvedAt)
  );

  const totalRelevantTasks = availableTasks.length + pendingTasks.length + completedTasks.length;
  const executedTasksCount = completedTasks.length + pendingTasks.length;
  const progressPercent =
    totalRelevantTasks > 0 ? Math.round((executedTasksCount / totalRelevantTasks) * 100) : 0;
  const totalEarnedFromTasks = completedTasks.reduce((sum, t) => sum + t.reward, 0);

  const handleOpenTask = (task: TaskItem) => {
    setSelectedTask(task);
    setProofImage(task.proofImage || '');
    setProofNote(task.proofNote || '');
    setErrorMsg(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg(isArabic ? 'حجم الصورة كبير جداً (الحد الأقصى 5 ميغابايت)' : 'Image is too large (max 5MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    if (!proofImage) {
      setErrorMsg(isArabic ? 'يرجى إرفاق صورة لقطة الشاشة كإثبات على تنفيذ المهمة أولاً' : 'Please upload screenshot proof first');
      return;
    }

    onSubmitProof(selectedTask.id, proofImage, proofNote);
    setSelectedTask(null);
    setProofImage('');
    setProofNote('');
    setActiveTab('pending');
  };

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="w-full flex flex-col gap-4 pb-24 text-right">
      {/* View Header */}
      <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 hover:text-white text-xs font-bold transition-colors"
        >
          {isArabic ? <ArrowRight className="w-4 h-4" /> : null}
          <span>{t.backToHome}</span>
          {!isArabic ? <ArrowRight className="w-4 h-4 rotate-180" /> : null}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-base font-extrabold text-white">{t.tasksTitle}</span>
          <ClipboardCheck className="w-5 h-5 text-cyan-400" />
        </div>
      </div>

      {/* DYNAMIC PROGRESS CARD */}
      <div className="glass-panel rounded-3xl p-4 border border-cyan-400/40 relative overflow-hidden bg-gradient-to-r from-[#0c2447] via-[#07162b] to-[#040d1a]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div className="flex flex-col text-right">
              <span className="font-bold text-white text-sm">
                {isArabic ? 'معدل إنجاز المهام' : 'Tasks Completion Rate'}
              </span>
              <span className="text-xs text-cyan-300/90 font-medium">
                {isArabic
                  ? `${executedTasksCount} من أصل ${totalRelevantTasks} مهمة`
                  : `${executedTasksCount} of ${totalRelevantTasks} tasks`}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-300 font-semibold">
              {isArabic ? 'أرباح المهام' : 'Task Earnings'}
            </span>
            <span className="text-base font-black text-emerald-400">
              +{totalEarnedFromTasks.toLocaleString('en-US')} {t.syp}
            </span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="mt-4 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span>{isArabic ? 'نسبة الإنجاز' : 'Progress'}</span>
            <span className="font-bold font-mono text-cyan-400">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-cyan-500/30">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#09182d] rounded-2xl border border-cyan-500/30">
        <button
          onClick={() => setActiveTab('available')}
          className={`py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'available'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {t.tabAvailableTasks} ({availableTasks.length})
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`py-2 rounded-xl text-xs font-bold transition-all relative ${
            activeTab === 'pending'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-[0_0_12px_rgba(245,158,11,0.3)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {t.tabPendingTasks} ({pendingTasks.length})
          {pendingTasks.length > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'completed'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {t.tabCompletedTasks} ({completedTasks.length})
        </button>
      </div>

      {/* TAB 1: AVAILABLE TASKS */}
      {activeTab === 'available' && (
        <div className="flex flex-col gap-3">
          {availableTasks.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center text-slate-400 text-xs">
              {t.noAvailableTasks}
            </div>
          ) : (
            availableTasks.map((task) => (
              <div
                key={task.id}
                className="glass-panel rounded-2xl p-4 border border-cyan-500/30 flex flex-col gap-3 hover:border-cyan-400/60 transition-all shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col text-right">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{task.title}</span>
                      {task.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-[10px] text-cyan-300 font-bold">
                          {task.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300/90 mt-1 leading-relaxed">
                      {task.description}
                    </p>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-base font-black text-cyan-400">
                      +{task.reward.toLocaleString('en-US')}
                    </span>
                    <span className="text-[10px] text-cyan-200/70 font-bold">{t.syp}</span>
                  </div>
                </div>

                {/* Footer with Seats Info and Action Button */}
                <div className="pt-2.5 border-t border-cyan-500/15 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      {t.seatsLeft}{' '}
                      <strong className="text-cyan-300 font-mono">{task.seatsLeft}</strong> /{' '}
                      {task.totalSeats}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenTask(task)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-black shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t.executeAndUploadProof}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: PENDING REVIEW */}
      {activeTab === 'pending' && (
        <div className="flex flex-col gap-3">
          <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200/90 leading-relaxed text-right">
            🛡️ {isArabic ? 'تم استلام إثباتك وهو الآن قيد التدقيق لدى الإدارة. فور الموافقة ستُضاف النقاط وتختفي من هنا.' : 'Your proof is under admin review. Once approved, points are added and task moves to completed.'}
          </div>

          {pendingTasks.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center text-slate-400 text-xs">
              {t.noPendingTasks}
            </div>
          ) : (
            pendingTasks.map((task) => (
              <div
                key={task.id}
                className="glass-panel rounded-2xl p-4 border border-amber-500/40 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col text-right">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{task.title}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 font-mono">
                      {isArabic ? 'تاريخ الإرسال:' : 'Submitted at:'} {task.submittedAt || (isArabic ? 'الآن' : 'Now')}
                    </span>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-amber-950 border border-amber-400/50 text-amber-300 text-[11px] font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 animate-spin" />
                    <span>{isArabic ? 'قيد تدقيق الإدارة' : 'Under Review'}</span>
                  </span>
                </div>

                {task.proofImage && (
                  <div className="p-2 rounded-xl bg-[#081525] border border-cyan-500/20 flex items-center gap-3">
                    <img
                      src={task.proofImage}
                      alt="Proof"
                      className="w-16 h-12 object-cover rounded-lg border border-cyan-500/40 shrink-0"
                    />
                    <div className="flex flex-col text-right">
                      <span className="text-xs text-white font-bold">{t.uploadProofTitle}</span>
                      <span className="text-[11px] text-slate-300">
                        {task.proofNote ? `${task.proofNote}` : ''}
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{t.rewardLabel}</span>
                  <span className="font-black text-amber-400 font-mono">
                    +{task.reward.toLocaleString('en-US')} {t.syp}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: COMPLETED TASKS (Auto-clears after 6 hours from approval) */}
      {activeTab === 'completed' && (
        <div className="flex flex-col gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-200 text-right flex items-center gap-1.5">
            <Timer className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{t.expiresInHours}</span>
          </div>

          {completedTasks.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center text-slate-400 text-xs">
              {t.noCompletedTasks}
            </div>
          ) : (
            completedTasks.map((task) => (
              <div
                key={task.id}
                className="glass-panel rounded-2xl p-3.5 border border-emerald-500/30 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="font-bold text-xs text-white">{task.title}</span>
                    <span className="text-[11px] text-emerald-400/90 font-medium">
                      {isArabic ? 'تمت الموافقة وإضافة الرصيد بنجاح' : 'Approved & credited successfully'}
                    </span>
                    {task.approvedAt && (
                      <span className="text-[10px] text-cyan-300 font-mono mt-0.5">
                        {getRemainingTimeString(task.approvedAt)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-sm font-black text-emerald-400 font-mono">
                    +{task.reward.toLocaleString('en-US')} {t.syp}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold mt-1">
                    {isArabic ? 'معتمدة' : 'Approved'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL: TASK EXECUTION & PROOF SUBMISSION */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel rounded-3xl p-5 border-2 border-cyan-400/70 shadow-[0_0_35px_rgba(6,182,212,0.3)] text-right flex flex-col gap-3.5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
              <button
                onClick={() => setSelectedTask(null)}
                className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-white">{t.executeAndUploadProof}</span>
                <ClipboardCheck className="w-5 h-5 text-cyan-400" />
              </div>
            </div>

            {/* Task Summary Banner */}
            <div className="p-3.5 rounded-2xl bg-[#08182b] border border-cyan-500/30 flex items-start justify-between">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-white">{selectedTask.title}</span>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  {selectedTask.description}
                </p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-cyan-300 font-semibold">
                  <span>
                    {t.seatsLeft} {selectedTask.seatsLeft}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="text-base font-black text-cyan-400 font-mono">
                  +{selectedTask.reward.toLocaleString('en-US')}
                </span>
                <span className="text-[10px] text-cyan-200/70 font-semibold">{t.syp}</span>
              </div>
            </div>

            {/* STEP 1: BUTTON TO OPEN / START TASK LINK */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-200">
                {isArabic ? 'الخطوة الأولى: فتح وتنفيذ المهمة' : 'Step 1: Open & Complete Task'}
              </label>
              {selectedTask.actionUrl ? (
                <a
                  href={selectedTask.actionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(2,132,199,0.35)] transition-all"
                >
                  <Send className="w-4 h-4 -rotate-45" />
                  <span>{t.openTaskLink}</span>
                </a>
              ) : (
                <div className="p-2 rounded-xl bg-slate-800 text-xs text-slate-300 text-center font-bold">
                  {isArabic ? 'المهمة مباشرة داخل التطبيق' : 'Direct in-app task'}
                </div>
              )}
            </div>

            {/* STEP 2: PROOF UPLOAD */}
            <form onSubmit={handleSubmitProof} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Image className="w-4 h-4 text-cyan-400" />
                  <span>{t.uploadProofTitle}:</span>
                </label>

                {proofImage ? (
                  <div className="relative rounded-2xl border-2 border-cyan-400/60 overflow-hidden bg-black/50 p-2">
                    <img
                      src={proofImage}
                      alt="Proof Preview"
                      className="w-full h-36 object-contain rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setProofImage('')}
                      className="absolute top-3 right-3 p-1 rounded-full bg-rose-600 text-white hover:bg-rose-500 shadow-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="mt-1 text-center text-[10px] text-emerald-400 font-bold">
                      ✓ {isArabic ? 'تم تحديد صورة الإثبات بنجاح' : 'Screenshot selected successfully'}
                    </div>
                  </div>
                ) : (
                  <label className="w-full h-28 rounded-2xl border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 bg-[#071526]/80 flex flex-col items-center justify-center cursor-pointer transition-colors p-3 text-center">
                    <Upload className="w-7 h-7 text-cyan-400 mb-1" />
                    <span className="text-xs font-bold text-slate-200">{t.chooseImage}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* STEP 3: OPTIONAL NOTE */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>{isArabic ? 'ملاحظة (اختياري):' : 'Note (optional):'}</span>
                </label>
                <input
                  type="text"
                  value={proofNote}
                  onChange={(e) => setProofNote(e.target.value)}
                  placeholder={t.uploadProofNotePlaceholder}
                  className="p-3 rounded-2xl bg-[#07172b] border border-cyan-500/30 text-white text-xs font-medium focus:outline-none focus:border-cyan-400 placeholder:text-slate-500 text-right"
                />
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Proof Button */}
              <button
                type="submit"
                className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:brightness-110 text-white font-black text-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>{t.confirmSubmitProof}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
