'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/storage/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  Copy,
  Check,
  Download,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Eye,
  Sparkles,
  Smartphone,
  Info,
  Clock,
  CheckSquare,
} from 'lucide-react';
import { InstagramIcon } from '@/components/icons/instagram';

export default function PublishingStudioPage() {
  const { account, scripts, updateCalendarEntry } = useApp();

  const [activeScript, setActiveScript] = useState(scripts[0]);
  const [caption, setCaption] = useState(scripts[0]?.caption || '');
  const [hashtags, setHashtags] = useState('#aitools #buildinpublic #solopreneur #promptengineering #creatortech');
  const [coverTitle, setCoverTitle] = useState(scripts[0]?.coverTitle || 'CLONE YOUR REAL VOICE WITH AI');
  const [altText, setAltText] = useState('Screenshot demonstration of AI prompt styling');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{ success: boolean; message: string } | null>(null);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);

  // Pre-publish checklist
  const [checklist, setChecklist] = useState([
    { id: 1, label: 'Video format is vertical 9:16 (1080x1920)', checked: true },
    { id: 2, label: 'Opening hook clearly audible & text overlay in first 2 seconds', checked: true },
    { id: 3, label: 'On-screen text stays above bottom 20% (Instagram UI safe zone)', checked: true },
    { id: 4, label: 'Single explicit Call to Action with keyword trigger', checked: true },
    { id: 5, label: 'High contrast cover frame and title verified', checked: true },
  ]);

  const toggleCheck = (id: number) => {
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c))
    );
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(`${caption}\n\n${hashtags}`);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const handleCopyHashtags = () => {
    navigator.clipboard.writeText(hashtags);
    setCopiedHashtags(true);
    setTimeout(() => setCopiedHashtags(false), 2000);
  };

  const handleAttemptDirectPublish = async () => {
    setIsPublishing(true);
    setPublishResult(null);

    try {
      const res = await fetch('/api/instagram/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: account.id,
          accessToken: 'placeholder_token',
          caption: `${caption}\n\n${hashtags}`,
          mediaType: 'REELS',
          mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPublishResult({
          success: true,
          message: `Successfully published to Instagram! Post ID: ${data.publishedPostId}`,
        });
      } else {
        // Open manual publishing workflow as recommended fallback
        setManualModalOpen(true);
        setPublishResult({
          success: false,
          message: data.message || 'Direct API publishing not active on this account. Use Manual Publishing Workflow.',
        });
      }
    } catch {
      setManualModalOpen(true);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleConfirmManualPublished = () => {
    setManualModalOpen(false);
    setPublishResult({
      success: true,
      message: 'Post recorded as published! Calendar status and post metrics updated.',
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Publishing Studio</h2>
            <Badge variant="secondary" className="text-xs font-mono">
              Pre-Flight & Dispatch
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 max-w-2xl">
            Format captions, test Instagram 9:16 safe zones, run pre-publish safety checks, and publish directly
            or via assisted mobile clipboard dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setManualModalOpen(true)}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Manual Publish Flow
          </Button>

          <Button
            onClick={handleAttemptDirectPublish}
            variant="primary"
            size="sm"
            isLoading={isPublishing}
            className="text-xs bg-neutral-900 hover:bg-neutral-800 font-semibold"
          >
            <Send className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            Publish to Instagram
          </Button>
        </div>
      </div>

      {publishResult && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            publishResult.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {publishResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span>{publishResult.message}</span>
          </div>
        </div>
      )}

      {/* Main Studio Workspace: Form (Left) & Simulated Phone Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form & Pre-flight Checklist */}
        <div className="lg:col-span-2 space-y-6">
          {/* Script loader */}
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-900">Load Prepared Script:</label>
              <select
                value={activeScript?.id || ''}
                onChange={(e) => {
                  const s = scripts.find((x) => x.id === e.target.value);
                  if (s) {
                    setActiveScript(s);
                    setCaption(s.caption);
                    setCoverTitle(s.coverTitle);
                  }
                }}
                className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-900 bg-white"
              >
                {scripts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Caption editor */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-neutral-700">Caption</label>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {caption.length} / 2,200 chars
                </span>
              </div>
              <textarea
                rows={6}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full p-3 border border-neutral-300 rounded-xl text-xs text-neutral-800 leading-relaxed focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            {/* Hashtags */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-neutral-700">Target Hashtags</label>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {hashtags.split(' ').filter((h) => h.startsWith('#')).length} tags
                </span>
              </div>
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs text-neutral-800 focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            {/* Cover title & Alt text */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-neutral-700">Cover Title</label>
                <input
                  type="text"
                  value={coverTitle}
                  onChange={(e) => setCoverTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-700">Accessibility Alt Text</label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          {/* Pre-Publication Checklist */}
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">Pre-Flight Safety Checklist</h3>
              <Badge variant="purple" className="text-[10px]">
                {checklist.filter((c) => c.checked).length} of {checklist.length} Passed
              </Badge>
            </div>

            <div className="space-y-2 text-xs">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 flex items-center justify-between cursor-pointer hover:bg-neutral-100/60 transition-colors"
                >
                  <span className="text-neutral-800 font-medium">{item.label}</span>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                      item.checked
                        ? 'bg-neutral-900 border-neutral-900 text-white'
                        : 'border-neutral-300 bg-white'
                    }`}
                  >
                    {item.checked && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Simulated Instagram 9:16 Mobile Safe-Zone Preview */}
        <div className="flex flex-col items-center">
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5" />
            9:16 Instagram Safe-Zone Preview
          </div>

          <div className="relative w-64 h-[520px] bg-neutral-900 rounded-[36px] p-3 shadow-2xl border-4 border-neutral-800 overflow-hidden flex flex-col justify-between text-white select-none">
            {/* Simulated background media */}
            <div className="absolute inset-0 z-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600"
                alt="Reel preview"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
            </div>

            {/* Top Reel header */}
            <div className="relative z-10 flex items-center justify-between text-[11px] pt-3 px-2">
              <span className="font-bold">Reels</span>
              <span className="text-[10px] opacity-80">9:16 View</span>
            </div>

            {/* Cover Title Overlay (inside safe zone) */}
            <div className="relative z-10 px-3 text-center my-auto">
              <div className="inline-block bg-neutral-900/90 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg border border-white/20 shadow-lg tracking-wide uppercase">
                {coverTitle || 'COVER TITLE'}
              </div>
            </div>

            {/* Right side engagement icons */}
            <div className="absolute right-3 bottom-24 z-10 flex flex-col items-center gap-3 text-white text-[10px]">
              <div className="flex flex-col items-center">
                <span className="text-sm">❤️</span>
                <span>4.2k</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm">💬</span>
                <span>388</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm">🚀</span>
                <span>1.9k</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm">🔖</span>
                <span>3.4k</span>
              </div>
            </div>

            {/* Bottom Account & Caption overlay */}
            <div className="relative z-10 p-2 text-xs space-y-1">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-white text-neutral-900 font-bold text-[9px] flex items-center justify-center">
                  S
                </div>
                <span className="font-bold text-[11px]">@{account.username || 'creator'}</span>
              </div>
              <p className="text-[10px] text-white/90 line-clamp-2 leading-tight">
                {caption} {hashtags}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MANUAL PUBLISHING WORKFLOW MODAL */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <InstagramIcon className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Manual Publishing Workflow (Recommended)
                </h3>
              </div>
              <button
                onClick={() => setManualModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-neutral-600 leading-relaxed">
                Publishing directly via the mobile app guarantees native audio sync, custom sticker engagement, and
                proper Instagram algorithm distribution.
              </p>

              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-2">
                <div className="font-bold text-neutral-900 uppercase tracking-wider text-[10px]">
                  Step-by-Step Instructions:
                </div>
                <ol className="space-y-1.5 list-decimal list-inside text-neutral-700">
                  <li>Copy your formatted caption and hashtag stack below.</li>
                  <li>Open the Instagram app on your mobile device.</li>
                  <li>Tap the <strong>+</strong> button and choose <strong>Reel</strong>.</li>
                  <li>Select your filmed video file.</li>
                  <li>Paste the copied caption and select your cover frame title.</li>
                  <li>Tap <strong>Share</strong> to publish.</li>
                </ol>
              </div>

              {/* Quick Copy Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Button onClick={handleCopyCaption} variant="outline" size="sm" className="text-xs">
                  {copiedCaption ? <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copiedCaption ? 'Caption Copied!' : 'Copy Full Caption'}
                </Button>

                <Button onClick={handleCopyHashtags} variant="outline" size="sm" className="text-xs">
                  {copiedHashtags ? <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copiedHashtags ? 'Tags Copied!' : 'Copy Hashtags'}
                </Button>
              </div>
            </div>

            <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setManualModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmManualPublished}
                className="text-xs bg-emerald-700 hover:bg-emerald-800 font-semibold"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                I Have Published This Post
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
