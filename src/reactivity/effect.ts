import {extend} from "../shared";

let activeEffect
let shouldTrack = false // 判断stop时是否应该进行依赖收集

class ReactiveEffect {
  private _fn: any;
  deps: any[] = []
  active = true // 判断是否处于stop状态
  onStop?: () => void
  public scheduler: Function | undefined

  constructor(fn, scheduler?: Function) {
    this._fn = fn
    this.scheduler = scheduler
  }

  run() {
    if (!this.active) {
      return this._fn()
    }
    // 收集
    shouldTrack = true
    activeEffect = this
    const r = this._fn()

    // reset
    shouldTrack = false

    return r
  }

  stop() {
    if (this.active) {
      cleanEffect(this)
      if (this.onStop) {
        this.onStop()
      }
      this.active = false
    }
  }
}

function cleanEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect)
  })
  effect.deps.length = 0
}


const targetMap = new Map()

export function track(target, key) {
  if (!isTracking())
    return

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }
  if (dep.has(activeEffect))
    return

  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}

function isTracking() {
  return shouldTrack && activeEffect !== undefined;
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  const dep = depsMap.get(key)

  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}


export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  extend(_effect, options)
  _effect.run()
  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

export function stop(runner) {
  runner.effect.stop()
}
