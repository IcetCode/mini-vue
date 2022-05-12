const publicPropertiesMap = {
  $el: (i) => i.vnode.el
}

// render中this.xxx获取触发get方法
export const PublicInstanceProxyHandlers = {
  get({_: instance}, key) {
    const {setupState} = instance
    if (key in setupState) {
      return setupState[key]
    }
    
    const publicGetter = publicPropertiesMap[key]
    if (publicGetter) {
      return publicGetter(instance)
    }
  }
}
