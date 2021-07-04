/* 
oldVnode 是一个真实节点
*/
export function patch(oldVnode, vnode) {
	// 如果挂载的时候没有元素，直接创建元素
	// 组件调用patch方法会产生$el属性，这个属性对应的就是真实元素
	if (!oldVnode) {
		return createElm(vnode); // 根据虚拟节点创建元素
	}

	// 是否是真实的 DOM 节点
	const isRealElement = oldVnode.nodeType;
	if (isRealElement) {
		// 如果oldVnode是一个真实DOM，表示是初次渲染
		const oldElm = oldVnode;
		const parentElm = oldElm.parentNode;

		// 根据虚拟节点创建真实节点
		let el = createElm(vnode);
		// 将创建的节点插入到原有节点下面
		parentElm.insertBefore(el, oldElm.nextSibling);
		parentElm.removeChild(oldVnode);
		// 把新创建的 el 替换成 vm.$el
		return el;
	}
}
function createComponent(vnode) {
	let i = vnode.data;
	if ((i = i.hook) && (i = i.init)) {
		// 调用组件的初始化方法，vnode.componentInstance 会有一个$el 属性
		i(vnode);
	}
  // 如果虚拟节点上有组件的实例，说明当前这个 vnode 是组件
	if (vnode.componentInstance) {
		return true;
	}
	return false;
}

// 根据虚拟节点创建真实节点
function createElm(vnode) {
	let { tag, children, key, data, text } = vnode;
	// 如果是标签，有可能是组件，这里忽略
	if (typeof tag === 'string') {
		// tag可能是组件，如果是组件，就直接根据组件创建出组件对应的真实节点
		if (createComponent(vnode)) {
			// 如果返回true， 说明这个虚拟节点是组件，就将组件渲染后的真实元素给我
			return vnode.componentInstance.$el;
		}

		vnode.el = document.createElement(tag);
		// 更新属性
		updateProperties(vnode);
		// 如果有子节点，需要进行递归操作
		children.forEach((child) => {
			return vnode.el.appendChild(createElm(child));
		});
	} else {
		// 处理文本节点
		vnode.el = document.createTextNode(text);
	}
	return vnode.el;
}
// 更新节点属性
function updateProperties(vnode) {
	let newProps = vnode.data || {}; // 获取当前老节点中的属性
	let el = vnode.el; // 当前的真实节点
	for (let key in newProps) {
		// 处理样式
		if (key === 'style') {
			// 设置样式
			for (let styleName in newProps.style) {
				el.style[styleName] = newProps.style[styleName];
			}
		} else if (key === 'class') {
			// 设置类名
			el.className = newProps.class;
		} else {
			// 给这个元素添加属性 值就是对应的值
			el.setAttribute(key, newProps[key]);
		}
	}
}
