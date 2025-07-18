import React, { useRef, useEffect, useCallback } from 'react';
import { useVideoTrack } from '@daily-co/daily-react';

interface WebGLGreenScreenVideoProps {
  sessionId: string;
  className?: string;
  onVideoLoad?: () => void;
  debugMode?: boolean;
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
  uniform bool u_showCoordinates;
  varying vec2 v_texCoord;

  // Convert RGB to YUV for accurate chroma key detection (from OBS Studio)
  vec2 RGBtoUV(vec3 rgb) {
    return vec2(
      rgb.r * -0.169 + rgb.g * -0.331 + rgb.b * 0.5 + 0.5,
      rgb.r * 0.5 + rgb.g * -0.419 + rgb.b * -0.081 + 0.5
    );
  }

  void main() {
    // DEBUG: Show texture coordinates as colors for debugging geometry
    if (u_showCoordinates) {
      gl_FragColor = vec4(v_texCoord.x, v_texCoord.y, 0.5, 1.0);
      return;
    }
    
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
  debugMode = false,
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
  const frameCountRef = useRef(0);
  const debugModeRef = useRef(debugMode);
  const disableGreenScreenRef = useRef(disableGreenScreen);
  const setupCompleteRef = useRef(false);
  const videoState = useVideoTrack(sessionId);

  // Update refs when props change
  debugModeRef.current = debugMode;
  disableGreenScreenRef.current = disableGreenScreen;

  // Create shader function with better error handling
  const createShader = useCallback((gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null => {
    const shader = gl.createShader(type);
    if (!shader) {
      console.error('🔴 WebGL: Failed to create shader');
      return null;
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      console.error('🔴 WebGL: Shader compilation error:', info);
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }, []);

  // Create WebGL program with validation
  const createProgram = useCallback((gl: WebGLRenderingContext): WebGLProgram | null => {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) {
      console.error('🔴 WebGL: Failed to create shaders');
      return null;
    }

    const program = gl.createProgram();
    if (!program) {
      console.error('🔴 WebGL: Failed to create program');
      return null;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      console.error('🔴 WebGL: Program linking error:', info);
      gl.deleteProgram(program);
      return null;
    }

    // Clean up shaders after linking
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    console.log('✅ WebGL: Program created and linked successfully');
    return program;
  }, [createShader]);

  // Enhanced WebGL initialization
  const initWebGL = useCallback(() => {
    console.log('🎮 WebGL: initWebGL() started');
    
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('🔴 WebGL: Canvas not available');
      return false;
    }
    console.log('✅ WebGL: Canvas available');

    // Get WebGL context with proper attributes
    console.log('🎮 WebGL: Getting WebGL context...');
    const gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      antialias: false,
    });
    
    if (!gl) {
      console.error('🔴 WebGL: Context not supported');
      return false;
    }
    console.log('✅ WebGL: Context created successfully');

    glRef.current = gl;

    // Create shader program
    console.log('🎮 WebGL: Creating shader program...');
    const program = createProgram(gl);
    if (!program) {
      console.error('🔴 WebGL: Failed to create shader program');
      return false;
    }
    console.log('✅ WebGL: Shader program created');
    programRef.current = program;

    // Set up geometry (full screen quad with correct texture coordinates)
    console.log('🎮 WebGL: Setting up geometry...');
    const positions = new Float32Array([
      -1, -1,  0, 1,  // bottom-left (flipped Y)
       1, -1,  1, 1,  // bottom-right (flipped Y)
      -1,  1,  0, 0,  // top-left (flipped Y)
       1,  1,  1, 0,  // top-right (flipped Y)
    ]);

    const positionBuffer = gl.createBuffer();
    if (!positionBuffer) {
      console.error('🔴 WebGL: Failed to create buffer');
      return false;
    }
    console.log('✅ WebGL: Buffer created');

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // Set up attributes
    console.log('🎮 WebGL: Setting up attributes...');
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');

    if (positionLocation === -1 || texCoordLocation === -1) {
      console.error('🔴 WebGL: Failed to get attribute locations', {
        positionLocation,
        texCoordLocation
      });
      return false;
    }
    console.log('✅ WebGL: Attribute locations found', {
      positionLocation,
      texCoordLocation
    });

    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0);

    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 16, 8);

    // Create and configure texture
    console.log('🎮 WebGL: Creating texture...');
    const texture = gl.createTexture();
    if (!texture) {
      console.error('🔴 WebGL: Failed to create texture');
      return false;
    }
    console.log('✅ WebGL: Texture created');

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    textureRef.current = texture;

    // Set up blending for transparency
    console.log('🎮 WebGL: Setting up blending...');
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    console.log('🎮 WebGL initialized successfully for Rosa green screen processing');
    return true;
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
    const video = videoRef.current;
    const gl = glRef.current;
    const program = programRef.current;
    const texture = textureRef.current;

    if (!canvas || !video || !gl || !program || !texture) {
      animationRef.current = requestAnimationFrame(renderFrame);
      return;
    }

    // Check if video is ready for texture updates (inline for stability)
    const videoReady = (
      video.readyState >= 2 && // HAVE_CURRENT_DATA or higher
      video.videoWidth > 0 &&
      video.videoHeight > 0 &&
      !video.ended
    );
    
    if (!videoReady) {
      animationRef.current = requestAnimationFrame(renderFrame);
      return;
    }

    frameCountRef.current++;

    // Debug frame progression every 30 frames
    if (frameCountRef.current % 30 === 0) {
      console.log(`🎬 WebGL: Frame ${frameCountRef.current} - Processing continues`);
    }

    try {
      // Set canvas size to match video (only when needed)
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        gl.viewport(0, 0, video.videoWidth, video.videoHeight);
        console.log(`🎮 WebGL: Canvas resized to ${video.videoWidth}x${video.videoHeight}`);
      }

      // Update texture with video data
      gl.bindTexture(gl.TEXTURE_2D, texture);
      
      // VISUAL TEST: Render a colored rectangle for first 5 frames to prove WebGL works (reduced for parameter testing)
      if (frameCountRef.current <= 5) {
        gl.clearColor(1.0, 0.0, 1.0, 1.0); // Bright magenta background
        gl.clear(gl.COLOR_BUFFER_BIT);
        console.log(`🎨 WebGL: VISUAL TEST Frame ${frameCountRef.current} - rendering MAGENTA test`);
        
        // Skip video rendering for visual test
        animationRef.current = requestAnimationFrame(renderFrame);
        return;
      }

      // COORDINATE TEST: Frames 6-10 show texture coordinates as colors (reduced for parameter testing)
      if (frameCountRef.current >= 6 && frameCountRef.current <= 10) {
        // Clear and render a gradient based on texture coordinates
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        // Use our shader program, but pass a uniform to show coordinates
        gl.useProgram(program);
        const showCoordinatesLocation = gl.getUniformLocation(program, 'u_showCoordinates');
        if (showCoordinatesLocation) {
          gl.uniform1i(showCoordinatesLocation, true);
        }

        // Log once for coordinate test
        if (frameCountRef.current === 31) {
          console.log('🎨 WebGL: COORDINATE TEST - should show red-green gradient (geometry test)');
        }

        // Draw the quad
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        // Skip normal rendering for coordinate test
        animationRef.current = requestAnimationFrame(renderFrame);
        return;
      }
      
      // Log when we start actual video processing and ensure video is playing
      if (frameCountRef.current === 11) {
        console.log('🌹 WebGL: Starting Rosa video processing with green screen removal');
        console.log('🎬 WebGL: Ensuring video is playing...', {
          paused: video.paused,
          currentTime: video.currentTime,
          readyState: video.readyState
        });
        
        // Force video to play
        video.play().catch(e => console.log('🔴 Video play failed:', e));
      }
      
      // CRITICAL FIX: Wrap texImage2D in try-catch and validate video state
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
        
        // AGGRESSIVE DEBUG: Log texture update success
        if (frameCountRef.current === 11 || frameCountRef.current % 120 === 0) {
          console.log('✅ WebGL: Texture updated successfully', {
            frame: frameCountRef.current,
            videoTime: video.currentTime.toFixed(2),
            textureSize: `${video.videoWidth}x${video.videoHeight}`,
            videoPaused: video.paused,
            videoReadyState: video.readyState
          });
        }
      } catch (error) {
        console.error('🔴 WebGL: texImage2D failed:', error);
        // Continue with previous frame rather than crashing
        animationRef.current = requestAnimationFrame(renderFrame);
        return;
      }

      // Use our shader program
      gl.useProgram(program);

      // Set uniforms with validation
      const keyColorLocation = gl.getUniformLocation(program, 'u_keyColor');
      const similarityLocation = gl.getUniformLocation(program, 'u_similarity');
      const smoothnessLocation = gl.getUniformLocation(program, 'u_smoothness');
      const spillLocation = gl.getUniformLocation(program, 'u_spill');
      const disableLocation = gl.getUniformLocation(program, 'u_disableChromaKey');
      const textureLocation = gl.getUniformLocation(program, 'u_texture');
      const showCoordinatesLocation = gl.getUniformLocation(program, 'u_showCoordinates');

      // AGGRESSIVE DEBUG: Check uniform locations
      if (frameCountRef.current === 31) {
        console.log('🎮 WebGL: Uniform locations', {
          keyColor: keyColorLocation,
          similarity: similarityLocation,
          smoothness: smoothnessLocation,
          spill: spillLocation,
          disable: disableLocation,
          texture: textureLocation,
          showCoordinates: showCoordinatesLocation
        });
      }

      if (keyColorLocation) gl.uniform3fv(keyColorLocation, keyColor);
      if (similarityLocation) gl.uniform1f(similarityLocation, similarity);
      if (smoothnessLocation) gl.uniform1f(smoothnessLocation, smoothness);
      if (spillLocation) gl.uniform1f(spillLocation, spill);
      if (disableLocation) gl.uniform1i(disableLocation, disableGreenScreenRef.current);
      if (textureLocation) gl.uniform1i(textureLocation, 0);
      if (showCoordinatesLocation) gl.uniform1i(showCoordinatesLocation, false); // Default to false for normal rendering

      // Clear with transparent background
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      // AGGRESSIVE DEBUG: Check WebGL errors before drawing
      const errorBeforeDraw = gl.getError();
      if (errorBeforeDraw !== gl.NO_ERROR) {
        console.error('🔴 WebGL: Error before draw:', errorBeforeDraw);
      }
      
      // Draw the quad
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // AGGRESSIVE DEBUG: Check WebGL errors after drawing
      const errorAfterDraw = gl.getError();
      if (errorAfterDraw !== gl.NO_ERROR) {
        console.error('🔴 WebGL: Error after draw:', errorAfterDraw);
      }

      // Debug logging every 60 frames (once per second at 60fps)
      if (debugModeRef.current && frameCountRef.current % 60 === 0) {
        console.log(`🎮 WebGL: Frame ${frameCountRef.current} rendered successfully`, {
          videoTime: video.currentTime.toFixed(2),
          videoSize: `${video.videoWidth}x${video.videoHeight}`,
          canvasSize: `${canvas.width}x${canvas.height}`,
          greenScreen: disableGreenScreen ? 'DISABLED' : 'ENABLED',
          keyColor: keyColor.map(c => Math.round(c * 255)),
          canvasVisible: canvas.offsetWidth > 0 && canvas.offsetHeight > 0,
          canvasStyle: canvas.style.cssText
        });
      }

      // SUPER AGGRESSIVE DEBUG: Log every frame for first 10 frames after magenta test
      if (frameCountRef.current >= 31 && frameCountRef.current <= 40) {
        console.log(`🎮 WebGL: Frame ${frameCountRef.current} debug`, {
          video: {
            currentTime: video.currentTime,
            width: video.videoWidth,
            height: video.videoHeight,
            readyState: video.readyState
          },
          canvas: {
            width: canvas.width,
            height: canvas.height,
            offsetWidth: canvas.offsetWidth,
            offsetHeight: canvas.offsetHeight,
            clientWidth: canvas.clientWidth,
            clientHeight: canvas.clientHeight
          },
          webgl: {
            viewport: gl.getParameter(gl.VIEWPORT),
            clearColor: gl.getParameter(gl.COLOR_CLEAR_VALUE),
            errors: gl.getError()
          }
        });
      }

    } catch (error) {
      console.error('🔴 WebGL: Render frame error:', error);
    }

    // Continue animation
    animationRef.current = requestAnimationFrame(renderFrame);
  }, []);

  // Enhanced video setup with better Daily.co track handling
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoState.track) {
      console.log('🔴 WebGL: Video element or track not available');
      return;
    }

    // AGGRESSIVE PROTECTION: Prevent multiple setups
    if (setupCompleteRef.current) {
      console.log('ℹ️ WebGL: Video setup already complete, skipping');
      return;
    }

    console.log('🎬 WebGL: Setting up video track for green screen processing');
    setupCompleteRef.current = true;

    // CRITICAL: Configure video element for WebGL compatibility
    video.crossOrigin = 'anonymous'; // Required for WebGL texture access
    video.preload = 'metadata';
    
    // Create MediaStream from Daily track
    const stream = new MediaStream([videoState.track]);
    video.srcObject = stream;

    const handleLoadedMetadata = () => {
      console.log('🎥 WebGL: Rosa replica video metadata loaded', {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        duration: video.duration,
        readyState: video.readyState
      });
      onVideoLoad?.();
    };

    const handleCanPlay = () => {
      console.log('🎥 WebGL: Video can play, starting processing');
      
      const startProcessing = () => {        
        const videoReady = (
          video.readyState >= 2 && 
          video.videoWidth > 0 &&
          video.videoHeight > 0 &&
          !video.ended
        );
        
        if (videoReady) {
          console.log('✅ WebGL: Video is ready, attempting initialization...');
          if (!isInitializedRef.current) {
            console.log('🎮 WebGL: Starting initWebGL()...');
            try {
              const initResult = initWebGL();
              console.log('🎮 WebGL: initWebGL() result:', initResult);
              
              if (initResult) {
                isInitializedRef.current = true;
                if (!animationRef.current) {
                  console.log('🚀 WebGL: About to start render loop...');
                  animationRef.current = requestAnimationFrame(renderFrame);
                  console.log('🚀 WebGL: Green screen processing started');
                } else {
                  console.log('ℹ️ WebGL: Render loop already running');
                }
              } else {
                console.error('🔴 WebGL: initWebGL() returned false');
              }
            } catch (error) {
              console.error('🔴 WebGL: initWebGL() threw error:', error);
            }
          } else {
            console.log('ℹ️ WebGL: Already initialized');
          }
        } else {
          // Only retry a few times to avoid infinite loops
          setTimeout(startProcessing, 100); // Longer delay since we removed spammy logs
        }
      };
      
      startProcessing();
    };

    const handlePlay = () => {
      console.log('🎬 WebGL: Video started playing');
    };

    const handleError = (e: Event) => {
      console.error('🔴 WebGL: Video error:', e);
    };

    // Add event listeners
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('play', handlePlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('error', handleError);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      
      // Reset setup flag when video track changes
      setupCompleteRef.current = false;
    };
  }, [videoState.track]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      isInitializedRef.current = false;
    };
  }, []);

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

      {/* Enhanced debug info */}
      {debugMode && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.9)',
          color: 'white',
          padding: '12px',
          borderRadius: '6px',
          fontSize: '11px',
          fontFamily: 'monospace',
          lineHeight: '1.4'
        }}>
          🎮 WebGL Green Screen v2.0<br/>
          Status: {isInitializedRef.current ? '✅ Running' : '⏳ Initializing'}<br/>
          Mode: {disableGreenScreen ? '❌ DISABLED' : '✅ ENABLED'}<br/>
          Frames: {frameCountRef.current}<br/>
          Key Color: rgb({Math.round(keyColor[0]*255)}, {Math.round(keyColor[1]*255)}, {Math.round(keyColor[2]*255)})<br/>
          Similarity: {similarity.toFixed(2)} | Smoothness: {smoothness.toFixed(2)}<br/>
          Video: {videoState.track ? '✅' : '❌'} | Ready: {videoRef.current && isVideoReady(videoRef.current) ? '✅' : '❌'}
        </div>
      )}

      {/* Loading state */}
      {(!videoState.track || videoState.isOff) && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#fff',
          fontSize: '16px',
          textAlign: 'center',
          background: 'rgba(0,0,0,0.8)',
          padding: '20px',
          borderRadius: '8px'
        }}>
          {videoState.isOff ? '📷 Rosa camera is off' : '⏳ Connecting to Rosa...'}
        </div>
      )}

      {/* Status indicator */}
      {disableGreenScreen && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          background: 'orange',
          color: 'black',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          ⚠️ WebGL Green Screen Disabled
        </div>
      )}
    </div>
  );
}; 