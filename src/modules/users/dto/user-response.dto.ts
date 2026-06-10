import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'admin@openboxes.com' })
  email!: string;

  @ApiProperty({ example: 'OpenBoxes' })
  firstName!: string;

  @ApiProperty({ example: 'Admin' })
  lastName!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: 'ADMIN' })
  role!: string;

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: Date;
}
