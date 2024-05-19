import { expect, test, vi } from 'vitest'

import { Event,EventEmitter, once, toPromise } from '.'

test("Event fire", async () => {
    const s1 = vi.fn();
    const s2 = vi.fn();
    const s3 = vi.fn();
    const emitter = new EventEmitter<string>()
    
    const l1 = emitter.event(s1)
    emitter.fire("a")
    const l2 = emitter.event(s2)
    emitter.fire("b")
    const l3 = emitter.event(s3)
    emitter.fire("c")

    l1.dispose()
    emitter.fire("d")
    l2.dispose()
    emitter.fire("e")
    l3.dispose()
    emitter.fire("f")

    expect(s1.mock.calls).to.deep.equal([["a"],["b"],["c"]])
    expect(s2.mock.calls).to.deep.equal([["b"],["c"],["d"]])
    expect(s3.mock.calls).to.deep.equal([["c"],["d"],["e"]])

})

test("Emits events once",async () => {
    const s = vi.fn()
    const emitter = new EventEmitter<number>();

    once(emitter.event,s)
    emitter.fire(1)
    emitter.fire(2)

    expect(s).toHaveBeenCalledWith(1)
    expect(s).toHaveBeenCalledOnce()
})

test("To Promise", async () => {
    const emitter = new EventEmitter<number>()

    const value = toPromise(emitter.event)
    emitter.fire(23)
    expect(await value).to.equal(23)

    expect(emitter.size).to.equal(0)
})

test("Cancel To Promise", async () => {
    const emitter = new EventEmitter<number>()

    const actr = new AbortController();
    setTimeout(() => actr.abort(), 1);
    const v = toPromise(emitter.event,actr.signal)
    expect(await v).to.be.undefined
    expect(emitter.size).to.equal(0)
})