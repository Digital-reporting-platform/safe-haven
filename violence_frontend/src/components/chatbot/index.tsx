import { MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { FormEvent, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

type ChatMessage = {
  id: number;
} & (
  | {
      role: 'user';
      text: string;
    }
  | {
      role: 'assistant';
      responseKey: string;
    }
);

type UserChatMessage = {
  id: number;
  role: 'user';
  text: string;
};

type AssistantChatMessage = {
  id: number;
  role: 'assistant';
  responseKey: string;
};

const responseTopics = [
  {
    key: 'emergency',
    terms: ['emergency', 'danger', 'urgent', 'unsafe', 'attack', 'hurt', 'kill', 'suicide', 'injured', 'አደጋ', 'አስቸኳይ', 'ጥቃት'],
  },
  {
    key: 'reporting',
    terms: ['report', 'incident', 'case', 'submit', 'form', 'violence', 'abuse', 'assault', 'harassment', 'ሪፖርት', 'ጉዳይ', 'ጥቃት'],
  },
  {
    key: 'privacy',
    terms: ['privacy', 'anonymous', 'confidential', 'identity', 'name', 'safe', 'secret', 'ግላዊነት', 'ምስጢር', 'ማንነት'],
  },
  {
    key: 'ml_logic',
    terms: ['ml', 'machine', 'risk', 'score', 'review', 'assigned', 'priority', 'algorithm', 'አደጋ', 'ግምገማ'],
  },
  {
    key: 'legal',
    terms: ['legal', 'law', 'court', 'evidence', 'rights', 'police', 'lawyer', 'ሕግ', 'ፍርድ', 'መብት'],
  },
  {
    key: 'support',
    terms: ['support', 'counselor', 'medical', 'doctor', 'therapy', 'resource', 'help', 'ድጋፍ', 'ምክር', 'ሕክምና'],
  },
  {
    key: 'missing',
    terms: ['missing', 'lost person', 'trafficking', 'person', 'child', 'ጠፋ', 'የጠፉ', 'ሰው'],
  },
  {
    key: 'system',
    terms: ['system', 'dashboard', 'login', 'signup', 'account', 'status', 'navigation', 'safehaven', 'መለያ', 'ዳሽቦርድ'],
  },
];

const SafeHavenChatbot = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const getResponseKey = (question: string) => {
    const normalizedQuestion = question.toLowerCase();
    const topic = responseTopics.find(({ terms }) =>
      terms.some((term) => normalizedQuestion.includes(term.toLowerCase())),
    );

    return topic?.key || 'fallback';
  };

  const addAssistantResponse = async (key: string, userText?: string) => {
    if (userText) {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          role: 'user',
          text: userText,
        } satisfies UserChatMessage,
      ]);
    }

    // Simulate AI typing
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsTyping(false);

    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        role: 'assistant',
        responseKey: key,
      } satisfies AssistantChatMessage,
    ]);
  };

  const handleQuestion = (key: string) => {
    const questionText = t(`chatbot.questions.${key}`);
    addAssistantResponse(key, questionText);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = draft.trim();

    if (!question) return;

    addAssistantResponse(getResponseKey(question), question);
    setDraft('');
  };

  return (
    <>
      {/* Floating Action Button with gradient */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-xl shadow-[#C15B3E]/30 transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-[#C15B3E]/40 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #C15B3E 0%, #DDA15E 100%)',
        }}
        aria-expanded={open ? 'true' : 'false'}
        aria-label={t('chatbot.open_label')}
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 z-30 w-[min(20rem,calc(100vw-3rem))] overflow-hidden rounded-2xl border border-[#E8E7E0] shadow-2xl shadow-[#6B705C]/20 max-h-[60vh] flex flex-col"
          style={{
            background: 'linear-gradient(180deg, #FDFDF5 0%, #F5F4F0 100%)',
          }}
        >
          {/* Header with gradient background */}
          <div className="relative flex items-start justify-between gap-3 p-4 text-white overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #6B705C 0%, #4F5342 100%)',
            }}
          >
            {/* Decorative glow */}
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#DDA15E]/20 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-[#C15B3E]/20 blur-2xl" />

            <div className="relative flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-lg shadow-[#C15B3E]/30"
                style={{
                  background: 'linear-gradient(135deg, #C15B3E 0%, #DDA15E 100%)',
                }}
              >
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{t('chatbot.title')}</h3>
                <p className="mt-0.5 text-xs leading-relaxed text-white/70">
                  {t('chatbot.welcome')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="relative rounded-full p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label={t('chatbot.close_label')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 min-h-0 max-h-[35vh] space-y-3 overflow-y-auto p-3 bg-[#FDFDF5]/50">
            {/* AI Greeting */}
            <div className="flex gap-2 shrink-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #C15B3E 0%, #DDA15E 100%)',
                }}
              >
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="flex-1 rounded-2xl rounded-tl-sm border border-[#E8E7E0] bg-white p-3 text-xs leading-relaxed text-[#3D4035] shadow-sm">
                {t('chatbot.greeting')}
              </div>
            </div>

            {/* Message Thread */}
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                style={{
                  animation: `slideIn 0.3s ease-out ${index * 0.05}s both`,
                }}
              >
                {message.role === 'assistant' ? (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg shadow-md"
                    style={{
                      background: 'linear-gradient(135deg, #C15B3E 0%, #DDA15E 100%)',
                    }}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                ) : (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#6B705C] shadow-md">
                    <span className="text-xs font-medium text-white">You</span>
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm ${
                    message.role === 'user'
                      ? 'rounded-tr-sm border border-[#6B705C]/20 bg-[#6B705C] text-white'
                      : 'rounded-tl-sm border border-[#C15B3E]/20 bg-gradient-to-br from-[#FEF5F2] to-[#FCEAE4] text-[#3D4035]'
                  }`}
                >
                  {message.role === 'user'
                    ? message.text
                    : t(`chatbot.answers.${message.responseKey}`)}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, #C15B3E 0%, #DDA15E 100%)',
                  }}
                >
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-[#E8E7E0] bg-white px-4 py-3 shadow-sm">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#C15B3E]" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#C15B3E]" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#C15B3E]" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 border-t border-[#E8E7E0] bg-white/80 p-3 backdrop-blur-sm"
            style={{
              background: 'linear-gradient(180deg, #FDFDF5 0%, #F5F4F0 100%)',
            }}
          >
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-[#DAD8CE] bg-white px-3 py-2.5 text-sm text-[#3D4035] outline-none transition-all placeholder:text-[#6B705C]/50 focus:border-[#C15B3E] focus:ring-2 focus:ring-[#C15B3E]/10"
                placeholder={t('chatbot.input_placeholder')}
                aria-label={t('chatbot.input_label')}
              />
              <button
                type="submit"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-lg shadow-[#C15B3E]/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#C15B3E]/35 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #C15B3E 0%, #DDA15E 100%)',
                }}
                aria-label={t('chatbot.send_label')}
                disabled={!draft.trim()}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            {/* Quick Questions - Pill Style */}
            <div className="mt-3 flex flex-wrap gap-2">
              {['how_it_works', 'privacy', 'ml_logic', 'legal'].map((key) => (
                <button
                  key={key}
                  onClick={() => handleQuestion(key)}
                  className="rounded-full border border-[#DAD8CE] bg-white px-2.5 py-1 text-[10px] font-medium text-[#4A4D42] transition-all hover:border-[#C15B3E]/40 hover:bg-[#C15B3E]/5 hover:text-[#C15B3E] active:scale-95 line-clamp-1"
                >
                  {t(`chatbot.questions.${key}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Animation styles */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default SafeHavenChatbot;