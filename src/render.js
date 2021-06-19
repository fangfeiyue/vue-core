import { createElement, createTextNode } from "./vdom/index";

export function renderMixin(Vue) {
	Vue.prototype._v = function(text) {
		// 创建文本
		return createTextNode(text);
	};
	Vue.prototype._c = function() {
		// 创建元素
		return createElement(...arguments);
	};
	Vue.prototype._s = function(val) {
    // 转化成字符串
		return val == null ? '' : typeof val === 'object' ? JSON.stringify(val) : val;
	};
	Vue.prototype._render = function() {
		console.log('_render');
		const vm = this;
		const render = vm.$options.render; // 获取编译后的render方法
		// 调用render方法生成vnode，在调用时自动对变量求值
		const vnode = render.call(vm);
		return vnode;
	};
}
