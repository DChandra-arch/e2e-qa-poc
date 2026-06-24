import * as dotenv from 'dotenv'
dotenv.config()

export interface TestUser {
  email: string
  password: string
  role: string
}

export const TestUsers = {
  standard: {
    email: process.env.CONDUIT_USER_EMAIL || '',
    password: process.env.CONDUIT_USER_PASSWORD || '',
    role: 'standard',
  },
} satisfies Record<string, TestUser>
// ↑ satisfies = TypeScript checks every entry matches TestUser shape
//   but keeps the object's exact type for autocomplete
//   TestUsers.standard → TypeScript knows it exists
//   TestUsers.admin → TypeScript error — doesn't exist yet
