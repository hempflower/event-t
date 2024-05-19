# Event-T: A VScode like event emitter

This is a simple Event Emitter that provides type safety based on TypeScript. It is easy to integrate into your project.

## Usage

```typescript
import { EventEmitter, toPromise, once } from "event-t"

// Your event
const aEvent = new EventEmitter<string>();
const onDidA = aEvent.event;

onDidA((data) => {
    console.log(data)
})

// once
once(onDidA,(data) => {
    console.log(data)
})

// Promise
const eventPromise = toPromise(aEvent.event)
// ... At any async function
console.log(await eventPromise)

// Fire event
aEvent.fire("Event data")


```