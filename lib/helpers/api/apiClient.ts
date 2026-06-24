import { APIRequestContext, APIResponse } from '@playwright/test'

export class BaseClient {
  protected readonly baseURL: string

  constructor(
    protected readonly request: APIRequestContext,
    protected readonly token?: string
  ) {
    this.baseURL = process.env.CONDUIT_API_URL || ''
  }

  protected async get(
    endpoint: string,
    params?: Record<string, string | number>
  ): Promise<APIResponse> {
    const url = new URL(`${this.baseURL}${endpoint}`)

    if (params) {
      Object.entries(params).forEach(([key, value]) =>
        url.searchParams.append(key, String(value))
      )
    }

    const startTime = Date.now()
    const correlationId = `test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

    const response = await this.request.get(url.toString(), {
      headers: this.buildHeaders(correlationId),
    })

    this.logPerformance('GET', endpoint, Date.now() - startTime)
    return response
  }

  protected async post(endpoint: string, data: unknown): Promise<APIResponse> {
    const startTime = Date.now()
    const correlationId = `test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

    const response = await this.request.post(`${this.baseURL}${endpoint}`, {
      data,
      headers: this.buildHeaders(correlationId),
    })

    this.logPerformance('POST', endpoint, Date.now() - startTime)
    return response
  }

  protected async delete(endpoint: string): Promise<APIResponse> {
    const startTime = Date.now()
    const correlationId = `test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

    const response = await this.request.delete(`${this.baseURL}${endpoint}`, {
      headers: this.buildHeaders(correlationId),
    })

    this.logPerformance('DELETE', endpoint, Date.now() - startTime)
    return response
  }

  private buildHeaders(correlationId: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
    }

    if (this.token) {
      headers['Authorization'] = `Token ${this.token}`
    }

    return headers
  }

  private logPerformance(
    method: string,
    endpoint: string,
    duration: number
  ): void {
    if (duration > 1500) {
      console.warn(`⚠️ SLOW: ${method} ${endpoint} took ${duration}ms`)
    }
  }
}
