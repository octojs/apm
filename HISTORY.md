# HISTORY

---

## 0.3.5

- 升级 spm 版本到 2.1.9 ，这个依赖版本的主要改变是 cmd-util 的 bug 修复。

## 0.3.4

- 修复 spm doc publish 偶尔报错的问题。

## 0.3.3

- 修复 deploy 未传 tar 包的问题

## 0.3.2

- 去掉对 jsdom 的依赖，因为这货在 window 下的安装需要 python 环境。
- 增加 mocha-browser 到 deps.json 中。
- 提升 check-debug 的速度
- 修复一个 https 下 spm-status 失效的[问题](https://github.com/brianc/node-postgres/issues/314)

## 0.3.1

- deploy 时默认 publish 到源上

## 0.3.0

- 改名为 apm，集成 spm 的安装。
- 添加 peaches 支持。
- 完成 spm-doc 插件的功能集成。
- 将 spm-test 改名为 spm-totoro。
- 添加新的 spm-test 功能，进行本地测试和输出覆盖率。

## 0.2.6

- 优化安装的显示信息
- 给 spm zip 添加 -s 参数 #19
- 添加 -debug-debug 检查，避免打包出带 debug 依赖的模块
- 升级 spm-init, 添加默认模板。

## 0.2.5

- 支持 alice 的 theme
- check-online 增强，如果存在则停止构建
- shell 下增加自动补全
- 增加 check ~/.npm 目录

## 0.2.4

- deps.json 添加 totoro
- 增加 spm test 整合 totoro 的功能
- 增加 makefile 中的功能，包括 `spm build-doc` `spm-publish-doc` `spm test-src` `spm test-dist` `spm coverage`

## 0.2.3

- 升级 cdn 版本
- 修复源服务的默认地址设置失效的问题

## 0.2.2

- 在 deps.json 中删除 spm

## 0.2.1

- 增加 spm check

## 0.2.0
