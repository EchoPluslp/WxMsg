const app = getApp()
Page({
  onReady: function (e) {
    // 使用 wx.createAudioContext 获取 audio 上下文 context
    this.audioCtx = wx.createAudioContext('myAudio')
  },
  data: {
    bgmList : [],
    videoParams : {}
  },

    onLoad: function (data) {
      console.log(data);
        var me  = this;
        me.setData({
          videoParams : data
        });
        var serverUrl = app.serverUrl;
        wx.showToast({
          title: '请稍等......',
          icon: "none",
          duration : 2300
        })
        wx.request({
          url:  serverUrl + '/bgm/bgmList',
          method   : "POST",
          header   : {
            'content-type': "application/json"
          },
          success  : function(res){
            wx.hideLoading();
            if (res.data.status == 200){
              var bgmList = res.data.data;
              console.log(bgmList);
              me.setData({
                bgmList: bgmList
              });
            }
          }
        })
    },

//点击上传按钮时
    upload: function(e) {
        var me = this;
        console.log(me);
      var bgmId = e.detail.value.bgmId;
      var desc = e.detail.value.desc;
      //参数获取
      var duration = me.data.videoParams.duration;
      var tmpHeight = me.data.videoParams.tmpHeight;
      var tmpWidth = me.data.videoParams.tmpHeight;
      var tmpVideoUrl = me.data.videoParams.tmpVideoUrl;
      var temCoverUrl = me.data.videoParams.temCoverUrl;
      //上传短视频
      var serverUrl = app.serverUrl;
      wx.showLoading({
        title: '上传中。。。',
        icon: "none"
      });
      var userInfo = app.getGlobalUserInfo();
      wx.uploadFile({
        url: serverUrl + '/video/upload',
        formData :{
          userId: userInfo.id,
          bgmId  : bgmId,
          desc   : desc,
          videoSeconds : duration,
          videoWidth : tmpWidth,
          videoHeight : tmpHeight
        },  
        filePath: tmpVideoUrl,
        name: 'file', //与后端file文件接口对应
        header: {
          'content-type': 'application/json' //默认值
        },
        success:function(res) {
          wx.hideLoading();
         var data = JSON.parse(res.data);
         if(data.status == 200){
           //上传视频封面！！！
         wx.showToast({
           title: '上传成功',
           icon : "success"
         });
          var videoId = data.data; //视频上传成功时，后端会在data中设置videoId
          //获取user本地缓存
          var userInfo = app.getGlobalUserInfo();
          wx.uploadFile({
             url: serverUrl + '/video/uploadCover',
             formData: {
               userId: userInfo.id,
               videoId: videoId
             },
             filePath: temCoverUrl,
             name: 'file', //与后端file文件接口对应
             header: {
               'content-type': 'application/json' //默认值
             },
             success(res) {
               var data = JSON.parse(res.data);
               wx.hideLoading();
               if(data.status == 200){
                 wx.showToast({
                   title: '上传成功~~~',
                   icon : "success"
                 })
               };
               wx.navigateBack({
                 delta : 1
               })
              //  wx.showToast({
              //    title: "上传成功...",
              //    icon : "success"
              //  }),
              //    wx.navigateBack({
              //      delta : 1
              //    })
              //  wx.hideLoading();
              //  var data = JSON.parse(res.data);
              //  console.log("进入上面封面流程");
              //  console.log(data);
              //  if (data.status == 200) {
              //    wx.showToast({
              //      title: '上传成功...',
              //      duration: 1500,
              //      icon: "success"
              //    });   
              //    wx.navigateBack({
              //      delta : 1
              //    })
              //  } else if (data.status == 500) {
              //    wx.showToast({
              //      title: data.msg,
              //      duration: 1000,
              //      icon: "none"
              //    })
              //  }
             },
           })
         }else if(data.status == 500){
           wx.showToast({
             title: data.msg,
             duration: 1000,
             icon: "none"
           })
         }
        },
      })
    },
})



