import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':uid')
  findOne(@Param('uid') uid: string) {
    return this.rolesService.findOne(uid);
  }

  @Patch(':uid')
  update(
    @Param('uid') uid: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.rolesService.update(uid, dto);
  }

  @Delete(':uid')
  remove(@Param('uid') uid: string) {
    return this.rolesService.remove(uid);
  }
}