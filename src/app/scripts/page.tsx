'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/storage/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScriptItem, ScriptReviewFeedback, CONTENT_PILLARS } from '@/types';
import {
  FileEdit,
  Sparkles,
  Copy,
  Check,
  Video,
  Clock,
  Trash2,
  Plus,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  Wand2,
  Layers,
  HelpCircle,
  Type,
  AlignLeft,
} from 'lucide-react';

const formatDate = (dateStr?: string) => (dateStr ? dateStr.slice(0, 10) : '');

export default function ScriptStudioPage() {
  const {
    scripts,
    updateScript,
    addScript,
    deleteScript,
    styleProfile,
    updateStyleProfile,
    aiConfig,
  } = useApp();

  const [activeScriptId, setActiveScriptId] = useState<string>(
    scripts[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<'editor' | 'shotlist' | 'reviewer' | 'teleprompter' | 'style'>('editor');
  const [copied, setCopied] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState<ScriptReviewFeedback | null>(null);

  // Style form state
  const [speakingRhythm, setSpeakingRhythm] = useState(styleProfile.speakingRhythm);
  const [sentenceLength, setSentenceLength] = useState(styleProfile.sentenceLengthPreference);
  const [avoidWordsStr, setAvoidWordsStr] = useState(styleProfile.avoidWords.join(', '));
  const [signatureExpressionsStr, setSignatureExpressionsStr] = useState(styleProfile.signatureExpressions.join(', '));
  const [styleSaved, setStyleSaved] = useState(false);

  const activeScript = scripts.find((s) => s.id === activeScriptId) || scripts[0];

  // Duration calculation at 145 wpm benchmark
  const words = (activeScript?.currentSpokenScript || '').trim().split(/\s+/).filter(Boolean).length;
  const estimatedSeconds = Math.round((words / 145) * 60);

  const handleSelectHook = (index: number) => {
    if (!activeScript) return;
    const chosenHook = activeScript.hookOptions[index];
    const lines = activeScript.currentSpokenScript.split('\n');
    lines[0] = chosenHook;
    updateScript(activeScript.id, {
      selectedHookIndex: index,
      currentSpokenScript: lines.join('\n'),
    });
  };

  const handleAIRefine = async (action: 'naturalize' | 'shorten' | 'expand' | 'change_hook') => {
    if (!activeScript) return;
    setIsRefining(true);
    try {
      const res = await fetch('/api/ai/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          script: activeScript,
          styleProfile,
          aiConfig,
        }),
      });
      const data = await res.json();
      if (data.revisedText) {
        updateScript(activeScript.id, {
          currentSpokenScript: data.revisedText,
          version: activeScript.version + 1,
        });
      }
    } catch (e) {
      console.error('Refine failed:', e);
    } finally {
      setIsRefining(false);
    }
  };

  const handleRunScriptReview = async () => {
    if (!activeScript) return;
    setIsReviewing(true);
    setReviewFeedback(null);
    try {
      const res = await fetch('/api/ai/review-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptText: activeScript.currentSpokenScript,
          title: activeScript.title,
          pillar: activeScript.pillar,
          aiConfig,
        }),
      });
      const data = await res.json();
      if (data.feedback) {
        setReviewFeedback(data.feedback);
      }
    } catch (e) {
      console.error('Review failed:', e);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleSaveStyleProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateStyleProfile({
      speakingRhythm,
      sentenceLengthPreference: sentenceLength,
      avoidWords: avoidWordsStr.split(',').map((w) => w.trim()).filter(Boolean),
      signatureExpressions: signatureExpressionsStr.split(',').map((w) => w.trim()).filter(Boolean),
    });
    setStyleSaved(true);
    setTimeout(() => setStyleSaved(false), 2000);
  };

  const handleCopyScript = () => {
    if (!activeScript) return;
    navigator.clipboard.writeText(activeScript.currentSpokenScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateBlankScript = () => {
    const newScript = addScript({
      title: 'Untitled Video Script',
      pillar: 'BUILDING_PROJECTS_AND_SYSTEMS',
      hookOptions: ['Stop doing X the hard way.', 'If you want to master X, remember this.', 'The non-obvious rule for X.'],
      selectedHookIndex: 0,
      spokenScriptShort: 'Hook statement.\n\nKey lesson.\n\nSave this post!',
      spokenScriptLong: 'Hook statement.\n\nContext explanation.\n\nDemonstration.\n\nCall to action.',
      currentSpokenScript: 'Stop doing X the hard way. Here is the realistic fix:\n\n1. Standardize input.\n2. Isolate friction.\n3. Measure outcomes.\n\nSave this Reel for your next build sprint!',
      shotList: [
        { shotNumber: 1, visual: 'Direct to camera', audioSpoken: 'Opening Hook', durationSeconds: 5 },
      ],
      bRollSuggestions: ['Terminal demo', 'Screen recording'],
      onScreenTextList: ['STOP DOING THIS 🛑'],
      caption: 'A practical breakdown of content workflows. Save this for your next build! 🚀',
      callToAction: 'Save this video for your next build sprint!',
      coverTitle: 'UNTITLED PLAYBOOK',
      structureType: 'Problem, Explanation, Solution',
      tone: 'Direct, conversational',
      estimatedDurationSeconds: 25,
      status: 'draft',
    });
    setActiveScriptId(newScript.id);
  };

  const handleDeleteScript = (idToDelete: string) => {
    const remaining = scripts.filter((s) => s.id !== idToDelete);
    deleteScript(idToDelete);
    if (remaining.length > 0) {
      setActiveScriptId(remaining[0].id);
    } else {
      setActiveScriptId('');
    }
  };

  if (!activeScript) {
    return (
      <div className="p-12 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-4">
        <FileEdit className="w-8 h-8 text-neutral-400 mx-auto" />
        <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">No scripts created yet</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
          Start writing your first short-form video script or select an idea from your library.
        </p>
        <Button onClick={handleCreateBlankScript} variant="primary" size="sm">
          <Plus className="w-3.5 h-3.5 mr-1" /> Create Blank Script
        </Button>
      </div>
    );
  }

  const pillarInfo = CONTENT_PILLARS.find((p) => p.id === activeScript.pillar);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Script Switcher */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Script Studio
            </h2>
            <Badge variant="purple" className="text-xs font-mono">
              Short-Form Teleprompter
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Shot-by-shot writing, teleprompter pacing, voice profiling, and integrated script reviewing.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Script Selector */}
          <select
            value={activeScript.id}
            onChange={(e) => setActiveScriptId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 cursor-pointer max-w-xs truncate"
          >
            {scripts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.status})
              </option>
            ))}
          </select>

          <Button onClick={handleCreateBlankScript} variant="outline" size="sm" className="text-xs cursor-pointer">
            <Plus className="w-3.5 h-3.5 mr-1" /> New Script
          </Button>

          <Button
            onClick={() => handleDeleteScript(activeScript.id)}
            variant="outline"
            size="sm"
            className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 cursor-pointer"
            title="Delete this script draft"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1 text-rose-500" />
            Delete Draft
          </Button>

          <Button
            onClick={() => {
              const nextStatus = activeScript.status === 'ready_for_filming' ? 'draft' : 'ready_for_filming';
              updateScript(activeScript.id, { status: nextStatus });
            }}
            variant={activeScript.status === 'ready_for_filming' ? 'primary' : 'outline'}
            size="sm"
            className="text-xs cursor-pointer"
          >
            <Video className="w-3.5 h-3.5 mr-1" />
            {activeScript.status === 'ready_for_filming' ? 'Marked: Ready to Shoot' : 'Mark Ready to Shoot'}
          </Button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            Script Editor
          </button>
          <button
            onClick={() => setActiveTab('shotlist')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'shotlist'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            Shot List & B-Roll ({activeScript.shotList.length})
          </button>
          <button
            onClick={() => setActiveTab('reviewer')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reviewer'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Sparkles className="w-3 h-3 text-purple-500" />
            <span>Script Reviewer</span>
          </button>
          <button
            onClick={() => setActiveTab('teleprompter')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'teleprompter'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Play className="w-3 h-3" />
            <span>Teleprompter</span>
          </button>
          <button
            onClick={() => setActiveTab('style')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'style'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>Voice Profile</span>
          </button>
        </div>

        {/* Word count & pacing telemetry */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 font-mono">
          <span>Words: <strong>{words}</strong></span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-neutral-400" />
            <span>~{estimatedSeconds}s at 145 wpm</span>
          </span>
        </div>
      </div>

      {/* TAB 1: SCRIPT EDITOR */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Spoken Script (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
              {/* Title input & delete action */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={activeScript.title}
                    onChange={(e) => updateScript(activeScript.id, { title: e.target.value })}
                    className="w-full text-base font-bold text-neutral-900 dark:text-neutral-100 border-none bg-transparent focus:outline-none"
                    placeholder="Script Title"
                  />
                  <div className="text-[11px] text-neutral-400">
                    Version {activeScript.version} • Last updated {formatDate(activeScript.updatedAt)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteScript(activeScript.id)}
                  className="p-2 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer transition-colors"
                  title="Delete this script draft"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                </button>
              </div>

              {/* Hook Options Carousel */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Hook Variations (Select to set opening sentence):
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {activeScript.hookOptions.map((hook, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectHook(idx)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                        activeScript.selectedHookIndex === idx
                          ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 text-purple-950 dark:text-purple-200 font-medium'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                      }`}
                    >
                      <span>&ldquo;{hook}&rdquo;</span>
                      {activeScript.selectedHookIndex === idx && (
                        <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spoken Audio Textarea */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  <span>Spoken Script (Spoken directly to camera):</span>
                  <button
                    onClick={handleCopyScript}
                    className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <textarea
                  rows={10}
                  value={activeScript.currentSpokenScript}
                  onChange={(e) => updateScript(activeScript.id, { currentSpokenScript: e.target.value })}
                  className="w-full p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs font-sans leading-relaxed focus:outline-none focus:ring-1 focus:ring-neutral-400 resize-y"
                />
              </div>

              {/* AI Polish & Refine Bar */}
              <div className="p-3 bg-neutral-100/70 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-700 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>AI Refinement:</span>
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Button
                    onClick={() => handleAIRefine('naturalize')}
                    variant="outline"
                    size="sm"
                    isLoading={isRefining}
                    className="text-xs h-7 px-2"
                    title="Remove corporate words and make it sound completely conversational"
                  >
                    Naturalize Spoken Tone
                  </Button>
                  <Button
                    onClick={() => handleAIRefine('shorten')}
                    variant="outline"
                    size="sm"
                    isLoading={isRefining}
                    className="text-xs h-7 px-2"
                    title="Cut filler words for tighter pacing"
                  >
                    Shorten 30%
                  </Button>
                  <Button
                    onClick={() => handleAIRefine('expand')}
                    variant="outline"
                    size="sm"
                    isLoading={isRefining}
                    className="text-xs h-7 px-2"
                    title="Add concrete proof or terminal demonstration"
                  >
                    Add Proof
                  </Button>
                  <Button
                    onClick={() => handleAIRefine('change_hook')}
                    variant="outline"
                    size="sm"
                    isLoading={isRefining}
                    className="text-xs h-7 px-2"
                    title="Generate alternative hooks"
                  >
                    New Hook
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata & Shooting Notes (1 col) */}
          <div className="space-y-4 text-xs">
            {/* Caption & CTA */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Post Caption & CTA</h3>
              <div>
                <label className="font-semibold text-neutral-500 block mb-1">Call to Action Phrase:</label>
                <input
                  type="text"
                  value={activeScript.callToAction}
                  onChange={(e) => updateScript(activeScript.id, { callToAction: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-500 block mb-1">Caption Text:</label>
                <textarea
                  rows={5}
                  value={activeScript.caption}
                  onChange={(e) => updateScript(activeScript.id, { caption: e.target.value })}
                  className="w-full p-2.5 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>

            {/* Shooting & Editing Guidance */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Shooting & Editing Notes</h3>
              <div>
                <label className="font-semibold text-neutral-500 block mb-1">Shooting Plan:</label>
                <textarea
                  rows={2}
                  value={activeScript.shootingPlan || ''}
                  onChange={(e) => updateScript(activeScript.id, { shootingPlan: e.target.value })}
                  placeholder="e.g. Desk setup, 24fps 1080x1920 vertical, record 3 hook takes."
                  className="w-full p-2.5 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-500 block mb-1">Editing Guidance:</label>
                <textarea
                  rows={2}
                  value={activeScript.editingNotes || ''}
                  onChange={(e) => updateScript(activeScript.id, { editingNotes: e.target.value })}
                  placeholder="e.g. Fast jump cuts on breath pauses, punch in on key numbers."
                  className="w-full p-2.5 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SHOT LIST & B-ROLL */}
      {activeTab === 'shotlist' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Shot-by-Shot Visual Director Board
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Synchronize on-camera talking head shots with B-roll screen recordings and on-screen text overlays.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {activeScript.shotList.map((shot, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800 space-y-3"
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100">
                    Shot #{shot.shotNumber}
                  </span>
                  <span className="text-neutral-400 font-mono">Duration: {shot.durationSeconds}s</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-neutral-500 block mb-1">Visual Direction:</label>
                    <p className="text-neutral-800 dark:text-neutral-200">{shot.visual}</p>
                  </div>
                  <div>
                    <label className="font-semibold text-neutral-500 block mb-1">Spoken Line:</label>
                    <p className="text-neutral-800 dark:text-neutral-200 italic">&ldquo;{shot.audioSpoken}&rdquo;</p>
                  </div>
                  <div>
                    <label className="font-semibold text-neutral-500 block mb-1">On-Screen Text:</label>
                    <Badge variant="outline" className="text-[11px] font-mono">
                      {shot.onScreenText || 'No text overlay'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* B-Roll Suggestions List */}
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-800/40 space-y-2 text-xs">
            <h4 className="font-bold text-neutral-900 dark:text-neutral-100">Suggested B-Roll Footage to Record:</h4>
            <ul className="list-disc list-inside space-y-1 text-neutral-600 dark:text-neutral-400">
              {activeScript.bRollSuggestions.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* TAB 3: INTEGRATED SCRIPT REVIEWER */}
      {activeTab === 'reviewer' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Script Reviewer (12-Dimension Audit)
                </h3>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xl">
                Evaluates hook clarity, retention potential, pacing, credibility, and unsupported claims. Provides specific suggestions without pretending subjective scores guarantee algorithm virality.
              </p>
            </div>

            <Button
              onClick={handleRunScriptReview}
              variant="primary"
              size="sm"
              isLoading={isReviewing}
              className="text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Run Script Audit
            </Button>
          </div>

          {reviewFeedback ? (
            <div className="space-y-4">
              {/* Top Score Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
                  <span className="text-neutral-500 block font-medium">Hook Clarity</span>
                  <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {reviewFeedback.hookClarity.score}/100
                  </span>
                  <p className="text-[11px] text-neutral-500 pt-1 line-clamp-2">{reviewFeedback.hookClarity.critique}</p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
                  <span className="text-neutral-500 block font-medium">Retention Potential</span>
                  <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {reviewFeedback.retentionPotential.score}/100
                  </span>
                  <p className="text-[11px] text-neutral-500 pt-1 line-clamp-2">{reviewFeedback.retentionPotential.critique}</p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
                  <span className="text-neutral-500 block font-medium">Pacing & Flow</span>
                  <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {reviewFeedback.pacing.score}/100
                  </span>
                  <p className="text-[11px] text-neutral-500 pt-1 line-clamp-2">{reviewFeedback.pacing.critique}</p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
                  <span className="text-neutral-500 block font-medium">Usefulness & Value</span>
                  <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {reviewFeedback.usefulness.score}/100
                  </span>
                  <p className="text-[11px] text-neutral-500 pt-1 line-clamp-2">{reviewFeedback.usefulness.critique}</p>
                </div>
              </div>

              {/* Suggestions & Red Flags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3">
                  <h4 className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Actionable Revision Suggestions:</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1.5 text-neutral-700 dark:text-neutral-300">
                    {reviewFeedback.overallSuggestions.map((sug, i) => (
                      <li key={i}>{sug}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3">
                  <h4 className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Repetition & Unsupported Claims Flags:</span>
                  </h4>
                  {reviewFeedback.unsupportedClaims.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-amber-700 dark:text-amber-300">
                      {reviewFeedback.unsupportedClaims.map((claim, i) => (
                        <li key={i}>{claim}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-neutral-500 dark:text-neutral-400">
                      No exaggerated or unsupported claims detected. The script is grounded in realistic execution.
                    </p>
                  )}

                  <div className="pt-2 text-[11px] text-neutral-500">
                    <span className="font-semibold block mb-0.5">Repetition check:</span>
                    <span>{reviewFeedback.repetitionDetected.join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-neutral-900 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-2">
              <Sparkles className="w-6 h-6 text-neutral-400 mx-auto" />
              <p className="text-xs text-neutral-500">Click &ldquo;Run Script Audit&rdquo; to analyze this script across all 12 retention and clarity dimensions.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: TELEPROMPTER / REHEARSAL */}
      {activeTab === 'teleprompter' && (
        <div className="bg-neutral-900 text-white rounded-2xl p-8 sm:p-12 shadow-xl space-y-8 max-w-3xl mx-auto">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4 text-xs font-mono">
            <span className="text-neutral-400">TELEPROMPTER MODE</span>
            <span className="text-emerald-400">TARGET: 145 WPM (~{estimatedSeconds}s)</span>
          </div>

          <div className="space-y-6 text-xl sm:text-2xl font-medium leading-relaxed tracking-wide font-sans">
            {activeScript.currentSpokenScript.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="text-neutral-100">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400 font-mono">
            <span>CTA: &ldquo;{activeScript.callToAction}&rdquo;</span>
            <Button onClick={handleCopyScript} variant="outline" size="sm" className="text-xs text-white border-neutral-700 bg-neutral-800">
              {copied ? 'Copied to Clipboard' : 'Copy Full Script'}
            </Button>
          </div>
        </div>
      )}

      {/* TAB 5: PERSONAL STYLE PROFILE */}
      {activeTab === 'style' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4 max-w-2xl">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Personal Speaking Style Profile
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Configure your unique rhythm, sentence length preference, signature expressions, and words to avoid.
              </p>
            </div>
            {styleSaved && (
              <Badge variant="success" className="text-xs">
                Saved!
              </Badge>
            )}
          </div>

          <form onSubmit={handleSaveStyleProfile} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Speaking Rhythm & Cadence
              </label>
              <input
                type="text"
                value={speakingRhythm}
                onChange={(e) => setSpeakingRhythm(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Sentence Length Preference
              </label>
              <select
                value={sentenceLength}
                onChange={(e) => setSentenceLength(e.target.value as 'punchy' | 'moderate' | 'conversational')}
                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              >
                <option value="punchy">Punchy (Short, staccato statements)</option>
                <option value="moderate">Moderate (Balanced sentences with natural rhythm)</option>
                <option value="conversational">Conversational (Fluid, peer-to-peer coffee talk)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Words & Corporate Fluff to Strictly Avoid (comma-separated)
              </label>
              <textarea
                rows={2}
                value={avoidWordsStr}
                onChange={(e) => setAvoidWordsStr(e.target.value)}
                className="w-full p-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Signature Expressions & Phrases (comma-separated)
              </label>
              <textarea
                rows={2}
                value={signatureExpressionsStr}
                onChange={(e) => setSignatureExpressionsStr(e.target.value)}
                className="w-full p-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" size="sm">
                Save Style Profile
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
