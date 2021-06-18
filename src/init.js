import { initState } from "./state";

export function initMixin(Vue) {
	Vue.prototype._init = function(options) {
		const vm = this;
		vm.$options = options; // 实例上有个属性$options表示的是用户传入的属性，可以通过vm.$options获取到用户传入的所有属性

		// 初始化状态
		initState(vm);
	};
}


