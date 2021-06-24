import { arrayMethods } from './array';
import Dep from './dep';

class Observer {
	// value 观测的数据
	constructor(value) {
		this.dep = new Dep(); // 给数组本身和对象本身增加一个dep属性
		// 为了方便数组拿到 observeArray 方法，对新增的每一项进行观测
		// 不要这样写，会造成死循环
		// value.__ob__ = this
		Object.defineProperty(value, '__ob__', {
			value: this,
			enumerable: false, // 不能被枚举，表示不能被循环
			configurable: false // 不能删除此属性
		});

		// value 可能是对象，可能是数组，需要分类来处理
		if (Array.isArray(value)) {
			// 数组不用 Object.defineProperty 进行代理，性能不好

			// 有些浏览器不支持 __proto__， 所以使用 Object.setPrototypeOf
			// value.__proto__ = arrayMethods // 当value是数组时，调用的数组方法为改写后的方法
			Object.setPrototypeOf(value, arrayMethods);

			// 处理原有数组中元素为对象的情况，将每一项变为响应式的，但是还处理不了后续加入的对象
			this.observeArray(value);
		} else {
			this.walk(value);
		}
	}
  // 处理数组中的元素是对象的情况，注意：数组也是对象，就会递归观测，观测的时候回增加__ob__属性 Object.defineProperty(value, '__ob__', {...}
	observeArray(value) {
		value &&
			value.forEach((item) => {
				observe(item);
			});
	}
	walk(data) {
		// 将对象中所有 key 重新用 Object.defineProperty 定义成响应式的
		Object.keys(data).forEach((key) => {
			defineReactive(data, key, data[key]);
		});
	}
}
// value指代的是数组
// 让里层数组收集外层数组的依赖（因为收集的都是同一个watcher），这样修改里层数组也可以更新视图
function dependArray(value) {
	for (let i = 0; i < value.length; i++) {
		let current = value[i];
		current.__ob__ && current.__ob__.dep.depend(); // 让里层的数组和外层的数组收集的都是同一个watcher
		if (Array.isArray(current)) {
			dependArray(current);
		}
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

	// 相当于给数组本身添加了一个dep属性，让数组通过childOb.dep.depend()收集了watcher，等到数组中的内容发生变化去通知watcher更新
	let childOb = observe(value);
	// 在这个例子中，这个dep是给数组加的，仅限于这个例子
	console.log('childOb.dep', childOb.dep); // Dep {id: 1, subs: Array(0)}

	let dep = new Dep(); // 每次都会给属性创建deep，也就是每个属性都有一个deep属性，可以去记录当前的watcher
	Object.defineProperty(data, key, {
		get() {
			// 给每个属性增加一个deep，Dep.target指的是当前的watcher
			if (Dep.target) {
				dep.depend(); // 让当前属性的dep记住当前的watcher，也要让当前的watcher记住这个dep，注意只是让模板中使用到属性记住watcher，模板中没有使用到的属性不用记录watcher，防止无用更新

				// childOb 可能是对象也可能是数组，比如我们给对象新增了一个属性，需要出发对象的更新，如我们有对象 {a:1} ，我们使用$set(obj, b, 2)给这个对象新增了属性
				if (childOb) {
					// 如果对数组取值，会将当前的watcher和数组进行关联
					childOb.dep.depend();
					if (Array.isArray(value)) {
						// 如果内部还是数组
						dependArray(value); // 不停的进行依赖收集
					}
				}
			}
			return value;
		},
		set(newValue) {
			// 取值时会打印输出当前dep
			console.log(dep);
			// 如果新值和旧值相等，则不做任何操作
			if (newValue === value) return;
			/* 
      如果用户重重新给数据赋值成新值且这个新值是对象，要将这个对象设置成响应式的，如：
      vm.obj = {name:'d'}
      */
			observe(newValue);
			value = newValue;

			// 通知dep中记录的watcher让它去执行，更新页面
			dep.notify();
		}
	});
}
export function observe(data) {
	// 只对对象类型进行观测，非对象类型无法观测
	if (typeof data !== 'object' || data === null) return;

	// 如果对象包含__ob__属性，说明已经被观测过了，可以防止循环引用
	if (data.__ob__) return;

	// 通过类实现对数据的观测，用类的方便扩展，会产生一个实例作为唯一标识，可以用这个实例来判断data是否被观测了
	return new Observer(data);
}
