module.exports = {
  devServer: {
    port: 7788, // 端口
    host: 'im.jshii.com.cn',
    overlay: {
      warnings: false,
      errors: false
    }
  },
  lintOnSave: false,
  pages: {
    login: {
      // page 的入口
      entry: 'src/renderer/login/main.js',
      // 模板来源
      template: 'public/login.html',
      // 在 dist/index.html 的输出
      filename: 'login.html',
      // 当使用 title 选项时，
      // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
      title: '在线客服-欢迎登录',
      // 在这个页面中包含的块，默认情况下会包含
      // 提取出来的通用 chunk 和 vendor chunk。
      chunks: ['chunk-vendors', 'chunk-common', 'login']
    },
    index: {
      // page 的入口
      entry: 'src/renderer/index/main.js',
      // 模板来源
      template: 'public/index.html',
      // 在 dist/index.html 的输出
      filename: 'index.html',
      // 当使用 title 选项时，
      // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
      title: '在线客服-工作台',
      // 在这个页面中包含的块，默认情况下会包含
      // 提取出来的通用 chunk 和 vendor chunk。
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    }
  },
  pluginOptions: {
    electronBuilder: {
      outputDir: process.env.VUE_APP_OUTPUT_DIR,
      builderOptions: {
        appId: 'com.oc.im',
        productName: process.env.VUE_APP_PRODUCT_NAME,
        copyright: 'Copyright © 2020.01 pengzq',
        publish: [{
          provider: 'generic',
          url: process.env.VUE_APP_DOWNLOAD_URL
        }],
        win: {
          icon: 'ocim.ico',
          target: [{
            target: 'nsis',
            arch: [
              'x64',
              'ia32'
            ]
          }]
        }
      },
      mainProcessFile: 'src/main-process/index.js'
    }
  }
}
