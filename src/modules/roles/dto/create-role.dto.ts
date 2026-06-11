import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RoleType } from '../../../common/enums/role-type.enum';

export class CreateRoleDto {
  @IsString()
  name!: string;

  @IsEnum(RoleType)
  roleType!: RoleType;

  @IsOptional()
  @IsString()
  description?: string;
}