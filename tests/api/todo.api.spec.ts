import { test, expect } from '@playwright/test'
import { request } from 'node:http'
import { title } from 'node:process'

test.describe('Todo API', () => {
  test('Should get all todos', async ({ request }) => {
    const response = await request.get('/todos')
    expect(response.status()).toBe(200)
  })

  test('should create a todo', async ({ request }) => {
    const response = await request.post('/todos', {
      data: {
        title: 'Buy milk',
        completed: false,
      },
    })
    expect(response.status()).toBe(201)
    const body = await response.json()
    expect(body.title).toBe('Buy milk')
    expect(body.completed).toBe(false)
  })

  test('Should create multiple todos', async ({ request }) => {
    const todosToCreate = [
      { title: 'Buy milk', completed: false },
      { title: 'Walk dog', completed: true },
      { title: 'Wash car', completed: false },
    ]

    for (const todo of todosToCreate) {
      const response = await request.post('/todos', {
        data: todo,
      })
      expect(response.status()).toBe(201)
      const body = await response.json()
      expect(body.title).toBe(todo.title)
      expect(body.completed).toBe(todo.completed)
    }
  })
})
