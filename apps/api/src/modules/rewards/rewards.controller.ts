import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UrewardsService } from './rewards.service';

function parseSeasonWindow(seasonId?: string) {
  if (!seasonId) return undefined;

  const match = seasonId.match(/^(\d{4})-S(\d{1,2})$/);
  if (!match) {
    throw new BadRequestException('seasonId must be formatted as YYYY-SN (example: 2026-S1)');
  }

  const year = Number(match[1]);
  const seasonNumber = Number(match[2]);
  if (seasonNumber < 1 || seasonNumber > 4) {
    throw new BadRequestException('season number must be between 1 and 4');
  }

  const quarter = seasonNumber - 1;
  const startAt = new Date(Date.UTC(year, quarter * 3, 1, 0, 0, 0, 0));
  const endAt = new Date(Date.UTC(year, quarter * 3 + 3, 1, 0, 0, 0, 0));

  return {
    seasonId,
    startAt,
    endAt,
  };
}

@Controller('rewards')
export class UrewardsController {
  constructor(private readonly service: UrewardsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('summary')
  summary(@Query('guildId') guildId?: string, @Query('seasonId') seasonId?: string) {
    if (!guildId) {
      throw new BadRequestException('guildId query is required');
    }

    const seasonWindow = parseSeasonWindow(seasonId);
    return this.service.summarizeByGuild(guildId, seasonWindow);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
