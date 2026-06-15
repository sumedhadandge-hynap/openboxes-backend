import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import { UsersService } from './users.service';

import { CreateUserDto } from './dto/create-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post()
  create(
    @Body()
    dto: CreateUserDto,
  ) {
    return this.usersService.create(dto);
  }

@Get()
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles('ADMIN')
findAll() {
  return this.usersService.findAll();
}

  @Get(':uid')
  findOne(
    @Param('uid') uid: string,
  ) {
    return this.usersService.findOne(uid);
  }

  @Put(':uid')
  update(
    @Param('uid') uid: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(
      uid,
      dto,
    );
  }

  @Delete(':uid')
  delete(
    @Param('uid') uid: string,
  ) {
    return this.usersService.delete(uid);
  }

  @Post(':uid/roles')
  assignRole(
    @Param('uid') uid: string,
    @Body() dto: AssignRoleDto,
  ) {
    return this.usersService.assignRole(
      uid,
      dto,
    );
  }

  @Get(':uid/roles')
  getRoles(
    @Param('uid') uid: string,
  ) {
    return this.usersService.getRoles(uid);
  }

  @Delete(':uid/roles/:roleUid')
  removeRole(
    @Param('uid') uid: string,
    @Param('roleUid') roleUid: string,
  ) {
    return this.usersService.removeRole(
      uid,
      roleUid,
    );
  }
}