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
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        },
      });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        console.log("Audio blob size:", audioBlob.size);
        await processVoiceResponse(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);

      // Stop recording after 5 seconds for better capture
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
          setIsListening(false);
        }
      }, 10000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone Permission Required",
        description: "Please allow microphone access to use voice commands.",
        variant: "destructive",
      });
    }
  };

  const processVoiceResponse = async (audioBlob: Blob) => {
    try {
      if (audioBlob.size === 0) {
        console.error("Empty audio blob");
        speakMessage("I didn't hear anything. Please try again.", () => {
          startListening();
        });
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(",")[1];

        if (!base64Audio) {
          console.error("Failed to encode audio");
          speakMessage("Audio processing failed. Please try again.", () => {
            startListening();
          });
          return;
        }

        console.log("Sending audio to speech-to-text, size:", base64Audio.length);

        const { data, error } = await supabase.functions.invoke("speech-to-text", {
          body: { audioBase64: base64Audio },
        });

        if (error) {
          console.error("Speech-to-text error:", error);
          throw error;
        }

        const transcript = (data?.transcription || data?.text || "").toLowerCase().trim();
        console.log("Received transcript:", transcript);

        if (!transcript || transcript.length === 0) {
          speakMessage("I didn't catch that. Please say 'yes' to continue or 'no' to stay.", () => {
            startListening();
          });
          return;
        }

        // More flexible matching - check for any positive or negative indicators
        const positiveWords = ["yes", "yeah", "yep", "sure", "okay", "ok", "continue", "start", "go"];
        const negativeWords = ["no", "nope", "nah", "stop", "wait", "not"];

        const isPositive = positiveWords.some((word) => transcript.includes(word));
        const isNegative = negativeWords.some((word) => transcript.includes(word));

        if (isPositive && !isNegative) {
          speakMessage("Great! Let's get started.");
          setTimeout(() => navigate("/voice-setup"), 1500);
        } else if (isNegative && !isPositive) {
          speakMessage("Would you like to start onboarding?", () => {
            startListening();
          });
        } else {
          speakMessage("I didn't understand. Please say 'yes' to continue or 'no' to stay.", () => {
            startListening();
          });
        }
      };
    } catch (error) {
      console.error("Error processing voice response:", error);
      toast({
        title: "Voice Recognition Error",
        description: "Could not process your response. Using buttons instead.",
        variant: "destructive",
      });
      speakMessage("Voice recognition failed. Please try again or use the buttons below.");
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
                  <span className="text-sm font-medium">Listening... (speak now)</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-5 w-5" aria-hidden="true" />
                  <span className="text-sm">Would you like to start onboarding?</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center max-w-md">Say "Yes" to continue or "No" to stay</p>
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
