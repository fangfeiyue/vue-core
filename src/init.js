import { initState } from './state';

export function initMixin(Vue) {
	Vue.prototype._init = function(options) {
		const vm = this;
		vm.$options = options; // 实例上有个属性$options表示的是用户传入的属性，可以通过vm.$options获取到用户传入的所有属性

		// 初始化状态
		initState(vm);

		// 有el属性的话，说明数据可以挂在到页面上
		if (vm.$options.el) {
			vm.$mount(vm.$options.el);
		}
	};
	Vue.prototype.$mount = function(el) {
		const vm = this;
		const options = vm.$options;
		el = document.querySelector(el);

    // 如果有render就直接用render，没有render，看看有没有template属性，如果也没有template属性的话，就直接找外部模板
		// 如果没有render方法
		if (!options.render) {
			let template = options.template;
			// 如果没有模板但是有el
			if (!template && el) {
				template = el.outerHTML;
			}
      // 将模板编译成render函数
			const render = compileToFunctions(template);
			options.render = render;
		}
	};
}
