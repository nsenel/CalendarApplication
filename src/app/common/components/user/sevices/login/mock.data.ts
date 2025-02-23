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


export const demoUserCredentials: { [tenantId: string]: { [key in UserType]?: { email: string; password: string } } } = {
  '14d29f22-d15d-45e3-83ed-bd932c4028f6': {
    [UserType.PRODUCT_OWNER]: { email: 'owner@email.com', password: 'owner' },
    [UserType.ADMIN]: { email: 'admin@email.com', password: 'admin' },
    [UserType.REGULAR]: { email: 'regular@email.com', password: 'regular' }
  },
  'e0eca33c-6fd3-47ec-b2e6-67204bd278a7': {
    [UserType.PRODUCT_OWNER]: { email: 'owner2@email.com', password: 'owner2' },
    [UserType.ADMIN]: { email: 'admin2@email.com', password: 'admin2' },
    [UserType.REGULAR]: { email: 'regular2@email.com', password: 'regular2' }
  }
};