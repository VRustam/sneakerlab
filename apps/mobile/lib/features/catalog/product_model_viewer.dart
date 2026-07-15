import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:model_viewer_plus/model_viewer_plus.dart';

const _bundledDemoModelUrl = '/models/pulse-layer.gltf';
const _bundledDemoModelAsset = 'assets/models/pulse-layer.gltf';

/// Returns only bundled or HTTPS model sources.
///
/// HTTP is allowed exclusively for a local development server while debugging.
/// This prevents an admin-supplied product record from silently loading an
/// insecure remote model in a release build.
String? resolveProductModelSource(String? modelUrl) {
  if (modelUrl == _bundledDemoModelUrl) {
    return _bundledDemoModelAsset;
  }

  final modelUri = Uri.tryParse(modelUrl ?? '');
  if (modelUri == null) {
    return null;
  }
  if (modelUri.scheme == 'https' && modelUri.host.isNotEmpty) {
    return modelUrl;
  }

  final isLocalHttp =
      kDebugMode &&
      modelUri.scheme == 'http' &&
      (modelUri.host == 'localhost' || modelUri.host == '127.0.0.1');
  return isLocalHttp ? modelUrl : null;
}

class ProductModelViewer extends StatelessWidget {
  const ProductModelViewer({
    super.key,
    required this.productName,
    this.modelUrl,
    this.posterUrl,
  });

  final String productName;
  final String? modelUrl;
  final String? posterUrl;

  @override
  Widget build(BuildContext context) {
    final modelSource = resolveProductModelSource(modelUrl);
    if (modelSource == null) {
      return _ModelImageFallback(
        productName: productName,
        posterUrl: posterUrl,
      );
    }

    return Semantics(
      label: '$productName interactive 3D preview',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            height: 300,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: ModelViewer(
                alt: 'A 3D model of $productName',
                ar: false,
                autoRotate: false,
                cameraControls: true,
                disableZoom: false,
                poster: posterUrl,
                src: modelSource,
              ),
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Drag to rotate and pinch to zoom. If the 3D preview cannot load, use the product images above.',
          ),
        ],
      ),
    );
  }
}

class _ModelImageFallback extends StatelessWidget {
  const _ModelImageFallback({required this.productName, this.posterUrl});

  final String productName;
  final String? posterUrl;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: '$productName 3D preview unavailable',
      child: Container(
        constraints: const BoxConstraints(minHeight: 144),
        decoration: BoxDecoration(
          border: Border.all(
            color: Theme.of(context).colorScheme.outlineVariant,
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (posterUrl != null)
              ClipRRect(
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(16),
                ),
                child: Image.network(
                  posterUrl!,
                  fit: BoxFit.cover,
                  height: 160,
                  width: double.infinity,
                  errorBuilder: (_, _, _) => const SizedBox.shrink(),
                ),
              ),
            const Padding(
              padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
              child: Icon(Icons.threed_rotation_outlined, size: 32),
            ),
            const Padding(
              padding: EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Text(
                '3D preview unavailable. The product image gallery remains available.',
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
