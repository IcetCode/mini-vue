function createVNode(type, props, children) {
  const vnode = {
    type,
    props,
    children,
    shapeFlag: getShapeFlag(type),
    el: null
  };
  if (typeof children === "string") {
    vnode.shapeFlag |= 4 /* TEXT_CHILDREN */;
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= 8 /* ARRAY_CHILDREN */;
  }
  return vnode;
}

function getShapeFlag(type) {
  return typeof type === 'string' ? 1 /* ELEMENT */ : 2 /* STATEFUL_COMPONENT */;
}

const extend = Object.assign;
const isObject = (value) => {
  return value !== null && typeof value === "object";
};
const hasOwn = (val, key) => {
  return Object.prototype.hasOwnProperty.call(val, key);
};
const camelize = (str) => {
  return str.replace(/-(\w)/g, (_, c) => {
    return c ? c.toUpperCase() : "";
  });
};
const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
const toHandlerKey = (str) => {
  return str ? "on" + capitalize(str) : "";
};

const publicPropertiesMap = {
  $el: (i) => i.vnode.el
};
// render中this.xxx获取触发get方法
const PublicInstanceProxyHandlers = {
  get({_: instance}, key) {
    const {setupState, props} = instance;
    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(props, key)) {
      return props[key];
    }
    const publicGetter = publicPropertiesMap[key];
    if (publicGetter) {
      return publicGetter(instance);
    }
  }
};

function initProps(instance, rawProps) {
  instance.props = rawProps || {};
}

const targetMap = new Map();

function trigger(target, key) {
  const depsMap = targetMap.get(target);
  const dep = depsMap.get(key);
  triggerEffects(dep);
}

function triggerEffects(dep) {
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

// 初始化时直接进行缓存
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key) {
    const res = Reflect.get(target, key);
    if (key === "__v_isReactive" /* IS_REACTIVE */) {
      return !isReadonly;
    } else if (key === "__v_isReadonly" /* IS_READONLY */) {
      return isReadonly;
    }
    if (shallow) {
      return res;
    }
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }
    return res;
  };
}

function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value);
    // 触发依赖
    trigger(target, key);
    return res;
  };
}

const mutableHandlers = {
  get,
  set
};
const readonlyHandlers = {
  get: readonlyGet,
  set(target, key) {
    console.warn(`key: "${String(key)}" set 失败，因为 target 是 readonly类型`, target);
    return true;
  }
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet
});

function reactive(raw) {
  return createReactiveObject(raw, mutableHandlers);
}

function readonly(raw) {
  return createReactiveObject(raw, readonlyHandlers);
}

function shallowReadonly(raw) {
  return createReactiveObject(raw, shallowReadonlyHandlers);
}

function createReactiveObject(target, baseHandles) {
  if (!isObject(target)) {
    console.warn(`target ${target} 必须是一个对象`);
    return target;
  }
  return new Proxy(target, baseHandles);
}

function emit(instance, event, ...args) {
  const {props} = instance;
  const handlerName = toHandlerKey(camelize(event));
  const handler = props[handlerName];
  handler && handler(...args);
}

function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    emit: () => {
    },
  };
  component.emit = emit.bind(null, component);
  return component;
}

function setupComponent(instance) {
  // TODO
  initProps(instance, instance.vnode.props);
  // initSlots()
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance) {
  const Component = instance.type;
  const {setup} = Component;
  instance.proxy = new Proxy({_: instance}, PublicInstanceProxyHandlers);
  if (setup) {
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit
    });
    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance, setupResult) {
  // function Object
  // TODO function
  if (typeof setupResult === "object") {
    instance.setupState = setupResult;
  }
  finishComponentSetup(instance);
}

function finishComponentSetup(instance) {
  const Component = instance.type;
  // if (Component.render) {
  instance.render = Component.render;
  // }
}

function render(vnode, container) {
  patch(vnode, container);
}

function patch(vnode, container) {
  // 判断vnode是否为组件或者element
  const {shapeFlag} = vnode;
  if (shapeFlag & 1 /* ELEMENT */) {
    processElement(vnode, container);
  } else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
    processComponent(vnode, container);
  }
}

// 初始化Element
function processElement(vnode, container) {
  mountElement(vnode, container);
}

function mountElement(vnode, container) {
  const el = (vnode.el = document.createElement(vnode.type));
  const {children, shapeFlag} = vnode;
  // children
  if (shapeFlag & 4 /* TEXT_CHILDREN */) {
    el.textContent = children;
  } else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
    mountChildren(vnode, el);
  }
  // props
  const {props} = vnode;
  for (const key in props) {
    const val = props[key];
    const isOn = (key) => {
      return /^on[A-Z]/.test(key);
    };
    if (isOn(key)) {
      const event_1 = key.slice(2).toLowerCase();
      el.addEventListener(event_1, val);
    } else {
      el.setAttribute(key, val);
    }
  }
  container.append(el);
}

function mountChildren(vnode, container) {
  vnode.children.forEach(v => {
    patch(v, container);
  });
}

function processComponent(vnode, container) {
  mountComponent(vnode, container);
}

function mountComponent(initialVNode, container) {
  const instance = createComponentInstance(initialVNode);
  setupComponent(instance);
  setupRenderEffect(instance, initialVNode, container);
}

function setupRenderEffect(instance, initialVNode, container) {
  const {proxy} = instance;
  const subTree = instance.render.call(proxy);
  patch(subTree, container);
  initialVNode.el = subTree.el;
}

function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      const vnode = createVNode(rootComponent);
      render(vnode, rootContainer);
    }
  };
}

function h(type, props, children) {
  return createVNode(type, props, children);
}

export {createApp, h};
