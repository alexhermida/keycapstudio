import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { KeycapModel, MeshData } from '../geometry/types';
import { useI18n } from '../i18n';

type View = 'perspective' | 'top' | 'underside';
interface Props {
  model?: KeycapModel;
  bodyColor: string;
  legendColor: string;
}

export default function Preview({ model, bodyColor, legendColor }: Props) {
  const { t } = useI18n();
  const translation = useRef(t);
  const host = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    group: THREE.Group;
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
  }>(null);
  const [view, setView] = useState<View>('perspective');
  const [failed, setFailed] = useState(false);
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    translation.current = t;
  }, [t]);

  useEffect(() => {
    const element = host.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      queueMicrotask(() => setFailed(true));
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    renderer.domElement.setAttribute('aria-label', translation.current('canvasLabel'));
    renderer.domElement.setAttribute('role', 'img');
    const lost = (event: Event) => {
      event.preventDefault();
      setContextLost(true);
    };
    const restored = () => {
      setContextLost(false);
      render();
    };
    renderer.domElement.addEventListener('webglcontextlost', lost);
    renderer.domElement.addEventListener('webglcontextrestored', restored);
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xf8ffff, 0x6f7670, 0.9));
    const key = new THREE.DirectionalLight(0xffffff, 2);
    key.position.set(-20, 30, 50);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xd4ead9, 0.5);
    fill.position.set(20, -20, 12);
    scene.add(fill);
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 500);
    camera.up.set(0, 0, 1);
    camera.position.set(31, -44, 38);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 5);
    controls.minDistance = 25;
    controls.maxDistance = 100;
    controls.enablePan = false;
    controls.enableDamping = false;
    const group = new THREE.Group();
    scene.add(group);
    const render = () => renderer.render(scene, camera);
    controls.addEventListener('change', render);
    const resize = new ResizeObserver(() => {
      const { width, height } = element.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      render();
    });
    resize.observe(element);
    controls.update();
    sceneRef.current = { group, renderer, scene, camera, controls };
    return () => {
      resize.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener('webglcontextlost', lost);
      renderer.domElement.removeEventListener('webglcontextrestored', restored);
      renderer.dispose();
      renderer.domElement.remove();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    sceneRef.current?.renderer.domElement.setAttribute('aria-label', t('canvasLabel'));
  }, [t]);

  useEffect(() => {
    const context = sceneRef.current;
    if (!context || !model) return;
    const geometry = (data: MeshData) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(data.positions, 3));
      geo.setIndex(new THREE.BufferAttribute(data.indices, 1));
      // Flat normals preserve crisp taper edges; dense tessellation smooths the dish.
      const flat = geo.toNonIndexed();
      geo.dispose();
      flat.computeVertexNormals();
      return flat;
    };
    const body = new THREE.Mesh(
      geometry(model.body),
      new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.48, metalness: 0.02 }),
    );
    const legend = new THREE.Mesh(
      geometry(model.legend),
      new THREE.MeshStandardMaterial({ color: legendColor, roughness: 0.5 }),
    );
    context.group.add(body, legend);
    context.renderer.render(context.scene, context.camera);
    return () => {
      context.group.remove(body, legend);
      body.geometry.dispose();
      body.material.dispose();
      legend.geometry.dispose();
      legend.material.dispose();
    };
  }, [model, bodyColor, legendColor]);

  useEffect(() => {
    const c = sceneRef.current;
    if (!c) return;
    if (view === 'top') c.camera.position.set(0, -0.01, 62);
    else if (view === 'underside') c.camera.position.set(20, -28, -43);
    else c.camera.position.set(31, -44, 38);
    c.controls.update();
    c.renderer.render(c.scene, c.camera);
  }, [view]);

  return (
    <>
      <div ref={host} className="canvas-host" />
      {failed || contextLost ? (
        <div className="preview-fallback" role="status">
          {contextLost ? t('previewPaused') : t('previewUnavailable')}
        </div>
      ) : null}
      <div className="view-toolbar" aria-label={t('previewCamera')}>
        {(['perspective', 'top', 'underside'] as const).map((v) => (
          <button key={v} aria-pressed={view === v} onClick={() => setView(v)}>
            {v === 'perspective' ? t('perspective') : v === 'top' ? t('top') : t('underside')}
          </button>
        ))}
      </div>
    </>
  );
}
