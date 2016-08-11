# dropDownLoad 插件 v1.1.1     ![233](https://raw.githubusercontent.com/TopuNet/dropDownLoad/master/demo/images/16471b1b26636f263a21115df68cb769.gif)
### 下拉加载插件 主要实现下滑翻页的功能 提供一套完整的流程 包括加载动画、插入动画 以及各种状态下的事件处理
<br />
<br />
![Screenshot](https://raw.githubusercontent.com/TopuNet/dropDownLoad/master/demo/images/Animation.gif)
#### 安装 :
>1. npm install TopuNet-dropDownLoad
2. 把 dist 中的 dropDownLoad.js 复制到项目文件夹

## 文件结构 :
* jq/dropDownLoad.js&nbsp;&nbsp;->&nbsp;&nbsp;为主要 Js 文件
* Ajax Json形式示例.html&nbsp;&nbsp;&nbsp;->&nbsp;&nbsp;Ajax 数据页示例
* inc/dropDownLoad_Anime.css&nbsp;&nbsp;&nbsp;->&nbsp;&nbsp;下面两个动画库的 "结合体"
	* animate.css&nbsp;&nbsp;&nbsp;->&nbsp;&nbsp;一套很有名的 css3 动画库 国外大神制作 这里附上 [Git 地址](https://github.com/daneden/animate.css)
	* loaders.css&nbsp;&nbsp;&nbsp;->&nbsp;&nbsp;一套很有名的 css3 加载动画库 同国外大神制作 这里附上 [Git 地址](https://github.com/ConnorAtherton/loaders.css)

## 页面引用 :
原生引用
> 1. 页面底端引用最新版 /Jquery.min.js#1.x.x 或 zepto.min.js
2. Jquery/zepto后引用 /jq/dropDownLoad.js

requireJS引用
>1. 需要 Zepto 或 Jquery
2. `require(['dropDownLoad']);`

## 方法调用 :
``` javascript
var opt = {
	main: 'ul.list',    // 主要盒选择器 默认为 Document
	range: '30vw',    // 滚动阀值 支持 vw | vh 单位 距离底部多少时触发加载 默认值为 Loader 盒的高度
	eleWrap: '.loader',    // 插入内容的盒选择器 默认为主要盒
	insertMode: 'before',    // 插入模式 append(默认) | before | after | prepend
	loader: '.loader',    // Loader 盒选择器 放楼下内置的加载动画
	animeCssPath: 'inc',    // Anime CSS 路径 默认为 inc 目录下
	presetLoadingAnime: '',    // 预置加载动画 默认为 '小圈圈'
	presetInsertAnime: '',    // 预置载入动画 默认为 '大风车'

	// 构建 DOM 模版 数据为 JSON 形式时 创建出的 DOM 的结构 默认值为一个 DIV 元素 data-name 属性和数据名称对应 IMG标签数据默认装载到其 src 属性内
	// Ajax JSON 数据页写法 请参照 “AJax Json形式示例” 文件
	pattern: '<li><div class="box"><img data-name="url" src="" alt="" /><div class="right" data-name="content"></div></div></li>',

	// 以下俩个参数可接收函数 数据加载完成后执行 如需滚动到功能 可接收一个 Number(px) | String -> 比如 '10px' '10vw' 等类型的值 也可让函数返回这两个类型的值 触发滚动
	exceedRolling: function () {
	    return '50vw';
	},    // 内容超过视区后
	lowerRolling: '',    // 内容不超出视区 默认为滚动到加载内容的末尾(加载动画之上) 如特殊布局会出问题 请自行传值滚动 如需取消默认行为 传 Null

	// Ajax
	url: 'ajax_json.html',
	type: 'GET',    // 默认 GET 方式
	ajaxData: {},    // Ajax 传参
	page: 0,    // 默认值为 0 起始页数 程序中自行累加
	totalPage: null,    // 总页数

	// 到达总页数后的回调 可接收 Function 和 String 默认行为在 Loader 盒内装载一条提示 可传 String 自定义其内容 如需取消默认行为 传 Null
	end: '<p style="color: #6f6f6f;">已完成加载</p>'
};

dropDownLoad.init(opt);
```
### 内置动画列表
| 加载动画        | 载入动画   |
| :--------:   | :-----:  |
| 小圈圈     | 点水(pulse) |
| 金字塔        |   橡皮筋(rubberBand)   |  
| 邪王真眼        |    一起摇摆(shake)    |
| 邪恶律动        |    悬挂秋千(swing)    |
| 冒泡        |    大摇大摆(wobble)   |
| ...        |    大风车(rotateIn)   |
| ...        |    弹性(bounceIn)   |
| ...        |    弹性(下)(bounceInDown)   |
| ...        |    弹性(左)(bounceInLeft)   |
| ...        |    弹性(右)(bounceInRight)   |
| ...        |    淡出(fadeIn)   |
| ...        |    淡出(下)(fadeInDown)   |
| ...        |    淡出(左)(fadeInLeft)   |
| ...        |    淡出(右)(fadeInRight)   |
| ...        |    放大(zoomIn)   |
| ...        |    放大(下)(zoomInDown)   |
| ...        |    翻转(X)(flipInX)   |
| ...        |    翻转(Y)(flipInY)   |
## ChangeLog
> ~~欢迎大家品尝 Bug 全家桶 为了地球环境请大家不要乱扔垃圾 这里是垃圾处理处~~~

### v1.1.1
	1. 合并 css 动画库
	2. 增加 animeCssPath 参数 可自定义 css 所在路径
	3. 修复 totalPage 参数为空时 页数不自增的问题
	4. 细节上的优化 更加完善的 README
