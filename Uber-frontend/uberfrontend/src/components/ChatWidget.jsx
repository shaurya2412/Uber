import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { CHAT_API_URL } from '../config';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      let response;
      if (threadId) {
        response = await axios.post(`${CHAT_API_URL}/chat/${threadId}`, { message: userMessage });
      } else {
        response = await axios.post(`${CHAT_API_URL}/chat`, { message: userMessage });
        if (response.data.threadId) {
          setThreadId(response.data.threadId);
        }
      }

      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: response.data.response || response.data.res || 'Could not calculate fare right now.' },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: 'Standard city rate is ₹50 base + ₹12/km. Try entering your pickup and drop-off.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="chat-btn"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsOpen(true)}
            className="bg-[#FAFAFA] text-[#09090B] px-4 py-3 rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.6)] flex items-center gap-2 text-xs font-extrabold cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-[#10B981]" />
            <span>Fare & Trip Help</span>
          </motion.button>
        ) : (
          <motion.div
            key="chat-box"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="bg-[#121215] w-80 sm:w-96 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] flex flex-col h-[460px] border border-white/[0.12] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#09090B] text-[#FAFAFA] px-4 py-3.5 border-b border-white/[0.08] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span className="text-xs font-bold">Nexus Trip Support</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#A1A1AA] hover:text-[#FAFAFA] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#121215]">
              {messages.length === 0 && (
                <div className="p-3.5 rounded-xl bg-[#09090B] border border-white/[0.07] text-xs text-[#A1A1AA] leading-relaxed">
                  Ask for a quick fare estimate between any two neighbourhoods (e.g. &ldquo;Connaught Place to CyberHub&rdquo;) or help with a recent booking.
                </div>
              )}
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[82%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#FAFAFA] text-[#09090B] font-medium'
                        : 'bg-[#09090B] text-[#FAFAFA] border border-white/[0.08]'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#09090B] border border-white/[0.08] px-3.5 py-2.5 rounded-xl flex items-center gap-2 text-xs text-[#A1A1AA]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#10B981]" />
                    <span>Checking route...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSend}
              className="p-3 bg-[#09090B] border-t border-white/[0.08] flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a fare or route question..."
                className="flex-1 bg-[#121215] border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs text-[#FAFAFA] placeholder:text-[#52525B] focus:outline-none focus:border-[#FAFAFA]"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-[#FAFAFA] text-[#09090B] p-2.5 rounded-xl disabled:opacity-40 hover:bg-white transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatWidget;
