import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Train, MapPin, Share2, Compass, Radio, FileText, ExternalLink, Check } from 'lucide-react';
import { TrainData } from '../../types';
import { exportTrainDossierToGoogleDocs } from '../../services/googleDocsService';

interface SelectedTrainBannerProps {
  train: TrainData | null;
  onOpenMap?: () => void;
  onOpenXAI?: () => void;
  onOpenSimulation?: () => void;
  onOpenDocs?: () => void;
}

export const SelectedTrainBanner: React.FC<SelectedTrainBannerProps> = ({
  train,
  onOpenMap,
  onOpenXAI,
  onOpenSimulation,
  onOpenDocs
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);

  if (!train) return null;

  const isDelayed = train.currentDelayMinutes > 0;

  const handleQuickExportDocs = async () => {
    setIsExporting(true);
    try {
      const res = await exportTrainDossierToGoogleDocs(train);
      if (res.success && res.documentUrl) {
        setExportedUrl(res.documentUrl);
        window.open(res.documentUrl, '_blank');
      } else {
        alert(res.error || 'Please connect your Google Account in the Google Docs tab.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to export to Google Docs.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-dark text-ink rounded-3xl p-6 lg:p-8 border border-border flex flex-col gap-6 shadow-sm"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="bg-accent/15 text-accent font-bold text-xs px-3 py-1 rounded font-mono-code uppercase tracking-wider">
          Section Controller Live
        </span>
        <span className={`font-bold text-xs px-3 py-1 rounded font-mono-code uppercase tracking-wider border ${
          isDelayed 
            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' 
            : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
        }`}>
          {isDelayed ? `Delayed +${train.currentDelayMinutes}m` : 'Running On-Time'}
        </span>
        <span className="flex items-center gap-1 text-[11px] font-mono-code text-ink/70 bg-surface px-2.5 py-1 rounded border border-border">
          <Compass className="w-3.5 h-3.5 text-accent" />
          Map-Matched to Track Polyline
        </span>
      </div>

      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
            {train.trainNumber} · {train.trainName}
          </h1>
          <p className="font-medium text-ink/80 mt-3 text-sm sm:text-base leading-relaxed">
            {train.sourceName} &rarr; {train.destinationName} • Near <span className="font-bold text-ink">{train.currentLocationName}</span> • <span className="font-mono-code text-accent font-bold">{train.distanceToNextStationKm.toFixed(1)} km</span> to {train.nextStationName} at <span className="text-accent font-mono-code font-bold">{train.currentSpeedKmH} km/h</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleQuickExportDocs}
            disabled={isExporting}
            title="Export train telemetry & ML ETA dossier to Google Docs"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            <span>{isExporting ? 'Creating Doc...' : 'Export to Google Docs'}</span>
          </button>
          {onOpenSimulation && (
            <button
              onClick={onOpenSimulation}
              className="bg-surface hover:bg-accent/10 text-ink border border-border font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl transition-colors cursor-pointer"
            >
              What-If ML
            </button>
          )}
          {onOpenXAI && (
            <button
              onClick={onOpenXAI}
              className="bg-surface hover:bg-accent/10 text-ink border border-border font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl transition-colors cursor-pointer"
            >
              Explain Delay
            </button>
          )}
          {onOpenMap && (
            <button 
              onClick={onOpenMap}
              className="bg-accent text-on-accent font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0 cursor-pointer shadow-xs"
            >
              <MapPin className="w-4 h-4" /> Live Map
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

