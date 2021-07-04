import { compileToFunctions } from './compiler/index';
import { initGlobalAPI } from './global-api/index';
import { initMixin } from './init';
import { lifecycleMixin } from './lifeCycle';
import { createElm, patch } from './observer/patch';
import { renderMixin } from './render';

function Vue(options) {
	this._init(options); // 当用户 new Vue 时，会调用 init 方法进行 vue 的初始化
}

// Vue.prototype._init = function(options) {
//   const vm = this;
//   vm.$options = options; // 实例上有个属性$options 表示是用户传入的属性
// };

// 这样写的好处是可以查分逻辑，便于代码维护
initMixin(Vue); // 给原型上新增_init方法
lifecycleMixin(Vue); // 更新逻辑 包含的主要方法_update()
renderMixin(Vue); // 调用render逻辑 包含的主要方法_render()

initGlobalAPI(Vue); // 混合全局的api

// 我们自己构建两个虚拟dom，之后手动进行比对
const vm1 = new Vue({
	data() {
		return {
			name: 'fang'
		};
	}
});
// 将模板编译成 render 函数
const render1 = compileToFunctions('<div style="color:red;">{{name}}</div>');
// 生成虚拟节点
const oldVnode = render1.call(vm1);
// 创建真实节点
const el1 = createElm(oldVnode);
// 挂载节点
document.body.appendChild(el1);

const vm2 = new Vue({
	data() {
		return {
			name: 'fei'
		};
	}
});
// 将模板编译成 render 函数
const render2 = compileToFunctions('<div style="background:blue;">{{name}}</div>');
// 生成虚拟节点
const newVnode = render2.call(vm2);
setTimeout(() => {
	patch(oldVnode, newVnode); // 包括了初次渲染和 diff 算法的流程。
	console.log('执行了');
}, 2000);

export default Vue;
