import {
  IsUUID,
} from 'class-validator';

export class AssignRoleDto {
  @IsUUID()
  roleUid: string;
}