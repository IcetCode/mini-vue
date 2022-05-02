import {reactive} from "../reactive";
import {effect} from "../effect";

describe("effect", () => {
  it('ok', () => {
    const user = reactive({age: 22})
    let nextAge
    effect(() => {
      nextAge = user.age + 1
    })
    expect(nextAge).toBe(23)

    // update
    user.age++
    expect(nextAge).toBe(24)
  })
})
