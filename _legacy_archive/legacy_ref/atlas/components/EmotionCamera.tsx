import Text from '@/components/FontText';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import Colors from '@/constants/Colors';

interface EmotionCameraProps {
  onEmotionDetected?: (emotion: string, confidence: number) => void;
}

/**
 * A minimal camera component that detects emotions.
 * Designed to fill its parent container completely.
 * Use this in constrained spaces like the sentence bar.
 */
export const EmotionCamera: React.FC<EmotionCameraProps> = ({ onEmotionDetected }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);

  // If the WebView never reports ready, show a fallback message
  useEffect(() => {
    const id = setTimeout(() => {
      if (!ready) setTimedOut(true);
    }, 4000);
    return () => clearTimeout(id);
  }, [ready]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'emotion') {
        if (onEmotionDetected) {
          onEmotionDetected(data.emotion, data.confidence);
        }
      } else if (data.type === 'ready') {
        setIsLoading(false);
        setReady(true);
        setError(null);
      } else if (data.type === 'error') {
        setIsLoading(false);
        setReady(false);
        setError(data.message || 'Camera unavailable');
      }
    } catch (err) {
      console.error('EmotionCamera parse error:', err);
    }
  };

  // Minimal HTML - just camera and face detection, no UI
  const cameraHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body {
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #000;
        }
        #video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scaleX(-1);
        }
        #canvas { display: none; }
      </style>
    </head>
    <body>
      <video id="video" autoplay muted playsinline webkit-playsinline></video>
      <canvas id="canvas"></canvas>

      <script src="https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/dist/face-api.min.js"></script>
      <script>
        let detectionHistory = [];
        const HISTORY_SIZE = 15;
        const FPS_INTERVAL = 500;
        const CONFIDENCE_THRESHOLD = 0.75;
        let lastDetectionTime = 0;
        let isRunning = false;
        let currentStream = null;
        let animationFrameId = null;
        let lastReportedEmotion = 'neutral';

        function getSmoothedEmotion(history) {
          if (history.length === 0) return { emotion: 'neutral', confidence: 0 };
          
          const emotionCounts = {};
          let totalConfidence = 0;
          
          history.forEach(entry => {
            emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
            totalConfidence += entry.confidence;
          });
          
          let maxCount = 0;
          let dominantEmotion = 'neutral';
          for (const [emotion, count] of Object.entries(emotionCounts)) {
            if (count > maxCount) {
              maxCount = count;
              dominantEmotion = emotion;
            }
          }
          
          // Require 60% majority to switch emotions
          const threshold = Math.ceil(history.length * 0.6);
          if (maxCount < threshold && lastReportedEmotion !== 'neutral') {
            dominantEmotion = lastReportedEmotion;
          }
          
          const avgConfidence = Math.round(totalConfidence / history.length);
          return { emotion: dominantEmotion, confidence: avgConfidence };
        }

        async function loadModels() {
          const modelUrl = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model';
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl),
            faceapi.nets.faceExpressionNet.loadFromUri(modelUrl)
          ]);
        }

        async function startCamera() {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 320 } }
            });
            currentStream = stream;
            const video = document.getElementById('video');
            video.srcObject = stream;
            await video.play();
            isRunning = true;
            detectEmotions();
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
          } catch (err) {
            console.error('Camera error:', err);
          }
        }

        async function detectEmotions() {
          if (!isRunning) return;
          
          const now = Date.now();
          if (now - lastDetectionTime >= FPS_INTERVAL) {
            lastDetectionTime = now;
            
            const video = document.getElementById('video');
            const detections = await faceapi
              .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
              .withFaceExpressions();
            
            if (detections) {
              const expressions = detections.expressions;
              let maxEmotion = 'neutral';
              let maxScore = 0;
              
              for (const [emotion, score] of Object.entries(expressions)) {
                if (score > maxScore) {
                  maxScore = score;
                  maxEmotion = emotion;
                }
              }
              
              if (maxScore >= CONFIDENCE_THRESHOLD) {
                detectionHistory.push({
                  emotion: maxEmotion,
                  confidence: Math.round(maxScore * 100)
                });
                
                if (detectionHistory.length > HISTORY_SIZE) {
                  detectionHistory.shift();
                }
                
                const smoothed = getSmoothedEmotion(detectionHistory);
                lastReportedEmotion = smoothed.emotion;
                
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'emotion',
                  emotion: smoothed.emotion,
                  confidence: smoothed.confidence
                }));
              }
            }
          }
          
          animationFrameId = requestAnimationFrame(detectEmotions);
        }

        // Initialize
        loadModels().then(startCamera);
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: cameraHTML }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        allowsFullscreenVideo={false}
        originWhitelist={['*']}
        scrollEnabled={false}
        bounces={false}
        mediaCapturePermissionGrantType="grant"
        onLoadEnd={() => {
          // Nudge camera start in case autoplay was blocked
          webViewRef.current?.injectJavaScript('window.startCamera && window.startCamera(); true;');
        }}
      />
      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={Colors.primary.base} />
        </View>
      )}
      {!!error && (
        <View style={styles.error}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      {!ready && timedOut && (
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>Enable camera to detect emotion</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  fallback: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  fallbackText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  error: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  errorText: {
    color: Colors.error ?? '#ff6b6b',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default EmotionCamera;
 
