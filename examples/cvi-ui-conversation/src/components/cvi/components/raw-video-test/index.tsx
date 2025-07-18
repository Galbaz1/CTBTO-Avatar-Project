import React, { useRef, useEffect } from 'react';
import { useVideoTrack } from '@daily-co/daily-react';

interface RawVideoTestProps {
  sessionId: string;
  className?: string;
}

export const RawVideoTest: React.FC<RawVideoTestProps> = ({
  sessionId,
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoState = useVideoTrack(sessionId);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoState.track) {
      console.log('🔴 Raw Video Test: No video or track available');
      return;
    }

    console.log('🎬 Raw Video Test: Setting up video track');
    
    // Create MediaStream from Daily track
    const stream = new MediaStream([videoState.track]);
    video.srcObject = stream;

    const handleLoadedMetadata = () => {
      console.log('🎬 Raw Video Test: Video loaded', {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        duration: video.duration,
        readyState: video.readyState
      });
    };

    const handleCanPlay = () => {
      console.log('🎬 Raw Video Test: Video can play');
    };

    const handlePlay = () => {
      console.log('🎬 Raw Video Test: Video started playing');
    };

    const handleTimeUpdate = () => {
      console.log('🎬 Raw Video Test: Time update', video.currentTime);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('play', handlePlay);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [videoState.track]);

  return (
    <div className={className} style={{ position: 'relative', background: 'black' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(255, 0, 0, 0.8)',
        color: 'white',
        padding: '8px',
        borderRadius: '4px',
        fontSize: '14px',
        fontFamily: 'monospace',
        fontWeight: 'bold'
      }}>
        🎬 RAW VIDEO TEST
      </div>

      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        Track: {videoState.track ? '✅ Available' : '❌ Missing'}<br/>
        State: {videoState.isOff ? '❌ Off' : '✅ On'}<br/>
        Loading: {videoState.isLoading ? '⏳ Yes' : '✅ No'}
      </div>

      {(!videoState.track || videoState.isOff) && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#fff',
          fontSize: '18px',
          textAlign: 'center',
          background: 'rgba(255, 0, 0, 0.8)',
          padding: '20px',
          borderRadius: '8px',
          fontWeight: 'bold'
        }}>
          {videoState.isOff ? '📷 Rosa Camera is OFF' : '⏳ Waiting for Rosa video track...'}
        </div>
      )}
    </div>
  );
}; 