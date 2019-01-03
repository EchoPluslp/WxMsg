const app = getApp()

Page({
  data: {
  },

  onLoad: function (params) {
    var me = this;
    var redirectUrl = params.redirectUrl;
    // debugger;
    //获取从videoInfo页面传过来的url
    if (redirectUrl != null && redirectUrl != undefined && redirectUrl != '') {
      redirectUrl = redirectUrl.replace(/#/g, "?");
      redirectUrl = redirectUrl.replace(/@/g, "=");
      me.redirectUrl = redirectUrl;
    }
    // console.log(params);
    // debugger;
  },

  // 登录  
  doLogin: function (data) {
     var me = this;
     var formObject = data.detail.value;
     var username   = formObject.username;
     var password   = formObject.password;
  // debugger;
     if(username == null || password == null){
       wx.showToast({
         title    : '用户名和密码不能为空',
         duration : 3000,
         icon     : "none"
       })
     }else{
       wx.showLoading({
         title: '请稍等...',
         mask : true
       });
       var serverUrl = app.serverUrl;
      //  var currentUser = app.getGlobalUserInfo();
      wx.request({
        url    : serverUrl+'/login',
        method : "POST",
        data   : {
          username : username,
          password : password
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success : function(res){
          //console.log(res.data);
          var currentData = res.data;
          wx.hideLoading();
          if(currentData.status == 200){
            //登录成功
            wx.showToast({
              title: '登录成功',
              duration: 1500,
              icon: "success"
            }),
            //用户信息存入全局的userInfo中
//             app.userInfo = res.data.data;
//fixme 使用本地缓存在设置app的userInfo
              app.setGlobalUserInfo(res.data.data);
            //console.log(res.data);
            // console.log(app.userInfo);
            //获取到重定向来的url
            var redirectUrl = me.redirectUrl;
            // console.log(redirectUrl);
            // debugger;
            if (redirectUrl != null && redirectUrl != undefined && redirectUrl != '') {
              wx.redirectTo({
                url: redirectUrl,
                //重定向到指定的url
              })
            } else {
              wx.redirectTo({
                url: '../mine/mine',
              })
            }
          }else if(currentData.status == 500){
            //登录失败
            wx.showToast({
              title: currentData.msg,
              duration: 1500,
              icon: "none"
            })
          }
        }
      });
     }
  },

  goRegistPage:function() {
    wx.redirectTo({
      url: '../userRegist/regist',
    })
  }
})