//  注意不能直接改写数组原有方法，只需要改写被 vue 控制的数组，因为代码中的数组有可能没被data直接使用
const oldArrayProtoMethods = Array.prototype;

export let arrayMethods = Object.create(oldArrayProtoMethods);

// 下面这些方法会改变原数组
let methods = [ 'push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice' ];
methods.forEach((method) => {
	// 重写数组方法
	arrayMethods[method] = function(...args) {
		// 调用数组原来方法
		const result = oldArrayProtoMethods[method].apply(this, args);

		const ob = this.__ob__;
    // 有可能用户新增的数据是对象，这个时候需要做特殊处理
		// inserted 保存插入的值
    let inserted;
		switch (method) {
			case 'push':
			case 'unshift':
				inserted = args;
				break;
			case 'splice':
				inserted = args.slice(2);
			default:
				break;
		}
		if (inserted) ob.observeArray(inserted); // 对新增的每一项进行观测
    // 数组变化后通知watcher更新
    ob.dep.notify()

		return result;
	};
});
