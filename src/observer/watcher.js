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
		this.get();
	}
	get() {
		this.getter();
	}
}

export default Watcher;
