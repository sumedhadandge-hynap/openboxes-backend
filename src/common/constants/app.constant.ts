import { RoleType } from '../enums/role-type.enum';

export const API_PREFIX = 'api';
export const DEFAULT_PORT = 5000;
export const BCRYPT_SALT_ROUNDS = 12;
export const DEFAULT_ROLES = ['ADMIN', 'MANAGER', 'USER'] as const;

export const DEFAULT_ROLE_DEFINITIONS: {
  name: string;
  roleType: RoleType;
  description: string;
}[] = [
  {
    name: 'ADMIN',
    roleType: RoleType.ROLE_ADMIN,
    description: 'Full system administration access',
  },
  {
    name: 'MANAGER',
    roleType: RoleType.ROLE_MANAGER,
    description: 'Operational management access',
  },
  {
    name: 'USER',
    roleType: RoleType.ROLE_AUTHENTICATED,
    description: 'Standard application access',
  },
  {
    name: 'Warehouse Manager',
    roleType: RoleType.WAREHOUSE_MANAGER,
    description:
      'Manages warehouse operations, stock movements, receiving and dispatch',
  },
];
