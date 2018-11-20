
const app = getApp()

Page({
  data: {
      faceUrl : "../resource/images/noneface.png",
      isMe: true
  },
  onLoad : function(params){
      var me = this;
      var serverUrl = app.serverUrl;
      var userInfo = app.getGlobalUserInfo();
     wx.showLoading({
      title: '请稍等...',
      });
      wx.request({
        url: serverUrl+'/user/query?userId='+userInfo.id,
        method : "POST",
        header :{
          'content-type': "application/json"
        },
        success : function(res){
          wx.hideLoading();
          var user = res.data.data;
          console.log("user"+user)
          var faceUrl = "../resource/images/noneface.png";
          if (user.faceImage != null || user.faceImage != undefined || user.faceImage!=''){
            faceUrl = serverUrl + user.faceImage;
          }
          me.setData({
              faceUrl         : faceUrl,
            fansCounts        : user.fansCounts,
            followCounts      : user.followCounts,
            receiveLikeCounts : user.receiveLikeCounts,
            nickname          : user.nickname
          });
        }
      })
  },
  logout : function(){
      var userInfo  = app.getGlobalUserInfo();
      var serverUrl = app.serverUrl;
      wx.showLoading({
        title: '请稍等...',
      });
      wx.request({
        url    : serverUrl + '/logout?userId=' + userInfo.id,
        method : "POST",
        header : {
          'content-type' : "application/json"
          },
          success : function(res){
            wx.hideLoading();
            if(res.data.status == 200){
              //注销成功
              wx.showToast({
                title    : '注销成功',
                duration : 3000,
                icon     : 'success'
              });
            //  app.userInfo = null;
              wx.removeStorageSync("userInfo");
            //fixme 修改app的userInfo表达方式
              app.setGlobalUserInfo(null);
              wx.navigateTo({
                url: '../userLogin/login',
              })
            }
          }  
      })
  },
  changeFace: function () {
    // console.log("Change Face..............................");
    var me = this;
    wx.chooseImage({
      count      : 1,
      sizeType   : ['compressed'],
      sourceType : ['album'], //从相册选中
      success    : function(res) {
        var serverUrl = app.serverUrl
        var tempFilepaths = res.tempFilePaths;
        wx.showLoading({
          title: '上传中',
          duration: 3000,
          icon: "none"
        }),
        wx.uploadFile({
          url: serverUrl + '/user/uploadFace?userId=' + app.getGlobalUserInfo().id,
          filePath  : tempFilepaths[0],
          name      : 'files',
          header    : {
              'content-type' : 'application/json' //默认值
          },
          success(res) {
            var data = res.data;
            data = JSON.parse(data);
            if(data.status == 200){
            wx.hideLoading();
            // console.log(data);
            wx.showToast({
              title     : '上传成功',
              duration  : 1000,
              icon      : "success"
            });
            var imageUrl = data.data;
            me.setData({
              faceUrl : serverUrl + imageUrl
            });
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
  },
  uploadVideo : function(){
    var me = this;
    wx.chooseVideo({
      sourceType : ['album'],
      success : function(res){
        console.log(res);
        var duration    = res.duration;
        var height      = res.height;
        var tempFilePath = res.tempFilePath;
        var thumbTempFilePath = res.thumbTempFilePath;
        var tmpHeight    = res.height;
        var tmpWidth     = res.width;
        var tmpVideoUrl  = res.tempFilePath;
        var temCoverUrl =  res.thumbTempFilePath;

        if(duration > 16){
          wx.showToast({
            title: '视频时间不能超过15秒...',
            duration : 2500,
            icon : "none"
          })
        } else if(duration < 1){
          wx.showToast({
            title: '视频时间太短了...',
            duration: 2000,
            icon: "none"
          })        
          }else{
              //todo 选择bgm页面]
              wx.navigateTo({
                url: '../chooseBgm/chooseBgm?duration='+duration
                  + '&tmpHeight='   + tmpHeight
                  + '&tmpWidth='    + tmpWidth
                  + '&tmpVideoUrl=' + tmpVideoUrl
                  + '&temCoverUrl=' + temCoverUrl
                  + '&tmpHeight='   + tmpHeight,
              })
              
          }
      }
    })  
  }
})
