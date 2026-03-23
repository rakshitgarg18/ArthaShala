import Text from '@/components/FontText';
import Colors, { radius, spacing, typography } from '@/constants/Colors';
import { searchSymbol } from '@/services/opensymbols';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

// Declare face-api.js types
declare const faceapi: any;

interface EmotionDetectorProps {
  onEmotionDetected?: (emotion: string, confidence: number) => void;
}

// Detection constants - lowered threshold for better detection
const HISTORY_SIZE = 5;
const FPS_INTERVAL = 300; // ~3 FPS for stability
const CONFIDENCE_THRESHOLD = 0.3; // Lowered from 0.6 for better sensitivity

// Emotion names for display and search
const emotionNames: string[] = ['happy', 'sad', 'angry', 'fearful', 'surprised', 'disgusted', 'neutral'];

// Emotion emoji fallbacks
const emotionEmojis: Record<string, string> = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  fearful: '😨',
  surprised: '😲',
  disgusted: '🤢',
  neutral: '😐',
};

// Emotion colors matching app theme
const emotionColors: Record<string, string> = {
  happy: Colors.emotions.happy,
  sad: Colors.emotions.sad,
  angry: Colors.emotions.angry,
  fearful: Colors.emotions.fearful,
  surprised: Colors.emotions.surprised,
  disgusted: Colors.emotions.disgusted,
  neutral: Colors.emotions.neutral,
};

export const EmotionDetector: React.FC<EmotionDetectorProps> = ({ onEmotionDetected }) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [detectedEmotion, setDetectedEmotion] = useState<string>('neutral');
  const [confidence, setConfidence] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allEmotions, setAllEmotions] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<string>('Initializing...');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [emotionImages, setEmotionImages] = useState<Record<string, string>>({});
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastDetectionTimeRef = useRef<number>(0);
  const detectionHistoryRef = useRef<Array<{ emotion: string; confidence: number }>>([]);
  const isRunningRef = useRef<boolean>(false);
  

  // Calculate square camera size based on screen
  const cameraSize = Math.min(windowWidth * 0.4, windowHeight * 0.5, 350);

  // Load emotion images from OpenSymbols
  useEffect(() => {
    const loadEmotionImages = async () => {
      const images: Record<string, string> = {};
      for (const emotion of emotionNames) {
        try {
          const result = await searchSymbol(emotion);
          if (result?.image_url) {
            images[emotion] = result.image_url;
          }
        } catch (err) {
          console.error(`Failed to load image for ${emotion}:`, err);
        }
      }
      setEmotionImages(images);
    };
    loadEmotionImages();
  }, []);

  // Check for multiple cameras
  useEffect(() => {
    const checkCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      } catch (err) {
        console.error('Failed to enumerate devices:', err);
      }
    };
    checkCameras();
  }, []);

  // Speaking disabled per user request

  // Load face-api.js script dynamically
  const loadFaceApiScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (typeof faceapi !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.14/dist/face-api.min.js';
      script.async = true;
      script.onload = () => {
        // Give it a moment to initialize
        setTimeout(resolve, 100);
      };
      script.onerror = () => reject(new Error('Failed to load face-api.js'));
      document.head.appendChild(script);
    });
  }, []);

  // Load face detection models
  const loadModels = useCallback(async () => {
    try {
      setStatus('Loading face detection models...');
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.14/model/';
      
      // Load models sequentially to ensure they're ready
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      
      setModelsLoaded(true);
      setStatus('Models loaded successfully');
      return true;
    } catch (err) {
      console.error('Failed to load models:', err);
      setError('Failed to load face detection models. Check internet connection.');
      return false;
    }
  }, []);

  // Get smoothed emotion via majority voting
  const getSmoothedEmotion = useCallback(() => {
    const history = detectionHistoryRef.current;
    if (history.length === 0) return { emotion: 'neutral', confidence: 0 };

    // Count occurrences of each emotion
    const emotionCounts: Record<string, number> = {};
    history.forEach(detection => {
      emotionCounts[detection.emotion] = (emotionCounts[detection.emotion] || 0) + 1;
    });

    // Find most frequent emotion
    const entries = Object.entries(emotionCounts);
    const mostFrequent = entries.reduce((a, b) => (b[1] > a[1] ? b : a));

    // Average confidence for the most frequent emotion
    const relevantDetections = history.filter(d => d.emotion === mostFrequent[0]);
    const avgConfidence = relevantDetections.reduce((sum, d) => sum + d.confidence, 0) / relevantDetections.length;

    return { emotion: mostFrequent[0], confidence: avgConfidence };
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setStatus('Starting camera...');
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode, 
          width: { ideal: 1280 }, 
          height: { ideal: 720 } 
        },
        audio: false
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play()
                .then(() => {
                  setStatus('Camera ready');
                  resolve();
                })
                .catch(err => {
                  console.error('Autoplay error:', err);
                  setStatus('Click video to start');
                  resolve();
                });
            };
          }
        });
        
        isRunningRef.current = true;
        setIsLoading(false);
        
        // Start detection loop
        runDetectionLoop();
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      let errorMsg = 'Camera access denied';
      if (err.name === 'NotFoundError') {
        errorMsg = 'No camera found on this device';
      } else if (err.name === 'NotAllowedError') {
        errorMsg = 'Camera permission denied. Please allow camera access and refresh.';
      } else if (err.name === 'NotReadableError') {
        errorMsg = 'Camera is in use by another application';
      }
      setError(errorMsg);
      setStatus(errorMsg);
      setIsLoading(false);
    }
  }, [facingMode]);

  // Detection loop - separated from startCamera for clarity
  const runDetectionLoop = useCallback(() => {
    const video = videoRef.current;
    
    if (!video) {
      console.error('Video not available');
      return;
    }

    const detect = async () => {
      if (!isRunningRef.current) return;

      try {
        // Skip if video not ready
        if (video.paused || video.ended || video.readyState < 2) {
          animationFrameRef.current = requestAnimationFrame(detect);
          return;
        }

        // Rate limiting
        const now = Date.now();
        if (now - lastDetectionTimeRef.current < FPS_INTERVAL) {
          animationFrameRef.current = requestAnimationFrame(detect);
          return;
        }
        lastDetectionTimeRef.current = now;

        // Try detection directly from video element (preferred method)
        let detections = null;
        
        try {
          // First try with TinyFaceDetector - use proper options class
          const tinyOptions = new faceapi.TinyFaceDetectorOptions({ 
            inputSize: 416,
            scoreThreshold: 0.3
          });
          detections = await faceapi
            .detectAllFaces(video, tinyOptions)
            .withFaceExpressions();
        } catch (tinyErr) {
          console.log('TinyFaceDetector failed, trying SSD:', tinyErr);
        }
        
        // Fallback to SSD if TinyFaceDetector finds nothing or fails
        if (!detections || detections.length === 0) {
          try {
            const ssdOptions = new faceapi.SsdMobilenetv1Options({
              minConfidence: 0.3
            });
            detections = await faceapi
              .detectAllFaces(video, ssdOptions)
              .withFaceExpressions();
          } catch (ssdErr) {
            console.log('SSD also failed:', ssdErr);
          }
        }

        if (detections && detections.length > 0) {
          setFaceDetected(true);
          // Get the largest/closest face
          const face = detections.reduce((max: any, f: any) => {
            const maxArea = max.detection.box.width * max.detection.box.height;
            const fArea = f.detection.box.width * f.detection.box.height;
            return fArea > maxArea ? f : max;
          });

          const expressions = face.expressions;
          
          // Get all emotions sorted by confidence
          const emotionEntries = Object.entries(expressions)
            .filter(([key]) => key in emotionEmojis)
            .map(([key, value]) => [key, value as number] as [string, number])
            .sort((a, b) => b[1] - a[1]);

          if (emotionEntries.length > 0) {
            const [dominantEmotion, rawConfidence] = emotionEntries[0];
            
            // Use the actual dominant emotion, only fall back to neutral if very low
            const finalEmotion = rawConfidence < CONFIDENCE_THRESHOLD ? 'neutral' : dominantEmotion;
            const finalConfidence = rawConfidence;

            // Add to history for smoothing
            detectionHistoryRef.current.push({ emotion: finalEmotion, confidence: finalConfidence });
            if (detectionHistoryRef.current.length > HISTORY_SIZE) {
              detectionHistoryRef.current.shift();
            }

            // Get smoothed result
            const smoothed = getSmoothedEmotion();

            // Update state
            setDetectedEmotion(smoothed.emotion);
            setConfidence(Math.round(smoothed.confidence * 100));
            setAllEmotions(expressions);
            setStatus('Detecting emotions...');

            // Callback
            if (onEmotionDetected) {
              onEmotionDetected(smoothed.emotion, Math.round(smoothed.confidence * 100));
            }
          }
        } else {
          setFaceDetected(false);
          setStatus('No face detected - look at camera');
        }
      } catch (err) {
        console.error('Detection error:', err);
      }

      animationFrameRef.current = requestAnimationFrame(detect);
    };

    detect();
  }, [getSmoothedEmotion, onEmotionDetected]);

  // Stop camera
  const stopCamera = useCallback(() => {
    isRunningRef.current = false;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    detectionHistoryRef.current = [];
    setDetectedEmotion('neutral');
    setConfidence(0);
    setAllEmotions({});
    setStatus('Camera disabled');
  }, []);

  // Toggle camera
  const toggleCamera = useCallback(() => {
    if (cameraEnabled) {
      stopCamera();
      setCameraEnabled(false);
    } else {
      setCameraEnabled(true);
      startCamera();
    }
  }, [cameraEnabled, startCamera, stopCamera]);

  // Flip camera
  const flipCamera = useCallback(async () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, [stopCamera]);

  // Restart camera when facingMode changes
  useEffect(() => {
    if (cameraEnabled && modelsLoaded) {
      startCamera();
    }
  }, [facingMode]);

  // Auto-disable camera when navigating away from this tab
  useFocusEffect(
    useCallback(() => {
      // Tab is now focused - nothing special needed
      return () => {
        // Tab is losing focus - disable camera
        if (cameraEnabled) {
          stopCamera();
          setCameraEnabled(false);
        }
      };
    }, [cameraEnabled, stopCamera])
  );

  // Auto-disable camera when browser tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && cameraEnabled) {
        stopCamera();
        setCameraEnabled(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [cameraEnabled, stopCamera]);

  // Initialize on mount
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        setStatus('Loading face-api.js...');
        await loadFaceApiScript();
        
        if (!mounted) return;
        
        const loaded = await loadModels();
        
        if (!mounted) return;
        
        if (loaded) {
          await startCamera();
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Initialization error:', err);
        if (mounted) {
          setError('Failed to initialize. Please refresh the page.');
          setIsLoading(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
      stopCamera();
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffd166" />
          <Text style={styles.loadingText}>Loading emotion detection...</Text>
          <Text style={styles.loadingStatus}>{status}</Text>
        </View>
      )}

      {/* Error Banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {/* Main Content - Side by Side Layout */}
      <View style={styles.mainContent}>
        {/* Left: Square Camera View */}
        <View style={[styles.videoContainer, { width: cameraSize, height: cameraSize }]}>
          <video
            ref={videoRef as any}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
              background: '#1f2937',
              display: cameraEnabled ? 'block' : 'none',
              borderRadius: 16,
            }}
            muted
            autoPlay
            playsInline
          />
          <canvas ref={canvasRef as any} style={{ display: 'none' }} />
          
          {!cameraEnabled && (
            <View style={[styles.cameraDisabled, { width: cameraSize, height: cameraSize }]}>
              <Text style={styles.cameraDisabledIcon}>📷</Text>
              <Text style={styles.cameraDisabledText}>Camera Off</Text>
              <Pressable style={styles.enableButton} onPress={toggleCamera}>
                <Text style={styles.enableButtonText}>Enable</Text>
              </Pressable>
            </View>
          )}
          
          {/* Detected Emotion Overlay - Top Right of Camera */}
          {cameraEnabled && !isLoading && confidence > 0 && (
            <View style={styles.emotionOverlay}>
              {emotionImages[detectedEmotion] ? (
                <img src={emotionImages[detectedEmotion]} style={{ width: 40, height: 40, objectFit: 'contain' }} />
              ) : (
                <Text style={styles.emotionOverlayEmoji}>{emotionEmojis[detectedEmotion] || '😐'}</Text>
              )}
              <Text style={styles.emotionOverlayText}>
                {detectedEmotion.charAt(0).toUpperCase() + detectedEmotion.slice(1)}
              </Text>
              <Text style={styles.emotionOverlayConfidence}>{confidence}%</Text>
            </View>
          )}

          {/* Camera Controls - Bottom Corner */}
          {cameraEnabled && (
            <View style={styles.cameraControls}>
              {hasMultipleCameras && (
                <Pressable style={styles.controlButton} onPress={flipCamera}>
                  <Text style={styles.controlButtonText}>🔄</Text>
                </Pressable>
              )}
              <Pressable style={[styles.controlButton, styles.disableButton]} onPress={toggleCamera}>
                <Text style={styles.controlButtonText}>✕</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Right: Emotion Sliders - Horizontal Bars */}
        <View style={styles.emotionContainer}>
          {emotionNames.map((emotion) => {
            const value = allEmotions[emotion] || 0;
            const percentage = Math.round(value * 100);
            const isActive = emotion === detectedEmotion && faceDetected;
            const displayLabel = emotion.charAt(0).toUpperCase() + emotion.slice(1);
            return (
              <View 
                key={emotion} 
                style={[
                  styles.emotionRow,
                  isActive && styles.emotionRowActive
                ]}
              >
                {/* Emotion Image or Emoji */}
                <View style={styles.emotionIconContainer}>
                  {emotionImages[emotion] ? (
                    <img src={emotionImages[emotion]} style={{ width: 28, height: 28, objectFit: 'contain' }} />
                  ) : (
                    <Text style={styles.emotionItemEmoji}>{emotionEmojis[emotion]}</Text>
                  )}
                </View>

                {/* Emotion Label */}
                <Text style={[styles.emotionLabel, isActive && styles.emotionLabelActive]}>
                  {displayLabel}
                </Text>
                
                {/* Horizontal Bar */}
                <View style={styles.emotionBarContainer}>
                  <View 
                    style={[
                      styles.emotionBar, 
                      { 
                        width: `${percentage}%`,
                        backgroundColor: emotionColors[emotion] || '#94a3b8'
                      }
                    ]} 
                  />
                </View>
                
                {/* Percentage */}
                <Text style={[styles.emotionItemValue, isActive && styles.emotionItemValueActive]}>
                  {percentage}%
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    padding: spacing.md,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.lg,
  },
  videoContainer: {
    backgroundColor: Colors.neutral[800],
    position: 'relative',
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  cameraDisabled: {
    backgroundColor: Colors.secondary.base,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.lg,
  },
  cameraDisabledIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  cameraDisabledText: {
    color: 'white',
    fontSize: typography.sizes.lg,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  enableButton: {
    backgroundColor: Colors.primary.base,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  enableButtonText: {
    color: 'white',
    fontSize: typography.sizes.md,
    fontWeight: '800',
  },
  emotionOverlay: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emotionOverlayEmoji: {
    fontSize: 32,
  },
  emotionOverlayText: {
    fontSize: typography.sizes.xs,
    fontWeight: '800',
    color: Colors.neutral[800],
    marginTop: spacing.xs,
    textTransform: 'capitalize',
  },
  emotionOverlayConfidence: {
    fontSize: typography.sizes.xs,
    color: Colors.neutral[500],
    fontWeight: '600',
  },
  cameraControls: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  disableButton: {
    backgroundColor: Colors.error,
  },
  controlButtonText: {
    fontSize: typography.sizes.lg,
    color: Colors.neutral[800],
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 249, 245, 0.95)',
    zIndex: 10,
  },
  loadingText: {
    marginTop: spacing.lg,
    fontSize: typography.sizes.lg,
    fontWeight: '800',
    color: Colors.neutral[800],
  },
  loadingStatus: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.sm,
    color: Colors.neutral[500],
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: Colors.error,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    fontWeight: '600',
  },
  emotionContainer: {
    flex: 1,
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
  },
  emotionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: '#fff',
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: spacing.xs,
  },
  emotionRowActive: {
    backgroundColor: Colors.background.highlight,
    borderColor: Colors.primary.base,
  },
  emotionIconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  emotionItemEmoji: {
    fontSize: 20,
  },
  emotionLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: Colors.neutral[500],
    width: 70,
    marginRight: spacing.sm,
  },
  emotionLabelActive: {
    color: Colors.neutral[800],
    fontWeight: '800',
  },
  emotionBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: Colors.neutral[200],
    borderRadius: 5,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  emotionBar: {
    height: '100%',
    borderRadius: 5,
  },
  emotionItemValue: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: Colors.neutral[500],
    width: 36,
    textAlign: 'right',
  },
  emotionItemValueActive: {
    color: Colors.neutral[800],
    fontWeight: '800',
  },
});
 
