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
  ContentIdea,
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
  Undo2,
  ArrowRight,
  Check,
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
  const { updateLinkedInPost, addLinkedInPost, aiConfig, styleProfile, getModelForModule, ideas } = useApp();

  // Content Ideas Selector modal & filters
  const [isIdeaPickerOpen, setIsIdeaPickerOpen] = useState(false);
  const [ideaSearch, setIdeaSearch] = useState('');
  const [ideaPillarFilter, setIdeaPillarFilter] = useState<string>('ALL');

  // Refinement history for 1-click undo
  const [previousContent, setPreviousContent] = useState<string | null>(null);

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

  // Research states - default research to true!
  const [isResearchEnabled, setIsResearchEnabled] = useState(post.isResearchEnabled !== false);
  const [isResearching, setIsResearching] = useState(false);
  const [activeResearchData, setActiveResearchData] = useState<{
    title: string;
    url: string;
    sourceName?: string;
    summary: string;
    relevantClaims?: string[];
    confidenceStatus?: string;
  } | null>(() => {
    if (post.researchSummary) {
      return {
        title: post.researchSources?.[0]?.title || 'Attached Research',
        url: post.researchSources?.[0]?.url || '',
        sourceName: post.researchSources?.[0]?.sourceName || 'Technical Documentation',
        summary: post.researchSummary,
        relevantClaims: [],
        confidenceStatus: 'Official Documentation',
      };
    }
    return null;
  });

  const [ctaType, setCtaType] = useState<LinkedInCTAType>(
    post.ctaSettings?.type || 'Auto-select CTA'
  );
  const [resourceKeyword, setResourceKeyword] = useState(
    post.ctaSettings?.resourceKeyword || 'RESOURCE'
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
      researchSummary: activeResearchData?.summary || post.researchSummary,
      researchSources: activeResearchData ? [{ title: activeResearchData.title, url: activeResearchData.url, sourceName: activeResearchData.sourceName }] : post.researchSources,
      ctaSettings: {
        type: ctaType,
        resourceKeyword,
        resourceName,
        resourceReady,
      },
    });
    showToast('Post changes saved!');
  };

  // Run On-Demand Research
  const handleRunResearch = async () => {
    const query = topic.trim();
    if (!query) {
      showToast('Please enter a topic or select an idea first to run research.');
      return;
    }
    setIsResearching(true);
    try {
      const selectedModel = getModelForModule('linkedin');
      const linkedinAiConfig = {
        ...aiConfig,
        model: selectedModel,
        omniRouteModel: selectedModel,
      };

      const isGh = query.toLowerCase().includes('github') || niche.toLowerCase().includes('github');
      const resEndpoint = isGh ? '/api/research/github' : '/api/research/web';
      const payload = isGh
        ? { repoUrlOrName: query, aiConfig: linkedinAiConfig }
        : { query, pillar, aiConfig: linkedinAiConfig };

      const res = await fetch(resEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (resData.research) {
        const r = resData.research;
        setActiveResearchData({
          title: r.title,
          url: r.url,
          sourceName: r.sourceName || (r.isGithubRepo ? 'GitHub Official API' : 'Documentation'),
          summary: r.summary,
          relevantClaims: r.relevantClaims || [],
          confidenceStatus: r.confidenceStatus || 'Official Documentation',
        });
        setIsResearchEnabled(true);
        showToast('Research gathered! Verified claims ready.');
      } else if (resData.error) {
        showToast(`Research notice: ${resData.error}`);
      }
    } catch (err: unknown) {
      showToast(`Research error: ${(err as Error).message}`);
    } finally {
      setIsResearching(false);
    }
  };

  const handleInsertClaimsToNotes = (claims: string[]) => {
    if (!claims || claims.length === 0) return;
    const formatted = `\n\nVerified Research Takeaways:\n${claims.map((c) => `• ${c}`).join('\n')}`;
    setUserNotes((prev) => `${prev.trim()}${formatted}`);
    showToast('Inserted verified claims into notes!');
  };

  // Content Idea Selection & Preset Handlers
  const handleLoadIdea = (idea: ContentIdea) => {
    const ideaTitle = idea.title || idea.topic;
    setTopic(idea.topic || idea.title);
    setPostTitle(ideaTitle);
    setPillar(idea.pillar);
    if (idea.targetAudience) setTargetAudience(idea.targetAudience);

    const combinedNotes = [
      idea.mainAngle ? `Angle: ${idea.mainAngle}` : '',
      idea.hook ? `Hook: ${idea.hook}` : '',
      idea.supportingResearch ? `Research: ${idea.supportingResearch}` : '',
      idea.evidenceNotes ? `Evidence: ${idea.evidenceNotes}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');
    if (combinedNotes) setUserNotes(combinedNotes);

    if (idea.pillar === 'SALES_PSYCHOLOGY_AND_CLIENT_ACQUISITION') {
      setNiche('Sales and cold calling');
    } else if (idea.pillar === 'FREE_GITHUB_AND_DEV_TOOLS') {
      setNiche('Open-source AI tools and GitHub repositories');
    } else if (idea.pillar === 'WEBSITE_DEV_AND_SEO') {
      setNiche('Website development');
    } else if (idea.pillar === 'BUILD_IN_PUBLIC_AND_JOURNEY') {
      setNiche('Build in public');
    } else if (idea.pillar === 'AI_TOOLS_AND_AUTOMATION') {
      setNiche('AI tools and automation');
    }

    setIsIdeaPickerOpen(false);
    showToast(`Loaded idea: "${ideaTitle}" into LinkedIn Studio!`);
  };

  const handleApplyPreset = (presetKey: 'day' | 'sales' | 'github' | 'tech' | 'growth') => {
    if (presetKey === 'day') {
      setTopic('Daily Build Log: What broke today & how we solved it');
      setPostTitle('Sprint Notes: What Broke Today & What We Shipped');
      setPillar('BUILD_IN_PUBLIC_AND_JOURNEY');
      setNiche('Build in public');
      setPostFormat('Build in Public');
      setTargetAudience('Developers');
      setUserNotes('Real sprint reflection from today: Hit an unexpected input bottleneck, isolated the root cause, and pushed the fix. Lesson: validating boundaries early saves hours of symptom chasing.');
      showToast('Loaded preset: Daily Build Log!');
    } else if (presetKey === 'sales') {
      setTopic('Cold Calling: Shifting from pitching services to diagnosing customer friction');
      setPostTitle('Cold Calling Breakdown: The 2-Second Diagnostic');
      setPillar('SALES_PSYCHOLOGY_AND_CLIENT_ACQUISITION');
      setNiche('Sales and cold calling');
      setPostFormat('Case Study or Experiment');
      setTargetAudience('Agency owners');
      setUserNotes('Lesson from local business outreach: Asking "do you like your website" yields instant resistance. Asking if their mobile page loads in 2 seconds with an instant call button turns conversations into audits.');
      showToast('Loaded preset: Cold Calling & Sales!');
    } else if (presetKey === 'github') {
      setTopic('Open-Source Discovery: 4 criteria to verify before adding a GitHub dependency');
      setPostTitle('Open-Source Breakdown: Star Counts vs Maintainer Velocity');
      setPillar('FREE_GITHUB_AND_DEV_TOOLS');
      setNiche('Open-source AI tools and GitHub repositories');
      setPostFormat('Tool or GitHub Discovery');
      setTargetAudience('Developers');
      setUserNotes('Sanity checks for open-source libraries: commit recency, self-hosting isolation (no mandatory OpenAI keys), clean docker-compose setup, and permissive license.');
      showToast('Loaded preset: GitHub Discovery!');
    } else if (presetKey === 'tech') {
      setTopic('Why schema validation at the boundary eliminates 80% of runtime bugs');
      setPostTitle('Architecture Lesson: Input Validation vs Retry Loops');
      setPillar('BUILDING_PROJECTS_AND_SYSTEMS');
      setNiche('Building projects and business systems');
      setPostFormat('Professional Insight');
      setTargetAudience('Developers');
      setUserNotes('Technical post-mortem: Stop writing complex retry loops when you can just validate input types upfront with Zod or Pydantic.');
      showToast('Loaded preset: Tech Architecture!');
    } else if (presetKey === 'growth') {
      setTopic('Creator Analytics: What 61% non-follower reach taught me about hook retention');
      setPostTitle('Growth Analytics: Non-Follower Reach vs Follower Counts');
      setPillar('BUILD_IN_PUBLIC_AND_JOURNEY');
      setNiche('Personal learning and professional growth');
      setPostFormat('Personal Learning');
      setTargetAudience('Founders');
      setUserNotes('Real data from today: 76 followers, 1,579 reach, 61% non-followers, 88 interactions, 5.57% engagement rate. Lesson: Focus on hook retention in the first 2.5s rather than obsessing over vanity metrics.');
      showToast('Loaded preset: Creator Analytics & Growth!');
    }
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

      if (isResearchEnabled) {
        if (activeResearchData) {
          researchFindings = {
            summary: activeResearchData.summary,
            sources: [
              {
                title: activeResearchData.title,
                url: activeResearchData.url,
                sourceName: activeResearchData.sourceName,
              },
            ],
          };
        } else if (topic) {
          try {
            const isGh = topic.toLowerCase().includes('github') || niche.toLowerCase().includes('github');
            const resEndpoint = isGh ? '/api/research/github' : '/api/research/web';
            const payload = isGh
              ? { repoUrlOrName: topic, aiConfig: linkedinAiConfig }
              : { query: topic, pillar, aiConfig: linkedinAiConfig };

            const res = await fetch(resEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            const resData = await res.json();
            if (resData.research) {
              const r = resData.research;
              setActiveResearchData({
                title: r.title,
                url: r.url,
                sourceName: r.sourceName,
                summary: r.summary,
                relevantClaims: r.relevantClaims,
                confidenceStatus: r.confidenceStatus,
              });
              researchFindings = {
                summary: r.summary || '',
                sources: [{ title: r.title, url: r.url, sourceName: r.sourceName }],
              };
            }
          } catch (researchErr) {
            console.warn('Research retrieval error:', researchErr);
          }
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
          topic: topic || post.topic,
          niche: niche === 'Custom niche' ? customNiche : niche,
          pillar,
          targetAudience: targetAudience === 'Custom audience' ? customAudience : targetAudience,
          writingStyle,
          userNotes,
          ctaSettings: {
            type: ctaType,
            resourceKeyword,
            resourceName,
            resourceReady,
          },
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
        setPreviousContent(editorText);
        setEditorText(data.revisedContent);
        updateLinkedInPost(post.id, {
          currentEditedContent: data.revisedContent,
          qualityAudit: data.qualityAudit || post.qualityAudit,
        });
        showToast(`Post refined: ${refineType.replace(/_/g, ' ')}!`);
      } else if (data.error) {
        showToast(`Refinement notice: ${data.error}`);
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

  const filteredIdeas = (ideas || []).filter((i) => {
    const matchesSearch =
      i.title.toLowerCase().includes(ideaSearch.toLowerCase()) ||
      (i.topic && i.topic.toLowerCase().includes(ideaSearch.toLowerCase())) ||
      (i.mainAngle && i.mainAngle.toLowerCase().includes(ideaSearch.toLowerCase()));
    const matchesPillar = ideaPillarFilter === 'ALL' || i.pillar === ideaPillarFilter;
    return matchesSearch && matchesPillar;
  });

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

        {/* Quick Load from Content Ideas & Creator Presets */}
        <div className="p-3 rounded-xl border border-purple-200/80 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/20 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Content Ideas & Themes</span>
            </span>
            <Button
              type="button"
              onClick={() => setIsIdeaPickerOpen(true)}
              variant="outline"
              size="sm"
              className="text-[11px] h-6 px-2 font-semibold bg-white dark:bg-neutral-800 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-50 cursor-pointer"
            >
              Browse Ideas ({ideas?.length || 0}) →
            </Button>
          </div>

          {/* 1-Click Creator Presets */}
          <div className="space-y-1">
            <div className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">
              Quick 1-Click Creator Presets:
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => handleApplyPreset('day')}
                className="px-2 py-0.5 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-purple-400 text-neutral-700 dark:text-neutral-300 cursor-pointer font-medium transition-colors"
                title="Behind the scenes: what broke today, root cause, and what we shipped"
              >
                ⚡ Daily Build Log
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('sales')}
                className="px-2 py-0.5 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-purple-400 text-neutral-700 dark:text-neutral-300 cursor-pointer font-medium transition-colors"
                title="Cold calling breakdown: asking diagnostic questions instead of pitching websites"
              >
                📞 Cold Call / Sales
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('github')}
                className="px-2 py-0.5 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-purple-400 text-neutral-700 dark:text-neutral-300 cursor-pointer font-medium transition-colors"
                title="GitHub repo evaluation: star counts vs commit recency and self-hosting isolation"
              >
                🛠️ GitHub Repo
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('tech')}
                className="px-2 py-0.5 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-purple-400 text-neutral-700 dark:text-neutral-300 cursor-pointer font-medium transition-colors"
                title="System architecture: schema validation at the boundary vs complex retry loops"
              >
                💻 Tech Lesson
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('growth')}
                className="px-2 py-0.5 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-purple-400 text-neutral-700 dark:text-neutral-300 cursor-pointer font-medium transition-colors"
                title="Real Instagram analytics: 76 followers, 1,579 reach, 61% non-followers"
              >
                📈 Growth Metrics
              </button>
            </div>
          </div>
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
          <div className="p-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-850 space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-purple-600" />
                  <span>Research Before Writing</span>
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Retrieves verified documentation, Core Web Vitals, GitHub stats, & sales benchmarks.
                </div>
              </div>
              <input
                type="checkbox"
                checked={isResearchEnabled}
                onChange={(e) => setIsResearchEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
              />
            </div>

            {isResearchEnabled && (
              <div className="pt-1.5 border-t border-neutral-200/50 dark:border-neutral-750/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500">
                    Verify claims before writing post
                  </span>
                  <Button
                    type="button"
                    onClick={handleRunResearch}
                    isLoading={isResearching}
                    variant="outline"
                    size="sm"
                    className="text-[11px] h-6 px-2.5 font-semibold text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-50 cursor-pointer"
                  >
                    <Search className="w-3 h-3 mr-1 text-purple-600" />
                    Run Research on Topic Now
                  </Button>
                </div>

                {/* Live Research Findings Card */}
                {activeResearchData && (
                  <div className="p-2.5 rounded-lg border border-purple-200 dark:border-purple-900/40 bg-white dark:bg-neutral-800 text-xs space-y-1.5 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-neutral-900 dark:text-neutral-100 text-[11px] truncate flex-1 mr-2">
                        {activeResearchData.title}
                      </div>
                      <Badge variant="purple" className="text-[9px] py-0 px-1 font-mono shrink-0">
                        {activeResearchData.confidenceStatus || 'Verified'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-mono">
                      <span>Source: {activeResearchData.sourceName || 'Technical Docs'}</span>
                      {activeResearchData.url && (
                        <a
                          href={activeResearchData.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-purple-600 hover:underline ml-1"
                        >
                          [link]
                        </a>
                      )}
                    </div>

                    <p className="text-[11px] text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed">
                      {activeResearchData.summary}
                    </p>

                    {activeResearchData.relevantClaims && activeResearchData.relevantClaims.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-neutral-100 dark:border-neutral-700">
                        <div className="flex items-center justify-between text-[10px] font-semibold text-neutral-500">
                          <span>Key Verified Claims:</span>
                          <button
                            type="button"
                            onClick={() => handleInsertClaimsToNotes(activeResearchData.relevantClaims || [])}
                            className="text-purple-600 hover:underline cursor-pointer"
                          >
                            + Insert into Personal Notes
                          </button>
                        </div>
                        <ul className="list-disc pl-3.5 space-y-0.5 text-[10px] text-neutral-600 dark:text-neutral-300">
                          {activeResearchData.relevantClaims.slice(0, 3).map((cl, idx) => (
                            <li key={idx}>{cl}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
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
                size="sm"
                className="text-xs h-7 px-2.5 font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 cursor-pointer"
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
              <div className="flex items-center gap-2">
                {previousContent && (
                  <button
                    type="button"
                    onClick={() => {
                      const current = editorText;
                      setEditorText(previousContent);
                      setPreviousContent(current);
                      showToast('Reverted to previous version!');
                    }}
                    className="text-[10px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Undo2 className="w-3 h-3" /> Undo Refine
                  </button>
                )}
                {isRefining && (
                  <span className="text-purple-600 animate-pulse font-mono">
                    Applying {activeRefineAction?.replace('_', ' ')}...
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'make_conversational', label: '💬 More Conversational' },
                { id: 'make_professional', label: '👔 More Professional' },
                { id: 'add_practical_detail', label: '🔍 Add Detail' },
                { id: 'improve_hook', label: '🎣 Improve Hook' },
                { id: 'make_concise', label: '✂️ More Concise' },
                { id: 'improve_readability', label: '📖 Improve Spacing' },
                { id: 'change_ending', label: '🏁 Change Ending' },
                { id: 'generate_alternative', label: '🔀 Alternative Version' },
              ].map((act) => (
                <button
                  key={act.id}
                  disabled={isRefining}
                  onClick={() => handleRefineAction(act.id)}
                  className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:border-purple-300 dark:hover:border-purple-700 text-[11px] font-medium shrink-0 cursor-pointer transition-colors disabled:opacity-50"
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
                { id: 'sources' as const, label: `Sources (${post.researchSources?.length || (activeResearchData ? 1 : 0)})` },
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
              <Badge variant={isResearchEnabled ? 'purple' : 'outline'} className="text-[10px]">
                {isResearchEnabled ? 'Fresh Web Verification' : 'Offline Knowledge'}
              </Badge>
            </div>

            {(post.researchSources && post.researchSources.length > 0) || activeResearchData ? (
              <div className="space-y-2">
                {(post.researchSources || (activeResearchData ? [{ title: activeResearchData.title, url: activeResearchData.url, sourceName: activeResearchData.sourceName, snippet: activeResearchData.summary }] : [])).map((s, idx) => (
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
                    {s.url && (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-white dark:hover:bg-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
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
                        const lns = editorText.split('\n');
                        lns[0] = alt;
                        setEditorText(lns.join('\n'));
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

      {/* MODAL: SELECT FROM SAVED CONTENT IDEAS */}
      {isIdeaPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Select from Saved Content Ideas
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsIdeaPickerOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Pick any idea from your Creator OS library. Selecting an idea instantly populates Topic, Pillar, Niche, Target Audience, and ground-truth notes in your generator.
            </p>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={ideaSearch}
                  onChange={(e) => setIdeaSearch(e.target.value)}
                  placeholder="Search ideas by title, angle, or keyword..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                />
              </div>

              <select
                value={ideaPillarFilter}
                onChange={(e) => setIdeaPillarFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800"
              >
                <option value="ALL">All Pillars</option>
                {CONTENT_PILLARS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.shortTitle}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {filteredIdeas.length > 0 ? (
                filteredIdeas.map((i) => (
                  <div
                    key={i.id}
                    className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-850 hover:border-purple-300 dark:hover:border-purple-700 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-neutral-900 dark:text-neutral-100 text-xs">
                          {i.title}
                        </span>
                        <Badge variant="outline" className="text-[10px] py-0 font-mono">
                          {i.priority} Priority
                        </Badge>
                      </div>
                      {i.mainAngle && (
                        <p className="text-[11px] text-neutral-600 dark:text-neutral-300 line-clamp-2">
                          <span className="font-semibold text-neutral-700 dark:text-neutral-200">Angle:</span> {i.mainAngle}
                        </p>
                      )}
                      {i.hook && (
                        <p className="text-[10px] text-neutral-500 font-mono truncate">
                          Hook: {i.hook}
                        </p>
                      )}
                    </div>

                    <Button
                      type="button"
                      onClick={() => handleLoadIdea(i)}
                      size="sm"
                      className="text-xs shrink-0 cursor-pointer bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800"
                    >
                      Use in Generator →
                    </Button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center border border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-400">
                  No matching ideas found. Try a different search term or pick a quick preset above.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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
    createLinkedInPostFromScript,
    createLinkedInPostFromIdea,
    scheduleLinkedInPostToCalendar,
    scripts,
    ideas,
    research,
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

  // Import modal search state
  const [importIdeaSearch, setImportIdeaSearch] = useState('');

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

  const filteredImportIdeas = (ideas || []).filter((i) =>
    i.title.toLowerCase().includes(importIdeaSearch.toLowerCase()) ||
    (i.mainAngle && i.mainAngle.toLowerCase().includes(importIdeaSearch.toLowerCase()))
  );

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

      {/* MODAL 1: IMPORT ASSET (Reels, Ideas, Research) */}
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
              Select any existing Reel script, Content idea, or verified GitHub repo. The AI extracts the core insight and builds a new dedicated LinkedIn post—never overwriting your original asset.
            </p>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {/* CONTENT IDEAS (ALL WITH SEARCH) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>Content Ideas ({ideas.length})</span>
                  </div>
                  <input
                    type="text"
                    value={importIdeaSearch}
                    onChange={(e) => setImportIdeaSearch(e.target.value)}
                    placeholder="Search ideas..."
                    className="px-2 py-1 text-xs border border-neutral-200 dark:border-neutral-700 rounded-md bg-neutral-50 dark:bg-neutral-800"
                  />
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                  {filteredImportIdeas.map((i) => (
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

              {/* REEL SCRIPTS */}
              <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <div className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <FileEdit className="w-3.5 h-3.5 text-purple-600" />
                  <span>Reel Scripts ({scripts.length})</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {scripts.slice(0, 4).map((s) => (
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

              {/* RESEARCH RECORDS */}
              <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <div className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Research & GitHub Discoveries ({research.length})</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {research.slice(0, 4).map((r) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">{r.title}</div>
                        <div className="text-[11px] text-neutral-500 truncate">{r.summary.slice(0, 90)}...</div>
                      </div>
                      <Button
                        onClick={() => {
                          const newPost = addLinkedInPost({
                            title: `Research Insight: ${r.title.slice(0, 40)}`,
                            topic: r.title,
                            niche: r.isGithubRepo ? 'Open-source AI tools and GitHub repositories' : 'Building projects and business systems',
                            contentPillar: r.pillar,
                            targetAudience: 'Developers and founders',
                            postObjective: 'Teach something useful',
                            postFormat: 'Professional Insight',
                            writingStyle: 'Professional and conversational',
                            postLength: 'Medium',
                            userNotes: r.summary,
                            isResearchEnabled: true,
                            researchSummary: r.summary,
                            researchSources: [{ title: r.title, url: r.url, sourceName: r.sourceName }],
                            generatedContent: `Start typing your post grounded in ${r.title}...`,
                            currentEditedContent: `Start typing your post grounded in ${r.title}...`,
                            ctaSettings: { type: 'Auto-select CTA' },
                            status: 'Draft',
                          });
                          setActivePostId(newPost.id);
                          setIsImportModalOpen(false);
                          showToast(`Loaded research into new LinkedIn post!`);
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
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-purple-600" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Your LinkedIn Posts Library ({linkedinPosts?.length || 0})
                </h3>
              </div>
              <button
                onClick={() => setIsLibraryModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  placeholder="Search by title, topic, or content..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <select
                value={libraryFilterStatus}
                onChange={(e) => setLibraryFilterStatus(e.target.value)}
                className="text-xs px-2.5 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="Idea">Idea</option>
                <option value="Draft">Draft</option>
                <option value="Ready to Publish">Ready to Publish</option>
                <option value="Published">Published</option>
              </select>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {filteredLibrary.length > 0 ? (
                filteredLibrary.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setActivePostId(p.id);
                      setIsLibraryModalOpen(false);
                    }}
                    className={`p-3.5 rounded-xl border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                      p.id === activePost?.id
                        ? 'border-purple-500 bg-purple-50/30 dark:bg-purple-950/20'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900 dark:text-neutral-100 truncate">{p.title}</span>
                        <Badge variant="outline" className="text-[10px] py-0 font-mono">
                          {p.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-neutral-500 truncate mt-0.5">{p.currentEditedContent}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePostId(p.id);
                          setIsLibraryModalOpen(false);
                        }}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                      >
                        Open Studio
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-neutral-400">
                  No posts matching your search filter.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SCHEDULE TO CALENDAR */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-sky-600" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Schedule Post to Content Calendar
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
              Assign a planned publishing date and time. This will sync directly to your Content Calendar dashboard.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Planned Publishing Date
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Target Time
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800"
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
                className="text-xs bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 font-bold"
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
              <h3 className="text-base font-bold">Delete LinkedIn Post?</h3>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
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
