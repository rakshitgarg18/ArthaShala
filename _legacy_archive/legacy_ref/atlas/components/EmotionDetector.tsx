import Text from '@/components/FontText';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';

interface EmotionDetectorProps {
  onEmotionDetected?: (emotion: string, confidence: number) => void;
  showUI?: boolean; // Show the full UI with emotion grid and confidence bars
  compact?: boolean; // Hide native overlay/toggle for inline usages
  style?: StyleProp<ViewStyle>;
  isActive?: boolean; // Optional controlled camera state
}

export const EmotionDetector: React.FC<EmotionDetectorProps> = ({
  onEmotionDetected,
  showUI = true,
  compact = false,
  style,
  isActive,
}) => {
  const [detectedEmotion, setDetectedEmotion] = useState<string>('neutral');
  const [confidence, setConfidence] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(isActive ?? true);
  const [error, setError] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isControlled = typeof isActive === 'boolean';

  // Helper to sync the camera state inside the WebView
  const syncCameraState = (enabled: boolean) => {
    if (!webViewRef.current) return;
    const script = enabled
      ? 'window.startCamera && window.startCamera();'
      : 'window.stopCamera && window.stopCamera();';
    webViewRef.current.injectJavaScript(script);
  };

  // Keep internal state in sync when controlled
  React.useEffect(() => {
    if (!isControlled) return;
    setCameraEnabled(isActive ?? false);
  }, [isActive, isControlled]);

  // Apply camera state changes to WebView
  React.useEffect(() => {
    syncCameraState(cameraEnabled);
  }, [cameraEnabled]);

  // Handle messages from WebView
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'emotion') {
        setDetectedEmotion(data.emotion);
        setConfidence(data.confidence);
        if (onEmotionDetected) {
          onEmotionDetected(data.emotion, data.confidence);
        }
      } else if (data.type === 'ready') {
        setIsLoading(false);
        setError(null);
      } else if (data.type === 'error') {
        console.error('WebView error:', data.message);
        setError(data.message);
        setIsLoading(false);
      } else if (data.type === 'camera_stopped') {
        // Camera was successfully stopped
        setDetectedEmotion('neutral');
        setConfidence(0);
      }
    } catch (err) {
      console.error('Failed to parse message from WebView:', err);
    }
  };

  // Toggle camera on/off
  const toggleCamera = () => {
    const nextState = isControlled ? !(isActive ?? false) : !cameraEnabled;

    if (!isControlled) {
      setCameraEnabled(nextState);
    }

    syncCameraState(nextState);
  };

  // Inject JavaScript to control camera
  const injectedJavaScript = `
    (function() {
      window.emotionDetectorReady = true;
    })();
    true;
  `;

  const emotionHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: ${showUI ? '#f5f5f5' : '#000'};
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        #container {
          width: 100%;
          height: 100%;
          max-width: ${showUI ? '500px' : '100%'};
          background: ${showUI ? 'white' : '#000'};
          border-radius: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          margin: 0 auto;
          align-items: ${showUI ? 'stretch' : 'center'};
          justify-content: ${showUI ? 'flex-start' : 'center'};
        }
        #video {
          width: 100%;
          height: ${showUI ? '300px' : '100%'};
          max-width: 100%;
          max-height: 100%;
          object-fit: cover;
          transform: scaleX(-1);
          background: #000;
          display: block;
          flex-shrink: 0;
        }
        #camera-disabled {
          width: 100%;
          height: ${showUI ? '300px' : '100%'};
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: none;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          color: white;
        }
        #camera-disabled .icon {
          font-size: 48px;
          margin-bottom: 0px;
        }
        #camera-disabled .text {
          font-size: 16px;
          opacity: 0.9;
        }
        #canvas {
          display: none;
        }
        .info-panel {
          padding: 20px;
          background: white;
        }
        .emotion-display {
          text-align: center;
          margin-bottom: 15px;
        }
        .emotion-name {
          font-size: 28px;
          font-weight: 600;
          color: #333;
          text-transform: capitalize;
          margin-bottom: 8px;
        }
        .confidence-bar {
          width: 100%;
          height: 8px;
          background: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        .confidence-fill {
          height: 100%;
          background: linear-gradient(90deg, #4CAF50, #45a049);
          transition: width 0.3s ease;
          border-radius: 4px;
        }
        .confidence-text {
          font-size: 12px;
          color: #666;
        }
        .status {
          font-size: 13px;
          color: #999;
          text-align: center;
          padding: 10px;
          background: #f9f9f9;
          border-radius: 6px;
        }
        .emotion-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 15px;
        }
        .emotion-item {
          padding: 10px;
          background: #f5f5f5;
          border-radius: 6px;
          text-align: center;
          font-size: 11px;
        }
        .emotion-item.detected {
          background: #e8f5e9;
          border: 2px solid #4CAF50;
          font-weight: 600;
        }
        .emotion-label {
          color: #666;
          font-size: 10px;
          margin-bottom: 4px;
        }
        .emotion-score {
          color: #333;
          font-size: 12px;
          font-weight: 500;
        }
        #loading {
          padding: 40px;
          text-align: center;
          color: #999;
        }
        .spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #4CAF50;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
          margin: 0 auto 10px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div id="container">
        <video
          id="video"
          muted
          autoplay
          playsinline
          webkit-playsinline
        ></video>
        <div id="camera-disabled">
          <div class="icon">📷</div>
          <div class="text">Camera is disabled</div>
        </div>
        <canvas id="canvas"></canvas>
        <div class="info-panel" style="display: ${showUI ? 'block' : 'none'};">
          <div id="loading">
            <div class="spinner"></div>
            <div>Loading models...</div>
          </div>
          <div id="content" style="display: none;">
            <div class="emotion-display">
              <div class="emotion-name" id="emotionName">neutral</div>
              <div class="confidence-bar">
                <div class="confidence-fill" id="confidenceFill" style="width: 0%;"></div>
              </div>
              <div class="confidence-text">
                Confidence: <span id="confidenceValue">0</span>%
              </div>
            </div>
            <div class="status" id="status">Initializing camera...</div>
            <div class="emotion-grid" id="emotionGrid"></div>
          </div>
        </div>
      </div>

      <script src="https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/dist/face-api.min.js"></script>

      <script>
        let detectionHistory = [];
        const HISTORY_SIZE = 15; // Increased from 5 - more smoothing
        const FPS_INTERVAL = 500; // Slowed to ~2 FPS for less jitter
        const CONFIDENCE_THRESHOLD = 0.75; // Increased from 0.6 - need stronger signal
        let lastDetectionTime = 0;
        let isRunning = false;
        let currentStream = null;
        let animationFrameId = null;
        let lastReportedEmotion = 'neutral'; // Track last reported to avoid spam

        const emotionMap = {
          'happy': 'happy',
          'sad': 'sad',
          'angry': 'angry',
          'fearful': 'fearful',
          'surprised': 'surprised',
          'disgusted': 'disgusted',
          'neutral': 'neutral'
        };

        const emotionColors = {
          'happy': '#FFD700',
          'sad': '#87CEEB',
          'angry': '#FF6B6B',
          'fearful': '#9B59B6',
          'surprised': '#FF8C00',
          'disgusted': '#6B8E23',
          'neutral': '#808080'
        };

        // Post message helper (works in both WebView and browser)
        function postMsg(data) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify(data));
          } else {
            console.log('PostMessage:', data);
          }
        }

        async function initializeModels() {
          try {
            document.getElementById('status').textContent = 'Loading face detection models...';
            await Promise.all([
              faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model/'),
              faceapi.nets.faceExpressionNet.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model/'),
            ]);
            document.getElementById('loading').style.display = 'none';
            document.getElementById('content').style.display = 'block';
            postMsg({ type: 'ready' });
            startCamera();
          } catch (error) {
            console.error('Model loading error:', error);
            document.getElementById('loading').innerHTML = '<div style="color: red;">Failed to load models. Check your internet connection.</div>';
            postMsg({ type: 'error', message: 'Model loading failed: ' + error.message });
          }
        }

        // Global function to start camera (called from React Native)
        window.startCamera = async function() {
          if (isRunning) return;
          
          try {
            const video = document.getElementById('video');
            video.style.display = 'block';
            document.getElementById('camera-disabled').style.display = 'none';
            
            const stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
              audio: false
            });

            currentStream = stream;
            video.srcObject = stream;
            
            video.onloadedmetadata = () => {
              video.play().catch(err => {
                console.error('Autoplay error:', err);
                document.getElementById('status').textContent = 'Camera ready (tap video to start)';
                // Add click handler for autoplay-blocked situations
                video.onclick = () => video.play();
              });
              isRunning = true;
              detectEmotion();
            };
            
            document.getElementById('status').textContent = 'Camera starting...';
          } catch (error) {
            console.error('Camera error:', error);
            let errorMsg = 'Camera access denied';
            if (error.name === 'NotFoundError') {
              errorMsg = 'No camera found on this device';
            } else if (error.name === 'NotAllowedError') {
              errorMsg = 'Camera permission denied. Please allow camera access.';
            } else if (error.name === 'NotReadableError') {
              errorMsg = 'Camera is in use by another application';
            }
            document.getElementById('status').textContent = errorMsg;
            postMsg({ type: 'error', message: errorMsg });
          }
        };

        // Global function to stop camera (called from React Native)
        window.stopCamera = function() {
          isRunning = false;
          
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
          
          if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
            currentStream = null;
          }
          
          const video = document.getElementById('video');
          video.srcObject = null;
          video.style.display = 'none';
          
          document.getElementById('camera-disabled').style.display = 'flex';
          document.getElementById('status').textContent = 'Camera disabled';
          document.getElementById('emotionName').textContent = 'neutral';
          document.getElementById('confidenceFill').style.width = '0%';
          document.getElementById('confidenceValue').textContent = '0';
          
          // Clear detection history
          detectionHistory = [];
          
          postMsg({ type: 'camera_stopped' });
        };

        function getSmoothedEmotion() {
          if (detectionHistory.length === 0) return { emotion: 'neutral', confidence: 0 };

          // Count occurrences of each emotion
          const emotionCounts = {};
          detectionHistory.forEach(detection => {
            emotionCounts[detection.emotion] = (emotionCounts[detection.emotion] || 0) + 1;
          });

          // Find most frequent emotion
          const mostFrequent = Object.entries(emotionCounts).reduce((a, b) =>
            b[1] > a[1] ? b : a
          );

          // Require emotion to appear in at least 60% of recent history to switch
          const minOccurrences = Math.ceil(detectionHistory.length * 0.6);
          const dominantCount = mostFrequent[1];
          
          // If dominant emotion doesn't meet threshold, stick with last reported
          if (dominantCount < minOccurrences && lastReportedEmotion !== 'neutral') {
            const lastEmotionDetections = detectionHistory.filter(d => d.emotion === lastReportedEmotion);
            if (lastEmotionDetections.length > 0) {
              const avgConf = lastEmotionDetections.reduce((sum, d) => sum + d.confidence, 0) / lastEmotionDetections.length;
              return { emotion: lastReportedEmotion, confidence: avgConf };
            }
          }

          // Average confidence for the most frequent emotion
          const relevantDetections = detectionHistory.filter(d => d.emotion === mostFrequent[0]);
          const avgConfidence = relevantDetections.reduce((sum, d) => sum + d.confidence, 0) / relevantDetections.length;
          
          // Update last reported emotion
          lastReportedEmotion = mostFrequent[0];

          return { emotion: mostFrequent[0], confidence: avgConfidence };
        }

        async function detectEmotion() {
          const video = document.getElementById('video');
          const canvas = document.getElementById('canvas');
          const ctx = canvas.getContext('2d');

          // Set canvas size to match video
          if (canvas.width !== video.videoWidth && video.videoWidth > 0) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
          }

          async function detect() {
            // Stop if no longer running
            if (!isRunning) return;
            
            try {
              if (video.paused || !video.srcObject) {
                animationFrameId = requestAnimationFrame(detect);
                return;
              }

              const now = Date.now();
              if (now - lastDetectionTime < FPS_INTERVAL) {
                animationFrameId = requestAnimationFrame(detect);
                return;
              }
              lastDetectionTime = now;

              // Draw video frame to canvas (flipped for mirror effect)
              ctx.save();
              ctx.scale(-1, 1);
              ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
              ctx.restore();

              // Detect faces and expressions
              const detections = await faceapi
                .detectAllFaces(canvas, new faceapi.TinyFaceDetector({ inputSize: 416 }))
                .withFaceExpressions();

              if (detections.length > 0) {
                // Get largest face (most prominent in frame)
                const face = detections.reduce((max, f) => {
                  const maxArea = max.detection.box.width * max.detection.box.height;
                  const fArea = f.detection.box.width * f.detection.box.height;
                  return fArea > maxArea ? f : max;
                });

                const expressions = face.expressions;
                const emotionEntries = Object.entries(expressions)
                  .filter(([key]) => key in emotionMap)
                  .sort(([, a], [, b]) => b - a);

                if (emotionEntries.length > 0) {
                  const [dominantEmotion, rawConfidence] = emotionEntries[0];
                  
                  // Apply confidence threshold - below 0.6 = neutral
                  const finalEmotion = rawConfidence < CONFIDENCE_THRESHOLD ? 'neutral' : dominantEmotion;
                  const finalConfidence = rawConfidence < CONFIDENCE_THRESHOLD ? expressions.neutral : rawConfidence;

                  // Add to history for smoothing
                  detectionHistory.push({ emotion: finalEmotion, confidence: finalConfidence });
                  if (detectionHistory.length > HISTORY_SIZE) {
                    detectionHistory.shift();
                  }

                  // Get smoothed result via majority voting
                  const smoothed = getSmoothedEmotion();

                  // Update WebView UI
                  updateUI(smoothed.emotion, smoothed.confidence, expressions);

                  // Send to React Native
                  postMsg({
                    type: 'emotion',
                    emotion: smoothed.emotion,
                    confidence: Math.round(smoothed.confidence * 100)
                  });
                }
                
                document.getElementById('status').textContent = 'Detecting...';
              } else {
                document.getElementById('status').textContent = 'No face detected - look at camera';
              }
            } catch (error) {
              console.error('Detection error:', error);
              document.getElementById('status').textContent = 'Detection error';
            }

            animationFrameId = requestAnimationFrame(detect);
          }

          detect();
        }

        function updateUI(emotion, confidence, allExpressions) {
          const emotionName = document.getElementById('emotionName');
          const confidenceFill = document.getElementById('confidenceFill');
          const confidenceValue = document.getElementById('confidenceValue');
          const status = document.getElementById('status');
          const emotionGrid = document.getElementById('emotionGrid');

          const confPercent = Math.round(confidence * 100);

          emotionName.textContent = emotion;
          emotionName.style.color = emotionColors[emotion];
          confidenceFill.style.width = confPercent + '%';
          confidenceValue.textContent = confPercent;
          status.textContent = 'Detecting...';

          // Update emotion grid
          emotionGrid.innerHTML = Object.entries(emotionMap).map(([key]) => {
            const value = Math.round((allExpressions[key] || 0) * 100);
            const isDetected = key === emotion;
            return \`
              <div class="emotion-item \${isDetected ? 'detected' : ''}">
                <div class="emotion-label">\${key}</div>
                <div class="emotion-score">\${value}%</div>
              </div>
            \`;
          }).join('');
        }

        // Initialize when page loads
        window.addEventListener('load', initializeModels);
      </script>
    </body>
    </html>
  `;

  return (
    <View style={[styles.container, compact && styles.compactContainer, { backgroundColor: colors.background }, style]}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading emotion detection...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ html: emotionHTML }}
        style={[styles.webview, compact && styles.compactWebview]}
        onMessage={handleMessage}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        useSharedProcessPool={false}
        originWhitelist={['*']}
      />

      {!compact && (
        <View style={[styles.emotionDisplay, { backgroundColor: colors.background }]}>
          <Text style={[styles.emotionLabel, { color: colors.text }]}>Detected Emotion</Text>
          <Text style={[styles.emotionValue, getEmotionColor(detectedEmotion)]}>
            {detectedEmotion.charAt(0).toUpperCase() + detectedEmotion.slice(1)}
          </Text>
          <Text style={[styles.confidenceText, { color: colors.text }]}>
            Confidence: {confidence}%
          </Text>

          <Pressable
            style={[
              styles.toggleButton,
              { backgroundColor: cameraEnabled ? '#ef4444' : colors.tint }
            ]}
            onPress={toggleCamera}
          >
            <Text style={styles.toggleButtonText}>
              {cameraEnabled ? '🎥 Disable Camera' : '📷 Enable Camera'}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

// Helper to get emotion-specific colors
const getEmotionColor = (emotion: string) => {
  const emotionColors: Record<string, object> = {
    happy: { color: Colors.emotions.happy },
    sad: { color: Colors.emotions.sad },
    angry: { color: Colors.emotions.angry },
    fearful: { color: Colors.emotions.fearful },
    surprised: { color: Colors.emotions.surprised },
    disgusted: { color: Colors.emotions.disgusted },
    neutral: { color: Colors.emotions.neutral },
  };
  return emotionColors[emotion] || { color: Colors.emotions.neutral };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  compactContainer: {
    flex: undefined,
    borderRadius: 16,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  compactWebview: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#fecaca',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    textAlign: 'center',
  },
  emotionDisplay: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  emotionLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    opacity: 0.6,
  },
  emotionValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  confidenceText: {
    fontSize: 14,
    marginBottom: 12,
    opacity: 0.7,
  },
  toggleButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  toggleButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});
 
