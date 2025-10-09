import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X, Send, Volume2 } from "lucide-react";

interface AIAssistantProps {
  onClose: () => void;
}

const AIAssistant = ({ onClose }: AIAssistantProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your DiaLife AI coach. How can I help you today? Feel free to ask about meals, exercise, or your health data.'
    }
  ]);

  const handleSend = () => {
    if (!message.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: message }]);
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I understand you\'re interested in managing your diabetes better. Here are some personalized tips based on your profile...'
      }]);
    }, 1000);

    setMessage("");
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-phi-4">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-phi-4 border-b border-border">
          <div className="flex items-center gap-phi-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xl">🤖</span>
            </div>
            <div>
              <h2 className="font-bold text-lg">AI Health Coach</h2>
              <p className="text-xs text-muted-foreground">Always here to help</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="min-h-touch min-w-touch"
            aria-label="Close AI Assistant"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-phi-4 space-y-phi-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-phi-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                {msg.content}
                {msg.role === 'assistant' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-phi-2 h-8"
                    aria-label="Read message aloud"
                  >
                    <Volume2 className="h-4 w-4 mr-phi-1" />
                    Read aloud
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-phi-4 border-t border-border">
          <div className="flex gap-phi-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything about your health..."
              className="flex-1 min-h-touch"
              aria-label="Message input"
            />
            <Button
              onClick={handleSend}
              size="icon"
              className="min-h-touch min-w-touch"
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIAssistant;
