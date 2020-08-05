## 项目使用说明 waiter-client

## 发布生产环境操作步骤，请严格遵守 ##
```
1. 修改 package.json version版本号，按照最小版本升级
2. 配置 im.config.js env=uat uat测试 dev本地，用于请求客服API接口服务
3. 执行 npm run electron:build:uat 生成安装包，生成目录dist_electron
4. 将dist目录下的对应版本 *.yml *.exe 上传到服务器，提供下载使用
```

## npm 配置淘宝镜像
## npm install package --registry=https://registry.npm.taobao.org
## npm install -g cnpm --registry=https://registry.npm.taobao.org

## 项目下载后安装依赖
```
npm install
```

### 编译和启动本地服务
```
测试环境:
npm run electron:serve:uat
本地环境:
npm run electron:serve:dev
```

### 编译和生成安装程序
```
测试环境:
npm run electron:build:uat
本地环境:
npm run electron:build:dev
```

### vue cli 自定义配置
```
配置参考 https://cli.vuejs.org/config/
```

### 版本
```
electron 6.1.7
electron 5.0.10
```

## 贡献者名单 
```
pengzq
tangyd
```