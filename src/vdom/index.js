/* 
虚拟dom可以随意添加属性，ast是针对语法解析出来的，不能随意添加属性
*/
export function createTextNode(text) {
	return vnode(undefined, undefined, undefined, undefined, text);
}
export function createElement(tag, data = {}, ...children) {
	// 如果是列表元素需要添加key属性，这里对key进行处理
  let key = data.key;
	if (key) {
		delete data.key;
	}
	return vnode(tag, data, key, children);
}
function vnode(tag, data, key, children, text) {
	return {
		tag,
		data,
		key,
		children,
		text
	};
}
