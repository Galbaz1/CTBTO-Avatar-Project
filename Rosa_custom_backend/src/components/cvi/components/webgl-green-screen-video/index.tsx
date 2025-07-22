import React, { useRef, useEffect, useCallback } from 'react';
import { useVideoTrack } from '@daily-co/daily-react';

interface WebGLGreenScreenVideoProps {
  sessionId: string;
  className?: string;
  onVideoLoad?: () => void;
  disableGreenScreen?: boolean;
  // Optimized chroma key parameters with smart defaults
  keyColor?: [number, number, number]; // RGB values 0-1
  similarity?: number; // 0-1, higher = more aggressive removal
  smoothness?: number; // 0-1, edge softness
  spill?: number; // 0-1, spill suppression strength
}

// Optimized fragment shader - production quality with better performance
const fragmentShaderSource = `
  precision mediump float;
  uniform sampler2D u_texture;
  uniform vec3 u_keyColor;
  uniform float u_similarity;
  uniform float u_smoothness;
  uniform float u_spill;
  uniform bool u_disableChromaKey;
  varying vec2 v_texCoord;

  // Fast RGB to YUV conversion for chroma keying
  vec2 rgbToUV(vec3 rgb) {
    return vec2(
      rgb.r * -0.169 + rgb.g * -0.331 + rgb.b * 0.5 + 0.5,
      rgb.r * 0.5 + rgb.g * -0.419 + rgb.b * -0.081 + 0.5
    );
  }

  void main() {
    vec4 rgba = texture2D(u_texture, v_texCoord);
    
    // Debug mode - show raw video
    if (u_disableChromaKey) {
      gl_FragColor = vec4(rgba.rgb, 1.0);
      return;
    }
    
    // Fast chroma key calculation
    float chromaDist = distance(rgbToUV(rgba.rgb), rgbToUV(u_keyColor));
    
    // Optimized mask calculation with smooth falloff
    float mask = smoothstep(u_similarity, u_similarity + u_smoothness, chromaDist);
    
    // Spill suppression - reduce green cast on edges
    float spillAmount = 1.0 - smoothstep(u_similarity * 0.5, u_similarity, chromaDist);
    vec3 spillSuppressed = mix(
      vec3((rgba.r + rgba.b) * 0.5), // desaturated
      rgba.rgb,
      1.0 - spillAmount * u_spill
    );
    
    gl_FragColor = vec4(spillSuppressed, mask);
  }
`;

// Simple vertex shader
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
  keyColor = [0.0, 0.9, 0.2], // Optimized for Tavus green
  similarity = 0.45, // Smart default
  smoothness = 0.1, // Smooth edges
  spill = 0.2, // Moderate spill suppression
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const textureRef = useRef<WebGLTexture | null>(null);
  const animationRef = useRef<number>();
  const isInitialized = useRef(false);
  
  const videoState = useVideoTrack(sessionId);

  // Optimized shader creation with error handling
  const createShader = useCallback((gl: WebGLRenderingContext, type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }, []);

  // Fast WebGL initialization
  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const gl = canvas.getContext('webgl', { 
      alpha: true, 
      premultipliedAlpha: false,
      antialias: false // Disable for better performance
    });
    if (!gl) return false;

    glRef.current = gl;

    // Create shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return false;

    // Create program
    const program = gl.createProgram();
    if (!program) return false;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('Program link error:', gl.getProgramInfoLog(program));
      return false;
    }

    programRef.current = program;

    // Create full-screen quad
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 0, 1,
       1, -1, 1, 1,
      -1,  1, 0, 0,
       1,  1, 1, 0,
    ]), gl.STATIC_DRAW);

    // Set up attributes
    const posLocation = gl.getAttribLocation(program, 'a_position');
    const texLocation = gl.getAttribLocation(program, 'a_texCoord');
    
    gl.enableVertexAttribArray(posLocation);
    gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(texLocation);
    gl.vertexAttribPointer(texLocation, 2, gl.FLOAT, false, 16, 8);

    // Create texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    textureRef.current = texture;

    // Set up blending for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(program);

    return true;
  }, [createShader]);

  // Optimized render loop
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const gl = glRef.current;
    const program = programRef.current;
    const texture = textureRef.current;
    const video = videoRef.current;

    if (!canvas || !gl || !program || !texture || !video) {
      animationRef.current = requestAnimationFrame(renderFrame);
      return;
    }

    // Check if video has data
    if (video.readyState < 2 || video.videoWidth === 0) {
      animationRef.current = requestAnimationFrame(renderFrame);
      return;
    }

    try {
      // Resize canvas if needed
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        gl.viewport(0, 0, video.videoWidth, video.videoHeight);
      }

      // Update texture
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

      // Set uniforms
      gl.useProgram(program);
      gl.uniform1i(gl.getUniformLocation(program, 'u_texture'), 0);
      gl.uniform3fv(gl.getUniformLocation(program, 'u_keyColor'), keyColor);
      gl.uniform1f(gl.getUniformLocation(program, 'u_similarity'), similarity);
      gl.uniform1f(gl.getUniformLocation(program, 'u_smoothness'), smoothness);
      gl.uniform1f(gl.getUniformLocation(program, 'u_spill'), spill);
      gl.uniform1i(gl.getUniformLocation(program, 'u_disableChromaKey'), disableGreenScreen);

      // Render
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    } catch (error) {
      // Continue on error
    }

    animationRef.current = requestAnimationFrame(renderFrame);
  }, [keyColor, similarity, smoothness, spill, disableGreenScreen]);

  // Video setup
  useEffect(() => {
    const video = videoRef.current;
    if (!videoState.track || !video || isInitialized.current) return;

    // Set up video stream
    video.srcObject = new MediaStream([videoState.track]);
    video.crossOrigin = 'anonymous';
    video.play().catch(() => {}); // Auto-play, ignore errors

    const handleVideoReady = () => {
      if (video.readyState >= 2 && video.videoWidth > 0) {
        if (initWebGL()) {
          isInitialized.current = true;
          animationRef.current = requestAnimationFrame(renderFrame);
          onVideoLoad?.();
        }
      } else {
        setTimeout(handleVideoReady, 50);
      }
    };

    handleVideoReady();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      isInitialized.current = false;
    };
  }, [videoState.track, initWebGL, renderFrame, onVideoLoad]);

  return (
    <div className={className} style={{ position: 'relative' }}>
      {/* Hidden video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ display: 'none' }}
      />
      
      {/* WebGL canvas output */}
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