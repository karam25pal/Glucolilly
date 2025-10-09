import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const VoiceNavigationTimer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [countdown, setCountdown] = useState(10);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Announce the screen with speech synthesis
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(
        "Welcome to GlucoLilly. In 10 seconds, we will proceed to accessibility options. Say 'enable voice navigation' to activate voice commands, or say 'continue' to skip voice navigation."
      );
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/accessibility");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

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
        await processVoiceCommand(audioBlob);
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

  const processVoiceCommand = async (audioBlob: Blob) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(",")[1];
        
        const { data, error } = await supabase.functions.invoke("speech-to-text", {
          body: { audioBase64: base64Audio },
        });

        if (error) throw error;

        const transcript = data.text.toLowerCase();
        
        if (transcript.includes("enable") && transcript.includes("voice")) {
          setVoiceEnabled(true);
          speakMessage("Voice navigation enabled. Say 'continue' to proceed.");
        } else if (transcript.includes("continue")) {
          navigate("/accessibility");
        }
      };
    } catch (error) {
      console.error("Error processing voice command:", error);
      toast({
        title: "Voice Recognition Error",
        description: "Could not process voice command. Please try again.",
        variant: "destructive",
      });
    }
  };

  const speakMessage = (message: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-phi-4">
      <div className="flex flex-col items-center justify-center text-center space-y-phi-6 max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold text-primary animate-fade-in">
          Voice Navigation Setup
        </h1>

        <div className="flex items-center justify-center">
          <div className="text-8xl font-bold text-primary animate-pulse">
            {countdown}
          </div>
        </div>

        <p className="text-xl text-foreground">
          {voiceEnabled
            ? "Voice navigation is enabled. Say 'continue' to proceed."
            : "Say 'enable voice navigation' to activate voice commands"}
        </p>

        <div className="flex flex-col gap-phi-4 w-full max-w-md">
          <Button
            onClick={startListening}
            disabled={isListening}
            size="lg"
            className="w-full min-h-touch text-lg font-semibold"
            aria-label={isListening ? "Listening..." : "Press to speak"}
          >
            {isListening ? (
              <>
                <MicOff className="mr-2 h-5 w-5" />
                Listening...
              </>
            ) : (
              <>
                <Mic className="mr-2 h-5 w-5" />
                Press to Speak
              </>
            )}
          </Button>

          <Button
            onClick={() => navigate("/accessibility")}
            variant="outline"
            size="lg"
            className="w-full min-h-touch text-lg"
            aria-label="Continue without voice navigation"
          >
            Continue Without Voice Navigation
          </Button>
        </div>

        {voiceEnabled && (
          <div className="flex items-center gap-phi-2 text-muted-foreground animate-slide-up">
            <Volume2 className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm">Voice navigation is active</span>
          </div>
        )}
      </div>
    </main>
  );
};

export default VoiceNavigationTimer;
