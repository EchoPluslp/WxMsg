const app = getApp()

Page({
    data: {

    },
  doRegist : function(data){
      var formObject = data.detail.value;
      var username   = formObject.username;
      var password   = formObject.password;
      if(username.length == 0 || password.length == 0){
        wx.showToast({
          title    : '用户名或者密码不能为空',
          duration : 3000,
          icon     : "none"
        })
      }else{
        wx.showLoading({
          title: '请稍等...',
        });
        var serverUrl = app.serverUrl;
        var userInfo = app.getGlobalUserInfo();
         wx.request({
           url    : serverUrl+'/regist',
           method : "POST",
           data   :{
             username : username ,
             password : password
           },
           header :{
             'content-type' : 'application/json'
           },
           success : function(res){
             console.log(res);
             wx.hideLoading();
             if(res.data.status == 200){
               wx.showToast({
                 title     : '用户注册成功',
                 duration  : 3000,
                 icon      : "none",
               })
               userInfo = res.data.data;
             } else if (res.data.status == 500){
               wx.showToast({
                 title: res.data.msg,
                 duration: 3000,
                 icon: "none",
               })
             }
           }
         })
      }
  },
  goLoginPage : function(data){
    wx.navigateTo({
      url: '../userLogin/login',
    })
  }
})