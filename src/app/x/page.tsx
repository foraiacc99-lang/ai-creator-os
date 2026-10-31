'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/storage/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  XPostRecord,
  XWritingStyle,
  XPostMode,
  XFormatType,
  XObjective,
  ContentPillar,
  CONTENT_PILLARS,
} from '@/types';
import {
  Sparkles,
  Copy,
  Calendar as CalendarIcon,
  Trash2,
  Plus,
  Wand2,
  Check,
  ShieldCheck,
  AlertTriangle,
  Layers,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Repeat2,
  Heart,
  Share,
} from 'lucide-react';
import { ModelSelector } from '@/components/ai/model-selector';

const X_WRITING_STYLES: XWritingStyle[] = [
  'Casual',
  'Savage',
  'Thought-Provoking',
  'Technical / Developer',
  'Educational',
  'Build in Public',
  'Personal / Reflective',
  'Promotional / Product',
];

const PRESET_TOPICS = [
  { topic: 'Self-hosting local AI with zero API cost', pillar: 'AI_TOOLS_AND_AUTOMATION' as ContentPillar },
  { topic: 'Why asking "do you like your website" kills cold calls', pillar: 'SALES_PSYCHOLOGY_AND_CLIENT_ACQUISITION' as ContentPillar },
  { topic: '5 GitHub repos every solo developer needs', pillar: 'FREE_GITHUB_AND_DEV_TOOLS' as ContentPillar },
  { topic: 'Next.js 16 sub-2s mobile render speed checklist', pillar: 'WEBSITE_DEV_AND_SEO' as ContentPillar },
];

export default function XStudioPage() {
  const {
    xPosts,
    addXPost,
    updateXPost,
    deleteXPost,
    scheduleXPostToCalendar,
    aiConfig,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'create' | 'library'>('create');
  const [mode, setMode] = useState<XPostMode>('single');
  const [topic, setTopic] = useState('');
  const [pillar, setPillar] = useState<ContentPillar>('AI_TOOLS_AND_AUTOMATION');
  const [writingStyle, setWritingStyle] = useState<XWritingStyle>('Casual');
  const [secondaryStyle, setSecondaryStyle] = useState<XWritingStyle | undefined>(undefined);
  const [userNotes, setUserNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Live draft preview
  const [currentPost, setCurrentPost] = useState<XPostRecord | null>(() => xPosts[0] || null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setErrorMsg('Please enter a topic or select one of the suggested prompts.');
      return;
    }
    setErrorMsg(null);
    setIsGenerating(true);

    try {
      const res = await fetch('/api/ai/generate-x', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          niche: 'AI tools and automation',
          mode,
          postObjective: 'Auto-select',
          postFormat: 'Auto-select',
          writingStyle,
          secondaryWritingStyle: secondaryStyle,
          contentPillar: pillar,
          userNotes,
          aiConfig,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate X post');
      }

      const generated: XPostRecord = data.post;
      const saved = addXPost({
        title: generated.title || topic,
        mode: generated.mode || mode,
        topic,
        niche: generated.niche || 'AI tools and automation',
        contentPillar: pillar,
        targetAudience: generated.targetAudience || 'Developers & Builders',
        postObjective: generated.postObjective || 'Auto-select',
        postFormat: generated.postFormat || 'Auto-select',
        writingStyle,
        secondaryWritingStyle: secondaryStyle,
        singlePostContent: generated.singlePostContent,
        threadPosts: generated.threadPosts || [],
        alternativeHooks: generated.alternativeHooks || [],
        ctaSettings: generated.ctaSettings || { type: 'No CTA' },
        qualityAudit: generated.qualityAudit,
        status: 'Draft',
      });

      setCurrentPost(saved);
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e.message || 'Generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScheduleToday = (post: XPostRecord) => {
    const today = new Date().toISOString().split('T')[0];
    scheduleXPostToCalendar(post.id, today, '14:00');
    updateXPost(post.id, { status: 'Scheduled', plannedDate: today, plannedTime: '14:00' });
    if (currentPost?.id === post.id) {
      setCurrentPost({ ...currentPost, status: 'Scheduled', plannedDate: today, plannedTime: '14:00' });
    }
  };

  const currentContent = currentPost?.singlePostContent || '';
  const charCount = currentContent.length;
  const isOverLimit = charCount > 280;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/60 dark:bg-neutral-900/40 p-4 rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Composer & Studio
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'library'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <span>Library</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-neutral-200/60 dark:bg-neutral-800">
              {xPosts.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <ModelSelector currentModule="x_posts" />
        </div>
      </div>

      {activeTab === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Configuration & Generator Controls */}
          <div className="lg:col-span-5 space-y-5 bg-white dark:bg-neutral-900/60 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 shadow-2xs">
            {/* Mode selection */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2 block">
                Post Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('single')}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                    mode === 'single'
                      ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-950 dark:border-white shadow-xs font-semibold'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                  }`}
                >
                  Single Post (280c)
                </button>
                <button
                  type="button"
                  onClick={() => setMode('thread')}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                    mode === 'thread'
                      ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-950 dark:border-white shadow-xs font-semibold'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                  }`}
                >
                  Multi-Post Thread
                </button>
              </div>
            </div>

            {/* Topic Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  Topic or Key Takeaway
                </label>
                <span className="text-[11px] text-neutral-400">Grounding notes</span>
              </div>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Why most multi-model LLM gateway setups break in production, and how local fallbacks prevent downtime..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 resize-none transition-colors"
              />
            </div>

            {/* Quick Topic Prompts */}
            <div>
              <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 mb-1.5 block">
                Quick Prompts from Your Pillars:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TOPICS.map((pt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setTopic(pt.topic);
                      setPillar(pt.pillar);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left truncate max-w-full cursor-pointer"
                  >
                    {pt.topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Pillar */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1.5 block">
                Content Pillar
              </label>
              <select
                value={pillar}
                onChange={(e) => setPillar(e.target.value as ContentPillar)}
                className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600"
              >
                {CONTENT_PILLARS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Writing Style */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1.5 block">
                Primary Writing Tone
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {X_WRITING_STYLES.slice(0, 6).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setWritingStyle(style)}
                    className={`py-1.5 px-2.5 rounded-lg text-[11px] border text-left transition-all cursor-pointer ${
                      writingStyle === style
                        ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-950 dark:border-white font-semibold'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Specific verified notes */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1.5 block">
                Specific Metrics / Authentic Details (Optional)
              </label>
              <input
                type="text"
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="e.g. tested on 8B model, 42ms response, zero cloud tokens"
                className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                {errorMsg}
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              isLoading={isGenerating}
              variant="primary"
              className="w-full text-xs font-semibold py-2.5 rounded-xl"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              {isGenerating ? 'Synthesizing Authentic Post...' : 'Generate X Post'}
            </Button>
          </div>

          {/* Right Column: Interactive Clean Live Preview Card */}
          <div className="lg:col-span-7 space-y-5">
            {currentPost ? (
              <div className="bg-white dark:bg-neutral-900/60 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 shadow-2xs space-y-5">
                {/* Header details */}
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800/80">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-bold text-xs flex items-center justify-center">
                      OS
                    </span>
                    <div>
                      <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                        <span>Creator OS</span>
                        <span className="text-[11px] text-neutral-400 font-normal">@creator_os</span>
                      </div>
                      <div className="text-[10px] text-neutral-400">{currentPost.writingStyle}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Character limit pill */}
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-mono font-medium ${
                        isOverLimit
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                      }`}
                    >
                      {charCount} / 280
                    </span>

                    <Badge
                      variant={
                        currentPost.status === 'Scheduled'
                          ? 'purple'
                          : currentPost.status === 'Ready to Publish'
                          ? 'success'
                          : 'secondary'
                      }
                    >
                      {currentPost.status}
                    </Badge>
                  </div>
                </div>

                {/* Simulated Post Body */}
                <div className="space-y-4">
                  {currentPost.mode === 'single' ? (
                    <div className="p-4 rounded-xl bg-neutral-50/70 dark:bg-neutral-950/50 border border-neutral-200/60 dark:border-neutral-800/60">
                      <textarea
                        value={currentPost.singlePostContent}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCurrentPost({ ...currentPost, singlePostContent: val });
                          updateXPost(currentPost.id, { singlePostContent: val });
                        }}
                        rows={6}
                        className="w-full text-sm bg-transparent border-0 focus:outline-none focus:ring-0 resize-none text-neutral-900 dark:text-neutral-100 leading-relaxed font-sans"
                        placeholder="Post content..."
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(currentPost.threadPosts || []).map((t, idx) => (
                        <div
                          key={t.id || idx}
                          className="p-4 rounded-xl bg-neutral-50/70 dark:bg-neutral-950/50 border border-neutral-200/60 dark:border-neutral-800/60 relative"
                        >
                          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-2">
                            <span>Post {idx + 1} of {currentPost.threadPosts.length}</span>
                            <span>{t.content.length} chars</span>
                          </div>
                          <p className="text-xs text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
                            {t.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Simulated Engagement Bar */}
                  <div className="flex items-center justify-between pt-2 px-2 text-neutral-400 dark:text-neutral-500 text-xs border-t border-neutral-100 dark:border-neutral-800/60">
                    <span className="flex items-center gap-1.5 hover:text-sky-500 transition-colors cursor-pointer">
                      <MessageCircle className="w-3.5 h-3.5" /> 12
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors cursor-pointer">
                      <Repeat2 className="w-3.5 h-3.5" /> 8
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-rose-500 transition-colors cursor-pointer">
                      <Heart className="w-3.5 h-3.5" /> 64
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-neutral-700 transition-colors cursor-pointer">
                      <Share className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* Quality Audit Checklist */}
                {currentPost.qualityAudit && (
                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span>Quality & Compliance Audit</span>
                      </span>
                      <span className="font-mono text-[11px] text-neutral-500">
                        Score: {currentPost.qualityAudit.readabilityScore}%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      {currentPost.qualityAudit.checks.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/50 dark:border-neutral-800/50"
                        >
                          {c.passed ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          )}
                          <span className="text-neutral-700 dark:text-neutral-300 truncate">
                            {c.feedback}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Alternative Hooks if available */}
                {currentPost.alternativeHooks && currentPost.alternativeHooks.length > 0 && (
                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 space-y-2">
                    <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 block">
                      Alternative Hook Angles:
                    </span>
                    <div className="space-y-1.5">
                      {currentPost.alternativeHooks.map((h, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            const newContent = `${h}\n\n${currentPost.singlePostContent.split('\n\n').slice(1).join('\n\n')}`;
                            setCurrentPost({ ...currentPost, singlePostContent: newContent });
                            updateXPost(currentPost.id, { singlePostContent: newContent });
                          }}
                          className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/50 dark:border-neutral-800/50 text-xs text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors cursor-pointer flex items-center justify-between"
                        >
                          <span className="truncate">{h}</span>
                          <span className="text-[10px] text-neutral-400 shrink-0 ml-2">Apply</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleCopy(currentPost.singlePostContent, currentPost.id)}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      {copiedId === currentPost.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1" />
                          Copy Post
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleScheduleToday(currentPost)}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      <CalendarIcon className="w-3.5 h-3.5 mr-1" />
                      Schedule to Calendar
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        updateXPost(currentPost.id, { status: 'Ready to Publish' });
                        setCurrentPost({ ...currentPost, status: 'Ready to Publish' });
                      }}
                      variant="primary"
                      size="sm"
                      className="text-xs"
                    >
                      Mark Ready
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-96 flex flex-col items-center justify-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl p-8 text-center text-neutral-400">
                <Wand2 className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  No post selected
                </p>
                <p className="text-xs mt-1 max-w-sm">
                  Enter a topic on the left and click "Generate X Post" to draft a high-engagement single post or thread.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Library Tab: All Saved X Posts */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Saved X Posts ({xPosts.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {xPosts.map((post) => (
              <div
                key={post.id}
                className="p-5 rounded-2xl bg-white dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800/80 shadow-2xs flex flex-col justify-between space-y-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={post.mode === 'thread' ? 'purple' : 'secondary'}>
                      {post.mode === 'thread' ? 'Thread' : 'Single'}
                    </Badge>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {post.singlePostContent?.length || 0} chars
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 line-clamp-1 mb-1">
                    {post.title}
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-4 leading-relaxed whitespace-pre-wrap">
                    {post.singlePostContent}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(post.singlePostContent, post.id)}
                      className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
                      title="Copy text"
                    >
                      {copiedId === post.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setCurrentPost(post);
                        setActiveTab('create');
                      }}
                      className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
                      title="Open in editor"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => deleteXPost(post.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/60 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete post"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
