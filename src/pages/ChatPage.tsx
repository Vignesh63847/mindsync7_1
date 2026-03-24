import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@/hooks/use-chat";
import { useVoiceRecognition, type VoiceLang } from "@/hooks/use-voice-recognition";
import { useMoodTracker, type Mood } from "@/hooks/use-mood-tracker";
import { Send, Trash2, Brain, Mic, MicOff, Plus, MessageSquare, ChevronLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

function extractMood(text: string): Mood | null {
  const match = text.match(/\[MOOD:(sad|anxious|stressed|happy|neutral)\]/);
  return match ? (match[1] as Mood) : null;
}

function cleanContent(text: string): string {
  return text.replace(/\[MOOD:(sad|anxious|stressed|happy|neutral)\]/, "").trim();
}

const moodEmoji: Record<Mood, string> = {
  sad: "😢",
  anxious: "😰",
  stressed: "😤",
  happy: "😊",
  neutral: "😌",
};

export default function ChatPage() {
  const {
    messages, isLoading, send, clearChat,
    conversations, loadConversation, startNewChat, deleteConversation,
    activeConversationId,
  } = useChat();
  const { addMood } = useMoodTracker();
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleVoiceResult = useCallback((text: string) => {
    setInput((prev) => (prev ? prev + " " + text : text));
    inputRef.current?.focus();
  }, []);

  const { isListening, isSupported, toggle: toggleVoice, lang, setLang } = useVoiceRecognition(handleVoiceResult);

  const langLabel: Record<VoiceLang, string> = { "en-US": "EN", "ta-IN": "தமிழ்" };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === "assistant" && !isLoading) {
      const mood = extractMood(lastMsg.content);
      if (mood) addMood(mood);
    }
  }, [messages, isLoading]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    send(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] md:h-screen pt-16">
      {/* Sidebar overlay for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed md:relative z-40 w-[280px] h-full bg-background border-r border-border/30 flex flex-col"
          >
            <div className="p-3 border-b border-border/30 flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold">Conversations</h3>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { startNewChat(); setSidebarOpen(false); }}>
                  <Plus className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={() => setSidebarOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {conversations.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">No previous chats</p>
              )}
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-colors ${
                    conv.id === activeConversationId
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`}
                  onClick={() => { loadConversation(conv.id); setSidebarOpen(false); }}
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span className="flex-1 truncate">{conv.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
                    onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 glass-strong">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <ChevronLeft className={`w-4 h-4 transition-transform ${sidebarOpen ? "" : "rotate-180"}`} />
            </Button>
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-sm">MindSync</h2>
              <p className="text-[10px] text-muted-foreground">
                {isLoading ? "Thinking..." : "Here to listen"}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => { startNewChat(); }} title="New chat">
              <Plus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={clearChat} title="Clear chat">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-20 md:pb-4">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 glow-border">
                <Brain className="w-8 h-8 text-primary animate-pulse-glow" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Welcome to MindSync</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                I'm here to listen. Share how you're feeling today — in English, Tamil, or Tanglish. Everything stays private.
              </p>
              <div className="flex flex-wrap gap-2 mt-6 justify-center">
                {["I'm feeling anxious today", "நான் சோர்வாக இருக்கிறேன்", "I feel stressed about work"].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); inputRef.current?.focus(); }}
                    className="text-xs px-3 py-2 rounded-xl glass hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, i) => {
              const isUser = msg.role === "user";
              const content = isUser ? msg.content : cleanContent(msg.content);
              const mood = !isUser ? extractMood(msg.content) : null;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isUser
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "glass rounded-bl-sm"
                    }`}
                  >
                    {isUser ? (
                      <p>{content}</p>
                    ) : (
                      <div className="prose prose-sm prose-invert max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0">
                        <ReactMarkdown>{content}</ReactMarkdown>
                      </div>
                    )}
                    {mood && !isLoading && (
                      <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                        {moodEmoji[mood]} Detected mood: {mood}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="glass rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border/30 glass-strong mb-14 md:mb-0">
          <div className="flex gap-2 items-end max-w-3xl mx-auto">
            {isSupported && (
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  onClick={() => setLang(lang === "en-US" ? "ta-IN" : "en-US")}
                  variant="ghost"
                  size="sm"
                  className="rounded-xl text-xs px-2 h-9 text-muted-foreground hover:text-foreground"
                  title="Switch language"
                >
                  {langLabel[lang]}
                </Button>
                <Button
                  onClick={toggleVoice}
                  variant={isListening ? "destructive" : "ghost"}
                  size="icon"
                  className={`rounded-xl ${isListening ? "animate-pulse" : ""}`}
                  title={isListening ? "Stop listening" : "Voice input"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              </div>
            )}
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening..." : "How are you feeling today?"}
              rows={1}
              className="flex-1 resize-none bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              variant="hero"
              size="icon"
              className="rounded-xl shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
