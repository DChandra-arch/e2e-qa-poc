// lib/fixtures/apiFixtures.ts
import { test as base } from '@playwright/test'
import { AuthService } from '../helpers/api/authHelper'
import { ArticlesService } from '../helpers/api/services/articlesService'
import { TestUsers } from '../helpers/data/userFactory'

type ApiFixtures = {
  authToken: string
  articlesService: ArticlesService
  publicArticlesService: ArticlesService // no auth
}

export const test = base.extend<ApiFixtures>({
  authToken: async ({ request }, use) => {
    const auth = new AuthService(request)
    const token = await auth.getToken(TestUsers.standard)
    await use(token)
    // token cached in AuthService instance — no cleanup needed
  },

  articlesService: async ({ request, authToken }, use) => {
    // depends on authToken fixture — gets token automatically
    await use(new ArticlesService(request, authToken))
  },

  publicArticlesService: async ({ request }, use) => {
    // no token — public endpoints only
    await use(new ArticlesService(request))
  },
})

export { expect } from '@playwright/test'
