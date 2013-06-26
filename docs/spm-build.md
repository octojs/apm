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

通过 output 指定输出的文件

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

构建的时候会包含相对的模块，这是由 include 属性决定的，默认为 `"include": "relative"`，如果想打包所有的依赖可以如下配置 package.json

```
"spm": {
  "include": "all"
}
```

## 使用说明

### stylus

### 样式隔离方案




