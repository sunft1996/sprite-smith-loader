<h1 align="center">sprite-smith-loader</h1>


![image](https://img.shields.io/badge/license-MIT-green) 
![image](https://img.shields.io/badge/webpack-%5E4.0.0-blue)

:rocket: [中文文档点这里](https://github.com/sunft1996/sprite-smith-loader/blob/master/README.CN.md/)

## Introduce
Sprite Smith loader is a tool for automatically generating CSS Sprites. You can use it in webpack. It will find all the_ sprite.png End picture and auto generate CSS Sprites and modify the corresponding CSS code.

supports **CSS**、**SASS**、**LESS**.

The picture should be in PNG format (do not directly change the picture suffix to PNG)
## Getting Started
To begin, you'll need to install sprite-smith-loader:

```
npm install --save-dev sprite-smith-loader remove-file-webpack-plugin
```
Then add the plugin to your webpack config. And don't forget to add the file-loader or url-loader. 

For example:

**webpack.config.js**

```
// add remove-file-webpack-plugin to clean sprites folders
const RemoveFileWebpackPlugin = require('remove-file-webpack-plugin'); 

module.exports = {
  module: {
    rules: [
        {
            test: /\.(png|jpe?g|gif)$/i,
            loader: 'file-loader',
            options: {
                outputPath: 'images',
            },
        },
        {
            test: /\.css$/i,
            use: ['style-loader', 'css-loader','sprite-smith-loader'],
        },
    ],
  },
  plugins: [
    new RemoveFileWebpackPlugin({
        dirNames:["sprites"]
    })
  ],
};
```
with SASS 

```
const RemoveFileWebpackPlugin = require('remove-file-webpack-plugin'); 

module.exports = {
  module: {
    rules: [
        {
            test: /\.(png|jpe?g|gif)$/i,
            loader: 'file-loader',
            options: {
                outputPath: 'images',
            },
        },
        {
            test: /\.(sass|scss|css)/,
            use: ['style-loader', 'css-loader','sprite-smith-loader',"sass-loader"],
        }
    ],
  },
  plugins: [
    new RemoveFileWebpackPlugin({
        dirNames:["sprites"]
    })
  ],
};

```

## Usage
Change the picture name to_ sprite.png  End and reference it in CSS
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
After the CSS Sprites is generated, the loader will modify the background attribute in the CSS. In order to accurately calculate the converted background attribute, please follow the following specifications:

Css attribute name | isRequired | Description
---|---|---
height | true| Unit: PX
width | true| Unit: PX
background-size | true| Unit: PX
background | true| Include image，position，repeat
background-image | true| Included in background，picture name with _ sprite.png ending
background-position | false| Included in background，format of value PX PX
background-repeat | false| Included in background，must be no-repeat

## Other
If you have any questions, please create an issue on [GitHub](https://github.com/sunft1996/sprite-smith-loader/).

## License

[MIT](https://github.com/sunft1996/sprite-smith-loader/blob/master/LICENSE)