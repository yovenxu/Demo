# 关于前端优化
在前端摸打滚打也有三年时间了，也是时候对于自己在工作中学习到的知识和积累到的经验做一次回顾总结了。这篇文章主要围绕前端优化来讲，其中说到发散点的话，也随心所欲发散来讲，主要是为了总结和回顾嘛。

前端优化的点有非常多，我也不提前列出来，就一个个点罗列出来。

###1. 减少http请求数
#####Why？
每一次的http请求会经过TCP三次握手、DNS请求和解析，并且也由于浏览器同一个域名下同时进行http连接数的限制，所以每一次http请求所耗费的资源是非常巨大的，所以减少http请求数是前端优化中非常重要的一点。

减少http请求头，http头是个非常庞大的，包括cookie，http请求会把请求域下的cookie带上，所以静态资源分域也属于前端优化中的一个点。

过多的http请求对于服务器来说也是一件非常危险的事，如果服务器不是非常强，就需要把减少http请求数放到比较前的位置，但是如果服务器已经有足够强大的技术和硬件包括CDN支持的话，前端工程师优化的重心就应该向用户偏重。

所以，有的时候，类似Yslow那样的前端优化评分工具的参考需要根据自身维护网站的特点来考虑。

```
TCP三次握手：
第一次握手，客户端发送一个包指明打算连接服务器的端口
第二次握手，服务器确认包应答
第三次握手，客户端再次发送确认包，这个时候http协议建立需要的三次握手就完成了，于是，客户端紧接着向服务器发送http请求报文。

断开连接则需要四次挥手：
第一次挥手：客户端给服务器发送TCP包，用来关闭客户端到服务器的数据传送
第二次挥手：服务器收到客户端第一次挥手发送过来的FIN后，发回一个ACK
第三次挥手：服务器关闭与客户端的链接，发送一个FIN确认
第四次挥手：客户端收到服务器的FIN滞后，发回ACK确认

DNS请求和解析
当请求一个URL的时候，浏览器首先到本地缓存信息中寻找解析结果，如果没有，就去根域名服务器请求，根域名服务器返回给本地域名服务器一个所查询的主域名服务器的ip地址，然后浏览器再去请求刚才返回的ip地址的域名服务器，然后返回下一级域名的ip地址，知道我们找到域名中所指得服务器的ip，然后将结果缓存起来供下次使用。
一个第一次请求的url的DNS解析过程可能耗费是很高的，但是解析一次之后，结果就会被缓存起来，之后再请求就不用走以上的复杂解析过程了。如果一个网站的用户回头率很高的话，在优化时就可以减少考虑DNS解析花费的时间了。

DNS prefetching DNS预获取
在支持DNS prefetching的浏览器中，可以在页面head的meta后加上
<link rel="dns-prefetch" href="//test.img3.com">
让浏览器提前尝试解析域名并将其进行缓存。

Yslow评分，前端优化效果的检测工具
1. Make fewer HTTP requests--更少的http请求，也就是说页面中尽量少的引用外部静态资源，js、css以及图片
2. Use a CDN--使用CDN网络，将页面中的静态资源分布到离用户最近的网络节点上
3. Add an Expires header--为静态资源文件增加过期时间，让用户通过本地缓存来更快的访问网站
4. Gzip components--压缩静态资源内容，减少网络传输时间
5. Put CSS at the top--将CSS放在页面头部，能够更快渲染页面
6. Put JS at the bottom--将JS放在页面底部，一般情况下JS的下载是阻塞模式的，放在页面顶部会阻塞其他资源的下载
7. Avoid CSS expressions--不要使用CSS表达式，因为CSS表达式需要很多资源，有时甚至会造成页面假死
8. Make JS and CSS external--将CSS和JS使用外部的独立文件，这点有点和1冲突，但是仔细分析下，并不矛盾
9. Reduce DNS lookups--减少DNS查找
10. Minify JS--最小化压缩JS，和第4点不同，使用YUI Compressor或者JSMin将JS文件进行分析，将一些变量名变短，去除不必要的空格和符号
11. Avoid redirects--避免无意义的跳转
12. Remove duplicate scripts--去除重复的脚本，不光是文件，甚至是同功能的函数
13. Configure ETags--配置实体标签
14.Make Ajax Cacheable--上面的准则也适用Ajax 
注：由于Yslow评分中DNS请求对评分影响较大，会与前端优化中增加hostname来达到提高浏览器并发请求数有冲突。
```
#####How？
1. 合并js脚本文件和css样式文件
2. 合并异步请求
3. 如果页面不是动态页面，尽量考虑把需要异步请求的数据合并到缓存数据中与页面一起缓存

###2. 提高浏览器http并发请求数
#####Why?
不同浏览器对单个域名的最大并发连接数有一定的限制，HTTP/1.0和HTTP/1.1也不相同，一般为2~8个。由于最大并发连接数的限制，如果浏览器同时对某一个域名发起多个请求，超过了限制就会出现等待，就会阻挡资源的加载。

具体浏览器最大并发连接数如下（数据参考互联网）：

```
ie6、7：HTTP/1.1最大支持2个，HTTP/1.0最大支持4个
ie8：6个
firefox3：6个
safari3：4个
```
#####How?
为了解决浏览器的最大并发连接数限制而导致页面资源被阻塞的问题，可以对页面上需要请求的资源进行域名分散处理（一般主要对静态资源进行域名分散处理，如:js、css、img）。

举个例子：

当一个页面包含20多张在test.vip.com域名下图片的时候，在做域名分散处理之前，至少会有10几个请求会被阻挡。而如果分散域名处理，把图片的请求域名分散到vip.img1.com、vip.img2.com等多个不同域名的时候，这20多张图片请求会并发进行，整个页面的打开速度就会明显提升很多。

域名分散处理还能带来另外一个：减少cookie污染，这一点在下面静态资源分域会详细进行介绍。

###3. 静态资源分域
#####Why & How ?
静态资源主要指的是页面中需要浏览器下载而又不需要服务器进行逻辑处理的文件，如：js、css、img、font-face字体文件等。

由于http请求会把请求域下的cookie也同时发送到服务器，但是由于cookie对于静态资源服务器是没有用的，如果静态资源也存在于与请求页面同一个域名下的话，就会导致cookie也发送到服务器，浪费用户的带宽，也直接影响了文件的传输速度。

所以，静态资源分域后，页面请求静态资源时就不会再发送无关的cookie了，既能提高文件的传输速度，如果有CDN支持的话也能充分利用CDN，也能带来第2点的提高http并发请求数。

又举个例子：

在vip.com下如果对在同一个域的css文件进行请求的话，就会把存在浏览器中vip.com域下面的cookie都发送给服务器。但是如果静态资源分域后，就变成在vip.com下发送请求s2.vipstatic.com下的css文件，由于一般不会有cookie存在vipstatic.com或者s2.vipstatic.com域下，所以也不会有cookie会发送给s2服务器。

###4. 充分利用缓存机制
现有缓存机制：

1.CDN，全称Content Delivery Network内容分发网络，CDN系统能够实时地根据网络流量和各节点的连接、负载状况以及到用户的距离和响应时间等综合信息将用户的请求重新导向离用户最近的服务节点上。

```
* CDN加速原理：通过动态域名解析，用户的请求被分配到离自己最近的服务器，CDN服务器直接返回缓存文件或通过专线代理源站的内容，网络加速+内容缓存，有效提高访问速度。
* CDN缓存的内容：html、图片、css、xml等静态资源，不缓存带有?的动态地址、jsp、php、js文件也不缓存(除非特殊设置)，缓存源站返回http状态为20*或304，不缓存其他状态（如：404、500、503）。
* CDN缓存内容的更新：
（a）用户首次请求，CDN从源站抓取后缓存，直到文件过期后有用户请求再次更新;
（b）程序主动通知CDN抓取，如：刷CDN缓存工具。
* CDN缓存内容的有效期（？）
http://blog.csdn.net/liyong199012/article/details/21886865

```
2.服务器生成静态缓存文件

3.使用服务器memcached分布式内存对象缓存系统，可以有效地减轻动态web应用的数据库负载。

4.ajax数据的缓存，对于时效性不是非常高的数据可以在ajax请求完毕之后缓存起来使用，ajax请求的参数cache设置为true也可以利用到浏览器的缓存机制。

###服务器Gzip压缩
Gzip是一种非常流行的文件压缩算法，现在应用非常广泛，当使用Gzip压缩到一个纯文本的文件时，效果是非常明显的，大约可以减少70%以上的文件大小。

当浏览器发送请求的时候，服务器从头信息中Accept-Encoding获知浏览器是否支持Gzip压缩。

如果支持，则会检查文件的后缀名，如果请求的是html、css等静态文件，服务器会到压缩缓冲目录中检查是否已经存在请求文件的最新压缩文件。

如果压缩文件不存在，服务器向浏览器返回未压缩的文件，并在压缩缓冲目录中存放请求文件的压缩文件。

如果请求文件的最新压缩文件已经存在，则直接返回请求文件的压缩文件。

如果请求文件是动态文件，服务器动态压缩内容并返回浏览器，压缩内容不存在压缩缓存目录中。

但是Gzip压缩在ie6下面会存在压缩的脚本无法正常执行，微软建议不要对js文件进行http压缩。（？）

###静态文件的合并和压缩
这里所指的静态文件主要是UI展示的css、img、js等文件，这些文件都能进行合并和压缩。

```
css的合并工具：less、sass、stylus，三者均为css的预处理工具，可以非常高效地编写css代码，并且可以合并css文件及编译压缩。

img图片优化工具：imagemin

js合并工具：
seajs：（？）
browserify：会把所有的js模块都合并成一个文件
seajs和browserify对比，我更加倾向于使用browserify这种合并式（require.js？）的方式来进行js模块的管理，因为这样可以遵循减少http请求的原则，并且也在Gzip技术的基础上也使得单个文件较大这个问题的影响减到最小。

js模块之间的通讯：
因为一个页面可能需要载入多个js文件，但是由于js文件载入的顺序无法确定，就给js之间的通讯交互带来很大的阻碍了。
为了最好地解决这个问题，在这里引入一个消息组件，消息组件是一个全局的组件，组件可以通过消息的绑定和发送来进行各种各样的异步操作。
比如，页面需要载入a.js和b.js，a.js中有一种情景是需要b.js载入执行完毕后才能执行的，这样就可以在a.js中进行消息的绑定

	$.Listener.sub('bLoaded').onsuccess(function () {
		//执行b.js载入后的动作
	});
	
在b.js中最后发送消息告诉a.js它已经载入完成，可以执行a.js中绑定的函数了

	$.Listener.pub('bLoaded').success();
	
这样就可以完美地解决了页面js之间的依赖关系了。
```

###图片lazyload
图片lazyload即为图片延迟加载，通常用于图片较多的网站，当页面滚动或者浏览器窗口大小变化时才加载在可视区域内的图片，做到按需加载，在一定程度上降低服务器的负载，从而达到网页优化的效果。

```
jquery图片lazyload插件的使用
$('img').lazyload({
	threshold: 200 //为触发位置到图片的距离，值越大，越看不到图片延迟加载的效果。
});
```
###第一屏优先展示原则
一个页面可能会存在非常多的Dom节点，如果全部一次性都加载进来，就会触发整个页面的渲染，这样页面加载的时间就会变得很长。

但是实际上，用户一开始看到的部分也只是页面的第一屏部分，所以就可以考虑把第一屏的内容首先展示给用户，然后用户滚动页面下拉的时候才触发加载及渲染更多的Dom出来。

在这里，可以使用消息机制来按顺序触发不同重要级别的功能模块。

第一屏优先展示原则能给用户带来更好的体验，可以有效地降低页面跳出率。

```
Dom lazyload
原理与图片lazyload类似，用户进行页面下拉的时候才进行Dom结构的加载，这样也属于按需加载的一个方式。
```

###页面内容重要性排序
一个页面包含的内容有非常多，如：导航信息、主要内容、活动宣传、友情链接、广告等模块。如果我们给这些模块都进行排序，把一些最重要的内容优先进行处理，把重要性较低的模块放到加载顺序的最后，这样就可以更快地让用户看到他关心的内容，也符合第一屏优先展示原则。

###采用前端新技术
前端的技术迭代变更非常迅速，极有可能三年前遵循的优化原则在今天就已经不再适用了，新技术的诞生也给前端带来了非常大的优化空间。

#####font-face
font-face不能说是一门新的技术，只是移动市场的出现让这门技术变得更加流行起来。font-face主要是把开发者定义的一些Web字体嵌入到网页中。

利用font-face制作的图标字体能完美解决图片图标在Retina屏幕下出现模糊的问题，因为font-face图片字体是矢量的，可以任意放大也不会占用更多的网络资源，并且是完全不会模糊的。

font-face图标能加上任何文字的效果，包括颜色、hover、透明度、阴影、翻转等。

font-face能兼容非常多主流的浏览器，也包括顽固的IE6。

但是，font-face也有缺点：只能被渲染成单色或者是css3渐变色、使用的版权问题、创作自己的font-face字体很耗时间并且会给后期带来较高的维护成本。

#####Webp图片
Webp是由谷歌推荐的一种新的图片格式，可以让图片的大小减少40%，从而加快页面的加载速度。

Webp图片采用了一种更优秀的图片编码方式，可以使图片的大小平均减少39%，但是质量在图片转换成webp格式后并没有明显的下降。

但是，目前支持webp格式图片的浏览器并不是非常多。

```
关于图片优化的文章推荐：http://blog.cabbit.me/web-image-optimization/
```

###更多前端知识
####http状态码
######成功2XX，成功处理了请求的状态码。
200：服务器成功处理了请求并返回了请求的网页

204：服务器成功处理了请求但没有返回任何内容
######重定向3XX，每次请求中使用重定向不要超过 5 次。
301：请求的网页已永久移动到新位置，当url发生变化时，使用301状态码，搜索引擎索引中保存新的URL。

302：请求的网页临时移动到新位置，搜索引擎索引中保存原来的URL。

304：如果网页从用户上次的访问请求后没有更新，则使用304告诉浏览器使用本地缓冲的文档，可以节省带宽和开销。

######客户端错误4XX，表示请求可能出错，妨碍了服务器的处理。
400：服务器不理解请求的语法

403：服务器拒绝请求，通常由于服务器的文件或目录权限设置导致

404：服务器找不到请求的网页。服务器上不存在的网页经常会返回此代码

######服务器错误5XX，表示服务器在处理请求时发生内部错误，这些错误可能是服务器本身的错误，而不是请求出错。
500：服务器遇到错误，无法完成请求

503：服务器由于维护或者负载过重未能应答。例如，Servlet可能在数据库连接池已满的情况下返回503。服务器返回503时可以提供一个 Retry-After头。

504：由作为代理或网关的服务器使用，表示不能及时地从远程服务器获得应答。

###浏览器重绘与回流
重绘是一个元素外观的改变所触发的浏览器行为，例如改变vidibility、outline、背景色等属性。浏览器会根据元素的新属性重新绘制，使元素呈现新的外观。重绘不会带来重新布局，并不一定伴随回流。

回流，也成为重排，可以理解为渲染树需要重新计算。以下为常见触发重排的操作：

* Dom元素的几何属性变化

* Dom树的结构变化

* 获取某些属性，这些属性包括：offsetTop、offsetLeft、 offsetWidth、offsetHeight、scrollTop、scrollLeft、scrollWidth、scrollHeight、clientTop、clientLeft、clientWidth、clientHeight、getComputedStyle() (currentStyle in IE)

* 调整浏览器窗口大小

所以基于浏览器重绘与回流的基础上的优化考虑，以下的实践比较推荐：

* 将多次改变样式属性的操作合并成一次操作

* 讲需要多次重排的元素的position属性改为：absolute或fixed，让元素脱离文档流，它的变化就不会影响到其它元素

* 把html都以字符串的形式拼接好之后再添加到文档中

* 可以先display:none元素，等操作完毕之后再显示，这样就只在隐藏和显示的时候触发了重排

* 需要获取会引起浏览器重排的属性值时，要缓存到变量


###事件委托
Dom2级时间规定的事件流包括三个阶段：事件捕获阶段、处于目标阶段和事件冒泡阶段。

假设用户点击body内的一个div

事件捕获阶段：在事件捕获过程中，document会先接收到点击事件，然后事件沿Dom树依次向下，一直传播到事件的实际目标即div元素前都属于事件捕获阶段。

处于目标阶段：事件捕获到了目标即被点击的div。

事件冒泡阶段：由事件最具体的元素也就是最深的节点开始，然后逐级向上传播到较为不具体的节点。处于目标阶段也被当作冒泡阶段的一部分。冒泡阶段会触发绑定在元素上的事件函数。

事件委托即事件代理，当我们需要对很多元素添加事件的时候，可以通过将事件添加到它们的父节点，利用事件冒泡机制而将事件委托给父节点来触发处理函数。

###前端安全

###前端单元测试

###JS的CMD和AMD规范