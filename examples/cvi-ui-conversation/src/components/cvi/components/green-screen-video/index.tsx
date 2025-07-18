import React, { useRef, useEffect } from 'react';
import { useVideoTrack } from '@daily-co/daily-react';
import styles from './green-screen-video.module.css';

interface GreenScreenVideoProps {
  sessionId: string;
  className?: string;
  onVideoLoad?: () => void;
  debugMode?: boolean;
  disableGreenScreen?: boolean;
}

// Green screen detection parameters - tunable for different lighting conditions
const GREEN_SCREEN_THRESHOLD = {
  r: { min: 0, max: 120 },   // Red component range (loosened)
  g: { min: 150, max: 255 }, // Green component range (much broader)
  b: { min: 0, max: 180 },   // Blue component range (loosened)
  tolerance: 35,             // Increased tolerance
};

export const GreenScreenVideo: React.FC<GreenScreenVideoProps> = ({
  sessionId,
  className,
  onVideoLoad,
  debugMode = false,
  disableGreenScreen = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const debugCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const videoState = useVideoTrack(sessionId);
  const frameCountRef = useRef(0);

  // Apply chroma key processing to remove green background
  const processFrame = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video || !video.videoWidth || !video.videoHeight) {
      animationRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Set canvas dimensions to match video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // If green screen is disabled, just show the original video
    if (disableGreenScreen) {
      animationRef.current = requestAnimationFrame(processFrame);
      return;
    }

    // Get pixel data for processing
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    // Debug: Track pixel statistics
    let totalPixels = 0;
    let greenScreenPixels = 0;
    let transparentPixels = 0;
    let colorSamples: Array<{r: number, g: number, b: number}> = [];

    // Process each pixel for green screen removal
    for (let i = 0; i < pixels.length; i += 4) {
      totalPixels++;
      const r = pixels[i];     // Red
      const g = pixels[i + 1]; // Green
      const b = pixels[i + 2]; // Blue

      // Sample colors for debugging (sample every 10,000th pixel)
      if (debugMode && totalPixels % 10000 === 0 && colorSamples.length < 10) {
        colorSamples.push({ r, g, b });
      }

      // Check if pixel matches green screen color (more restrictive)
      const isGreenScreen = 
        r >= GREEN_SCREEN_THRESHOLD.r.min && r <= GREEN_SCREEN_THRESHOLD.r.max &&
        g >= GREEN_SCREEN_THRESHOLD.g.min && g <= GREEN_SCREEN_THRESHOLD.g.max &&
        b >= GREEN_SCREEN_THRESHOLD.b.min && b <= GREEN_SCREEN_THRESHOLD.b.max;

      // Alternative method: Check green dominance with tolerance (more restrictive)
      const greenDominant = 
        g > r + GREEN_SCREEN_THRESHOLD.tolerance && 
        g > b + GREEN_SCREEN_THRESHOLD.tolerance &&
        g > 120; // Lower minimum green intensity for broader detection

      // Third method: Simple green detection (HSV-like approach)
      const isGreenish = g > Math.max(r, b) && g > 100;

      if (isGreenScreen || greenDominant || isGreenish) {
        pixels[i + 3] = 0; // Set alpha to 0 (fully transparent)
        greenScreenPixels++;
        transparentPixels++;
      }
    }

    // Debug logging every 30 frames (~1 second at 30fps)
    frameCountRef.current++;
    if (debugMode && frameCountRef.current % 30 === 0) {
      const greenPercentage = ((greenScreenPixels / totalPixels) * 100).toFixed(1);
      
      // Check if video data is actually being rendered
      const isVideoBlack = colorSamples.length > 0 && colorSamples.every(c => c.r === 0 && c.g === 0 && c.b === 0);
      const hasVideoData = video.currentTime > 0 && !video.paused && !video.ended;
      
      console.log(`🔍 Green Screen Debug [Frame ${frameCountRef.current}]:`, {
        totalPixels: totalPixels.toLocaleString(),
        greenScreenPixels: greenScreenPixels.toLocaleString(),
        transparentPercentage: `${greenPercentage}%`,
        videoStatus: {
          currentTime: video.currentTime.toFixed(2),
          paused: video.paused,
          ended: video.ended,
          readyState: video.readyState,
          hasVideoData: hasVideoData,
          isVideoBlack: isVideoBlack
        },
        thresholds: GREEN_SCREEN_THRESHOLD,
        ...(colorSamples.length > 0 && { 
          colorSamples: colorSamples,
          avgColor: {
            r: Math.round(colorSamples.reduce((sum, c) => sum + c.r, 0) / colorSamples.length),
            g: Math.round(colorSamples.reduce((sum, c) => sum + c.g, 0) / colorSamples.length),
            b: Math.round(colorSamples.reduce((sum, c) => sum + c.b, 0) / colorSamples.length)
          }
        })
      });
      
      // If video is black, show the raw video for debugging
      if (isVideoBlack) {
        console.error('⚠️ Video appears to be completely black! This suggests the Daily.co video track is not providing data.');
      }
    }

    // Apply processed pixel data back to canvas
    ctx.putImageData(imageData, 0, 0);

    // Update debug canvas if in debug mode
    if (debugMode && debugCanvasRef.current) {
      const debugCanvas = debugCanvasRef.current;
      const debugCtx = debugCanvas.getContext('2d');
      if (debugCtx) {
        debugCanvas.width = video.videoWidth;
        debugCanvas.height = video.videoHeight;
        debugCtx.drawImage(video, 0, 0, debugCanvas.width, debugCanvas.height);
      }
    }

    // Continue processing frames
    animationRef.current = requestAnimationFrame(processFrame);
  };

  // Setup video track when available
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoState.track) return;

    // CRITICAL: Configure video element for better Daily.co compatibility
    video.crossOrigin = 'anonymous'; // Required for canvas access
    video.preload = 'metadata';

    // Create MediaStream from Daily track
    const stream = new MediaStream([videoState.track]);
    video.srcObject = stream;

    // Start processing when video metadata loads
    const handleLoadedMetadata = () => {
      console.log('🎥 Rosa replica video loaded, starting green screen processing');
      onVideoLoad?.();
      
      // Wait for video to actually have data before starting processing
      const startProcessing = () => {
        if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
          animationRef.current = requestAnimationFrame(processFrame);
        } else {
          // Try again in a few milliseconds
          setTimeout(startProcessing, 10);
        }
      };
      
      startProcessing();
    };

    const handleCanPlay = () => {
      console.log('🎥 Rosa video can play - dimensions:', video.videoWidth, 'x', video.videoHeight);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [videoState.track, onVideoLoad]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className={`${styles.greenScreenContainer} ${className || ''} ${debugMode ? styles.debugMode : ''}`}>
      {/* Hidden video element for frame source (only hidden when not debugging) */}
      {!debugMode && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={styles.hiddenVideo}
        />
      )}
      
      {/* Debug mode: Show original video alongside processed */}
      {debugMode && (
        <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 100 }}>
          <div style={{ background: 'rgba(0,0,0,0.8)', color: 'white', padding: '8px', borderRadius: '4px', fontSize: '12px' }}>
            Debug Mode | Green Screen: {disableGreenScreen ? 'OFF' : 'ON'}
          </div>
          
          {/* Show actual video element for debugging */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ 
              width: '200px', 
              height: 'auto', 
              border: '2px solid red', 
              marginTop: '5px',
              display: 'block' // Override hidden style for debug
            }}
          />
          <div style={{ background: 'red', color: 'white', padding: '4px', fontSize: '10px', textAlign: 'center' }}>
            Raw Daily.co Video
          </div>
          
          <canvas
            ref={debugCanvasRef}
            className={styles.debugOriginalVideo}
            style={{ width: '200px', height: 'auto', border: '2px solid yellow', marginTop: '5px' }}
          />
          <div style={{ background: 'yellow', color: 'black', padding: '4px', fontSize: '10px', textAlign: 'center' }}>
            Canvas Copy
          </div>
        </div>
      )}
      
      {/* Canvas for processed output with transparent background */}
      <canvas
        ref={canvasRef}
        className={styles.processedCanvas}
        style={{ border: debugMode ? '2px solid lime' : undefined }}
      />

      {debugMode && (
        <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'lime', color: 'black', padding: '4px', fontSize: '10px' }}>
          Processed Video
        </div>
      )}

      {/* Loading state when video is not ready */}
      {(!videoState.track || videoState.isOff) && (
        <div className={styles.loadingState}>
          {videoState.isOff ? 'Rosa camera is off' : 'Connecting to Rosa...'}
        </div>
      )}

      {/* Disable Green Screen Warning */}
      {disableGreenScreen && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'orange', color: 'black', padding: '10px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' }}>
          ⚠️ Green Screen Processing Disabled
        </div>
      )}
    </div>
  );
}; 