import { observe } from './observer/index';
import Watcher from './observer/watcher';
import { isObject } from './util/index';

// 作用：将所有数据定义在vm属性上，并且后续更改触发视图更新
export function initState(vm) {
	const opts = vm.$options; // 获取用户传入属性

	if (opts.props) {
		initProps(vm);
	}
	if (opts.methods) {
		// initMethod(vm);
	}
	if (opts.data) {
		// 初始化data
		initData(vm);
	}
	if (opts.computed) {
		initComputed(vm);
	}
	if (opts.watch) {
    initWatch(vm, opts.watch);
	}
}
function proxy(vm, source, key) {
	Object.defineProperty(vm, key, {
		get() {
			return vm[source][key];
		},
		set(newValue) {
			vm[source][key] = newValue;
		}
	});
}
function initData(vm) {
	let data = vm.$options.data;
	// 对data类型进行判断，如果是函数获取函数返回值作为对象，使用call是保证当前的this指向实例，因为我们可以在data中调用this.xxx
	data = vm._data = typeof data === 'function' ? data.call(vm) : data;
	// 通过 vm._data获取劫持后的数据，用户就可以通过拿到_data了，要不虽然我们对数据进行了劫持，但是用户无法拿到劫持后的data，因为如果data是一个函数，函数执行完返回的对象外部无法拿到

	// 将_data中的数据全部放到vm上，让用户可以通过vm.xx直接拿到数据，而不用像vm._data.xxx这么麻烦
	for (let key in data) {
		proxy(vm, '_data', key);
	}

	// 观察数据
	observe(data);
}

function initWatch(vm, watch) {
  for (let key in watch) {
    // 获取key对应的值
    const handler = watch[key];
    // 如果用户传入的是一个数组就循环数组，将值依次进行创建
    if (Array.isArray(handler)) {
      handler.forEach(handler => {
        createWatcher(vm, key ,handler);
      })
    }else {
      // 单纯的key value
      createWatcher(vm, key, handler)
    }
  }
}

function createWatcher(vm, key, handler, options) {
	if (isObject(handler)) {
		options = handler;
		handler = handler.handler;
	}

	if (typeof handler === 'string') {
		handler = vm.$options.methods[handler];
	}
	// 参数的格式化操作
	console.log('handler==>', handler, options);
  // watch的原理就是$watch
  return vm.$watch(key, handler, options);
}

export function stateMixin(Vue) {
  Vue.prototype.$watch = function(expOrFn, cb, options={}) {
    // 之前的 watcher 叫渲染 watcher，现在的这个 watcher 叫用户 watcher。
    const vm = this;
    options.user = true; // 当前是用户自己写的 watcher
    new Watcher(vm, expOrFn, cb, options);
  }
}