import {createVNode} from "../vnode";

export function renderSlots(slots, name, props) {
  return createVNode('div', {}, slots)
}
