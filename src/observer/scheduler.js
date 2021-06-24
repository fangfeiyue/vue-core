import { nextTick } from '../util/next-tick';

let has = {};
let queue = [];
let pending = false;
function flushSchedulerQueue() {
	for (let i = 0; i < queue.length; i++) {
		// 获取watcher
		let watcher = queue[i];
		// 执行watcher
		watcher.run();
	}
	queue = [];
	has = {};
	pending = false;
}

// 多次调用 queueWatcher ，如果watcher不是同一个，会多次调用nextTick，所以也需要加锁
export function queueWatcher(watcher) {
	// 更新时对watcher进行去重操作
	const id = watcher.id;
	if (has[id] == null) {
		has[id] = true;
		queue.push(watcher);
		if (!pending) {
			nextTick(flushSchedulerQueue);
			pending = true;
		}
	}
}
