import {createComponentInstance, setupComponent} from "./component";
import {isObject} from "../shared/index";

export function render(vnode, container) {
  patch(vnode, container)
}

// 初始化Element
function mountElement(vnode, container) {
  const el = document.createElement(vnode.type)
  const {children} = vnode

  if (typeof children === 'string') {
    el.textContent = children
  } else if (Array.isArray(children)) {
    mountChildren(vnode, el)
  }

  const {props} = vnode
  for (const key of props) {
    const val = props[key]
    el.setAttribute(key, val)
  }
  container.append(el)
}

function mountChildren(vnode, container) {
  vnode.children.forEach(child => {
    patch(child, container)
  })
}

function processElement(vnode, container) {
  mountElement(vnode, container)
}

function patch(vnode, container) {
  // 判断vnode是否为组件或者element
  if (vnode.type === 'string') {
    processElement(vnode, container)
  } else if (isObject(vnode.type)) {
    processComponent(vnode, container)
  }
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container)
}

function mountComponent(vnode: any, container) {
  const instance = createComponentInstance(vnode);

  setupComponent(instance);
  setupRenderEffect(instance, container);
}

function setupRenderEffect(instance: any, container) {
  const subTree = instance.render();

  patch(subTree, container);
}
