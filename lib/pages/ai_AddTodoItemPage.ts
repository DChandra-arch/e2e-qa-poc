import { Page, Locator } from '@playwright/test';

export class AddTodoItemPage {
  private readonly page: Page;
  private readonly todoInput: Locator;
  private readonly addButton: Locator;
  private readonly todoList: Locator;
  private readonly validationMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.todoInput = page.getByPlaceholder(/add|new|todo|task|what needs to be done/i);
    this.addButton = page.locator('button[type="submit"], button.add-btn, button#add-btn, input[type="submit"]').first();
    this.todoList = page.locator('ul.todo-list, ul#todo-list, .todo-list, [data-testid="todo-list"]');
    this.validationMessage = page.locator('.error, .warning, .validation-message, [data-testid="validation-message"], .alert');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/');
  }

  async clickTodoInput(): Promise<void> {
    await this.todoInput.click();
  }

  async typeTodoText(text: string): Promise<void> {
    await this.todoInput.fill(text);
  }

  async pressEnterToSubmit(): Promise<void> {
    await this.todoInput.press('Enter');
  }

  async clickAddButton(): Promise<void> {
    await this.addButton.click();
  }

  async addTodoItem(text: string): Promise<void> {
    await this.todoInput.fill(text);
    await this.todoInput.press('Enter');
  }

  async getTodoInputValue(): Promise<string> {
    return await this.todoInput.inputValue();
  }

  async getTodoItems(): Promise<string[]> {
    const items = this.todoList.locator('li');
    const count = await items.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).innerText();
      texts.push(text.trim());
    }
    return texts;
  }

  async getTodoItemCount(): Promise<number> {
    return await this.todoList.locator('li').count();
  }

  async isTodoItemVisible(text: string): Promise<boolean> {
    return await this.todoList.locator('li').filter({ hasText: text }).isVisible();
  }

  async isValidationMessageVisible(): Promise<boolean> {
    return await this.validationMessage.isVisible();
  }

  async getValidationMessageText(): Promise<string> {
    return await this.validationMessage.innerText();
  }

  async isTodoInputVisible(): Promise<boolean> {
    return await this.todoInput.isVisible();
  }

  async submitEmptyForm(): Promise<void> {
    await this.todoInput.clear();
    await this.todoInput.press('Enter');
  }

  async submitWhitespaceOnly(): Promise<void> {
    await this.todoInput.fill('     ');
    await this.todoInput.press('Enter');
  }
}