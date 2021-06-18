import { initMixin } from './init';

function Vue(options) {
	this._init(options); // 当用户 new Vue 时，会调用 init 方法进行 vue 的初始化
}

// Vue.prototype._init = function(options) {
//   const vm = this;
//   vm.$options = options; // 实例上有个属性$options 表示是用户传入的属性
// };

// 这样写的好处是可以查分逻辑，便于代码维护
initMixin(Vue); // 给原型上新增_init方法

export default Vue;
