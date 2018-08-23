/*
 * 该文件用于提供页面的自动翻译功能
 * */


var SwitchLanguage = function (props) {
  // 用于收集语料资源
  var localResources = {}
  // 可以使用的标签
  var class_attribute = 'i18n-class';
  var img_attribute = 'i18n-img';
  var content_attribute = 'i18n-content';
  var placeholder_attribute = 'i18n-placeholder';
  var title_attribute = 'i18n-title';

  // 国际化对象
  this.di18n = {}
  // 执行语言
  this.language = props?props.language:'' || 'zh'
  // 是否开发状态，控制台打开需要添加的语料资源
  this.dev = props?props.dev:'' || false
  // 当前页面路径
  this.pages = window.location.pathname;

  // 进行侦测的标签
  this.tags = ['span', 'li', 'a', 'th', 'p'];
  // 进行检测，需要替换的class里的内容
  this.classContent = ['greenBtn']
  // 需要替换的clasName的class
  this.className = ['bChange']

  // 内容匹配的正则
  this.reg = /^(\s|(&nbsp;))*(?![^\u4e00-\u9fa5]+$)(&gt;)?([()\w\s\u4e00-\u9fa5]|(&nbsp;))+(\s|(&nbsp;))*(:|：)?(\s|(&nbsp;))*$/;
  this.init = function () {
    if (!this.resource) {
      return false
    };
    this.content();
    this.img();
    this.title();
    this.placeholder();
    this.iclass();

    if (this.dev) {
      console.log('还需要添加的资源：', JSON.stringify(localResources));
    }
    this.di18n = new DI18n({
      locale: this.language, // 语言环境
      isReplace: true, // 是否开启运行时功能(适用于没有使用任何构建工具开发流程)
      messages: this.resource // 语言映射表  
    })
    return true
  }
  this.isHave = function (resource, language, innerHTML) {
    var flag = false  
    $.each(resource[language], function (i, data) {
      if (i === innerHTML.replace(/&nbsp;/g, '')) {
        flag = true
      }
    })
    return flag
  }


  this.getLanguageResource = function (pages) {
    var commonResource, langResource = {},
      pageResource = {},
      commonAjaxErr,pagesAjaxErr;
    // 调取公用语言资源
    $.ajax({
      url: './commonResource.json',
      async: false,
      success: function (data) {
          if(typeof data === 'string'){
              commonResource = JSON.parse(data)
            }else{ 
              commonResource = data
            }
      },
      error: function (err) {
        commonAjaxErr = err
      }
    })
    // 调取该页面json文件
    $.ajax({
      url: pages.replace('.html', '.json'),
      async: false,
      success: function (data) {
          if(typeof data === 'string'){
           pageResource = JSON.parse(data)
            }else{ 
            pageResource = data
            }
      },
      error: function (err) {
        pagesAjaxErr = err
      }
    })

    if (!commonAjaxErr) {
      // 合并公用和当前page资源 
      langResource = JSON.parse(JSON.stringify(commonResource))
      if(!pagesAjaxErr){
        if (pageResource && pageResource[this.language]) {
          $.each(langResource, function (language, lSourse) {
            $.each(pageResource[language], function (index, data) {
              langResource[language][index] = data
            })
          })
        }
      }
    } else {
      langResource = false
    }
    return langResource

  }
  this.resource = this.getLanguageResource(this.pages);
  this.content = function () {
    var _this = this;
    $.each(_this.tags, function (index, value) {
      $(value).each(function (_index, _value) {
        contenTrans(_index, _value)
      })
    })
   //  class 名内容翻译  classContent
   $.each(_this.classContent,function(index, value){
    $("."+value).each(function (_index, _value) {
      contenTrans(_index, _value)
    })
   })
  function contenTrans(_index, _value){
    var innerHTML = $.trim(_value.innerHTML)
    if (innerHTML.replace(/[\s\/]/g, '_').match(_this.reg) !== null) {
      if (!_this.isHave(_this.resource, _this.language, innerHTML) && _this.dev) {
        console.log(" => 已匹配到的汉字:" + innerHTML.replace(/&nbsp;/g, ''));
        // 仅添加资源路库没有的资源
        if (!localResources[_this.language]) localResources[_this.language] = {}
        localResources[_this.language][innerHTML.replace(/&nbsp;/g, '')] = innerHTML.replace(/&nbsp;/g, '')
      }
      $(_value).attr(content_attribute, innerHTML.replace(/&nbsp;/g, ''));
    }
  }

  }
  this.placeholder = function () {
    var _this = this
    $("[placeholder]").each(function () {
      console.log('lllll');
      
      if ($(this).attr('placeholder').replace(/[\s\/]/g, '_').match(_this.reg) !== null) {

        // 仅添加资源路库没有的资源
        if (!_this.isHave(_this.resource, _this.language, $(this).attr('placeholder')) && _this.dev) {
          console.log(" => 已匹配到的汉字:" + $(this).attr('placeholder'));

          if (!localResources[_this.language]) localResources[_this.language] = {}
          localResources[_this.language][$(this).attr('placeholder')] = $(this).attr('placeholder')
        }
        $(this).attr(placeholder_attribute, $(this).attr('placeholder'));
      }
    })
  }
  this.iclass = function () {
    var _this = this

    $.each(_this.className, function (i, className) {
      $("." + className).each(function () {
        var ele = this;
        if (_this.dev) {
          console.log(" => 已匹配到的class:", className);
        }

        var classes = $(this).attr('class').split(' ');
        var hasI18;
        $.each(classes, function (i, data) {
          if (data.match(className + '_')) {
            $(ele).removeClass(data)
          }
        })
        $(ele).attr(class_attribute, className + "_" + _this.language);
      })
    })
  }
  this.img = function () {
    var _this = this
    $("img.i18n_img").each(function () {
      if (_this.dev) {
        console.log(" => 已匹配到的图片:" + $(this).attr('src'));
      }

      var hisSrcArr = $(this).attr('src').split(".");
      if (hisSrcArr[hisSrcArr.length - 2].match('_')) {
        hisSrcArr[hisSrcArr.length - 2] = hisSrcArr[hisSrcArr.length - 2].split("_")[0] + "_" + _this.language
      } else {
        hisSrcArr[hisSrcArr.length - 2] = hisSrcArr[hisSrcArr.length - 2] + "_" + _this.language
      }
      var enSrc = hisSrcArr.join('.')
      $(this).attr(img_attribute, enSrc);
    })
  }
  this.title = function () {
    var _this = this
    $("[title]").each(function () {
      if ($(this).attr('title').match(_this.reg) !== null) {

        // 仅添加资源路库没有的资源
        if (!_this.isHave(_this.resource, _this.language, $(this).attr('title')) && _this.dev) {
          console.log(" => 已匹配到的汉字:" + $(this).attr('title'));
          if (!localResources[_this.language]) localResources[_this.language] = {}
          localResources[language][$(this).attr('title')] = $(this).attr('title')
        }
        $(this).attr(title_attribute, $(this).attr('title'));
      }
    })
  }
 this.setLocale = function(language,fn){
     this.language = language
     this.init()
     this.di18n.setLocale(language,function(){
        fn?fn():''
  })
 }
 this.$html = function(html){

return   this.di18n.$html(html)
 } 
}
var di18n;
// var di18n = new SwitchLanguage({language:'zh',dev:true}) 或 new SwitchLanguage()