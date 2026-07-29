/**
 * NestAIChat.tsx
 *
 * Floating NestAI Housing Assistant chatbot widget.
 * Persists conversation in component state (15-min TTL on server).
 */

import { useState, useRef, useEffect, FormEvent } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, ExternalLink } from 'lucide-react';
import { aiService, ChatMessage as ChatTurn } from '../../services/aiService';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Message {
  role:             'user' | 'assistant';
  content:          string;
  propertyRefs?:    string[];
  suggestedActions?: string[];
  isError?:         boolean;
}

const WELCOME: Message = {
  role:    'assistant',
  content: 'Hi! I\'m NestAI 👋 I can help you find accommodation, compare properties, understand compatibility scores and answer rental safety questions. What would you like to know?',
  suggestedActions: [
    'Search for properties',
    'Compare my shortlist',
    'What questions should I ask during a visit?',
  ],
};

interface Props {
  selectedPropertyIds?: string[];
}

export default function NestAIChat({ selectedPropertyIds = [] }: Props) {
  const [isOpen,       setIsOpen]       = useState(false);
  const [messages,     setMessages]     = useState<Message[]>([WELCOME]);
  const [input,        setInput]        = useState('');
  const [isLoading,    setIsLoading]    = useState(false);
  const [convId,       setConvId]       = useState<string | undefined>(undefined);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages.length]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const resp = await aiService.chat(text, convId, selectedPropertyIds);
      setConvId(resp.conversationId);
      setMessages((prev) => [
        ...prev,
        {
          role:             'assistant',
          content:          resp.reply,
          propertyRefs:     resp.propertyRefs,
          suggestedActions: resp.suggestedActions,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role:    'assistant',
          content: 'I\'m having trouble connecting right now. Please try again in a moment.',
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestion = (text: string) => sendMessage(text);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-105"
        aria-label="Open NestAI Chat"
        style={{ display: isOpen ? 'none' : 'flex' }}
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-400 rounded-full flex items-center justify-center">
          <Sparkles className="w-2.5 h-2.5 text-white" />
        </span>
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 flex flex-col bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
             style={{ maxHeight: 'calc(100vh - 6rem)' }}>
          {/* Header */}
          <div className="bg-primary-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <div>
                <p className="font-bold text-sm">NestAI</p>
                <p className="text-xs opacity-75">Powered by IBM Granite</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-primary-700">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 200 }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-br-none'
                    : msg.isError
                      ? 'bg-red-50 text-red-700 border border-red-100 rounded-bl-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.content}

                  {/* Property references */}
                  {msg.propertyRefs && msg.propertyRefs.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.propertyRefs.map((id) => (
                        <Link
                          key={id}
                          to={`/property/${id}`}
                          className="flex items-center gap-1 text-xs text-primary-600 hover:underline bg-white rounded-lg px-2 py-1"
                        >
                          <ExternalLink className="w-3 h-3" /> View property
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Suggested actions */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {msg.suggestedActions.map((action) => (
                        <button
                          key={action}
                          onClick={() => handleSuggestion(action)}
                          className="text-xs bg-white border border-gray-200 text-gray-600 rounded-full px-2.5 py-1 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition-colors"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />
                  <span className="text-xs text-gray-500">NestAI is thinking…</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-gray-100 p-3 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask NestAI…"
              maxLength={500}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-300 focus:ring-1 focus:ring-primary-100"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl p-2 disabled:opacity-50 transition-colors"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 pb-2">
            AI guidance only — always verify before paying
          </p>
        </div>
      )}
    </>
  );
}
