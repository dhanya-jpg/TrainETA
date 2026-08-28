import React, { useState, useEffect } from 'react';
import { 
  History, 
  X, 
  Search, 
  Bell, 
  Sliders, 
  FileText, 
  LogIn, 
  LogOut, 
  UserPlus, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Download,
  Flame
} from 'lucide-react';
import { UserActivity, AuthUser, ActivityType } from '../../types';
import { subscribeToUserActivities } from '../../services/firebase';

interface UserActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
}

export const UserActivityModal: React.FC<UserActivityModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    if (!isOpen || !currentUser?.uid) return;

    const unsubscribe = subscribeToUserActivities(currentUser.uid, (logs) => {
      setActivities(logs);
    });

    return () => unsubscribe();
  }, [isOpen, currentUser?.uid]);

  if (!isOpen) return null;

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'LOGIN':
        return <LogIn className="w-4 h-4 text-accent" />;
      case 'LOGOUT':
        return <LogOut className="w-4 h-4 text-ink/60" />;
      case 'SIGN_UP':
        return <UserPlus className="w-4 h-4 text-emerald-500" />;
      case 'SEARCH_TRAIN':
        return <Search className="w-4 h-4 text-accent" />;
      case 'RUN_SIMULATION':
        return <Sliders className="w-4 h-4 text-amber-500" />;
      case 'CREATE_ALERT':
        return <Bell className="w-4 h-4 text-red-500" />;
      case 'DELETE_ALERT':
        return <Trash2 className="w-4 h-4 text-ink/50" />;
      case 'EXPORT_REPORT':
        return <FileText className="w-4 h-4 text-accent" />;
      default:
        return <Clock className="w-4 h-4 text-ink/50" />;
    }
  };

  const getActivityBadgeClass = (type: ActivityType) => {
    switch (type) {
      case 'LOGIN':
      case 'SIGN_UP':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'SEARCH_TRAIN':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'RUN_SIMULATION':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'CREATE_ALERT':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-surface-dark text-ink/70 border-border';
    }
  };

  const filteredActivities = activities.filter((act) => {
    const matchFilter = filterType === 'ALL' || act.activityType === filterType;
    const matchSearch = !searchFilter || 
      act.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      act.details.toLowerCase().includes(searchFilter.toLowerCase());
    return matchFilter && matchSearch;
  });

  const exportActivityJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activities, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `user-activity-logs-${currentUser?.uid || 'user'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh] text-ink">
        {/* Modal Header */}
        <div className="p-5 border-b border-border bg-surface-dark flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent text-on-accent flex items-center justify-center shadow-sm">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-display text-ink">User Activity & Audit Trail</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[10px] font-bold font-mono-code">
                  <Flame className="w-3 h-3 text-accent" />
                  Firestore Synced
                </span>
              </div>
              <p className="text-xs text-ink/60 font-medium">
                Real-time record for {currentUser?.name} ({currentUser?.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportActivityJSON}
              disabled={activities.length === 0}
              className="px-3 py-1.5 rounded-xl bg-surface border border-border text-ink text-xs font-bold font-mono-code hover:bg-surface-dark transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              title="Download activity logs as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-ink/50 hover:text-ink hover:bg-surface-dark transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-border bg-surface flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-ink/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search logged activities..."
              className="w-full pl-8 pr-3 py-1.5 bg-surface-dark border border-border rounded-xl text-xs text-ink placeholder:text-ink/40 focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 font-mono-code">
            {['ALL', 'SEARCH_TRAIN', 'RUN_SIMULATION', 'CREATE_ALERT', 'LOGIN'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  filterType === t
                    ? 'bg-accent text-on-accent shadow-xs'
                    : 'bg-surface-dark text-ink/70 hover:bg-surface hover:text-ink border border-border'
                }`}
              >
                {t === 'ALL' ? 'All Activities' : t.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Activity List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filteredActivities.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-surface-dark text-ink/40 mx-auto flex items-center justify-center mb-3">
                <History className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-ink">No activities recorded yet</h4>
              <p className="text-xs text-ink/50 max-w-sm mx-auto mt-1">
                Your actions—such as train lookups, what-if simulations, and alert creation—are securely logged to Firestore in real time.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredActivities.map((act, index) => (
                <div
                  key={act.id || index}
                  className="p-3.5 rounded-2xl bg-surface-dark hover:bg-surface-dark/80 border border-border transition-all flex items-start gap-3"
                >
                  <div className="p-2 rounded-xl bg-surface border border-border shadow-xs shrink-0 mt-0.5">
                    {getActivityIcon(act.activityType)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink text-xs">
                          {act.title}
                        </span>
                        <span className={`text-[10px] font-mono-code font-bold uppercase px-1.5 py-0.5 rounded border ${getActivityBadgeClass(act.activityType)}`}>
                          {act.activityType.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <span className="text-[10px] font-mono-code text-ink/50 shrink-0">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-ink/70 mt-1 leading-relaxed">
                      {act.details}
                    </p>

                    {act.metadata && (
                      <div className="mt-2 p-2 rounded-xl bg-surface border border-border text-[11px] font-mono-code text-ink/70">
                        {Object.entries(act.metadata).map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between">
                            <span className="text-ink/50">{k}:</span>
                            <span className="font-semibold text-ink">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-surface-dark flex items-center justify-between text-xs text-ink/60 font-mono-code">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encrypted cloud storage on <strong className="text-ink">smart-eta-9966c</strong></span>
          </div>
          <span className="font-bold text-ink">{activities.length} Total Logs</span>
        </div>
      </div>
    </div>
  );
};
