import type {
  AnnotationDto,
  CreateAnnotationDto,
  CreateRegionDto,
  RegionDto,
  UpdateRegionDto,
} from '../../../api/generated/types';
import type { AnnotationType } from '../../../types/status.types';
import type { CanvasAnnotation, CanvasRegion } from '../types/canvas.types';
import type { FabricImage } from 'fabric';

const ANNOTATION_TYPES: AnnotationType[] = ['Technical', 'Art', 'Content'];

interface Coordinates {
  top?: number;
  left?: number;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
}

export const parseCoordinatesJson = (
  json?: string | null,
): Pick<CanvasRegion, 'x' | 'y' | 'width' | 'height'> => {
  if (!json) return { x: 0, y: 0, width: 0, height: 0 };
  try {
    const c = JSON.parse(json) as Coordinates;
    return {
      x: c.left ?? c.x ?? 0,
      y: c.top ?? c.y ?? 0,
      width: c.width ?? 0,
      height: c.height ?? 0,
    };
  } catch {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
};

/** Parse điểm ghim từ coordinatesJson khi Mangaka yêu cầu sửa Task (mảng [{x,y,type,comment}]). */
export const parseTaskRevisionPins = (
  json?: string | null,
): Array<{ x: number; y: number; type: AnnotationType; comment: string }> => {
  if (!json || json === '[]') return [];
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        const p = item as { x?: number; y?: number; type?: string; comment?: string };
        const type = ANNOTATION_TYPES.includes(p.type as AnnotationType)
          ? (p.type as AnnotationType)
          : 'Technical';
        return {
          x: p.x ?? 0,
          y: p.y ?? 0,
          type,
          comment: p.comment ?? '',
        };
      })
      .filter((p) => p.comment || p.x || p.y);
  } catch {
    return [];
  }
};

export const toCoordinatesJson = (coords: {
  x: number;
  y: number;
  width: number;
  height: number;
}): string =>
  JSON.stringify({
    top: coords.y,
    left: coords.x,
    width: coords.width,
    height: coords.height,
  });

export const mapRegionDtoToEntity = (dto: RegionDto): CanvasRegion => {
  const coords = parseCoordinatesJson(dto.coordinatesJson);
  return {
    id: String(dto.id ?? ''),
    pageId: String(dto.pageId ?? ''),
    ...coords,
    label: dto.name ?? undefined,
    createdAt: dto.createAt ?? new Date().toISOString(),
    updatedAt: dto.updateAt ?? dto.createAt ?? new Date().toISOString(),
  };
};

export const toCreateRegionDto = (data: {
  pageId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}): CreateRegionDto => ({
  pageId: Number(data.pageId),
  name: data.label ?? null,
  coordinatesJson: toCoordinatesJson(data),
});

export const toUpdateRegionDto = (data: Partial<CanvasRegion>): UpdateRegionDto => {
  const result: UpdateRegionDto = {};
  if (data.label !== undefined) result.name = data.label;
  if (
    data.x !== undefined &&
    data.y !== undefined &&
    data.width !== undefined &&
    data.height !== undefined
  ) {
    result.coordinatesJson = toCoordinatesJson({
      x: data.x,
      y: data.y,
      width: data.width,
      height: data.height,
    });
  }
  return result;
};

export const mapAnnotationDtoToEntity = (dto: AnnotationDto): CanvasAnnotation => {
  const coords = parseCoordinatesJson(dto.coordinatesJson);
  const type = ANNOTATION_TYPES.includes(dto.type as AnnotationType)
    ? (dto.type as AnnotationType)
    : 'Technical';

  return {
    id: String(dto.id ?? ''),
    pageId: String(dto.pageId ?? ''),
    editorId: String(dto.createdByUserId ?? ''),
    editorName: dto.createdByUserName ?? 'Editor',
    type,
    x: coords.x,
    y: coords.y,
    comment: dto.comment ?? '',
    resolved: false,
    createdAt: dto.createAt ?? new Date().toISOString(),
    updatedAt: dto.updateAt ?? dto.createAt ?? new Date().toISOString(),
  };
};

export const toCreateAnnotationDto = (data: {
  pageId: string;
  x: number;
  y: number;
  type: AnnotationType;
  comment: string;
}): CreateAnnotationDto => ({
  pageId: Number(data.pageId),
  coordinatesJson: JSON.stringify({ top: data.y, left: data.x, width: 0, height: 0 }),
  comment: data.comment,
  type: data.type,
});

/**
 * Chuyển rect (scene/canvas space) → toạ độ pixel trên ảnh gốc (0,0 = góc trên-trái ảnh).
 *
 * Lưu ý: KHÔNG dùng `img.calcTransformMatrix()` vì ma trận của Fabric quy chiếu theo
 * TÂM của object (center-origin), trong khi region được render bằng góc trên-trái
 * (`region.x`/`region.y` trong scene space). Dùng ma trận sẽ làm toạ độ lệch đúng
 * bằng nửa kích thước ảnh. Ảnh luôn được đặt với originX/originY = top-left nên ta
 * quy đổi trực tiếp theo góc trên-trái + scale của ảnh.
 */
export const sceneRectToImagePixels = (
  img: FabricImage,
  left: number,
  top: number,
  width: number,
  height: number,
) => {
  const scaleX = img.scaleX || 1;
  const scaleY = img.scaleY || 1;
  const originX = img.left ?? 0;
  const originY = img.top ?? 0;
  return {
    x: Math.round((left - originX) / scaleX),
    y: Math.round((top - originY) / scaleY),
    width: Math.max(1, Math.round(width / scaleX)),
    height: Math.max(1, Math.round(height / scaleY)),
  };
};

