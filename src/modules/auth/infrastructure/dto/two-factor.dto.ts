import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

export class TwoFactorCodeDto {
  @ApiProperty({ example: '123456', description: 'Código de 6 dígitos del autenticador' })
  @IsString()
  @Matches(/^\d{6}$/, { message: 'El código debe tener 6 dígitos' })
  code!: string;
}

export class TwoFactorVerifyDto extends TwoFactorCodeDto {
  @ApiProperty({ description: 'Token temporal devuelto por el login' })
  @IsString()
  @MinLength(10)
  tempToken!: string;
}
