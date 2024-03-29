import {reactive} from "../reactive";
import {effect, stop} from "../effect";

describe("effect", () => {
  it('happy path', () => {
    const user = reactive({age: 22})
    let nextAge
    effect(() => {
      nextAge = user.age + 1
    })
    expect(nextAge).toBe(23)

    // update
    user.age++
    expect(nextAge).toBe(24)
  })
  it('should return when call effect', () => {
    let foo = 0
    const runner = effect(() => {
      foo++
      return foo
    })
    expect(foo).toBe(1)
    runner()
    expect(foo).toBe(2)
    expect(runner()).toBe(3)
  });

  it("scheduler", () => {
    // 1.初始化时执行fn
    // 2.reactive触发set时，不执行fn，执行传入的scheduler函数
    // 3.调用runner时执行fn
    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      run = runner;
    });
    const obj = reactive({foo: 1});
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      {scheduler}
    );
    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);
    // should be called on first trigger
    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1);
    // // should not run yet
    expect(dummy).toBe(1);
    // // manually run
    run();
    // // should have run
    expect(dummy).toBe(2);
  });

  it("stop", () => {
    let dummy;
    const obj = reactive({prop: 1});
    const runner = effect(() => {
      dummy = obj.prop;
    });
    obj.prop = 2;
    expect(dummy).toBe(2);
    stop(runner);
    // obj.prop = 3;
    obj.prop++
    expect(dummy).toBe(2);

    // stopped effect should still be manually callable
    runner();
    expect(dummy).toBe(3);
  });

  it("onStop", () => {
    const obj = reactive({
      foo: 1,
    });
    const onStop = jest.fn();
    let dummy;
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      {
        onStop,
      }
    );

    stop(runner);
    expect(onStop).toBeCalledTimes(1);
  });
})
