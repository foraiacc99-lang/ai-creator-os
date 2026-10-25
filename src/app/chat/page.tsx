'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/storage/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChatMessage, ChatMessageAction, ContentPillar } from '@/types';
import {
  MessageSquare,
  Sparkles,
  Send,
  Lightbulb,
  FileEdit,
  Calendar,
  Copy,
  Check,
  Bot,
  User,
  Trash2,
  BookOpen,
} from 'lucide-react';
import { ModelSelector } from '@/components/ai/model-selector';

const SUGGESTED_PROMPTS = [
  'What should I shoot today based on my backlog and bandwidth?',
  'Find 3 content ideas about website sales and cold calling',
  'Turn my saved Crawl4AI research into a short-form video script',
  'What lessons can I draw from my recent manual growth snapshots?',
  'Help me plan a 5-point local SEO carousel for small businesses',
];

const makeTimestamp = () => new Date().toISOString();
const makeId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

export default function AIChatPage() {
  const router = useRouter();
  const {
    ideas,
    scripts,
    snapshots,
    research,
    reports,
    competitors,
    preferences,
    styleProfile,
    aiConfig,
    getModelForModule,
    addIdea,
    createCarouselFromIdea,
    createStoryFromIdea,
  } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg_welcome',
      role: 'assistant',
      content: `Hello! I am your AI Content Strategist. I have access to your AI Creator OS knowledge base:\n- Content Ideas & Scripts\n- Verified Research Findings\n- Reports & Notes\n- Manual Growth Snapshots\n\nAsk me anything about planning today's shoot, turning research into scripts, reviewing cold calling hooks, or analyzing your growth patterns!`,
      timestamp: '2026-10-14T12:00:00.000Z',
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
      id: makeId('user'),
      role: 'user',
      content: text.trim(),
      timestamp: makeTimestamp(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const selectedModel = getModelForModule('chat');
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages,
          contextData: {
            ideas,
            scripts,
            snapshots,
            research,
            reports,
            competitors,
            preferences,
            styleProfile,
          },
          aiConfig: {
            ...aiConfig,
            model: selectedModel,
            omniRouteModel: selectedModel,
          },
        }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: makeId('assistant'),
        role: 'assistant',
        content: data.content || 'Processed your strategy query.',
        timestamp: makeTimestamp(),
        suggestedActions: data.suggestedActions || [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: unknown) {
      const err = e as Error;
      setMessages((prev) => [
        ...prev,
        {
          id: makeId('assistant_err'),
          role: 'assistant',
          content: `Could not reach AI provider (${err.message}). If using Ollama, verify that 'ollama serve' is active.`,
          timestamp: makeTimestamp(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExecuteAction = (action: ChatMessageAction) => {
    if (action.type === 'create_idea') {
      const data = action.data as {
        title?: string;
        pillar?: ContentPillar;
        topic?: string;
        format?: string;
        hook?: string;
      };
      const chosenFormat = (data.format?.toUpperCase() || 'REELS') as 'REELS' | 'CAROUSEL' | 'STORY';
      const newIdea = addIdea({
        title: data.title || 'New Idea from Chat',
        pillar: data.pillar || 'AI_TOOLS_AND_AUTOMATION',
        topic: data.topic || data.title || 'Content Workflow',
        targetAudience: preferences.targetAudience,
        format: chosenFormat,
        hook: data.hook || 'Opening hook from chat discussion.',
        mainAngle: 'Generated from AI Chat exploration.',
        estimatedProductionTime: 30,
        priority: 'High',
        status: 'Inbox',
        isAiGenerated: true,
      });

      if (chosenFormat === 'CAROUSEL') {
        const newProj = createCarouselFromIdea(newIdea);
        router.push(`/carousel?id=${newProj.id}&tab=carousel`);
      } else if (chosenFormat === 'STORY') {
        const newStory = createStoryFromIdea(newIdea);
        router.push(`/carousel?id=${newStory.id}&tab=stories`);
      } else {
        router.push('/ideas');
      }
    } else if (action.type === 'generate_script') {
      router.push('/scripts');
    } else if (action.type === 'add_calendar') {
      router.push('/calendar');
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: makeId('msg_welcome'),
        role: 'assistant',
        content: 'Conversation history cleared. How can I assist your content strategy today?',
        timestamp: makeTimestamp(),
      },
    ]);
  };

  return (
    <div className="space-y-6 pb-12 flex flex-col h-[calc(100vh-7rem)]">
      {/* Top Banner */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-700 dark:text-purple-300">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                AI Content Strategist Chat
              </h2>
              <Badge variant="purple" className="text-[10px] font-mono">
                Knowledge-Aware
              </Badge>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Answers strictly using your verified saved records, manual growth metrics, and 6 content pillars.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ModelSelector currentModule="chat" />
          <Button onClick={handleClearHistory} variant="outline" size="sm" className="text-xs h-8">
            <Trash2 className="w-3.5 h-3.5 mr-1 text-neutral-400" />
            Clear Chat
          </Button>
        </div>
      </div>

      {/* Suggested Prompts Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs shrink-0">
        <span className="text-[11px] font-semibold text-neutral-400 whitespace-nowrap">Suggested:</span>
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 whitespace-nowrap cursor-pointer transition-colors text-[11px]"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div key={msg.id} className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-neutral-900 text-white dark:bg-neutral-800 dark:text-neutral-100 dark:border dark:border-neutral-700'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`space-y-2 max-w-2xl ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-neutral-900 text-white dark:bg-neutral-800 dark:text-neutral-100 font-medium dark:border dark:border-neutral-700'
                      : 'bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-neutral-800 dark:text-neutral-100'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>

                {/* Suggested Actions if returned by AI */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    {msg.suggestedActions.map((action, i) => (
                      <Button
                        key={i}
                        onClick={() => handleExecuteAction(action)}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 px-2.5 bg-white dark:bg-neutral-900 shadow-2xs font-semibold"
                      >
                        <Sparkles className="w-3 h-3 mr-1 text-purple-600" />
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}

                <div className={`flex items-center gap-2 text-[10px] text-neutral-400 px-1 ${isUser ? 'justify-end' : ''}`}>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {!isUser && (
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                    >
                      {copiedId === msg.id ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3 text-xs text-neutral-500">
            <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-400 animate-pulse">
              Consulting your saved research and content strategy...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs focus-within:ring-1 focus-within:ring-neutral-400"
        >
          <input
            type="text"
            placeholder="Ask anything about your content pillars, ideas, or cold calling scripts..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-xs bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            variant="primary"
            size="sm"
            className="h-9 px-4 shrink-0 rounded-xl"
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
