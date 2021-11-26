import { popTarget, pushTarget } from './dep';
import { queueWatcher } from './scheduler';

// id用于标识不同组件不同的watcher
let id = 0;
class Watcher {
	constructor(vm, exprOrFn, cb, options) {
		this.vm = vm;
		this.exprOrFn = exprOrFn;
		if (typeof exprOrFn == 'function') {
			this.getter = exprOrFn;
		}else {
      // 将 getter 方法封装成了一个取值函数
      this.getter = function() {
        // exprOrFn在 watch 时，可能是 a.b.c.d 这样的 key
        /* 
        watch: {
          'a.b.c.d'(newValue, oldValue) {
            console.log(newValue, oldValue)
          }
        }
        */
        const path = exprOrFn.split('.');
        let val = vm;
        path.forEach(item => {
          val = val[item];
        })
      }
    }
    this.sync = options.sync;
    this.user = options.user; // 用来标识 watcher 的状态，看看是不是用户 watcher
		this.cb = cb;
		this.options = options;
		// 每创建一个watcher就让id自增
		this.id = id++;
		// 让watcher记住dep
		this.deps = [];
		this.depsId = new Set();
    // this.value 用于保存老值
		this.value = this.get(); // 调用 get 方法，让渲染 watcher 执行
	}
	get() {
		// 渲染之前，存储当前的watcher，这个watcher里有一个get方法
		pushTarget(this); // 给 Dep.target 赋值为当前的 watcher，也就是将watcher放到全局上

    // 这里是对用户 watcher 的总结：当默认调用的时候会当前这个watcher放到队列里去，然后取值的时候把依赖进行收集，当重新设置值的时候调用run方法，就可以拿到新值和上次的老值，然后就可以调用用户回调，把新值、老值传给回调。用户传一个表达式，如：a.b.c.d，我们把这个表达式变成取值表达式，调用this.getter就会取值，取值之前先收集依赖，等watcher发生变化的时候就去让watcher更新，然后调用用户回调。
		const value = this.getter.call(this.vm); // 这个方法会取data中的值，这个方法调用了render函数，会对模板的数据进行取值，触发Object.defineProperty的get方法

		// 清除当前watcher，为什么要清除当前的watcher呢，这是因为当我们没有在模板中使用数据，而是在其他地方使用的数据，不需要收集依赖
		popTarget(); // Dep.target = null
    return value;
	}
	// 当属性取值时，需要记住这个watcher，等数据发生了变化，去执行自己记住的watcher，这个watcher会重新调用_update方法去更新

	// 让watcher记住deep
	addDep(dep) {
		// 不能直接这么写，因为页面中可能多次调用同一个数据， 如：{{name}} {{name}} {{name}}，这样当前的watcher就存放了多个相同的deep了，不合理
		// this.deps.push(dep)

		let id = dep.id;
		// 使用set集合去重，过滤重复的dep
		if (!this.depsId.has(id)) {
			// dep是非重复的，watcher肯定也不会重
			this.depsId.add(id);
			// 让当前的watcher记住deep
			this.deps.push(dep);
			// 让dep记住当前watcher
			dep.addSub(this);
		}
	}
	// 如果多次同时更新一个数据，希望合并成一次去更新这个数据
	update() {
    // 同步watcher
    if (this.sync) {
      this.run();
    }else {
      // 等待着，一起更新，因为每次调用update的时候，都放入了watcher
      // this.get();
      queueWatcher(this);
    }
	}
  run() {
    const oldValue = this.value; // 第一次渲染的值
    const newValue = this.get();
    this.value = newValue;
    console.log('this.useruseruser', this.user)
    // 如果当前是用户 watcher 就执行用户定义的 callback
    if (this.user) {
      this.cb.call(this.vm, newValue, oldValue);
    }
  }
}
// 在取值之前把watcher暴露到全局上，让所有属性(这个属性必须在模板中使用到)的deep都记住这个watcher，等数据变了，就可以让属性记住的watcher去执行
export default Watcher;
