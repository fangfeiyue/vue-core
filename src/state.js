import Dep from './observer/dep';
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
		initComputed(vm, opts.computed);
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

// 内部原理都是通过wacher实现的
function initComputed(vm, computed) {
	// _computedWatchers 存放这所有计算属性对应的 wacher
	const watchers = (vm._computedWatchers = {});

	for (let key in computed) {
		const userDef = computed[key]; // 获取用户定义的函数
		const getter = typeof userDef === 'function' ? userDef : userDef.get;
		// lazy: true 表示是一个 computed 属性， watcher 内部会根据 lazy 属性判断是否调用getter 方法
		watchers[key] = new Watcher(vm, getter, () => {}, { lazy: true });

		// 计算属性可以通过 vm 进行取值，所以将属性
		defineComputed(vm, key, userDef);
	}
}

// 属性描述器
const sharedPropertyDefinition = {
	enumerable: true,
	configurable: true,
	get: () => {}
};

function defineComputed(vm, key, userDef) {
	if (typeof userDef === 'function') {
		sharedPropertyDefinition.get = createComputedGetter(key);
	} else {
		sharedPropertyDefinition.get = createComputedGetter(key);
		sharedPropertyDefinition.set = userDef.set || (() => {});
	}
	Object.defineProperty(vm, key, sharedPropertyDefinition);
}

// 通过 watcher 来实现计算属性的缓存的功能
function createComputedGetter(key) {
	return function() {
		const watcher = this._computedWatchers[key];
		// 第一次取值 dirty 为 true， 调用用户的方法
		if (watcher.dirty) watcher.evaluate();
		if (Dep.target) {
			// watcher 指代计算属性的 watcher
			watcher.depend(); // 渲染 watcher 一并收集起来
		}
		return watcher.value;
	};
}

function initWatch(vm, watch) {
	for (let key in watch) {
		// 获取key对应的值
		const handler = watch[key];
		// 如果用户传入的是一个数组就循环数组，将值依次进行创建
		if (Array.isArray(handler)) {
			// handler.forEach((handler) => {
			// 	createWatcher(vm, key, handler);
			// });
			for (let i = 0, len = handler.length; i < len; i++) {
				createWatcher(vm, key, handler[i]);
			}
		} else {
			// 单纯的key value
			createWatcher(vm, key, handler);
		}
	}
}

function createWatcher(vm, key, handler, options) {
	if (isObject(handler)) {
		options = handler;
		handler = handler.handler;
	}

	if (typeof handler === 'string') {
		// 获取 method 中的方法
		handler = vm.$options.methods[handler];
	}
	// 参数的格式化操作
	console.log('handler==>', handler, options);
	// watch的原理就是$watch
	return vm.$watch(key, handler, options);
}

export function stateMixin(Vue) {
	Vue.prototype.$watch = function(expOrFn, cb, options = {}) {
		// 之前的 watcher 叫渲染 watcher，现在的这个 watcher 叫用户 watcher。
		const vm = this;
		options.user = true; // 当前是用户自己写的 watcher
		new Watcher(vm, expOrFn, cb, options);
	};
}
