import 'reflect-metadata';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service.js';
import { RedisService } from '../../../core/redis/redis.service.js';
import { StorageService } from '../../../shared/services/storage.service.js';
import { CompressionService } from '../../../shared/services/compression.service.js';
import type { MediaType } from '../../../../generated/prisma/client.js';

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface MediaUploadResult {
  id: string;
  vehicleId: string;
  type: MediaType;
  url: string;
  thumbnailUrl: string | null;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic'];
const ALLOWED_VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_3D_MIMES = ['model/gltf-binary', 'application/octet-stream'];

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly storage: StorageService,
    private readonly compression: CompressionService,
  ) {}

  async uploadImage(vehicleId: string, file: UploadedFile): Promise<MediaUploadResult> {
    this.validateFile(file);
    const vehicle = await this.ensureVehicleExists(vehicleId);

    if (!ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported image type ${file.mimetype}. Allowed: ${ALLOWED_IMAGE_MIMES.join(', ')}`,
      );
    }

    const processed = await this.compression.processImage(file);
    const key = this.storage.buildKey(`vehicles/${vehicle.slug}/images`, file.originalname);
    const thumbKey = key.replace(/\.(jpe?g|png|webp|avif|heic)$/i, '-thumb.webp');

    const [main, thumb] = await Promise.all([
      this.storage.uploadBuffer(processed.buffer, key, 'image/webp'),
      this.storage.uploadBuffer(processed.thumbnailBuffer, thumbKey, 'image/webp'),
    ]);

    const isFirst = (await this.prisma.media.count({ where: { vehicleId } })) === 0;

    const media = await this.prisma.media.create({
      data: {
        vehicleId,
        type: 'IMAGE',
        url: main.url,
        thumbnailUrl: thumb.url,
        altText: file.originalname,
        fileKey: key,
        fileSize: processed.buffer.length,
        mimeType: 'image/webp',
        width: processed.width,
        height: processed.height,
        isPrimary: isFirst,
        sortOrder: 0,
      },
    });

    await this.syncPrimaryToVehicle(vehicleId);
    await this.invalidateVehicleCaches(vehicleId, vehicle.slug);
    return media;
  }

  async uploadVideo(vehicleId: string, file: UploadedFile): Promise<MediaUploadResult> {
    this.validateFile(file);
    const vehicle = await this.ensureVehicleExists(vehicleId);

    if (!ALLOWED_VIDEO_MIMES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported video type ${file.mimetype}. Allowed: ${ALLOWED_VIDEO_MIMES.join(', ')}`,
      );
    }

    const key = this.storage.buildKey(`vehicles/${vehicle.slug}/videos`, file.originalname);
    const result = await this.storage.uploadBuffer(file.buffer, key, file.mimetype);

    const media = await this.prisma.media.create({
      data: {
        vehicleId,
        type: 'VIDEO',
        url: result.url,
        fileKey: key,
        fileSize: result.fileSize,
        mimeType: file.mimetype,
        sortOrder: 0,
      },
    });

    await this.invalidateVehicleCaches(vehicleId, vehicle.slug);
    return media;
  }

  async upload3DModel(vehicleId: string, file: UploadedFile): Promise<MediaUploadResult> {
    this.validateFile(file);
    const vehicle = await this.ensureVehicleExists(vehicleId);

    const isGlb =
      file.originalname.toLowerCase().endsWith('.glb') || file.mimetype === 'model/gltf-binary';
    if (!isGlb && !ALLOWED_3D_MIMES.includes(file.mimetype)) {
      throw new BadRequestException('Only .glb 3D model files are supported');
    }

    const key = this.storage.buildKey(`vehicles/${vehicle.slug}/3d`, file.originalname);
    const result = await this.storage.uploadBuffer(file.buffer, key, 'model/gltf-binary');

    const media = await this.prisma.media.create({
      data: {
        vehicleId,
        type: 'THREE_D_MODEL',
        url: result.url,
        fileKey: key,
        fileSize: result.fileSize,
        mimeType: 'model/gltf-binary',
        sortOrder: 0,
      },
    });

    await this.invalidateVehicleCaches(vehicleId, vehicle.slug);
    return media;
  }

  async updateMediaInfo(
    mediaId: string,
    data: { altText?: string; sortOrder?: number; isPrimary?: boolean },
  ): Promise<MediaUploadResult> {
    const existing = await this.prisma.media.findUnique({ where: { id: mediaId } });
    if (!existing) {
      throw new NotFoundException('Media not found');
    }

    const media = await this.prisma.media.update({
      where: { id: mediaId },
      data: {
        ...(data.altText !== undefined ? { altText: data.altText } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
        ...(data.isPrimary !== undefined ? { isPrimary: data.isPrimary } : {}),
      },
    });

    if (data.isPrimary !== undefined) {
      await this.syncPrimaryToVehicle(existing.vehicleId);
    }

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: existing.vehicleId },
    });
    if (vehicle) {
      await this.invalidateVehicleCaches(vehicle.id, vehicle.slug);
    }

    return media;
  }

  async remove(mediaId: string): Promise<{ success: boolean }> {
    const media = await this.prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    if (media.fileKey) {
      await this.storage.deleteObject(media.fileKey);
    }

    await this.prisma.media.delete({ where: { id: mediaId } });

    await this.syncPrimaryToVehicle(media.vehicleId);

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: media.vehicleId },
    });
    if (vehicle) {
      await this.invalidateVehicleCaches(vehicle.id, vehicle.slug);
    }

    return { success: true };
  }

  async setPrimary(mediaId: string, vehicleId: string): Promise<{ success: boolean }> {
    await this.prisma.$transaction([
      this.prisma.media.updateMany({
        where: { vehicleId },
        data: { isPrimary: false },
      }),
      this.prisma.media.update({
        where: { id: mediaId },
        data: { isPrimary: true },
      }),
    ]);

    await this.syncPrimaryToVehicle(vehicleId);

    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (vehicle) {
      await this.invalidateVehicleCaches(vehicleId, vehicle.slug);
    }

    return { success: true };
  }

  async reorder(vehicleId: string, orderedIds: string[]): Promise<{ success: boolean }> {
    const mediaItems = await this.prisma.media.findMany({
      where: { vehicleId },
      select: { id: true },
    });

    const validIds = new Set(mediaItems.map((m) => m.id));
    if (orderedIds.some((id) => !validIds.has(id))) {
      throw new BadRequestException('Reordering list contains invalid media ids');
    }

    await this.prisma.$transaction(
      orderedIds.map((id, index) =>
        this.prisma.media.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );

    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (vehicle) {
      await this.invalidateVehicleCaches(vehicleId, vehicle.slug);
    }

    return { success: true };
  }

  async getPresignedUploadUrl(vehicleId: string, contentType: string, filename: string): Promise<{
    uploadUrl: string;
    fileKey: string;
  }> {
    await this.ensureVehicleExists(vehicleId);
    const key = this.storage.buildKey(`vehicles/${vehicleId}/uploads`, filename);
    const uploadUrl = await this.storage.getPresignedUploadUrl(key, contentType);

    return { uploadUrl, fileKey: key };
  }

  private validateFile(file: UploadedFile): void {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)} MB`,
      );
    }
    if (file.size === 0) {
      throw new BadRequestException('Uploaded file is empty');
    }
  }

  private async ensureVehicleExists(vehicleId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }
    return vehicle;
  }

  private async syncPrimaryToVehicle(vehicleId: string): Promise<void> {
    const primary = await this.prisma.media.findFirst({
      where: { vehicleId, isPrimary: true, type: 'IMAGE' },
      orderBy: { sortOrder: 'asc' },
      select: { url: true, thumbnailUrl: true },
    });

    await this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        primaryImageUrl: primary?.url ?? null,
        thumbnailUrl: primary?.thumbnailUrl ?? null,
      },
    });
  }

  private async invalidateVehicleCaches(vehicleId: string, slug: string): Promise<void> {
    await this.redis.delete(`vehicle:${vehicleId}`);
    await this.redis.delete(`vehicle:${slug}`);
    await this.redis.deleteByPattern('catalog:*');
  }
}