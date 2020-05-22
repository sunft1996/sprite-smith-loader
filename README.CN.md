<!--
 * @Descripttion: 
 * @Author: sunft
 * @Date: 2020-05-22 13:55:05
 * @LastEditTime: 2020-05-22 13:55:41
--> 
<h1 align="center">sprite-smith-loader</h1>


![image](https://img.shields.io/badge/license-MIT-green)
![image](https://img.shields.io/badge/webpack-%5E4.0.0-blue)
## 介绍
sprite-smith-loader是一款自动生成雪碧图工具，你可以在webpack中使用它，它会自动生成雪碧图并修改相应的css代码。
## 安装
下载sprite-smith-loader

```
npm install --save-dev sprite-smith-loader
```
## 配置
将loader添加到webpack的配置中，必须放在css-loader之后

**webpack.config.js**

```
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader','sprite-smith-loader'],
      },
    ],
  },
};
```

## 使用
修改你的css文件

```
.my_bg_1{
    height: 100px;
    width: 100px;
    background: url('./demo1_sprite.png') 0px 0px;
    background-size: 100px 100px;
}

.my_bg_2{
    height: 100px;
    width: 100px;
    background: url('./demo2_sprite.png') -20px -20px;
    background-size: 150px 150px;
}
```
雪碧图生成后，loader会修改css中background属性，为了准确计算转化后的background属性，请你遵循以下规范：
    

属性名 | 是否必填 | 说明
---|---|---
height | true| 单位为 px
width | true| 单位为 px
background-size | true| 单位为 px
background | true| 包含 image，position，repeat
background-image | true| 包含于 background，图片名以 _sprite.png结尾
background-position | false| 包含于 background，值为 px px 的形式
background-repeat | false| 不要填no-repeat以外的值




## License

[MIT](https://github.com/sunft1996/sprite-smith-loader/blob/master/LICENSE)