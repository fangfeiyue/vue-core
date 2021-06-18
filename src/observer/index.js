class Observer {
	// value 观测的数据
	constructor(value) {
		this.walk(value);
	}
  walk(data) {
    // 将对象中所有 key 重新用 Object.defineProperty 定义成响应式的
    Object.keys(data).forEach(key => {
      defineReactive(data, key, data[key])
    })
  }
}

// 没有放到原型上的原因是因为这个方法不一定是通过实例调用的，如Vue.util.defineReactive
export function defineReactive(data, key, value) {
  Object.defineProperty(data, key, {
    get() {
      return value
    },
    set(newValue) {
      // 如果新值和旧值相等，则不做任何操作
      if (newValue ===  value) return
      value = newValue
    }
  })
}
export function observe(data) {
	// 只对对象类型进行观测，非对象类型无法观测
	if (typeof data !== 'object' || data === null) return;

	// 通过类实现对数据的观测，用类的方便扩展，会产生一个实例作为唯一标识，可以用这个实例来判断data是否被观测了
	return new Observer(data);
}
