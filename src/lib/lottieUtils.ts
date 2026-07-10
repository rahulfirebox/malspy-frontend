interface LottieAnimationData {
  w?: number;
  h?: number;
  layers?: Array<{
    ind?: number;
    ty?: number;
    shapes?: unknown[];
    hd?: number;
  }>;
  [key: string]: unknown;
}

/** Remove full-canvas white rectangle layers baked into some Lottie exports. */
export function stripLottieBackground(data: LottieAnimationData): LottieAnimationData {
  if (!Array.isArray(data.layers)) return data;

  const width = data.w ?? 0;
  const height = data.h ?? 0;
  const serialized = (layer: { shapes?: unknown[] }) => JSON.stringify(layer.shapes ?? []);

  const layers = data.layers.filter(layer => {
    if (layer.hd === 1) return false;
    if (layer.ty !== 4 || !layer.shapes?.length) return true;

    const shapes = serialized(layer);
    const isFullCanvasRect =
      width > 0 &&
      height > 0 &&
      shapes.includes('"ty":"rc"') &&
      shapes.includes(`[${width},${height}]`) &&
      (shapes.includes('[1,1,1,1]') || shapes.includes('[1, 1, 1, 1]'));

    return !isFullCanvasRect;
  });

  return { ...data, layers };
}
