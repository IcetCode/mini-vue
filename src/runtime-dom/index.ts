import {createRenderer} from "../runtime-core/renderer";

function createElement(type) {
  return document.createElement(type);
}

function patchProp(el, key, val) {
  const isOn = (key: string) => {
    return /^on[A-Z]/.test(key)
  }
  if (isOn(key)) {
    const event_1 = key.slice(2).toLowerCase()
    el.addEventListener(event_1, val)
  } else {
    el.setAttribute(key, val);
  }
}

function insert(el, parent) {
  parent.append(el)
}


const renderer: any = createRenderer({
  createElement, patchProp, insert
})

export function createApp(...args) {
  return renderer.createApp(...args)
}

export * from "../runtime-core"
