import React, { useEffect, useRef, useState, useCallback } from 'react';

interface GeospatialBackgroundProps {
  accentColor?: string;
  glowColor?: string;
  roleIndex?: number;
  roleTitle?: string;
  interactive?: boolean;
}

interface Parcel {
  id: string;
  khasraNo: string;
  areaHa: string;
  status: 'acquired' | 'sec19' | 'valuation' | 'notified' | 'escrow';
  statusLabel: string;
  vertices: [number, number][]; // normalized [0..1]
  center: [number, number];
  color: string;
  highlightAlpha: number;
}

interface Benchmark {
  id: string;
  name: string;
  pos: [number, number]; // normalized [0..1]
  elevation: string;
  latLong: string;
}

interface PulseParticle {
  progress: number; // 0..1 along corridor
  speed: number;
  size: number;
  color: string;
  corridorIndex: number;
}

interface ScanPing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  label?: string;
}

interface CorridorSegment {
  x: number;
  y: number;
  cp1x: number;
  cp1y: number;
  cp2x: number;
  cp2y: number;
}

interface CorridorDef {
  name: string;
  color: string;
  start: { x: number; y: number };
  seg1: CorridorSegment;
  seg2: CorridorSegment;
  chainages: { t: number; label: string }[];
}

export const GeospatialAnimatedBackground: React.FC<GeospatialBackgroundProps> = ({
  accentColor = '#4EE0D1',
  glowColor = 'rgba(78, 224, 209, 0.22)',
  roleIndex = 0,
  roleTitle = 'Apex Command',
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Real-time mouse and telemetry state
  const mouseRef = useRef<{ x: number; y: number; active: boolean; targetX: number; targetY: number }>({
    x: 0.5,
    y: 0.5,
    active: false,
    targetX: 0.5,
    targetY: 0.5,
  });

  const [telemetry, setTelemetry] = useState({
    coords: '23°13\'04" N  72°39\'45" E',
    elevation: '54.2 m AMSL',
    zone: 'UTM 43N (WGS-84 / NavIC)',
    rtkFix: 'FIXED (99.94%)',
    activeKhasra: 'KHASRA 142/2A • SEC 19 AWARDED',
    satelliteCount: 8,
    activeSatellites: 'NavIC-1I, 1B, 1C, 1E + GAGAN-02',
  });

  // Helper to convert hex to rgba
  const hexToRgba = useCallback((hex: string, alpha: number) => {
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    const r = parseInt(clean.substring(0, 2), 16) || 78;
    const g = parseInt(clean.substring(2, 4), 16) || 224;
    const b = parseInt(clean.substring(4, 6), 16) || 209;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Resize handler with Device Pixel Ratio for crystal clear vector rendering
    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Pre-calculate realistic cadastral parcels along an infrastructure corridor
    const parcels: Parcel[] = [
      {
        id: 'P-1',
        khasraNo: 'KH-138/1',
        areaHa: '2.14 Ha',
        status: 'acquired',
        statusLabel: 'DIRECT PURCHASE MUTATED',
        vertices: [
          [0.10, 0.18], [0.18, 0.16], [0.22, 0.28], [0.13, 0.31]
        ],
        center: [0.16, 0.23],
        color: '#16A878',
        highlightAlpha: 0,
      },
      {
        id: 'P-2',
        khasraNo: 'KH-139',
        areaHa: '4.80 Ha',
        status: 'sec19',
        statusLabel: 'SEC 19 AWARD PASSED',
        vertices: [
          [0.22, 0.28], [0.33, 0.25], [0.35, 0.38], [0.24, 0.41]
        ],
        center: [0.28, 0.33],
        color: '#4EE0D1',
        highlightAlpha: 0,
      },
      {
        id: 'P-3',
        khasraNo: 'KH-140/A',
        areaHa: '1.92 Ha',
        status: 'valuation',
        statusLabel: 'VALUATION VERIFIED',
        vertices: [
          [0.13, 0.31], [0.24, 0.41], [0.20, 0.52], [0.09, 0.44]
        ],
        center: [0.16, 0.42],
        color: '#F2A51A',
        highlightAlpha: 0,
      },
      {
        id: 'P-4',
        khasraNo: 'KH-141',
        areaHa: '5.10 Ha',
        status: 'escrow',
        statusLabel: 'DIRECT ESCROW DISBURSED',
        vertices: [
          [0.35, 0.38], [0.46, 0.34], [0.50, 0.46], [0.38, 0.50]
        ],
        center: [0.42, 0.42],
        color: '#34D399',
        highlightAlpha: 0,
      },
      {
        id: 'P-5',
        khasraNo: 'KH-142/2',
        areaHa: '3.65 Ha',
        status: 'sec19',
        statusLabel: 'BULLET TRAIN PIER 142 ROW',
        vertices: [
          [0.24, 0.41], [0.38, 0.50], [0.34, 0.64], [0.20, 0.52]
        ],
        center: [0.29, 0.52],
        color: '#60A5FA',
        highlightAlpha: 0,
      },
      {
        id: 'P-6',
        khasraNo: 'KH-143',
        areaHa: '2.88 Ha',
        status: 'notified',
        statusLabel: 'SEC 11 PRELIMINARY GAZETTE',
        vertices: [
          [0.50, 0.46], [0.62, 0.43], [0.65, 0.56], [0.52, 0.60]
        ],
        center: [0.57, 0.51],
        color: '#A78BFA',
        highlightAlpha: 0,
      },
      {
        id: 'P-7',
        khasraNo: 'KH-144/B',
        areaHa: '6.20 Ha',
        status: 'acquired',
        statusLabel: 'DFC DEDICATED FREIGHT ROW',
        vertices: [
          [0.38, 0.50], [0.52, 0.60], [0.48, 0.74], [0.34, 0.64]
        ],
        center: [0.43, 0.62],
        color: '#16A878',
        highlightAlpha: 0,
      },
      {
        id: 'P-8',
        khasraNo: 'KH-145',
        areaHa: '3.12 Ha',
        status: 'valuation',
        statusLabel: 'SLAO REVENUE RE-HEARING',
        vertices: [
          [0.65, 0.56], [0.77, 0.52], [0.81, 0.65], [0.69, 0.70]
        ],
        center: [0.73, 0.61],
        color: '#F2A51A',
        highlightAlpha: 0,
      },
      {
        id: 'P-9',
        khasraNo: 'KH-146/A',
        areaHa: '4.45 Ha',
        status: 'sec19',
        statusLabel: 'CONSENT ATTESTED (88%)',
        vertices: [
          [0.52, 0.60], [0.69, 0.70], [0.64, 0.84], [0.48, 0.74]
        ],
        center: [0.58, 0.72],
        color: '#4EE0D1',
        highlightAlpha: 0,
      },
      {
        id: 'P-10',
        khasraNo: 'KH-147',
        areaHa: '1.80 Ha',
        status: 'escrow',
        statusLabel: 'LAND POOLING AGREEMENT',
        vertices: [
          [0.77, 0.52], [0.89, 0.48], [0.93, 0.60], [0.81, 0.65]
        ],
        center: [0.85, 0.56],
        color: '#34D399',
        highlightAlpha: 0,
      },
      {
        id: 'P-11',
        khasraNo: 'KH-148/1',
        areaHa: '7.30 Ha',
        status: 'acquired',
        statusLabel: 'EXPRESSWAY JUNCTION CLEARED',
        vertices: [
          [0.69, 0.70], [0.85, 0.66], [0.82, 0.82], [0.64, 0.84]
        ],
        center: [0.75, 0.76],
        color: '#16A878',
        highlightAlpha: 0,
      },
      {
        id: 'P-12',
        khasraNo: 'KH-149',
        areaHa: '3.90 Ha',
        status: 'notified',
        statusLabel: 'SECTION 21 PUBLIC NOTICE',
        vertices: [
          [0.85, 0.66], [0.95, 0.62], [0.94, 0.78], [0.82, 0.82]
        ],
        center: [0.89, 0.72],
        color: '#818CF8',
        highlightAlpha: 0,
      }
    ];

    // Survey Benchmark Stations
    const benchmarks: Benchmark[] = [
      { id: 'BM-01', name: 'BM-GANDHINAGAR APEX', pos: [0.22, 0.16], elevation: '+68.4m', latLong: '23°13\'N 72°39\'E' },
      { id: 'BM-02', name: 'BM-AHMEDABAD DFC ROW', pos: [0.44, 0.32], elevation: '+52.1m', latLong: '23°02\'N 72°35\'E' },
      { id: 'BM-03', name: 'BM-ANAND BULLET PIER', pos: [0.38, 0.66], elevation: '+41.8m', latLong: '22°34\'N 72°57\'E' },
      { id: 'BM-04', name: 'BM-SURAT MULTIMODAL', pos: [0.76, 0.68], elevation: '+18.5m', latLong: '21°10\'N 72°49\'E' },
      { id: 'BM-05', name: 'BM-VADODARA BYPASS', pos: [0.65, 0.42], elevation: '+35.0m', latLong: '22°18\'N 73°12\'E' },
    ];

    // Corridors defined as Bezier curves (Normalized coordinates)
    const corridors: CorridorDef[] = [
      // Primary Corridor: Mumbai-Ahmedabad High Speed Rail RoW Spine
      {
        name: 'MAHSR ALIGNMENT (60m RoW)',
        color: accentColor,
        start: { x: 0.05, y: 0.22 },
        seg1: { cp1x: 0.25, cp1y: 0.32, cp2x: 0.35, cp2y: 0.58, x: 0.58, y: 0.68 },
        seg2: { cp1x: 0.72, cp1y: 0.74, cp2x: 0.85, cp2y: 0.72, x: 0.96, y: 0.82 },
        chainages: [
          { t: 0.15, label: 'CH 94+200' },
          { t: 0.38, label: 'PIER 142 • SMR-08' },
          { t: 0.62, label: 'CH 118+600' },
          { t: 0.88, label: 'SUBSTATION ALPHA' }
        ]
      },
      // Secondary Corridor: Western Dedicated Freight Corridor
      {
        name: 'WESTERN DFC CORRIDOR',
        color: '#16A878',
        start: { x: 0.08, y: 0.38 },
        seg1: { cp1x: 0.30, cp1y: 0.42, cp2x: 0.55, cp2y: 0.48, x: 0.78, y: 0.52 },
        seg2: { cp1x: 0.88, cp1y: 0.54, cp2x: 0.92, cp2y: 0.62, x: 0.98, y: 0.65 },
        chainages: [
          { t: 0.28, label: 'DFC KM 284' },
          { t: 0.72, label: 'YARD INTERLINK' }
        ]
      }
    ];

    // Pulse particles running along corridors
    const particles: PulseParticle[] = [
      { progress: 0.05, speed: 0.0018, size: 3.5, color: accentColor, corridorIndex: 0 },
      { progress: 0.35, speed: 0.0015, size: 2.8, color: '#38BDF8', corridorIndex: 0 },
      { progress: 0.68, speed: 0.0020, size: 4.0, color: '#F2A51A', corridorIndex: 0 },
      { progress: 0.90, speed: 0.0016, size: 3.0, color: '#34D399', corridorIndex: 0 },
      { progress: 0.20, speed: 0.0014, size: 3.2, color: '#16A878', corridorIndex: 1 },
      { progress: 0.58, speed: 0.0017, size: 2.6, color: '#4EE0D1', corridorIndex: 1 },
      { progress: 0.82, speed: 0.0013, size: 3.0, color: '#10B981', corridorIndex: 1 },
    ];

    // Active scan pings
    let scanPings: ScanPing[] = [];
    let lidarAngle = 0; // Scanning radar angle
    let lidarSweepY = 0; // Vertical LiDAR contour sweep
    let lastPingTime = 0;
    let satelliteOrbit = 0; // NavIC orbit progression

    // Helper: evaluate cubic Bezier point at t (0..1)
    const getBezierPoint = (
      p0: { x: number; y: number },
      p1: { x: number; y: number },
      p2: { x: number; y: number },
      p3: { x: number; y: number },
      t: number
    ) => {
      const u = 1 - t;
      const tt = t * t;
      const uu = u * u;
      const uuu = uu * u;
      const ttt = tt * t;

      const x = uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x;
      const y = uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y;
      return { x, y };
    };

    // Calculate position along corridor at parameter t (0..1)
    const getCorridorPoint = (corridorIdx: number, t: number) => {
      const corridor = corridors[corridorIdx];
      // Splitting into 2 cubic segments for smoothness
      if (t <= 0.5) {
        const segT = t * 2;
        return getBezierPoint(
          corridor.start,
          { x: corridor.seg1.cp1x, y: corridor.seg1.cp1y },
          { x: corridor.seg1.cp2x, y: corridor.seg1.cp2y },
          { x: corridor.seg1.x, y: corridor.seg1.y },
          segT
        );
      } else {
        const segT = (t - 0.5) * 2;
        return getBezierPoint(
          { x: corridor.seg1.x, y: corridor.seg1.y },
          { x: corridor.seg2.cp1x, y: corridor.seg2.cp1y },
          { x: corridor.seg2.cp2x, y: corridor.seg2.cp2y },
          { x: corridor.seg2.x, y: corridor.seg2.y },
          segT
        );
      }
    };

    // Render loop
    const render = (time: number) => {
      if (!ctx || width === 0 || height === 0) return;

      // Smooth mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Mouse parallax shift
      const parallaxX = (mouseRef.current.x - 0.5) * 28;
      const parallaxY = (mouseRef.current.y - 0.5) * 20;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      ctx.save();
      ctx.translate(parallaxX, parallaxY);

      // ─────────────────────────────────────────────────────────────
      // 1. HIGH-PRECISION DEEP SPACE CADASTRAL GRID & UTM TICKS
      // ─────────────────────────────────────────────────────────────
      const gridSize = 48;
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(78, 224, 209, 0.035)';

      const startX = -parallaxX % gridSize;
      const startY = -parallaxY % gridSize;

      ctx.beginPath();
      for (let x = startX - gridSize; x < width + gridSize * 2; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = startY - gridSize; y < height + gridSize * 2; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Major UTM Meridian Marks (Every 4 grid lines)
      ctx.strokeStyle = 'rgba(78, 224, 209, 0.07)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = startX - gridSize; x < width + gridSize * 2; x += gridSize * 4) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        // Add subtle tick mark
        ctx.strokeRect(x - 2, 20, 4, 1);
      }
      for (let y = startY - gridSize; y < height + gridSize * 2; y += gridSize * 4) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // ─────────────────────────────────────────────────────────────
      // 2. MATHEMATICAL TOPOGRAPHIC ELEVATION ISOBARS (CONTOURS)
      // ─────────────────────────────────────────────────────────────
      const drawIsobar = (
        yBaseRatio: number,
        amplitude: number,
        freq: number,
        phase: number,
        color: string,
        dashed = false,
        elevationLabel = '+45m'
      ) => {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.1;
        if (dashed) ctx.setLineDash([4, 6]);

        ctx.beginPath();
        const base = yBaseRatio * height;
        ctx.moveTo(-50, base);

        for (let x = -50; x <= width + 50; x += 30) {
          const y = base + Math.sin((x / width) * freq + phase) * amplitude + Math.cos((x / width) * 2 + phase * 0.7) * (amplitude * 0.4);
          ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Label on contour line
        ctx.font = '9px monospace';
        ctx.fillStyle = hexToRgba(color, 0.4);
        const labelX = width * (0.15 + (yBaseRatio * 0.7) % 0.6);
        const labelY = base + Math.sin((labelX / width) * freq + phase) * amplitude - 5;
        ctx.fillText(`ISO ${elevationLabel}`, labelX, labelY);

        ctx.restore();
      };

      const tSec = time * 0.001;
      drawIsobar(0.18, 22, 4.2, tSec * 0.15, 'rgba(78, 224, 209, 0.12)', true, 'EL +68m');
      drawIsobar(0.35, 28, 3.8, -tSec * 0.12 + 1, hexToRgba(accentColor, 0.14), false, 'EL +54m');
      drawIsobar(0.55, 34, 4.8, tSec * 0.10 + 2, 'rgba(242, 165, 26, 0.12)', false, 'EL +42m');
      drawIsobar(0.72, 26, 3.5, -tSec * 0.14 + 3, 'rgba(22, 168, 120, 0.14)', true, 'EL +30m');
      drawIsobar(0.88, 20, 4.0, tSec * 0.16 + 4, 'rgba(78, 224, 209, 0.10)', false, 'EL +18m');

      // ─────────────────────────────────────────────────────────────
      // 3. CADASTRAL PARCEL MESH (KHASRA POLYGONS WITH SHADING)
      // ─────────────────────────────────────────────────────────────
      parcels.forEach((parcel) => {
        const polyPoints = parcel.vertices.map(([nx, ny]) => ({
          x: nx * width,
          y: ny * height,
        }));

        // Check if cursor is near parcel center to give subtle reactive elevation
        const cx = parcel.center[0] * width;
        const cy = parcel.center[1] * height;
        const mx = mouseRef.current.x * width;
        const my = mouseRef.current.y * height;
        const distToMouse = Math.hypot(mx - cx, my - cy);
        const isHovered = distToMouse < 140;

        if (isHovered) {
          parcel.highlightAlpha = Math.min(parcel.highlightAlpha + 0.04, 0.35);
        } else {
          parcel.highlightAlpha = Math.max(parcel.highlightAlpha - 0.02, 0);
        }

        ctx.save();

        // Polygon Fill
        ctx.beginPath();
        polyPoints.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();

        const baseFillAlpha = parcel.status === 'sec19' ? 0.08 : parcel.status === 'acquired' ? 0.06 : 0.04;
        ctx.fillStyle = hexToRgba(parcel.color, baseFillAlpha + parcel.highlightAlpha);
        ctx.fill();

        // Boundary Stroke
        ctx.strokeStyle = hexToRgba(parcel.color, 0.35 + parcel.highlightAlpha * 0.5);
        ctx.lineWidth = isHovered ? 1.5 : 1.0;
        ctx.setLineDash(parcel.status === 'notified' ? [5, 4] : []);
        ctx.stroke();

        // Corner Survey Boundary Stones (Pillars)
        polyPoints.forEach((pt) => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, isHovered ? 3 : 2, 0, Math.PI * 2);
          ctx.fillStyle = hexToRgba(parcel.color, 0.85);
          ctx.fill();
        });

        // Khasra Number & Area Annotation in center
        ctx.font = '10px monospace';
        ctx.fillStyle = isHovered ? '#FFFFFF' : 'rgba(245, 250, 249, 0.70)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(parcel.khasraNo, cx, cy - 6);

        ctx.font = '8px monospace';
        ctx.fillStyle = hexToRgba(parcel.color, 0.8);
        ctx.fillText(`${parcel.areaHa} • ${parcel.statusLabel.split(' ')[0]}`, cx, cy + 8);

        ctx.restore();
      });

      // ─────────────────────────────────────────────────────────────
      // 4. INFRASTRUCTURE CORRIDORS (MAHSR & DFC ALIGNMENT SPINES)
      // ─────────────────────────────────────────────────────────────
      corridors.forEach((corridor, cIdx) => {
        ctx.save();

        // Outer Right-of-Way Buffer (Dashed parallel corridor lines)
        ctx.lineWidth = 1;
        ctx.strokeStyle = hexToRgba(corridor.color, 0.15);
        ctx.setLineDash([8, 8]);

        // Draw RoW centerline
        ctx.beginPath();
        ctx.moveTo(corridor.start.x * width, corridor.start.y * height);
        ctx.bezierCurveTo(
          corridor.seg1.cp1x * width,
          corridor.seg1.cp1y * height,
          corridor.seg1.cp2x * width,
          corridor.seg1.cp2y * height,
          corridor.seg1.x * width,
          corridor.seg1.y * height
        );
        ctx.bezierCurveTo(
          corridor.seg2.cp1x * width,
          corridor.seg2.cp1y * height,
          corridor.seg2.cp2x * width,
          corridor.seg2.cp2y * height,
          corridor.seg2.x * width,
          corridor.seg2.y * height
        );
        ctx.stroke();

        // High-Intensity Core Line
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = hexToRgba(corridor.color, 0.55);
        ctx.setLineDash([]);
        ctx.shadowColor = corridor.color;
        ctx.shadowBlur = 8;
        ctx.stroke();

        // Corridor Chainage Station Flags
        corridor.chainages.forEach((ch) => {
          const pt = getCorridorPoint(cIdx, ch.t);
          const px = pt.x * width;
          const py = pt.y * height;

          // Pier/Station icon
          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(px, py, 7, 0, Math.PI * 2);
          ctx.strokeStyle = hexToRgba(corridor.color, 0.7);
          ctx.lineWidth = 1;
          ctx.stroke();

          // Chainage Label
          ctx.font = '8.5px monospace';
          ctx.fillStyle = '#E6FFFA';
          ctx.textAlign = 'left';
          ctx.shadowBlur = 0;
          ctx.fillText(`[ ${ch.label} ]`, px + 10, py - 4);
        });

        ctx.restore();
      });

      // ─────────────────────────────────────────────────────────────
      // 5. MOVING PULSE SIGNALS / PACKETS ALONG CORRIDORS
      // ─────────────────────────────────────────────────────────────
      particles.forEach((p) => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;

        const pt = getCorridorPoint(p.corridorIndex, p.progress);
        const px = pt.x * width;
        const py = pt.y * height;

        ctx.save();
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 14;

        // Pulse core
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Expanding outer ring
        ctx.beginPath();
        ctx.arc(px, py, p.size * 2.2, 0, Math.PI * 2);
        ctx.strokeStyle = hexToRgba(p.color, 0.6);
        ctx.lineWidth = 1;
        ctx.stroke();

        // Subtle comet trail
        const trailT = Math.max(0, p.progress - 0.04);
        const trailPt = getCorridorPoint(p.corridorIndex, trailT);
        const grad = ctx.createLinearGradient(trailPt.x * width, trailPt.y * height, px, py);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, hexToRgba(p.color, 0.8));

        ctx.beginPath();
        ctx.moveTo(trailPt.x * width, trailPt.y * height);
        ctx.lineTo(px, py);
        ctx.strokeStyle = grad;
        ctx.lineWidth = p.size * 0.9;
        ctx.stroke();

        ctx.restore();
      });

      // ─────────────────────────────────────────────────────────────
      // 6. NavIC-1I SATELLITE CONSTELLATION & GEODETIC TRIANGULATION
      // ─────────────────────────────────────────────────────────────
      satelliteOrbit += 0.0006;
      const satNormX = 0.5 + Math.sin(satelliteOrbit) * 0.35;
      const satNormY = 0.07 + Math.cos(satelliteOrbit * 0.8) * 0.03;
      const satX = satNormX * width;
      const satY = satNormY * height;

      ctx.save();
      // Orbit Path Arc
      ctx.beginPath();
      ctx.ellipse(width * 0.5, height * 0.07, width * 0.38, height * 0.04, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(78, 224, 209, 0.08)';
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 1;
      ctx.stroke();

      // Satellite Icon
      ctx.setLineDash([]);
      ctx.shadowColor = '#38BDF8';
      ctx.shadowBlur = 12;

      // Solar Panels
      ctx.fillStyle = '#38BDF8';
      ctx.fillRect(satX - 16, satY - 3, 10, 6);
      ctx.fillRect(satX + 6, satY - 3, 10, 6);

      // Bus Body
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(satX - 5, satY - 5, 10, 10);

      // Satellite Label
      ctx.font = '8px monospace';
      ctx.fillStyle = '#BAE6FD';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 0;
      ctx.fillText('NavIC-1I • GEO-STATIONARY ORBIT (36,000 KM)', satX, satY - 10);

      // Laser Triangulation Beams to Benchmark Stations
      benchmarks.forEach((bm, i) => {
        const bx = bm.pos[0] * width;
        const by = bm.pos[1] * height;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(satX, satY);
        ctx.lineTo(bx, by);

        // Subtle laser beam with pulse dash
        ctx.strokeStyle = hexToRgba('#38BDF8', 0.16);
        ctx.lineWidth = 0.9;
        ctx.setLineDash([4, 8]);
        ctx.lineDashOffset = -time * 0.03;
        ctx.stroke();

        // Benchmark Station Pillar
        ctx.setLineDash([]);
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 8;

        // Outer radar ping on benchmark
        const pulseCycle = (time * 0.0015 + i * 0.7) % 2;
        ctx.beginPath();
        ctx.arc(bx, by, 3 + pulseCycle * 8, 0, Math.PI * 2);
        ctx.strokeStyle = hexToRgba(accentColor, Math.max(0, 1 - pulseCycle / 2));
        ctx.lineWidth = 1;
        ctx.stroke();

        // Solid Pillar Node
        ctx.beginPath();
        ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = accentColor;
        ctx.fill();

        // Benchmark ID Card
        ctx.font = '8px monospace';
        ctx.fillStyle = '#F5FAF9';
        ctx.textAlign = 'left';
        ctx.fillText(`${bm.id} [${bm.elevation}]`, bx + 8, by - 4);

        ctx.font = '7px monospace';
        ctx.fillStyle = 'rgba(163, 198, 196, 0.7)';
        ctx.fillText(bm.name, bx + 8, by + 6);

        ctx.restore();
      });

      ctx.restore();

      // ─────────────────────────────────────────────────────────────
      // 7. HIGH-TECH ROTATING LiDAR SCANNER & SURVEY RADAR SWEEP
      // ─────────────────────────────────────────────────────────────
      lidarAngle += 0.006;
      lidarSweepY = (lidarSweepY + 1.2) % height;

      // Rotating Radar Fan centered on Command Hub
      const radarCenterX = width * 0.48;
      const radarCenterY = height * 0.45;
      const radarRadius = Math.max(width, height) * 0.65;

      ctx.save();
      const radarGrad = ctx.createRadialGradient(
        radarCenterX, radarCenterY, 10,
        radarCenterX, radarCenterY, radarRadius
      );
      radarGrad.addColorStop(0, hexToRgba(accentColor, 0.08));
      radarGrad.addColorStop(0.5, hexToRgba(accentColor, 0.02));
      radarGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.moveTo(radarCenterX, radarCenterY);
      ctx.arc(radarCenterX, radarCenterY, radarRadius, lidarAngle, lidarAngle + 0.35);
      ctx.closePath();
      ctx.fillStyle = radarGrad;
      ctx.fill();

      // Sweeping Edge Line
      ctx.beginPath();
      ctx.moveTo(radarCenterX, radarCenterY);
      ctx.lineTo(
        radarCenterX + Math.cos(lidarAngle + 0.35) * radarRadius,
        radarCenterY + Math.sin(lidarAngle + 0.35) * radarRadius
      );
      ctx.strokeStyle = hexToRgba(accentColor, 0.35);
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Horizontal LiDAR Contour Plane (Soft blue elevation laser)
      ctx.beginPath();
      ctx.moveTo(0, lidarSweepY);
      ctx.lineTo(width, lidarSweepY);
      const sweepGrad = ctx.createLinearGradient(0, 0, width, 0);
      sweepGrad.addColorStop(0, 'rgba(78, 224, 209, 0)');
      sweepGrad.addColorStop(0.3, 'rgba(78, 224, 209, 0.28)');
      sweepGrad.addColorStop(0.7, hexToRgba(accentColor, 0.35));
      sweepGrad.addColorStop(1, 'rgba(78, 224, 209, 0)');
      ctx.strokeStyle = sweepGrad;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();

      // ─────────────────────────────────────────────────────────────
      // 8. RANDOM SURVEY LASER PINGS / GROUND PULSES
      // ─────────────────────────────────────────────────────────────
      if (time - lastPingTime > 1800) {
        lastPingTime = time;
        const randomParcel = parcels[Math.floor(Math.random() * parcels.length)];
        scanPings.push({
          x: randomParcel.center[0] * width,
          y: randomParcel.center[1] * height,
          radius: 4,
          maxRadius: 48,
          alpha: 0.8,
          color: randomParcel.color,
          label: `GPS VERIFY: ${randomParcel.khasraNo}`
        });
      }

      // Animate active scan pings
      scanPings = scanPings.filter((ping) => {
        ping.radius += 0.8;
        ping.alpha -= 0.015;

        if (ping.alpha <= 0) return false;

        ctx.save();
        ctx.beginPath();
        ctx.arc(ping.x, ping.y, ping.radius, 0, Math.PI * 2);
        ctx.strokeStyle = hexToRgba(ping.color, ping.alpha);
        ctx.lineWidth = 1;
        ctx.stroke();

        if (ping.label && ping.alpha > 0.4) {
          ctx.font = '8px monospace';
          ctx.fillStyle = hexToRgba(ping.color, ping.alpha);
          ctx.textAlign = 'center';
          ctx.fillText(ping.label, ping.x, ping.y - ping.radius - 4);
        }
        ctx.restore();

        return true;
      });

      // ─────────────────────────────────────────────────────────────
      // 9. SURVEYOR HUD RETICLE FOLLOWING USER MOUSE
      // ─────────────────────────────────────────────────────────────
      if (mouseRef.current.active && interactive) {
        const mx = mouseRef.current.x * width;
        const my = mouseRef.current.y * height;

        ctx.save();
        ctx.translate(mx, my);

        // Circular reticle
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.strokeStyle = hexToRgba(accentColor, 0.55);
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();

        // Crosshairs
        ctx.setLineDash([]);
        ctx.strokeStyle = hexToRgba(accentColor, 0.7);
        ctx.beginPath();
        ctx.moveTo(-32, 0); ctx.lineTo(-12, 0);
        ctx.moveTo(12, 0);  ctx.lineTo(32, 0);
        ctx.moveTo(0, -32); ctx.lineTo(0, -12);
        ctx.moveTo(0, 12);  ctx.lineTo(0, 32);
        ctx.stroke();

        // Center micro-dot
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        // Realtime floating coordinate badge
        ctx.font = '9px monospace';
        ctx.fillStyle = '#F5FAF9';
        ctx.textAlign = 'left';
        ctx.fillText(`LAT 23°${Math.floor(13 + mouseRef.current.y * 10)}'${Math.floor(mouseRef.current.x * 60)}"N`, 36, -8);
        ctx.fillText(`LON 72°${Math.floor(35 + mouseRef.current.x * 12)}'${Math.floor(mouseRef.current.y * 60)}"E`, 36, 4);
        ctx.fillStyle = hexToRgba(accentColor, 0.9);
        ctx.fillText(`Z: +${(32 + mouseRef.current.y * 40).toFixed(1)}m AMSL • RTK-FIX`, 36, 16);

        ctx.restore();
      }

      ctx.restore(); // Restore parallax translate

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    // Mouse Tracking Event Handlers
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const normX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const normY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

      mouseRef.current.targetX = normX;
      mouseRef.current.targetY = normY;
      mouseRef.current.active = true;

      // Update HUD telemetry periodically
      const degLat = 23;
      const minLat = Math.floor(12 + normY * 8);
      const secLat = Math.floor(normX * 59);

      const degLon = 72;
      const minLon = Math.floor(36 + normX * 10);
      const secLon = Math.floor(normY * 59);

      setTelemetry(prev => ({
        ...prev,
        coords: `${degLat}°${minLat}'${secLat}" N  ${degLon}°${minLon}'${secLon}" E`,
        elevation: `${(42.5 + normY * 28.4).toFixed(1)} m AMSL`,
      }));
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.targetX = 0.5;
      mouseRef.current.targetY = 0.5;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [accentColor, hexToRgba, interactive]);

  return (
    <div ref={containerRef} className="bhoomi-geospatial-bg-root" aria-hidden="true">
      {/* Dynamic Ambient Color Bloom tied to Selected Role */}
      <div
        className="bhoomi-dynamic-bloom"
        style={{
          background: `radial-gradient(ellipse 980px 620px at 50% 25%, ${glowColor} 0%, transparent 72%)`,
        }}
      />
      
      {/* Secondary Ambient Bloom in Lower Right */}
      <div
        className="bhoomi-dynamic-sub-bloom"
        style={{
          background: `radial-gradient(circle 650px at 85% 85%, ${hexToRgba(accentColor, 0.12)} 0%, transparent 68%)`,
        }}
      />

      {/* High-Performance 60FPS Geospatial Cadastral Canvas */}
      <canvas ref={canvasRef} className="bhoomi-geospatial-canvas" />

      {/* Deep Executive Vignette Overlay (Guarantees Content Readability) */}
      <div className="bhoomi-gis-vignette" />

      {/* Floating Precision Survey Telemetry Watermark Header (Top Right) */}
      <div className="bhoomi-gis-hud-top-right">
        <div className="bhoomi-hud-pill">
          <span className="bhoomi-hud-dot" style={{ backgroundColor: accentColor }} />
          <span className="bhoomi-hud-txt">NavIC Satellites: <strong>{telemetry.satelliteCount} Fixed</strong></span>
          <span className="bhoomi-hud-divider">|</span>
          <span className="bhoomi-hud-txt">Accuracy: <strong>±0.03m (RTK)</strong></span>
        </div>
      </div>

      {/* Floating Bottom Cadastral Ribbon Watermark */}
      <div className="bhoomi-gis-hud-bottom">
        <div className="bhoomi-hud-item">
          <span className="bhoomi-hud-label">APEX GEODETIC GRID:</span>
          <span className="bhoomi-hud-val">{telemetry.coords}</span>
        </div>
        <div className="bhoomi-hud-item">
          <span className="bhoomi-hud-label">ELEVATION:</span>
          <span className="bhoomi-hud-val">{telemetry.elevation}</span>
        </div>
        <div className="bhoomi-hud-item">
          <span className="bhoomi-hud-label">INFRASTRUCTURE ROW:</span>
          <span className="bhoomi-hud-val" style={{ color: accentColor }}>
            MAHSR 508KM • WESTERN DFC • BHARATMALA
          </span>
        </div>
        <div className="bhoomi-hud-item">
          <span className="bhoomi-hud-label">CADASTRE CADRE:</span>
          <span className="bhoomi-hud-val">RFCTLARR 2013 SEC 11/19 ENGINE</span>
        </div>
      </div>
    </div>
  );
};

export default GeospatialAnimatedBackground;
