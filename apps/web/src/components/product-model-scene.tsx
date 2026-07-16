'use client';

import { Center, ContactShadows, OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import Image from 'next/image';
import { Component, Suspense, type ReactNode } from 'react';

interface ProductModelSceneProps {
  modelUrl: string;
  onError: () => void;
  fallbackImage: {
    src: string;
    alt: string;
  };
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

function CanvasUnavailable({ fallbackImage }: Pick<ProductModelSceneProps, 'fallbackImage'>) {
  return (
    <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_22%_18%,rgba(104,119,255,0.33),transparent_26%),radial-gradient(circle_at_82%_78%,rgba(188,255,78,0.16),transparent_30%),linear-gradient(145deg,#101a22,#05090c_65%)]">
      <div className="absolute inset-0 bg-[linear-gradient(130deg,transparent,rgba(255,255,255,0.04),transparent)]" />
      <Image
        alt={fallbackImage.alt}
        className="relative h-[82%] w-[82%] object-contain [filter:drop-shadow(0_28px_30px_rgba(0,0,0,0.62))] [transform-style:preserve-3d] animate-[sneaker-orbit_7s_ease-in-out_infinite]"
        height={960}
        priority
        src={fallbackImage.src}
        width={960}
      />
      <div className="pointer-events-none absolute left-5 top-5 rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[0.64rem] font-bold uppercase tracking-[0.18em] text-white/65 backdrop-blur">
        Motion preview
      </div>
    </div>
  );
}

function CommerceShoe({ modelUrl }: Pick<ProductModelSceneProps, 'modelUrl'>) {
  const { scene } = useGLTF(modelUrl);

  return (
    <group position={[0, -0.72, 0]} rotation={[0.08, -0.38, 0]} scale={14}>
      <primitive object={scene} />
    </group>
  );
}

export function ProductModelScene({ fallbackImage, modelUrl, onError }: ProductModelSceneProps) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_22%_18%,rgba(104,119,255,0.33),transparent_26%),radial-gradient(circle_at_82%_78%,rgba(188,255,78,0.16),transparent_30%),linear-gradient(145deg,#101a22,#05090c_65%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_26px_60px_-32px_rgba(0,0,0,0.9)] sm:aspect-[16/10]">
      <div className="pointer-events-none absolute left-5 top-5 z-10 rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[0.64rem] font-bold uppercase tracking-[0.18em] text-white/65 backdrop-blur">
        Live 3D
      </div>
      <Canvas
        camera={{ fov: 33, position: [4.8, 2.7, 6.8] }}
        dpr={[1, 1.4]}
        fallback={<CanvasUnavailable fallbackImage={fallbackImage} />}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        shadows
      >
        <color args={['#071016']} attach="background" />
        <ambientLight intensity={0.58} />
        <directionalLight
          castShadow
          color="#dce7ff"
          intensity={2.4}
          position={[4, 6, 4]}
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight color="#6877ff" intensity={2.1} position={[-4, 2, -3]} />
        <pointLight color="#b9ff6b" intensity={1.15} position={[1, -1, 3]} />
        <SceneErrorBoundary onError={onError}>
          <Suspense fallback={null}>
            <Center>
              <CommerceShoe modelUrl={modelUrl} />
            </Center>
            <ContactShadows
              blur={2.8}
              color="#000000"
              far={4.5}
              opacity={0.78}
              position={[0, -1.16, 0]}
              scale={8}
            />
          </Suspense>
        </SceneErrorBoundary>
        <OrbitControls
          autoRotate
          autoRotateSpeed={0.72}
          enableDamping
          enablePan={false}
          maxDistance={8}
          minDistance={3.4}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}
