import { test, expect } from '../../lib/fixtures/apiFixtures'

test.describe('Conduit API — Articles', () => {
  test.describe('Public endpoints', () => {
    test('GET /api/articles — returns articles list', async ({
      publicArticlesService,
    }) => {
      const result = await publicArticlesService.getArticles({
        limit: 10,
        offset: 0,
      })

      expect(result.articles.length).toBeLessThanOrEqual(10)
      expect(result.articlesCount).toBeGreaterThan(0)
      expect(result.articles[0]).toHaveProperty('slug')
      expect(result.articles[0]).toHaveProperty('title')
      expect(result.articles[0]).toHaveProperty('author')
    })

    test('GET /api/articles — respects limit param', async ({
      publicArticlesService,
    }) => {
      const result = await publicArticlesService.getArticles({ limit: 3 })
      expect(result.articles.length).toBeLessThanOrEqual(3)
    })

    test('GET /api/articles — filter by tag', async ({
      publicArticlesService,
    }) => {
      const result = await publicArticlesService.getArticles({
        tag: 'dragons',
      })
      result.articles.forEach((article) => {
        expect(article.tagList).toContain('dragons')
      })
    })
  })

  test.describe('Authenticated endpoints', () => {
    test('POST /api/articles — creates article', async ({
      articlesService,
    }) => {
      const article = await articlesService.createArticle({
        title: `Test Article ${Date.now()}`,
        description: 'Created by Playwright automation',
        body: 'This is the article body',
        tagList: ['playwright', 'testing'],
      })

      expect(article.title).toContain('Test Article')
      expect(article.description).toBe('Created by Playwright automation')
      expect(article.tagList).toContain('playwright')
      expect(article.slug).toBeDefined()

      // cleanup
      await articlesService.deleteArticle(article.slug)
    })

    test('DELETE /api/articles/:slug — deletes article', async ({
      articlesService,
    }) => {
      const article = await articlesService.createArticle({
        title: `Delete Test ${Date.now()}`,
        description: 'Will be deleted',
        body: 'Temporary article',
      })

      await articlesService.deleteArticle(article.slug)

      const result = await articlesService.getArticles({ limit: 20 })
      const found = result.articles.find((a) => a.slug === article.slug)
      expect(found).toBeUndefined()
    })

    test('POST /api/articles — fails without auth', async ({ request }) => {
      const response = await request.post(
        `${process.env.CONDUIT_API_URL}/api/articles`,
        {
          data: {
            article: {
              title: 'Should Fail',
              description: 'No auth',
              body: 'No auth body',
            },
          },
        }
      )
      expect(response.status()).toBe(401)
    })
  })
})
