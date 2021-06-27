import { observe } from './observer/index';

// 作用：将所有数据定义在vm属性上，并且后续更改触发视图更新
export function initState(vm) {
	const opts = vm.$options; // 获取用户传入属性

	if (opts.props) {
		initProps(vm);
	}
	if (opts.methods) {
		initMethod(vm);
	}
	if (opts.data) {
		// 初始化data
		initData(vm);
	}
	if (opts.computed) {
		initComputed(vm);
	}
	if (opts.watch) {
		initWatch(vm);
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
