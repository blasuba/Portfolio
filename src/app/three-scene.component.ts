import {
  AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, inject, input, viewChild,
} from '@angular/core';
import type * as THREE_NS from 'three';

export type SceneVariant = 'globe' | 'field' | 'orbit' | 'wave';

const BLUE = 0x60a5fa;
const AMBER = 0xf59e0b;
const DEEP_BLUE = 0x3b82f6; // reads on both the light and dark section backgrounds

/** Safe media-query check: false where matchMedia is unavailable (e.g. test DOMs). */
const mediaMatches = (query: string): boolean =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(query).matches;

/**
 * Decorative WebGL scene (wireframe shapes + particles) rendered with three.js.
 *
 * - three.js is loaded lazily, so it never adds to the initial bundle.
 * - Renders only while on screen and while the tab is visible.
 * - Reduced motion: renders a single still frame. No WebGL: renders nothing.
 */
@Component({
  selector: 'app-three-scene',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `<canvas #canvas></canvas>`,
  styles: [`
    :host { display: block; pointer-events: none; }
    canvas { display: block; width: 100%; height: 100%; opacity: 0; transition: opacity 1.2s ease; }
    canvas.is-ready { opacity: 1; }
  `],
})
export class ThreeSceneComponent implements AfterViewInit, OnDestroy {
  /** `globe`: wireframe sphere around a knot (hero). `field`: particle field with a drifting knot (contact). */
  readonly variant = input<SceneVariant>('globe');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  private readonly reducedMotion = mediaMatches('(prefers-reduced-motion: reduce)');
  private readonly finePointer = mediaMatches('(hover: hover) and (pointer: fine)');

  private three: typeof THREE_NS | undefined;
  private renderer: THREE_NS.WebGLRenderer | undefined;
  private scene: THREE_NS.Scene | undefined;
  private camera: THREE_NS.PerspectiveCamera | undefined;
  private outer: THREE_NS.Object3D | undefined;
  private inner: THREE_NS.Object3D | undefined;
  private points: THREE_NS.Points | undefined;
  /** Orbit variant: whole-scene group (pointer tilt) and one spinning group per ring. */
  private root: THREE_NS.Object3D | undefined;
  private orbits: THREE_NS.Object3D[] = [];
  /** Wave variant: the particle grid whose heights are recomputed every frame. */
  private wave: THREE_NS.BufferAttribute | undefined;
  private time = 0;

  private frame: number | undefined;
  private visible = true;
  private destroyed = false;
  private pointerX = 0;
  private pointerY = 0;
  private tiltX = 0;
  private tiltY = 0;
  private resizeObserver: ResizeObserver | undefined;
  private visibilityObserver: IntersectionObserver | undefined;

  private readonly onPointerMove = (event: PointerEvent): void => {
    this.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointerY = (event.clientY / window.innerHeight) * 2 - 1;
  };

  private readonly onVisibilityChange = (): void => this.syncLoop();

  async ngAfterViewInit(): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      this.three = await import('three');
    } catch {
      return; // chunk failed to load: the page works without the effect
    }
    if (this.destroyed) return;
    if (!this.setup()) return;

    this.observe();
    if (this.finePointer && !this.reducedMotion) {
      window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    }
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.renderFrame();
    this.canvasRef().nativeElement.classList.add('is-ready');
    this.syncLoop();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.stopLoop();
    this.resizeObserver?.disconnect();
    this.visibilityObserver?.disconnect();
    window.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.scene?.traverse((obj) => {
      const mesh = obj as THREE_NS.Mesh;
      mesh.geometry?.dispose();
      const material = mesh.material as THREE_NS.Material | THREE_NS.Material[] | undefined;
      if (Array.isArray(material)) material.forEach((m) => m.dispose());
      else material?.dispose();
    });
    this.renderer?.dispose();
  }

  // ─────────────────────────── Setup ───────────────────────────

  /** Builds renderer, camera and scene. Returns false when WebGL is unavailable. */
  private setup(): boolean {
    const THREE = this.three!;
    const canvas = this.canvasRef().nativeElement;
    try {
      this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch {
      return false;
    }
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
    this.camera.position.z = this.variant() === 'globe' ? 30 : 40;
    if (this.variant() === 'wave') {
      this.camera.position.set(0, 9, 30);
      this.camera.lookAt(0, -1, 0);
    }

    const variant = this.variant();
    if (variant === 'globe') this.buildGlobe(THREE);
    else if (variant === 'orbit') this.buildOrbit(THREE);
    else if (variant === 'wave') this.buildWave(THREE);
    else this.buildField(THREE);
    this.resize();
    return true;
  }

  private buildGlobe(THREE: typeof THREE_NS): void {
    this.outer = new THREE.Mesh(
      new THREE.IcosahedronGeometry(12, 2),
      new THREE.MeshBasicMaterial({ color: BLUE, wireframe: true, transparent: true, opacity: 0.32 }),
    );
    this.inner = new THREE.Mesh(
      new THREE.TorusKnotGeometry(5.2, 1.3, 120, 14),
      new THREE.MeshBasicMaterial({ color: AMBER, wireframe: true, transparent: true, opacity: 0.38 }),
    );
    this.points = this.particles(THREE, 260, 30);
    this.scene!.add(this.outer, this.inner, this.points);
  }

  private buildField(THREE: typeof THREE_NS): void {
    this.outer = new THREE.Mesh(
      new THREE.TorusKnotGeometry(9, 2.4, 160, 16),
      new THREE.MeshBasicMaterial({ color: BLUE, wireframe: true, transparent: true, opacity: 0.18 }),
    );
    this.outer.position.set(16, -2, -6);
    this.inner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(3.2, 1),
      new THREE.MeshBasicMaterial({ color: AMBER, wireframe: true, transparent: true, opacity: 0.55 }),
    );
    this.inner.position.set(24, 12, 0);
    this.points = this.particles(THREE, 900, 90);
    this.scene!.add(this.outer, this.inner, this.points);
  }

  /**
   * Career orbits: three tilted rings (one per role) around a wireframe core,
   * each carrying a small "planet" that travels along it.
   */
  private buildOrbit(THREE: typeof THREE_NS): void {
    this.root = new THREE.Group();
    this.inner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.6, 1),
      new THREE.MeshBasicMaterial({ color: AMBER, wireframe: true, transparent: true, opacity: 0.75 }),
    );
    this.root.add(this.inner);

    const rings = [
      { radius: 6.5, tiltX: 1.15, tiltY: 0.2, color: AMBER },
      { radius: 10, tiltX: 1.35, tiltY: -0.45, color: DEEP_BLUE },
      { radius: 13.5, tiltX: 1.05, tiltY: 0.6, color: DEEP_BLUE },
    ];
    for (const ring of rings) {
      const orbit = new THREE.Group();
      orbit.rotation.set(ring.tiltX, ring.tiltY, Math.random() * Math.PI * 2);
      orbit.add(new THREE.Mesh(
        new THREE.TorusGeometry(ring.radius, 0.045, 6, 180),
        new THREE.MeshBasicMaterial({ color: ring.color, transparent: true, opacity: 0.55 }),
      ));
      const planet = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 16, 12),
        new THREE.MeshBasicMaterial({ color: ring.color }),
      );
      planet.position.set(ring.radius, 0, 0);
      orbit.add(planet);
      this.orbits.push(orbit);
      this.root.add(orbit);
    }
    this.points = this.particles(THREE, 220, 40);
    this.root.add(this.points);
    this.scene!.add(this.root);
  }

  /** A rolling terrain of particles: blue in the distance, warming to amber up front. */
  private buildWave(THREE: typeof THREE_NS): void {
    const cols = 80;
    const rows = 26;
    const gap = 1.05;
    const positions = new Float32Array(cols * rows * 3);
    const colors = new Float32Array(cols * rows * 3);
    const far = new THREE.Color(DEEP_BLUE);
    const near = new THREE.Color(AMBER);
    const mixed = new THREE.Color();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = (r * cols + c) * 3;
        positions[i] = (c - cols / 2) * gap;
        positions[i + 2] = (r - rows / 2) * gap;
        mixed.copy(far).lerp(near, Math.pow(r / (rows - 1), 2.2) * 0.85);
        colors[i] = mixed.r;
        colors[i + 1] = mixed.g;
        colors[i + 2] = mixed.b;
      }
    }
    const geometry = new THREE.BufferGeometry();
    this.wave = new THREE.BufferAttribute(positions, 3);
    geometry.setAttribute('position', this.wave);
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.points = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({ size: 0.2, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false }),
    );
    this.root = new THREE.Group();
    this.root.add(this.points);
    this.scene!.add(this.root);
    this.updateWave(); // so a reduced-motion still frame shows waves, not a flat sheet
  }

  private updateWave(): void {
    if (!this.wave) return;
    const p = this.wave.array as Float32Array;
    const t = this.time;
    for (let i = 0; i < p.length; i += 3) {
      const x = p[i];
      const z = p[i + 2];
      p[i + 1] = Math.sin(x * 0.22 + t) * 1.3 + Math.cos(z * 0.38 + t * 0.8) * 0.9;
    }
    this.wave.needsUpdate = true;
  }

  /** Random particle cloud in a cube of `spread` units, tinted blue and amber. */
  private particles(THREE: typeof THREE_NS, count: number, spread: number): THREE_NS.Points {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const blue = new THREE.Color(BLUE);
    const amber = new THREE.Color(AMBER);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
      const c = Math.random() > 0.7 ? amber : blue;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return new THREE.Points(
      geometry,
      new THREE.PointsMaterial({ size: 0.22, vertexColors: true, transparent: true, opacity: 0.75, depthWrite: false }),
    );
  }

  // ─────────────────────────── Lifecycle helpers ───────────────────────────

  private observe(): void {
    const host = this.host.nativeElement;
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.resize();
        if (this.frame === undefined) this.renderFrame();
      });
      this.resizeObserver.observe(host);
    }
    if (typeof IntersectionObserver !== 'undefined') {
      this.visibilityObserver = new IntersectionObserver(([entry]) => {
        this.visible = entry.isIntersecting;
        this.syncLoop();
      }, { rootMargin: '100px' });
      this.visibilityObserver.observe(host);
    }
  }

  private resize(): void {
    const host = this.host.nativeElement;
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    this.renderer?.setSize(width, height, false);
    if (this.camera) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
  }

  /** Runs the animation loop only when it is worth running. */
  private syncLoop(): void {
    const shouldRun = !this.reducedMotion && this.visible && !document.hidden && !this.destroyed;
    if (shouldRun && this.frame === undefined) {
      const loop = (): void => {
        this.step();
        this.renderFrame();
        this.frame = requestAnimationFrame(loop);
      };
      this.frame = requestAnimationFrame(loop);
    } else if (!shouldRun) {
      this.stopLoop();
    }
  }

  private stopLoop(): void {
    if (this.frame !== undefined) cancelAnimationFrame(this.frame);
    this.frame = undefined;
  }

  /** Advances rotation; eases a gentle tilt toward the pointer. */
  private step(): void {
    this.tiltX += (this.pointerX * 0.35 - this.tiltX) * 0.04;
    this.tiltY += (this.pointerY * 0.25 - this.tiltY) * 0.04;

    if (this.outer) {
      this.outer.rotation.y += 0.0022;
      this.outer.rotation.x = 0.25 + this.tiltY;
      this.outer.rotation.z = this.tiltX * 0.3;
    }
    if (this.inner) {
      this.inner.rotation.y -= 0.004;
      this.inner.rotation.x += 0.0015;
    }
    if (this.root) {
      this.root.rotation.y = this.tiltX * 0.6;
      this.root.rotation.x = this.tiltY * 0.4;
    }
    this.orbits.forEach((orbit, i) => { orbit.rotation.z += 0.0045 / (1 + i * 0.45); });
    if (this.wave) {
      this.time += 0.014;
      this.updateWave();
      if (this.root) this.root.rotation.y = this.tiltX * 0.25; // gentle sway only
      return;
    }
    if (this.points) {
      this.points.rotation.y += 0.0006;
      this.points.rotation.x = this.tiltY * 0.3;
    }
  }

  private renderFrame(): void {
    if (this.renderer && this.scene && this.camera) this.renderer.render(this.scene, this.camera);
  }
}
