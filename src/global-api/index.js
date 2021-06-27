import { mergeOptions } from '../util/index.js';
export function initGlobalAPI(Vue) {
	Vue.options = {}; // 用来存储全局的配置，如多次调用了Vue.mixin()，将里面的数据合并到这个对象

	Vue.mixin = function(mixin) {
		// 将属性合并到Vue.options上
		this.options = mergeOptions(this.options, mixin);
		return this;
	}; 
}
