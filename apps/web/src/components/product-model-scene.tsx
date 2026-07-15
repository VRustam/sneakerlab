'use client';

import { Center, Html, OrbitControls, useGLTF, useProgress } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Component, type ReactNode, Suspense, useEffect, useMemo } from 'react';

interface ProductModelSceneProps {
  modelUrl: string;
  onError: () => void;
}

interface SceneErrorBoundaryProps {
  children: ReactNode;
  onError: () => void;
}

interface SceneErrorBoundaryState {
  hasError: boolean;
}

class SceneErrorBoundary extends Component<SceneErrorBoundaryProps, SceneErrorBoundaryState> {
  override state: SceneErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch() {
    this.props.onError();
  }

  override render() {
    return this.state.hasError ? null : this.props.children;
  }
}

function ModelLoadingState() {
  const { progress } = useProgress();
  return (
    <Html center>
      <p className="rounded-lg border border-border bg-background/95 px-3 py-2 text-sm font-medium shadow-sm">
        Loading 3D model{progress > 0 ? ` ${Math.round(progress)}%` : ''}…
      </p>
    </Html>
  );
}

function ModelAsset({ modelUrl }: Pick<ProductModelSceneProps, 'modelUrl'>) {
  const { scene } = useGLTF(modelUrl);
  const model = useMemo(() => scene.clone(true), [scene]);

  return (
    <Center>
      <primitive dispose={null} object={model} scale={1.1} />
    </Center>
  );
}

function CanvasUnavailable({ onError }: Pick<ProductModelSceneProps, 'onError'>) {
  useEffect(() => onError(), [onError]);
  return null;
}

export function ProductModelScene({ modelUrl, onError }: ProductModelSceneProps) {
  return (
    <div className="aspect-square overflow-hidden rounded-xl border border-border bg-gradient-to-br from-muted via-background to-muted/70">
      <Canvas
        camera={{ fov: 34, position: [3.8, 2.6, 5] }}
        dpr={[1, 1.75]}
        fallback={<CanvasUnavailable onError={onError} />}
        frameloop="demand"
        gl={{ antialias: true, powerPreference: 'low-power' }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight intensity={2.2} position={[4, 5, 3]} />
        <directionalLight color="#b9d8ff" intensity={1.1} position={[-4, 1, -3]} />
        <SceneErrorBoundary onError={onError}>
          <Suspense fallback={<ModelLoadingState />}>
            <ModelAsset modelUrl={modelUrl} />
          </Suspense>
        </SceneErrorBoundary>
        <OrbitControls
          enableDamping
          enablePan={false}
          maxDistance={7}
          minDistance={2.5}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}
