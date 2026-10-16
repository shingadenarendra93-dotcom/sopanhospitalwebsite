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
  ChevronLeft,
  Tag,
  Maximize2,
  Volume2
} from 'lucide-react';
import { BrainAnatomyHotspot } from '../types';
import { BRAIN_HOTSPOTS } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

interface VRBrainViewerProps {
  selectedHotspotId?: string;
  onSelectHotspot?: (hotspot: BrainAnatomyHotspot) => void;
}

export const VRBrainViewer: React.FC<VRBrainViewerProps> = ({
  selectedHotspotId,
  onSelectHotspot
}) => {
  const { language } = useLanguage();
  const isMr = language === 'mr';
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
  const [showAnatomyLabels, setShowAnatomyLabels] = useState<boolean>(true);
  const [ctDisplayMode, setCtDisplayMode] = useState<'split' | 'single'>('split');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasVRLeftRef = useRef<HTMLCanvasElement | null>(null);
  const canvasVRRightRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Mouse wheel scroll handler for 32-slice CT axial navigation (1 to 100)
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (viewMode === 'mri-axial') {
      const delta = e.deltaY > 0 ? 1 : -1;
      setMriSliceIndex(prev => Math.max(1, Math.min(100, prev + delta)));
    }
  };

  // Native non-passive wheel listener to prevent parent page scroll while scrolling CT slices
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onNativeWheel = (e: WheelEvent) => {
      if (viewMode === 'mri-axial') {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 1 : -1;
        setMriSliceIndex(prev => Math.max(1, Math.min(100, prev + delta)));
      }
    };

    canvas.addEventListener('wheel', onNativeWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', onNativeWheel);
    };
  }, [viewMode]);

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

  // Render real grayscale 32-Slice CT Axial Head Scan with reference video split layout & dynamic labels
  const renderMRISlice = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    // Deep black medical diagnostic backdrop (DICOM standard)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    const s = Math.max(1, Math.min(100, mriSliceIndex));
    const t = (s - 1) / 99; // 0 (Skull Base) to 1 (Vertex)
    const contrast = Math.max(0.5, Math.min(1.5, contrastLevel / 100));

    // Dynamic anatomical taxonomy matching clinical neuro-radiology & reference video
    const getSliceAnatomy = (slice: number) => {
      if (slice <= 7) {
        return {
          levelName: 'Maxillofacial, Sinuses & C1 Canal',
          zPos: `-${(45 - (slice - 1) * 0.9).toFixed(1)} mm`,
          structures: ['Globe', 'Turbinate', 'Maxillary Sinus', 'Nasal Cavity', 'C1 dense / Spinal cord', 'Mastoid Air Cells', 'Occipital Bone'],
          pointers: [
            { name: 'Globe', rx: -0.48, ry: -0.66, side: 'left' as const, color: '#38bdf8' },
            { name: 'Globe', rx: 0.48, ry: -0.66, side: 'right' as const, color: '#38bdf8' },
            { name: 'Turbinate', rx: 0.16, ry: -0.60, side: 'right' as const, color: '#f59e0b' },
            { name: 'Maxillary Sinus', rx: -0.38, ry: -0.42, side: 'left' as const, color: '#06b6d4' },
            { name: 'Nasal Cavity', rx: 0.0, ry: -0.52, side: 'right' as const, color: '#10b981' },
            { name: 'C1 dense / Spinal cord', rx: 0.0, ry: 0.15, side: 'left' as const, color: '#e2e8f0' },
            { name: 'Mastoid Air Cells', rx: 0.64, ry: 0.20, side: 'right' as const, color: '#a855f7' },
            { name: 'Occipital Bone', rx: 0.0, ry: 0.74, side: 'right' as const, color: '#f97316' }
          ]
        };
      } else if (slice <= 14) {
        return {
          levelName: 'Orbits, Skull Base & Medulla',
          zPos: `-${(38 - (slice - 8) * 0.9).toFixed(1)} mm`,
          structures: ['Globe', 'Orbit', 'Optic Nerve', 'Ethmoid Sinus', 'Sphenoid Sinus', 'Temporal Lobe', 'Medulla Oblongata', 'Cerebellum'],
          pointers: [
            { name: 'Globe', rx: -0.46, ry: -0.66, side: 'left' as const, color: '#38bdf8' },
            { name: 'Orbit', rx: -0.58, ry: -0.58, side: 'left' as const, color: '#f97316' },
            { name: 'Optic Nerve', rx: 0.44, ry: -0.58, side: 'right' as const, color: '#38bdf8' },
            { name: 'Ethmoid Sinus', rx: 0.0, ry: -0.62, side: 'right' as const, color: '#06b6d4' },
            { name: 'Sphenoid Sinus', rx: 0.0, ry: -0.30, side: 'left' as const, color: '#10b981' },
            { name: 'Temporal Lobe', rx: -0.60, ry: -0.06, side: 'left' as const, color: '#f59e0b' },
            { name: 'Medulla Oblongata', rx: 0.0, ry: 0.12, side: 'right' as const, color: '#e2e8f0' },
            { name: 'Cerebellum', rx: -0.38, ry: 0.42, side: 'left' as const, color: '#14b8a6' },
            { name: 'Foramen Magnum', rx: 0.0, ry: 0.38, side: 'right' as const, color: '#f97316' },
            { name: 'Mastoid Air Cells', rx: 0.65, ry: 0.18, side: 'right' as const, color: '#a855f7' }
          ]
        };
      } else if (slice <= 35) {
        return {
          levelName: 'Midbrain, Suprasellar & Posterior Fossa',
          zPos: `-${(32 - (slice - 15) * 0.85).toFixed(1)} mm`,
          structures: ['Frontal Bone', 'Frontal Lobe', 'Sella', 'Suprasellar Cistern', 'Sylvian Fissure', 'Temporal Lobe', 'Midbrain', 'Fourth Ventricle', 'Cerebellum'],
          pointers: [
            { name: 'Frontal Bone', rx: 0.0, ry: -0.80, side: 'left' as const, color: '#f97316' },
            { name: 'Frontal Lobe', rx: -0.32, ry: -0.52, side: 'left' as const, color: '#f59e0b' },
            { name: 'Sella', rx: 0.0, ry: -0.32, side: 'left' as const, color: '#06b6d4' },
            { name: 'Suprasellar Cistern', rx: 0.35, ry: -0.22, side: 'right' as const, color: '#38bdf8' },
            { name: 'Sylvian Fissure', rx: -0.66, ry: -0.20, side: 'left' as const, color: '#06b6d4' },
            { name: 'Temporal Bone', rx: -0.72, ry: 0.02, side: 'left' as const, color: '#f97316' },
            { name: 'Temporal Lobe', rx: 0.62, ry: -0.05, side: 'right' as const, color: '#f59e0b' },
            { name: 'Midbrain', rx: 0.0, ry: 0.02, side: 'right' as const, color: '#a855f7' },
            { name: 'Fourth Ventricle', rx: 0.35, ry: 0.22, side: 'right' as const, color: '#38bdf8' },
            { name: 'Cerebellum', rx: -0.35, ry: 0.44, side: 'left' as const, color: '#14b8a6' },
            { name: 'Occipital Bone', rx: 0.0, ry: 0.78, side: 'right' as const, color: '#f97316' }
          ]
        };
      } else if (slice <= 62) {
        return {
          levelName: 'Basal Ganglia, 3rd Ventricle & Sylvian Fissures',
          zPos: `${(-15 + (slice - 36) * 1.1).toFixed(1)} mm`,
          structures: ['Superior Sagittal Sinus', 'Frontal Lobe', 'Lateral Ventricle (Anterior Horn)', 'Third Ventricle', 'Sylvian Fissure', 'Caudate', 'Internal Capsule', 'Putamen', 'Thalamus', 'Cerebellum'],
          pointers: [
            { name: 'Superior Sagittal Sinus', rx: 0.0, ry: -0.80, side: 'right' as const, color: '#38bdf8' },
            { name: 'Frontal Lobe', rx: -0.36, ry: -0.52, side: 'left' as const, color: '#f59e0b' },
            { name: 'Lateral Ventricle (Anterior Horn)', rx: 0.22, ry: -0.30, side: 'right' as const, color: '#38bdf8' },
            { name: 'Third Ventricle', rx: 0.35, ry: 0.04, side: 'right' as const, color: '#38bdf8' },
            { name: 'Sylvian Fissure', rx: -0.70, ry: -0.16, side: 'left' as const, color: '#06b6d4' },
            { name: 'Caudate', rx: 0.28, ry: -0.18, side: 'right' as const, color: '#a855f7' },
            { name: 'Internal Capsule', rx: -0.34, ry: -0.06, side: 'left' as const, color: '#60a5fa' },
            { name: 'Putamen', rx: 0.44, ry: -0.04, side: 'right' as const, color: '#c084fc' },
            { name: 'Thalamus', rx: 0.22, ry: 0.16, side: 'right' as const, color: '#a855f7' },
            { name: 'Temporal Lobe', rx: -0.62, ry: 0.12, side: 'left' as const, color: '#f59e0b' },
            { name: 'Quadrigeminal Cistern', rx: 0.40, ry: 0.34, side: 'right' as const, color: '#38bdf8' },
            { name: 'Cerebellum', rx: -0.30, ry: 0.46, side: 'left' as const, color: '#14b8a6' },
            { name: 'Occipital Bone', rx: 0.0, ry: 0.76, side: 'right' as const, color: '#f97316' }
          ]
        };
      } else if (slice <= 82) {
        return {
          levelName: 'Bodies of Lateral Ventricles & Corpus Callosum',
          zPos: `+${(12 + (slice - 63) * 1.15).toFixed(1)} mm`,
          structures: ['Superior Sagittal Sinus', 'Frontal Bone', 'Frontal Lobe', 'Corpus Callosum', 'Lateral Ventricle (Body)', 'Choroid Plexus', 'Occipital Lobe'],
          pointers: [
            { name: 'Superior Sagittal Sinus', rx: 0.0, ry: -0.80, side: 'left' as const, color: '#38bdf8' },
            { name: 'Frontal Bone', rx: 0.28, ry: -0.76, side: 'right' as const, color: '#f97316' },
            { name: 'Frontal Lobe', rx: -0.42, ry: -0.48, side: 'left' as const, color: '#f59e0b' },
            { name: 'Corpus Callosum', rx: 0.22, ry: -0.38, side: 'right' as const, color: '#38bdf8' },
            { name: 'Lateral Ventricle (Body)', rx: 0.30, ry: -0.02, side: 'right' as const, color: '#38bdf8' },
            { name: 'Choroid Plexus', rx: 0.34, ry: 0.22, side: 'right' as const, color: '#ef4444' },
            { name: 'Occipital Lobe', rx: -0.38, ry: 0.50, side: 'left' as const, color: '#f59e0b' },
            { name: 'Occipital Bone', rx: 0.0, ry: 0.76, side: 'right' as const, color: '#f97316' }
          ]
        };
      } else {
        return {
          levelName: 'Centrum Semiovale & High Convexity Vertex',
          zPos: `+${(35 + (slice - 83) * 0.95).toFixed(1)} mm`,
          structures: ['Superior Sagittal Sinus', 'Frontal Bone', 'Frontal Lobe', 'Centrum Semiovale', 'Falx Cerebri', 'Motor Cortex', 'Parietal Lobe'],
          pointers: [
            { name: 'Superior Sagittal Sinus', rx: 0.0, ry: -0.78, side: 'left' as const, color: '#38bdf8' },
            { name: 'Frontal Bone', rx: 0.28, ry: -0.74, side: 'right' as const, color: '#f97316' },
            { name: 'Frontal Lobe', rx: -0.42, ry: -0.44, side: 'left' as const, color: '#f59e0b' },
            { name: 'Centrum Semiovale', rx: -0.28, ry: -0.05, side: 'left' as const, color: '#60a5fa' },
            { name: 'Falx Cerebri', rx: 0.0, ry: -0.24, side: 'right' as const, color: '#e2e8f0' },
            { name: 'Motor Cortex (Precentral)', rx: -0.52, ry: -0.16, side: 'left' as const, color: '#a855f7' },
            { name: 'Parietal Lobe', rx: 0.48, ry: 0.16, side: 'right' as const, color: '#f59e0b' },
            { name: 'Occipital Lobe', rx: 0.34, ry: 0.52, side: 'right' as const, color: '#f59e0b' }
          ]
        };
      }
    };

    const anatomyInfo = getSliceAnatomy(s);

    // 1. Draw Reference Video Header Bar
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Head and spine anatomy', 16, 22);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Axial CT head', 16, 40);

    // Divider line across the top
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(16, 48);
    ctx.lineTo(width - 16, 48);
    ctx.stroke();

    // 2. Mini Sagittal Scout CT Locator (Top Center, exactly matching video)
    const scoutX = width / 2;
    const scoutY = 26;
    const scoutW = 46;
    const scoutH = 42;

    ctx.save();
    // Scout bounding box
    ctx.fillStyle = '#050811';
    ctx.fillRect(scoutX - scoutW / 2, scoutY - scoutH / 2 + 10, scoutW, scoutH);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(scoutX - scoutW / 2, scoutY - scoutH / 2 + 10, scoutW, scoutH);

    // Silhouette of human sagittal head
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    // Calvarium vault
    ctx.moveTo(scoutX + 16, scoutY + 28); // cervical spine
    ctx.lineTo(scoutX + 16, scoutY + 20); // occiput
    ctx.bezierCurveTo(scoutX + 18, scoutY + 2, scoutX + 14, scoutY - 8, scoutX, scoutY - 9); // vertex
    ctx.bezierCurveTo(scoutX - 12, scoutY - 8, scoutX - 16, scoutY, scoutX - 16, scoutY + 6); // forehead
    ctx.lineTo(scoutX - 18, scoutY + 12); // nose bridge
    ctx.lineTo(scoutX - 14, scoutY + 18); // maxilla
    ctx.lineTo(scoutX - 10, scoutY + 24); // mandible
    ctx.lineTo(scoutX - 6, scoutY + 28); // anterior neck
    ctx.stroke();

    // Horizontal cyan scout cut plane line moving with slice
    const cutY = scoutY + 24 - t * 30;
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(scoutX - scoutW / 2 + 3, cutY);
    ctx.lineTo(scoutX + scoutW / 2 - 3, cutY);
    ctx.stroke();

    // Triangular cut plane markers
    ctx.fillStyle = '#00e5ff';
    ctx.beginPath();
    ctx.moveTo(scoutX - scoutW / 2 + 1, cutY);
    ctx.lineTo(scoutX - scoutW / 2 + 5, cutY - 2.5);
    ctx.lineTo(scoutX - scoutW / 2 + 5, cutY + 2.5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Top Right Info
    ctx.textAlign = 'right';
    ctx.font = '10px "SFMono-Regular", Consolas, monospace';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`LEVEL: ${anatomyInfo.levelName.toUpperCase()}`, width - 16, 22);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`AXIAL SLICE: ${s} / 100 | Z: ${anatomyInfo.zPos}`, width - 16, 36);

    // 3. Reusable Head CT Slice Drawer
    const drawCTSlice = (
      cx: number,
      cy: number,
      radiusScale: number,
      isAnnotatedView: boolean,
      labelTitle: string
    ) => {
      // Dynamic head dimensions evolving from skull base to vertex
      const baseRadius = radiusScale;
      let sliceScale = 0.86;
      if (t < 0.20) {
        sliceScale = 0.80 + t * 0.45;
      } else if (t < 0.75) {
        sliceScale = 0.89 + (t - 0.20) * 0.12;
      } else {
        sliceScale = 0.98 - (t - 0.75) * 0.46;
      }

      const rx = baseRadius * 0.78 * sliceScale;
      const ry = baseRadius * 0.95 * sliceScale;

      ctx.save();

      // Scalp soft-tissue subcutaneous rim
      ctx.fillStyle = '#2a2a2a';
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx + 6, ry + 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Calvarium (Dense Skull Bone: Outer table, diploe, inner table)
      // Outer cortical table (bright hyperdense bone ~1000 HU)
      ctx.fillStyle = '#f0f0f0';
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      // Diploic cancellous space (marrow cavity)
      ctx.fillStyle = '#737373';
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx - 2.6, ry - 2.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Inner cortical table (dense white bone)
      ctx.fillStyle = '#e5e5e5';
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx - 5.2, ry - 5.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Subdural / Subarachnoid CSF space (hypodense near-black)
      ctx.fillStyle = '#0d0d0d';
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx - 7.2, ry - 7.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Brain Parenchyma
      const trx = rx - 8.5;
      const try_ = ry - 8.5;

      // Gray-White matter differentiation gradient
      const wmVal = Math.min(255, Math.floor(66 * contrast));
      const gmVal = Math.min(255, Math.floor(92 * contrast));
      const brainGrad = ctx.createRadialGradient(cx, cy, 8, cx, cy, trx);
      brainGrad.addColorStop(0, `rgb(${wmVal}, ${wmVal}, ${wmVal})`);
      brainGrad.addColorStop(0.68, `rgb(${wmVal}, ${wmVal}, ${wmVal})`);
      brainGrad.addColorStop(0.88, `rgb(${gmVal}, ${gmVal}, ${gmVal})`);
      brainGrad.addColorStop(1, `rgb(${Math.floor(gmVal * 0.7)}, ${Math.floor(gmVal * 0.7)}, ${Math.floor(gmVal * 0.7)})`);

      ctx.fillStyle = brainGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, trx, try_, 0, 0, Math.PI * 2);
      ctx.fill();

      // Internal structures by level
      if (s <= 14) {
        // Skull Base & Orbits
        const orbitRx = trx * 0.22;
        const orbitRy = try_ * 0.16;
        const leftOrbitX = cx - trx * 0.46;
        const rightOrbitX = cx + trx * 0.46;
        const orbitY = cy - try_ * 0.66;

        // Retrobulbar fat (hypodense)
        ctx.fillStyle = '#171717';
        ctx.beginPath();
        ctx.ellipse(leftOrbitX, orbitY, orbitRx, orbitRy, -0.1, 0, Math.PI * 2);
        ctx.ellipse(rightOrbitX, orbitY, orbitRx, orbitRy, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Eyeballs (Globes with vitreous humor)
        ctx.fillStyle = '#080808';
        ctx.strokeStyle = '#5a5a5a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(leftOrbitX, orbitY - 4, 10, 0, Math.PI * 2);
        ctx.arc(rightOrbitX, orbitY - 4, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Optic nerves
        ctx.strokeStyle = '#4e4e4e';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(leftOrbitX, orbitY + 2);
        ctx.lineTo(cx - 8, cy - try_ * 0.28);
        ctx.moveTo(rightOrbitX, orbitY + 2);
        ctx.lineTo(cx + 8, cy - try_ * 0.28);
        ctx.stroke();

        // Sinuses: Maxillary (at s <= 7) or Ethmoid/Sphenoid (s > 7)
        if (s <= 7) {
          // Maxillary Sinuses
          ctx.fillStyle = '#000000';
          ctx.fillRect(cx - trx * 0.44, cy - try_ * 0.44, trx * 0.26, try_ * 0.20);
          ctx.fillRect(cx + trx * 0.18, cy - try_ * 0.44, trx * 0.26, try_ * 0.20);
          ctx.strokeStyle = '#d4d4d4';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(cx - trx * 0.44, cy - try_ * 0.44, trx * 0.26, try_ * 0.20);
          ctx.strokeRect(cx + trx * 0.18, cy - try_ * 0.44, trx * 0.26, try_ * 0.20);

          // Nasal cavity & turbinates in midline
          ctx.fillStyle = '#000000';
          ctx.fillRect(cx - 6, cy - try_ * 0.58, 12, try_ * 0.28);
          ctx.strokeStyle = '#c4c4c4';
          ctx.strokeRect(cx - 6, cy - try_ * 0.58, 12, try_ * 0.28);
        } else {
          // Ethmoid air cells (midline honeycomb)
          ctx.fillStyle = '#000000';
          ctx.fillRect(cx - 12, cy - try_ * 0.72, 24, 20);
          ctx.strokeStyle = '#d4d4d4';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(cx - 12, cy - try_ * 0.72, 24, 20);

          // Sphenoid sinus
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.ellipse(cx, cy - try_ * 0.32, 12, 9, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#cccccc';
          ctx.stroke();
        }

        // Mastoid air cells & Petrous bones
        const mastoidY = cy + try_ * 0.18;
        ctx.fillStyle = '#dedede';
        ctx.beginPath();
        ctx.moveTo(cx - trx * 0.80, mastoidY - 12);
        ctx.lineTo(cx - trx * 0.35, mastoidY + 6);
        ctx.lineTo(cx - trx * 0.75, mastoidY + 24);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + trx * 0.80, mastoidY - 12);
        ctx.lineTo(cx + trx * 0.35, mastoidY + 6);
        ctx.lineTo(cx + trx * 0.75, mastoidY + 24);
        ctx.closePath();
        ctx.fill();

        // Mastoid dark spongy cells
        ctx.fillStyle = '#080808';
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(cx - trx * 0.65 + (i % 2) * 7, mastoidY + i * 6, 2.5, 0, Math.PI * 2);
          ctx.arc(cx + trx * 0.65 - (i % 2) * 7, mastoidY + i * 6, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Brainstem (Pons / Medulla / C1)
        ctx.fillStyle = `rgb(${Math.floor(74 * contrast)}, ${Math.floor(74 * contrast)}, ${Math.floor(74 * contrast)})`;
        ctx.beginPath();
        ctx.ellipse(cx, cy + try_ * 0.08, 15, 13, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cerebellum
        ctx.fillStyle = `rgb(${Math.floor(82 * contrast)}, ${Math.floor(82 * contrast)}, ${Math.floor(82 * contrast)})`;
        ctx.beginPath();
        ctx.ellipse(cx - trx * 0.38, cy + try_ * 0.40, trx * 0.32, try_ * 0.30, -0.15, 0, Math.PI * 2);
        ctx.ellipse(cx + trx * 0.38, cy + try_ * 0.40, trx * 0.32, try_ * 0.30, 0.15, 0, Math.PI * 2);
        ctx.fill();
      } else if (s <= 35) {
        // Midbrain & Suprasellar
        // Suprasellar Cistern (star-shaped)
        ctx.fillStyle = '#050505';
        ctx.beginPath();
        const cY = cy - try_ * 0.22;
        ctx.moveTo(cx, cY - 12);
        ctx.lineTo(cx + 12, cY - 3);
        ctx.lineTo(cx + 8, cY + 10);
        ctx.lineTo(cx - 8, cY + 10);
        ctx.lineTo(cx - 12, cY - 3);
        ctx.closePath();
        ctx.fill();

        // Midbrain
        ctx.fillStyle = `rgb(${Math.floor(75 * contrast)}, ${Math.floor(75 * contrast)}, ${Math.floor(75 * contrast)})`;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 2, 20, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        // 4th Ventricle
        ctx.fillStyle = '#040404';
        const v4Y = cy + try_ * 0.16;
        ctx.beginPath();
        ctx.moveTo(cx, v4Y - 10);
        ctx.lineTo(cx + 10, v4Y);
        ctx.lineTo(cx, v4Y + 9);
        ctx.lineTo(cx - 10, v4Y);
        ctx.closePath();
        ctx.fill();

        // Cerebellum & folia
        ctx.fillStyle = `rgb(${Math.floor(85 * contrast)}, ${Math.floor(85 * contrast)}, ${Math.floor(85 * contrast)})`;
        ctx.beginPath();
        ctx.ellipse(cx - trx * 0.36, cy + try_ * 0.44, trx * 0.36, try_ * 0.28, -0.1, 0, Math.PI * 2);
        ctx.ellipse(cx + trx * 0.36, cy + try_ * 0.44, trx * 0.36, try_ * 0.28, 0.1, 0, Math.PI * 2);
        ctx.fill();
      } else if (s <= 62) {
        // Basal Ganglia & 3rd Ventricle
        // Frontal Horns of Lateral Ventricles
        ctx.fillStyle = '#040404';
        // Left Frontal Horn
        ctx.beginPath();
        ctx.moveTo(cx - 3, cy - try_ * 0.16);
        ctx.bezierCurveTo(cx - 16, cy - try_ * 0.22, cx - 22, cy - try_ * 0.36, cx - 10, cy - try_ * 0.44);
        ctx.bezierCurveTo(cx - 6, cy - try_ * 0.38, cx - 3, cy - try_ * 0.26, cx - 2, cy - try_ * 0.16);
        ctx.fill();
        // Right Frontal Horn
        ctx.beginPath();
        ctx.moveTo(cx + 3, cy - try_ * 0.16);
        ctx.bezierCurveTo(cx + 16, cy - try_ * 0.22, cx + 22, cy - try_ * 0.36, cx + 10, cy - try_ * 0.44);
        ctx.bezierCurveTo(cx + 6, cy - try_ * 0.38, cx + 3, cy - try_ * 0.26, cx + 2, cy - try_ * 0.16);
        ctx.fill();

        // Septum Pellucidum
        ctx.strokeStyle = '#5a5a5a';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(cx, cy - try_ * 0.44);
        ctx.lineTo(cx, cy - try_ * 0.14);
        ctx.stroke();

        // 3rd Ventricle
        ctx.fillStyle = '#040404';
        ctx.fillRect(cx - 2, cy - try_ * 0.08, 4, try_ * 0.22);

        // Caudate Heads
        ctx.fillStyle = `rgb(${Math.floor(82 * contrast)}, ${Math.floor(82 * contrast)}, ${Math.floor(82 * contrast)})`;
        ctx.beginPath();
        ctx.ellipse(cx - trx * 0.25, cy - try_ * 0.22, 9, 13, 0.25, 0, Math.PI * 2);
        ctx.ellipse(cx + trx * 0.25, cy - try_ * 0.22, 9, 13, -0.25, 0, Math.PI * 2);
        ctx.fill();

        // Internal Capsules
        ctx.strokeStyle = `rgb(${Math.floor(48 * contrast)}, ${Math.floor(48 * contrast)}, ${Math.floor(48 * contrast)})`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(cx - trx * 0.22, cy - try_ * 0.24);
        ctx.lineTo(cx - trx * 0.30, cy - try_ * 0.06);
        ctx.lineTo(cx - trx * 0.22, cy + try_ * 0.15);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + trx * 0.22, cy - try_ * 0.24);
        ctx.lineTo(cx + trx * 0.30, cy - try_ * 0.06);
        ctx.lineTo(cx + trx * 0.22, cy + try_ * 0.15);
        ctx.stroke();

        // Lentiform Nuclei (Putamen)
        ctx.fillStyle = `rgb(${Math.floor(78 * contrast)}, ${Math.floor(78 * contrast)}, ${Math.floor(78 * contrast)})`;
        ctx.beginPath();
        ctx.ellipse(cx - trx * 0.42, cy - try_ * 0.04, 10, 17, -0.15, 0, Math.PI * 2);
        ctx.ellipse(cx + trx * 0.42, cy - try_ * 0.04, 10, 17, 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Thalami
        ctx.fillStyle = `rgb(${Math.floor(80 * contrast)}, ${Math.floor(80 * contrast)}, ${Math.floor(80 * contrast)})`;
        ctx.beginPath();
        ctx.ellipse(cx - trx * 0.18, cy + try_ * 0.06, 11, 16, 0.15, 0, Math.PI * 2);
        ctx.ellipse(cx + trx * 0.18, cy + try_ * 0.06, 11, 16, -0.15, 0, Math.PI * 2);
        ctx.fill();

        // Sylvian Fissures
        ctx.strokeStyle = '#050505';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - trx * 0.88, cy - try_ * 0.08);
        ctx.lineTo(cx - trx * 0.58, cy - try_ * 0.06);
        ctx.moveTo(cx + trx * 0.88, cy - try_ * 0.08);
        ctx.lineTo(cx + trx * 0.58, cy - try_ * 0.06);
        ctx.stroke();
      } else if (s <= 82) {
        // Bodies of Lateral Ventricles & Corpus Callosum
        ctx.fillStyle = '#040404';
        ctx.beginPath();
        ctx.ellipse(cx - trx * 0.18, cy, 12, try_ * 0.40, -0.12, 0, Math.PI * 2);
        ctx.ellipse(cx + trx * 0.18, cy, 12, try_ * 0.40, 0.12, 0, Math.PI * 2);
        ctx.fill();

        // Corpus Callosum
        ctx.fillStyle = `rgb(${Math.floor(60 * contrast)}, ${Math.floor(60 * contrast)}, ${Math.floor(60 * contrast)})`;
        ctx.beginPath();
        ctx.ellipse(cx, cy - try_ * 0.40, 20, 9, 0, 0, Math.PI * 2);
        ctx.ellipse(cx, cy + try_ * 0.35, 22, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Choroid Plexus Calcifications in Trigone
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - trx * 0.20, cy + try_ * 0.22, 3, 0, Math.PI * 2);
        ctx.arc(cx + trx * 0.20, cy + try_ * 0.22, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Centrum Semiovale & Vertex
        ctx.fillStyle = `rgb(${Math.floor(66 * contrast)}, ${Math.floor(66 * contrast)}, ${Math.floor(66 * contrast)})`;
        ctx.beginPath();
        ctx.ellipse(cx, cy, trx * 0.82, try_ * 0.84, 0, 0, Math.PI * 2);
        ctx.fill();

        // Falx Cerebri
        ctx.strokeStyle = '#a3a3a3';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(cx, cy - try_ * 0.88);
        ctx.lineTo(cx, cy + try_ * 0.88);
        ctx.stroke();
      }

      // Interhemispheric fissure
      ctx.strokeStyle = '#080808';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, cy - try_);
      ctx.lineTo(cx, cy + try_);
      ctx.stroke();

      // Annotated Overlays & Segmentations (if isAnnotatedView === true)
      if (isAnnotatedView) {
        // 1. Color-coded anatomical region tinting matching reference video!
        if (s <= 14) {
          // Orbits & Globus
          ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.beginPath();
          ctx.arc(cx - trx * 0.46, cy - try_ * 0.66 - 4, 11, 0, Math.PI * 2);
          ctx.arc(cx + trx * 0.46, cy - try_ * 0.66 - 4, 11, 0, Math.PI * 2);
          ctx.fill();

          // Cerebellar hemispheres tint
          ctx.fillStyle = 'rgba(20, 184, 166, 0.35)';
          ctx.beginPath();
          ctx.ellipse(cx, cy + try_ * 0.42, trx * 0.70, try_ * 0.32, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (s <= 35) {
          // 4th Ventricle & Suprasellar Cistern (sky-blue)
          ctx.fillStyle = 'rgba(56, 189, 248, 0.55)';
          ctx.beginPath();
          ctx.ellipse(cx, cy + try_ * 0.16, 12, 10, 0, 0, Math.PI * 2);
          ctx.fill();

          // Midbrain (lavender/purple)
          ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
          ctx.beginPath();
          ctx.ellipse(cx, cy + 2, 22, 16, 0, 0, Math.PI * 2);
          ctx.fill();

          // Cerebellum (teal)
          ctx.fillStyle = 'rgba(20, 184, 166, 0.35)';
          ctx.beginPath();
          ctx.ellipse(cx, cy + try_ * 0.44, trx * 0.72, try_ * 0.30, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (s <= 62) {
          // Frontal Horns & 3rd Ventricle (cyan/blue)
          ctx.fillStyle = 'rgba(56, 189, 248, 0.55)';
          ctx.beginPath();
          ctx.ellipse(cx - 10, cy - try_ * 0.28, 9, 16, -0.25, 0, Math.PI * 2);
          ctx.ellipse(cx + 10, cy - try_ * 0.28, 9, 16, 0.25, 0, Math.PI * 2);
          ctx.fillRect(cx - 3, cy - try_ * 0.08, 6, try_ * 0.22);
          ctx.fill();

          // Deep Gray Matter: Caudate, Putamen, Thalamus (lavender/purple)
          ctx.fillStyle = 'rgba(168, 85, 247, 0.45)';
          // Caudate
          ctx.beginPath();
          ctx.ellipse(cx - trx * 0.25, cy - try_ * 0.22, 10, 14, 0.25, 0, Math.PI * 2);
          ctx.ellipse(cx + trx * 0.25, cy - try_ * 0.22, 10, 14, -0.25, 0, Math.PI * 2);
          // Putamen
          ctx.ellipse(cx - trx * 0.42, cy - try_ * 0.04, 11, 18, -0.15, 0, Math.PI * 2);
          ctx.ellipse(cx + trx * 0.42, cy - try_ * 0.04, 11, 18, 0.15, 0, Math.PI * 2);
          // Thalamus
          ctx.ellipse(cx - trx * 0.18, cy + try_ * 0.06, 12, 17, 0.15, 0, Math.PI * 2);
          ctx.ellipse(cx + trx * 0.18, cy + try_ * 0.06, 12, 17, -0.15, 0, Math.PI * 2);
          ctx.fill();

          // Internal Capsule highlight (blue-white)
          ctx.strokeStyle = 'rgba(96, 165, 250, 0.7)';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(cx - trx * 0.22, cy - try_ * 0.24);
          ctx.lineTo(cx - trx * 0.30, cy - try_ * 0.06);
          ctx.lineTo(cx - trx * 0.22, cy + try_ * 0.15);
          ctx.stroke();
        } else if (s <= 82) {
          // Bodies of Lateral Ventricles (sky blue)
          ctx.fillStyle = 'rgba(56, 189, 248, 0.55)';
          ctx.beginPath();
          ctx.ellipse(cx - trx * 0.18, cy, 14, try_ * 0.42, -0.12, 0, Math.PI * 2);
          ctx.ellipse(cx + trx * 0.18, cy, 14, try_ * 0.42, 0.12, 0, Math.PI * 2);
          ctx.fill();

          // Corpus Callosum (blue arc)
          ctx.fillStyle = 'rgba(59, 130, 246, 0.45)';
          ctx.beginPath();
          ctx.ellipse(cx, cy - try_ * 0.40, 22, 10, 0, 0, Math.PI * 2);
          ctx.ellipse(cx, cy + try_ * 0.35, 24, 11, 0, 0, Math.PI * 2);
          ctx.fill();

          // Choroid Plexus (red/coral highlight)
          ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
          ctx.beginPath();
          ctx.arc(cx - trx * 0.20, cy + try_ * 0.22, 4.5, 0, Math.PI * 2);
          ctx.arc(cx + trx * 0.20, cy + try_ * 0.22, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // 2. Dynamic Anatomical Labels with Leader Lines (exact format from reference video)
        if (showAnatomyLabels) {
          anatomyInfo.pointers.forEach(ptr => {
            const targetX = cx + ptr.rx * trx;
            const targetY = cy + ptr.ry * try_;
            const isLeft = ptr.side === 'left';
            const offsetDist = 18;
            const labelX = isLeft ? targetX - offsetDist : targetX + offsetDist;
            const labelY = targetY;

            // Anchor point dot
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(targetX, targetY, 2.2, 0, Math.PI * 2);
            ctx.fill();

            // Caliper / leader line
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(targetX, targetY);
            ctx.lineTo(labelX, labelY);
            ctx.stroke();

            // Label text badge
            ctx.font = 'bold 9.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            const textMetrics = ctx.measureText(ptr.name);
            const badgeW = textMetrics.width + 8;
            const badgeH = 15;
            const badgeX = isLeft ? labelX - badgeW : labelX;
            const badgeY = labelY - badgeH / 2;

            // Dark rounded badge with colored border matching region
            ctx.fillStyle = 'rgba(10, 15, 25, 0.88)';
            ctx.strokeStyle = ptr.color || '#38bdf8';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 3);
            } else {
              ctx.rect(badgeX, badgeY, badgeW, badgeH);
            }
            ctx.fill();
            ctx.stroke();

            // White crisp label text
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(ptr.name, badgeX + 4, labelY);
          });
        }
      }

      ctx.restore();

      // Scan subtitle at bottom
      ctx.fillStyle = isAnnotatedView ? '#38bdf8' : '#94a3b8';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labelTitle, cx, cy + ry + 20);

      // Orientation markers
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('A', cx, cy - ry - 4);
      ctx.fillText('P', cx, cy + ry + 8);
      ctx.fillText('R', cx - rx - 10, cy);
      ctx.fillText('L', cx + rx + 10, cy);
    };

    // 4. Render Split Comparison View (as in Video) OR Single View
    if (ctDisplayMode === 'split') {
      const leftCenterX = 188;
      const rightCenterX = 532;
      const scanCenterY = 248;
      const scanRadius = 142;

      // Divider line between the two scans
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width / 2, 72);
      ctx.lineTo(width / 2, height - 16);
      ctx.stroke();

      // Left: Pure Grayscale CT Scan
      drawCTSlice(leftCenterX, scanCenterY, scanRadius, false, 'Axial CT head (Unenhanced)');

      // Right: Anatomy Atlas with colored segmentations & labels
      drawCTSlice(rightCenterX, scanCenterY, scanRadius, true, 'Anatomy Atlas (Segmented & Labeled)');
    } else {
      // Single Large CT View
      const singleCenterX = width / 2;
      const singleCenterY = 250;
      const singleRadius = 175;

      drawCTSlice(
        singleCenterX,
        singleCenterY,
        singleRadius,
        showAnatomyLabels,
        showAnatomyLabels ? '32-Slice CT Head (Atlas & Labeled)' : '32-Slice CT Head (Pure Diagnostic)'
      );
    }
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
  }, [rotationX, rotationY, zoom, activeHotspot, isVRMode, viewMode, mriSliceIndex, showWireframe, contrastLevel, showAnatomyLabels, ctDisplayMode]);

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
              <h3 className="font-serif font-bold text-lg text-[#221B14]">
                {isMr ? 'परस्परसंवादी ३डी / व्हीआर न्यूरो-रेडिओलॉजी एक्सप्लोरर' : 'Interactive 3D / VR Neuro-Radiology Explorer'}
              </h3>
              <span className="bg-[#FAF0DE] text-[#8E5B3E] text-xs px-2.5 py-0.5 rounded-full font-semibold border border-[#ECD3B9]">
                {isMr ? '३२-स्लाईस सीटी आणि ३डी व्हॉल्यूम' : '32-Slice CT & 3D Volume Suite'}
              </span>
            </div>
            <p className="text-xs text-[#6B6254]">
              {isMr
                ? 'हाय-रिझोल्युशन हेलिकल ३२-स्लाईस सीटी क्रॉस-सेक्शन्स, स्ट्रोक मॅपिंग आणि स्टिरिओस्कोपिक व्ह्यू'
                : 'High-resolution helical 32-slice CT cross-sections, acute stroke perfusion mapping & stereoscopic view'}
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
            {isMr ? '३डी मॉडेल' : '3D Volume Model'}
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
            {isMr ? '३२-स्लाईस सीटी अ‍ॅक्सिअल' : '32-Slice CT Axial'}
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
            {isVRMode
              ? (isMr ? 'व्हीआर मोडमधून बाहेर पडा' : 'Exit VR Headset Mode')
              : (isMr ? 'स्टिरिओस्कोपिक व्हीआर मोड' : 'Stereoscopic VR Mode')}
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
              onWheel={handleWheel}
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
              <div className="flex items-center gap-2 py-0.5">
                <span className="text-[11px] text-[#6B6254] font-mono font-semibold">32-SLICE CT:</span>
                
                {/* Previous slice step button */}
                <button
                  onClick={() => setMriSliceIndex(prev => Math.max(1, prev - 1))}
                  disabled={mriSliceIndex <= 1}
                  className="w-5 h-5 rounded flex items-center justify-center bg-[#FAF0DE] hover:bg-[#ECD3B9] text-[#8E5B3E] disabled:opacity-40 transition-colors shadow-2xs"
                  title="Previous Slice (or scroll wheel up)"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <input
                  type="range"
                  min={1}
                  max={100}
                  value={mriSliceIndex}
                  onChange={e => setMriSliceIndex(Number(e.target.value))}
                  className="w-24 h-1.5 bg-[#DACFBF] rounded-lg appearance-none cursor-pointer accent-[#8E5B3E]"
                />

                {/* Next slice step button */}
                <button
                  onClick={() => setMriSliceIndex(prev => Math.min(100, prev + 1))}
                  disabled={mriSliceIndex >= 100}
                  className="w-5 h-5 rounded flex items-center justify-center bg-[#FAF0DE] hover:bg-[#ECD3B9] text-[#8E5B3E] disabled:opacity-40 transition-colors shadow-2xs"
                  title="Next Slice (or scroll wheel down)"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <span className="text-[11px] text-[#8E5B3E] font-mono font-bold w-12 text-center">
                  {mriSliceIndex}/100
                </span>

                <div className="h-4 w-[1px] bg-[#DACFBF] mx-0.5" />

                {/* Split vs Single View Mode Toggle */}
                <button
                  onClick={() => setCtDisplayMode(prev => prev === 'split' ? 'single' : 'split')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                    ctDisplayMode === 'split'
                      ? 'bg-[#8E5B3E] text-white shadow-2xs'
                      : 'bg-white hover:bg-[#FAF6F0] text-[#5C5346] border border-[#DACFBF]'
                  }`}
                  title="Toggle Split Dual Scan / Single Scan Layout"
                >
                  {ctDisplayMode === 'split' ? 'Split View' : 'Single View'}
                </button>

                {/* Toggle Anatomy Labels */}
                <button
                  onClick={() => setShowAnatomyLabels(prev => !prev)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                    showAnatomyLabels
                      ? 'bg-[#FAF0DE] text-[#8E5B3E] border border-[#ECD3B9]'
                      : 'text-[#6B6254] hover:text-[#221B14] border border-transparent'
                  }`}
                  title="Toggle Dynamic Anatomical Labels"
                >
                  <Tag className="w-3 h-3" />
                  {showAnatomyLabels ? 'Labels ON' : 'Labels OFF'}
                </button>

                <div className="h-4 w-[1px] bg-[#DACFBF] mx-0.5" />

                <span className="text-[11px] text-[#6B6254] font-mono font-semibold">WINDOW:</span>
                <input
                  type="range"
                  min={50}
                  max={150}
                  value={contrastLevel}
                  onChange={e => setContrastLevel(Number(e.target.value))}
                  className="w-16 h-1.5 bg-[#DACFBF] rounded-lg appearance-none cursor-pointer accent-[#8E5B3E]"
                  title="Adjust CT Contrast Window"
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
              : `32-Slice CT Axial • Slice ${mriSliceIndex}/100 • Scroll wheel or drag slider to scrub`}
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
