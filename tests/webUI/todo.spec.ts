import { test, expect } from '../../lib/fixtures/pageFixtures'

test.describe('Todo UI', () => {
  test('should add 1 todo', async ({ todoPage }) => {
    await todoPage.addTodo('Buy fruits')
    expect(await todoPage.getTodoCount()).toBe(1)
  })
  test('should add two todo', async ({ todoPage }) => {
    await todoPage.addTodo('Buy milk')
    await todoPage.addTodo('Walk dog')
    expect(await todoPage.getTodoCount()).toBe(2)
  })
})
