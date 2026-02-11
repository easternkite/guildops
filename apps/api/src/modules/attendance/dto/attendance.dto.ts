import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAttendanceDto {
  @IsString()
  @IsNotEmpty()
  guildId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  game!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @IsDateString()
  startsAt!: string;

  @IsOptional()
  @IsIn(['open', 'closed'])
  status?: string;
}

export class UpdateAttendanceDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  game?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsIn(['open', 'closed'])
  status?: string;
}

export class CreateCheckInDto {
  @IsString()
  @IsNotEmpty()
  memberId!: string;

  @IsOptional()
  @IsIn(['checked_in', 'late', 'absent'])
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  note?: string;
}
