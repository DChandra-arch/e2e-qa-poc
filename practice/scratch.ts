//"The interface TodoItem defines the shape — the field names and their types.
// The const sampleTodo is an object typed as TodoItem, meaning TypeScript will enforce that it has exactly those fields with exactly those types."
interface TodoItem {
  id: number
  title: string
  completed: boolean
}

const sampleToDo: TodoItem = {
  id: 1,
  title: 'buy Milk',
  completed: false,
}

//Task 1 — Variables
const cameraId = 'cam-001'
const maxRetries = 3
let currentRetry = 0
console.log(`===============TASK 1 ============`)
console.log(
  `cameraId = ${cameraId},  maxRetries = ${maxRetries}, currentRetry = ${currentRetry}`
)
currentRetry = 1
console.log(
  `cameraId = ${cameraId},  maxRetries = ${maxRetries}, currentRetry = ${currentRetry}`
)

//Task 2 — Object + template literal
console.log(`===============TASK 2 ============`)
const streamEvent = {
  deviceId: 'cam-001',
  status: 'stream_started',
  timestamp: 1701000000,
}
//Device cam-001 sent stream_started at 1701000000
console.log(
  `Device ${streamEvent.deviceId} sent ${streamEvent.status} at ${streamEvent.timestamp}`
)

//Task 3 — Interface + typed object
console.log(`===============TASK 3 ============`)
interface StreamEvent {
  deviceId: string
  status: string
  timestamp: Number
}

const streamEvent2: StreamEvent = {
  deviceId: 'cam-02',
  status: 'stream_stopped',
  timestamp: 24,
}
console.log(
  `Device ${streamEvent2.deviceId} sent ${streamEvent2.status} at ${streamEvent2.timestamp}`
)

//Task 4 — Functions
console.log(`===============TASK 4 ============`)
const formatStatus = (status: string): string => {
  return status.toUpperCase().replace('_', ' ')
}
console.log(`status is ${formatStatus(streamEvent2.status)}`)

//Task 5 — Array
console.log(`===============TASK 5 ============`)
const todoTitles: string[] = [
  'title1 1111',
  'title2 2',
  'title3 333',
  'title4 444',
  'title5 ',
]

todoTitles.forEach((title) =>
  console.log(`title = ${title} and len = ${title.length}`)
)
const largeTitles = todoTitles.filter((title) => title.length > 8)
console.log(`largeTitles = ${largeTitles}`)
