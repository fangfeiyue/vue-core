import { mergeOptions } from '../util/index.js';
export function initGlobalAPI(Vue) {
	Vue.options = {}; // 用来存储全局的配置，如多次调用了Vue.mixin()，将里面的数据合并到这个对象

	Vue.mixin = function(mixin) {
		// 将属性合并到Vue.options上
		this.options = mergeOptions(this.options, mixin);
		return this;
	};

	// 这个变量永远指向vue的构造函数，保证this永远指向大Vue
	Vue.options._base = Vue;
	// 用来存放组件的定义
	Vue.options.components = {};
	// id 组件名 definition 组件定义
	Vue.component = function(id, definition) {
		/* 
    Vue.component('xxx', {
      name: 'xxx'
      template: '<div>xxx</div>'
    })
    如果有name优先取name
    */
		definition.name = definition.name || id;
		definition = this.options._base.extend(definition) // 通过对象产生一个构造函数
		this.options.components[id] = definition;
	};
	Vue.extend = function(options) {
		// 子组件初始化时会new VueComponent(options)
    // Super 永远指向大Vue
		const Super = this;
		const Sub = function VueComponent(options) {
			this._init(options);
		};
		Sub.prototype = Object.create(Super.prototype); // 都是通过大 Vue 继承的
		Sub.prototype.constructor = Sub;
		Sub.component = Super.component;
    // 这里的目的是把 Vue.options 和当前 new 的时候传入的选项做一个合并，这样合并完成之后，当初始化也就是创建这个组件实例的时候，会再拿当前子的选项和用户传入的选项再做一个合并
    // 每次声明一个组件，都会把父级的定义在自己身上
		Sub.options = mergeOptions(Super.options, options);
		
    return Sub; // 这个构造函数是由对象产生来的
	};
}
