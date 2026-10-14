'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/lib/storage/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VideoAnalysis } from '@/types';
import { formatDuration } from '@/lib/utils';
import {
  Video,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Check,
  Clock,
  Layers,
  FileText,
  Sliders,
  ChevronRight,
  Trash2,
} from 'lucide-react';

export default function ReelAnalyzerPage() {
  const { videoAnalyses, addVideoAnalysis, deleteVideoAnalysis, aiConfig } = useApp();
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>(
    videoAnalyses[0]?.id || ''
  );

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');
  const [videoMeta, setVideoMeta] = useState<{
    duration: number;
    width: number;
    height: number;
    size: number;
  } | null>(null);

  const [inputTranscript, setInputTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeAnalysis =
    videoAnalyses.find((v) => v.id === selectedAnalysisId) || videoAnalyses[0];

  // Handle client-side video file selection & HTML5 metadata extraction
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreviewUrl(url);

    // Extract metadata using HTML5 Video element
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.src = url;
    tempVideo.onloadedmetadata = () => {
      setVideoMeta({
        duration: tempVideo.duration,
        width: tempVideo.videoWidth,
        height: tempVideo.videoHeight,
        size: file.size,
      });
      if (!inputTranscript) {
        setInputTranscript(
          `Stop spending forty dollars a month on cloud APIs just to test small AI experiments. Here is how to run Llama 3.2 locally on any laptop with zero lag...`
        );
      }
    };
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai/analyze-reel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: uploadFile?.name || 'uploaded_reel.mp4',
          durationSeconds: videoMeta?.duration ? Math.round(videoMeta.duration) : 42,
          resolution: videoMeta ? `${videoMeta.width}x${videoMeta.height}` : '1080x1920',
          fileSizeBytes: videoMeta?.size || 18500000,
          transcript: inputTranscript,
          aiConfig,
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        const saved = addVideoAnalysis(data.analysis);
        setSelectedAnalysisId(saved.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Reel Video Analyzer</h2>
            <Badge variant="purple" className="text-xs font-mono">
              Retention & Pacing Engine
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 max-w-2xl">
            Upload raw video footage or transcripts to audit hook strength, narrative section pacing, repetition,
            and Call to Action effectiveness before publishing.
          </p>
        </div>

        {videoAnalyses.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={activeAnalysis?.id || ''}
              onChange={(e) => setSelectedAnalysisId(e.target.value)}
              className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-900 bg-white"
            >
              {videoAnalyses.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.filename} ({Math.round(v.durationSeconds)}s)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Uploader / Ingestion Section */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-neutral-900">Upload Video & Ingest Spoken Audio</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* File drag/drop box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-neutral-300 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-neutral-900 hover:bg-neutral-50/50 transition-all"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="video/mp4,video/quicktime,video/webm"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="w-8 h-8 text-neutral-400 mb-2" />
            <div className="text-xs font-semibold text-neutral-900">
              {uploadFile ? uploadFile.name : 'Click to upload Reel video (.mp4, .mov)'}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              {videoMeta
                ? `${videoMeta.width}x${videoMeta.height} • ${formatDuration(
                    videoMeta.duration
                  )} • ${(videoMeta.size / (1024 * 1024)).toFixed(1)} MB`
                : 'Extracts resolution, duration, aspect ratio & audio stream'}
            </p>
          </div>

          {/* Transcript input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700">
              Spoken Transcript (Auto-extracted or paste manually):
            </label>
            <textarea
              rows={4}
              placeholder="Paste or review the spoken audio transcript here..."
              value={inputTranscript}
              onChange={(e) => setInputTranscript(e.target.value)}
              className="w-full p-3 border border-neutral-300 rounded-xl text-xs text-neutral-800 leading-relaxed focus:ring-1 focus:ring-neutral-900"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end">
          <Button
            onClick={handleRunAnalysis}
            variant="primary"
            size="sm"
            isLoading={isAnalyzing}
            className="text-xs bg-neutral-900 hover:bg-neutral-800 font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
            Audit Hook & Narrative Pacing
          </Button>
        </div>
      </div>

      {/* Analysis Results View */}
      {activeAnalysis && (
        <div className="space-y-6">
          {/* Key Scores Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-white border border-neutral-200/90 rounded-xl shadow-xs text-center">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
                Hook Strength
              </span>
              <div className="text-2xl font-bold text-neutral-900">
                {activeAnalysis.hookScore}/100
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">Scroll-stopping</span>
            </div>

            <div className="p-4 bg-white border border-neutral-200/90 rounded-xl shadow-xs text-center">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
                Clarity Score
              </span>
              <div className="text-2xl font-bold text-neutral-900">
                {activeAnalysis.clarityScore}/100
              </div>
              <span className="text-[10px] text-neutral-500">Low cognitive friction</span>
            </div>

            <div className="p-4 bg-white border border-neutral-200/90 rounded-xl shadow-xs text-center">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
                Visual Variety
              </span>
              <div className="text-2xl font-bold text-neutral-900">
                {activeAnalysis.visualVarietyScore}/100
              </div>
              <span className="text-[10px] text-neutral-500">Fast visual cuts</span>
            </div>

            <div className="p-4 bg-white border border-neutral-200/90 rounded-xl shadow-xs text-center">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
                Estimated Duration
              </span>
              <div className="text-2xl font-bold text-neutral-900">
                {Math.round(activeAnalysis.durationSeconds)}s
              </div>
              <span className="text-[10px] text-neutral-500 font-mono">{activeAnalysis.resolution}</span>
            </div>
          </div>

          {/* Hook Critique & Suggested Alternatives */}
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-neutral-900">Hook Audit & Scroll-Stopping Velocity</h3>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {activeAnalysis.hookCritique}
            </p>

            <div className="pt-2">
              <span className="text-xs font-semibold text-neutral-900 block mb-2">
                Stronger Suggested Variations:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {activeAnalysis.suggestedHooks.map((h, i) => (
                  <div
                    key={i}
                    className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-neutral-800 italic"
                  >
                    &ldquo;{h}&rdquo;
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Narrative Flow Breakdown */}
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900">Narrative Section Breakdown</h3>

            <div className="space-y-3">
              {activeAnalysis.narrativeSections.map((sec, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-neutral-50/70 border border-neutral-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-neutral-400">
                        {formatDuration(sec.startSec)} &rarr; {formatDuration(sec.endSec)}
                      </span>
                      <strong className="text-neutral-900">{sec.title}</strong>
                    </div>
                    <p className="text-neutral-500 text-[11px]">{sec.summary}</p>
                  </div>

                  <Badge variant="purple" className="text-[10px] shrink-0 font-mono">
                    Flow: {sec.flowScore}/100
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Revised Script & Pre-Publish Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-neutral-900">AI-Tightened Revised Script</h3>
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 text-xs text-neutral-800 leading-relaxed whitespace-pre-line font-sans">
                {activeAnalysis.revisedScript}
              </div>
              <div className="text-[11px] text-neutral-500">
                <strong>Repetition flagged:</strong> {activeAnalysis.repetitionDetected[0] || 'None detected.'}
              </div>
            </div>

            <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-neutral-900">Pre-Publish Verification Checklist</h3>
              <div className="space-y-2 text-xs">
                {activeAnalysis.prePublishChecklist.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center justify-between"
                  >
                    <span className="text-neutral-700">{item.item}</span>
                    <Badge variant={item.passed ? 'success' : 'warning'} className="text-[10px]">
                      {item.passed ? 'Passed' : 'Review'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
