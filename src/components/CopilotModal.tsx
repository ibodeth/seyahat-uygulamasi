import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, Loader2, Compass } from 'lucide-react';
import { Itinerary } from '../types/travel';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

interface CopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrip?: Itinerary | null;
}

const STARTER_PROMPTS = [
  'What is the tipping and dining etiquette here?',
  'Recommend 3 quiet specialty coffee roasters with Wi-Fi',
  'How do I time temple and scenic walks to beat crowds?',
  'What are the essential packing layers for this climate?',
];

export const CopilotModal: React.FC<CopilotModalProps> = ({
  isOpen,
  onClose,
  currentTrip,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Greetings from VoyageAI Intelligence. I am your concierge for ${
        currentTrip ? currentTrip.destination : 'global journeys'
      }. Ask me about hidden local venues, transit logistics, cultural nuances, or daily pacing.`,
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            content: m.text,
          })),
          currentTrip,
        }),
      });
      const data = await res.json();
      const aiReplyText =
        data.reply ||
        'VoyageAI intelligence suggests booking local transit in advance and scheduling temple visits before 8:30 AM.';

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReplyText,
        timestamp: 'Now',
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const fallbackMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: 'For optimal discovery, pace active walks during morning golden hours and reserve leisurely cafe pauses for midday.',
        timestamp: 'Now',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] max-h-[85vh] h-[580px] glass-panel rounded-3xl shadow-2xl border border-white/80 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
      {/* Copilot Header */}
      <div className="p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-orange-500 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-sm leading-tight">
              VoyageAI Copilot
            </div>
            <div className="text-[11px] text-white/80">
              {currentTrip ? currentTrip.destination : 'Travel Intelligence'}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF8F5]/80">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-orange-600 shadow-xs'
              }`}
            >
              {msg.sender === 'user' ? (
                <User className="w-3.5 h-3.5" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-xs'
                  : 'bg-white border border-slate-200/80 text-slate-800 shadow-xs rounded-bl-xs'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 italic bg-white/70 py-2 px-3 rounded-2xl w-fit">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            <span>Consulting VoyageAI intelligence...</span>
          </div>
        )}
      </div>

      {/* Suggested Starter Chips */}
      <div className="px-3 py-2 bg-white/60 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {STARTER_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => handleSend(prompt)}
            className="text-[11px] font-medium text-slate-600 hover:text-blue-600 bg-white hover:bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Console */}
      <div className="p-3 bg-white border-t border-slate-200/60 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about etiquette, secret spots, pacing..."
            className="flex-1 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center shrink-0 cursor-pointer transition-colors shadow-sm"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
