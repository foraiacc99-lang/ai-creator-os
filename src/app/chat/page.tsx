'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/storage/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChatMessage } from '@/types';
import {
  MessageSquare,
  Sparkles,
  Send,
  Lightbulb,
  FileEdit,
  Calendar,
  FlaskConical,
  Copy,
  Check,
  Cpu,
  Bot,
  User,
  Trash2,
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  'What should I post tomorrow based on my save metrics?',
  'Which of my recent posts performed best and why?',
  'Give me 4 contrarian content ideas for my niche',
  'Plan my next 7 days of posting',
  'Which experiment should I run next?',
];

export default function AIChatPage() {
  const router = useRouter();
  const { account, posts, preferences, styleProfile, experiments, addIdea, addCalendarEntry, aiConfig } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content: `Hello! I am your AI Instagram Content Strategist. I have authorized access to your **@${
        account.username || 'creator'
      }** telemetry (${account.followersCount.toLocaleString()} followers, 5.2% baseline ER).\n\nYou can ask me to analyze past post retention, write scripts in your voice, suggest high-saving ideas, or plan your schedule. How can I help you today?`,
      timestamp: '2026-10-14T12:00:00Z',
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages,
          contextData: {
            account,
            preferences,
            posts: posts.slice(0, 5),
            styleProfile,
            experiments,
          },
          aiConfig,
        }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: data.content || 'I processed your request with your creator telemetry.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant_err_${Date.now()}`,
          role: 'assistant',
          content: 'Could not complete the query. Please verify your AI provider endpoint in Settings.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConvertIdea = (content: string) => {
    addIdea({
      title: 'Strategy Note Idea',
      description: content.slice(0, 200),
      topic: preferences.niche,
      format: 'REELS',
      targetAudience: preferences.targetAudience,
      hook: content.split('\n')[0] || 'Insightful opening hook',
      objective: 'Authority',
      estimatedFilmingMinutes: 30,
      difficulty: 'Medium',
      source: 'AI Recommendation',
      status: 'idea',
    });
    router.push('/ideas');
  };

  const handleConvertCalendar = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    addCalendarEntry({
      title: 'AI Scheduled Strategy Post',
      plannedDate: d.toISOString().split('T')[0],
      format: 'REELS',
      status: 'planned',
      objective: 'Authority',
      notes: 'Scheduled directly from AI Chat conversation.',
    });
    router.push('/calendar');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-4xl mx-auto space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-xs flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-900">AI Strategist Assistant</h2>
            <div className="text-[11px] text-neutral-400">
              Active Context: @{account.username} • {aiConfig.provider} ({aiConfig.textModel})
            </div>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'welcome',
                role: 'assistant',
                content: 'Chat context cleared. How can I assist your strategy next?',
                timestamp: new Date().toISOString(),
              },
            ])
          }
          className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg"
          title="Clear chat history"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 text-xs leading-relaxed ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 shadow-2xs space-y-2 ${
                msg.role === 'user'
                  ? 'bg-neutral-900 text-white font-medium rounded-tr-xs'
                  : 'bg-white border border-neutral-200/90 text-neutral-800 rounded-tl-xs'
              }`}
            >
              <div className="whitespace-pre-line">{msg.content}</div>

              {/* Action Conversion Toolbar on Assistant Messages */}
              {msg.role === 'assistant' && msg.id !== 'msg_welcome' && (
                <div className="pt-2 mt-2 border-t border-neutral-100 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <button
                    onClick={() => handleCopy(msg.id, msg.content)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={() => handleConvertIdea(msg.content)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 font-medium"
                  >
                    <Lightbulb className="w-3 h-3 text-amber-500" />
                    Save as Idea
                  </button>

                  <button
                    onClick={handleConvertCalendar}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 font-medium"
                  >
                    <Calendar className="w-3 h-3 text-blue-500" />
                    Add to Calendar
                  </button>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-neutral-200 text-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3 text-xs">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 bg-white border border-neutral-200 rounded-2xl rounded-tl-xs text-neutral-400 italic">
              Analyzing creator telemetry & synthesizing strategy...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 text-[11px]">
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            className="px-2.5 py-1 rounded-full bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100 shrink-0 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-2 shadow-xs shrink-0 flex items-center gap-2">
        <textarea
          rows={1}
          placeholder="Ask a question about your content strategy, metrics, or scripts..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          className="flex-1 px-3 py-1.5 text-xs text-neutral-900 focus:outline-none resize-none max-h-24"
        />

        <Button
          onClick={() => handleSendMessage()}
          variant="primary"
          size="sm"
          disabled={!input.trim() || isLoading}
          className="text-xs h-8 px-3 bg-neutral-900 hover:bg-neutral-800"
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
