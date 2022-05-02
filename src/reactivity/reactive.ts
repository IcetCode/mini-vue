import {track, trigger} from "./effect";
import {mutableHandlers, readonlyHandlers} from "./baseHandler";

export function reactive(raw) {
  return createReactiveObject(raw, mutableHandlers)
}

export function createReactiveObject(raw, baseHandles) {
  return new Proxy(raw, baseHandles)
}

export function readonly(raw) {
  return createReactiveObject(raw, readonlyHandlers)
}
