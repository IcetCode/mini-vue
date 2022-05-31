import {createComponentInstance, setupComponent} from "./component";
import {ShapeFlags} from "../shared/shapeFlag";
import {Fragment, Text} from "./vnode";
import {createAppApi} from "./createApp";


export function createRenderer(options) {
  const {createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert} = options

  function render(vnode, container) {
    patch(vnode, container, null)
  }

  function patch(vnode, container, parentComponent) {
    // 判断vnode是否为组件或者element
    const {type, shapeFlag} = vnode
    switch (type) {
      case Fragment:
        processFragment(vnode, container, parentComponent)
        break
      case Text:
        processText(vnode, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(vnode, container, parentComponent)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(vnode, container, parentComponent)
        }
    }
  }

  function processText(vnode, container) {
    const {children} = vnode
    const textNode = document.createTextNode(children)
    container.append(textNode)
  }

  function processFragment(vnode, container, parentComponent) {
    mountChildren(vnode, container, parentComponent)
  }


// 初始化Element
  function processElement(vnode: any, container: any, parentComponent) {
    mountElement(vnode, container, parentComponent)
  }

  function mountElement(vnode: any, container: any, parentComponent) {
    const el = (vnode.el = hostCreateElement(vnode.type))
    const {children, shapeFlag} = vnode;

    // children
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode, el, parentComponent);
    }

    // props
    const {props} = vnode;
    for (const key in props) {
      const val = props[key];
      hostPatchProp(el, key, val)
    }

    hostInsert(el, container)
  }

  function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach(v => {
      patch(v, container, parentComponent)
    })
  }


  function processComponent(vnode: any, container: any, parentComponent) {
    mountComponent(vnode, container, parentComponent)
  }

  function mountComponent(initialVNode: any, container, parentComponent) {
    const instance = createComponentInstance(initialVNode, parentComponent);

    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
  }

  function setupRenderEffect(instance: any, initialVNode, container) {
    const {proxy} = instance
    const subTree = instance.render.call(proxy)
    patch(subTree, container, instance);
    initialVNode.el = subTree.el
  }

  return {
    createApp: createAppApi(render)
  }
}

