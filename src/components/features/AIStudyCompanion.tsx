import { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  X, 
  Minimize2,
  Lightbulb,
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  Brain
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AIStudyCompanionProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
}

export function AIStudyCompanion({ isOpen, onClose, onMinimize }: AIStudyCompanionProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi Rohan! 👋 I'm your AI Study Companion. I can help you with:\n\n• Explaining difficult concepts\n• Creating study plans\n• Solving doubts\n• Recommending resources\n• Test preparation strategies\n\nWhat would you like to explore today?",
      timestamp: new Date(),
      suggestions: [
        "Explain Newton's Laws",
        "Create a study plan for Physics",
        "What are my weak areas?",
        "Best way to prepare for MHT-CET"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (content?: string) => {
    const messageText = content || inputMessage.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: getAIResponse(messageText),
        timestamp: new Date(),
        suggestions: getContextualSuggestions(messageText)
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('newton') || lowerQuery.includes('law')) {
      return "**Newton's Laws of Motion Explained:**\n\n1️⃣ **First Law (Inertia)**: An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force.\n\n2️⃣ **Second Law (F=ma)**: Force equals mass times acceleration. This tells us how an object's motion changes when force is applied.\n\n3️⃣ **Third Law (Action-Reaction)**: For every action, there's an equal and opposite reaction.\n\n📚 I've prepared a 5-minute video explanation. Want to watch it?";
    }
    
    if (lowerQuery.includes('study plan') || lowerQuery.includes('schedule')) {
      return "I've analyzed your performance and created a personalized study plan:\n\n**This Week:**\n• Monday-Tuesday: Physics (Light & Optics) - 2hrs/day\n• Wednesday-Thursday: Chemistry (Periodic Table) - 2hrs/day\n• Friday: Revision + Practice Tests\n• Weekend: Mock Test + Analysis\n\n💡 **Focus Areas:** You scored 65% in Optics. Let's target 85%!\n\n⏰ **Best Study Time:** Your peak concentration is 6-8 PM.\n\nShall I add this to your calendar?";
    }
    
    if (lowerQuery.includes('weak') || lowerQuery.includes('improve')) {
      return "**📊 Your Weak Areas Analysis:**\n\n🔴 **Critical:**\n• Physics: Light Refraction (45% accuracy)\n• Math: Quadratic Equations (52% accuracy)\n\n🟡 **Needs Improvement:**\n• Chemistry: Chemical Bonding (68%)\n• Physics: Current Electricity (72%)\n\n✅ **Recommended Action Plan:**\n1. Complete 'Light Refraction' micro-lessons (30 min)\n2. Practice 20 MCQs daily\n3. Watch concept video by Dr. Sharma\n4. Take focused test in 3 days\n\nReady to start improving?";
    }
    
    if (lowerQuery.includes('mht-cet') || lowerQuery.includes('prepare') || lowerQuery.includes('exam')) {
      return "**🎯 MHT-CET Preparation Strategy:**\n\n**Phase 1 (Current - 2 months):**\n• Complete syllabus coverage\n• Focus on NCERT thoroughly\n• Daily 1-hour practice\n\n**Phase 2 (Last 2 months):**\n• 3 mock tests per week\n• Previous year papers (2018-2024)\n• Time management practice\n\n**Phase 3 (Last month):**\n• Daily mock tests\n• Revision of weak topics\n• Mental preparation\n\n📈 **Your Current Level:** 72% ready\n🎯 **Target:** 95%+ percentile\n\n💪 You need to improve speed by 15% and accuracy by 8%. Let's work on it!";
    }
    
    return "I understand your question! Let me help you with that. Based on your learning profile and current progress, I recommend:\n\n1. Breaking down the concept into smaller parts\n2. Watching our interactive video lessons\n3. Practicing with adaptive questions\n4. Taking a quick assessment to check understanding\n\nWould you like me to create a personalized learning path for this topic?";
  };

  const getContextualSuggestions = (query: string): string[] => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('newton') || lowerQuery.includes('law')) {
      return [
        "Show me practice questions",
        "Explain with real-world examples",
        "What are common mistakes?",
        "Take a quiz on Newton's Laws"
      ];
    }
    
    if (lowerQuery.includes('study plan')) {
      return [
        "Adjust my study hours",
        "Add more subjects",
        "Show me today's tasks",
        "Set study reminders"
      ];
    }
    
    return [
      "Tell me more",
      "Show practice questions",
      "Create a mini-test",
      "Explain differently"
    ];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold">AI Study Companion</h3>
            <p className="text-xs text-purple-100">Always here to help</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onMinimize}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-3 bg-gradient-to-b from-purple-50 to-white border-b border-gray-200">
        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={() => handleSendMessage("What should I study today?")}
            className="p-2 bg-white rounded-lg border border-purple-200 hover:border-purple-400 transition-all text-center"
          >
            <Calendar className="w-4 h-4 mx-auto mb-1 text-purple-600" />
            <span className="text-xs text-gray-700">Study Plan</span>
          </button>
          <button 
            onClick={() => handleSendMessage("Show my weak areas")}
            className="p-2 bg-white rounded-lg border border-orange-200 hover:border-orange-400 transition-all text-center"
          >
            <Target className="w-4 h-4 mx-auto mb-1 text-orange-600" />
            <span className="text-xs text-gray-700">Weak Areas</span>
          </button>
          <button 
            onClick={() => handleSendMessage("Give me a tip")}
            className="p-2 bg-white rounded-lg border border-green-200 hover:border-green-400 transition-all text-center"
          >
            <Lightbulb className="w-4 h-4 mx-auto mb-1 text-green-600" />
            <span className="text-xs text-gray-700">Study Tips</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${message.type === 'user' ? 'order-1' : 'order-2'}`}>
              <div className={`rounded-2xl p-3 ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-gray-100 text-gray-900 rounded-bl-none'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              
              {/* Suggestions */}
              {message.suggestions && message.type === 'ai' && (
                <div className="mt-2 space-y-1">
                  {message.suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(suggestion)}
                      className="block w-full text-left text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-gray-400 mt-1 px-1">
                {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-none p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim()}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          <Sparkles className="w-3 h-3 inline" /> Powered by Advanced AI
        </p>
      </div>
    </div>
  );
}

// Floating Button Component
interface AICompanionButtonProps {
  onClick: () => void;
  unreadCount?: number;
}

export function AICompanionButton({ onClick, unreadCount = 0 }: AICompanionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group z-40"
    >
      <Brain className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {unreadCount}
        </span>
      )}
      <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        AI Study Companion
      </span>
    </button>
  );
}
