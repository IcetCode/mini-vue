import {createComponentInstance, setupComponent} from "./component";
import {isObject} from "../shared/index";
import {ShapeFlags} from "../shared/shapeFlag";

export function render(vnode, container) {
  patch(vnode, container)
}

function patch(vnode, container) {
  // 判断vnode是否为组件或者element
  const {shapeFlag} = vnode
  if (shapeFlag & shapeFlag.ELEMENT) {
    processElement(vnode, container)
  } else if (shapeFlag & shapeFlag.STATEFUL_COMPONENT) {
    processComponent(vnode, container)
  }
}

// 初始化Element


function processElement(vnode: any, container: any) {
  mountElement(vnode, container)
}

function mountElement(vnode: any, container: any) {
  const el = (vnode.el = document.createElement(vnode.type))

  const {children,shapeFlag} = vnode;

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
    el.setAttribute(key, val);
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