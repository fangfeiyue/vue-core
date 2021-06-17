import babel from 'rollup-plugin-babel';
import serve from 'rollup-plugin-serve';

export default {
	input: './src/index.js',
	output: {
		format: 'umd', // 模块化类型，默认情况下可以把Vue变量放到 window 上
		file: 'dist/vue.js',
		name: 'Vue', // 打包后的全局变量的名字
		sourcemap: true
	},
	plugins: [
		babel({
			exclude: 'node_modules/**' // 这个目录不需要用 babel 转换
		}),
		process.env.ENV === 'development'
			? serve({
					open: true,
					openPage: '/public/index.html',
					port: 3000,
					contentBase: '' // 根目录 
				})
			: null
	]
};
