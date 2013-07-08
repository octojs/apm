# spm build

-------

基于 [grunt](http://gruntjs.com/) 的构建工具，把构建过程分为 n 个 Task，Task 按照顺序执行。

通过 [Gruntfile](https://github.com/spmjs/spm-alipay-suite/blob/master/Gruntfile.js) 配置 Task，可以在各个阶段插入 Task。

## 构建配置

[所有的配置项](http://docs.spmjs.org/en/package)

### family 和 spm

在 package.json 中有这两个配置才被认作是 spm2 的项目

### alias

这个和 seajs 的 alias 一样，配置如下

```
"spm": {
  "alias": {
    "base": "arale/base/1.0.0/base"
  }
}
```

在构建过程中会将 require 的值替换成 alias 中的值

```
require('base')
=>
require('arale/base/1.0.0/base')
```

如果在 alias 中找不到则不会处理，但会有 warn 提示。如我们不希望替换 jquery

```
require('$') //不会替换
```

### output

通过 output 指定输出的文件，只有指定的文件才会输出到 dist 目录下

```
// a.js
define(function(require) {
    require('./b')
});

// b.js
define(function(require) {
    require('./c')
});

// c.js
define(function(require) {
});
```

package.json

```
"output": ["a.js", "c.js"]
```

最终会生成 `dist/a.js` 和 `dist/c.js`，`dist/a.js` 会包括 `a.js` `b.js` `c.js`，`dist/c.js` 只包括 `c.js`。

### include

构建的时候会包含相对的模块，这是由 include 属性决定的，默认为 `"include": "relative"`，如果想打包所有的依赖可以如下配置 package.json

```
"spm": {
  "include": "all"
}
```

### styleBox

样式隔离方案，具体功能见 [aliceui/aliceui.org#9](https://github.com/aliceui/aliceui.org/issues/9)

在 package.json 中添加如下属性就可以启动样式隔离。spm build 时会帮你把 JS 中 require 的样式进行封装。

```
  "spm": {
    "styleBox": true
  }
```

> 注：需要配合 [arale/widget@1.1.0+](http://aralejs.org/widget) 进行使用。


## build 详细说明

build 的整个任务被分解成一个个 task 执行，会针对各种文件(`.js`、`.css`、`.tpl`、`.handlebars`等)进行处理，下面是所有的任务，接下来针对每个文件进行说明。

```
'clean:build', // delete build direcotry first

'spm-install', // install dependencies

// build stylus
'stylus', // src/*.styl -> .build/stylus/*.css
'transport:stylus', // .build/stylus/*.css -> .build/src/*.css

// build css
'transport:src',  // src/* -> .build/src/*
'concat:css',   // .build/src/*.css -> .build/tmp/*.css

// build js (must be invoke after css build)
'transport:css',  // .build/tmp/*.css -> .build/src/*.css.js
'concat:js',  // .build/src/* -> .build/dist/*.js

// to ./build/dist
'copy:build',
'cssmin:css',   // .build/tmp/*.css -> .build/dist/*.css
'uglify:js',  // .build/tmp/*.js -> .build/dist/*.js

'check-debug',
'check-online:alipay',
'peaches',

'clean:dist',
'copy:dist',  // .build/dist -> dist
'clean:build',

'spm-newline'
```

其中最重要就是 [transport](https://github.com/spmjs/grunt-cmd-transport) 和 [concat](https://github.com/spmjs/grunt-cmd-concat)。

### js 文件

一个模块可以依赖相对模块和绝对模块，如 a.js 依赖 base 模块和 b.js，b.js 没有依赖

```
// a.js
define(function(require, exports, module){
  require('base');
  require('./b');
  module.exports = 'a';
});

// b.js
define(function(require, exports, module){
  module.exports = 'b';
});
```

`transport:src` 会标准化这两个 js，define 的时候添加 id 和 deps。假设这个模块的 idLeading 是 `arale/widget/1.1.0`（idLeading 是从 package.json 获取的，即 `family/name/version`），会生成如下文件，注意外部模块的依赖是从 package.json 的 alias 中读取的。

```
// a.js
define('arale/widget/1.1.0/a', ['arale/base/1.1.1/base', 'arale/class/1.1.0/class', 'arale/events/1.1.0/events', './b'], function(require, exports, module){
  require('arale/base/1.1.1/base');
  require('./b');
  module.exports = 'a';
});

// b.js
define('arale/widget/1.1.0/b', [], function(require, exports, module){
  module.exports = 'b';
});
```

`transport:src` 把文件生成到 .build/src, 还会生成 -debug 文件，与源文件唯一的不同是 id 和 deps 都为 -debug。而且最后生成的依赖是打平的，包括所有的依赖。

`concat:js` 将 transport 后的文件进行合并，默认的合并模式为 relative，也就是只合并相对路径的模块。

```
// a.js
define('arale/widget/1.1.0/a', ['arale/base/1.1.1/base', 'arale/class/1.1.0/class', 'arale/events/1.1.0/events', './b'], function(require, exports, module){
  require('arale/base/1.1.1/base');
  require('./b');
  module.exports = 'a';
});
define('arale/widget/1.1.0/b', [], function(require, exports, module){
  module.exports = 'b';
});

// b.js
define('arale/widget/1.1.0/b', [], function(require, exports, module){
  module.exports = 'b';
});
```

最终 -debug 文件输出到 .build/dist 中，而源文件输出到 .build/tmp 下，这是为了压缩做准备。

`uglify:js` 压缩 .build/tmp 下的 js 输出到 .build/dist 下。

### css 文件

css 文件和 js 一样，也有相对模块和绝对模块，通过 `@import` 引用依赖。

```
// a.css
@import "base"
@import "./b.css"

// b.css
body {background: red;}
```

`transport:src` 会对源文件进行转换，主要给文件加上 define 和转换 import，输出到 .build/src 中。

```
// a.css
/*! define arale/widget/1.2.1/a.css */
/*! import alice/base/1.0.0/base.css */
/*! import ./b.css */
@import "base"
@import "./b.css"

// b.css
/*! define arale/widget/1.2.1/b.css */
body {background: red;}
```

`concat:css` 将依赖的 css 合并到一个 css 中，输出到 .build/tmp 中，合并过程中会将每个 import 转换成 block。


```
// a.css
/*! define arale/widget/1.0.0/a.css */
/*! block alice/base/1.0.0/base-debug.css */
...
/*! endblock alice/base/1.0.0/base-debug.css */
/*! block arale/widget/1.0.0/b-debug.css */
body {
  background: red;
}
/*! endblock arale/widget/1.0.0/b-debug.css */

// b.css
/*! define arale/widget/1.0.0/b.css */
body {background: red;}
```

`cssmin:css` 压缩 .build/tmp 下的 css 输出到 .build/dist 下。

### js 依赖的 css 文件

这里是指在 js 文件中所 require 的 css 文件，这种情况与直接 output 的 css 有所不同。

```
// a.js
define(function(require, exports, module){
  require('./b.css');
  module.exports = 'a';
});

// b.css
body {background: red;}
```

前几个步骤与上面是相同的，js 做 `transport:src` 处理，css 做 `transport:src` `concat:css` 处理

```
// a.js
define('arale/widget/1.1.0/a', ['./b.css'], function(require, exports, module){
  require('./b.css');
  module.exports = 'a';
});

// b.css
/*! define arale/widget/1.0.0/b.css */
body {background: red;}
```

接下来会做 `transport:css` 处理，也就是将 ./b.css 转换成 ./b.css.js。

```
// a.js
define('arale/widget/1.1.0/a', ['./b.css'], function(require, exports, module){
  require('./b.css');
  module.exports = 'a';
});

// b.css.js
define('arale/widget/1.0.0/b.css', [], function() {
    seajs.importStyle('body {background: red;}');
});
```

接下来做 `concat:js` `uglify:js` 都与一般 js 相同。

```
// a.js
define('arale/widget/1.1.0/a', ['./b.css'], function(require, exports, module){
  require('./b.css');
  module.exports = 'a';
});
define('arale/widget/1.0.0/b.css', [], function() {
    seajs.importStyle('body {background: red;}');
});
```

### stylus 文件

暂时还没支持 less 和 sass，但原理是一样的，有需求可以支持。

`stylus` 将 src 下的 styl 文件转换成 css 输出到 .build/stylus，然后再 `transport:stylus` 到 .build/src 下。

之后的操作就跟 css 一样了。

### handlebars 模板文件

在编译的时候会将 handlebars 模板进行预编译，可提高运行时的性能。

```
// a.js
define(function(require, exports, module){
  require('./b.handlebars');
  module.exports = 'a';
});

// b.handlebars
	<ul>
	  {{#each list}}
	   <li>{{content}}<li>
	  {{/each}}
	</ul>
```

`transport:src` 进行预编译生成 b.handlebars.js

```
// a.js
define('arale/widget/1.1.0/a', ['./b.handlebars'], function(require, exports, module){
  require('./b.handlebars');
  module.exports = 'a';
});

// b.handlebars.js
define("arale/widget/1.1.0/b.handlebars", ["gallery/handlebars/1.0.2/runtime" ], function(require, exports, module) {
    var Handlebars = require("gallery/handlebars/1.0.2/runtime");
    ...
});
```

接下来做 concat:js uglify:js 都与一般 js 相同。

### 其他 task

- spm-install：编译前需要先下载依赖
- check-debug
- check-online:alipay：检测生成的文件是否已发布，禁止重新编译已发布的文件。
- peaches：合并图片
- spm-newline：最后需要有个空行，以免 combo 有问题