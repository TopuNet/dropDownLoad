/*
    Suscc
    20160811
    下拉加载插件 v1.1.1
*/
/* ----------------------------------------------------------------------------
                                    // --- //
                                    // OPT //
                                    // --- //

main: 'ul.list',    // 主要盒选择器 默认为 Document
range: '30vw',    // 滚动阀值 支持 vw | vh 单位 距离底部多少时触发加载 默认值为 Loader 盒的高度
eleWrap: '.loader',    // 插入内容的盒子选择器 默认为主要盒
insertMode: 'before',    // 插入模式 append(默认) | before | after | prepend
loader: '.loader',    // 加载动画盒选择器 放楼下内置的加载动画
animeCssPath: './dist/app/css',    // Anime CSS 路径 默认为 inc 目录下
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
 ---------------------------------------------------------------------------- */
var dropDownLoad = {
    opt: {
        insertMode: 'append',    // 默认值 append
        animeCssPath: 'inc',
        presetLoadingAnime: '小圈圈',    // 默认加载动画
        presetInsertAnime: 'rotateIn',    // 默认载入动画

        lowerRolling: function (curAlHig) {
            if (this.loader) {
                return curAlHig - this.mainHig - this.loaderHig - 10;
            };
        },

        // Ajax
        type: 'GET',
        page: 0,
        ajaxData: {},
        end: function () {
            this.loader.html('<p style="color: #6f6f6f;">已完成加载</p>');
        }
    },

    // init
    init: function (set) {
        var extend = function (o1, o2) {
            for (var n in o2) {
                if (o2[n] != '') o1[n] = o2[n];
            };
        },
            _this = this;

        extend(this.opt, set);

        $('head').append('<link rel="stylesheet" href="' + this.opt.animeCssPath + '/dropDownLoad_Anima.css" media="screen" title="no title" charset="utf-8">');

        this.main = $(this.opt.main);   // 主要盒（负责滚动与插入加载内容）
        this.mainHig = this.main.height();    // 主要盒的高度
        this.mainAllHig = this.main[0].scrollHeight;    // 主要盒的实际高度（包含可滚动部分）
        this.loader = $(this.opt.loader);    // 加载动画盒
        this.loaderHig = this.loader.height();    // 加载动画盒的高度 程序中计算使用
        this.screenWid = window.innerWidth;    // 屏幕宽度 计算 vw 单位时会用到
        this.screenHig = window.innerHeight;    // 屏幕高度 计算 vh 单位时会用到
        this.curScrTop = this.main.scrollTop();
        this.isUp = true;   // 是否抬起手指
        this.ajaxForm = false;    // Ajax 数据形式是否为 Json

        this.timer = null;    // 存放滚动方法的定时器 清楚定时器时用

        // 没有单独设置插入内容的盒 就默认设置为主要盒
        if (!this.opt.eleWrap) {
            this.opt.eleWrap = this.main;
        };

        this.load();  // 装载预置加载动画

        $(this.opt.main).on('scroll', function () {
            _this.scr();
        });

        $(this.opt.main).on('mousedown touchstart', function (e) {
            if (_this.timer) {
                cancelAnimationFrame(_this.timer);
                _this.timer = null;
                _this.main.scrollTop(_this.nRolTag);
                if (!_this.ajaxForm) {
                    _this.loading = false, _this.loader.show(0);
                };
            };
            _this.isUp = false;
        });

        $(this.opt.main).on('mouseup touchend', function (e) {
            _this.isUp = true;
            _this.crtApd();
        });
    },

    // 预置加载动画
    load: function () {
        // 判断是否传了加载动画盒
        if (this.opt.loader) {
            var animate = this.opt.presetLoadingAnime,    // 传进来的动画名
                style;    // 预置加载动画的 DOM 合集

            // 滚动距离底部阀值如果为空 默认设置成加载动画的高度 也就是看到加载动画就执行加载~
            if (!this.opt.range) {
                this.opt.range = this.loaderHig;
            };

            // 判断初始数据是否够一屏 如果够就显示加载动画
            if (!this.mainAllHig - this.mainHig <= 0 && animate) {
                style = {
                    '小圈圈': '<div class="loader-inner ball-clip-rotate"><div></div></div>',
                    '金字塔': '<div class="loader-inner triangle-skew-spin"><div></div></div>',
                    '邪王真眼': '<div class="loader-inner ball-clip-rotate-multiple"><div></div><div></div></div>',
                    '邪恶律动': '<div class="loader-inner line-scale-pulse-out-rapid"><div></div><div></div><div></div><div></div><div></div></div>',
                    '冒泡': '<div class="loader-inner ball-scale-random"><div></div><div></div><div></div></div>',
                };

                this.loader.css({
                    'display': 'flex',
                    'justify-content': 'center',
                    'align-items': 'center'
                }).html('').append(style[animate]);
            };
        };

        return function (obj) {
            var obj = $(obj),
                speedY = 3,
                speedX = 3,
                lastX, lastY,
                timer,

                Fn = function () {
                    speedY += 1;

                    var curY = obj[0].offsetTop + speedY,
                        curX = obj[0].offsetLeft + speedX;

                    if (curY >= document.documentElement.clientHeight - obj.height()) {
                        speedY *= -0.7;
                        speedX *= 0.7;
                        curY = document.documentElement.clientHeight - obj.height();
                    } else if (curY <= 0) {
                        speedY *= -1;
                        speedX *= 0.7;
                        curY = 0;
                    };

                    if (curX >= document.documentElement.clientWidth - obj.width()) {
                        speedX *= -0.7;
                        curX = document.documentElement.clientWidth - obj.width();
                    } else if (curX <= 0) {
                        speedX *= -0.7;
                        curX = 0;
                    };

                    if (Math.abs(speedY) < 1) {
                        speedY = 0;
                    };

                    if (Math.abs(speedX) < 1) {
                        speedX = 0;
                    };

                    obj[0].style.top = curY + 'px';
                    obj[0].style.left = curX + 'px';

                    if (speedY == 0 && curY == document.documentElement.clientHeight - obj.height()) {
                        console.log('停止了');
                        cancelAnimationFrame(timer);
                    } else {
                        timer = requestAnimationFrame(Fn);
                    };
                };

            obj.on('mousedown touchstart', function (e) {
                var oEvent = event,
                    tempX = oEvent.touches ? oEvent.touches[0].clientX : oEvent.clientX,
                    tempY = oEvent.touches ? oEvent.touches[0].clientY : oEvent.clientY,
                    X = tempX - this.offsetLeft,
                    Y = tempY - this.offsetTop;

                lastX = tempX, lastY = tempY;

                $(document).on('mousemove touchmove', function (e) {
                    var oEvent = event,
                        tempX = oEvent.touches ? oEvent.touches[0].clientX : oEvent.clientX,
                        tempY = oEvent.touches ? oEvent.touches[0].clientY : oEvent.clientY;

                    obj.css('left', tempX - X);
                    obj.css('top', tempY - Y);

                    speedX = tempX - lastX, speedY = tempY - lastY;
                    lastX = tempX, lastY = tempY;
                });

                $(document).on('mouseup touchend', function () {
                    $(document).off();
                    timer = requestAnimationFrame(Fn);
                });

                return false;
            });

        };
    },

    // 滚动事件
    scr: function () {
        var nResults;

        // 加载中 阻止重复
        if (this.loading) {
            return;
        };

        this.curScrTop = this.main.scrollTop();  // 当前滚动距离

        // 判断单位是否时 vw
        if (typeof this.opt.range == 'string') {
            if (this.opt.range.search('vw') != -1) {
                nResults = (this.mainAllHig - (this.curScrTop + this.mainHig)) / this.screenWid * 100;
            } else if (this.opt.range.search('vh') != -1) {
                nResults = (this.mainAllHig - (this.curScrTop + this.mainHig)) / this.screenHig * 100;
            }
        } else {
            nResults = this.mainAllHig - (this.curScrTop + this.mainHig);
        };

        nResults <= parseInt(this.opt.range) && this.ajax();
    },

    // Ajax
    ajax: function () {
        var _this = this;

        this.loading = true;    // 加载中

        if (this.opt.page++ == this.opt.totalPage) {
            this.opt.end && typeof this.opt.end != 'string' ? this.opt.end.call(this) : this.loader.html(this.opt.end);
            return;
        };

        this.opt.ajaxData.page = this.opt.page;console.log(this.opt.ajaxData);    // 页数传给后端

        $.ajax({
            url: this.opt.url,
            type: this.opt.type,
            data: this.opt.ajaxData,
            success: function (_data) {
                _this._data = _data;
                _this.ajaxSuccess();
            }
        });
    },

    // 成功
    ajaxSuccess: function () {
        // 正则
        var exp = /^{[^\u9fa5]*}$/,
            trim = /^\s+|\s+$/g,
            _this = this;

        // 去空格
        this._data = this._data.replace(trim, '');

        // 检测载入数据是否符合指定写法
        if (exp.test(this._data)) {
            this._data = $.parseJSON(this._data);
            this.ajaxForm = true;
        };

        this.crtApd();
    },

    // 构建与插入
    crtApd: function (source) {
        if (!this.isUp || !this._data) { return; };

        this.loader.hide();

        var _this = this,
            // 插入模式
            appendMode = function (i) {
                var obj = $(_this.opt.eleWrap);

                switch (_this.opt.insertMode) {
                    case 'append':
                        i ? obj.append(_this._data) : obj.append(creatDom);
                        break;
                    case 'prepend':
                        i ? obj.prepend(_this._data) : obj.prepend(creatDom);
                        break;
                    case 'after':
                        i ? obj.after(_this._data) : obj.after(creatDom);
                        break;
                    case 'before':
                        i ? obj.before(_this._data) : obj.before(creatDom);
                        break;
                }
            };

        // 判断数据形式是否为 JSON 形式
        if (this.ajaxForm) {
            // Pattern 默认值（默认一个 DIV 元素 并把 Ajax 数据直接插入进去）
            if (!this.opt.pattern) {
                this.opt.pattern = '<div>'+ (toString(this._data) + '') +'</div>';
            };

            var childDomLength = $(this.opt.pattern).find('*').length,   // 所有元素数量
                domDataName = $(this.opt.pattern).attr('data-name'),    // 取名牌
                domArr = [];    // 存放创建出的所有 DOM 的数组 下面插入元素执行动画时用

            for (var i = 0, dataLength = this._data.Data.length; i < dataLength; i++) {
                var curDataRow = this._data.Data[i],    // 当前的数据对象
                    creatDom = $(this.opt.pattern),   // 创建出的 DOM 对象
                    childDom = creatDom.find('*');    // 所有的子元素

                // 准备拿外层盒当容器
                if (domDataName) {
                    creatDom.html(curDataRow[domDataName]);
                } else {
                    // 遍历所有子元素 装载数据到对应元素内
                    for (var n = 0; n < childDomLength; n++) {
                        var curChild =  childDom.eq(n),   // 当前子元素
                            childDataName = curChild.attr('data-name');   // 取名牌

                        if (childDataName) {
                            // 如果是 IMG 标签 默认数据装载位置为其 src 属性
                            curChild.get(0).tagName == 'IMG' ? curChild.attr('src', curDataRow[childDataName]) : curChild.html(curDataRow[childDataName]);
                        };
                    };
                };

                // 插入动画准备
                if (this.opt.presetInsertAnime) {
                    creatDom.css('opacity', 0);
                    domArr.push(creatDom);
                    this.apdAnimeTemp = 0;
                };

                appendMode();
            };

            // 执行插入动画
            this.opt.presetInsertAnime && this.apdAnime(domArr);
        } else {
            appendMode(true);
        };

        this._data = null;    // 清空 重置

        // 判断传进来的是个什么类型 如是 Function 可执行
        var curAlHig = this.main[0].scrollHeight + this.loaderHig,

            // 判断传参类型
            Fn = function (what) {
                cancelAnimationFrame(_this.timer);
                var ret;

                // 是否为 Function 类型
                if (typeof _this.opt[what] == 'function') {
                    ret = _this.opt[what].call(_this, curAlHig);    // 取返回值
                    ret && requestAnimationFrame(function () { _this.rolling(ret); });    // 把返回值传给负责滚动的方法
                } else {
                    _this.timer = requestAnimationFrame(function () { _this.rolling(_this.opt[what]); });    // 直接跳到滚动方法
                };
            };

        // 小于一屏（区） or 超过一屏（区）
        if (curAlHig - this.mainAllHig <= this.mainHig) {
            if (this.opt.lowerRolling) {
                Fn('lowerRolling');
            } else {
                this.loading = false, this.loader.show(0);
            };
        } else {
            if (this.opt.exceedRolling) {
                Fn('exceedRolling');
            } else {
                this.loading = false, this.loader.show(0);
            };
        };

        this.mainAllHig = curAlHig;   // 更新主体实际高度(包含滚动部分)
    },

    // 滚动
    rolling: function (tag) {
        // vw | vh 单位时的转换
        if (typeof tag == 'string') {
            if (tag.search('vw') != -1) {
                tag = parseInt(tag) * this.screenWid / 100;
            } else if (tag.search('vh') != -1) {
                tag = parseInt(tag) * this.screenHig / 100;
            };
        };
        this.nRolTag = parseInt(tag);
        var tag = parseInt(tag),    // 取整
            speed = (tag - this.curScrTop) / 6,    // 速度
            result,
            _this = this;

        speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed);
        result = this.curScrTop + speed;

        this.main.scrollTop(result);
        this.curScrTop = result;

        // 没到位置继续执行
        if (this.curScrTop != tag) {
            this.timer = requestAnimationFrame(function () { _this.rolling(tag) });
        } else {
            if (!this.ajaxForm) { this.loading = false; this.loader.show(0); };
            this.timer = null;
        };
    },

    // 载入动画
    apdAnime: function (domArr) {
        var _this = this;

        domArr[this.apdAnimeTemp].css({ 'animation-duration': '1s', 'opacity': 1 }).addClass(this.opt.presetInsertAnime);

        if (++this.apdAnimeTemp != domArr.length) {
            setTimeout(function () { _this.apdAnime(domArr); }, 300);
        } else {
            this.loading = false;
            this.loader.show(0);
        };
    }
};

if (typeof define === "function" && define.amd) {
    define([], function () {
        return dropDownLoad;
    });
};
