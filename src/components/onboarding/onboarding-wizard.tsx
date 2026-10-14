'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/storage/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CONTENT_PILLARS, ContentPillar } from '@/types';
import {
  Sparkles,
  CheckCircle2,
  Cpu,
  ArrowRight,
  ArrowLeft,
  X,
  Clock,
  Radio,
  BookOpen,
} from 'lucide-react';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ isOpen, onClose }) => {
  const { preferences, updatePreferences, aiConfig, updateAIConfig, testAIConnection } = useApp();
  const [step, setStep] = useState(1);
  const [testingOllama, setTestingOllama] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Form states
  const [audience, setAudience] = useState(preferences.targetAudience);
  const [frequency, setFrequency] = useState(preferences.postingFrequencyPerWeek);
  const [filmingHours, setFilmingHours] = useState(preferences.availableFilmingHoursPerWeek);
  const [editingHours, setEditingHours] = useState(preferences.availableEditingHoursPerWeek);
  const [selectedPillars, setSelectedPillars] = useState<ContentPillar[]>([
    'AI_TOOLS_AND_AUTOMATION',
    'FREE_GITHUB_AND_DEV_TOOLS',
    'SALES_PSYCHOLOGY_AND_CLIENT_ACQUISITION',
    'WEBSITE_DEV_AND_SEO',
  ]);
  const [modelName, setModelName] = useState(aiConfig.textModel);

  if (!isOpen) return null;

  const togglePillar = (id: ContentPillar) => {
    if (selectedPillars.includes(id)) {
      if (selectedPillars.length > 1) {
        setSelectedPillars(selectedPillars.filter((p) => p !== id));
      }
    } else {
      setSelectedPillars([...selectedPillars, id]);
    }
  };

  const handleTestOllama = async () => {
    setTestingOllama(true);
    setTestResult(null);
    const res = await testAIConnection();
    setTestResult(res.message);
    setTestingOllama(false);
  };

  const handleComplete = () => {
    updatePreferences({
      targetAudience: audience,
      postingFrequencyPerWeek: frequency,
      availableFilmingHoursPerWeek: filmingHours,
      availableEditingHoursPerWeek: editingHours,
      onboardingCompleted: true,
    });
    updateAIConfig({
      textModel: modelName,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs">
              OS
            </div>
            <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">Setup Your Workspace</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-neutral-400">Step {step} of 4</span>
            <button
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <Badge variant="purple" className="text-xs">
                Welcome to AI Creator OS
              </Badge>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Your Personal Content Strategist & Growth Engine
              </h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                AI Creator OS is built for solo creators documenting technical projects, building software, learning sales, and growing a business without enterprise fluff or social media bloat.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-xs text-neutral-900 dark:text-neutral-200">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Zero API Cost by Default</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Runs 100% locally with Ollama. No mandatory subscriptions or surprise charges.
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-xs text-neutral-900 dark:text-neutral-200">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>Manual Growth Telemetry</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    No Instagram password or Graph API connection required. You enter your snapshots manually.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Select Your Content Pillars</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Choose the core pillars you focus on. These can be adjusted anytime in Settings.
                </p>
              </div>

              <div className="space-y-2">
                {CONTENT_PILLARS.map((pillar) => {
                  const isSelected = selectedPillars.includes(pillar.id);
                  return (
                    <div
                      key={pillar.id}
                      onClick={() => togglePillar(pillar.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-50 dark:bg-neutral-800/70'
                          : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                          {pillar.title}
                        </div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                          {pillar.description}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded text-neutral-900 w-4 h-4 ml-3"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Realistic Production Capacity</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  The AI plans achievable schedules based on your real availability, preventing burnout.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1 mb-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Filming Bandwidth (Hours/Week)</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={40}
                      value={filmingHours}
                      onChange={(e) => setFilmingHours(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1 mb-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Editing Bandwidth (Hours/Week)</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={40}
                      value={editingHours}
                      onChange={(e) => setEditingHours(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Target Publishing Cadence
                  </label>
                  <div className="flex gap-2">
                    {[2, 3, 4, 5].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setFrequency(cnt)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${
                          frequency === cnt
                            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white'
                            : 'border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                        }`}
                      >
                        {cnt} posts / week
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Local AI Configuration</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Connect your local Ollama instance for fast, private, zero-cost intelligence.
                </p>
              </div>

              <div className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/70 dark:bg-neutral-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      Ollama Endpoint: {aiConfig.endpoint}
                    </span>
                  </div>
                  <Button
                    onClick={handleTestOllama}
                    variant="outline"
                    size="sm"
                    isLoading={testingOllama}
                    className="text-xs"
                  >
                    Test Connection
                  </Button>
                </div>

                {testResult && (
                  <div className="p-2.5 rounded-lg text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300">
                    {testResult}
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Select Local Model
                  </label>
                  <select
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                  >
                    {aiConfig.availableModels.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                Don&apos;t have Ollama running yet? You can still use the app with instant templates and configure Ollama anytime in Settings.
              </p>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-950/50">
          {step > 1 ? (
            <Button onClick={() => setStep(step - 1)} variant="outline" size="sm" className="text-xs">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <Button onClick={() => setStep(step + 1)} variant="primary" size="sm" className="text-xs">
              Continue
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleComplete} variant="primary" size="sm" className="text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              Enter AI Creator OS
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
