# spm alipay suite

-------

## 安装

先安装 spm2

```
$ npm install spm -g
```

安装支付宝前端工具

```
$ npm install spm-alipay-suite@ninja -g
```

## Package.json

spm2 的 `package.json` 和 spm 略不相同，需要修改才能用这个工具。

查看[package.json](http://docs.spmjs.org/en/package)


## 使用方法

### spm zip

在发布流程中需要将文件打包上传，`spm zip` 生成 zip 包到当前目录。

注意：包内的目录结构 `family/name/version/filename`

### spm deploy

执行 `spm deploy` 将 dist 目录下的文件部署到静态服务器，默认部署到 http://assets.dev.alipay.net

如果要部署到某台服务器，执行 `spm deploy --target p631`

如果要指定服务器密码，执行 `spm deploy --password admin`

如果要部署源上某个组件，执行 `spm deploy arale/base`

