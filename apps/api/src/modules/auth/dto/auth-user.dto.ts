import { IsOptional, IsString } from 'class-validator';

export class TokenLoginDto {
  @IsString()
  discordId!: string;

  @IsString()
  username!: string;

  @IsOptional()
  @IsString()
  discriminator?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
