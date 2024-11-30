// mock-users.ts
import { User, UserType } from '../../models/user/user.model';

export const mockUsers: User[] = [
  { id: "0", username: 'owner', tenantID: "0", email: 'owner@mailaddress.com', role: UserType.PRODUCT_OWNER },
  { id: "1", username: 'admin', tenantID: "0", email: 'admin@mailaddress.com', role: UserType.ADMIN },
  { id: "2", username: 'regular', tenantID: "0", email: 'regular@mailaddress.com', role: UserType.REGULAR },
  { id: "3", username: 'owner2', tenantID: "1", email: 'owner2@mailaddress.com', role: UserType.PRODUCT_OWNER },
  { id: "4", username: 'admin2', tenantID: "1", email: 'admin2@mailaddress.com', role: UserType.ADMIN },
  { id: "5", username: 'regular2', tenantID: "1", email: 'regular2@mailaddress.com', role: UserType.REGULAR }
];

export const userPasswords: { [username: string]: string } = {
  'owner': 'owner',
  'admin': 'admin',
  'regular': 'regular',
  'owner2': 'owner',
  'admin2': 'admin',
  'regular2': 'regular',
};

export function getPassword(username: string): string | undefined {
  return userPasswords[username];
}