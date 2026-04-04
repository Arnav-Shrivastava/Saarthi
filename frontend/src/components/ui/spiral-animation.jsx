'use client'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

class Vector2D {
  constructor(x, y) { this.x = x; this.y = y; }
  static random(min, max) { return min + Math.random() * (max - min); }
}

class Vector3D {
  constructor(x, y, z) { this.x = x; this.y = y; this.z = z; }
}

class AnimationController {
  constructor(canvas, ctx, dpr, size) {
    this.changeEventTime = 0.32;
    this.cameraZ = -400;
    this.cameraTravelDistance = 3400;
    this.startDotYOffset = 28;
    this.viewZoom = 100;
    this.numberOfStars = 5000;
    this.trailLength = 80;
    this.time = 0;
    this.canvas = canvas;
    this.ctx = ctx;
    this.dpr = dpr;
    this.size = size;
    this.stars = [];
    this.timeline = gsap.timeline({ repeat: -1 });
    this.createStars();
    this.setupTimeline();
  }

  createStars() {
    for (let i = 0; i < this.numberOfStars; i++) {
      this.stars.push(new Star(this.cameraZ, this.cameraTravelDistance));
    }
  }

  setupTimeline() {
    this.timeline.to(this, {
      time: 1, duration: 15, repeat: -1, ease: "none",
      onUpdate: () => this.render()
    });
  }

  ease(p, g) {
    return p < 0.5 ? 0.5 * Math.pow(2 * p, g) : 1 - 0.5 * Math.pow(2 * (1 - p), g);
  }

  easeOutElastic(x) {
    const c4 = (2 * Math.PI) / 4.5;
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return Math.pow(2, -8 * x) * Math.sin((x * 8 - 0.75) * c4) + 1;
  }

  map(value, s1, st1, s2, st2) { return s2 + (st2 - s2) * ((value - s1) / (st1 - s1)); }
  constrain(v, min, max) { return Math.min(Math.max(v, min), max); }
  lerp(s, e, t) { return s * (1 - t) + e * t; }

  spiralPath(p) {
    p = this.constrain(1.2 * p, 0, 1);
    p = this.ease(p, 1.8);
    const turns = 6;
    const theta = 2 * Math.PI * turns * Math.sqrt(p);
    const r = 170 * Math.sqrt(p);
    return new Vector2D(r * Math.cos(theta), r * Math.sin(theta) + this.startDotYOffset);
  }

  showProjectedDot(position, sizeFactor) {
    const t2 = this.constrain(this.map(this.time, this.changeEventTime, 1, 0, 1), 0, 1);
    const newCameraZ = this.cameraZ + this.ease(Math.pow(t2, 1.2), 1.8) * this.cameraTravelDistance;
    if (position.z > newCameraZ) {
      const depth = position.z - newCameraZ;
      const x = this.viewZoom * position.x / depth;
      const y = this.viewZoom * position.y / depth;
      const sw = 400 * sizeFactor / depth;
      this.ctx.lineWidth = sw;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 0.5, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  render() {
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, this.size, this.size);
    ctx.save();
    ctx.translate(this.size / 2, this.size / 2);
    const t1 = this.constrain(this.map(this.time, 0, this.changeEventTime + 0.25, 0, 1), 0, 1);
    const t2 = this.constrain(this.map(this.time, this.changeEventTime, 1, 0, 1), 0, 1);
    ctx.rotate(-Math.PI * this.ease(t2, 2.7));
    this.drawTrail(t1);
    ctx.fillStyle = 'white';
    for (const star of this.stars) star.render(t1, this);
    ctx.restore();
  }

  drawTrail(t1) {
    for (let i = 0; i < this.trailLength; i++) {
      const f = this.map(i, 0, this.trailLength, 1.1, 0.1);
      const sw = (1.3 * (1 - t1) + 3.0 * Math.sin(Math.PI * t1)) * f;
      this.ctx.fillStyle = 'white';
      const pathTime = t1 - 0.00015 * i;
      const position = this.spiralPath(pathTime);
      this.ctx.beginPath();
      this.ctx.arc(position.x, position.y, sw / 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  pause() { this.timeline.pause(); }
  resume() { this.timeline.play(); }
  destroy() { this.timeline.kill(); }
}

class Star {
  constructor(cameraZ, cameraTravelDistance) {
    this.angle = Math.random() * Math.PI * 2;
    this.distance = 30 * Math.random() + 15;
    this.rotationDirection = Math.random() > 0.5 ? 1 : -1;
    this.expansionRate = 1.2 + Math.random() * 0.8;
    this.finalScale = 0.7 + Math.random() * 0.6;
    this.dx = this.distance * Math.cos(this.angle);
    this.dy = this.distance * Math.sin(this.angle);
    this.spiralLocation = (1 - Math.pow(1 - Math.random(), 3.0)) / 1.3;
    this.z = Vector2D.random(0.5 * cameraZ, cameraTravelDistance + cameraZ);
    this.z = this.z * 0.7 + (cameraTravelDistance / 2) * 0.3 * this.spiralLocation;
    this.strokeWeightFactor = Math.pow(Math.random(), 2.0);
  }

  render(p, ctrl) {
    const spiralPos = ctrl.spiralPath(this.spiralLocation);
    const q = p - this.spiralLocation;
    if (q > 0) {
      const dp = ctrl.constrain(4 * q, 0, 1);
      const easing = ctrl.easeOutElastic(dp);
      const screenX = spiralPos.x + this.dx * easing;
      const screenY = spiralPos.y + this.dy * easing;
      const vx = (this.z - ctrl.cameraZ) * screenX / ctrl.viewZoom;
      const vy = (this.z - ctrl.cameraZ) * screenY / ctrl.viewZoom;
      const position = new Vector3D(vx, vy, this.z);
      const sizeMultiplier = dp < 0.6 ? 1.0 + dp * 0.2 : 1.2 * (1.0 - (dp - 0.6) / 0.4) + this.finalScale * ((dp - 0.6) / 0.4);
      ctrl.showProjectedDot(position, 8.5 * this.strokeWeightFactor * sizeMultiplier);
    }
  }
}

export function SpiralAnimation() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const size = Math.max(dimensions.width, dimensions.height);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;
    ctx.scale(dpr, dpr);
    animationRef.current = new AnimationController(canvas, ctx, dpr, size);
    return () => {
      if (animationRef.current) { animationRef.current.destroy(); animationRef.current = null; }
    };
  }, [dimensions]);

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
