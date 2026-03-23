/**
 * Speech Recognition Service
 * Uses Web Speech API for browser, with platform detection for native
 */

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export type RecognitionState = "idle" | "listening" | "processing" | "error";

export type RecognitionResult = {
  transcript: string;
  isFinal: boolean;
  confidence: number;
};

export type RecognitionCallbacks = {
  onResult?: (result: RecognitionResult) => void;
  onStateChange?: (state: RecognitionState) => void;
  onError?: (error: string) => void;
};

let recognition: SpeechRecognition | null = null;
let currentCallbacks: RecognitionCallbacks = {};
let isListening = false;
let shouldContinueListening = false;
let retryCount = 0;
let maxRetries = 2;

/**
 * Check if speech recognition is supported
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Initialize the speech recognition engine
 */
function getRecognition(): SpeechRecognition | null {
  if (typeof window === "undefined") return null;

  if (!recognition) {
    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      console.warn("Speech recognition not supported in this browser");
      return null;
    }

    recognition = new SpeechRecognitionClass();
    recognition.continuous = true; // Keep listening for continuous speech
    recognition.interimResults = true; // Get interim results for real-time feedback
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.resultIndex];
      if (result) {
        const alternative = result[0];
        const recognitionResult: RecognitionResult = {
          transcript: alternative.transcript,
          isFinal: result.isFinal,
          confidence: alternative.confidence,
        };

        console.log(
          "[SpeechRecognition] Result:",
          recognitionResult.transcript,
          "Final:",
          result.isFinal
        );
        currentCallbacks.onResult?.(recognitionResult);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMessage = event.error || event.message;
      console.error("[SpeechRecognition] Error:", errorMessage);
      console.error("[SpeechRecognition] Full event:", event);

      // Handle network errors with retry
      if (errorMessage === "network" && retryCount < maxRetries) {
        retryCount++;
        console.log(
          `[SpeechRecognition] Network error, retrying (attempt ${retryCount}/${maxRetries})...`
        );
        isListening = false;

        // Wait a moment before retrying
        setTimeout(() => {
          if (shouldContinueListening && recognition) {
            try {
              recognition.start();
            } catch (e) {
              console.error("[SpeechRecognition] Retry failed:", e);
              handleRecognitionError(errorMessage);
            }
          }
        }, 500);
        return;
      }

      handleRecognitionError(errorMessage);
    };

    function handleRecognitionError(errorMessage: string) {
      retryCount = 0; // Reset retry counter

      // Map common errors to user-friendly messages
      let userMessage = errorMessage;
      if (
        errorMessage.includes("not-allowed") ||
        errorMessage.includes("permission")
      ) {
        userMessage =
          "Microphone permission denied. Check your browser settings.";
      } else if (errorMessage.includes("no-speech")) {
        userMessage = "No speech detected. Please try again.";
      } else if (errorMessage.includes("network")) {
        userMessage =
          "Network error with speech service. Try again or check your connection.";
      }

      isListening = false;
      currentCallbacks.onStateChange?.("error");
      currentCallbacks.onError?.(userMessage);
    }

    recognition.onend = () => {
      console.log(
        "[SpeechRecognition] Ended, isListening:",
        isListening,
        "shouldContinueListening:",
        shouldContinueListening
      );
      isListening = false;

      // Only update state to idle if we intended to stop
      if (!shouldContinueListening) {
        currentCallbacks.onStateChange?.("idle");
      } else {
        // If we were expecting to keep listening but got interrupted, retry
        console.warn(
          "[SpeechRecognition] Recognition ended unexpectedly while shouldContinueListening=true, attempting to restart..."
        );
        // Attempt to restart after a brief delay
        setTimeout(() => {
          if (shouldContinueListening && recognition) {
            try {
              recognition.start();
            } catch (e) {
              console.error(
                "[SpeechRecognition] Failed to restart after unexpected end:",
                e
              );
              isListening = false;
              currentCallbacks.onStateChange?.("idle");
            }
          }
        }, 100);
      }
    };

    recognition.onstart = () => {
      console.log("[SpeechRecognition] Started");
      isListening = true;
      currentCallbacks.onStateChange?.("listening");
    };
  }

  return recognition;
}

/**
 * Start listening for speech
 */
export function startListening(callbacks: RecognitionCallbacks = {}): boolean {
  const rec = getRecognition();
  if (!rec) {
    console.warn("[SpeechRecognition] Recognition object is null");
    callbacks.onError?.("Speech recognition not supported");
    return false;
  }

  if (isListening) {
    console.log("[SpeechRecognition] Already listening");
    return true;
  }

  currentCallbacks = callbacks;
  shouldContinueListening = true;

  try {
    console.log("[SpeechRecognition] Calling start()...");
    // Abort any previous session to ensure clean state
    try {
      rec.abort();
    } catch (e) {
      // Ignore errors from abort
    }
    rec.start();
    console.log("[SpeechRecognition] start() called successfully");
    return true;
  } catch (error) {
    console.error("[SpeechRecognition] Exception during start():", error);
    isListening = false;
    shouldContinueListening = false;
    callbacks.onError?.(
      error instanceof Error
        ? error.message
        : "Failed to start speech recognition"
    );
    return false;
  }
}

/**
 * Stop listening
 */
export function stopListening(): void {
  shouldContinueListening = false;
  if (recognition && isListening) {
    try {
      recognition.stop();
    } catch (error) {
      console.error("[SpeechRecognition] Failed to stop:", error);
    }
  }
  isListening = false;
}

/**
 * Check if currently listening
 */
export function getIsListening(): boolean {
  return isListening;
}

/**
 * One-shot listen - starts listening and returns a promise that resolves with the final transcript
 */
export function listenOnce(): Promise<string> {
  return new Promise((resolve, reject) => {
    let finalTranscript = "";

    const started = startListening({
      onResult: (result) => {
        if (result.isFinal) {
          finalTranscript = result.transcript;
        }
      },
      onStateChange: (state) => {
        if (state === "idle" && finalTranscript) {
          resolve(finalTranscript);
        }
      },
      onError: (error) => {
        reject(new Error(error));
      },
    });

    if (!started) {
      reject(new Error("Failed to start speech recognition"));
    }
  });
}
 
