import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMemberDto {
  @IsString()
  @IsNotEmpty()
  guildId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  nickname!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  role!: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  nickname?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  role?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
