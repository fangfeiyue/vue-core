/* 
测试例子：
<div id="app" a=1 b=2 style="color:red;font-size:12px;">
  <span style="color:red;">{{name}} aa {{age}} haha<a>hello</a></span>
</div>
整理结果：
_c('div',{id:"app",a:"1",b:"2",style:{"color":"red","font-size":"12px"}},_c('span',{style:{"color":"red"}},_v(_s(name)+"aa"+_s(age)+"haha"),_c('a',undefined,_v("hello"))))
*/
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
export function generate(el) {
	console.log('elll', el);
	const children = getChildren(el);

	const code = `_c('${el.tag}',${el.attrs.length > 0 ? genProps(el.attrs) : 'undefined'}${children
		? ',' + children
		: ''})`;
	console.log(code);
	return code;
}

// 区分是元素还是文本
function gen(node) {
	// 元素节点
	if (node.type == 1) {
		return generate(node);
	} else {
		// 文本节点
		/* 
    有普通文本 {{}}
    混合文本{{aa}}aaa
    */
		let text = node.text;
		// 文本中不包含花括号
		if (!defaultTagRE.test(text)) {
			// JSON.stringify用于加双引号
			return `_v(${JSON.stringify(text)})`;
		}
		// 因为上面已经用过正则了，lastIndex的位置已经发生改变，所以需要重新复位
		let lastIndex = (defaultTagRE.lastIndex = 0);
		// 存放解析结果
		let tokens = [];
		let match, index;
		/*
    入参：{{name}} aa {{age}} haha 输出 _v(_s(name) + 'aa' + _s(age) + 'haha') 
    */
		while ((match = defaultTagRE.exec(text))) {
			index = match.index;
			if (index > lastIndex) {
				tokens.push(JSON.stringify(text.slice(lastIndex, index)));
			}
			tokens.push(`_s(${match[1].trim()})`);
			lastIndex = index + match[0].length;
		}
		if (lastIndex < text.length) {
			tokens.push(JSON.stringify(text.slice(lastIndex)));
		}
		return `_v(${tokens.join('+')})`; // _v(_s(name)+"aa"+_s(age)+"haha")
	}
}
function getChildren(el) {
	// 生成儿子节点
	const children = el.children;
	if (children) {
		return `${children.map((c) => gen(c)).join(',')}`;
	} else {
		return false;
	}
}
// 生成属性
/* 
将这里的属性<div id="app" a=1 b=2 style="color:red;font-size:12px;">整理成如下格式
{id:"app",a:"1",b:"2",style:{"color":"red","font-size":"12px"}
*/
function genProps(attrs) {
	let str = '';
	attrs &&
		attrs.forEach((attr) => {
			if (attr.name == 'style') {
				const obj = {};
				attr.value.split(';').forEach((item) => {
					const [ key, value ] = item.split(':');
					obj[key] = value;
					console.log(key, value, obj);
				});
				attr.value = obj;
			}
			str += `${attr.name}:${JSON.stringify(attr.value)},`;
		});
	return `{${str.slice(0, -1)}}`;
}

/* 
<div id="app" a=1 b=2>
  <span style="color:red;">{{name}}<a>hello</a></span>
</div>

render函数执行后的结果才是虚拟dom

v表示vnode
s字符串
render(){ 
  return _c(
    'div', {id:'app', a:1, b:2},
    _c(
      'span',
      {style:{color:'red'}},
      _s(_v(name)),
      _c(
        'a',
        {},
        _v('hello')
        )
      )
    )
}
*/
