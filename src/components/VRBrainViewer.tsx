import React, { useState, useEffect, useRef } from 'react';
import { 
  Eye, 
  Glasses, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Info, 
  Layers, 
  Sparkles, 
  Activity, 
  AlertTriangle,
  ChevronRight,
  Maximize2,
  Volume2
} from 'lucide-react';
import { BrainAnatomyHotspot } from '../types';
import { BRAIN_HOTSPOTS } from '../data/mockData';

interface VRBrainViewerProps {
  selectedHotspotId?: string;
  onSelectHotspot?: (hotspot: BrainAnatomyHotspot) => void;
}

export const VRBrainViewer: React.FC<VRBrainViewerProps> = ({
  selectedHotspotId,
  onSelectHotspot
}) => {
  const [activeHotspot, setActiveHotspot] = useState<BrainAnatomyHotspot>(
    BRAIN_HOTSPOTS.find(h => h.id === selectedHotspotId) || BRAIN_HOTSPOTS[0]
  );
  const [isVRMode, setIsVRMode] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'3d-volume' | 'mri-axial' | 'mri-sagittal' | 'mri-coronal'>('3d-volume');
  const [rotationX, setRotationX] = useState<number>(15);
  const [rotationY, setRotationY] = useState<number>(45);
  const [zoom, setZoom] = useState<number>(1);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [mriSliceIndex, setMriSliceIndex] = useState<number>(50);
  const [showWireframe, setShowWireframe] = useState<boolean>(true);
  const [contrastLevel, setContrastLevel] = useState<number>(100);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasVRLeftRef = useRef<HTMLCanvasElement | null>(null);
  const canvasVRRightRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Synchronize incoming selectedHotspotId
  useEffect(() => {
    if (selectedHotspotId) {
      const match = BRAIN_HOTSPOTS.find(h => h.id === selectedHotspotId);
      if (match) {
        setActiveHotspot(match);
      }
    }
  }, [selectedHotspotId]);

  // Auto-rotation loop
  useEffect(() => {
    let animationFrameId: number;
    if (autoRotate && viewMode === '3d-volume') {
      const loop = () => {
        setRotationY(prev => (prev + 0.3) % 360);
        animationFrameId = requestAnimationFrame(loop);
      };
      animationFrameId = requestAnimationFrame(loop);
    }
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [autoRotate, viewMode]);

  // Render 3D brain on canvas
  const render3DBrain = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    stereoOffset: number = 0
  ) => {
    ctx.clearRect(0, 0, width, height);

    // Deep space / clinical neuro dark backdrop
    const grad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width * 0.7);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Grid coordinates
    ctx.strokeStyle = 'rgba(30, 58, 138, 0.2)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const radX = (rotationX * Math.PI) / 180;
    const radY = ((rotationY + stereoOffset) * Math.PI) / 180;
    const cosX = Math.cos(radX);
    const sinX = Math.sin(radX);
    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);

    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) * 0.28 * zoom;

    // Mathematical points representing major brain structures & lobes
    // Generating lobes: Left Hemisphere, Right Hemisphere, Cerebellum, Brainstem
    interface Point3D {
      x: number;
      y: number;
      z: number;
      lobe: string;
      color: string;
    }

    const points: Point3D[] = [];

    // Hemispheres geometry
    for (let u = -1; u <= 1; u += 0.18) {
      for (let v = 0; v < Math.PI; v += 0.25) {
        for (let phi = 0; phi < Math.PI * 2; phi += 0.4) {
          const side = u >= 0 ? 1 : -1;
          const separation = side * 0.12;

          // Anatomical brain shape deformation
          const baseR = 1.0;
          const frontalProtrusion = Math.max(0, Math.sin(phi)) * 0.25;
          const temporalIndent = (Math.cos(phi * 2) > 0.4 && v > 1.2) ? -0.18 : 0.05;
          const r = (baseR + frontalProtrusion + temporalIndent) * Math.sin(v);

          const px = r * Math.cos(phi) * 0.85 + separation;
          const py = r * Math.sin(phi) * 0.95;
          const pz = Math.cos(v) * 0.85;

          // Classify lobe & color
          let lobeName = 'Frontal Lobe';
          let color = '#38bdf8'; // Sky blue

          if (py < -0.2 && pz > 0.0) {
            lobeName = 'Parietal Lobe';
            color = '#818cf8'; // Indigo
          } else if (py < -0.5) {
            lobeName = 'Occipital Lobe';
            color = '#a855f7'; // Purple
          } else if (pz < -0.2 && py >= -0.3 && py <= 0.4) {
            lobeName = 'Temporal Lobe';
            color = '#34d399'; // Emerald
          }

          points.push({ x: px, y: py, z: pz, lobe: lobeName, color });
        }
      }
    }

    // Cerebellum points
    for (let angle = 0; angle < Math.PI * 2; angle += 0.35) {
      for (let cr = 0.2; cr < 0.6; cr += 0.15) {
        points.push({
          x: Math.cos(angle) * cr * 1.1,
          y: -0.65 + Math.sin(angle) * cr * 0.7,
          z: -0.45 - (cr * 0.3),
          lobe: 'Cerebellum',
          color: '#06b6d4' // Cyan
        });
      }
    }

    // Brainstem points
    for (let stemZ = -0.3; stemZ >= -0.85; stemZ -= 0.1) {
      for (let sAngle = 0; sAngle < Math.PI * 2; sAngle += 0.7) {
        const stemR = 0.16 + (stemZ + 0.3) * 0.05;
        points.push({
          x: Math.cos(sAngle) * stemR,
          y: -0.25 + Math.sin(sAngle) * stemR * 0.7,
          z: stemZ,
          lobe: 'Brainstem',
          color: '#10b981' // Green
        });
      }
    }

    // 3D Projection function
    const project = (x: number, y: number, z: number) => {
      // Rotation around Y
      const x1 = x * cosY - y * sinY;
      const y1 = x * sinY + y * cosY;
      const z1 = z;

      // Rotation around X
      const x2 = x1;
      const y2 = y1 * cosX - z1 * sinX;
      const z2 = y1 * sinX + z1 * cosX;

      // Perspective projection
      const cameraDistance = 3.5;
      const perspective = cameraDistance / (cameraDistance - y2);

      return {
        screenX: centerX + x2 * scale * perspective,
        screenY: centerY - z2 * scale * perspective,
        depth: y2,
        perspective
      };
    };

    // Sort points from back to front for proper painter's algorithm
    const projectedPoints = points.map(p => {
      const proj = project(p.x, p.y, p.z);
      return { ...p, ...proj };
    }).sort((a, b) => a.depth - b.depth);

    // Draw structural neural connections / wireframe
    if (showWireframe) {
      ctx.lineWidth = 0.6;
      for (let i = 0; i < projectedPoints.length; i += 6) {
        const p1 = projectedPoints[i];
        const nextIdx = (i + 1) % projectedPoints.length;
        const p2 = projectedPoints[nextIdx];
        const dist = Math.hypot(p1.screenX - p2.screenX, p1.screenY - p2.screenY);
        if (dist < 45) {
          ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0.05, 0.25 + p1.depth * 0.15)})`;
          ctx.beginPath();
          ctx.moveTo(p1.screenX, p1.screenY);
          ctx.lineTo(p2.screenX, p2.screenY);
          ctx.stroke();
        }
      }
    }

    // Draw point cloud neural nodes
    projectedPoints.forEach(p => {
      const alpha = Math.min(1, Math.max(0.2, (p.depth + 1.2) * 0.45));
      const radius = Math.max(1, 2.2 * p.perspective);

      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.screenX, p.screenY, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;

    // Project and render interactive Hotspots
    BRAIN_HOTSPOTS.forEach(hs => {
      const proj = project(hs.coordinates.x, hs.coordinates.y, hs.coordinates.z);
      const isSelected = hs.id === activeHotspot.id;

      // Glow halo
      const pulse = Math.sin(Date.now() / 250) * 4;
      const outerRadius = (isSelected ? 14 : 9) + pulse;

      ctx.beginPath();
      ctx.arc(proj.screenX, proj.screenY, outerRadius, 0, Math.PI * 2);
      ctx.fillStyle = hs.color;
      ctx.globalAlpha = isSelected ? 0.35 : 0.18;
      ctx.fill();

      // Solid core
      ctx.beginPath();
      ctx.arc(proj.screenX, proj.screenY, isSelected ? 7 : 4.5, 0, Math.PI * 2);
      ctx.fillStyle = hs.color;
      ctx.globalAlpha = 1.0;
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label callout if selected or hovering
      if (isSelected && !isVRMode) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'left';
        
        // Background badge
        const text = hs.name;
        const textWidth = ctx.measureText(text).width;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = hs.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(proj.screenX + 12, proj.screenY - 14, textWidth + 16, 24, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.fillText(text, proj.screenX + 20, proj.screenY + 2);
      }
    });

    // Crosshair target in center for VR mode
    if (isVRMode) {
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
      ctx.moveTo(centerX - 14, centerY);
      ctx.lineTo(centerX + 14, centerY);
      ctx.moveTo(centerX, centerY - 14);
      ctx.lineTo(centerX, centerY + 14);
      ctx.stroke();
    }
  };

  // Render MRI slice simulation
  const renderMRISlice = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    // Deep black medical diagnostic backdrop
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const size = Math.min(width, height) * 0.75;
    const sliceFactor = mriSliceIndex / 100; // 0 to 1

    // Draw simulated 32-Slice CT Brain Tomography slice
    // Outer skull cortical contour
    ctx.save();
    ctx.translate(centerX, centerY);

    // Brain tissue contour (elliptical with sulcal convolutions)
    const tissueWidth = (size * 0.42) * (0.8 + Math.sin(sliceFactor * Math.PI) * 0.25);
    const tissueHeight = (size * 0.48) * (0.8 + Math.sin(sliceFactor * Math.PI) * 0.25);

    // Gradient representing gray-white matter junction
    const tissueGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, tissueWidth);
    tissueGrad.addColorStop(0, `rgb(${30 * contrastLevel / 100}, ${35 * contrastLevel / 100}, ${40 * contrastLevel / 100})`);
    tissueGrad.addColorStop(0.5, `rgb(${80 * contrastLevel / 100}, ${85 * contrastLevel / 100}, ${95 * contrastLevel / 100})`);
    tissueGrad.addColorStop(0.85, `rgb(${130 * contrastLevel / 100}, ${135 * contrastLevel / 100}, ${145 * contrastLevel / 100})`);
    tissueGrad.addColorStop(1, '#000000');

    ctx.fillStyle = tissueGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, tissueWidth, tissueHeight, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ventricles (CSF - dark on T1, bright or dark on FLAIR)
    const ventWidth = 14 + (sliceFactor > 0.4 && sliceFactor < 0.7 ? 20 : 6);
    const ventHeight = 35 + (sliceFactor > 0.4 && sliceFactor < 0.7 ? 25 : 8);

    ctx.fillStyle = '#050505';
    // Left lateral ventricle
    ctx.beginPath();
    ctx.ellipse(-ventWidth * 0.9, -5, ventWidth * 0.5, ventHeight * 0.6, -0.2, 0, Math.PI * 2);
    ctx.fill();
    // Right lateral ventricle
    ctx.beginPath();
    ctx.ellipse(ventWidth * 0.9, -5, ventWidth * 0.5, ventHeight * 0.6, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Interhemispheric fissure line
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -tissueHeight);
    ctx.lineTo(0, tissueHeight);
    ctx.stroke();

    // Simulated Pathology Infarct / Hyperintensity corresponding to active hotspot
    if (activeHotspot.id === 'hs-mca') {
      // Acute MCA restricted diffusion / bright signal on DWI
      const mcaGrad = ctx.createRadialGradient(-tissueWidth * 0.55, -tissueHeight * 0.15, 2, -tissueWidth * 0.55, -tissueHeight * 0.15, 34);
      mcaGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      mcaGrad.addColorStop(0.6, 'rgba(239, 68, 68, 0.8)');
      mcaGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = mcaGrad;
      ctx.beginPath();
      ctx.arc(-tissueWidth * 0.55, -tissueHeight * 0.15, 32, 0, Math.PI * 2);
      ctx.fill();

      // Clinical pointer
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(-tissueWidth * 0.55, -tissueHeight * 0.15, 36, 0, Math.PI * 2);
      ctx.stroke();
    } else if (activeHotspot.id === 'hs-temporal') {
      // Mesial temporal hyperintensity
      const tempGrad = ctx.createRadialGradient(-tissueWidth * 0.4, tissueHeight * 0.25, 2, -tissueWidth * 0.4, tissueHeight * 0.25, 24);
      tempGrad.addColorStop(0, 'rgba(168, 85, 247, 0.9)');
      tempGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = tempGrad;
      ctx.beginPath();
      ctx.arc(-tissueWidth * 0.4, tissueHeight * 0.25, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // DICOM Diagnostic Annotation HUD
    ctx.fillStyle = '#38bdf8';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('SOPAN NEURO INSTITUTE - 32-SLICE HIGH-RESOLUTION CT SCAN', 16, 24);
    ctx.fillText(`PLANE: ${viewMode.toUpperCase().replace('MRI-', '').replace('CT-', '')} | SLICE: ${mriSliceIndex}/100`, 16, 40);
    ctx.fillText('KVp: 120 | mAs: 280 | MATRIX: 512x512', 16, 56);
    ctx.fillText(`WINDOW / CONTRAST: STROKE PERFUSION (${contrastLevel}%)`, 16, 72);

    ctx.textAlign = 'right';
    ctx.fillText('MODALITY: 32-SLICE HELICAL CT SCANNER', width - 16, 24);
    ctx.fillText('COLLIMATION: 32 x 0.6mm | PITCH: 1.2', width - 16, 40);
    ctx.fillText(`TARGET LOBE: ${activeHotspot.lobe.toUpperCase()}`, width - 16, 56);

    // Anatomical orientation markers
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('A (Anterior)', centerX, 24);
    ctx.fillText('P (Posterior)', centerX, height - 12);
    ctx.fillText('R', 24, centerY);
    ctx.fillText('L', width - 24, centerY);
  };

  // Render loop triggers
  useEffect(() => {
    if (isVRMode) {
      // Dual canvas stereoscopic view
      if (canvasVRLeftRef.current && canvasVRRightRef.current) {
        const leftCtx = canvasVRLeftRef.current.getContext('2d');
        const rightCtx = canvasVRRightRef.current.getContext('2d');
        if (leftCtx && rightCtx) {
          const w = canvasVRLeftRef.current.width;
          const h = canvasVRLeftRef.current.height;
          render3DBrain(leftCtx, w, h, -3.2); // Left eye parallax
          render3DBrain(rightCtx, w, h, +3.2); // Right eye parallax
        }
      }
    } else {
      // Single main canvas
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          const w = canvasRef.current.width;
          const h = canvasRef.current.height;
          if (viewMode === '3d-volume') {
            render3DBrain(ctx, w, h, 0);
          } else {
            renderMRISlice(ctx, w, h);
          }
        }
      }
    }
  }, [rotationX, rotationY, zoom, activeHotspot, isVRMode, viewMode, mriSliceIndex, showWireframe, contrastLevel]);

  // Handle mouse drag interaction
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    setAutoRotate(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastMousePosRef.current.x;
    const deltaY = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    setRotationY(prev => prev + deltaX * 0.6);
    setRotationX(prev => Math.max(-80, Math.min(80, prev - deltaY * 0.6)));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setAutoRotate(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - lastMousePosRef.current.x;
    const deltaY = e.touches[0].clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

    setRotationY(prev => prev + deltaX * 0.6);
    setRotationX(prev => Math.max(-80, Math.min(80, prev - deltaY * 0.6)));
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  const selectHotspot = (hs: BrainAnatomyHotspot) => {
    setActiveHotspot(hs);
    if (onSelectHotspot) onSelectHotspot(hs);
  };

  return (
    <div className="bg-white border border-[#E5DAC8] rounded-3xl overflow-hidden shadow-sm text-[#27231E]">
      {/* Header bar */}
      <div className="bg-[#FAF7F2] px-5 py-4 border-b border-[#E5DAC8] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF0DE] border border-[#ECD3B9] flex items-center justify-center text-[#8E5B3E] shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-lg text-[#221B14]">Interactive 3D / VR Neuro-Radiology Explorer</h3>
              <span className="bg-[#FAF0DE] text-[#8E5B3E] text-xs px-2.5 py-0.5 rounded-full font-semibold border border-[#ECD3B9]">
                32-Slice CT & 3D Volume Suite
              </span>
            </div>
            <p className="text-xs text-[#6B6254]">
              High-resolution helical 32-slice CT cross-sections, acute stroke perfusion mapping & stereoscopic view
            </p>
          </div>
        </div>

        {/* View mode selectors */}
        <div className="flex items-center gap-2">
          <button
            id="btn-3d-volume"
            onClick={() => { setViewMode('3d-volume'); setIsVRMode(false); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs ${
              viewMode === '3d-volume' && !isVRMode
                ? 'bg-[#8E5B3E] text-white'
                : 'bg-white hover:bg-[#FAF6F0] text-[#5C5346] border border-[#DACFBF]'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            3D Volume Model
          </button>

          <button
            id="btn-mri-axial"
            onClick={() => { setViewMode('mri-axial'); setIsVRMode(false); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs ${
              viewMode === 'mri-axial' && !isVRMode
                ? 'bg-[#8E5B3E] text-white'
                : 'bg-white hover:bg-[#FAF6F0] text-[#5C5346] border border-[#DACFBF]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            32-Slice CT Axial
          </button>

          <button
            id="btn-vr-toggle"
            onClick={() => {
              setIsVRMode(!isVRMode);
              if (!isVRMode) setViewMode('3d-volume');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs ${
              isVRMode
                ? 'bg-[#456254] text-white shadow-md'
                : 'bg-white hover:bg-[#FAF6F0] text-[#456254] border border-[#C5D6CC]'
            }`}
          >
            <Glasses className="w-3.5 h-3.5" />
            {isVRMode ? 'Exit VR Headset Mode' : 'Stereoscopic VR Mode'}
          </button>
        </div>
      </div>

      {/* Main interactive stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Canvas stage: 8 columns */}
        <div className="lg:col-span-8 relative bg-black flex items-center justify-center min-h-[420px] select-none">
          {isVRMode ? (
            /* Side-by-side Stereoscopic VR mode */
            <div className="w-full h-full grid grid-cols-2 gap-1 bg-black p-2">
              <div className="relative border-r border-slate-800 flex flex-col items-center">
                <canvas
                  ref={canvasVRLeftRef}
                  width={400}
                  height={420}
                  className="w-full h-auto max-h-[420px] rounded-lg cursor-grab active:cursor-grabbing"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                />
                <span className="absolute bottom-3 left-4 text-[10px] font-mono tracking-widest text-cyan-400 bg-slate-900/80 px-2 py-0.5 rounded">
                  LEFT OCULAR
                </span>
              </div>
              <div className="relative flex flex-col items-center">
                <canvas
                  ref={canvasVRRightRef}
                  width={400}
                  height={420}
                  className="w-full h-auto max-h-[420px] rounded-lg cursor-grab active:cursor-grabbing"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                />
                <span className="absolute bottom-3 right-4 text-[10px] font-mono tracking-widest text-cyan-400 bg-slate-900/80 px-2 py-0.5 rounded">
                  RIGHT OCULAR (PARALLAX +3.2°)
                </span>
              </div>
            </div>
          ) : (
            /* Single view 3D or MRI */
            <canvas
              ref={canvasRef}
              width={720}
              height={460}
              className="w-full h-auto max-h-[460px] cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
          )}

          {/* Canvas Floating Controls */}
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-[#FAF7F2]/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#E5DAC8] shadow-md text-xs text-[#4F473B]">
            {viewMode === '3d-volume' ? (
              <>
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`px-2 py-1 rounded-lg transition-colors ${
                    autoRotate ? 'bg-[#FAF0DE] text-[#8E5B3E] font-semibold' : 'text-[#6B6254] hover:text-[#221B14]'
                  }`}
                  title="Toggle Auto Rotation"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
                </button>
                <div className="h-4 w-[1px] bg-[#DACFBF] mx-1" />
                <button
                  onClick={() => setZoom(prev => Math.min(1.8, prev + 0.15))}
                  className="p-1 hover:bg-[#EFE9DF] rounded text-[#6B6254] hover:text-[#221B14]"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoom(prev => Math.max(0.6, prev - 0.15))}
                  className="p-1 hover:bg-[#EFE9DF] rounded text-[#6B6254] hover:text-[#221B14]"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <div className="h-4 w-[1px] bg-[#DACFBF] mx-1" />
                <button
                  onClick={() => setShowWireframe(!showWireframe)}
                  className={`px-2 py-1 rounded transition-colors text-[11px] font-medium ${
                    showWireframe ? 'text-[#8E5B3E] bg-[#FAF0DE]' : 'text-[#6B6254] hover:text-[#221B14]'
                  }`}
                >
                  Wireframe
                </button>
                <button
                  onClick={() => { setRotationX(15); setRotationY(45); setZoom(1); }}
                  className="px-2 py-1 rounded text-[#6B6254] hover:text-[#221B14] text-[11px]"
                >
                  Reset
                </button>
              </>
            ) : (
              /* CT Slice controls */
              <div className="flex items-center gap-3 py-0.5">
                <span className="text-[11px] text-[#6B6254] font-mono font-semibold">32-SLICE CT:</span>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={mriSliceIndex}
                  onChange={e => setMriSliceIndex(Number(e.target.value))}
                  className="w-32 h-1.5 bg-[#DACFBF] rounded-lg appearance-none cursor-pointer accent-[#8E5B3E]"
                />
                <span className="text-[11px] text-[#8E5B3E] font-mono font-bold w-6">{mriSliceIndex}</span>

                <div className="h-4 w-[1px] bg-[#DACFBF] mx-1" />

                <span className="text-[11px] text-[#6B6254] font-mono font-semibold">WINDOW:</span>
                <input
                  type="range"
                  min={50}
                  max={150}
                  value={contrastLevel}
                  onChange={e => setContrastLevel(Number(e.target.value))}
                  className="w-24 h-1.5 bg-[#DACFBF] rounded-lg appearance-none cursor-pointer accent-[#8E5B3E]"
                />
              </div>
            )}
          </div>

          {/* Quick instructions badge */}
          <div className="absolute top-3 left-4 pointer-events-none text-[11px] text-[#383025] bg-[#FAF7F2]/90 backdrop-blur-sm px-2.5 py-1 rounded-md border border-[#E5DAC8] shadow-xs">
            {isVRMode 
              ? 'VR Headset Active: Use cardboard goggles or drag for stereo orbit'
              : viewMode === '3d-volume'
              ? 'Click & drag to rotate 3D brain • Select anatomical hotspots on right'
              : '32-Slice High-Resolution CT cross-section active'}
          </div>
        </div>

        {/* Hotspots and clinical intelligence: 4 columns in warm & bright theme */}
        <div className="lg:col-span-4 bg-[#FAF7F2] border-t lg:border-t-0 lg:border-l border-[#E5DAC8] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8E5B3E] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Pathology Hotspots
              </span>
              <span className="text-[11px] text-[#6B6254] font-mono font-medium">5 Anatomical Targets</span>
            </div>

            {/* List of hotspots */}
            <div className="space-y-2 mb-4">
              {BRAIN_HOTSPOTS.map(hs => {
                const isSelected = hs.id === activeHotspot.id;
                return (
                  <button
                    key={hs.id}
                    id={`hotspot-${hs.id}`}
                    onClick={() => selectHotspot(hs)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all border flex items-start justify-between gap-2 shadow-xs ${
                      isSelected
                        ? 'bg-white border-[#8E5B3E] shadow-sm text-[#221B14]'
                        : 'bg-white/70 border-[#E8DFD1] hover:bg-white text-[#5C5346]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span 
                        className="w-3 h-3 rounded-full mt-1 shrink-0 ring-2 ring-[#FAF7F2]" 
                        style={{ backgroundColor: hs.color }}
                      />
                      <div>
                        <div className="text-xs font-bold text-[#221B14] leading-snug">{hs.name}</div>
                        <div className="text-[11px] text-[#6B6254]">{hs.lobe}</div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 mt-0.5 shrink-0 transition-transform ${isSelected ? 'text-[#8E5B3E] translate-x-0.5' : 'text-[#8E8577]'}`} />
                  </button>
                );
              })}
            </div>

            {/* Selected Hotspot Detailed Diagnostic Card */}
            <div className="bg-white border border-[#E5DAC8] rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#F0E8DC] pb-2">
                <span className="text-xs font-bold text-[#221B14] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeHotspot.color }} />
                  {activeHotspot.lobe}
                </span>
                <span className="text-[10px] bg-[#FAF0DE] px-2 py-0.5 rounded text-[#8E5B3E] font-mono font-semibold">
                  Target: {activeHotspot.id.replace('hs-', '').toUpperCase()}
                </span>
              </div>

              <p className="text-xs text-[#52493D] leading-relaxed">
                {activeHotspot.description}
              </p>

              <div>
                <span className="text-[11px] font-bold text-[#6B6254] uppercase tracking-wide block mb-1">
                  Associated Clinical Conditions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeHotspot.pathologies.map((p, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] bg-[#FAF7F2] border border-[#E5DAC8] px-2 py-0.5 rounded-md text-[#8E5B3E] font-medium"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD1] text-[11px] space-y-1">
                <div className="text-[#8E5B3E] font-semibold">32-Slice CT Radiological Correlate:</div>
                <div className="text-[#5C5346] italic">{activeHotspot.imagingSign}</div>
              </div>

              <div className="text-[11px] text-[#4F473B] border-l-2 border-[#456254] pl-2.5 py-0.5">
                <span className="text-[#456254] font-bold block">Sopan Protocol:</span>
                {activeHotspot.clinicalRole}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E5DAC8] flex items-center justify-between text-xs text-[#787063]">
            <span>Stereoscopic VR Ready</span>
            <span className="text-[#8E5B3E] font-medium">Sopan Neuro-Imaging Core</span>
          </div>
        </div>
      </div>
    </div>
  );
};
