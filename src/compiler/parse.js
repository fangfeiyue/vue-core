const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名

// console.log('<div:aa>'.match(startTagOpen)) // ["<div:aa", "div:aa", index: 0, input: "<div:aa>", groups: undefined]

const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>
// console.log('</div>'.match(endTag)) // ["</div>", "div", index: 0, input: "</div>", groups: undefined]

// 如 style="xxx" style='xxx' style=xxx
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的
// console.log(`style="xxx"`.match(attribute)) // ["style="xxx"", "style", "=", "xxx", undefined, undefined, index: 0, input: "style="xxx"", groups: undefined]

const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >
// console.log(`>`.match(startTagClose)) // [">", "", index: 0, input: ">", groups: undefined]

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 匹配双花括号
// console.log(`{{name}}`.match(defaultTagRE)) // ["{{name}}"]

/* 
<div id="app">
  <div style="color:red;">
    <span>{{name}}</span>
  </div>
</div>

ast 语法树
{
  tag:'div',
  type:1,
  attrs: [{style:'color:red'}],
  children: [
    {
      tag:'span',
      type:1,
      atttrs:[],
      parent
    }
  ],
  parent: null
}
*/

let root;
let currentParent;
let stack = [];
const ELEMENT_TYPE = 1;
const TEXT_TYPE = 3;

function createASTElement(tagName, attrs) {
	return {
		tag: tagName,
		type: ELEMENT_TYPE,
		children: [],
		attrs,
		parent: null
	};
}

function start(tagName, attrs) {
  console.log(tagName, attrs);
  let element = createASTElement(tagName, attrs);
  if (!root) {
    root = element;
  }
  currentParent = element;
  stack.push(element); // 例如：[div, div, span, /span]
}
function end(tagName) {
  console.log(tagName);
  let element = stack.pop(); // 当遇到span结尾的时候就把span删掉 [div, div]，让这个span记住它的parent是谁
  currentParent = stack[stack.length - 1];
  if (currentParent) {
    element.parent = currentParent;
    currentParent.children.push(element);
  }
}
function chars(text) {
  console.log(text);
  text = text.replace(/\s/g, '');
  if (text) {
    currentParent.children.push({
      type: TEXT_TYPE,
      text
    });
  }
}

export function parseHTML(html) {
	while (html) {
		let textEnd = html.indexOf('<');
		if (textEnd == 0) {
			// 处理开始标签
			const startTagMatch = parseStartTag();
			/* 
       '
        <div style="color:red;">
          <span>{{name}}</span>
        </div>
      </div>'
      */
			// console.log('ddd', html)
			if (startTagMatch) {
				console.log('🚀 开始标签', startTagMatch.tagName);
				start(startTagMatch.tagName, startTagMatch.attrs);
				continue;
			}

			// 处理结束标签
			const endTagMatch = html.match(endTag);
			if (endTagMatch) {
				advance(endTagMatch[0].length);
				console.log('🚀 结束标签', endTagMatch[1]);
				end(endTagMatch[1]);
				continue;
			}
		}
		/* 
    处理文本
     '
      <div style="color:red;">
        <span>{{name}}</span>
      </div>
    </div>'
    */
		let text;
		if (textEnd > 0) {
			text = html.substring(0, textEnd);
			console.log('🚀 文本标签', text);
		}
		if (text) {
			advance(text.length);
			chars(text);
		}
	}
	
	function advance(n) {
		html = html.substring(n);
	}
	function parseStartTag() {
		const start = html.match(startTagOpen);
		if (start) {
			const match = {
				// 标签名
				tagName: start[1],
				// 标签属性
				attrs: []
			};
			// 将匹配到部分删除
			advance(start[0].length);
			let attr, end;
			while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
				// 匹配到一个属性，将其删除，对剩余部分进行查找
				advance(attr[0].length);
				match.attrs.push({ name: attr[1], value: attr[3] });
			}
			// 匹配到开始标签末尾 >
			if (end) {
				advance(end[0].length);
				// 返回匹配结果
				return match;
			}
		}
	}

  return root
}