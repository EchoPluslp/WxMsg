const app = getApp()

Page({
    data: {
        reasonType: "请选择原因",
        reportReasonArray: app.reportReasonArray,
        publishUserId:"",
        videoId:""
    },

    onLoad:function(params) {
        var me = this;
        me.setData({
          publishUserId: params.publisherId,
          videoId: params.videoId
        });
        
    },

    changeMe:function(e) {
      debugger;
        var me = this;
        var index = e.detail.value;
        var reportType = app.reportReasonArray[index];
      me.setData({
        reasonType: reportType
      });
    },

    submitReport:function(e) {
      var me = this;
      var user = app.getGlobalUserInfo();
      var currentUserId  = user.id;
      var index = e.detail.value.reasonIndex;
      var reasonContent = e.detail.value.reasonContent;

      if(reasonContent == null || reasonContent == '' || reasonContent == undefined){
        wx.showToast({
          title: '请选择理由...',
          icon : 'none',
          duration:1500
        })
        return ;
      };
      var serverUrl = app.serverUrl;
        wx.request({
          url: serverUrl +'/user/reportUser',
          method:"POST",
          data:{
            dealUserId:me.data.publishUserId,
            dealVideoId: me.data.videoId,
            title: app.reportReasonArray[index],
            content: reasonContent,
            userid: currentUserId
          },
          header: {
            'content-type': "application/json",
            'headerUserId': user.id,
            'headerUserToken': user.userToken
          },
          success:function(res){
            wx.showToast({
              title: res.data.data,
              icon:"none",
              duration:1600,
              success : function(){
                wx.navigateBack();
              }
            })
          }
        })    
    }
    
})
