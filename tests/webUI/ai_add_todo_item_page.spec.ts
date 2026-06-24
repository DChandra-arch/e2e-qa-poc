import { test, expect } from '@playwright/test';
import { AddTodoItemPage } from '../../lib/pages/ai_AddTodoItemPage';

test('TC-001: Successfully add a single todo item with valid text', async ({ page }) => {
  const todoPage = new AddTodoItemPage(page);

  await todoPage.navigate();
  await expect(await todoPage.isTodoInputVisible()).toBe(true);

  await todoPage.clickTodoInput();
  await todoPage.typeTodoText('Buy groceries');
  await todoPage.pressEnterToSubmit();

  expect(await todoPage.isTodoItemVisible('Buy groceries')).toBe(true);
  expect(await todoPage.getTodoInputValue()).toBe('');
});

test('TC-002: Successfully add multiple todo items sequentially', async ({ page }) => {
  const todoPage = new AddTodoItemPage(page);

  await todoPage.navigate();

  await todoPage.addTodoItem('Task 1');
  expect(await todoPage.isTodoItemVisible('Task 1')).toBe(true);
  expect(await todoPage.getTodoInputValue()).toBe('');

  await todoPage.addTodoItem('Task 2');
  expect(await todoPage.isTodoItemVisible('Task 2')).toBe(true);
  expect(await todoPage.getTodoInputValue()).toBe('');

  await todoPage.addTodoItem('Task 3');
  expect(await todoPage.isTodoItemVisible('Task 3')).toBe(true);
  expect(await todoPage.getTodoInputValue()).toBe('');

  const items = await todoPage.getTodoItems();
  const task1Index = items.findIndex(item => item.includes('Task 1'));
  const task2Index = items.findIndex(item => item.includes('Task 2'));
  const task3Index = items.findIndex(item => item.includes('Task 3'));
  expect(task1Index).toBeLessThan(task2Index);
  expect(task2Index).toBeLessThan(task3Index);
});

test('TC-003: Attempt to add an empty todo item', async ({ page }) => {
  const todoPage = new AddTodoItemPage(page);

  await todoPage.navigate();
  const initialCount = await todoPage.getTodoItemCount();

  await todoPage.submitEmptyForm();

  const afterCount = await todoPage.getTodoItemCount();
  expect(afterCount).toBe(initialCount);
});

test('TC-004: Attempt to add a todo item containing only whitespace', async ({ page }) => {
  const todoPage = new AddTodoItemPage(page);

  await todoPage.navigate();
  const initialCount = await todoPage.getTodoItemCount();

  await todoPage.submitWhitespaceOnly();

  const afterCount = await todoPage.getTodoItemCount();
  expect(afterCount).toBe(initialCount);
});

test('TC-005: Add a todo item with maximum allowed character length', async ({ page }) => {
  const todoPage = new AddTodoItemPage(page);

  await todoPage.navigate();
  const maxLengthText = 'A'.repeat(255);

  await todoPage.addTodoItem(maxLengthText);

  expect(await todoPage.isTodoItemVisible(maxLengthText)).toBe(true);
  expect(await todoPage.getTodoInputValue()).toBe('');
});

test('TC-006: Add a todo item exceeding maximum allowed character length', async ({ page }) => {
  const todoPage = new AddTodoItemPage(page);

  await todoPage.navigate();
  const oversizedText = 'A'.repeat(256);
  const initialCount = await todoPage.getTodoItemCount();

  await todoPage.typeTodoText(oversizedText);
  await todoPage.pressEnterToSubmit();

  const inputValue = await todoPage.getTodoInputValue();
  const afterCount = await todoPage.getTodoItemCount();

  const isInputTruncated = inputValue.length <= 255;
  const isItemNotAdded = afterCount === initialCount;
  expect(isInputTruncated || isItemNotAdded).toBe(true);
});

test('TC-007: Add a todo item with special characters and emojis', async ({ page }) => {
  const todoPage = new AddTodoItemPage(page);

  await todoPage.navigate();
  const specialText = '<script>alert(1)</script> & Buy milk 🛒';

  await todoPage.addTodoItem(specialText);

  expect(await todoPage.isTodoItemVisible('Buy milk')).toBe(true);
  expect(await todoPage.getTodoInputValue()).toBe('');
});

test('TC-008: Attempt to add a duplicate todo item', async ({ page }) => {
  const todoPage = new AddTodoItemPage(page);

  await todoPage.navigate();

  await todoPage.addTodoItem('Buy groceries');
  expect(await todoPage.isTodoItemVisible('Buy groceries')).toBe(true);

  const countAfterFirst = await todoPage.getTodoItemCount();

  await todoPage.addTodoItem('Buy groceries');

  const countAfterSecond = await todoPage.getTodoItemCount();
  const isDuplicateAddedOrPrevented = countAfterSecond === countAfterFirst + 1 || countAfterSecond === countAfterFirst;
  expect(isDuplicateAddedOrPrevented).toBe(true);
});
