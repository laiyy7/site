$(document).ready(function () {
  if (window.localStorage.getItem('xj_lang') === 'zh') {
    $('#changSize').removeClass('en_size')
  } else {
    console.log($('#changSize'))
    $('#changSize').addClass('en_size')
  }
});

$('#lang,#icon').click(function () {
  if (localStorage.getItem('xj_lang') === 'zh') {
    $('title').text('SuperADS')
    $('#changSize').addClass('en_size')
  } else {
    $('title').text('广州线条信息科技有限公司')
    $('#changSize').removeClass('en_size')
  }
})