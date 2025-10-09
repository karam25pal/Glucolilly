import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X, Send, Mic, MicOff, Camera } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIAssistantProps {
  onClose: () => void;
}

const AIAssistant = ({ onClose }: AIAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! 👋 I'm your GlucoLilly AI assistant. How can I help you with your diabetes management today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { profile, weeklyStats } = useUser();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize voice activation
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        if (transcript.toLowerCase().includes('hey glucolilly') || 
            transcript.toLowerCase().includes('glucolilly')) {
          toast.success("Voice activated! Listening...");
          handleVoiceInput();
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleVoiceActivation = () => {
    if (!recognitionRef.current) {
      toast.error("Voice recognition not supported in this browser");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      toast.info("Voice activation disabled");
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast.success("Voice activation enabled! Say 'Hey GlucoLilly' to start");
    }
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          
          try {
            setIsLoading(true);
            const { data, error } = await supabase.functions.invoke('speech-to-text', {
              body: { audioBase64: base64Audio }
            });

            if (error) throw error;
            
            if (data?.transcription) {
              setInput(data.transcription);
              toast.success("Voice transcribed!");
            }
          } catch (error) {
            console.error('Transcription error:', error);
            toast.error("Failed to transcribe audio");
          } finally {
            setIsLoading(false);
          }
        };
        
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording... Click again to stop");
    } catch (error) {
      console.error('Microphone access error:', error);
      toast.error("Could not access microphone");
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result as string;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase.functions.invoke('analyze-meal-image', {
          body: { 
            imageBase64: base64Image,
            diabetesType: profile?.diabetesType 
          }
        });

        if (error) throw error;
        
        if (data?.analysis) {
          const analysis = data.analysis;
          const message = `📸 Meal Analysis:\n\n${analysis.mealName}\n\n` +
            `Carbs: ${analysis.carbs}g | Calories: ${analysis.calories} | Protein: ${analysis.protein}g\n` +
            `Glycemic Load: ${analysis.glycemicLoad}\n` +
            `Compatibility: ${(analysis.compatibilityScore * 100).toFixed(0)}%\n\n` +
            `${analysis.portions}\n\n` +
            (analysis.alternatives?.length > 0 ? `Alternatives: ${analysis.alternatives.join(', ')}\n\n` : '') +
            (analysis.notes || '');
          
          setMessages(prev => [...prev, 
            { role: "user", content: "Analyze this meal photo" },
            { role: "assistant", content: message }
          ]);
          toast.success("Meal analyzed!");
        }
      } catch (error) {
        console.error('Image analysis error:', error);
        toast.error("Failed to analyze image");
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.readAsDataURL(file);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Generate user ID from profile name for demo (in production, use auth)
      const userId = profile?.name ? `user_${profile.name.toLowerCase().replace(/\s+/g, '_')}` : 'demo_user';
      
      const userContext = {
        profile,
        weeklyStats,
      };

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          messages: [...messages, { role: "user", content: userMessage }],
          userContext,
          userId
        }
      });

      if (error) throw error;

      if (data?.message) {
        setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
      } else {
        throw new Error("No response from AI");
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      if (error.message?.includes('429')) {
        toast.error("Rate limit exceeded. Please wait a moment and try again.");
      } else if (error.message?.includes('402')) {
        toast.error("AI credits exhausted. Please contact support.");
      } else {
        toast.error("Failed to get response. Please try again.");
      }
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="fixed bottom-phi-4 right-phi-4 w-96 h-[600px] flex flex-col shadow-2xl z-50 animate-slide-up">
      <div className="flex items-center justify-between p-phi-4 border-b border-border bg-primary text-primary-foreground">
        <div>
          <h3 className="font-bold text-lg">AI Assistant</h3>
          <p className="text-xs opacity-90">Learning from your conversations 🤖</p>
        </div>
        <div className="flex gap-phi-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleVoiceActivation}
            className={`min-h-touch min-w-touch ${isListening ? 'bg-white/20' : ''}`}
            aria-label={isListening ? "Disable voice activation" : "Enable voice activation"}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="min-h-touch min-w-touch"
            aria-label="Close assistant"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-phi-4 space-y-phi-3">
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-phi-3 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-phi-3">
              <p className="text-sm text-muted-foreground">Thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-phi-4 border-t border-border space-y-phi-2">
        <div className="flex gap-phi-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="min-h-touch min-w-touch"
            aria-label="Upload meal photo"
          >
            <Camera className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleVoiceInput}
            disabled={isLoading}
            className={`min-h-touch min-w-touch ${isRecording ? 'bg-primary text-primary-foreground' : ''}`}
            aria-label={isRecording ? "Stop recording" : "Record voice"}
          >
            <Mic className="h-5 w-5" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1 min-h-touch"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="min-h-touch min-w-touch"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        {isListening && (
          <p className="text-xs text-muted-foreground text-center animate-pulse">
            🎤 Listening for "Hey GlucoLilly"...
          </p>
        )}
      </div>
    </Card>
  );
};

export default AIAssistant;
