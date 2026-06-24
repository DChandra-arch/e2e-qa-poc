import { APIRequestContext } from '@playwright/test'
import { BaseClient } from '../apiClient'

export interface Article {
  slug: string
  title: string
  description: string
  body: string
  tagList: string[]
  createdAt: string
  updatedAt: string
  author: {
    username: string
    bio: string
    image: string
    following: boolean
  }
  favoritesCount: number
  favorited: boolean
}

export interface ArticlesResponse {
  articles: Article[]
  articlesCount: number
}

export interface CreateArticlePayload {
  title: string
  description: string
  body: string
  tagList?: string[]
}

export class ArticlesService extends BaseClient {
  constructor(request: APIRequestContext, token?: string) {
    super(request, token)
  }

  async getArticles(params?: {
    limit?: number
    offset?: number
    tag?: string
    author?: string
  }): Promise<ArticlesResponse> {
    const response = await this.get(
      '/api/articles',
      params as Record<string, string | number>
    )

    if (!response.ok()) {
      throw new Error(`getArticles failed: ${response.status()}`)
    }

    return response.json()
  }

  async createArticle(payload: CreateArticlePayload): Promise<Article> {
    const response = await this.post('/api/articles', {
      article: payload,
    })

    if (!response.ok()) {
      throw new Error(
        `createArticle failed: ${response.status()} ${await response.text()}`
      )
    }

    const body = await response.json()
    return body.article
  }

  async deleteArticle(slug: string): Promise<void> {
    const response = await this.delete(`/api/articles/${slug}`)

    if (!response.ok()) {
      throw new Error(`deleteArticle failed: ${response.status()}`)
    }
  }
}
