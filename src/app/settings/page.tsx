'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/storage/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AIProviderConfig } from '@/types';
import {
  Settings,
  Cpu,
  Sliders,
  Database,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Trash2,
  Download,
  Info,
  Check,
} from 'lucide-react';
import { InstagramIcon } from '@/components/icons/instagram';

export default function SettingsPage() {
  const {
    account,
    connectInstagram,
    disconnectInstagram,
    preferences,
    updatePreferences,
    aiConfig,
    updateAIConfig,
    testAIConnection,
    resetToDemoData,
    clearUserData,
    isDemoMode,
    toggleDemoMode,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'account' | 'ai' | 'preferences' | 'data' | 'privacy'>('ai');
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // AI settings local form
  const [provider, setProvider] = useState<AIProviderConfig['provider']>(aiConfig.provider);
  const [endpoint, setEndpoint] = useState(aiConfig.endpoint);
  const [textModel, setTextModel] = useState(aiConfig.textModel);
  const [visionModel, setVisionModel] = useState(aiConfig.visionModel);
  const [transcriptionModel, setTranscriptionModel] = useState(aiConfig.transcriptionModel);
  const [apiKey, setApiKey] = useState(aiConfig.apiKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Preference form
  const [niche, setNiche] = useState(preferences.niche);
  const [audience, setAudience] = useState(preferences.targetAudience);
  const [frequency, setFrequency] = useState(preferences.postingFrequencyPerWeek);
  const [filmingHours, setFilmingHours] = useState(preferences.availableFilmingHoursPerWeek);
  const [speakingStyle, setSpeakingStyle] = useState(preferences.speakingStyle);
  const [language, setLanguage] = useState(preferences.language);

  // Account form
  const [igHandle, setIgHandle] = useState(account.username || '');

  const handleSaveAI = () => {
    updateAIConfig({
      provider,
      endpoint,
      textModel,
      visionModel,
      transcriptionModel,
      apiKey,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    const res = await testAIConnection();
    setTestResult(res);
    setTestingConnection(false);
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences({
      niche,
      targetAudience: audience,
      postingFrequencyPerWeek: frequency,
      availableFilmingHoursPerWeek: filmingHours,
      speakingStyle,
      language,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">System Settings</h2>
            <Badge variant="secondary" className="text-xs font-mono">
              Configuration
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 max-w-2xl">
            Configure local open-source inference (Ollama), Meta Graph API credentials, content niche guidelines,
            and privacy parameters.
          </p>
        </div>

        {savedSuccess && (
          <Badge variant="success" className="text-xs py-1 px-3">
            <Check className="w-3.5 h-3.5 mr-1" />
            Settings Saved
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-neutral-200 text-xs overflow-x-auto pb-0.5">
        {[
          { id: 'ai', label: 'AI Inference System', icon: Cpu },
          { id: 'account', label: 'Instagram Account', icon: InstagramIcon },
          { id: 'preferences', label: 'Content Strategy Profile', icon: Sliders },
          { id: 'data', label: 'Data & Telemetry', icon: Database },
          { id: 'privacy', label: 'Security & Privacy', icon: ShieldAlert },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 font-medium border-b-2 transition-colors shrink-0 ${
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

      {/* TAB 1: AI Settings */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Provider-Independent AI Architecture</h3>
                <p className="text-xs text-neutral-500">
                  Run locally with 100% offline privacy via Ollama, or connect any OpenAI-compatible API.
                </p>
              </div>

              <Button
                onClick={handleTestConnection}
                variant="outline"
                size="sm"
                isLoading={testingConnection}
                className="text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                Test Connection
              </Button>
            </div>

            {testResult && (
              <div
                className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            {/* Provider Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {[
                {
                  id: 'ollama',
                  name: 'Ollama (Local Offline)',
                  desc: 'Runs open-weight models on your machine. Zero cloud costs, total privacy.',
                },
                {
                  id: 'openai',
                  name: 'OpenAI API',
                  desc: 'Cloud inference with GPT-4o-mini / GPT-4o via official API key.',
                },
                {
                  id: 'custom',
                  name: 'OpenAI-Compatible Remote',
                  desc: 'Groq, OpenRouter, LM Studio, vLLM, or LocalAI endpoints.',
                },
              ].map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setProvider(p.id as any);
                    if (p.id === 'ollama') setEndpoint('http://localhost:11434');
                    else if (p.id === 'openai') setEndpoint('https://api.openai.com/v1');
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    provider === p.id
                      ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="font-bold text-neutral-900 mb-1">{p.name}</div>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>

            {/* Endpoint & Models Form */}
            <div className="space-y-4 pt-2 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-neutral-700">API Endpoint URL</label>
                  <input
                    type="text"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs font-mono"
                  />
                </div>

                {provider !== 'ollama' && (
                  <div>
                    <label className="font-semibold text-neutral-700">API Secret Key</label>
                    <input
                      type="password"
                      placeholder="sk-..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700">Text Model (Strategist & Scripts)</label>
                  <input
                    type="text"
                    value={textModel}
                    onChange={(e) => setTextModel(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs font-mono"
                  />
                  <span className="text-[10px] text-neutral-400 mt-0.5 block">e.g. llama3.2, mistral, gpt-4o-mini</span>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700">Vision Model (Wireframes & Reels)</label>
                  <input
                    type="text"
                    value={visionModel}
                    onChange={(e) => setVisionModel(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs font-mono"
                  />
                  <span className="text-[10px] text-neutral-400 mt-0.5 block">e.g. llava, qwen2.5-vl</span>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700">Audio Model (Transcriptions)</label>
                  <input
                    type="text"
                    value={transcriptionModel}
                    onChange={(e) => setTranscriptionModel(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs font-mono"
                  />
                  <span className="text-[10px] text-neutral-400 mt-0.5 block">e.g. whisper-1, local whisper</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button onClick={handleSaveAI} variant="primary" size="sm">
                  Save AI Configuration
                </Button>
              </div>
            </div>
          </div>

          {/* Ollama Setup Instructions Guide */}
          <div className="bg-neutral-50 border border-neutral-200/90 rounded-2xl p-6 text-xs space-y-3">
            <h4 className="font-bold text-neutral-900">Local Ollama Setup & Hardware Guide</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-neutral-600 leading-relaxed text-[11px]">
              <div>
                <strong>Quick Terminal Installation:</strong>
                <pre className="mt-1 p-2 bg-neutral-900 text-white rounded font-mono text-[10px]">
                  # 1. Download model{'\n'}ollama run llama3.2{'\n\n'}# 2. Verify server{'\n'}curl http://localhost:11434/api/tags
                </pre>
              </div>
              <div className="space-y-1">
                <strong>Hardware Sizing Guidelines:</strong>
                <p>• <strong>Llama 3.2 (3B):</strong> Runs on 8GB RAM with zero fan noise.</p>
                <p>• <strong>Mistral / Qwen 2.5 (7B/8B):</strong> Recommended 16GB RAM for high token generation speeds.</p>
                <p>• <strong>Vision Models (LLaVA / Qwen-VL):</strong> Best with dedicated Apple Silicon or NVIDIA GPU.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Instagram Account */}
      {activeTab === 'account' && (
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs space-y-5 text-xs">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900">Instagram Connection Status</h3>
              <p className="text-xs text-neutral-500">Official Meta Graph API authorization token lifecycle.</p>
            </div>
            <Badge variant={account.isConnected ? 'success' : 'warning'}>
              {account.isConnected ? 'Active Token' : 'Disconnected'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
              <span className="text-neutral-400 text-[10px] uppercase font-semibold">Account Handle</span>
              <div className="text-sm font-bold text-neutral-900 mt-0.5">@{account.username || 'None'}</div>
            </div>
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
              <span className="text-neutral-400 text-[10px] uppercase font-semibold">Account Type</span>
              <div className="text-sm font-bold text-neutral-900 mt-0.5">{account.accountType}</div>
            </div>
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
              <span className="text-neutral-400 text-[10px] uppercase font-semibold">Token Lifespan</span>
              <div className="text-sm font-bold text-neutral-900 mt-0.5">Valid (60-day refresh)</div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-neutral-100">
            <div className="space-y-0.5">
              <span className="font-semibold text-neutral-900 block">Switch Account or Re-authorize</span>
              <p className="text-[11px] text-neutral-500">Redirects to Facebook OAuth authorization consent screen.</p>
            </div>
            <a
              href="/api/instagram/auth"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs"
            >
              Re-connect via Meta
            </a>
          </div>
        </div>
      )}

      {/* TAB 3: Content Preferences */}
      {activeTab === 'preferences' && (
        <form onSubmit={handleSavePreferences} className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
          <div className="border-b border-neutral-100 pb-3">
            <h3 className="text-base font-bold text-neutral-900">Creator Strategic Constraints</h3>
            <p className="text-xs text-neutral-500">
              Sets the guardrails for AI recommendations, script generation, and auto-scheduling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-neutral-700">Content Niche</label>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-700">Target Audience Description</label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-neutral-700">Desired Posting Frequency / Week</label>
              <input
                type="number"
                min={1}
                max={14}
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-700">Available Filming Hours / Week</label>
              <input
                type="number"
                min={0.5}
                max={40}
                step={0.5}
                value={filmingHours}
                onChange={(e) => setFilmingHours(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-700">Primary Language</label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-neutral-700">Speaking Style & Voice Tone</label>
            <input
              type="text"
              value={speakingStyle}
              onChange={(e) => setSpeakingStyle(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs"
            />
          </div>

          <div className="pt-3 border-t border-neutral-100 flex justify-end">
            <Button type="submit" variant="primary" size="sm">
              Save Preferences
            </Button>
          </div>
        </form>
      )}

      {/* TAB 4: Data & Telemetry */}
      {activeTab === 'data' && (
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs space-y-5 text-xs">
          <div className="border-b border-neutral-100 pb-3">
            <h3 className="text-base font-bold text-neutral-900">Telemetry & Data Management</h3>
            <p className="text-xs text-neutral-500">Manage local caches, sample datasets, and backups.</p>
          </div>

          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 flex items-center justify-between">
            <div>
              <span className="font-bold text-neutral-900 block">Demo Mode Telemetry</span>
              <p className="text-neutral-500 text-[11px] mt-0.5">
                Toggle between simulated 24-post creator dataset and real live account ingestion.
              </p>
            </div>
            <Button
              onClick={() => toggleDemoMode(!isDemoMode)}
              variant={isDemoMode ? 'secondary' : 'outline'}
              size="sm"
            >
              {isDemoMode ? 'Active (Demo Mode)' : 'Disabled (Live Mode)'}
            </Button>
          </div>

          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 flex items-center justify-between">
            <div>
              <span className="font-bold text-neutral-900 block">Reset to Factory Demo State</span>
              <p className="text-neutral-500 text-[11px] mt-0.5">
                Restores default 24 posts, 8 ideas, scripts, and video analyses.
              </p>
            </div>
            <Button onClick={resetToDemoData} variant="outline" size="sm">
              Reset Demo Data
            </Button>
          </div>
        </div>
      )}

      {/* TAB 5: Privacy & Destructive Actions */}
      {activeTab === 'privacy' && (
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs space-y-5 text-xs">
          <div className="border-b border-neutral-100 pb-3">
            <h3 className="text-base font-bold text-neutral-900">Security, Tokens & Account Privacy</h3>
            <p className="text-xs text-neutral-500">Revoke permissions, flush database caches, and delete telemetry.</p>
          </div>

          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex items-center justify-between">
            <div>
              <span className="font-bold text-rose-900 block">Disconnect Instagram Account</span>
              <p className="text-rose-700 text-[11px] mt-0.5">
                Revokes stored long-lived tokens and halts automated sync telemetry.
              </p>
            </div>
            <Button onClick={disconnectInstagram} variant="danger" size="sm">
              Disconnect Instagram
            </Button>
          </div>

          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex items-center justify-between">
            <div>
              <span className="font-bold text-rose-900 block">Purge All Workspace Data</span>
              <p className="text-rose-700 text-[11px] mt-0.5">
                Permanently wipes all local scripts, ideas, video analyses, and metrics.
              </p>
            </div>
            <Button onClick={clearUserData} variant="danger" size="sm">
              Delete All Data
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
