'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/storage/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScriptItem, ScriptShot, StyleProfile } from '@/types';
import {
  FileEdit,
  Sparkles,
  Copy,
  Check,
  Video,
  Clock,
  Layers,
  Sliders,
  RotateCcw,
  CheckCircle2,
  Trash2,
  Plus,
  SlidersHorizontal,
  Volume2,
  AlertCircle,
  Eye,
  Type,
  AlignLeft,
  Wand2,
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'editor' | 'shotlist' | 'metadata' | 'style'>('editor');
  const [copied, setCopied] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [styleSampleInput, setStyleSampleInput] = useState('');
  const [newAvoidWord, setNewAvoidWord] = useState('');

  const activeScript = scripts.find((s) => s.id === activeScriptId) || scripts[0];

  if (!activeScript) {
    return (
      <div className="p-12 text-center bg-white border border-neutral-200 rounded-2xl">
        <h3 className="text-sm font-bold text-neutral-900">No scripts created yet</h3>
        <p className="text-xs text-neutral-500 mt-1">Select an idea from Content Ideas to generate your first script.</p>
      </div>
    );
  }

  // Calculate word count & estimated duration
  const words = activeScript.currentSpokenScript.trim().split(/\s+/).filter(Boolean).length;
  const estimatedSeconds = Math.round((words / 145) * 60);

  const handleSelectHook = (index: number) => {
    const chosenHook = activeScript.hookOptions[index];
    const lines = activeScript.currentSpokenScript.split('\n');
    lines[0] = chosenHook; // Replace first line with hook
    updateScript(activeScript.id, {
      selectedHookIndex: index,
      currentSpokenScript: lines.join('\n'),
    });
  };

  const handleAIRefine = async (action: 'naturalize' | 'shorten' | 'expand' | 'change_hook') => {
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
      console.error(e);
    } finally {
      setIsRefining(false);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(activeScript.currentSpokenScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddAvoidWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAvoidWord) return;
    updateStyleProfile({
      avoidWords: [...styleProfile.avoidWords, newAvoidWord.toLowerCase()],
    });
    setNewAvoidWord('');
  };

  const handleAddSample = (e: React.FormEvent) => {
    e.preventDefault();
    if (!styleSampleInput.trim()) return;
    updateStyleProfile({
      sampleTranscripts: [styleSampleInput.trim(), ...styleProfile.sampleTranscripts],
    });
    setStyleSampleInput('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Script Header & Controls */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <select
            value={activeScript.id}
            onChange={(e) => setActiveScriptId(e.target.value)}
            className="px-3 py-1.5 border border-neutral-300 rounded-lg text-sm font-semibold text-neutral-900 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
          >
            {scripts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} (v{s.version})
              </option>
            ))}
          </select>

          <Badge
            variant={activeScript.status === 'ready_for_filming' ? 'success' : 'secondary'}
            className="text-[10px] uppercase font-mono"
          >
            {activeScript.status.replace(/_/g, ' ')}
          </Badge>

          <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
            ~{estimatedSeconds}s • {words} words
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleCopyScript}
            variant="outline"
            size="sm"
            className="text-xs"
            title="Copy spoken script to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>

          <Button
            onClick={() =>
              updateScript(activeScript.id, {
                status: activeScript.status === 'ready_for_filming' ? 'draft' : 'ready_for_filming',
              })
            }
            variant={activeScript.status === 'ready_for_filming' ? 'secondary' : 'primary'}
            size="sm"
            className="text-xs font-semibold"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            {activeScript.status === 'ready_for_filming' ? 'Mark as Draft' : 'Mark Ready to Film'}
          </Button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-1 border-b border-neutral-200 text-xs">
        {[
          { id: 'editor', label: 'Spoken Script & Hooks', icon: AlignLeft },
          { id: 'shotlist', label: 'Shot-by-Shot Director Plan', icon: Video },
          { id: 'metadata', label: 'Caption, CTA & Cover', icon: Type },
          { id: 'style', label: 'Personal Voice Profile', icon: SlidersHorizontal },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-neutral-900 text-neutral-900 font-semibold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Editor & Hooks */}
      {activeTab === 'editor' && (
        <div className="space-y-6">
          {/* Alternative Hooks Selector */}
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  3 Tested Opening Hook Alternatives
                </h3>
              </div>
              <span className="text-[11px] text-neutral-400">Click to swap into script</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {activeScript.hookOptions.map((hook, index) => {
                const isSelected = activeScript.selectedHookIndex === index;
                return (
                  <div
                    key={index}
                    onClick={() => handleSelectHook(index)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900 shadow-2xs'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
                      <span className="font-mono font-semibold">HOOK #{index + 1}</span>
                      {isSelected && <Badge variant="default" className="text-[9px] py-0">ACTIVE</Badge>}
                    </div>
                    <p className="text-neutral-800 font-medium leading-relaxed italic">
                      &ldquo;{hook}&rdquo;
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Spoken Script Editor & AI Polish Toolbar */}
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-neutral-900">Spoken Script</span>
                {/* Version switcher */}
                <div className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 p-0.5 text-xs">
                  <button
                    onClick={() =>
                      updateScript(activeScript.id, {
                        currentSpokenScript: activeScript.spokenScriptShort || activeScript.currentSpokenScript,
                      })
                    }
                    className="px-2.5 py-0.5 rounded text-[11px] font-medium text-neutral-700 hover:bg-white"
                  >
                    Short (30s)
                  </button>
                  <button
                    onClick={() =>
                      updateScript(activeScript.id, {
                        currentSpokenScript: activeScript.spokenScriptLong || activeScript.currentSpokenScript,
                      })
                    }
                    className="px-2.5 py-0.5 rounded text-[11px] font-medium text-neutral-700 hover:bg-white"
                  >
                    Long (60s)
                  </button>
                </div>
              </div>

              {/* AI Quick Polish Actions */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <Button
                  onClick={() => handleAIRefine('naturalize')}
                  variant="outline"
                  size="sm"
                  isLoading={isRefining}
                  className="text-xs h-7 px-2"
                  title="Remove corporate words and make spoken phrasing natural"
                >
                  <Wand2 className="w-3 h-3 mr-1 text-purple-600" />
                  Naturalize
                </Button>

                <Button
                  onClick={() => handleAIRefine('shorten')}
                  variant="outline"
                  size="sm"
                  isLoading={isRefining}
                  className="text-xs h-7 px-2"
                  title="Cut 30% of words for faster pacing"
                >
                  Shorten
                </Button>

                <Button
                  onClick={() => handleAIRefine('expand')}
                  variant="outline"
                  size="sm"
                  isLoading={isRefining}
                  className="text-xs h-7 px-2"
                  title="Add concrete proof or example"
                >
                  Expand
                </Button>
              </div>
            </div>

            {/* Editable Script Textarea */}
            <div>
              <textarea
                rows={10}
                value={activeScript.currentSpokenScript}
                onChange={(e) =>
                  updateScript(activeScript.id, { currentSpokenScript: e.target.value })
                }
                placeholder="Write your spoken script here..."
                className="w-full p-4 border border-neutral-200 rounded-xl text-sm text-neutral-900 leading-relaxed font-sans focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-neutral-50/40"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-neutral-500" />
                Reading speed benchmark: 145 wpm
              </span>
              <span>
                Structure: <strong>{activeScript.structureType}</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Shot-by-Shot Director Plan */}
      {activeTab === 'shotlist' && (
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Shot-by-Shot Visual Director</h3>
              <p className="text-xs text-neutral-500">
                Visual framing, on-screen text callouts, and B-roll cues aligned with spoken audio.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {activeScript.shotList.map((shot, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <span className="font-bold text-neutral-900">SHOT 0{shot.shotNumber}</span>
                  <span>~{shot.durationSeconds}s duration</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-neutral-400">
                      Visual Direction:
                    </span>
                    <p className="text-neutral-800 font-medium mt-0.5">{shot.visual}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold uppercase text-neutral-400">
                      Audio / Spoken Line:
                    </span>
                    <p className="text-neutral-600 italic mt-0.5">&ldquo;{shot.audioSpoken}&rdquo;</p>
                  </div>
                </div>

                {shot.onScreenText && (
                  <div className="pt-2 border-t border-neutral-200/60 flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase text-neutral-400">
                      On-Screen Text:
                    </span>
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {shot.onScreenText}
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Metadata, Caption & Cover */}
      {activeTab === 'metadata' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900">Instagram Caption</h3>
            <textarea
              rows={8}
              value={activeScript.caption}
              onChange={(e) => updateScript(activeScript.id, { caption: e.target.value })}
              className="w-full p-3 border border-neutral-200 rounded-xl text-xs text-neutral-800 leading-relaxed focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-neutral-900">Publishing Cues</h3>

            <div>
              <label className="font-semibold text-neutral-700">Cover Title (High Contrast)</label>
              <input
                type="text"
                value={activeScript.coverTitle}
                onChange={(e) => updateScript(activeScript.id, { coverTitle: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700">Call to Action (CTA)</label>
              <input
                type="text"
                value={activeScript.callToAction}
                onChange={(e) => updateScript(activeScript.id, { callToAction: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <span className="font-semibold text-neutral-700 block mb-1">Recommended B-Roll Clips:</span>
              <ul className="space-y-1 text-neutral-600">
                {activeScript.bRollSuggestions.map((b, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Personal Voice & Style Profile */}
      {activeTab === 'style' && (
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900">Personal Voice & Style Fingerprint</h3>
              <p className="text-xs text-neutral-500">
                This profile conditions all AI scriptwriters to match your genuine rhythm and eliminate generic jargon.
              </p>
            </div>
            <Badge variant="purple" className="text-xs font-mono">
              Voice Anchor Active
            </Badge>
          </div>

          {/* Style Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-2">
              <label className="font-semibold text-neutral-900">Sentence Cadence</label>
              <select
                value={styleProfile.sentenceLengthPreference}
                onChange={(e) =>
                  updateStyleProfile({ sentenceLengthPreference: e.target.value as any })
                }
                className="w-full p-2 border border-neutral-300 rounded-lg text-xs bg-white"
              >
                <option value="punchy">Punchy & Short (Fast tempo)</option>
                <option value="moderate">Moderate & Balanced</option>
                <option value="conversational">Conversational (Casual coffee chat)</option>
              </select>
            </div>

            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-neutral-900">Directness Score</label>
                <span className="font-mono font-bold text-neutral-900">
                  {styleProfile.directnessScore}/10
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={styleProfile.directnessScore}
                onChange={(e) => updateStyleProfile({ directnessScore: Number(e.target.value) })}
                className="w-full accent-neutral-900"
              />
              <span className="text-[10px] text-neutral-400">High directness skips disclaimers and pleasantries.</span>
            </div>

            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-neutral-900">Humor / Irony</label>
                <span className="font-mono font-bold text-neutral-900">
                  {styleProfile.humorLevel}/10
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={styleProfile.humorLevel}
                onChange={(e) => updateStyleProfile({ humorLevel: Number(e.target.value) })}
                className="w-full accent-neutral-900"
              />
              <span className="text-[10px] text-neutral-400">Dry technical wit without cringe jokes.</span>
            </div>
          </div>

          {/* Forbidden Words (Exclusion List) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Forbidden Corporate Fluff Words (Banned from AI outputs)
            </h4>
            <div className="flex flex-wrap items-center gap-1.5">
              {styleProfile.avoidWords.map((word) => (
                <span
                  key={word}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-mono"
                >
                  <span>&times; {word}</span>
                  <button
                    onClick={() =>
                      updateStyleProfile({
                        avoidWords: styleProfile.avoidWords.filter((w) => w !== word),
                      })
                    }
                    className="text-rose-400 hover:text-rose-800 ml-1"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>

            <form onSubmit={handleAddAvoidWord} className="flex gap-2 max-w-sm">
              <input
                type="text"
                placeholder="Add word to ban (e.g. game-changer)..."
                value={newAvoidWord}
                onChange={(e) => setNewAvoidWord(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-neutral-300 rounded-lg text-xs"
              />
              <Button type="submit" variant="secondary" size="sm">
                Add
              </Button>
            </form>
          </div>

          {/* Sample Transcripts Ingestion */}
          <div className="space-y-3 pt-4 border-t border-neutral-100">
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Ingested Personal Writing Samples (Style Anchors)
            </h4>
            <div className="space-y-2">
              {styleProfile.sampleTranscripts.map((sample, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 text-xs text-neutral-700 italic"
                >
                  &ldquo;{sample}&rdquo;
                </div>
              ))}
            </div>

            <form onSubmit={handleAddSample} className="space-y-2">
              <textarea
                rows={3}
                placeholder="Paste 150-300 words of your real past writing (newsletter, transcript, or post) to calibrate the voice anchor..."
                value={styleSampleInput}
                onChange={(e) => setStyleSampleInput(e.target.value)}
                className="w-full p-3 border border-neutral-300 rounded-xl text-xs"
              />
              <Button type="submit" variant="primary" size="sm">
                Add Writing Sample
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
