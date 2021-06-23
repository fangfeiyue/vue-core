import { patch } from './observer/patch';
import Watcher from './observer/watcher';

export function lifecycleMixin(Vue) {
	Vue.prototype._update = function(vnode) {
		console.log('_udpate', vnode);
		// 将虚拟节点转换成真实dom
		const vm = this;
    // 首次渲染需要用虚拟节点更新真实dom
		vm.$el = patch(vm.$options.el, vnode);
	};
}
export function mountComponent(vm, el) {
	// 默认 vue 通过 watcher 来渲染，这个watcher可以叫做渲染watcher，每个组件都有一个渲染watcher
	vm.$el = el;
	let updateComponent = () => {
		// 将虚拟节点 渲染到页面上
		// vm._render() 返回虚拟节点
		// vm._update() 将虚拟节点转换成真实节点
		vm._update(vm._render());
	};
	new Watcher(
		vm,
		updateComponent,
		() => {
			// 回调函数
		},
		true
	); // true 表示这是一个渲染watcher
}
