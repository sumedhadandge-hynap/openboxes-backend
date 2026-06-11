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
import { AssignPermissionDto } from './dto/assign-permission.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

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



  @Post(':uid/permissions')
  assignPermission(
    @Param('uid') uid: string,
    @Body() dto: AssignPermissionDto,
  ) {
    return this.rolesService.assignPermission(
      uid,
      dto,
    );
  }


  @Get(':uid/permissions')
  getPermissions(
    @Param('uid') uid: string,
  ) {
    return this.rolesService.getPermissions(
      uid,
    );
  }
}