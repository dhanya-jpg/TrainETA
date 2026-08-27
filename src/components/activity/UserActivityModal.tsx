import React, { useState, useEffect } from 'react';
import { 
  History, 
  X, 
  Search, 
  Shield, 
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
  Flame,
  Filter
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
        return <LogIn className="w-4 h-4 text-blue-500" />;
      case 'LOGOUT':
        return <LogOut className="w-4 h-4 text-slate-500" />;
      case 'SIGN_UP':
        return <UserPlus className="w-4 h-4 text-emerald-500" />;
      case 'SEARCH_TRAIN':
        return <Search className="w-4 h-4 text-indigo-500" />;
      case 'RUN_SIMULATION':
        return <Sliders className="w-4 h-4 text-amber-500" />;
      case 'CREATE_ALERT':
        return <Bell className="w-4 h-4 text-red-500" />;
      case 'DELETE_ALERT':
        return <Trash2 className="w-4 h-4 text-slate-400" />;
      case 'EXPORT_REPORT':
        return <FileText className="w-4 h-4 text-purple-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getActivityBadgeClass = (type: ActivityType) => {
    switch (type) {
      case 'LOGIN':
      case 'SIGN_UP':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SEARCH_TRAIN':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'RUN_SIMULATION':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'CREATE_ALERT':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
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
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">User Activity & Audit Trail</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  <Flame className="w-3 h-3 text-amber-500" />
                  Firestore Synced
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Real-time record for {currentUser?.name} ({currentUser?.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportActivityJSON}
              disabled={activities.length === 0}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              title="Download activity logs as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search logged activities..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['ALL', 'SEARCH_TRAIN', 'RUN_SIMULATION', 'CREATE_ALERT', 'LOGIN'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  filterType === t
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <History className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">No activities recorded yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Your actions—such as train lookups, what-if simulations, and alert creation—are securely logged to Firestore in real time.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredActivities.map((act, index) => (
                <div
                  key={act.id || index}
                  className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 transition-all flex items-start gap-3"
                >
                  <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-xs shrink-0 mt-0.5">
                    {getActivityIcon(act.activityType)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-xs">
                          {act.title}
                        </span>
                        <span className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${getActivityBadgeClass(act.activityType)}`}>
                          {act.activityType.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {act.details}
                    </p>

                    {act.metadata && (
                      <div className="mt-2 p-2 rounded-lg bg-white border border-slate-200 text-[11px] font-mono text-slate-600">
                        {Object.entries(act.metadata).map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between">
                            <span className="text-slate-400">{k}:</span>
                            <span className="font-semibold text-slate-700">{String(v)}</span>
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
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted cloud storage on <strong className="font-mono text-slate-700">smart-eta-9966c</strong></span>
          </div>
          <span className="font-mono font-bold text-slate-700">{activities.length} Total Logs</span>
        </div>
      </div>
    </div>
  );
};
