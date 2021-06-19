import { generate } from './generate';
import { parseHTML } from './parse';

export function compileToFunctions(template) {
	console.log(template);
	const ast = parseHTML(template);
  console.log("🚀 ~ file: index.js ~ line 7 ~ compileToFunctions ~ ast", ast)
  
	// 生成代码
	const code = generate(ast);
	const render = `with(this){return ${code}}`;
	const fn = new Function(render); // 让字符串变成一个函数
	console.log('fn', fn);
	/*
  输出结果 
  (function anonymous() {
    with(this){
      return _c('div',{id:"app",a:"1",b:"2",style:{"color":"red","font-size":"12px"}},_c('span',{style:{"color":"red"}},_v(_s(name)+"aa"+_s(age)+"haha"),_c('a',undefined,_v("hello"))))
    }
  })
  */
	return fn;
	// console.log('🚀 root', root);
}
