import {h} from '../../lib/guide-mini-vue.esm'

export const App = {
  render() {
    // ui
    return h(
      "div",
      {
        id: "root",
        class: ["red", "blue"]
      },
      [h("p", {class: "red"}, "hi")]
    );
  },
  setup() {
    return {
      msg: "mini-vue",
    };
  },
};
