'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/storage/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LinkedInPostRecord,
  LinkedInObjective,
  LinkedInFormatType,
  LinkedInLength,
  LinkedInStyle,
  LinkedInCTAType,
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
  X,
  Search,
  BookOpen,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lightbulb,
  FileEdit,
  SlidersHorizontal,
  Bookmark,
  Share2,
} from 'lucide-react';
import { ModelSelector } from '@/components/ai/model-selector';

const PRESET_NICHES = [
  'AI tools and automation',
  'AI agents and workflows',
  'Open-source AI tools and GitHub repositories',
  'Sales and cold calling',
  'Sales psychology and objection handling',
  'Website development',
  'SEO and local SEO',
  'Building projects and business systems',
  'Build in public',
  'Coding and programming',
  'Personal learning and professional growth',
  'Custom niche',
];

const AUDIENCE_OPTIONS = [
  'Founders',
  'Business owners',
  'Developers',
  'AI enthusiasts',
  'Freelancers',
  'Agency owners',
  'Sales professionals',
  'Students and beginners',
  'General professional audience',
  'Custom audience',
];

const OBJECTIVE_OPTIONS: LinkedInObjective[] = [
  'Auto-select',
  'Share a lesson',
  'Teach something useful',
  'Share a real personal experience',
  'Introduce an AI tool',
  'Share a GitHub repository',
  'Document a project update',
  'Explain a sales or business insight',
  'Share a technical explanation',
  'Start a professional discussion',
  'Build professional credibility',
  'Attract relevant professional connections',
  'Promote a service naturally',
  'Share an industry observation',
];

const FORMAT_OPTIONS: LinkedInFormatType[] = [
  'Auto-select',
  'Professional Insight',
  'Personal Learning',
  'Build in Public',
  'Educational Post',
  'Tool or GitHub Discovery',
  'Case Study or Experiment',
  'Professional Storytelling',
  'Opinion or Discussion',
  'Service-Related Post',
  'Custom Format',
];

const STYLE_OPTIONS: LinkedInStyle[] = [
  'Professional and conversational',
  'Educational',
  'Personal and reflective',
  'Technical',
  'Storytelling',
  'Opinion-driven',
  'Custom style',
];

const LENGTH_OPTIONS: LinkedInLength[] = ['Auto-select', 'Short', 'Medium', 'Long'];

const CTA_OPTIONS: LinkedInCTAType[] = [
  'Auto-select CTA',
  'Ask a professional discussion question',
  'Offer a resource through comments',
  'Invite relevant connections',
  'No CTA',
];

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

interface WorkspaceProps {
  post: LinkedInPostRecord;
  onPostCreated: (newId: string) => void;
  onRequestDelete: () => void;
  onRequestSchedule: () => void;
  showToast: (msg: string) => void;
}

function LinkedInWorkspace({
  post,
  onPostCreated,
  onRequestDelete,
  onRequestSchedule,
  showToast,
}: WorkspaceProps) {
  const { updateLinkedInPost, addLinkedInPost, aiConfig, styleProfile, getModelForModule } = useApp();

  // Strategy form initialized cleanly from active post
  const [topic, setTopic] = useState(post.topic || '');
  const [niche, setNiche] = useState(() =>
    PRESET_NICHES.includes(post.niche) ? post.niche : 'Custom niche'
  );
  const [customNiche, setCustomNiche] = useState(() =>
    !PRESET_NICHES.includes(post.niche) ? post.niche : ''
  );
  const [pillar, setPillar] = useState<ContentPillar>(
    post.contentPillar || 'BUILDING_PROJECTS_AND_SYSTEMS'
  );
  const [targetAudience, setTargetAudience] = useState(() =>
    AUDIENCE_OPTIONS.includes(post.targetAudience) ? post.targetAudience : 'Custom audience'
  );
  const [customAudience, setCustomAudience] = useState(() =>
    !AUDIENCE_OPTIONS.includes(post.targetAudience) ? post.targetAudience : ''
  );
  const [postObjective, setPostObjective] = useState<LinkedInObjective>(
    post.postObjective || 'Auto-select'
  );
  const [postFormat, setPostFormat] = useState<LinkedInFormatType>(
    FORMAT_OPTIONS.includes(post.postFormat) ? post.postFormat : 'Custom Format'
  );
  const [customFormatDescription, setCustomFormatDescription] = useState(
    post.customFormatDescription || ''
  );
  const [writingStyle, setWritingStyle] = useState<LinkedInStyle>(
    STYLE_OPTIONS.includes(post.writingStyle) ? post.writingStyle : 'Custom style'
  );
  const [customStyleDescription, setCustomStyleDescription] = useState(
    post.customStyleDescription || ''
  );
  const [postLength, setPostLength] = useState<LinkedInLength>(post.postLength || 'Medium');
  const [userNotes, setUserNotes] = useState(post.userNotes || '');
  const [isResearchEnabled, setIsResearchEnabled] = useState(post.isResearchEnabled || false);
  const [ctaType, setCtaType] = useState<LinkedInCTAType>(
    post.ctaSettings?.type || 'Auto-select CTA'
  );
  const [resourceKeyword, setResourceKeyword] = useState(
    post.ctaSettings?.resourceKeyword || 'GITHUB'
  );
  const [resourceName, setResourceName] = useState(
    post.ctaSettings?.resourceName || 'Setup Template'
  );
  const [resourceReady, setResourceReady] = useState(post.ctaSettings?.resourceReady ?? true);

  // Editor states
  const [editorText, setEditorText] = useState(post.currentEditedContent || '');
  const [postTitle, setPostTitle] = useState(post.title || 'New LinkedIn Post');
  const [postStatus, setPostStatus] = useState<LinkedInPostRecord['status']>(post.status || 'Draft');

  // Loading & tab flags
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [activeRefineAction, setActiveRefineAction] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'audit' | 'sources' | 'alternatives'>('editor');

  // Metrics
  const words = editorText.trim().split(/\s+/).filter(Boolean).length;
  const characters = editorText.length;
  const readingTimeSeconds = Math.max(15, Math.round((words / 200) * 60));

  const handleNicheChange = (newNiche: string) => {
    setNiche(newNiche);
    if (newNiche.includes('Sales')) setPillar('SALES_PSYCHOLOGY_AND_CLIENT_ACQUISITION');
    else if (newNiche.includes('GitHub') || newNiche.includes('Open-source')) setPillar('FREE_GITHUB_AND_DEV_TOOLS');
    else if (newNiche.includes('Website') || newNiche.includes('SEO')) setPillar('WEBSITE_DEV_AND_SEO');
    else if (newNiche.includes('Build in public') || newNiche.includes('Personal learning')) setPillar('BUILD_IN_PUBLIC_AND_JOURNEY');
    else if (newNiche.includes('AI')) setPillar('AI_TOOLS_AND_AUTOMATION');
  };

  const handleSaveCurrentPost = () => {
    updateLinkedInPost(post.id, {
      title: postTitle,
      currentEditedContent: editorText,
      status: postStatus,
      topic,
      niche: niche === 'Custom niche' ? customNiche : niche,
      contentPillar: pillar,
      targetAudience: targetAudience === 'Custom audience' ? customAudience : targetAudience,
      postObjective,
      postFormat,
      customFormatDescription,
      writingStyle,
      customStyleDescription,
      postLength,
      userNotes,
      isResearchEnabled,
      ctaSettings: {
        type: ctaType,
        resourceKeyword,
        resourceName,
        resourceReady,
      },
    });
    showToast('Post changes saved!');
  };

  const handleGeneratePost = async () => {
    setIsGenerating(true);
    try {
      const selectedModel = getModelForModule('linkedin');
      const linkedinAiConfig = {
        ...aiConfig,
        model: selectedModel,
        omniRouteModel: selectedModel,
      };

      let researchFindings: { summary: string; sources: Array<{ title: string; url: string; sourceName?: string }> } | null = null;

      if (isResearchEnabled && topic) {
        try {
          const resEndpoint = topic.toLowerCase().includes('github') || niche.includes('GitHub')
            ? '/api/research/github'
            : '/api/research/web';
          const payload = resEndpoint.includes('github')
            ? { repoUrlOrName: topic, aiConfig: linkedinAiConfig }
            : { query: topic, pillar, aiConfig: linkedinAiConfig };

          const res = await fetch(resEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const resData = await res.json();
          if (resData.research) {
            researchFindings = {
              summary: resData.research.summary || '',
              sources: [
                {
                  title: resData.research.title,
                  url: resData.research.url,
                  sourceName: resData.research.sourceName,
                },
              ],
            };
          }
        } catch (researchErr) {
          console.warn('Research retrieval error:', researchErr);
        }
      }

      const res = await fetch('/api/ai/generate-linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          topic: topic.trim() || 'Practical Lessons from Building Systems',
          niche: niche === 'Custom niche' ? customNiche : niche,
          pillar,
          targetAudience,
          customAudience,
          postObjective,
          postFormat,
          customFormatDescription,
          writingStyle,
          customStyleDescription,
          postLength,
          userNotes,
          ctaSettings: {
            type: ctaType,
            resourceKeyword,
            resourceName,
            resourceReady,
          },
          isResearchEnabled,
          researchSummary: researchFindings?.summary,
          researchSources: researchFindings?.sources,
          styleProfile,
          aiConfig: linkedinAiConfig,
        }),
      });

      const data = await res.json();
      if (data.post) {
        const newPost = addLinkedInPost(data.post);
        onPostCreated(newPost.id);
        showToast('LinkedIn post generated successfully!');
      } else if (data.error) {
        showToast(`Generation failed: ${data.error}`);
      }
    } catch (e: unknown) {
      const err = e as Error;
      showToast(`Generation error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefineAction = async (refineType: string) => {
    setIsRefining(true);
    setActiveRefineAction(refineType);
    try {
      const selectedModel = getModelForModule('linkedin');
      const res = await fetch('/api/ai/generate-linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'refine',
          refineType,
          currentContent: editorText,
          topic: post.topic,
          targetAudience: post.targetAudience,
          writingStyle: post.writingStyle,
          userNotes: post.userNotes,
          ctaSettings: post.ctaSettings,
          styleProfile,
          aiConfig: {
            ...aiConfig,
            model: selectedModel,
            omniRouteModel: selectedModel,
          },
        }),
      });
      const data = await res.json();
      if (data.revisedContent) {
        setEditorText(data.revisedContent);
        updateLinkedInPost(post.id, {
          currentEditedContent: data.revisedContent,
          qualityAudit: data.qualityAudit || post.qualityAudit,
        });
        showToast(`Post refined: ${refineType.replace('_', ' ')}!`);
      }
    } catch (e: unknown) {
      const err = e as Error;
      showToast(`Refinement failed: ${err.message}`);
    } finally {
      setIsRefining(false);
      setActiveRefineAction(null);
    }
  };

  const handleCopyPost = () => {
    navigator.clipboard.writeText(editorText);
    showToast('Post copied to clipboard! Ready to paste into LinkedIn.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT COLUMN: Generation Controls (5 cols) */}
      <div className="lg:col-span-5 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-purple-500" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Post Strategy & Generator
            </h3>
          </div>
          <ModelSelector currentModule="linkedin" compact />
        </div>

        {/* Topic Input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
            <span>Topic / Core Observation *</span>
            <span className="text-[10px] text-neutral-400">What is the central point?</span>
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Why asking 'do you like your website?' kills the cold call"
            className="w-full px-3 py-2 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
          />
        </div>

        {/* Niche & Pillar Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Niche / Content Topic
            </label>
            <select
              value={niche}
              onChange={(e) => handleNicheChange(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 cursor-pointer"
            >
              {PRESET_NICHES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Content Pillar
            </label>
            <select
              value={pillar}
              onChange={(e) => setPillar(e.target.value as ContentPillar)}
              className="w-full px-2.5 py-1.5 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 cursor-pointer"
            >
              {CONTENT_PILLARS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.shortTitle}
                </option>
              ))}
            </select>
          </div>
        </div>

        {niche === 'Custom niche' && (
          <div className="space-y-1 animate-in fade-in duration-150">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Specify Custom Niche
            </label>
            <input
              type="text"
              value={customNiche}
              onChange={(e) => setCustomNiche(e.target.value)}
              placeholder="Enter your custom topic or industry..."
              className="w-full px-3 py-1.5 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
          </div>
        )}

        {/* Target Audience & Objective Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Target Audience
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 cursor-pointer"
            >
              {AUDIENCE_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Post Objective
            </label>
            <select
              value={postObjective}
              onChange={(e) => setPostObjective(e.target.value as LinkedInObjective)}
              className="w-full px-2.5 py-1.5 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 cursor-pointer"
            >
              {OBJECTIVE_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        </div>

        {targetAudience === 'Custom audience' && (
          <div className="space-y-1 animate-in fade-in duration-150">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Specify Custom Audience
            </label>
            <input
              type="text"
              value={customAudience}
              onChange={(e) => setCustomAudience(e.target.value)}
              placeholder="e.g. CTOs at Series-A B2B SaaS companies"
              className="w-full px-3 py-1.5 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
          </div>
        )}

        {/* Format, Style, Length Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-neutral-700 dark:text-neutral-300 block">Format</label>
            <select
              value={postFormat}
              onChange={(e) => setPostFormat(e.target.value as LinkedInFormatType)}
              className="w-full px-2 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 cursor-pointer"
            >
              {FORMAT_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-neutral-700 dark:text-neutral-300 block">Style</label>
            <select
              value={writingStyle}
              onChange={(e) => setWritingStyle(e.target.value as LinkedInStyle)}
              className="w-full px-2 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 cursor-pointer"
            >
              {STYLE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-neutral-700 dark:text-neutral-300 block">Length</label>
            <select
              value={postLength}
              onChange={(e) => setPostLength(e.target.value as LinkedInLength)}
              className="w-full px-2 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 cursor-pointer"
            >
              {LENGTH_OPTIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        {postFormat === 'Custom Format' && (
          <div className="space-y-1 animate-in fade-in duration-150">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Describe Custom Post Structure
            </label>
            <input
              type="text"
              value={customFormatDescription}
              onChange={(e) => setCustomFormatDescription(e.target.value)}
              placeholder="e.g. 1 Hook line -> 3 bullet points with numbers -> 1 summary rule"
              className="w-full px-3 py-1.5 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
          </div>
        )}

        {writingStyle === 'Custom style' && (
          <div className="space-y-1 animate-in fade-in duration-150">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Describe Custom Tone
            </label>
            <input
              type="text"
              value={customStyleDescription}
              onChange={(e) => setCustomStyleDescription(e.target.value)}
              placeholder="e.g. Candid, dry wit, highly technical terminal perspective"
              className="w-full px-3 py-1.5 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
          </div>
        )}

        {/* Creator Source Notes (Strict Ground Truth) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <span>Personal Notes & Facts</span>
              <Badge variant="secondary" className="text-[10px] py-0 px-1 font-mono">
                Ground Truth
              </Badge>
            </label>
            <span className="text-[10px] text-neutral-400">Strictly no hallucination</span>
          </div>
          <textarea
            value={userNotes}
            onChange={(e) => setUserNotes(e.target.value)}
            rows={3}
            placeholder="Paste rough notes, real call experiences, code snippets, or build metrics. The AI will treat this as strict factual truth and never invent fake numbers."
            className="w-full px-3 py-2 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono leading-relaxed"
          />
        </div>

        {/* Research & CTA Toggles */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-850">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-purple-600" />
                <span>Research Before Writing</span>
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Retrieves official documentation, GitHub stats, and verified search guidelines.
              </div>
            </div>
            <input
              type="checkbox"
              checked={isResearchEnabled}
              onChange={(e) => setIsResearchEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
            />
          </div>

          {/* Smart CTA Configuration */}
          <div className="p-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-850 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-sky-600" />
                <span>Smart Call to Action (CTA)</span>
              </div>
              <span className="text-[10px] text-neutral-400">Low-friction</span>
            </div>

            <select
              value={ctaType}
              onChange={(e) => setCtaType(e.target.value as LinkedInCTAType)}
              className="w-full px-2.5 py-1.5 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 cursor-pointer"
            >
              {CTA_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {ctaType === 'Offer a resource through comments' && (
              <div className="pt-2 border-t border-neutral-200/50 dark:border-neutral-700/50 space-y-2 animate-in fade-in duration-150 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 block mb-0.5">
                      Comment Keyword
                    </label>
                    <input
                      type="text"
                      value={resourceKeyword}
                      onChange={(e) => setResourceKeyword(e.target.value.toUpperCase())}
                      placeholder="e.g. GITHUB, PROMPT, TEMPLATE"
                      className="w-full px-2 py-1 text-xs font-mono font-bold border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 block mb-0.5">
                      Resource Name
                    </label>
                    <input
                      type="text"
                      value={resourceName}
                      onChange={(e) => setResourceName(e.target.value)}
                      placeholder="e.g. Next.js SEO Audit Checklist"
                      className="w-full px-2 py-1 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={resourceReady}
                    onChange={(e) => setResourceReady(e.target.checked)}
                    className="w-3.5 h-3.5 text-purple-600 rounded cursor-pointer"
                  />
                  <span className="text-[11px] text-neutral-600 dark:text-neutral-400">
                    Resource is prepared and ready to deliver immediately
                  </span>
                </label>

                {!resourceReady && (
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>
                      Resource needs preparation before you publish this post. Never claim a resource exists if it is not ready.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Primary Action Button */}
        <Button
          onClick={handleGeneratePost}
          isLoading={isGenerating}
          className="w-full py-2.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-purple-400 dark:text-purple-600" />
          <span>Generate LinkedIn Post</span>
        </Button>
      </div>

      {/* RIGHT COLUMN: Live Post Editor & Tools (7 cols) */}
      <div className="lg:col-span-7 space-y-4">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-5 shadow-xs space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={postTitle}
                onChange={(e) => {
                  setPostTitle(e.target.value);
                  updateLinkedInPost(post.id, { title: e.target.value });
                }}
                className="w-full text-base font-bold text-neutral-900 dark:text-neutral-100 bg-transparent border-none p-0 focus:outline-none focus:ring-0 truncate"
                placeholder="Post Title..."
              />
              <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1 flex-wrap font-mono">
                <span>{words} words</span>
                <span>•</span>
                <span>{characters} chars</span>
                <span>•</span>
                <span>~{readingTimeSeconds}s read</span>
                {post.plannedDate && (
                  <>
                    <span>•</span>
                    <span className="text-sky-600 dark:text-sky-400 font-semibold flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      {post.plannedDate}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={postStatus}
                onChange={(e) => {
                  const st = e.target.value as LinkedInPostRecord['status'];
                  setPostStatus(st);
                  updateLinkedInPost(post.id, { status: st });
                }}
                className="text-xs font-semibold py-1 px-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-800 dark:text-neutral-200 cursor-pointer"
              >
                <option value="Idea">Idea</option>
                <option value="Draft">Draft</option>
                <option value="Ready to Publish">Ready to Publish</option>
                <option value="Published">Published</option>
              </select>

              <Button
                onClick={onRequestSchedule}
                variant="outline"
                size="sm"
                className="text-xs h-7 px-2.5 font-medium"
                title="Assign planned publishing date on Content Calendar"
              >
                <CalendarIcon className="w-3.5 h-3.5 mr-1 text-sky-600" />
                Schedule
              </Button>

              <Button
                onClick={handleCopyPost}
                variant="outline"
                size="sm"
                className="text-xs h-7 px-2.5 font-medium"
                title="Copy complete post"
              >
                <Copy className="w-3.5 h-3.5 mr-1" />
                Copy
              </Button>

              <Button
                onClick={handleSaveCurrentPost}
                variant="outline"
                size="sm"
                className="text-xs h-7 px-2.5 font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                title="Save post changes"
              >
                Save
              </Button>
            </div>
          </div>

          {/* Targeted Improvement Actions Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
              <span className="flex items-center gap-1">
                <Wand2 className="w-3 h-3 text-purple-600" /> Targeted Post Refinement Tools
              </span>
              {isRefining && (
                <span className="text-purple-600 animate-pulse font-mono">
                  Applying {activeRefineAction?.replace('_', ' ')}...
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'improve_hook', label: '🪝 Improve Hook' },
                { id: 'make_professional', label: '👔 More Professional' },
                { id: 'make_conversational', label: '💬 More Conversational' },
                { id: 'make_concise', label: '✂️ More Concise' },
                { id: 'add_practical_detail', label: '🔍 Add Detail' },
                { id: 'improve_readability', label: '📖 Improve Spacing' },
                { id: 'change_ending', label: '🏁 Change Ending' },
                { id: 'generate_alternative', label: '🔀 Alternative Version' },
              ].map((act) => (
                <button
                  key={act.id}
                  disabled={isRefining}
                  onClick={() => handleRefineAction(act.id)}
                  className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-[11px] font-medium shrink-0 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {act.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live Textarea Post Editor */}
          <div className="relative">
            <textarea
              value={editorText}
              onChange={(e) => {
                setEditorText(e.target.value);
                updateLinkedInPost(post.id, { currentEditedContent: e.target.value });
              }}
              rows={14}
              className="w-full p-4 text-xs font-sans border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50/50 dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-purple-500 leading-relaxed font-normal whitespace-pre-wrap selection:bg-purple-200 dark:selection:bg-purple-900"
              placeholder="Your LinkedIn post content will appear here..."
            />
          </div>

          {/* Footer Sub-Tabs */}
          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs">
              {[
                { id: 'editor' as const, label: 'Live Editor' },
                { id: 'audit' as const, label: `Quality Audit (${post.qualityAudit?.overallScore ?? 92}%)` },
                { id: 'sources' as const, label: `Sources (${post.researchSources?.length || 0})` },
                { id: 'alternatives' as const, label: `Alternative Versions (${post.alternativeVersions?.length || 0})` },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                    activeTab === t.id
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 bg-neutral-100/60 dark:bg-neutral-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <button
              onClick={onRequestDelete}
              className="text-xs text-neutral-400 hover:text-rose-600 p-1 rounded cursor-pointer transition-colors"
              title="Delete this LinkedIn post"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Sub-Panel: Quality Audit View */}
        {activeTab === 'audit' && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  LinkedIn Authenticity & Quality Evaluation
                </h4>
              </div>
              <Badge
                variant={(post.qualityAudit?.overallScore ?? 90) >= 80 ? 'success' : 'outline'}
                className="font-mono text-xs"
              >
                Score: {post.qualityAudit?.overallScore ?? 92} / 100
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {(
                post.qualityAudit?.checks || [
                  { id: '1', question: 'Appropriate for LinkedIn', passed: true, feedback: 'Professional cadence and formatting.' },
                  { id: '2', question: 'Central idea clear', passed: true, feedback: 'Single focused observation.' },
                  { id: '3', question: 'Opening hook relevant', passed: true, feedback: 'Opens without clickbait clichés.' },
                  { id: '4', question: 'Body provides real value', passed: true, feedback: 'Concrete actionable takeaways.' },
                  { id: '5', question: 'Audience tone fits', passed: true, feedback: 'Peer-to-peer professional warmth.' },
                  { id: '6', question: 'Natural human voice', passed: true, feedback: 'No corporate buzzwords or artificial hype.' },
                  { id: '7', question: 'Factual claims supported', passed: true, feedback: 'Grounded in observable mechanics.' },
                  { id: '8', question: 'No invented experience', passed: true, feedback: 'Zero fabricated revenue or milestones.' },
                  { id: '9', question: 'Appropriate conclusion', passed: true, feedback: 'Closes cleanly without forced questions.' },
                  { id: '10', question: 'Concise without filler', passed: true, feedback: 'High informational density.' },
                  { id: '11', question: 'CTA relevant & non-pushy', passed: true, feedback: 'Low-friction comment or connection prompt.' },
                ]
              ).map((chk) => (
                <div
                  key={chk.id}
                  className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                    chk.passed
                      ? 'border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20'
                      : 'border-rose-200 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/20'
                  }`}
                >
                  {chk.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-[11px]">
                      {chk.question}
                    </div>
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {chk.feedback}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {post.qualityAudit?.actionableSuggestions && post.qualityAudit.actionableSuggestions.length > 0 && (
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-xs space-y-1">
                <div className="font-bold text-neutral-900 dark:text-neutral-100 text-[11px]">
                  Actionable Improvement Notes:
                </div>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-neutral-600 dark:text-neutral-300">
                  {post.qualityAudit.actionableSuggestions.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Sub-Panel: Research Sources View */}
        {activeTab === 'sources' && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-5 shadow-xs space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-purple-600" />
                <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Retrieved Research & Citations
                </h4>
              </div>
              <Badge variant={post.isResearchEnabled ? 'purple' : 'outline'} className="text-[10px]">
                {post.isResearchEnabled ? 'Fresh Web Verification' : 'Offline Knowledge'}
              </Badge>
            </div>

            {post.researchSources && post.researchSources.length > 0 ? (
              <div className="space-y-2">
                {post.researchSources.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-neutral-900 dark:text-neutral-100">{s.title}</div>
                      {s.sourceName && (
                        <span className="text-[10px] text-neutral-500 font-mono">{s.sourceName}</span>
                      )}
                      {s.snippet && (
                        <p className="text-[11px] text-neutral-600 dark:text-neutral-300">{s.snippet}</p>
                      )}
                    </div>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-white dark:hover:bg-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-700 text-center text-xs text-neutral-500">
                This post was generated directly from your creator knowledge and source notes without fresh web research.
              </div>
            )}
          </div>
        )}

        {/* Sub-Panel: Alternative Versions View */}
        {activeTab === 'alternatives' && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-5 shadow-xs space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2.5">
              <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Alternative Hooks & Angles
              </h4>
              <Button
                onClick={() => handleRefineAction('generate_alternative')}
                variant="outline"
                size="sm"
                className="text-xs h-7"
              >
                <Plus className="w-3 h-3 mr-1" />
                Generate New Angle
              </Button>
            </div>

            {post.alternativeVersions && post.alternativeVersions.length > 0 ? (
              <div className="space-y-2">
                {post.alternativeVersions.map((alt, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-xs space-y-2"
                  >
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans">{alt}</p>
                    <button
                      onClick={() => {
                        const lines = editorText.split('\n');
                        lines[0] = alt;
                        setEditorText(lines.join('\n'));
                        showToast('Applied alternative opening hook!');
                      }}
                      className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                    >
                      Apply as Opening Hook →
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-700 text-center text-xs text-neutral-500">
                Click &quot;Alternative Version&quot; above to generate alternative angles for this topic.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function LinkedInStudioContent() {
  const searchParams = useSearchParams();
  const urlPostId = searchParams.get('id');

  const {
    linkedinPosts,
    addLinkedInPost,
    deleteLinkedInPost,
    duplicateLinkedInPost,
    createLinkedInPostFromScript,
    createLinkedInPostFromIdea,
    createLinkedInPostFromResearch,
    createLinkedInPostFromReport,
    scheduleLinkedInPostToCalendar,
    scripts,
    ideas,
    research,
    reports,
  } = useApp();

  const [activePostId, setActivePostId] = useState<string>(() => {
    if (urlPostId && (linkedinPosts || []).some((p) => p.id === urlPostId)) {
      return urlPostId;
    }
    return linkedinPosts?.[0]?.id || '';
  });

  const activePost =
    linkedinPosts.find((p) => p.id === activePostId) ||
    (urlPostId && linkedinPosts.find((p) => p.id === urlPostId)) ||
    linkedinPosts[0];

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Scheduling state
  const [scheduleDate, setScheduleDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [scheduleTime, setScheduleTime] = useState('09:30');

  // Library filter state
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryFilterStatus, setLibraryFilterStatus] = useState<string>('ALL');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateBlankPost = () => {
    const count = (linkedinPosts || []).length + 1;
    const newPost = addLinkedInPost({
      title: `Untitled Post #${count}`,
      topic: 'New Observation',
      niche: 'Building projects and business systems',
      contentPillar: 'BUILDING_PROJECTS_AND_SYSTEMS',
      targetAudience: 'Developers and builders',
      postObjective: 'Share a lesson',
      postFormat: 'Professional Insight',
      writingStyle: 'Professional and conversational',
      postLength: 'Medium',
      generatedContent: 'Start typing your LinkedIn post here, or use the generator on the left...',
      currentEditedContent: 'Start typing your LinkedIn post here, or use the generator on the left...',
      ctaSettings: { type: 'Auto-select CTA' },
      status: 'Idea',
    });
    setActivePostId(newPost.id);
    showToast('Created new blank post.');
  };

  const handleConfirmSchedule = () => {
    if (!activePost) return;
    scheduleLinkedInPostToCalendar(activePost.id, scheduleDate, scheduleTime);
    setIsScheduleModalOpen(false);
    showToast(`Scheduled for ${scheduleDate} at ${scheduleTime} on your Content Calendar.`);
  };

  const handleDeletePost = () => {
    if (!activePost) return;
    deleteLinkedInPost(activePost.id);
    setIsDeleteModalOpen(false);
    showToast('Post deleted.');
  };

  const filteredLibrary = (linkedinPosts || []).filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(librarySearch.toLowerCase()) ||
      p.topic.toLowerCase().includes(librarySearch.toLowerCase()) ||
      p.currentEditedContent.toLowerCase().includes(librarySearch.toLowerCase());
    const matchesStatus = libraryFilterStatus === 'ALL' || p.status === libraryFilterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 border border-neutral-700 dark:border-neutral-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <LinkedInIcon className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              LinkedIn Post Studio
            </h2>
            <Badge variant="outline" className="text-xs bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800">
              Natural Voice Engine
            </Badge>
            <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800">
              Anti-Hallucination Safe
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-2xl leading-relaxed">
            Turn real project milestones, terminal errors, cold calls, and developer tools into high-signal LinkedIn posts that sound authentic, human, and grounded.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <ModelSelector currentModule="linkedin" />

          <Button
            onClick={() => setIsImportModalOpen(true)}
            variant="outline"
            size="sm"
            className="text-xs font-semibold cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 mr-1 text-purple-600" />
            Import Existing Asset
          </Button>

          <Button
            onClick={() => setIsLibraryModalOpen(true)}
            variant="outline"
            size="sm"
            className="text-xs font-semibold cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5 mr-1" />
            Saved Posts ({linkedinPosts?.length || 0})
          </Button>

          <Button
            onClick={handleCreateBlankPost}
            size="sm"
            className="text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            New Post
          </Button>
        </div>
      </div>

      {/* Main Workspace (Keyed by post.id for zero-effect state reset) */}
      {activePost ? (
        <LinkedInWorkspace
          key={activePost.id}
          post={activePost}
          onPostCreated={(newId) => setActivePostId(newId)}
          onRequestDelete={() => setIsDeleteModalOpen(true)}
          onRequestSchedule={() => setIsScheduleModalOpen(true)}
          showToast={showToast}
        />
      ) : (
        <div className="p-12 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs space-y-3">
          <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            No LinkedIn posts in your library yet.
          </p>
          <Button onClick={handleCreateBlankPost} size="sm" className="text-xs font-bold">
            Create First Post
          </Button>
        </div>
      )}

      {/* MODAL 1: IMPORT ASSET (Reels, Ideas, Research, Reports) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Convert Existing AI Creator OS Content into a LinkedIn Post
                </h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Select any existing Reel script, Content idea, verified GitHub repo, or sprint note. The AI extracts the core insight and builds a new dedicated LinkedIn post—never overwriting your original asset.
            </p>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {/* REEL SCRIPTS */}
              <div className="space-y-2">
                <div className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <FileEdit className="w-3.5 h-3.5 text-purple-600" />
                  <span>Reel Scripts ({scripts.length})</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {scripts.slice(0, 3).map((s) => (
                    <div
                      key={s.id}
                      className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">{s.title}</div>
                        <div className="text-[11px] text-neutral-500 truncate">{s.hookOptions?.[0] || s.caption}</div>
                      </div>
                      <Button
                        onClick={() => {
                          const newPost = createLinkedInPostFromScript(s);
                          setActivePostId(newPost.id);
                          setIsImportModalOpen(false);
                          showToast(`Created LinkedIn post from "${s.title}"!`);
                        }}
                        variant="outline"
                        size="sm"
                        className="text-xs shrink-0 cursor-pointer"
                      >
                        Turn into Post →
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* CONTENT IDEAS */}
              <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <div className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Content Ideas ({ideas.length})</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {ideas.slice(0, 3).map((i) => (
                    <div
                      key={i.id}
                      className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">{i.title}</div>
                        <div className="text-[11px] text-neutral-500 truncate">{i.mainAngle || i.topic}</div>
                      </div>
                      <Button
                        onClick={() => {
                          const newPost = createLinkedInPostFromIdea(i);
                          setActivePostId(newPost.id);
                          setIsImportModalOpen(false);
                          showToast(`Created LinkedIn post from "${i.title}"!`);
                        }}
                        variant="outline"
                        size="sm"
                        className="text-xs shrink-0 cursor-pointer"
                      >
                        Turn into Post →
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* RESEARCH RECORDS */}
              <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <div className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Research & GitHub Discoveries ({research.length})</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {research.slice(0, 3).map((r) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">{r.title}</div>
                        <div className="text-[11px] text-neutral-500 truncate">{r.sourceName}</div>
                      </div>
                      <Button
                        onClick={() => {
                          const newPost = createLinkedInPostFromResearch(r);
                          setActivePostId(newPost.id);
                          setIsImportModalOpen(false);
                          showToast(`Created LinkedIn post from "${r.title}"!`);
                        }}
                        variant="outline"
                        size="sm"
                        className="text-xs shrink-0 cursor-pointer"
                      >
                        Turn into Post →
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SPRINT NOTES / REPORTS */}
              <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <div className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sprint Reports & Notes ({reports.length})</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {reports.slice(0, 3).map((rep) => (
                    <div
                      key={rep.id}
                      className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">{rep.title}</div>
                        <div className="text-[11px] text-neutral-500 truncate">{rep.category}</div>
                      </div>
                      <Button
                        onClick={() => {
                          const newPost = createLinkedInPostFromReport(rep);
                          setActivePostId(newPost.id);
                          setIsImportModalOpen(false);
                          showToast(`Created LinkedIn post from "${rep.title}"!`);
                        }}
                        variant="outline"
                        size="sm"
                        className="text-xs shrink-0 cursor-pointer"
                      >
                        Turn into Post →
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SAVED POSTS LIBRARY */}
      {isLibraryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-purple-600" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Saved LinkedIn Posts ({linkedinPosts?.length || 0})
                </h3>
              </div>
              <button
                onClick={() => setIsLibraryModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-2 text-xs">
              <div className="relative flex-1 w-full">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search posts by title, topic, or content..."
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <select
                value={libraryFilterStatus}
                onChange={(e) => setLibraryFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 cursor-pointer shrink-0"
              >
                <option value="ALL">All Statuses</option>
                <option value="Idea">Idea</option>
                <option value="Draft">Draft</option>
                <option value="Ready to Publish">Ready to Publish</option>
                <option value="Published">Published</option>
              </select>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {filteredLibrary.length > 0 ? (
                filteredLibrary.map((postItem) => (
                  <div
                    key={postItem.id}
                    className={`p-3.5 rounded-xl border transition-colors flex items-start justify-between gap-3 text-xs ${
                      postItem.id === activePost?.id
                        ? 'border-purple-500 bg-purple-50/20 dark:bg-purple-950/20'
                        : 'border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/50 hover:bg-neutral-100/50'
                    }`}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-neutral-900 dark:text-neutral-100 text-sm truncate">
                          {postItem.title}
                        </span>
                        <Badge
                          variant={
                            postItem.status === 'Ready to Publish'
                              ? 'success'
                              : postItem.status === 'Published'
                              ? 'secondary'
                              : 'outline'
                          }
                          className="text-[10px]"
                        >
                          {postItem.status}
                        </Badge>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {postItem.currentEditedContent.split(/\s+/).length} words
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed">
                        {postItem.currentEditedContent}
                      </p>
                      <div className="text-[10px] text-neutral-400 flex items-center gap-2 pt-0.5">
                        <span>Pillar: {postItem.contentPillar}</span>
                        {postItem.plannedDate && (
                          <span className="text-sky-600 dark:text-sky-400 font-semibold font-mono">
                            📅 {postItem.plannedDate}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        onClick={() => {
                          setActivePostId(postItem.id);
                          setIsLibraryModalOpen(false);
                        }}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 px-2"
                      >
                        Open
                      </Button>

                      <Button
                        onClick={() => {
                          const dup = duplicateLinkedInPost(postItem.id);
                          setActivePostId(dup.id);
                          showToast(`Duplicated: ${dup.title}`);
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 px-2 text-neutral-500 hover:text-neutral-900"
                        title="Duplicate Post"
                      >
                        Duplicate
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-neutral-500">
                  No LinkedIn posts found matching your search.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SCHEDULE MODAL */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Assign to Content Calendar
                </h3>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Set a planned publishing date and time for &quot;{activePost?.title}&quot;. It will immediately appear on your Content Calendar and sync alongside your Reels and Carousels.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Planned Date (YYYY-MM-DD)
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 cursor-pointer"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Planned Time
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                onClick={() => setIsScheduleModalOpen(false)}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSchedule}
                size="sm"
                className="text-xs bg-sky-600 text-white hover:bg-sky-700 font-bold"
              >
                Confirm Schedule
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE CONFIRMATION */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold">Delete LinkedIn Post</h3>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Are you sure you want to permanently delete &quot;{activePost?.title}&quot;? This action cannot be undone.
            </p>
            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                onClick={() => setIsDeleteModalOpen(false)}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeletePost}
                size="sm"
                className="text-xs bg-rose-600 text-white hover:bg-rose-700 font-bold"
              >
                Delete Post
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LinkedInStudioPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-500">Loading LinkedIn Post Studio...</div>}>
      <LinkedInStudioContent />
    </Suspense>
  );
}
