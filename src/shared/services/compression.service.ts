import 'reflect-metadata';
import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';

export interface ProcessedImage {
  buffer: Buffer;
  thumbnailBuffer: Buffer;
  width: number;
  height: number;
  mimeType: string;
}

export interface ProcessedMedia {
  main: ProcessedImage;
  original: Buffer;
  mimeType: string;
}

@Injectable()
export class CompressionService {
  private readonly logger = new Logger(CompressionService.name);

  async processImage(file: {
    buffer: Buffer;
    mimetype: string;
  }): Promise<ProcessedImage> {
    try {
      const image = sharp(file.buffer, { failOn: 'none' });

      const metadata = await image.metadata();
      const width = metadata.width ?? 0;
      const height = metadata.height ?? 0;

      const mainBuffer = await sharp(file.buffer, { failOn: 'none' })
        .resize(1600, 1200, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .rotate()
        .webp({ quality: 82, effort: 4 })
        .toBuffer();

      const thumbnailBuffer = await sharp(file.buffer, { failOn: 'none' })
        .resize(400, 300, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .rotate()
        .webp({ quality: 75, effort: 4 })
        .toBuffer();

      return {
        buffer: mainBuffer,
        thumbnailBuffer,
        width,
        height,
        mimeType: 'image/webp',
      };
    } catch (error) {
      this.logger.error(`Failed to process image: ${(error as Error).message}`);
      throw error;
    }
  }

  async getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
    const metadata = await sharp(buffer, { failOn: 'none' }).metadata();
    return {
      width: metadata.width ?? 0,
      height: metadata.height ?? 0,
    };
  }
}
