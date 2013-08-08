# APM

Alipay package manager, a alipay suite of tools base on spm.

> 0.3.0 版本后 spm-alipay-suite 改名为 apm.

---

这是一个基于 `spm2.x` 的套件集合，你可能需要先了解下 [spm](https://github.com/spmjs/spm2/)。

`apm` 会将你的 spm [默认源](http://docs.spmjs.org/en/config#source) 设为支付宝内部的 `http://yuan.alipay.im`，外网是无法访问的，如果你不需要，记得重置。

```
$ spm config source.default.url https://spmjs.org
```

## 安装

```
$ npm install apm -g
```

如果你之前安装过 `spm-alipay-suite`，在安装过程中可能会报 `Error: Refusing to delete` 的错误。
此时不要着急，淡定地加上 `-f` 强制安装即可。

```
$ npm install apm -g -f
```

如果你的环境需要 `sudo`，请先阅读这篇文章：http://aralejs.org/docs/installation.html

安装完后可以检查下你的环境

```
$ spm check
```

## Package.json

`spm2.x` 的 `package.json` 和 `spm1.x` 略不相同，需要修改才能用这个工具。

查看[package.json](http://docs.spmjs.org/en/package)


## 支付宝套装收罗的功能有：

- spm 包管理工具 ([文档](http://docs.spmjs.org/en/index))

- `spm build` 构建插件([文档](https://github.com/spmjs/apm/blob/master/docs/spm-build.md))，
   根据源码和 package.json 来构建标准的 CMD 模块。

  * stylus 编译功能（当 src 目录中有 *.styl 文件时，`spm build` 会自动构建出对应的 css 文件）

  * check-online 构建时检测该模块是否已发到线上。

  * check-debug 构建时检测是否打包了 xxx-debug 的依赖。

  * [peaches](http://peaches.io) 构建时自动合并雪碧图片。

- `spm deploy` 部署插件 ([文档](https://github.com/spmjs/apm/#spm-deploy))

- `spm watch` 监听文件修改自动部署插件。 ([文档](https://github.com/spmjs/apm/#spm-watch))

- `spm init` 初始化插件以及 Arale 和 Alice 的初始化模板 ([文档](https://github.com/spmjs/spm-init/blob/master/README-zh.md))

- `spm status` 模块发布状态检测插件 ([文档](https://github.com/spmjs/apm/#spm-status))

- `spm zip` 打成 zip 包 ([文档](https://github.com/spmjs/apm/#spm-zip))

- `spm check` 检查 spm 配置环境和相关插件的版本是否正确 ([文档](https://github.com/spmjs/apm/#spm-check))

- `spm test` 使用 phantomjs 跑测试用例，测试 src 和 dist 代码，并使用 jscoverage 生成覆盖率文档。`需要先用 spm doc 生成本地测试文档`

- `spm totoro` 使用 totoro 跑测试用例 ([文档](https://github.com/totorojs/totoro))

- `spm doc` 文档管理工具。

  * `spm doc build` 生成文档到 _site 目录下。
  
  * `spm doc server` 在 _site 目录启动一个服务用于调试文档。
  
  * `spm doc watch` 在 _site 目录启动一个服务用于调试，并监听源码改动，实时刷新。

  * `spm doc publish` 将文档发布到源上。

  * `spm doc clean` 清除 _site 目录。

- 安装 spm doc 所用到的 Arale 和 Alice 的静态文档模板。


## 具体使用说明

### spm zip

在发布流程中需要将文件打包上传，`spm zip` 会在当前目录生成 zip 包。

**注意：包内的目录结构 `family/name/version/filename`，所以要在 assets 目录上传。**

### spm deploy

执行 `spm deploy` 将 dist 目录下的文件部署到静态服务器，默认部署到 http://assets.dev.alipay.net。

如果要部署到某台服务器，执行

```
$ spm deploy --target p631
```

如果要指定服务器密码，执行 `spm deploy --password admin`。

如果要部署源上某个组件，执行

```
$ spm deploy arale/base
$ spm deploy arale/base@1.0.0
```

### spm watch

方便的本地调试工具，监听本地 src 里的源文件和 package.json 的改动，并自动部署到指定服务器的插件。
默认部署到 http://assets.dev.alipay.net。

```
$ spm watch
$ spm watch --target p631
```

原来的开发过程是：

```
修改文件 -> spm build -> spm deploy
修改文件 -> spm build -> spm deploy
修改文件 -> spm build -> spm deploy
....
```

现在的开发过程可以是：

```
spm watch
修改文件
修改文件
修改文件
....
```

[相关讨论](https://github.com/spmjs/apm/issues/36)

### spm status

检查某个模块的发布状态，包括 dev、test、和线上三个环境。

```
$ spm status arale/widget
$ spm status arale/widget@1.0.3

$ spm status arale              // 检测 arale 下所有模块
$ spm status arale --error      // 只打印出报 404 的模块
```

### spm doc

Arale 和 Alice 模块的文档解决方案，是对原有 nico 方案的封装。

安装 spm doc 后可以不再使用 Makefile 里面的功能。

```
$ spm doc clean
$ spm doc build
$ spm doc server
$ spm doc watch
$ spm doc publish
```

### spm check

可以通过这个命令检查当前环境，排错时首推功能。

- 检测 node 环境，如遇到错误可根据[文档](http://aralejs.org/docs/installation.html)进行配置。
- 检测依赖库的版本是否过期，如遇到错误可重新安装。
- 检测 spmrc 的配置是否正确，如遇到错误可修改 `~/.spm/spmrc` 文件对应的配置。

### peaches 雪碧图自动合并

具体功能可以查看 [peaches官网](http://peaches.io/) 和 [范例](https://github.com/afc163/peaches-example)。

我们在 apm 中集成了peaches，在 package.json 中添加如下属性就可以启动 peaches 服务。调用 `spm build` 进行打包时时会自动帮你合并所有的背景图片。

```
  "spm": {
    "peaches": true
  }
```

