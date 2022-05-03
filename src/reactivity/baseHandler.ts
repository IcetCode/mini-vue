import {track, trigger} from "./effect";
import {reactive, ReactiveFlags, readonly} from "./reactive";
import {isObject} from "../shared";

// 初始化时直接进行缓存
const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

export function createGetter(isReadonly = false) {
  return function get(target, key) {
    const res = Reflect.get(target, key)
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }
    
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }
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
