import { isObject, isReservedTag } from '../util/index';

/* 
虚拟dom可以随意添加属性，ast是针对语法解析出来的，不能随意添加属性
*/
export function createTextNode(vm, text) {
	return vnode(vm, undefined, undefined, undefined, undefined, text);
}
export function createElement(vm, tag, data = {}, ...children) {
	// 如果是列表元素需要添加key属性，这里对key进行处理
	let key = data.key;
	if (key) {
		delete data.key;
	}
	// 需要对标签名做过滤，因为有可能标签名是一个自定义组件
	if (isReservedTag(tag)) {
		return vnode(vm, tag, data, key, children);
	} else {
		// Ctor 可能是对象，也可能是函数
		/* 
    const vm = new Vue({
      el: '#app',
      // 这种情况 extend 方法包裹，返回的是对象
      components: {
        'my-button': {
          template: `<button>按钮2</button>`
        }
      }
    })

    // 这种情况是函数
    Vue.component('my-button', {
      template: '<button>按钮1</button>'
    })
    */
		const Ctor = vm.$options.components[tag];
		return createComponent(vm, tag, data, key, children, Ctor);
	}
}

function createComponent(vm, tag, data, key, children, Ctor) {
	if (isObject(Ctor)) {
		// 如果 Ctor 是对象，将其转为函数
		Ctor = vm.$options._base.extend(Ctor);
	}
	// 给组件增加生命周期
	data.hook = {
		// 初始化钩子
		init(vnode) {
			// 调用子组件的构造函数
			// 当调用组件构造函数的时候，会调用init方法，因为没有传el，所以不会走$mount方法，需要手动调用下
			const child = (vnode.componentInstance = new vnode.componentOptions.Ctor({}));
			// 手动挂载，挂载的时候会走到渲染watcher， 所以每个组件都会有一个watcher
			// 手动挂载完成后 child会有一个 $el 属性，也就是 vnode.componentInstance 会有一个$el 属性，指向真实元素
			child.$mount();
		}
	};
	// 组件的虚拟节点拥有hook和组件的 componentOptions， componentOptions 中存放了组件的构造函数
	// data指的就是元素属性， 如 <div id="app"></div>， data就是 {id:"app"}

	// 返回的格式：
	// {vm: Vue, tag: "vue-component-1-my-button", data: {…}, key: undefined, children: undefined, …}
	return vnode(vm, `vue-component-${Ctor.cid}-${tag}`, data, key, undefined, undefined, { Ctor });
}
function vnode(vm, tag, data, key, children, text, componentOptions) {
	return {
		vm,
		tag,
		data,
		key,
		children,
		text,
		componentOptions
	};
}
