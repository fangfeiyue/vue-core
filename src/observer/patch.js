/* 
oldVnode 是一个真实节点
*/
export function patch(oldVnode, vnode) {
	// 如果挂载的时候没有元素，直接创建元素
	// 组件调用patch方法会产生$el属性，这个属性对应的就是真实元素
	// 1. 组件
	if (!oldVnode) {
		return createElm(vnode); // 根据虚拟节点创建元素
	}

	// 是否是真实的 DOM 节点
	// 2. 初次渲染
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
	} else {
		// 3. diff 算法的比对
		// 1. 如果两个虚拟节点的标签不一样，那就直接替换，不用比对了，如div换成p
		if (oldVnode.tag !== vnode.tag) {
			return oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el);
		}
		// 2. 标签一样，但是是两个文本元素，文本元素的 tag 值是 undefined
		if (!oldVnode.tag) {
			if (oldVnode.text !== vnode.text) {
				return (oldVnode.el.textContent = vnode.text);
			}
		}
		// 3. 元素相同，复用老节点，并且更新属性
		const el = (vnode.el = oldVnode.el);
		// 用老的属性和新的虚拟节点进行比对
		updateProperties(vnode, oldVnode.data);

		/* 
    4. 更新儿子，分为三种情况
    1）老的有儿子，新的也有儿子 -> dom-diff
    2）老的有儿子，新的没有儿子 ->  删除老的儿子
    3) 新的有儿子，老的没儿子 -> 在老节点中增加儿子即可
    */
		const oldChildren = oldVnode.children || [];
		const newChildren = vnode.children || [];
		if (oldChildren.length > 0 && newChildren.length > 0) {
			updateChildren(el, oldChildren, newChildren);
		} else if (oldChildren.length > 0) {
			/* 
      old: <div style="color:red;">{{name}}</div> 
      new: <div style="color:red;"></div> 
      */
			el.innerHTML = '';
		} else if (newChildren.length > 0) {
			/* 
      old: <div style="color:red;"></div>
      new: <div style="color:red;">{{name}}</div>
      */
			newChildren.forEach((child) => el.appendChild(createElm(child)));
		}
	}
}
// 判断节点是不是相同的节点
function isSameVnode(oldVnode, newVnode) {
	// 如果两个人的标签和key 一样我认为是同一个节点 虚拟节点一样我就可以复用真实节点了
	return oldVnode.tag === newVnode.tag && oldVnode.key === newVnode.key;
}
function updateChildren(parent, oldChildren, newChildren) {
	let oldStartIndex = 0; // 老的头索引
	let oldStartVnode = oldChildren[0]; // 老的头节点
	let oldEndIndex = oldChildren.length - 1; // 老的尾索引
	let oldEndVnode = oldChildren[oldEndIndex]; // 老的结束节点

	let newStartIndex = 0; // 新的头索引
	let newStartVnode = newChildren[0]; // 新的头节点
	let newEndIndex = newChildren.length - 1; // 老的尾索引
	let newEndVnode = newChildren[newEndIndex]; // 老的结束节点

  function makeIndexByKey(oldChildren) {
    const map = {};
    oldChildren.forEach((item, index) => {
      map[item.key] = index;
    })
    return map;
  }
  const map = makeIndexByKey(oldChildren);
  /* 
  old 结构:
  <ul>
    <li key="A">A</li>
    <li key="B">B</li>
    <li key="C">C</li>
    <li key="D">D</li>
    <li key="F">F</li>
  </ul>
  输出： map -> {A: 0, B: 1, C: 2, D: 3, F: 4}
  */
  console.log('mapmap',map);

	while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
		// 前端中比较常见的操作有向尾部插入、向头部插入、头移动到尾、尾移动到头、正序和反序
		// 优化向后追加逻辑

		// 头节点是否相同，向后插入
		/* 
    old:
    <ul>
      <li key="A">A</li>
      <li key="B">B</li>
      <li key="C">C</li>
      <li key="D">D</li>
    </ul>`)
    new:
    <ul>
      <li key="A">A</li>
      <li key="B">B</li>
      <li key="C">C</li>
      <li key="D">D</li>
      <li key="E">E</li>
    </ul>
    */
    
    /* 
    处理 oldStartVnode 无效的情况，如：乱序diff中，如果oldVnode移动到 B 的时候，再移动到 C ，发现 C 已经被设置为 undefined
    */
		if (!oldStartVnode) {
      oldStartVnode = oldChildren[++oldStartIndex];
    }else if (!oldEndVnode) { // 处理 oldEndVnode 无效的情况
      oldEndVnode = oldChildren[--oldEndIndex];
    }else if (isSameVnode(oldStartVnode, newStartVnode)) {
			// 头和头比
			/* 
      向后插入：
      old的结构：a b c d
      new的结构：a b c d e f

      */
			// 比对属性
			patch(oldStartVnode, newStartVnode);
			// 比对完后向后移动
			oldStartVnode = oldChildren[++oldStartIndex];
			newStartVnode = newChildren[++newStartIndex];
		} else if (isSameVnode(oldEndVnode, newEndVnode)) {
			// 尾和尾比
			/* 
      向前插入
      old的结构:     a b c d
      new的结构: f e a b c d
      */
			patch(oldEndVnode, newEndVnode);
			oldEndVnode = oldChildren[--oldEndIndex];
			newEndVnode = newChildren[--newEndIndex];
			// 为什么 v-for 要增加 key 属性，key 为什么不能用 index
			/* 
      假设都是li标签，key是索引，只是做了个反序
      old 结构： a b c d
      new 结构： d c b a
      这种情况下标签一样，key一样，就会复用这个元素，就会去比儿子，发现儿子不同，就会用新的替换旧的，但实际反序操作只需要移动下元素即可，不必重新创建。
  
      针对这种情况：
      比较 old 头和 new 尾是否一致
      */
		} else if (isSameVnode(oldStartVnode, newEndVnode)) { // 头移动到尾
			// 头和尾比
			/* 
      简单的例子
      old 结构：a b c d
      new 结构：b c d a
      思路：
      old 头和 new 尾去比，如果相同的话，old 头指针向后移动，new 尾指针向前移动，并且把 old 头移动到最后一个元素的下一个元素
      */
			patch(oldStartVnode, newEndVnode);
      // 把老的开头的节点，插入到最后一个节点的后面，因为 insertBefore 是向前插入，所以需要找到最后一个的下一个元素（下一个节点没值就是文本节点）
      /* 
      注意：这里不能使用appendChild
      old 结构：a b c d
      new 结构：d c b a
      头和头比完，尾和尾比完，然后交叉比对，发现 old 头和 new 尾是同一个元素，需要将 old 头插入到 d 的下一个元素的前面，得到 b c d a，如果使用appendChild，当比对到 b 的时候，会把 b 插入到后面得到 c d a b，使用 insertBefore 得到的是 c d b a

      DOM 操作具备移动性，会移动节点，而不用再删除
      */
			parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);
      // parent.appendChild(oldStartVnode.el)
      oldStartVnode = oldChildren[++oldStartIndex];
      newEndVnode = newChildren[--newEndIndex];
		}else if (isSameVnode(oldEndVnode, newStartVnode)){ // 尾移动到头部
      /* 
      old 结构：a b c d
      new 结构：d a b c
      这种情况就麻烦了，头和头比不相同，尾和尾比不相同，头和尾比也不相同，但是尾和头比可以，比对完后要将 d 插入到 a 的前面，然后移动指针
                     |  <-
      old 结构: d a b c [d]
                 |

      new 结构: d a b c
              -> |   |
      此时头和头相同b和b相同 c和c相同
      */
      patch(oldEndVnode, newStartVnode);
      parent.insertBefore(oldEndVnode.el, oldStartVnode.el);
      oldEndVnode = oldChildren[--oldEndIndex];
      newStartVnode = newChildren[++newStartIndex];
    }else {
      // 永远把新增的元素或者移动的元素插入当 old 当前指针的前面
      /* 
      old 结构：a b c d f
      new 结构：n a c b e
      */

      /* 
      需要先查找当前老节点索引和key的关系，移动的时候通过新的key去找对应的老节点的索引，通过这个索引可以获取老节点，可以移动老节点
      */
      // map -> {A: 0, B: 1, C: 2, D: 3, F: 4}
      // 查看 newVnode 的节点在 oldVnode 中是否存在，如例子中的 N 节点
      const moveIndex = map[newStartVnode.key];
      // 如果节点不存在，则将这个新节点插入到当前老节点的前面，如列子中将 newVnode 的 N 节点插入到 oldVnode 的 A 节点的前面
      if (moveIndex === undefined) {
        parent.insertBefore(createElm(newStartVnode), oldStartVnode.el);
      }else {
        // 如果存在，则获取对应节点，如例子中的 C 节点
        const moveVnode = oldChildren[moveIndex];
        // 将这个节点原来的位置置为空或者undeifned，防止数组塌陷
        oldChildren[moveIndex] = undefined;
        // 如果找到了，需要两个虚拟节点对比，比如对比两个节点的属性等
        patch(moveVnode, newStartVnode);
        // 将这个新节点插入到 oldVnode 当前节点的前面
        parent.insertBefore(moveVnode.el, oldStartVnode.el);
      }
      newStartVnode = newChildren[++newStartIndex];
    }
	}

	if (newStartIndex <= newEndIndex) {
		// 注意，这里处理的都是新的比老的多的情况，插入新节点
		/* 
    这也分为两种情况：
    1. 
    old的结构：a b c d
    new的结构：a b c d e f
    这个时候指针从前往后移动，插入需要使用appendChild
    2.
    old的结构:     a b c d
    new的结构: f e a b c d
    先把f插入到 a 的前面，再把 e 插入到 a 的前面
    这个时候指针从后往前移动，插入需要使用insertBefore
    */
		for (let i = newStartIndex; i <= newEndIndex; i++) {
			let ele = newChildren[newEndIndex + 1] == null ? null : newChildren[newEndIndex + 1].el;
			// appendChild 和 insertBefore 可以进行合并
			// insertBefore 如果第二参数为 null 等价于 appendChild
			parent.insertBefore(createElm(newChildren[i]), ele);
			// parent.appendChild(createElm(newChildren[i]));
		}
	}

  /* 
  如果对比完成后，发现老的比新的多，就把老的剩余的元素移除，
  如diff乱序中的例子：
  old 结构：a b c d f
  new 结构：n a c b e
  对比完成后，发现老的新的多了 d f，就将这两个删除
  */
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      const child = oldChildren[i];
      // 排除没有值的节点，比如上面乱序的例子中我们把 old 中的 c 置为空
      if (child) {
        parent.removeChild(child.el); // 用父亲移除儿子即可
      }
    }
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
export function createElm(vnode) {
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
function updateProperties(vnode, oldProps = {}) {
	let newProps = vnode.data || {}; // 获取当前老节点中的属性
	let el = vnode.el; // 当前的真实节点

	// 老的属性新的没有，需要删除属性
	for (let key in oldProps) {
		if (!newProps[key]) {
			el.removeAttribute(key);
		}
	}

	/* 
  旧的 <div style="color:red;">{{name}}</div>
  新的 <div style="background:blue;">{{name}}</div>
  */
	const newStyle = newProps.style || {};
	const oldStyle = oldProps.style || {};
	for (let key in oldStyle) {
		// 判断样式
		if (!newStyle[key]) {
			el.style[key] = '';
		}
	}

	// 新的属性老的没有，直接用新的覆盖，不考虑没有
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
