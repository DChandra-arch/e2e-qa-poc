/*
Rule 1 — Any function that uses await must be marked async
Rule 2 — await only works on Promises
Think of async as a wrapper machine You put a string in → it comes out as Promise<string>

The mental model
(async () => {   ← define an async function with no name
  ...            ← your code that needs await goes here
})               ← end of function definition
()               ← immediately call it

THE EVENT LOOP - Synchronous code always runs to completion before any async code resumes.

1. delay function defined          ← sync, runs immediately
2. fetchTodoTitle function defined ← sync, runs immediately
3. (async () => { ... })()        ← starts, hits await, PAUSES, hands control back
4. run('Hello World')              ← sync, runs immediately
5. anonymous function              ← sync, runs immediately
6. f3 async function               ← starts, no await inside, runs immediately
7. async anonymous function        ← starts, no await inside, runs immediately
8. async arrow function            ← starts, no await inside, runs immediately
9. Event loop: nothing left        ← NOW resumes the paused async function
10. Todo title for id 10           ← finally prints

*/

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

const fetchTodoTitle = async (id: number): Promise<string> => {
  await delay(2000)
  return `Todo title for id ${id}`
}

;(async () => {
  const title = await fetchTodoTitle(10)
  console.log(title)
})()

//regular function call
function run(msg: string): void {
  console.log(`regular function run - ${msg}`)
}
run('Hello World')

//regular anonymous function
;(function (msg: string) {
  console.log(`regular Anonymous function run - ${msg}`)
})('Greetings earthlings')

//async function
;(async function f3(msg: string) {
  console.log(`Greeting from async fn f3 - ${msg}`)
})('Hola')

//async function with wait
;(async function f4(msg: string) {
  await delay(10)
  console.log(`Greeting from async with WAIT fn f4 - ${msg}`)
})('Hola WAIT')

//async anonymous function
;(async function (msg: string) {
  console.log(`Greeting from ASYNC ANONYMOUS fn - ${msg}`)
})('Namste')

//arrow function
;(async (msg: string) => {
  console.log(`This is a async arrow function - ${msg}`)
})('Big Kahuna')
