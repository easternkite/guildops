import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UmembersService } from './members.service';
import { CreateMemberDto, UpdateMemberDto } from './dto/member.dto';

@Controller('members')
export class UmembersController {
  constructor(private readonly service: UmembersService) {}

  @Get()
  findAll(@Query('guildId') guildId?: string) {
    return this.service.findAll(guildId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: CreateMemberDto) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateMemberDto) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
