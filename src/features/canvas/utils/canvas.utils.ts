import type {
  AnnotationDto,
  CreateAnnotationDto,
  CreateRegionDto,
  RegionDto,
  UpdateRegionDto,
} from '../../../api/generated/types';
import type { Annotation, AnnotationType, Region } from '../../../types/entities';

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
): Pick<Region, 'x' | 'y' | 'width' | 'height'> => {
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

export const mapRegionDtoToEntity = (dto: RegionDto): Region => {
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

export const toUpdateRegionDto = (data: Partial<Region>): UpdateRegionDto => {
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

const ANNOTATION_TYPES: AnnotationType[] = ['Technical', 'Art', 'Content'];

export const mapAnnotationDtoToEntity = (dto: AnnotationDto): Annotation => {
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

/** @deprecated Dùng resolveMediaUrl từ utils — giữ alias cho canvas feature */
export { resolveMediaUrl as resolvePageImageUrl } from '../../../utils/resolveMediaUrl';
