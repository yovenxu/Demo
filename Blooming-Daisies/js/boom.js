var CFG = {
    //草地滚动时间
    duration : '50',

    //草地屏数，菊花区域高度*10为一屏
    carpets : 20,

    //跑道滚动速度方式：linear匀速，ease-in加速即cubic-bezier(0.42,0,1,1)
    timing : 'ease-in',

    //菊花素材的边长
    daisySide : 200,

    //菊花每屏递增数量，0为不变
    daisySpeed : 0,
    //第一屏中菊花的数量
    carpetDaisies : 10,

    //每屏的高度
    carpetHeight : 0
};


var Scroll = {
    bombNum : 0,
    scroller : null,
    init : function () {
        this.scroll();
    },

    /*
     * desc: 背景滚动
     */
    scroll : function () {
        this.scroller = $('#J_runway');
        var totalHeight = CFG.carpetHeight * CFG.carpets;
        var translateHeight = totalHeight - $(window).height();
        this.scroller.height(totalHeight);
        this.scroller.css({'transform': 'translateY('+ (-translateHeight) +'px)'});

        setTimeout(function () {
            Scroll.scroller
                .css({
                    'transition-property' : 'all',
                    'transition-duration' : CFG.duration + 's',
                    'transition-timing-function' : CFG.timing,
                    'transform' : 'translateY(0px)'
                });
        });
        
            console.log(translateHeight);

        document.addEventListener('touchmove', function(e) {
            //阻止默认事件
            e.preventDefault();
        }, false);
    }
};

var Daisy = {
    originalArr : [],
    daisiesPosition : [],
    rowNum : 0,
    distribute_side : 0,

    init : function () {
        this
            .calculate()
            .sprinkler();
    },

    calculate : function () {
        var screenWidth = $(window).width();
        var screenHeight = $(window).height();

        //每行可以盛开菊花的数量
        this.rowNum = Math.floor(screenWidth / CFG.daisySide);

        //每朵菊花的区域边长
        this.distribute_side = screenWidth / this.rowNum;

        //每屏的高度
        CFG.carpetHeight = this.distribute_side * 10;

        //每屏最多菊花数
        this.maxDaisies = this.rowNum * CFG.carpetDaisies;

        //定义一个矩阵位置数组
        this.originalArr = [];
        var i = 0;
        for (; i < this.maxDaisies; i++) {
            this.originalArr[i] = i;
        }

        return this;
    },

    sprinkler : function () {
        var self = this;
        var num = CFG.carpetDaisies;
        self.daisiesPosition = [];

        for (var i = 0; i < CFG.carpets; i++) {
            //如果菊花数量递增
            if (CFG.daisySpeed && num < self.maxDaisies) {
                num += daisySpeed;
            }

            //菊花坐标添加到菊花坐标数组
            self.daisiesPosition = self.daisiesPosition.concat(self.distribution(num, i));
        }

        //菊花齐放
        self.bloom();
    },

    //传入菊花数量，第几屏
    //返回位置分布坐标数组
    distribution : function (carpetDaisies, carpet) {
        var self = this;
        var daisyPositions = [];
        var messArr = this.originalArr.slice();

        //该屏开始的top坐标
        var startTop = CFG.carpetHeight * carpet;

        //打乱数组
        messArr.sort(function () {
            return 0.5 - Math.random();
        });

        //定位菊花位置
        for (var i = 0; i < carpetDaisies; i++) {
            var item = {};
            item.left = (messArr[i] % self.rowNum) * self.distribute_side;
            item.top = Math.floor(messArr[i] / self.rowNum) * self.distribute_side + startTop;
            daisyPositions.push(item);
        }

        return daisyPositions;
    },

    // 菊花盛放
    bloom : function () {
        var self = this;
        var i = 0;
        var len = self.daisiesPosition.length;
        var content = [];
        var tpl = $('#J_daisyArea_tpl').html();

        for (var i = 0; i < len; i++) {
            var str = tpl
                        .replace('{$left}', self.daisiesPosition[i].left)
                        .replace('{$top}', self.daisiesPosition[i].top);

            content.push(str);
        }

        $('#J_runway').html(content.join(''));
    }
};

var Blurst = {
    bombNum : 0,

    init : function () {
        this.bind();
    },

    /*
     * desc: 点击绑定
     */
    bind : function () {
        var action = '';
        if ('ontouchstart' in document) {
            action = 'touchstart';
        }
        else {
            action = 'click';
        }

        $(document).on(action, '.J_flower', this.boom);
    },

    /*
     * desc: 点击事件
     */
    boom : function (e) {
        $(this).removeClass('J_flower');

        var self = Blurst;
        self.bombNum++;
        self.views.bomb($(this));
    },

    views : {
        bomb : function (obj) {
            obj.css({
                'background' : 'red'
            });
        }
    }
};

$(function () {
    Daisy.init();
    Blurst.init();
    Scroll.init();
});