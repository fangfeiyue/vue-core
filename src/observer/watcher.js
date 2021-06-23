import { popTarget, pushTarget } from './dep';

// id用于标识不同组件不同的watcher
let id = 0;
class Watcher {
	constructor(vm, exprOrFn, cb, options) {
		this.vm = vm;
		this.exprOrFn = exprOrFn;
		if (typeof exprOrFn == 'function') {
			this.getter = exprOrFn;
		}
		this.cb = cb;
		this.options = options;
		// 每创建一个watcher就让id自增
		this.id = id++;
		// 让watcher记住dep
		this.deps = [];
		this.depsId = new Set();
		this.get();
	}
	get() {
		// 渲染之前，存储当前的watcher，这个watcher里有一个get方法
		pushTarget(this); // 给 Dep.target 赋值为当前的 watcher，也就是将watcher放到全局上
		this.getter(); // 这个方法会取data中的值，这个方法调用了render函数，会对模板的数据进行取值，触发Object.defineProperty的get方法

		// 清除当前watcher，为什么要清除当前的watcher呢，这是因为当我们没有在模板中使用数据，而是在其他地方使用的数据，不需要收集依赖
		popTarget(); // Dep.target = null
	}
	// 当属性取值时，需要记住这个watcher，等数据发生了变化，去执行自己记住的watcher，这个watcher会重新调用_update方法去更新

	// 让watcher记住deep
	addDep(dep) {
		// 不能直接这么写，因为页面中可能多次调用同一个数据， 如：{{name}} {{name}} {{name}}，这样当前的watcher就存放了多个相同的deep了，不合理
		// this.deps.push(dep)

		let id = dep.id;
		// 使用set集合去重，过滤重复的dep
		if (!this.depsId.has(id)) {
			// dep是非重复的，watcher肯定也不会重
			this.depsId.add(id);
			// 让当前的watcher记住deep
			this.deps.push(dep);
			// 让dep记住当前watcher
			dep.addSub(this);
		}
	}
	update() {
		this.get();
	}
}

// 在取值之前把watcher暴露到全局上，让所有属性(这个属性必须在模板中使用到)的deep都记住这个watcher，等数据变了，就可以让属性记住的watcher去执行
export default Watcher;
