// 可以把当前的watcher放到一个全局变量上

// id 用于表示dep的唯一性
let id = 0;
class Dep {
	constructor() {
		this.id = id++;
		// 属性记住watcher
		this.subs = [];
	}
	depend() {
		// Dep.target指的是当前的watcher
		if (Dep.target) {
			// 调用watcher的addDep方法实现dep记住watcher，watcher记住dep的功能
			Dep.target.addDep(this); // 让watcher,去存放dep，this指代的是当前dep
		}
	}
	notify() {
		this.subs.forEach((watcher) => watcher.update());
	}
	addSub(watcher) {
		// 属性deep记住当前的watcher
		this.subs.push(watcher);
	}
}

Dep.target = null;
const stack = [];

export function pushTarget(watcher) {
	Dep.target = watcher;
	stack.push(watcher);
}
export function popTarget() {
	// Dep.target = null;
	stack.pop();
	Dep.target = stack[stack.length - 1];
}
export default Dep;
