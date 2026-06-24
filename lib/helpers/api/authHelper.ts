// Purpose: Handles authentication. Logs in once, caches the token, reuses it across all tests in a session.
// No test ever calls the login endpoint directly.

import { APIRequestContext } from '@playwright/test'
import { TestUser } from '../data/userFactory'

export class AuthService {
  private token: string | null = null // cached token
  private readonly baseURL: string

  constructor(private readonly request: APIRequestContext) {
    this.baseURL = process.env.CONDUIT_API_URL || ''
  }

  async getToken(user: TestUser): Promise<string> {
    if (this.token) return this.token

    const response = await this.request.post(
      `${this.baseURL}/api/users/login`,
      {
        data: {
          user: {
            email: user.email,
            password: user.password
          }
        }
      }
    )

    if (!response.ok()) {
      throw new Error(
        `Auth failed: ${response.status()} ${await response.text()}`
      )
    }

    const body = await response.json()
    this.token = body.user.token
    return this.token!
  }

  clearToken(): void {
    this.token = null
  }
}