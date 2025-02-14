window.onload = function () {
  function getQueryString (name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
      return unescape(r[2]);
    }
    return '';
  }

  // 生成唯一的用户 ID
  let userCookieId = localStorage.getItem('userCookieId')
  if (userCookieId === null) {
    const userId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    userCookieId = userId
    localStorage.setItem('userCookieId', userId)
  }

  const data = {
    "url": window.location.href,
    userId: 0,
    inviteCode: getQueryString('invite_code'),
    pageTitle: 'SuperADS',
    pageName: 'SuperADS',
    ref: '',
    props: {
    }
  };

  const pageEventData = {
    userCookieId: userCookieId,
    eventName: 'visit_invite_page',
    "url": window.location.href,
    eventData: {},
    userId: 0,
    inviteCode: getQueryString('invite_code'),
    pageTitle: 'SuperADS',
    pageName: 'SuperADS',
    ref: '',
    props: {
    }
  }

  fetch('https://earn.superads.cn/gateway-api/sync/pageEvent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'APPKEY': 'LZXDDImlLxXCBLYtafOshIw5KxWY7iG0wjsSDGPRcdLLKwofqf3JWeJfPL2u9DImsBFn4HAWAMvb5kWnI5AH',
    },
    body: JSON.stringify(pageEventData),
  })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch((error) => {
      console.error('Error:', error);
    });

  fetch('https://earn.superads.cn/gateway-api/sync/pageView', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'APPKEY': 'LZXDDImlLxXCBLYtafOshIw5KxWY7iG0wjsSDGPRcdLLKwofqf3JWeJfPL2u9DImsBFn4HAWAMvb5kWnI5AH',
    },
    body: JSON.stringify(data),
  })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch((error) => {
      console.error('Error:', error);
    });
};