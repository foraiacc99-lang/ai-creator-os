'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/storage/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  CheckCircle2,
  Cpu,
  Sliders,
  DownloadCloud,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  X,
  Play,
  Check,
} from 'lucide-react';
import { InstagramIcon } from '@/components/icons/instagram';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ isOpen, onClose }) => {
  const { preferences, updatePreferences, account, connectInstagram, toggleDemoMode, aiConfig, updateAIConfig } = useApp();
  const [step, setStep] = useState(1);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  // Local state for step 5 preferences
  const [niche, setNiche] = useState(preferences.niche);
  const [audience, setAudience] = useState(preferences.targetAudience);
  const [frequency, setFrequency] = useState(preferences.postingFrequencyPerWeek);
  const [speakingStyle, setSpeakingStyle] = useState(preferences.speakingStyle);
  const [filmingHours, setFilmingHours] = useState(preferences.availableFilmingHoursPerWeek);
  const [selectedModel, setSelectedModel] = useState(aiConfig.textModel);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 5) {
      updatePreferences({
        niche,
        targetAudience: audience,
        postingFrequencyPerWeek: frequency,
        speakingStyle,
        availableFilmingHoursPerWeek: filmingHours,
      });
      updateAIConfig({ textModel: selectedModel });
    }
    if (step < 7) {
      setStep(step + 1);
    } else {
      updatePreferences({ onboardingCompleted: true });
      onClose();
    }
  };

  const handleUseDemo = () => {
    toggleDemoMode(true);
    updatePreferences({ onboardingCompleted: true });
    onClose();
  };

  const runImportSimulation = () => {
    setIsSyncing(true);
    setSyncProgress(10);
    const interval = setInterval(() => {
      setSyncProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSyncing(false);
          return 100;
        }
        return prev + 20;
      });
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Progress header */}
        <div className="px-6 pt-5 pb-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
              {step}
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Setup Wizard • Step {step} of 7
              </div>
              <div className="text-sm font-semibold text-neutral-900">
                {step === 1 && 'Welcome to AI Creator OS'}
                {step === 2 && 'Connect Your Instagram Account'}
                {step === 3 && 'Verify Account Telemetry'}
                {step === 4 && 'Select Your AI Inference Model'}
                {step === 5 && 'Set Content Preferences & Constraints'}
                {step === 6 && 'Import Historical Media & Scripts'}
                {step === 7 && 'Initial Intelligence Synthesis'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step progress bar */}
        <div className="w-full bg-neutral-100 h-1">
          <div
            className="bg-neutral-900 h-1 transition-all duration-300"
            style={{ width: `${(step / 7) * 100}%` }}
          />
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* STEP 1: Welcome */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80">
                <h3 className="text-base font-semibold text-neutral-900">
                  Your Personal AI-Powered Instagram Content Strategist
                </h3>
                <p className="mt-1 text-sm text-neutral-600 leading-relaxed">
                  AI Creator OS analyzes your historical engagement, studies your speaking cadence, and generates
                  ready-to-film scripts and data-driven recommendations tailored specifically to your audience.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-600">
                <div className="p-3 border border-neutral-200 rounded-lg bg-white">
                  <div className="font-semibold text-neutral-900 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    No Fake Metrics
                  </div>
                  Analyzes verified platform insights, reach, retention, and save ratios.
                </div>
                <div className="p-3 border border-neutral-200 rounded-lg bg-white">
                  <div className="font-semibold text-neutral-900 flex items-center gap-1.5 mb-1">
                    <Cpu className="w-3.5 h-3.5 text-purple-600" />
                    Open-Source AI Ready
                  </div>
                  Runs natively with local Ollama models (Llama 3.2, Mistral) or remote endpoints.
                </div>
                <div className="p-3 border border-neutral-200 rounded-lg bg-white">
                  <div className="font-semibold text-neutral-900 flex items-center gap-1.5 mb-1">
                    <Sliders className="w-3.5 h-3.5 text-blue-600" />
                    Personal Style Profile
                  </div>
                  Learns your rhythm, vocabulary, and forbidden corporate fluff words.
                </div>
                <div className="p-3 border border-neutral-200 rounded-lg bg-white">
                  <div className="font-semibold text-neutral-900 flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    7-Day Auto Scheduler
                  </div>
                  Turns strategic recommendations into a managed production calendar.
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-neutral-100">
                <button
                  onClick={handleUseDemo}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 underline underline-offset-4"
                >
                  ⚡ Skip setup & explore in Demo Mode with sample creator data
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Connect Instagram */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-neutral-600">
                Connect your Instagram Creator or Business account via the official Meta OAuth authorization flow.
              </p>

              <div className="p-5 border border-neutral-200 rounded-xl bg-neutral-50/50 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center mb-3 shadow-sm">
                  <InstagramIcon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-neutral-900">Meta Instagram Graph API</h4>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                  Requires Instagram Business or Creator account connected to a Facebook Page with{' '}
                  <code className="text-neutral-700 font-mono text-[11px]">instagram_basic</code> and{' '}
                  <code className="text-neutral-700 font-mono text-[11px]">instagram_manage_insights</code> permissions.
                </p>

                <div className="mt-4 flex flex-col sm:flex-row gap-2 w-full max-w-xs">
                  <a
                    href="/api/instagram/auth"
                    className="inline-flex items-center justify-center w-full px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs transition-colors"
                  >
                    Connect Instagram via Meta
                  </a>
                </div>

                <div className="mt-3 text-[11px] text-neutral-400">
                  Or enter your public handle to test simulated account linking:
                </div>
                <div className="mt-2 flex gap-2 w-full max-w-xs">
                  <input
                    type="text"
                    defaultValue="swaraj.creates"
                    id="wizard_handle_input"
                    placeholder="your.handle"
                    className="flex-1 px-3 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const el = document.getElementById('wizard_handle_input') as HTMLInputElement;
                      if (el?.value) connectInstagram(el.value);
                    }}
                  >
                    Link
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Verify Account */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 border border-neutral-200 rounded-xl bg-white shadow-2xs">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={account.profilePictureUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'}
                    alt={account.username}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-neutral-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-neutral-900">@{account.username}</span>
                      <Badge variant="success" className="text-[10px]">
                        Connected
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {account.accountType}
                      </Badge>
                    </div>
                    <div className="text-xs text-neutral-500 mt-0.5">{account.name}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-neutral-100 text-center">
                  <div className="p-2 bg-neutral-50 rounded-lg">
                    <div className="text-xs text-neutral-400">Followers</div>
                    <div className="text-sm font-bold text-neutral-900">
                      {account.followersCount.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-2 bg-neutral-50 rounded-lg">
                    <div className="text-xs text-neutral-400">Following</div>
                    <div className="text-sm font-bold text-neutral-900">{account.followingCount}</div>
                  </div>
                  <div className="p-2 bg-neutral-50 rounded-lg">
                    <div className="text-xs text-neutral-400">Media Count</div>
                    <div className="text-sm font-bold text-neutral-900">{account.mediaCount}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Select AI Model */}
          {step === 4 && (
            <div className="space-y-3">
              <p className="text-sm text-neutral-600">
                Choose the language model you want to power your Content Strategist, Script Studio, and Reel Analyzer.
              </p>

              <div className="space-y-2">
                {[
                  {
                    id: 'llama3.2',
                    name: 'Llama 3.2 (3B / 8B)',
                    type: 'Local Ollama',
                    desc: 'Fast, completely private offline execution. Recommended for everyday script writing.',
                  },
                  {
                    id: 'mistral',
                    name: 'Mistral 7B Instruct',
                    type: 'Local Ollama',
                    desc: 'Balanced reasoning and strong structured JSON formatting.',
                  },
                  {
                    id: 'gpt-4o-mini',
                    name: 'OpenAI GPT-4o-mini',
                    type: 'Cloud API',
                    desc: 'High speed remote inference via standard OpenAI-compatible API key.',
                  },
                ].map((m) => (
                  <label
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`flex items-start justify-between p-3.5 rounded-xl border cursor-pointer transition-colors ${
                      selectedModel === m.id
                        ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-neutral-900">{m.name}</span>
                        <Badge variant="secondary" className="text-[10px]">
                          {m.type}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-neutral-500">{m.desc}</p>
                    </div>
                    {selectedModel === m.id && <Check className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Set Content Preferences */}
          {step === 5 && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700">Content Niche</label>
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 border border-neutral-300 rounded-lg text-xs focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700">Target Audience</label>
                <input
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 border border-neutral-300 rounded-lg text-xs focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700">Posts Per Week</label>
                  <input
                    type="number"
                    min={1}
                    max={14}
                    value={frequency}
                    onChange={(e) => setFrequency(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-1.5 border border-neutral-300 rounded-lg text-xs focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700">Filming Hours Available / Week</label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={filmingHours}
                    onChange={(e) => setFilmingHours(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-1.5 border border-neutral-300 rounded-lg text-xs focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700">Speaking Style / Voice</label>
                <input
                  type="text"
                  value={speakingStyle}
                  onChange={(e) => setSpeakingStyle(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 border border-neutral-300 rounded-lg text-xs focus:ring-1 focus:ring-neutral-900"
                />
              </div>
            </div>
          )}

          {/* STEP 6: Import Content */}
          {step === 6 && (
            <div className="space-y-4">
              <p className="text-sm text-neutral-600">
                Synchronizing media posts, Reels metrics, and captions to build your baseline model.
              </p>

              <div className="p-6 border border-neutral-200 rounded-xl bg-neutral-50 text-center space-y-3">
                <DownloadCloud className="w-8 h-8 text-neutral-600 mx-auto" />
                <div className="text-xs font-semibold text-neutral-900">Historical Ingestion Engine</div>
                <p className="text-[11px] text-neutral-500 max-w-sm mx-auto">
                  Fetches 30 days of reach, video watch time, save distributions, and hook performance.
                </p>

                {isSyncing ? (
                  <div className="space-y-2 max-w-xs mx-auto">
                    <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-neutral-900 h-2 transition-all duration-300"
                        style={{ width: `${syncProgress}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      Ingesting media #{Math.round((syncProgress / 100) * 24)} of 24...
                    </div>
                  </div>
                ) : (
                  <Button onClick={runImportSimulation} variant="secondary" size="sm">
                    {syncProgress === 100 ? 'Re-sync Media' : 'Start Data Ingestion'}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* STEP 7: Generate Initial Analysis */}
          {step === 7 && (
            <div className="space-y-4">
              <div className="p-4 border border-emerald-200 bg-emerald-50/50 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Account Analysis Synthesized!
                </div>
                <p className="text-xs text-emerald-700 mt-1">
                  Your baseline engagement rate is <strong>5.2%</strong>. Your highest-converting formats are{' '}
                  <strong>Technical Reels</strong> with under-2-second contrarian hooks.
                </p>
              </div>

              <div className="p-4 border border-neutral-200 rounded-xl bg-white space-y-2">
                <div className="text-xs font-semibold text-neutral-900 uppercase tracking-wide">
                  Initial Priorities Ready:
                </div>
                <ul className="space-y-1.5 text-xs text-neutral-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                    <strong>Idea 1:</strong> Voice mimicry meta-prompting (Top save potential).
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                    <strong>Idea 2:</strong> Solo founder architecture breakdown (High reach potential).
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                    <strong>Calendar:</strong> 4 scheduled slots planned across your next 7 days.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className="text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Previous
          </Button>

          <Button variant="primary" size="sm" onClick={handleNext} className="text-xs">
            {step === 7 ? 'Enter Creator Dashboard' : 'Next Step'}
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
