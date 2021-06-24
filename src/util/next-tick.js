let callbacks = [];
let pending = false;
function flushCallbacks() {
	callbacks.forEach((cb) => cb());
	pending = false;
	callbacks = [];
}
let timerFunc;
if (Promise) {
	// then方法是异步的
	timerFunc = () => {
		Promise.resolve().then(flushCallbacks);
	};
} else if (MutationObserver) {
	// MutationObserver 也是一个异步方法
	let observe = new MutationObserver(flushCallbacks); // H5的api
	let textNode = document.createTextNode(1);
	observe.observe(textNode, {
		characterData: true
	});
	timerFunc = () => {
		textNode.textContent = 2;
	};
} else if (setImmediate) {
	timerFunc = () => {
		setImmediate(flushCallbacks);
	};
} else {
	timerFunc = () => {
		setTimeout(flushCallbacks, 0);
	};
}
// 批处理， 第一次开定时器，后续只更新列表，最后执行清空逻辑
/* 
举例： 第一次cb是渲染watcher（渲染watcher执行的过程是同步，更新是异步的），第二次cb是用户传入的回调
*/
export function nextTick(cb) {
	callbacks.push(cb); // cb默认是渲染逻辑，将用户的逻辑放到渲染逻辑之后即可
	if (!pending) {
		pending = true;
		timerFunc();
	}
}
