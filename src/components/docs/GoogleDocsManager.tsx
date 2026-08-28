import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ExternalLink, 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  FolderSync, 
  Copy, 
  Share2, 
  FileEdit, 
  Layers, 
  Train, 
  Activity, 
  Clock, 
  Send,
  Lock,
  Sparkles,
  Search,
  Check
} from 'lucide-react';
import { TrainData, AuthUser } from '../../types';
import { 
  getGoogleDocsAccessToken, 
  authenticateGoogleDocs, 
  listUserGoogleDocs, 
  deleteUserGoogleDoc, 
  exportTrainDossierToGoogleDocs, 
  exportSectionOperationsToGoogleDocs, 
  createGoogleDocument,
  appendTextToGoogleDoc,
  GoogleDocFile,
  DocExportResponse
} from '../../services/googleDocsService';
import { logUserActivity } from '../../services/firebase';

interface GoogleDocsManagerProps {
  trains: TrainData[];
  selectedTrain: TrainData;
  currentUser?: AuthUser | null;
  onSelectTrain?: (train: TrainData) => void;
}

export const GoogleDocsManager: React.FC<GoogleDocsManagerProps> = ({
  trains,
  selectedTrain,
  currentUser,
  onSelectTrain
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [userDocs, setUserDocs] = useState<GoogleDocFile[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(false);
  const [searchDocQuery, setSearchDocQuery] = useState<string>('');
  
  // Creation States
  const [activeTab, setActiveTab] = useState<'train-dossier' | 'section-bulletin' | 'custom-memo'>('train-dossier');
  const [targetTrainId, setTargetTrainId] = useState<string>(selectedTrain.id);
  const [customRemarks, setCustomRemarks] = useState<string>('Standard clearance under Western Railway Section Control.');
  const [customDocTitle, setCustomDocTitle] = useState<string>('IR Operational Notice - Section Corridor');
  const [customDocContent, setCustomDocContent] = useState<string>('Special caution notice for monsoon track geometry maintenance.');
  
  // Generation & Status
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [lastGeneratedDoc, setLastGeneratedDoc] = useState<DocExportResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  // Destructive Action Modal State (Mandatory for Workspace mutations)
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState<GoogleDocFile | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Append Modal State
  const [appendDocTarget, setAppendDocTarget] = useState<GoogleDocFile | null>(null);
  const [appendText, setAppendText] = useState<string>('');
  const [isAppending, setIsAppending] = useState<boolean>(false);

  // Check initial token & load docs
  useEffect(() => {
    const checkToken = async () => {
      const activeToken = await getGoogleDocsAccessToken();
      setToken(activeToken);
      if (activeToken) {
        loadDocsList();
      }
    };
    checkToken();
  }, []);

  // Update target train when selectedTrain prop changes
  useEffect(() => {
    setTargetTrainId(selectedTrain.id);
  }, [selectedTrain]);

  const loadDocsList = async () => {
    setIsLoadingDocs(true);
    try {
      const docs = await listUserGoogleDocs(25);
      setUserDocs(docs);
    } catch (err: any) {
      console.warn('Error loading Google Docs:', err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleConnectGoogle = async () => {
    setIsAuthenticating(true);
    setErrorMessage(null);
    try {
      const accessToken = await authenticateGoogleDocs();
      if (accessToken) {
        setToken(accessToken);
        await loadDocsList();
      } else {
        setErrorMessage('Google authentication could not be completed. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to authenticate with Google Docs.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGenerateTrainDossier = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setLastGeneratedDoc(null);
    try {
      const trainToExport = trains.find(t => t.id === targetTrainId) || selectedTrain;
      const res = await exportTrainDossierToGoogleDocs(trainToExport, customRemarks);
      
      if (res.success) {
        setLastGeneratedDoc(res);
        await loadDocsList();
        if (currentUser?.uid) {
          logUserActivity(currentUser.uid, {
            activityType: 'EXPORT_REPORT',
            title: `Exported Train ${trainToExport.trainNumber} Dossier to Google Docs`,
            details: `Created Google Document: ${res.title}`
          });
        }
      } else {
        setErrorMessage(res.error || 'Failed to create Google Doc.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error generating Google Doc.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateSectionBulletin = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setLastGeneratedDoc(null);
    try {
      const res = await exportSectionOperationsToGoogleDocs(
        trains,
        'Western Railway BCT Division - Mainline Corridors',
        customRemarks
      );

      if (res.success) {
        setLastGeneratedDoc(res);
        await loadDocsList();
        if (currentUser?.uid) {
          logUserActivity(currentUser.uid, {
            activityType: 'EXPORT_REPORT',
            title: 'Exported Section Controller Bulletin to Google Docs',
            details: `Created Google Document: ${res.title}`
          });
        }
      } else {
        setErrorMessage(res.error || 'Failed to create Google Doc.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error generating Google Doc.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCustomDoc = async () => {
    if (!customDocTitle.trim()) {
      setErrorMessage('Please provide a document title.');
      return;
    }
    setIsGenerating(true);
    setErrorMessage(null);
    setLastGeneratedDoc(null);
    try {
      const res = await createGoogleDocument(customDocTitle, customDocContent);
      if (res.success) {
        setLastGeneratedDoc(res);
        await loadDocsList();
        if (currentUser?.uid) {
          logUserActivity(currentUser.uid, {
            activityType: 'EXPORT_REPORT',
            title: `Created Google Doc: ${customDocTitle}`,
            details: `New Google Doc saved to user's Google Drive.`
          });
        }
      } else {
        setErrorMessage(res.error || 'Failed to create Google Doc.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating Google Doc.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmDoc) return;
    setIsDeleting(true);
    try {
      await deleteUserGoogleDoc(deleteConfirmDoc.id);
      setUserDocs(prev => prev.filter(d => d.id !== deleteConfirmDoc.id));
      if (currentUser?.uid) {
        logUserActivity(currentUser.uid, {
          activityType: 'EXPORT_REPORT',
          title: `Deleted Google Doc from Drive: ${deleteConfirmDoc.name}`,
          details: `Document ID: ${deleteConfirmDoc.id}`
        });
      }
      setDeleteConfirmDoc(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete document from Google Drive.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmAppend = async () => {
    if (!appendDocTarget || !appendText.trim()) return;
    setIsAppending(true);
    try {
      await appendTextToGoogleDoc(appendDocTarget.id, appendText);
      setAppendDocTarget(null);
      setAppendText('');
      await loadDocsList();
      alert('Content successfully appended to Google Doc!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to append text to Google Doc.');
    } finally {
      setIsAppending(false);
    }
  };

  const copyDocUrl = (url?: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const filteredDocs = userDocs.filter(d => 
    d.name.toLowerCase().includes(searchDocQuery.toLowerCase())
  );

  const selectedTrainObj = trains.find(t => t.id === targetTrainId) || selectedTrain;

  return (
    <div className="space-y-6 text-ink pb-12 font-sans">
      {/* Top Banner */}
      <div className="bg-surface p-6 rounded-3xl border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-display font-bold tracking-tight text-ink">
                  Google Docs Integration Hub
                </h1>
                <span className="text-[10px] font-mono-code font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                  OFFICIAL WORKSPACE API
                </span>
              </div>
              <p className="text-xs text-ink/60 font-medium mt-0.5">
                Generate live operational train dossiers, delay analysis bulletins, and what-if simulation reports directly into Google Docs.
              </p>
            </div>
          </div>
        </div>

        {/* Auth Status & Connect */}
        <div className="flex items-center gap-3">
          {token ? (
            <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-xl text-xs font-mono-code font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Google Account Connected</span>
            </div>
          ) : (
            <button
              onClick={handleConnectGoogle}
              disabled={isAuthenticating}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-2.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {/* Google Official SVG Icon */}
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>{isAuthenticating ? 'Connecting...' : 'Connect Google Docs'}</span>
            </button>
          )}

          <button
            onClick={loadDocsList}
            disabled={isLoadingDocs || !token}
            title="Refresh documents list"
            className="p-2.5 bg-surface border border-border hover:bg-surface-dark rounded-xl text-ink/70 hover:text-ink transition-colors disabled:opacity-40 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingDocs ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-4 rounded-2xl text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button 
            onClick={() => setErrorMessage(null)} 
            className="font-bold underline hover:opacity-80 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Success Notification with Direct Link */}
      {lastGeneratedDoc && lastGeneratedDoc.success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 p-5 rounded-2xl text-xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Google Document Created Successfully!</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={lastGeneratedDoc.documentUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Open in Google Docs</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => copyDocUrl(lastGeneratedDoc.documentUrl)}
                className="px-3 py-1.5 bg-surface border border-border hover:bg-surface-dark rounded-lg text-ink font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Copied Link' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
          <div className="bg-surface/80 p-3 rounded-xl border border-border/50 text-ink/80 font-mono-code text-[11px] truncate">
            <strong>Document:</strong> {lastGeneratedDoc.title} ({lastGeneratedDoc.documentId})
          </div>
        </div>
      )}

      {/* Main Grid: Generator on Left, Drive Library on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Generator Card (7 cols) */}
        <div className="lg:col-span-7 bg-surface p-6 rounded-3xl border border-border shadow-xs space-y-6">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-surface-dark rounded-2xl border border-border">
            <button
              onClick={() => setActiveTab('train-dossier')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold font-mono-code transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'train-dossier'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-ink/60 hover:text-ink hover:bg-surface'
              }`}
            >
              <Train className="w-4 h-4" />
              <span>Train Dossier</span>
            </button>
            <button
              onClick={() => setActiveTab('section-bulletin')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold font-mono-code transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'section-bulletin'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-ink/60 hover:text-ink hover:bg-surface'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Section Bulletin</span>
            </button>
            <button
              onClick={() => setActiveTab('custom-memo')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold font-mono-code transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'custom-memo'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-ink/60 hover:text-ink hover:bg-surface'
              }`}
            >
              <FileEdit className="w-4 h-4" />
              <span>Custom Memo</span>
            </button>
          </div>

          {/* Form Content Based on Tab */}
          {activeTab === 'train-dossier' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold font-mono-code uppercase tracking-wider text-ink/70 mb-1.5">
                  Select Train to Export:
                </label>
                <select
                  value={targetTrainId}
                  onChange={(e) => {
                    setTargetTrainId(e.target.value);
                    const found = trains.find(t => t.id === e.target.value);
                    if (found && onSelectTrain) onSelectTrain(found);
                  }}
                  className="w-full bg-surface-dark border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink focus:outline-none focus:border-blue-500"
                >
                  {trains.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.trainNumber} - {t.trainName} ({t.source} ➔ {t.destination}) [{t.currentDelayMinutes}m delay]
                    </option>
                  ))}
                </select>
              </div>

              {/* Train Summary Preview */}
              <div className="bg-surface-dark p-4 rounded-2xl border border-border text-xs space-y-2 font-mono-code">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-blue-600 dark:text-blue-400">{selectedTrainObj.trainNumber} {selectedTrainObj.trainName}</span>
                  <span className="bg-surface px-2 py-0.5 rounded border border-border text-[10px]">
                    {selectedTrainObj.trainType}
                  </span>
                </div>
                <div className="text-ink/70 text-[11px] grid grid-cols-2 gap-2">
                  <div>Route: {selectedTrainObj.source} ➔ {selectedTrainObj.destination}</div>
                  <div>Current Speed: {selectedTrainObj.currentSpeedKmH} km/h</div>
                  <div>Recorded Delay: {selectedTrainObj.currentDelayMinutes} mins</div>
                  <div>Destination ETA: {selectedTrainObj.destinationETA}</div>
                  <div>ML Confidence: {selectedTrainObj.destinationConfidence}%</div>
                  <div>Signal: {selectedTrainObj.signalAspect}</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold font-mono-code uppercase tracking-wider text-ink/70 mb-1.5">
                  Section Controller Remarks (Appended to Doc):
                </label>
                <textarea
                  value={customRemarks}
                  onChange={(e) => setCustomRemarks(e.target.value)}
                  rows={3}
                  placeholder="Enter notes, caution advisory, or line clear details..."
                  className="w-full bg-surface-dark border border-border rounded-xl p-3 text-xs text-ink focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleGenerateTrainDossier}
                  disabled={isGenerating}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <FileText className={`w-4 h-4 ${isGenerating ? 'animate-pulse' : ''}`} />
                  <span>{isGenerating ? 'Creating Google Doc...' : `Generate Google Doc for Train ${selectedTrainObj.trainNumber}`}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'section-bulletin' && (
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-xs space-y-1.5 text-blue-900 dark:text-blue-200">
                <div className="font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span>Full Section Fleet Bulletin</span>
                </div>
                <p className="text-[11px] leading-relaxed text-ink/70 font-sans">
                  Compiles live telemetry, speed profiles, signal aspects, ML predicted ETAs, and high-risk bottleneck alerts for all {trains.length} running trains across the Western Railway mainline into a single master Google Doc.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold font-mono-code uppercase tracking-wider text-ink/70 mb-1.5">
                  Controller Remarks / Shift Handover Notes:
                </label>
                <textarea
                  value={customRemarks}
                  onChange={(e) => setCustomRemarks(e.target.value)}
                  rows={4}
                  placeholder="Enter shift notes, sectional speed restrictions, maintenance block details..."
                  className="w-full bg-surface-dark border border-border rounded-xl p-3 text-xs text-ink focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleGenerateSectionBulletin}
                  disabled={isGenerating}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <Activity className={`w-4 h-4 ${isGenerating ? 'animate-pulse' : ''}`} />
                  <span>{isGenerating ? 'Generating Master Bulletin...' : 'Generate Section Operations Bulletin in Google Docs'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'custom-memo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold font-mono-code uppercase tracking-wider text-ink/70 mb-1.5">
                  Document Title:
                </label>
                <input
                  type="text"
                  value={customDocTitle}
                  onChange={(e) => setCustomDocTitle(e.target.value)}
                  placeholder="e.g. IR Western Railway Maintenance Order"
                  className="w-full bg-surface-dark border border-border rounded-xl px-3.5 py-2.5 text-xs text-ink font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-mono-code uppercase tracking-wider text-ink/70 mb-1.5">
                  Document Body:
                </label>
                <textarea
                  value={customDocContent}
                  onChange={(e) => setCustomDocContent(e.target.value)}
                  rows={6}
                  placeholder="Write initial document content..."
                  className="w-full bg-surface-dark border border-border rounded-xl p-3 text-xs text-ink focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleGenerateCustomDoc}
                  disabled={isGenerating}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isGenerating ? 'Creating Custom Doc...' : 'Create Blank Custom Google Doc'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Google Drive Document Library (5 cols) */}
        <div className="lg:col-span-5 bg-surface p-6 rounded-3xl border border-border shadow-xs flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderSync className="w-5 h-5 text-blue-500" />
              <h2 className="text-base font-bold font-display tracking-tight text-ink">
                My Google Docs
              </h2>
            </div>
            <span className="text-xs font-mono-code text-ink/60 bg-surface-dark px-2.5 py-1 rounded-lg border border-border font-bold">
              {userDocs.length} Docs Found
            </span>
          </div>

          {/* Search Docs Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              type="text"
              value={searchDocQuery}
              onChange={(e) => setSearchDocQuery(e.target.value)}
              placeholder="Search saved documents..."
              className="w-full bg-surface-dark border border-border rounded-xl pl-9 pr-3.5 py-2 text-xs text-ink focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* List of Docs */}
          <div className="flex-1 overflow-y-auto max-h-[420px] space-y-2.5 pr-1">
            {!token ? (
              <div className="text-center py-10 px-4 bg-surface-dark rounded-2xl border border-border space-y-3">
                <Lock className="w-8 h-8 mx-auto text-ink/40" />
                <p className="text-xs text-ink/60 font-medium">
                  Connect your Google Account to view and manage your Google Docs.
                </p>
                <button
                  onClick={handleConnectGoogle}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-xs"
                >
                  Sign in with Google
                </button>
              </div>
            ) : isLoadingDocs ? (
              <div className="text-center py-10 space-y-2 text-ink/60 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                <p>Retrieving Google Docs from Drive...</p>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="text-center py-10 px-4 bg-surface-dark rounded-2xl border border-border space-y-2">
                <FileText className="w-8 h-8 mx-auto text-ink/30" />
                <p className="text-xs text-ink/60 font-medium">
                  {searchDocQuery ? 'No documents matched your search.' : 'No Google Docs found yet in your Drive. Create your first report above!'}
                </p>
              </div>
            ) : (
              filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 bg-surface-dark hover:bg-surface-dark/80 rounded-2xl border border-border transition-all flex flex-col gap-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-ink truncate group-hover:text-blue-500 transition-colors" title={doc.name}>
                          {doc.name}
                        </h4>
                        <span className="text-[10px] text-ink/50 font-mono-code block">
                          Modified: {doc.modifiedTime ? new Date(doc.modifiedTime).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px] font-mono-code">
                    <a
                      href={doc.webViewLink || `https://docs.google.com/document/d/${doc.id}/edit`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 hover:underline"
                    >
                      <span>Open in Docs</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setAppendDocTarget(doc);
                          setAppendText(`[${new Date().toLocaleTimeString()}] Live Telemetry Update: Train running normally.`);
                        }}
                        title="Append update to this document"
                        className="text-ink/60 hover:text-ink px-1.5 py-0.5 rounded hover:bg-surface cursor-pointer text-[10px]"
                      >
                        Append Update
                      </button>

                      {/* Delete Trigger - MUST open confirmation dialog */}
                      <button
                        onClick={() => setDeleteConfirmDoc(doc)}
                        title="Delete Document from Google Drive"
                        className="text-red-500/70 hover:text-red-500 p-1 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MANDATORY CONFIRMATION MODAL FOR DESTRUCTIVE OPERATION (DELETE GOOGLE DOC) */}
      {deleteConfirmDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface max-w-md w-full rounded-3xl border border-red-500/30 p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-red-500">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold font-display text-ink">
                  Confirm Delete Document
                </h3>
                <p className="text-[11px] text-ink/60 font-sans font-medium">
                  Google Workspace Deletion Confirmation
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-surface-dark rounded-xl border border-border text-xs text-ink/80 space-y-1">
              <div>Are you sure you want to permanently delete:</div>
              <div className="font-bold text-ink truncate font-mono-code">
                "{deleteConfirmDoc.name}"
              </div>
              <div className="text-[10px] text-red-500 font-medium pt-1">
                ⚠️ This action cannot be undone. The file will be removed from your Google Drive.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmDoc(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-surface-dark border border-border hover:bg-surface rounded-xl text-xs font-bold text-ink cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR APPENDING CONTENT TO EXISTING GOOGLE DOC */}
      {appendDocTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface max-w-lg w-full rounded-3xl border border-border p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <FileEdit className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold font-display text-ink">
                  Append to Google Document
                </h3>
                <p className="text-[11px] text-ink/60 font-sans font-medium">
                  Document: {appendDocTarget.name}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold font-mono-code uppercase tracking-wider text-ink/70 mb-1.5">
                Text to append to end of document:
              </label>
              <textarea
                value={appendText}
                onChange={(e) => setAppendText(e.target.value)}
                rows={4}
                placeholder="Enter log entry, speed report, or controller notes..."
                className="w-full bg-surface-dark border border-border rounded-xl p-3 text-xs text-ink focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setAppendDocTarget(null)}
                disabled={isAppending}
                className="px-4 py-2 bg-surface-dark border border-border hover:bg-surface rounded-xl text-xs font-bold text-ink cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAppend}
                disabled={isAppending || !appendText.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isAppending ? 'Appending...' : 'Confirm & Append Text'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
