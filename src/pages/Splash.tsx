import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Volume2, Accessibility, Mic } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Splash = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showVoicePrompt, setShowVoicePrompt] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const speakMessage = (message: string, onEndCallback?: () => void) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = "en-US";
      if (onEndCallback) {
        utterance.onend = onEndCallback;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await processVoiceResponse(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);

      // Stop recording after 3 seconds
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
          setIsListening(false);
        }
      }, 3000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const processVoiceResponse = async (audioBlob: Blob) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(",")[1];
        
        const { data, error } = await supabase.functions.invoke("speech-to-text", {
          body: { audioBase64: base64Audio },
        });

        if (error) throw error;

        const transcript = data.text.toLowerCase().trim();
        console.log("Transcript:", transcript);
        
        if (transcript.includes("yes") || transcript.includes("yeah") || transcript.includes("sure")) {
          speakMessage("Great! Let's get started.");
          setTimeout(() => navigate("/voice-setup"), 1500);
        } else if (transcript.includes("no") || transcript.includes("nope")) {
          speakMessage("Would you like to start onboarding?", () => {
            startListening();
          });
        } else {
          speakMessage("I didn't understand. Please say yes or no.", () => {
            startListening();
          });
        }
      };
    } catch (error) {
      console.error("Error processing voice response:", error);
      toast({
        title: "Voice Recognition Error",
        description: "Could not process your response. Please try again.",
        variant: "destructive",
      });
      speakMessage("I couldn't hear you. Would you like to start onboarding?", () => {
        startListening();
      });
    }
  };

  useEffect(() => {
    // Show voice prompt after 5 seconds of inactivity
    const timer = setTimeout(() => {
      setShowVoicePrompt(true);
      speakMessage("Would you like to start onboarding?", () => {
        startListening();
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-phi-4">
      {/* Title takes ~61.8% of vertical space (Golden Ratio) */}
      <div className="flex-[0.618] flex flex-col items-center justify-center text-center animate-fade-in">
        <h1 className="text-6xl md:text-8xl font-bold text-primary mb-phi-3">GlucoLilly</h1>
        {/* <Accessibility className="h-12 w-12 text-muted-foreground/40 mb-phi-4" aria-hidden="true" /> */}
        <p className="text-2xl md:text-3xl text-foreground font-medium mb-phi-2">Empower Your Wellness</p>
        <p className="text-lg text-muted-foreground max-w-md">
          Your AI-powered accessible companion for diabetes management
        </p>
      </div>

      {/* CTA section takes ~38.2% */}
      <div className="flex-[0.382] flex flex-col items-center justify-start gap-phi-4 w-full max-w-md">
        <Button
          onClick={() => navigate("/voice-setup")}
          size="lg"
          className="w-full min-h-touch text-lg font-semibold"
          aria-label="Select accessibility options to begin"
        >
          Select Accessibility Options
        </Button>

        {showVoicePrompt && (
          <div className="flex flex-col items-center gap-phi-3 animate-slide-up">
            <div className="flex items-center gap-phi-2 text-muted-foreground">
              {isListening ? (
                <>
                  <Mic className="h-5 w-5 animate-pulse text-primary" aria-hidden="true" />
                  <span className="text-sm">Listening...</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-5 w-5" aria-hidden="true" />
                  <span className="text-sm">Would you like to start onboarding?</span>
                </>
              )}
            </div>
            {!isListening && (
              <Button
                onClick={startListening}
                size="sm"
                variant="outline"
                className="min-h-touch"
              >
                <Mic className="mr-2 h-4 w-4" />
                Tap to Respond
              </Button>
            )}
          </div>
        )}

        <button
          onClick={() => navigate("/voice-setup")}
          className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded px-phi-2 py-phi-1 min-h-touch flex items-center"
          aria-label="Skip to voice navigation setup"
        >
          Continue →
        </button>
      </div>
    </main>
  );
};

export default Splash;
