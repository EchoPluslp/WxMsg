//app.js
App({
  //如果使用手机4g进行调试时，我们需要配置内网穿透的地址
  //如果在同一个网段时，则配置本机地址
  serverUrl: "http://192.168.191.1:8081",
  userInfo: null,
  
//设置本地User缓存
  setGlobalUserInfo: function (user) {
    wx.setStorageSync("userInfo", user);
  },

  getGlobalUserInfo: function () {
    return wx.getStorageSync("userInfo");
  },
  
  reportReasonArray: [
    "色情低俗",
    "政治敏感",
    "涉嫌诈骗",
    "辱骂谩骂",
    "广告垃圾",
    "诱导分享",
    "引人不适",
    "过于暴力",
    "违法违纪",
    "其它原因"
  ]
})