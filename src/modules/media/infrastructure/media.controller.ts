import 'reflect-metadata';
import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MediaService } from '../domain/media.service.js';
import type { UploadedFile as MediaFile } from '../domain/media.service.js';
import {
  PresignedUploadDto,
  ReorderMediaDto,
  UpdateMediaDto,
} from './dto/media.dto.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';

const MULTER_OPTIONS = {
  storage: memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
};

@ApiTags('media')
@Controller('api/v1/media')
@Roles('ADMIN', 'MANAGER', 'SELLER')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload/image/:vehicleId')
  @UseInterceptors(FileInterceptor('file', MULTER_OPTIONS))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload and compress an image for a vehicle' })
  uploadImage(
    @Param('vehicleId') vehicleId: string,
    @UploadedFile() file: MediaFile,
  ) {
    return this.mediaService.uploadImage(vehicleId, file);
  }

  @Post('upload/video/:vehicleId')
  @UseInterceptors(FileInterceptor('file', MULTER_OPTIONS))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a video for a vehicle' })
  uploadVideo(
    @Param('vehicleId') vehicleId: string,
    @UploadedFile() file: MediaFile,
  ) {
    return this.mediaService.uploadVideo(vehicleId, file);
  }

  @Post('upload/3d/:vehicleId')
  @UseInterceptors(FileInterceptor('file', MULTER_OPTIONS))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a 3D GLB model for a vehicle' })
  upload3D(
    @Param('vehicleId') vehicleId: string,
    @UploadedFile() file: MediaFile,
  ) {
    return this.mediaService.upload3DModel(vehicleId, file);
  }

  @Post('upload/bulk/:vehicleId')
  @UseInterceptors(FilesInterceptor('files', 10, MULTER_OPTIONS))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  @ApiOperation({ summary: 'Upload multiple images in bulk' })
  uploadBulk(
    @Param('vehicleId') vehicleId: string,
    @UploadedFiles() files: MediaFile[],
  ) {
    return Promise.all(files.map((file) => this.mediaService.uploadImage(vehicleId, file)));
  }

  @Post('presigned/:vehicleId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a presigned S3 upload URL' })
  getPresigned(
    @Param('vehicleId') vehicleId: string,
    @Body() dto: PresignedUploadDto,
  ) {
    return this.mediaService.getPresignedUploadUrl(vehicleId, dto.contentType, dto.filename);
  }

  @Patch(':mediaId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update media metadata (alt text, order, primary)' })
  updateInfo(@Param('mediaId') mediaId: string, @Body() dto: UpdateMediaDto) {
    return this.mediaService.updateMediaInfo(mediaId, dto);
  }

  @Patch('reorder/:vehicleId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder a vehicle gallery' })
  reorder(@Param('vehicleId') vehicleId: string, @Body() dto: ReorderMediaDto) {
    return this.mediaService.reorder(vehicleId, dto.orderedIds);
  }

  @Patch('primary/:mediaId/:vehicleId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set a media as primary for the vehicle' })
  setPrimary(
    @Param('mediaId') mediaId: string,
    @Param('vehicleId') vehicleId: string,
  ) {
    return this.mediaService.setPrimary(mediaId, vehicleId);
  }

  @Delete(':mediaId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete media' })
  remove(@Param('mediaId') mediaId: string) {
    return this.mediaService.remove(mediaId);
  }
}