import {
  IsUUID,
} from 'class-validator';

export class AssignPermissionDto {
  @IsUUID()
  permissionUid: string;
}