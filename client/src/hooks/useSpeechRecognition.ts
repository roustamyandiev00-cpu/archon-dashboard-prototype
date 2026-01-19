import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const {
    lang = "nl-NL",
    continuous = false,
    interimResults = true,
    onResult,
    onError,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      const fullTranscript = finalTranscript || interimTranscript;
      setTranscript(fullTranscript.trim());

      if (onResult) {
        onResult(fullTranscript.trim(), !!finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      const error = event.error;
      setIsListening(false);
      
      let errorMessage = "Spraakherkenning fout";
      if (error === "no-speech") {
        errorMessage = "Geen spraak gedetecteerd";
      } else if (error === "audio-capture") {
        errorMessage = "Geen microfoon gevonden";
      } else if (error === "not-allowed") {
        errorMessage = "Microfoon toegang geweigerd";
      } else if (error === "network") {
        errorMessage = "Netwerkfout";
      }

      toast.error(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [lang, continuous, interimResults, onResult, onError]);

  const startListening = () => {
    if (!recognitionRef.current) {
      toast.error("Spraakherkenning niet beschikbaar in deze browser");
      return;
    }

    try {
      recognitionRef.current.start();
      toast.info("Luisteren...", { duration: 1000 });
    } catch (error: any) {
      if (error.name === "InvalidStateError") {
        // Already listening
        return;
      }
      toast.error("Kon niet starten met luisteren");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const resetTranscript = () => {
    setTranscript("");
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: typeof window !== "undefined" && 
      (!!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition),
  };
}
