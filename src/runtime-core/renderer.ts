import {createComponentInstance, setupComponent} from "./component";
import {ShapeFlags} from "../shared/shapeFlag";
import {Fragment, Text} from "./vnode";

export function render(vnode, container) {
  patch(vnode, container)
}

function patch(vnode, container) {
  // 判断vnode是否为组件或者element
  const {type, shapeFlag} = vnode
  switch (type) {
    case Fragment:
      processFragment(vnode, container)
      break
    case Text:
      processText(vnode, container)
      break
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container)
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container)
      }
  }
}

function processText(vnode, container) {
  const {children} = vnode
  const textNode = document.createTextNode(children)
  container.append(textNode)
}

function processFragment(vnode, container) {
  mountChildren(vnode, container)
}


// 初始化Element
function processElement(vnode: any, container: any) {
  mountElement(vnode, container)
}

function mountElement(vnode: any, container: any) {
  const el = (vnode.el = document.createElement(vnode.type))
  const {children, shapeFlag} = vnode;

  // children
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el);
  }

  // props
  const {props} = vnode;
  for (const key in props) {
    const val = props[key];
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

  container.append(el);
}

function mountChildren(vnode, container) {
  vnode.children.forEach(v => {
    patch(v, container)
  })
}


function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container)
}

function mountComponent(initialVNode: any, container) {
  const instance = createComponentInstance(initialVNode);

  setupComponent(instance);
  setupRenderEffect(instance, initialVNode, container);
}

function setupRenderEffect(instance: any, initialVNode, container) {
  const {proxy} = instance
  const subTree = instance.render.call(proxy)
  patch(subTree, container);
  initialVNode.el = subTree.el
}
