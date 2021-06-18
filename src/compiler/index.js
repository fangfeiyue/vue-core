import { generate } from "./generate";
import { parseHTML } from "./parse";

export function compileToFunctions(template) {
	console.log(template);
  const ast = parseHTML(template)
  // 生成代码
  const code = generate(ast)
	// console.log('🚀 root', root);
}
