import {track, trigger} from "./effect";

// 初始化时直接进行缓存
const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

export function createGetter(isReadonly = false) {
  return function get(target, key) {
    const res = Reflect.get(target, key)
    //  收集依赖
    if (!isReadonly) {
      track(target, key)
    }
    return res
  }
}

export function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value)
    // 触发依赖
    trigger(target, key)
    return res
  }
}

export const mutableHandlers = {
  get,
  set
}

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key) {
    console.warn(`key: "${String(key)}" set 失败，因为 target 是 readonly类型`, target)
    return true
  }
}
