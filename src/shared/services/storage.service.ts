import 'reflect-metadata';
import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AppConfigService } from '../../core/config/app-config.service.js';

export type UploadResult = {
  url: string;
  fileKey: string;
  fileSize: number;
  mimeType: string;
};

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: AppConfigService) {
    this.bucket = config.aws.bucket;
    this.s3 = new S3Client({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
      ...(config.aws.endpoint ? { endpoint: config.aws.endpoint, forcePathStyle: true } : {}),
    });
  }

  async uploadBuffer(
    buffer: Buffer,
    key: string,
    mimeType: string,
  ): Promise<UploadResult> {
    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        }),
      );

      const url = this.getPublicUrl(key);

      return {
        url,
        fileKey: key,
        fileSize: buffer.length,
        mimeType,
      };
    } catch (error) {
      this.logger.error(`Failed to upload to S3: ${(error as Error).message}`);
      throw error;
    }
  }

  async deleteObject(fileKey: string): Promise<void> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: fileKey,
        }),
      );
    } catch (error) {
      this.logger.error(`Failed to delete from S3: ${(error as Error).message}`);
      throw error;
    }
  }

  async getObject(fileKey: string): Promise<Buffer> {
    const result = await this.s3.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
      }),
    );

    const chunks: Uint8Array[] = [];
    for await (const chunk of result.Body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  async getPresignedUploadUrl(key: string, contentType: string, expiresIn = 900): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.s3, command, { expiresIn });
  }

  getPublicUrl(key: string): string {
    return `https://${this.bucket}.s3.${this.config.aws.region}.amazonaws.com/${key}`;
  }

  buildKey(folder: string, filename: string): string {
    const safeName = filename
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '-');
    const datePath = new Date().toISOString().slice(0, 10).replace(/-/g, '/');
    return `${folder}/${datePath}/${Date.now()}-${safeName}`;
  }
}
