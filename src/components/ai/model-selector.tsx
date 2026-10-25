'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '@/lib/storage/store';
import {
  OmniRouteModel,
  ModelModule,
  ModelProviderCategory,
  ModelTestResult,
  ModelRecommendation,
} from '@/types';
import { recommendModelForTask } from '@/lib/ai/service';
import {
  Bot,
  Sparkles,
  RefreshCw,
  Search,
  Check,
  AlertTriangle,
  ShieldCheck,
  Zap,
  X,
  ChevronDown,
  Cpu,
  Play,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import Link from 'next/link';

export interface ModelSelectorProps {
  currentModule: ModelModule;
  selectedModelId?: string;
  onModelChange?: (modelId: string) => void;
  compact?: boolean;
  className?: string;
  showRecommendation?: boolean;
  align?: 'left' | 'right';
}

const PROVIDER_CATEGORIES: Array<{ id: string; label: string; match?: ModelProviderCategory }> = [
  { id: 'all', label: 'All Providers' },
  { id: 'kimi', label: 'Kimi / Moonshot', match: 'Kimi / Moonshot' },
  { id: 'glm', label: 'GLM / Zhipu', match: 'GLM / Zhipu' },
  { id: 'anthropic', label: 'Anthropic', match: 'Anthropic' },
  { id: 'openai', label: 'OpenAI', match: 'OpenAI' },
  { id: 'google', label: 'Google', match: 'Google Gemini' },
  { id: 'deepseek', label: 'DeepSeek', match: 'DeepSeek' },
  { id: 'meta', label: 'Meta Llama', match: 'Meta Llama' },
  { id: 'ollama', label: 'Ollama', match: 'Ollama' },
  { id: 'other', label: 'Other', match: 'Other / Routed' },
];

const MODULE_NAMES: Record<ModelModule, string> = {
  chat: 'AI Chat',
  scripts: 'Script Studio',
  ideas: 'Content Ideas',
  carousel: 'Carousel Studio',
  linkedin: 'LinkedIn Post Studio',
  strategist: 'AI Strategist',
  competitor: 'Competitor Research',
};

export function ModelSelector({
  currentModule,
  selectedModelId,
  onModelChange,
  compact = false,
  className = '',
  showRecommendation = true,
  align = 'right',
}: ModelSelectorProps) {
  const {
    cachedModels,
    isModelsLoading,
    modelsError,
    fetchOmniRouteModels,
    modelPreferences,
    updateModelPreferences,
    getModelForModule,
    setModelForModule,
    aiConfig,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProviderFilter, setSelectedProviderFilter] = useState('all');
  const [freeOnlyLocal, setFreeOnlyLocal] = useState(modelPreferences.freeOnlyMode);
  const [recommendation, setRecommendation] = useState<ModelRecommendation | null>(null);
  const [testingModelId, setTestingModelId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<ModelTestResult | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Active selected model
  const activeModelId = selectedModelId || getModelForModule(currentModule);
  const hasModuleOverride = Boolean(modelPreferences.moduleOverrides?.[currentModule]);

  // Sync freeOnlyLocal with store
  useEffect(() => {
    setFreeOnlyLocal(modelPreferences.freeOnlyMode);
  }, [modelPreferences.freeOnlyMode]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Model details from catalog
  const currentModelMeta = useMemo(() => {
    return cachedModels.find((m) => m.id === activeModelId);
  }, [cachedModels, activeModelId]);

  // Filtered models
  const filteredModels = useMemo(() => {
    return cachedModels.filter((model) => {
      // Free / Low-Cost filter
      if (freeOnlyLocal && model.pricing.tier !== 'free' && model.pricing.tier !== 'low_cost') {
        return false;
      }

      // Provider filter
      if (selectedProviderFilter !== 'all') {
        const cat = PROVIDER_CATEGORIES.find((p) => p.id === selectedProviderFilter);
        if (cat && cat.match && model.provider !== cat.match) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = model.id.toLowerCase().includes(q);
        const matchesName = model.name.toLowerCase().includes(q);
        const matchesProvider = model.provider.toLowerCase().includes(q);
        if (!matchesId && !matchesName && !matchesProvider) return false;
      }

      return true;
    });
  }, [cachedModels, freeOnlyLocal, selectedProviderFilter, searchQuery]);

  // Handle Model Selection
  const handleSelectModel = (modelId: string) => {
    setModelForModule(currentModule, modelId);
    if (onModelChange) {
      onModelChange(modelId);
    }
    setIsOpen(false);
  };

  // Reset to Global Default
  const handleResetToDefault = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedOverrides = { ...modelPreferences.moduleOverrides };
    delete updatedOverrides[currentModule];
    updateModelPreferences({ moduleOverrides: updatedOverrides });
    if (onModelChange) {
      onModelChange(modelPreferences.globalDefault || 'kimi-k1.5');
    }
  };

  // Recommend a model
  const handleGenerateRecommendation = () => {
    const rec = recommendModelForTask(currentModule, cachedModels, freeOnlyLocal);
    setRecommendation(rec);
  };

  // Test Model Execution
  const handleRunTest = async (modelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTestingModelId(modelId);
    setTestResult(null);

    try {
      const res = await fetch('/api/ai/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(aiConfig.omniRouteApiKey ? { 'x-omniroute-key': aiConfig.omniRouteApiKey } : {}),
        },
        body: JSON.stringify({
          action: 'test',
          modelId,
          endpoint: aiConfig.omniRouteEndpoint,
        }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setTestResult(data.result);
      } else {
        setTestResult({
          modelId,
          success: false,
          latencyMs: 0,
          errorMessage: data.error || 'Test request failed.',
          testedAt: new Date().toISOString(),
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
      setTestResult({
        modelId,
        success: false,
        latencyMs: 0,
        errorMessage: error.message || 'Cannot contact server.',
        testedAt: new Date().toISOString(),
      });
    } finally {
      setTestingModelId(null);
    }
  };

  // Pricing tier badge styling
  const renderPricingBadge = (tier: string) => {
    switch (tier) {
      case 'free':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            FREE
          </span>
        );
      case 'low_cost':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
            LOW COST
          </span>
        );
      case 'paid':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            PAID
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-normal bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
            UNKNOWN
          </span>
        );
    }
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 border rounded-xl transition-all select-none text-left ${
          compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs'
        } ${
          isOpen
            ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/30'
            : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 bg-white dark:bg-neutral-900 shadow-xs'
        }`}
        title={`Selected model for ${MODULE_NAMES[currentModule]}: ${activeModelId}`}
      >
        <div className="flex items-center gap-1.5 shrink-0">
          <Bot className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          {!compact && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 hidden sm:inline">
              Model
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-semibold text-neutral-900 dark:text-neutral-100 truncate max-w-[140px] sm:max-w-[190px]">
            {activeModelId}
          </span>

          {currentModelMeta && renderPricingBadge(currentModelMeta.pricing.tier)}

          {hasModuleOverride && (
            <span
              className="text-[9px] px-1 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-medium"
              title="Module-specific override active"
            >
              Custom
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-neutral-400 transition-transform ml-auto shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* DROPDOWN POPOVER */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-1.5 w-[340px] sm:w-[440px] max-w-[95vw] rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          style={{ maxHeight: '82vh' }}
        >
          {/* HEADER */}
          <div className="p-3.5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/50 flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                  Select AI Model
                </h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium">
                  {MODULE_NAMES[currentModule]}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Multi-model gateway powered by OmniRoute
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fetchOmniRouteModels(true)}
                disabled={isModelsLoading}
                className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
                title="Refresh Model Catalog"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isModelsLoading ? 'animate-spin text-indigo-500' : ''}`}
                />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SEARCH & FILTERS BAR */}
          <div className="p-3 border-b border-neutral-100 dark:border-neutral-800 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search models (e.g. kimi, glm, claude, gpt, llama)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Provider Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              {PROVIDER_CATEGORIES.map((p) => {
                const isSelected = selectedProviderFilter === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProviderFilter(p.id)}
                    className={`px-2 py-0.5 rounded-lg whitespace-nowrap transition-colors font-medium ${
                      isSelected
                        ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-semibold'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Free/Low-Cost Toggle & Recommend Trigger */}
            <div className="flex items-center justify-between pt-1 text-[11px]">
              <label className="flex items-center gap-1.5 cursor-pointer text-neutral-700 dark:text-neutral-300">
                <input
                  type="checkbox"
                  checked={freeOnlyLocal}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFreeOnlyLocal(checked);
                    updateModelPreferences({ freeOnlyMode: checked });
                  }}
                  className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-0"
                />
                <span className="flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Free & Low-Cost Only
                </span>
              </label>

              {showRecommendation && (
                <button
                  type="button"
                  onClick={handleGenerateRecommendation}
                  className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  <Sparkles className="w-3 h-3" />
                  Recommend for this task
                </button>
              )}
            </div>
          </div>

          {/* RECOMMENDATION BANNER */}
          {recommendation && (
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/60 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-indigo-900 dark:text-indigo-200">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    Recommended: {recommendation.modelName}
                  </div>
                  <p className="text-[11px] text-indigo-800 dark:text-indigo-300 mt-0.5 leading-relaxed">
                    {recommendation.rationale}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRecommendation(null)}
                  className="text-indigo-400 hover:text-indigo-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between pt-1">
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                  Provider: {recommendation.provider}
                </span>
                <button
                  type="button"
                  onClick={() => handleSelectModel(recommendation.recommendedModelId)}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors"
                >
                  Apply Recommendation
                </button>
              </div>
            </div>
          )}

          {/* TEST RESULT DRAWER */}
          {testResult && (
            <div
              className={`p-3 border-b text-xs ${
                testResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold">
                  {testResult.success ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  )}
                  <span>Test: {testResult.modelId}</span>
                  <span className="text-[10px] font-normal opacity-75">
                    ({testResult.latencyMs}ms)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setTestResult(null)}
                  className="opacity-60 hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              {testResult.outputPreview && (
                <p className="mt-1 font-mono text-[11px] opacity-90 line-clamp-2 bg-black/5 dark:bg-white/5 p-1 rounded">
                  &ldquo;{testResult.outputPreview}&rdquo;
                </p>
              )}
              {testResult.errorMessage && (
                <p className="mt-1 text-[11px] text-rose-700 dark:text-rose-300">
                  {testResult.errorMessage}
                </p>
              )}
            </div>
          )}

          {/* MODEL CATALOG LIST */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {/* OFFLINE / DISCONNECTED WARNING */}
            {modelsError && cachedModels.length === 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  OmniRoute Gateway Unreachable
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                  Cannot reach gateway at{' '}
                  <code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded font-mono text-[10px]">
                    {aiConfig.omniRouteEndpoint || 'http://localhost:20128/v1'}
                  </code>
                  .
                </p>
                <div className="text-[10px] font-mono bg-amber-100/60 dark:bg-amber-900/60 p-2 rounded text-amber-950 dark:text-amber-200">
                  Run: npx omniroute@latest
                </div>
              </div>
            )}

            {/* EMPTY SEARCH RESULT */}
            {filteredModels.length === 0 && (
              <div className="py-8 text-center text-xs text-neutral-400">
                <Cpu className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
                <p className="font-medium">No models match your filter</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Try clearing your search query or provider filter.
                </p>
              </div>
            )}

            {/* MODEL ITEMS */}
            {filteredModels.map((model) => {
              const isSelected = model.id === activeModelId;
              const isTesting = testingModelId === model.id;

              return (
                <div
                  key={model.id}
                  onClick={() => handleSelectModel(model.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-indigo-500/30'
                      : 'border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100 truncate">
                        {model.name}
                      </span>
                      {renderPricingBadge(model.pricing.tier)}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-neutral-500 dark:text-neutral-400">
                      <span className="font-semibold text-neutral-600 dark:text-neutral-300">
                        {model.provider}
                      </span>
                      <span>•</span>
                      <span className="truncate font-mono">{model.id}</span>
                      {model.capabilities.reasoning && (
                        <>
                          <span>•</span>
                          <span className="text-violet-600 dark:text-violet-400 font-medium">
                            Reasoning
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => handleRunTest(model.id, e)}
                      disabled={isTesting}
                      className="px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-[10px] font-semibold text-neutral-600 dark:text-neutral-300 flex items-center gap-1 transition-colors disabled:opacity-50"
                      title="Run quick test prompt"
                    >
                      {isTesting ? (
                        <RefreshCw className="w-3 h-3 animate-spin text-indigo-500" />
                      ) : (
                        <Play className="w-2.5 h-2.5 fill-current" />
                      )}
                      Test
                    </button>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* FOOTER */}
          <div className="p-2.5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <span>
                Global:{' '}
                <strong className="text-neutral-800 dark:text-neutral-200 font-mono">
                  {modelPreferences.globalDefault || 'kimi-k1.5'}
                </strong>
              </span>
              {hasModuleOverride && (
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                  title="Reset this module to the global default"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  Reset to Global
                </button>
              )}
            </div>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 font-medium flex items-center gap-1 hover:underline"
            >
              <SlidersHorizontal className="w-3 h-3" />
              Configure Gateway
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
