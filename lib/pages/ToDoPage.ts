import { Page, Locator } from '@playwright/test'

export class ToDoPage {
  // 3 private readonly properties
  private readonly page: Page
  private readonly inputField: Locator
  private readonly todoItems: Locator

  // constructor(page: Page) — assigns all 3
  constructor(page: Page) {
    this.page = page
    this.inputField = page.getByPlaceholder('What needs to be done?')
    this.todoItems = page.locator('.todo-list li')
  }
  // async goto(): Promise<void>
  async goto(): Promise<void> {
    await this.page.goto('/todomvc')
  }

  // async addTodo(title: string): Promise<void>
  async addTodo(title: string): Promise<void> {
    await this.inputField.fill(title)
    await this.inputField.press('Enter')
  }
  // async getTodoCount(): Promise<number>
  async getTodoCount(): Promise<number> {
    return await this.todoItems.count()
  }
}
