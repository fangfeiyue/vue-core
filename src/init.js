import { compileToFunctions } from './compiler/index';
import { callHook, mountComponent } from './lifeCycle';
import { initState } from './state';
import { mergeOptions } from './util/index';
import { nextTick } from './util/next-tick';

export function initMixin(Vue) {
	Vue.prototype._init = function(options) {
		const vm = this;
    // 用用户传去的options和全局的进行合并
    vm.$options = mergeOptions(vm.constructor.options, options)
    console.log(vm.$options)
		// vm.$options = options; // 实例上有个属性$options表示的是用户传入的属性，可以通过vm.$options获取到用户传入的所有属性
    callHook(vm, 'beforeCreate')
		// 初始化状态
		initState(vm);
    callHook(vm, 'created')

		// 有el属性的话，说明数据可以挂在到页面上
		if (vm.$options.el) {
			vm.$mount(vm.$options.el);
		}
	};
  Vue.prototype.$nextTick = nextTick
	Vue.prototype.$mount = function(el) {
		const vm = this;
		const options = vm.$options;
		el = el && document.querySelector(el);
    vm.$el = el;
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
			console.log('render', render);
		}

		mountComponent(vm, el); // 组件挂载
	};
}
