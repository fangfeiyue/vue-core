export const LIFECYCLE_HOOKS = [
	'beforeCreate',
	'created',
	'beforeMount',
	'mounted',
	'beforeUpdate',
	'updated',
	'beforeDestroy',
	'destroyed'
];
export const isObject = (value) => typeof value === 'object' && value !== null
const strats = {};
function mergeHook(parentVal, childValue) {
	if (childValue) {
		if (parentVal) {
			return parentVal.concat(childValue);
		} else {
			return [ childValue ];
		}
	} else {
		return parentVal;
	}
}
LIFECYCLE_HOOKS.forEach((hook) => {
	strats[hook] = mergeHook;
});
strats.components = function(parentVal, childVal) {
  const res = Object.create(parentVal);
  if (childVal) {
    for (let key in childVal) {
      res[key] = childVal[key];
    }
  }
  return res;
}
export function mergeOptions(parent, child) {
  /* 
  合并策略：
  如果父亲有的儿子也有，应该用儿子替换父亲， 如 父元素的数据是{a:1} 子元素的数据是{a:2}合并后，应该是 {a:2}

  如果父元素有值子元素没有，则用父元素的 如 父{a:1} 子{} 合并后应该是 {a: 1}
  */

	const options = {};
	for (let key in parent) {
		mergeField(key);
	}
	for (let key in child) {
		if (!parent.hasOwnProperty(key)) {
			mergeField(key);
		}
	}
	function mergeField(key) {
		if (strats[key]) {
			options[key] = strats[key](parent[key], child[key]);
		} else {
			if (typeof parent[key] == 'object' && typeof child[key] == 'object') {
				options[key] = {
					...parent[key],
					...child[key]
				};
			} else {
				options[key] = child[key];
			}
		}
	}
	return options;
}
