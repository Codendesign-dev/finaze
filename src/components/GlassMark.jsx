import { useEffect, useRef, useState } from "react";
import { asset } from "../lib/gsap";

/**
 * The Finaze mark as a real 3D glass object (Three.js, loaded on demand).
 * The vector paths from the PDF are extruded with rounded bevels and given a
 * glossy physical material in brand navy, on a transparent canvas over the
 * card's white panel. It renders only while on screen; reduced motion shows a
 * still pose.
 */
export default function GlassMark({ className = "" }) {
  const wrapRef = useRef(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    let disposed = false;
    let cleanup = () => {};

    // Three.js (~170KB) and the extrusion are heavy, so nothing loads until the
    // card is near the viewport, and then only once the main thread is idle.
    const start = async () => {
      const THREE = await import("three");
      const { SVGLoader } = await import("three/examples/jsm/loaders/SVGLoader.js");
      const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
      const svgText = await fetch(asset("brand/mark-face.svg")).then((r) => r.text());
      // No awaits after this point, so an unmount can never leave a stray canvas.
      if (disposed) return;

      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      } catch {
        setFallback(true);
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      wrap.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTex;

      const camera = new THREE.PerspectiveCamera(28, 1, 1, 1000);
      camera.position.set(0, 0, 215); // the mark fills about half the panel height

      // Extrude the mark from its SVG paths.
      const data = new SVGLoader().parse(svgText);
      const shapes = data.paths.flatMap((p) => SVGLoader.createShapes(p));
      const geo = new THREE.ExtrudeGeometry(shapes, {
        depth: 7,
        bevelEnabled: true,
        bevelThickness: 1.2,
        bevelSize: 0.7,
        bevelSegments: 3,
        curveSegments: 8,
      });
      geo.center();
      geo.computeVertexNormals();

      // Solid navy, lit softly so the faces read as brand navy (#001a56); the glossy
      // clearcoat still catches highlights on the bevels.
      const glass = new THREE.MeshPhysicalMaterial({
        color: 0x001a56,
        metalness: 0,
        roughness: 0.16,
        transmission: 0,
        thickness: 6,
        ior: 1.52,
        dispersion: 0.2,
        attenuationColor: new THREE.Color(0x001a56),
        attenuationDistance: 2,
        clearcoat: 1,
        clearcoatRoughness: 0.03,
        specularIntensity: 1,
        specularColor: new THREE.Color(0xdfe9ff),
        envMapIntensity: 0.15, // the room map is bright; more lifts navy to royal blue
        toneMapped: false, // ACES pushes navy towards royal blue; keep the brand hue
      });
      const mark = new THREE.Mesh(geo, glass);
      mark.scale.set(1.25, -1.25, 1.25); // SVG y points down
      const pivot = new THREE.Group();
      pivot.add(mark);
      scene.add(pivot);

      const key = new THREE.DirectionalLight(0xffffff, 0.9);
      key.position.set(40, 60, 80);
      scene.add(key, new THREE.AmbientLight(0xffffff, 0.15));

      const resize = () => {
        const w = wrap.clientWidth;
        const h = wrap.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        render(performance.now());
      };

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let raf = 0;
      let visible = false;
      const t0 = performance.now();
      function render(now) {
        const t = (now - t0) / 1000;
        // Smooth continuous turn with a gentle tilt so the edges catch light.
        pivot.rotation.y = reduced ? 0.45 : t * ((Math.PI * 2) / 7);
        pivot.rotation.x = reduced ? -0.08 : Math.sin(t * 0.6) * 0.12;
        renderer.render(scene, camera);
      }
      const loop = (now) => {
        render(now);
        raf = visible && !reduced ? requestAnimationFrame(loop) : 0;
      };

      const ro = new ResizeObserver(resize);
      ro.observe(wrap);
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible && !raf && !reduced) raf = requestAnimationFrame(loop);
      });
      io.observe(wrap);
      resize();

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        geo.dispose();
        glass.dispose();
        envTex.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    };

    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1));
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        near.disconnect();
        idle(() => !disposed && start(), { timeout: 1500 });
      },
      { rootMargin: "600px 0px" }
    );
    near.observe(wrap);

    return () => {
      disposed = true;
      near.disconnect();
      cleanup();
    };
  }, []);

  return (
    <div ref={wrapRef} className={`glass-mark ${className}`} aria-hidden="true">
      {fallback && <img className="glass-mark__fallback" src={asset("brand/mark-face.svg")} alt="" />}
    </div>
  );
}
