import {test as base} from '@playwright/test'
// Imports Playwright's built-in test function but renames it to base. We rename it because we're about to create our OWN test function that extends it. If we called both test, they'd clash.
import { ToDoPage } from '../pages/ToDoPage'

//A TypeScript type definition — Block 2 callback, like an interface. Declares what custom fixtures this file adds. Here we're adding one fixture called todoPage of type ToDoPage. This
// is what makes TypeScript autocomplete work when you type { todoPage } in a test.
type Fixtures = {
  todoPage: ToDoPage
}

/*
Creates a NEW test function by extending the base one. extend<Fixtures> says "add these new fixtures on top of everything Playwright already provides." The result is our custom test — it has everything the base test has PLUS todoPage.
The <Fixtures> is a TypeScript generic — it tells extend what shape the new fixtures have.
*/
export const test =base.extend<Fixtures>({
  todoPage: async ({page}, use) => {
    const todoPage = new ToDoPage(page)
    await todoPage.goto()
    await use(todoPage)
  }
})

export { expect } from '@playwright/test'