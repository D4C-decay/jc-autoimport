import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import type { UserRole } from '../../../../../generated/prisma/client.js';

export class UpdateUserRoleDto {
  @ApiProperty({ enum: ['CLIENT', 'SELLER', 'ADMIN', 'MANAGER'] satisfies UserRole[] })
  @IsEnum(['CLIENT', 'SELLER', 'ADMIN', 'MANAGER'] satisfies UserRole[])
  role!: UserRole;
}
