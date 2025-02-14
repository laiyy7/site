(function () {
  function loadProperties (language) {
    jQuery.i18n.properties({
      name: 'i18n',
      path: '../i18n/',
      cache: true,
      language: language,
      mode: 'map',
      callback: function () {
        var insertEle = $("[data-i18n]");
        insertEle.each(function () {
          try {
            if (typeof ($(this).attr("placeholder")) != "undefined") {
              $(this).attr("placeholder", $.i18n.prop($(this).data('i18n')));
            } else if (typeof ($(this).attr("button")) != "undefined") {
              $(this).attr("button", $.i18n.prop($(this).data('i18n')));
            } else {
              $(this).text($.i18n.prop($(this).data('i18n')));
            }
          } catch (e) {
            console.log("key不存在，请在配置文件中配置对应的key：" + $(this).data('i18n'));
          }
        });
      }
    });
  };

  // 根据语言替换生态合作伙伴图片
  const banners = [
    {
      id: '#banner1',
      img: './assets/image/banner/banner1.png',
      img_en: './assets/image/banner/banner1_en.png'
    },
    {
      id: '#banner2',
      img: './assets/image/banner/banner2.jpg',
      img_en: './assets/image/banner/banner2.jpg'
    },
    {
      id: '#banner3',
      img: './assets/image/banner/banner.png',
      img_en: './assets/image/banner/banner_en.png'
    }
  ]

  // 初始化
  $(document).ready(function () {
    let language = window.localStorage.getItem('xj_lang') || 'zh';
    window.localStorage.setItem('xj_lang', language)
    loadProperties(language);
    $('#lang').text(language === 'zh' ? 'English' : '中文')
    $('#lang').attr('data-lang', language === 'zh' ? 'zh' : 'en')
    banners.forEach(item => {
      if ($(item.id)) {
        if (language === 'en') {
          $(item.id).attr('src', item.img_en)
        } else {
          $(item.id).attr('src', item.img)
        }
      }
    })
  });

  // 语言切换
  $('#language-click').click(function () {
    if ($('#lang').attr('data-lang') === 'zh') {
      window.localStorage.setItem('xj_lang', 'en')
      window.location.reload()
    } else {
      window.localStorage.setItem('xj_lang', 'zh')
      window.location.reload()
    }
  })
})()
