 ## 基础原理使用
di18n-translate 实现国际化翻译，建议先了解一下       di18n-translate，可以 npm 进行下载。

目前版本基于 di18n.js 进行简单封装，实现老旧中文项目快速实现国际化，规划中可实现配置文件中多国（不仅限于中英）语言随意切换。

di18n-translate 在文件且没有使用任何构建工具开发流程下工作原理 ： 

 + html 标签上预先加上特定标识  [i18n-class,i18n-img,i18n-content, i18n-placeholder, i18n-title] 目前支持上述5种。然后执行  DI18n 对象进行对应资源替换。
 + 本项目为适用老旧中文项目且兼容ie8及以下，适当修改了源码

di18n_inspect  原理 ：

+ 依赖于页面加载完全
+ 扫描页面可见 html 标签，按照特定规则，符合规则的进行添加 i18n 的属性标识  [i18n-class,i18n-img,i18n-content, i18n-placeholder] ，再执行 DI18n 对象。
+ SwitchLanguage 函数对象中 核心属性及方法有： 
  + language（string，默认‘zh’，需要切换的语言）
  + init（function，执行整个页面扫描及翻译）
  + setLocale（function(language,fn)，切换语言，且执行整个页面扫描及翻译）
  + dev （boolean，默认false，是否开启开发模式，在浏览器调试界面，打印需要添加的资源文件，半自动收集资源文件）
  + tags （array，匹配的标签）
  + classContent （array，特定class里<可不遵从tags规则，但遵从reg匹配规则>文字内容匹配）
  + className （array，需要国际化的class名，再原class名加对应语言后缀，如：bChange 会 加上class 名 ‘bChange_en’ 或 ‘bChange_zh’,请提前准备好对应样式）
  + reg （正则表达式，匹配符合规则的含中文字符的文字）。大体核心匹配规则为：tags或classContent中不含子html标签，至少含一个中文且不含限制的特殊字符。
  + getLanguageResource （function，从特定位置，公共json文件和对应私有json文件中获取翻译资源）。因为获取时运用了jquery的$.ajax 获取json文件，所以，该项目（含demo）必须在服务器下运行。commonResource.json 获取位置请根据实际项目资源地址进行修改。私有json文件目前放置地址同当前页面，如需个性化设置，请自行更改。
 ## 目录结构:
js
 + di18n.min.js 或 di18n.js
 + jquery.js
 + di18n_inspect.js 
 + commonResource.json

page
 + index.html
 + index.json (该文件为对应页的数据，按需添加) 
 ## 源码示例
 兼容ie低级别浏览器
 ```html
 <!--[if gte IE 8]>
    <script type="text/javascript" src="https://cdn.bootcss.com/es5-shim/4.5.10/es5-shim.min.js"></script>
    <script type="text/javascript" src="https://cdn.bootcss.com/es5-shim/4.5.10/es5-sham.min.js"></script>
<![endif]-->
 ```
 创建国际化对象，并初始化，SwitchLanguage 函数参数里为对象，可选传某一个，或不传。language 默认 ‘zh'， dev 默认为 false
 ```js
di18n = new SwitchLanguage({language:'en',dev:true})
di18n.init()
 ```
 设置语言，进行各语言间切换，保证资源文件对应语言资源的存在，如果没有资源，默认显示中文
 ```js
 di18n.setLocale('en',function(){
   // 需要做的事情，第二个参数是函数可不传
   })
 ```

 ## 注意事项
 + commonResource.json 文件目前配置为必须含有内容，且符合json规则。否则报错，整个国际化功能失效，且可能影响页面正常功能。页面私有json按需求选添加
 + 请确保翻译的页面元素全部加载完成后再执行 init()　或　setLocale()，否则可能未翻译或翻译不全
 + 需要翻译的图片，需在img标签上加上 i18n_img （class名），并确认原图片位置有新的翻译图片，如 "../images/public/loginbtn.jpg" 对应位置应该有对应翻译语种图片”../images/public/loginbtn_en.jpg“（英文为例）。中文图片路径也同样需要添加图片语言后缀。否则将无法获取图片资源。
 + 需要翻译的元素背景图片。此类为class切换，例如带放大镜的查询按钮，为引入class名queryBtn而改变背景。除此外还有‘uploadBtn’等上传按钮组。需要在对象属性className的数组里添加上需要切换的class名即可，例：this.className = ['bChange','uploadBtn','backgreenBtn']。添加完之后，确保新class 里背景样式是否修改，如果样式中含背景图片，确认路径下图片资源是否到位。
 + 页面出现中文字，你想被翻译却没有翻译的，请检查其标签内字符是否符合匹配规则或资源文件中是否添加资源文件
 + 开发阶段建议开启dev以更方便获取语言资源


 ## 源di18n翻译函数，了解基础翻译原理

## How to

```javascript
  const DI18n = require('di18n-translate')
  const di18n = new DI18n({
    locale: 'en',       // 语言环境
    isReplace: false,   // 是否开启运行时功能(适用于没有使用任何构建工具开发流程)
    messages: {         // 语言映射表
      en: {
        你好: 'Hello, {xl}'
      },
      zh: {
        你好: '你好, {xl}'
      }
    }
  })
```

  di18n有2个翻译方法: `$t`, `$html`


```javascript
  // 带参数
  di18n.$t('你好', {person: 'xl'})    
  // 输出 Hello, xl
```

字符串拼接的`dom`中使用`${locale}`表示语言环境，`$t()`标识需要翻译的字段，用法如下:
```javascript
let tpl = '<div class="wrapper ${locale}">' +
    '<img src="/images/${locale}/test.png">' +
    '<p>$t("你好")</p>' + 
    '</div>'

let str = di18n.$html(tpl)

// 字符串替换后输出字符串str: 
  <div class="wrapper en">
    <img src="/images/en/test.png">
    <p>Hello</p>
  </div>

// 最后再将这个dom字符串传入到页面当中去
document.querySelector('.box-wrapper').innerHTML = str
```


手动设置语言版本，并更新页面内容
```javascript
  di18n.setLocale('en', function () {
    // 回调函数
  })
```


