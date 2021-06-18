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
  // value有可能也是一个对象，需要递归遍历，所以vue2中数据尽量不要嵌套过深，会浪费性能
  /* 
  data() {
        return {
          name: 'f',
          obj: {
            name: 1,
            age: 2
          }
        }
      }
  */
  // Object.defineProperty只是重写了对象的get和set，Proxy是给对象设置代理不用改写对象性能高些，两者不一样
  observe(value)

  Object.defineProperty(data, key, {
    get() {
      return value
    },
    set(newValue) {
      // 如果新值和旧值相等，则不做任何操作
      if (newValue ===  value) return
      /* 
      如果用户重重新给数据赋值成新值且这个新值是对象，要将这个对象设置成响应式的，如：
      vm.obj = {name:'d'}
      */
      observe(newValue)
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
