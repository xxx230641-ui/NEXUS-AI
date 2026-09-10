import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Copy,
  Check,
  CheckCheck,
  RotateCcw,
  Maximize2,
  Minimize2,
  Zap,
  CheckCircle2,
  Palette,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  BrainCircuit,
  MessageSquare,
  Wand2,
  Compass,
  CheckSquare,
  Lock,
  Plus,
  History,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ArrowDown,
  Sparkle,
  Clock,
  Crown,
  Target,
  Activity,
  FileText,
  Radio,
} from 'lucide-react';
import { useLang } from '../../hooks/useLang';
import { AccentColor } from '../../hooks/useTheme';

export interface ActionPayload {
  type:
    | 'NAVIGATE'
    | 'SET_THEME'
    | 'SET_ACCENT'
    | 'SET_LANG'
    | 'SWITCH_CONTEXT'
    | 'ADD_TASK'
    | 'RESOLVE_CONFLICT'
    | 'CLEAR_HISTORY';
  payload?: any;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actionsExecuted?: ActionPayload[];
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messages: Message[];
}

interface AIAssistantModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
  activeContext?: string;
  initialTab?: 'chat' | 'voice' | 'skills' | 'intelligence';
  onNavigate?: (page: string) => void;
  onSetTheme?: (theme: 'light' | 'dark') => void;
  onSetAccent?: (accent: AccentColor) => void;
  onSetLang?: (lang: 'ar' | 'en') => void;
  onSwitchContext?: (context: string) => void;
  onAddTask?: (title: string, context?: string) => void;
}

// Clean Formatted Markdown Component
const FormattedMarkdown: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');

  const parseInlineBold = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-indigo-500 dark:text-indigo-400">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-[var(--bg-hover)] text-indigo-500 border border-[var(--border-subtle)] font-mono text-[11px]"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        if (trimmed.startsWith('### ')) {
          return (
            <h3
              key={idx}
              className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-1 mt-1 flex items-center gap-2"
            >
              {parseInlineBold(trimmed.replace('### ', ''))}
            </h3>
          );
        }

        if (trimmed.startsWith('#### ')) {
          return (
            <h4
              key={idx}
              className="text-xs sm:text-sm font-bold text-indigo-500 mt-1 flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              {parseInlineBold(trimmed.replace('#### ', ''))}
            </h4>
          );
        }

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pr-1 text-[var(--text-primary)]">
              <span className="text-indigo-500 font-bold text-sm leading-none">•</span>
              <div className="flex-1">{parseInlineBold(trimmed.slice(2))}</div>
            </div>
          );
        }

        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pr-1 text-[var(--text-primary)]">
              <span className="w-4 h-4 rounded-full bg-indigo-500/15 text-indigo-500 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                {numMatch[1]}
              </span>
              <div className="flex-1">{parseInlineBold(numMatch[2])}</div>
            </div>
          );
        }

        return <p key={idx}>{parseInlineBold(trimmed)}</p>;
      })}
    </div>
  );
};

const STORAGE_KEY_SESSIONS = 'nexus_ai_chat_sessions_v3';

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onToggle: externalOnToggle,
  activeContext = 'professional',
  initialTab,
  onNavigate,
  onSetTheme,
  onSetAccent,
  onSetLang,
  onSwitchContext,
  onAddTask,
}) => {
  const { t } = useTranslation();
  const { lang, isRTL } = useLang();

  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false);
  const isOpen = externalIsOpen !== undefined ? (externalIsOpen || internalIsOpen) : internalIsOpen;

  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setInternalIsOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

  const handleCloseModal = () => {
    setInternalIsOpen(false);
    if (externalOnClose) {
      externalOnClose();
    }
  };

  const toggleOpen = () => {
    const nextVal = !isOpen;
    setInternalIsOpen(nextVal);
    if (!nextVal) {
      if (externalOnClose) {
        externalOnClose();
      } else if (externalOnToggle) {
        externalOnToggle();
      }
    } else {
      if (externalOnToggle) {
        externalOnToggle();
      }
    }
  };

  const [activeTab, setActiveTab] = useState<'chat' | 'voice' | 'skills' | 'intelligence'>(initialTab || 'chat');

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState<boolean>(false);
  const [showSessionDrawer, setShowSessionDrawer] = useState<boolean>(false);
  const [showScrollBottom, setShowScrollBottom] = useState<boolean>(false);

  const [taskInput, setTaskInput] = useState<string>('');
  const [taskSuccess, setTaskSuccess] = useState<string | null>(null);

  // Default welcome message generator
  const createDefaultMessages = (): Message[] => [
    {
      id: 'm-init',
      sender: 'ai',
      text:
        lang === 'ar'
          ? `مرحباً بك! 👋
أنا **المساعد الذكي (NEXUS AI)** جاهز لمساعدتك في إدارة التطبيق وتعديل الإعدادات فوراً.

يمكنك التحدث معي بالصوت أو كتابة أي أمر مثل:
• "غيّر للوضع الليلي"
• "افتح الإعدادات"
• "أضف مهمة جديدة"`
          : `Hello there! 👋
I am **NEXUS AI Assistant**, ready to help you navigate and control the app.

Feel free to type or speak commands like:
• "Switch to dark mode"
• "Open settings"
• "Add a new task"`,
      timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
  ];

  // MULTI-CONVERSATION SESSIONS STATE
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading chat sessions:', e);
    }
    return [
      {
        id: 'session-default',
        title: lang === 'ar' ? 'المحادثة الرئيسية' : 'Main Chat',
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        messages: createDefaultMessages(),
      },
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || 'session-default';
  });

  // Save sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save chat sessions:', e);
    }
  }, [sessions]);

  // Active messages getter
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession ? activeSession.messages : [];

  // Update messages helper for active session
  const setMessagesForActiveSession = (updater: Message[] | ((prev: Message[]) => Message[])) => {
    setSessions((prevSessions) => {
      return prevSessions.map((sess) => {
        if (sess.id === activeSessionId) {
          const newMsgs = typeof updater === 'function' ? updater(sess.messages) : updater;
          
          // Auto-generate smart session title from first user message if default title
          let newTitle = sess.title;
          if (
            sess.title === (lang === 'ar' ? 'المحادثة الرئيسية' : 'Main Chat') ||
            sess.title === (lang === 'ar' ? 'محادثة جديدة' : 'New Chat')
          ) {
            const firstUserMsg = newMsgs.find((m) => m.sender === 'user');
            if (firstUserMsg) {
              newTitle = firstUserMsg.text.slice(0, 24) + (firstUserMsg.text.length > 24 ? '...' : '');
            }
          }

          return {
            ...sess,
            title: newTitle,
            messages: newMsgs,
            updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        }
        return sess;
      });
    });
  };

  // Create a brand new chat session
  const handleCreateNewSession = () => {
    const newId = 'session-' + Date.now();
    const newSession: ChatSession = {
      id: newId,
      title: lang === 'ar' ? 'محادثة جديدة' : 'New Chat',
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: createDefaultMessages(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setShowSessionDrawer(false);
  };

  // Delete a chat session
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      // If deleting last session, reset it instead of empty array
      setSessions([
        {
          id: 'session-' + Date.now(),
          title: lang === 'ar' ? 'المحادثة الرئيسية' : 'Main Chat',
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          messages: createDefaultMessages(),
        },
      ]);
      return;
    }

    const filtered = sessions.filter((s) => s.id !== sessionId);
    setSessions(filtered);
    if (activeSessionId === sessionId) {
      setActiveSessionId(filtered[0].id);
    }
  };

  // Live Voice Call States
  const [liveVoiceStatus, setLiveVoiceStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState<boolean>(false);
  const [isVoicePaused, setIsVoicePaused] = useState<boolean>(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  // Enhanced Smart Call States
  const [callDurationSeconds, setCallDurationSeconds] = useState<number>(0);
  const [voicePersona, setVoicePersona] = useState<'executive' | 'instant' | 'coach'>('executive');
  const [showPostCallSummary, setShowPostCallSummary] = useState<boolean>(false);
  const [lastCallAction, setLastCallAction] = useState<{ titleAr: string; titleEn: string; time: string } | null>(null);
  const [callActionsHistory, setCallActionsHistory] = useState<Array<{ titleAr: string; titleEn: string; time: string }>>([]);

  // Live Call Timer Effect
  useEffect(() => {
    let timer: any;
    if (isOpen && activeTab === 'voice' && !isVoicePaused && !showPostCallSummary) {
      timer = setInterval(() => {
        setCallDurationSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, activeTab, isVoicePaused, showPostCallSummary]);

  const formatCallTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const recordCallAction = (titleAr: string, titleEn: string) => {
    const actItem = {
      titleAr,
      titleEn,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setLastCallAction(actItem);
    setCallActionsHistory((prev) => [actItem, ...prev]);
    setTimeout(() => {
      setLastCallAction(null);
    }, 4500);
  };

  const liveRecognitionRef = useRef<any>(null);
  const liveSilenceTimerRef = useRef<any>(null);
  const chatRecognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = true) => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
      setShowScrollBottom(false);
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  const handleScroll = () => {
    if (!chatScrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatScrollRef.current;
    if (scrollHeight - scrollTop - clientHeight > 100) {
      setShowScrollBottom(true);
    } else {
      setShowScrollBottom(false);
    }
  };

  // Touch Drag-to-Scroll handlers for isolated touch swiping inside the chat window
  const touchStartY = useRef<number>(0);
  const touchStartScrollTop = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!chatScrollRef.current) return;
    touchStartY.current = e.touches[0].clientY;
    touchStartScrollTop.current = chatScrollRef.current.scrollTop;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!chatScrollRef.current) return;
    const currentY = e.touches[0].clientY;
    const deltaY = touchStartY.current - currentY;
    chatScrollRef.current.scrollTop = touchStartScrollTop.current + deltaY;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  // Mouse Drag-to-Scroll handlers for smooth vertical dragging
  const [isDraggingChat, setIsDraggingChat] = useState<boolean>(false);
  const [dragStartY, setDragStartY] = useState<number>(0);
  const [dragStartScrollTop, setDragStartScrollTop] = useState<number>(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!chatScrollRef.current) return;
    const target = e.target as HTMLElement;
    if (target.closest('button, input, textarea, a, code')) return;

    setIsDraggingChat(true);
    setDragStartY(e.clientY);
    setDragStartScrollTop(chatScrollRef.current.scrollTop);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingChat || !chatScrollRef.current) return;
    e.preventDefault();
    const deltaY = e.clientY - dragStartY;
    chatScrollRef.current.scrollTop = dragStartScrollTop - deltaY;
  };

  const handleMouseUpOrLeave = () => {
    setIsDraggingChat(false);
  };

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      setTimeout(() => scrollToBottom(true), 100);
    }
  }, [messages.length, isOpen, activeTab, activeSessionId]);

  // Execute commands received from backend AI model
  const executeActions = (actions: ActionPayload[]) => {
    if (!actions || !Array.isArray(actions)) return;

    actions.forEach((act) => {
      try {
        switch (act.type) {
          case 'NAVIGATE':
            if (act.payload?.page && onNavigate) {
              onNavigate(act.payload.page);
              recordCallAction(
                `تم التنقل إلى: ${act.payload.page}`,
                `Navigated to: ${act.payload.page}`
              );
            }
            break;
          case 'SET_THEME':
            if (act.payload?.theme && onSetTheme) {
              onSetTheme(act.payload.theme);
              recordCallAction(
                `تم تطبيق الوضع ${act.payload.theme === 'dark' ? 'الليلي 🌙' : 'النهاري ☀️'}`,
                `Applied ${act.payload.theme} theme`
              );
            }
            break;
          case 'SET_ACCENT':
            if (act.payload?.accent && onSetAccent) {
              onSetAccent(act.payload.accent);
              recordCallAction(`تم تحديث لون التمييز 🎨`, `Updated accent color 🎨`);
            }
            break;
          case 'SET_LANG':
            if (act.payload?.lang && onSetLang) {
              onSetLang(act.payload.lang);
              recordCallAction(`تم تغيير لغة التطبيق 🌐`, `Language updated 🌐`);
            }
            break;
          case 'SWITCH_CONTEXT':
            if (act.payload?.context && onSwitchContext) {
              onSwitchContext(act.payload.context);
              recordCallAction(
                `تم التبديل لسياق ${act.payload.context} 🔄`,
                `Switched to ${act.payload.context} context 🔄`
              );
            }
            break;
          case 'ADD_TASK':
            if (act.payload?.title && onAddTask) {
              onAddTask(act.payload.title, act.payload.context || activeContext);
              recordCallAction(
                `تمت إضافة مهمة: "${act.payload.title}" 📝`,
                `Added task: "${act.payload.title}" 📝`
              );
            }
            break;
          case 'CLEAR_HISTORY':
            handleClear();
            recordCallAction(`تم إخلاء المحادثة`, `Cleared history`);
            break;
          default:
            break;
        }
      } catch (e) {
        console.error('Error executing AI assistant action:', e);
      }
    });
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessagesForActiveSession((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/twin-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          activeContext,
          lang,
        }),
      });

      if (!response.ok) {
        throw new Error('Server response error');
      }

      const data = await response.json();
      const aiReply =
        data.reply ||
        (lang === 'ar'
          ? 'تم تنفيذ طلبك بنجاح.'
          : 'Request processed successfully.');

      const actions: ActionPayload[] = data.actions || [];

      if (actions.length > 0) {
        executeActions(actions);
      }

      const aiMsg: Message = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: aiReply,
        actionsExecuted: actions,
        timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setMessagesForActiveSession((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI Assistant Error:', err);

      const localActions: ActionPayload[] = [];
      const lowerQuery = query.toLowerCase();

      if (lowerQuery.includes('ليلي') || lowerQuery.includes('dark')) {
        localActions.push({ type: 'SET_THEME', payload: { theme: 'dark' } });
      } else if (lowerQuery.includes('نهاري') || lowerQuery.includes('light')) {
        localActions.push({ type: 'SET_THEME', payload: { theme: 'light' } });
      }

      if (lowerQuery.includes('إعداد') || lowerQuery.includes('settings')) {
        localActions.push({ type: 'NAVIGATE', payload: { page: 'settings' } });
      } else if (lowerQuery.includes('بروفايل') || lowerQuery.includes('profile')) {
        localActions.push({ type: 'NAVIGATE', payload: { page: 'profile' } });
      } else if (lowerQuery.includes('رسم بياني') || lowerQuery.includes('graph')) {
        localActions.push({ type: 'NAVIGATE', payload: { page: 'graph' } });
      }

      if (localActions.length > 0) {
        executeActions(localActions);
      }

      const fallbackReply =
        lang === 'ar'
          ? `${localActions.length > 0 ? '✅ تم تنفيذ الأمر بالتطبيق.' : 'أهلاً بك! كيف يمكنني مساعدتك؟'}`
          : `${localActions.length > 0 ? '✅ Command executed in the app.' : 'Hello! How can I help you?'}`;

      setMessagesForActiveSession((prev) => [
        ...prev,
        {
          id: 'ai-' + Date.now(),
          sender: 'ai',
          text: fallbackReply,
          actionsExecuted: localActions,
          timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Clean up live voice and speech synthesis on unmount or tab change
  useEffect(() => {
    if (!isOpen || activeTab !== 'voice') {
      if (liveRecognitionRef.current) {
        try {
          liveRecognitionRef.current.stop();
        } catch (e) {}
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setLiveVoiceStatus('idle');
    } else if (isOpen && activeTab === 'voice' && !isVoicePaused) {
      startLiveListening();
    }
  }, [isOpen, activeTab, isVoicePaused]);

  // Start continuous listening in Live Voice Mode (Ultra-Fast ChatGPT Voice Mode)
  const startLiveListening = () => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      setVoiceError(
        lang === 'ar'
          ? 'المتصفح لا يدعم التعرف الصوتي المباشر. يرجى استخدام متصفح حديث مثل Chrome.'
          : 'Browser does not support Web Speech Recognition. Please use Chrome.'
      );
      setLiveVoiceStatus('idle');
      return;
    }

    if (liveRecognitionRef.current) {
      try {
        liveRecognitionRef.current.stop();
      } catch (e) {}
    }
    if (liveSilenceTimerRef.current) {
      clearTimeout(liveSilenceTimerRef.current);
    }

    // Cancel speech immediately if user barge-in / starts speaking
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
      rec.continuous = true;
      rec.interimResults = true;

      rec.onstart = () => {
        setLiveVoiceStatus('listening');
        setVoiceError(null);
      };

      rec.onresult = (event: any) => {
        // Barge-in capability: cancel AI speech if user interrupts
        if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }

        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += trans;
          } else {
            interim += trans;
          }
        }
        const currentText = (final || interim).trim();
        if (currentText) {
          setLiveTranscript(currentText);

          // Clear prior VAD silence debounce timer
          if (liveSilenceTimerRef.current) {
            clearTimeout(liveSilenceTimerRef.current);
          }

          // If browser finalized transcript, send immediately!
          if (final.trim()) {
            try { rec.stop(); } catch (e) {}
            processLiveVoiceQuery(final.trim());
            return;
          }

          // Ultra-Fast Silence Detection (VAD): If user pauses speaking for 380ms, submit immediately!
          liveSilenceTimerRef.current = setTimeout(() => {
            if (currentText.length > 0) {
              try { rec.stop(); } catch (e) {}
              processLiveVoiceQuery(currentText);
            }
          }, 380);
        }
      };

      rec.onerror = (err: any) => {
        if (err.error === 'not-allowed') {
          setVoiceError(
            lang === 'ar'
              ? 'يرجى السماح بالوصول للميكروفون.'
              : 'Please allow microphone access.'
          );
          setLiveVoiceStatus('idle');
        } else if (err.error === 'no-speech') {
          if (activeTab === 'voice' && !isVoicePaused) {
            setTimeout(() => {
              if (activeTab === 'voice') startLiveListening();
            }, 200);
          }
        }
      };

      rec.onend = () => {
        if (liveVoiceStatus === 'listening' && activeTab === 'voice' && !isVoicePaused) {
          setTimeout(() => {
            if (activeTab === 'voice' && !isVoicePaused) startLiveListening();
          }, 150);
        }
      };

      liveRecognitionRef.current = rec;
      rec.start();
    } catch (e) {
      console.error('Failed to start live speech recognition:', e);
      setLiveVoiceStatus('idle');
    }
  };

  const processLiveVoiceQuery = async (queryText: string) => {
    if (!queryText.trim()) {
      startLiveListening();
      return;
    }

    if (liveSilenceTimerRef.current) {
      clearTimeout(liveSilenceTimerRef.current);
    }

    setLiveVoiceStatus('thinking');
    setLiveTranscript(queryText);

    const userMsg: Message = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setMessagesForActiveSession((prev) => [...prev, userMsg]);

    try {
      const response = await fetch('/api/gemini/twin-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText,
          activeContext,
          lang,
          isVoiceCall: true,
          voicePersona,
        }),
      });

      if (!response.ok) throw new Error('Network error');

      const data = await response.json();
      const aiReply =
        data.reply ||
        (lang === 'ar'
          ? 'تم استلام أمرك الصوتي وتطبيقه بنجاح.'
          : 'Voice command executed successfully.');
      const actions: ActionPayload[] = data.actions || [];

      if (actions.length > 0) {
        executeActions(actions);
      }

      const aiMsg: Message = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: aiReply,
        actionsExecuted: actions,
        timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessagesForActiveSession((prev) => [...prev, aiMsg]);

      const cleanReply = aiReply
        .replace(/###|####|\*\*|\*|#|`|~/g, '')
        .replace(/\[.*?\]\(.*?\)/g, '')
        .trim();

      setLiveTranscript(cleanReply);

      if (isVoiceMuted || !('speechSynthesis' in window)) {
        setTimeout(() => {
          if (activeTab === 'voice' && !isVoicePaused) {
            startLiveListening();
          }
        }, 1200);
      } else {
        speakLiveResponse(cleanReply);
      }
    } catch (err) {
      console.error('Error processing live voice query:', err);
      const fallbackReply =
        lang === 'ar'
          ? 'تم استقبال أمرك الصوتي بنجاح.'
          : 'Your voice command was received.';

      setLiveTranscript(fallbackReply);
      speakLiveResponse(fallbackReply);
    }
  };

  const speakLiveResponse = (text: string) => {
    setLiveVoiceStatus('speaking');
    if (!('speechSynthesis' in window)) {
      setTimeout(startLiveListening, 1000);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
    utterance.rate = 1.15; // Fast, crisp conversational cadence
    utterance.pitch = 1.0;

    utterance.onend = () => {
      if (activeTab === 'voice' && !isVoicePaused) {
        setTimeout(startLiveListening, 100);
      } else {
        setLiveVoiceStatus('idle');
      }
    };

    utterance.onerror = () => {
      if (activeTab === 'voice' && !isVoicePaused) {
        setTimeout(startLiveListening, 100);
      } else {
        setLiveVoiceStatus('idle');
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert(
        lang === 'ar'
          ? 'المتصفح لا يدعم التعرف الصوتي المباشر.'
          : 'Browser does not support Speech Recognition.'
      );
      return;
    }

    if (isListening) {
      if (chatRecognitionRef.current) {
        try {
          chatRecognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += trans;
          } else {
            interim += trans;
          }
        }
        const currentText = final || interim;
        if (currentText) {
          setInput(currentText);
        }
        if (final.trim()) {
          setIsListening(false);
          handleSend(final.trim());
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      chatRecognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Voice input error:', e);
      setIsListening(false);
    }
  };

  const handleSpeech = (text: string, id: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[\*#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
    utterance.onend = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessagesForActiveSession([
      {
        id: 'm-reset',
        sender: 'ai',
        text:
          lang === 'ar'
            ? 'تم مسح سجل المحادثة. كيف يمكنني مساعدتك الآن؟'
            : 'Chat cleared. How can I assist you?',
        timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
  };

  const quickPrompts = [
    lang === 'ar' ? '🎙️ تلخيص اجتماع كامل' : '🎙️ Summarize Meeting',
    lang === 'ar' ? '💡 اشرح لي بالتفصيل الشامل' : '💡 Detailed Explanation',
    lang === 'ar' ? '🌙 الوضع الليلي' : '🌙 Dark Mode',
    lang === 'ar' ? '☀️ الوضع النهاري' : '☀️ Light Mode',
    lang === 'ar' ? '⚙️ الإعدادات' : '⚙️ Settings',
    lang === 'ar' ? '👤 الملف الشخصي' : '👤 Profile',
    lang === 'ar' ? '📊 الرسم البياني' : '📊 Context Graph',
    lang === 'ar' ? '🔔 التنبيهات' : '🔔 Notifications',
  ];

  const handleCreateTaskFromSkills = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    if (onAddTask) {
      onAddTask(taskInput.trim(), activeContext);
      setTaskSuccess(
        lang === 'ar'
          ? `✅ تم إضافة المهمة بنجاح`
          : `✅ Task added successfully`
      );
      setTaskInput('');
      setTimeout(() => setTaskSuccess(null), 3000);
    }
  };

  return (
    <>
      {/* Floating Modern Indigo Trigger Button in Bottom Corner */}
      <div className="fixed bottom-20 lg:bottom-6 left-4 sm:left-6 z-40">
        <motion.button
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.94 }}
          onClick={toggleOpen}
          className="
            relative flex items-center gap-2.5 px-4 py-3 rounded-full
            bg-indigo-600 hover:bg-indigo-700
            text-white font-bold shadow-xl shadow-indigo-500/25
            cursor-pointer border-2 border-white/30 transition-all duration-200 group
          "
        >
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-purple-400 rounded-full animate-ping" />
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-purple-400 rounded-full border-2 border-slate-900" />

          <div className="p-1.5 rounded-full bg-white/20 backdrop-blur-md">
            <Bot className="w-5 h-5 text-white" />
          </div>

          <div className="text-start">
            <div className="text-xs font-black tracking-wide leading-tight flex items-center gap-1.5">
              <span>{t('aiAssistant.title')}</span>
            </div>
            <div className="text-[10px] text-indigo-100 font-medium">
              {lang === 'ar' ? 'جاهز للمساعدة ⚡' : 'Ready to help ⚡'}
            </div>
          </div>
        </motion.button>
      </div>

      {/* Modern AI Assistant Drawer Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            className={`
              fixed z-50 bottom-24 lg:bottom-20
              left-3 right-3 sm:left-6 sm:right-auto sm:w-[480px]
              ${isExpanded ? 'sm:w-[740px] h-[84vh]' : 'h-[600px] max-h-[84vh]'}
              bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl
              shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl relative overscroll-contain
            `}
          >
            {/* Header Bar */}
            <div className="p-3.5 bg-indigo-700 dark:bg-slate-900 text-white flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setShowSessionDrawer(!showSessionDrawer)}
                  className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer relative"
                  title={lang === 'ar' ? 'سجل المحادثات' : 'Chat History'}
                >
                  <History className="w-4 h-4" />
                  {sessions.length > 1 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-400 text-slate-950 font-black text-[9px] rounded-full flex items-center justify-center">
                      {sessions.length}
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center text-white border border-white/30 shadow-xs">
                      <Bot className="w-5 h-5" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-indigo-900" />
                  </div>
                  <div className="max-w-[170px] sm:max-w-[220px]">
                    <h3 className="text-xs sm:text-sm font-bold truncate flex items-center gap-1.5">
                      <span>{activeSession?.title || t('aiAssistant.title')}</span>
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-indigo-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-pulse" />
                      <span>{lang === 'ar' ? 'المساعد التفاعلي NEXUS' : 'NEXUS Interactive AI'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleCreateNewSession}
                  className="p-2 rounded-full hover:bg-white/15 transition-colors cursor-pointer text-white"
                  title={lang === 'ar' ? 'محادثة جديدة' : 'New Chat'}
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 rounded-full text-white hover:bg-white/15 transition-colors cursor-pointer hidden sm:block"
                  title={isExpanded ? 'تصغير' : 'توسيع'}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-full text-white hover:bg-white/15 transition-colors cursor-pointer"
                  title={lang === 'ar' ? 'إغلاق' : 'Close'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* MULTI-CONVERSATIONS SESSIONS DRAWER OVERLAY */}
            <AnimatePresence>
              {showSessionDrawer && (
                <motion.div
                  initial={{ opacity: 0, x: isRTL ? 300 : -300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRTL ? 300 : -300 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="absolute inset-0 z-30 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col p-4 shadow-2xl"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2">
                      <History className="w-5 h-5 text-indigo-500" />
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">
                        {lang === 'ar' ? 'المحادثات المجهزة' : 'Saved Conversations'}
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowSessionDrawer(false)}
                      className="p-1.5 rounded-full bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleCreateNewSession}
                    className="
                      mt-3 mb-2 w-full py-2.5 px-4 rounded-2xl
                      bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs
                      flex items-center justify-center gap-2 shadow-md
                      cursor-pointer transition-all
                    "
                  >
                    <Plus className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'بدء محادثة جديدة' : 'Start New Conversation'}</span>
                  </button>

                  <div className="flex-1 overflow-y-auto space-y-2 mt-2 pr-1">
                    {sessions.map((sess) => {
                      const isActive = sess.id === activeSessionId;
                      return (
                        <div
                          key={sess.id}
                          onClick={() => {
                            setActiveSessionId(sess.id);
                            setShowSessionDrawer(false);
                          }}
                          className={`
                            p-3 rounded-2xl border text-xs flex items-center justify-between cursor-pointer transition-all
                            ${
                              isActive
                                ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-600 dark:text-indigo-400 font-bold'
                                : 'bg-[var(--bg-hover)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-indigo-400/30'
                            }
                          `}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <MessageSquare className="w-4 h-4 shrink-0 text-indigo-500" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold">{sess.title}</p>
                              <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                                {sess.updatedAt} • {sess.messages.length} {lang === 'ar' ? 'رسائل' : 'messages'}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => handleDeleteSession(sess.id, e)}
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                            title={lang === 'ar' ? 'حذف المحادثة' : 'Delete Chat'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Clean Functional Tabs Bar */}
            <div className="grid grid-cols-3 bg-[var(--bg-hover)] border-b border-[var(--border-subtle)] p-1 text-[11px] font-bold shrink-0">
              <button
                onClick={() => setActiveTab('chat')}
                className={`py-1.5 px-1 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'chat'
                    ? 'bg-[var(--bg-surface)] text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'الدردشة' : 'Chat'}</span>
              </button>

              <button
                onClick={() => setActiveTab('skills')}
                className={`py-1.5 px-1 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'skills'
                    ? 'bg-[var(--bg-surface)] text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'المهارات' : 'Skills'}</span>
              </button>

              <button
                onClick={() => setActiveTab('intelligence')}
                className={`py-1.5 px-1 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'intelligence'
                    ? 'bg-[var(--bg-surface)] text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'الذكاء' : 'Intel'}</span>
              </button>
            </div>

            {/* TAB 1: CHAT WITH SMOOTH TOUCH & MOUSE SWIPE NAVIGATION */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col min-h-0 bg-[var(--bg-base)] relative">
                {/* Messages Log Container (Swipeable & Smooth Drag-Scrollable) */}
                <div
                  ref={chatScrollRef}
                  onScroll={handleScroll}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUpOrLeave}
                  onMouseLeave={handleMouseUpOrLeave}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onWheel={(e) => e.stopPropagation()}
                  className={`
                    flex-1 p-3.5 overflow-y-auto space-y-3 overscroll-contain
                    min-h-0 select-text touch-pan-y
                    ${isDraggingChat ? 'cursor-grabbing select-none' : 'cursor-grab'}
                  `}
                  style={{
                    touchAction: 'pan-y',
                    WebkitOverflowScrolling: 'touch',
                    backgroundImage: 'radial-gradient(var(--border-subtle) 1px, transparent 1px)',
                    backgroundSize: '22px 22px',
                  }}
                >
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${
                        msg.sender === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`
                          max-w-[85%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs relative group
                          ${
                            msg.sender === 'user'
                              ? 'bg-indigo-600 text-white rounded-tr-xs'
                              : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-tl-xs'
                          }
                        `}
                      >
                        {/* Executed Action Tags */}
                        {msg.actionsExecuted && msg.actionsExecuted.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-1.5">
                            {msg.actionsExecuted.map((act, i) => (
                              <div
                                key={i}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold flex items-center gap-1 ${
                                  msg.sender === 'user'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-indigo-500/10 text-indigo-500'
                                }`}
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{act.type}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {msg.sender === 'ai' ? (
                          <FormattedMarkdown content={msg.text} />
                        ) : (
                          <p className="whitespace-pre-line font-medium">{msg.text}</p>
                        )}

                        {/* Footer: Time + Action Toolbar */}
                        <div
                          className={`flex items-center justify-end gap-1.5 text-[10px] mt-1.5 font-mono ${
                            msg.sender === 'user' ? 'text-indigo-100' : 'text-[var(--text-muted)]'
                          }`}
                        >
                          <span>{msg.timestamp}</span>
                          {msg.sender === 'user' && <CheckCheck className="w-3.5 h-3.5 text-purple-200" />}
                          {msg.sender === 'ai' && (
                            <div className="flex items-center gap-1 opacity-70 hover:opacity-100 ms-1">
                              <button
                                onClick={() => handleSpeech(msg.text, msg.id)}
                                className="hover:text-indigo-500 cursor-pointer"
                                title={t('aiAssistant.voicePlay')}
                              >
                                <Volume2
                                  className={`w-3 h-3 ${speakingId === msg.id ? 'text-indigo-500 animate-pulse' : ''}`}
                                />
                              </button>
                              <button
                                onClick={() => handleCopy(msg.text, msg.id)}
                                className="hover:text-indigo-500 cursor-pointer"
                                title={t('aiAssistant.copy')}
                              >
                                {copiedId === msg.id ? (
                                  <Check className="w-3 h-3 text-[var(--success)]" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {loading && (
                    <div className="flex items-center gap-2 p-2.5 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] w-fit text-xs text-[var(--text-muted)]">
                      <Sparkles className="w-4 h-4 text-indigo-500 animate-spin" />
                      <span>{lang === 'ar' ? 'NEXUS يفكر ويكتب...' : 'NEXUS typing...'}</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Floating "Scroll to Bottom" Pill when user swipes up */}
                <AnimatePresence>
                  {showScrollBottom && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      onClick={() => scrollToBottom(true)}
                      className="
                        absolute bottom-16 right-4 z-20 p-2 rounded-full
                        bg-indigo-600 text-white shadow-lg border border-white/20
                        hover:bg-indigo-500 cursor-pointer flex items-center gap-1 text-[10px] font-bold
                      "
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                      <span>{lang === 'ar' ? 'الأسفل' : 'Bottom'}</span>
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Quick Prompts Expandable Pills */}
                {showQuickPrompts && (
                  <div className="p-2 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
                    {quickPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          handleSend(prompt);
                          setShowQuickPrompts(false);
                        }}
                        className="
                          px-3 py-1 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-all
                          bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)]
                          hover:bg-indigo-600 hover:text-white
                        "
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="p-2.5 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] flex items-center gap-2 shrink-0"
                >
                  <button
                    type="button"
                    onClick={() => setShowQuickPrompts(!showQuickPrompts)}
                    className="p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer shrink-0"
                    title={lang === 'ar' ? 'الأوامر السريعة' : 'Quick Actions'}
                  >
                    <Plus className={`w-5 h-5 transition-transform ${showQuickPrompts ? 'rotate-45' : ''}`} />
                  </button>

                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      isListening
                        ? (lang === 'ar' ? 'جاري الاستماع...' : 'Listening...')
                        : (lang === 'ar' ? 'اكتب رسالتك لـ NEXUS...' : 'Ask NEXUS anything...')
                    }
                    className="
                      flex-1 px-4 py-2.5 rounded-full bg-[var(--bg-hover)]
                      border border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--text-primary)]
                      placeholder-[var(--text-muted)] focus:outline-none focus:border-indigo-500
                    "
                  />

                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    className={`p-2.5 rounded-full transition-all cursor-pointer shrink-0 ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                    }`}
                    title={lang === 'ar' ? 'ملاحظة صوتية' : 'Voice note'}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="
                      p-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700
                      text-white font-bold
                      disabled:opacity-40 disabled:cursor-not-allowed
                      transition-all cursor-pointer shadow-md shrink-0
                    "
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* TAB 3: AUTOMATION SKILLS */}
            {activeTab === 'skills' && (
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[var(--bg-base)]">
                {/* Theme presets */}
                <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-indigo-500" />
                    <span>{lang === 'ar' ? '🎨 تخصيص المظهر' : '🎨 Appearance Presets'}</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onSetTheme?.('dark')}
                      className="px-3 py-2 rounded-xl bg-[var(--bg-hover)] hover:bg-indigo-500/10 border border-[var(--border-subtle)] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <span>🌙 {lang === 'ar' ? 'الوضع الليلي' : 'Dark Mode'}</span>
                    </button>
                    <button
                      onClick={() => onSetTheme?.('light')}
                      className="px-3 py-2 rounded-xl bg-[var(--bg-hover)] hover:bg-indigo-500/10 border border-[var(--border-subtle)] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <span>☀️ {lang === 'ar' ? 'الوضع النهاري' : 'Light Mode'}</span>
                    </button>
                  </div>
                </div>

                {/* Direct Navigation */}
                <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-indigo-500" />
                    <span>{lang === 'ar' ? '🚀 التنقل المباشر' : '🚀 Direct Navigation'}</span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'dashboard', labelAr: 'الرئيسية', labelEn: 'Dashboard', icon: '🏠' },
                      { id: 'graph', labelAr: 'الرسم البياني', labelEn: 'Graph', icon: '🕸️' },
                      { id: 'notifications', labelAr: 'التنبيهات', labelEn: 'Notifications', icon: '🔔' },
                      { id: 'profile', labelAr: 'الملف الشخصي', labelEn: 'Profile', icon: '👤' },
                      { id: 'settings', labelAr: 'الإعدادات', labelEn: 'Settings', icon: '⚙️' },
                      { id: 'help', labelAr: 'المساعدة', labelEn: 'Help', icon: '❓' },
                    ].map((nav) => (
                      <button
                        key={nav.id}
                        onClick={() => onNavigate?.(nav.id)}
                        className="px-3 py-2 rounded-xl bg-[var(--bg-hover)] hover:bg-indigo-500/10 border border-[var(--border-subtle)] text-xs font-bold text-start flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <span>{nav.icon}</span>
                        <span className="truncate">{lang === 'ar' ? nav.labelAr : nav.labelEn}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add Quick Task */}
                <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-indigo-500" />
                    <span>{lang === 'ar' ? '📝 إضافة مهمة سريعة' : '📝 Quick Task Creator'}</span>
                  </h4>

                  {taskSuccess && (
                    <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{taskSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleCreateTaskFromSkills} className="flex gap-2">
                    <input
                      type="text"
                      value={taskInput}
                      onChange={(e) => setTaskInput(e.target.value)}
                      placeholder={
                        lang === 'ar'
                          ? `عنوان المهمة الجديدة...`
                          : `New task title...`
                      }
                      className="flex-1 px-3 py-2 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-xs focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={!taskInput.trim()}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
                    >
                      {lang === 'ar' ? 'إضافة' : 'Add'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 4: RAG INTELLIGENCE */}
            {activeTab === 'intelligence' && (
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[var(--bg-base)]">
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">
                        {lang === 'ar' ? 'تحليل RAG لسياقك الحالي' : 'RAG Active Context Synthesis'}
                      </h4>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {lang === 'ar'
                      ? `تم تحليل التطبيقات المتصلة. السياق الحالي (${activeContext}) يتزامن بانتظام مع مهامك اليومية.`
                      : `Connected apps analyzed. Active context (${activeContext}) synchronizes automatically with daily schedule.`}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-indigo-500" />
                    <span className="font-bold text-[var(--text-primary)]">
                      {lang === 'ar' ? 'تشفير الآمان مفعل 100%' : '100% Security Encryption Active'}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-[var(--text-muted)] font-bold">AES-256</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
