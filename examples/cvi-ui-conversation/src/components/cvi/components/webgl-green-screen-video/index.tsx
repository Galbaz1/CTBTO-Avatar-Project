import React, { useRef, useEffect, useCallback } from 'react';
import { useVideoTrack } from '@daily-co/daily-react';

interface WebGLGreenScreenVideoProps {
  sessionId: string;
  className?: string;
  onVideoLoad?: () => void;
  disableGreenScreen?: boolean;
  // Chroma key parameters
  keyColor?: [number, number, number]; // RGB values 0-1
  similarity?: number; // 0-1
  smoothness?: number; // 0-1
  spill?: number; // 0-1
}

// Production-ready WebGL fragment shader (OBS Studio algorithm)
const fragmentShaderSource = `
  precision mediump float;
  uniform sampler2D u_texture;
  uniform vec3 u_keyColor;
  uniform float u_similarity;
  uniform float u_smoothness;
  uniform float u_spill;
  uniform bool u_disableChromaKey;
  varying vec2 v_texCoord;

  // Convert RGB to YUV for accurate chroma key detection (from OBS Studio)
  vec2 RGBtoUV(vec3 rgb) {
    return vec2(
      rgb.r * -0.169 + rgb.g * -0.331 + rgb.b * 0.5 + 0.5,
      rgb.r * 0.5 + rgb.g * -0.419 + rgb.b * -0.081 + 0.5
    );
  }

  void main() {
    vec4 textureColor = texture2D(u_texture, v_texCoord);
    
    // DEBUG: Show raw texture sample
    if (u_disableChromaKey) {
      // For debugging: add some brightness if texture is too dark
      vec3 debugColor = textureColor.rgb;
      if (debugColor.r < 0.01 && debugColor.g < 0.01 && debugColor.b < 0.01) {
        // If texture is black, show red for debugging
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
      } else {
        gl_FragColor = vec4(debugColor, 1.0);
      }
      return;
    }
    
    // OBS STUDIO ALGORITHM (Production quality)
    vec4 rgba = textureColor;
    
    // Calculate chroma distance in YUV space for accuracy
    float chromaDist = distance(RGBtoUV(rgba.rgb), RGBtoUV(u_keyColor));
    
    // Calculate base mask with smooth falloff (not binary)
    float baseMask = chromaDist - u_similarity;
    float fullMask = pow(clamp(baseMask / u_smoothness, 0.0, 1.0), 1.5);
    
    // Advanced spill suppression (removes green reflection from hair/skin)
    float spillVal = pow(clamp(baseMask / u_spill, 0.0, 1.0), 1.5);
    float desaturate = (rgba.r + rgba.g + rgba.b) / 3.0;
    vec3 spillColor = mix(vec3(desaturate), rgba.rgb, 1.0 - spillVal * u_spill);
    
    // Add temporal stability by slightly softening harsh edges
    float edgeSoftness = 0.02; // Small value for stability
    float softMask = smoothstep(0.0, edgeSoftness, fullMask);
    
    gl_FragColor = vec4(spillColor, softMask);
  }
`;

// Vertex shader
const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

export const WebGLGreenScreenVideo: React.FC<WebGLGreenScreenVideoProps> = ({
  sessionId,
  className,
  onVideoLoad,
  disableGreenScreen = false,
  keyColor = [0.0, 0.9, 0.2], // Tavus green screen color
  similarity = 0.4, // Professional OBS setting
  smoothness = 0.08, // Reduced for sharper edges  
  spill = 0.15, // Increased for better spill suppression
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const textureRef = useRef<WebGLTexture | null>(null);
  const animationRef = useRef<number>();
  const isInitializedRef = useRef(false);
  const setupCompleteRef = useRef(false);
  const videoState = useVideoTrack(sessionId);

  // Create shader function with better error handling
  const createShader = useCallback((gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null => {
    const shader = gl.createShader(type);
    if (!shader) {
      return null;
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }, []);

  // Create WebGL program with validation
  const createProgram = useCallback((gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string): WebGLProgram | null => {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

    if (!vertexShader || !fragmentShader) {
      return null;
    }

    const program = gl.createProgram();
    if (!program) {
      return null;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      return null;
    }

    // Clean up shaders after linking
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    return program;
  }, [createShader]);

  // Enhanced WebGL initialization
  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return { success: false, error: 'Canvas not available' };
    }

    const gl = canvas.getContext('webgl');
    if (!gl) {
      return { success: false, error: 'Failed to get WebGL context' };
    }
    glRef.current = gl;

    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    if (!program) {
      return { success: false, error: 'Failed to create shader program' };
    }
    programRef.current = program;

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1.0, -1.0, 0.0, 1.0,
       1.0, -1.0, 1.0, 1.0,
      -1.0,  1.0, 0.0, 0.0,
       1.0,  1.0, 1.0, 0.0,
    ]), gl.STATIC_DRAW);

    const positionAttribLocation = gl.getAttribLocation(program, 'a_position');
    const texCoordAttribLocation = gl.getAttribLocation(program, 'a_texCoord');

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.vertexAttribPointer(positionAttribLocation, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(texCoordAttribLocation);
    gl.vertexAttribPointer(texCoordAttribLocation, 2, gl.FLOAT, false, 16, 8);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    textureRef.current = texture;

    gl.useProgram(program);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    return { success: true };
  }, [createProgram]);

  // Enhanced video readiness check for Daily.co video tracks
  const isVideoReady = useCallback((video: HTMLVideoElement): boolean => {
    // Daily.co video tracks are ready when they have dimensions and data
    // We don't check paused/currentTime as Daily.co live streams behave differently
    const ready = (
      video.readyState >= 2 && // HAVE_CURRENT_DATA or higher
      video.videoWidth > 0 &&
      video.videoHeight > 0 &&
      !video.ended
    );
    
    return ready;
  }, []);

  // Enhanced render frame with proper error handling
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const gl = glRef.current;
    const program = programRef.current;
    const texture = textureRef.current;
    const video = videoRef.current;

    // Ensure all required elements are available
    if (!canvas || !gl || !program || !texture || !video) {
      animationRef.current = requestAnimationFrame(renderFrame);
      return;
    }

    // Check if video is ready for texture updates
    if (!isVideoReady(video)) {
      animationRef.current = requestAnimationFrame(renderFrame);
      return;
    }

    try {
      // Set canvas size to match video (only when needed)
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        gl.viewport(0, 0, video.videoWidth, video.videoHeight);
      }

      // Update texture with video data
      gl.bindTexture(gl.TEXTURE_2D, texture);
      
      // Force video to play if needed
      if (video.readyState >= 2) { // Check if video is at least HAVE_CURRENT_DATA
        video.play().catch(e => {});
      }
      
      // Update texture with video frame
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      } catch (e) {
        if (e instanceof DOMException && e.name === 'InvalidStateError') {
          // Video not ready, skip this frame
          animationRef.current = requestAnimationFrame(renderFrame);
          return;
        }
        throw e;
      }

      // Configure shader uniforms for green screen processing
      gl.useProgram(program);
      
      const textureLocation = gl.getUniformLocation(program, 'u_texture');
      const keyColorLocation = gl.getUniformLocation(program, 'u_keyColor');
      const similarityLocation = gl.getUniformLocation(program, 'u_similarity');
      const smoothnessLocation = gl.getUniformLocation(program, 'u_smoothness');
      const spillLocation = gl.getUniformLocation(program, 'u_spill');
      const disableChromaKeyLocation = gl.getUniformLocation(program, 'u_disableChromaKey');

      // Set uniforms
      gl.uniform1i(textureLocation, 0);
      gl.uniform3fv(keyColorLocation, keyColor);
      gl.uniform1f(similarityLocation, similarity);
      gl.uniform1f(smoothnessLocation, smoothness);
      gl.uniform1f(spillLocation, spill);
      gl.uniform1i(disableChromaKeyLocation, disableGreenScreen);

      // Clear canvas with transparent background
      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Render the quad with green screen effect
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // Continue animation loop
      animationRef.current = requestAnimationFrame(renderFrame);
    } catch (error) {
      // Continue on error
      animationRef.current = requestAnimationFrame(renderFrame);
    }
  }, [keyColor, similarity, smoothness, spill, disableGreenScreen, isVideoReady]);

  // Video setup and initialization
  useEffect(() => {
    const video = videoRef.current;
    if (!videoState.track || !video) {
      return;
    }

    // Prevent multiple setups
    if (setupCompleteRef.current) {
      return;
    }

    // Configure video element for WebGL compatibility
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';
    
    // Create MediaStream from Daily track
    const stream = new MediaStream([videoState.track]);
    video.srcObject = stream;

    const initializeVideo = () => {
      // Check if video is ready for processing
      if (isVideoReady(video)) {
        // Trigger onVideoLoad callback
        if (onVideoLoad) {
          onVideoLoad();
        }
        
        // Initialize WebGL
        const initResult = initWebGL();
        if (initResult.success) {
          isInitializedRef.current = true;
          if (!animationRef.current) {
            // Start render loop
            animationRef.current = requestAnimationFrame(renderFrame);
          }
          setupCompleteRef.current = true;
        }
      } else {
        // Retry after a short delay
        setTimeout(initializeVideo, 50);
      }
    };

    // Start initialization when video can play
    const handleCanPlay = () => {
      initializeVideo();
    };

    video.addEventListener('canplay', handleCanPlay);

    // Cleanup function
    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      setupCompleteRef.current = false;
    };
  }, [videoState.track, renderFrame, onVideoLoad, initWebGL, isVideoReady]);

  return (
    <div className={className} style={{ position: 'relative' }}>
      {/* Hidden video element configured for WebGL */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ display: 'none' }}
      />
      
      {/* WebGL canvas for processed output */}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          backgroundColor: 'transparent',
        }}
      />
    </div>
  );
}; 