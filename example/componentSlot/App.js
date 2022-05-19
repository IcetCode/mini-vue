import {h} from "../../lib/guide-mini-vue.esm.js"
import {Foo} from './Foo.js'

export const App = {
  render() {
    const app = h("div", {}, 'hello')
    const foo = h(Foo, {name: 'calvin'}, h('p', {}, 123))
    return h("div", {}, [app, foo]);
  },
  setup() {
    return {
      msg: "mini-vue",
    };
  },
};
