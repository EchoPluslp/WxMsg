var videoUtil = require('../../utils/videoutil.js')

const app = getApp()


Page({
  data: {
    appImage: "http://119.23.242.242/",
    cover:"cover",
    videopath:"",
    videoId: "",
    videoInfo : {},
    userLikeVideo: true ,
    serverUrl:"",
    commentFocus:false,
    publisher : {},
    commentsPage:1,
    commentsTotalPage:1,
    commentsList:[]
  },

//video上下文对象 
  videoCtx: {},

  //页面加载时触发
  onLoad: function (params) {    
    var me = this;
    me.videoCtx = wx.createVideoContext("myVideo", me);
    // debugger;
    // console.log(params.videoInfo);
    //获取index页面传入的参数
    var videomsg = JSON.parse(params.videoInfo);
    // console.log(videomsg);
    var src = app.appImage + videomsg.videoPath;
    var videoHeight = videomsg.videoHeight;
    var videoWidth = videomsg.videoWidth;
    var serverUrl = app.serverUrl;
    var user = app.getGlobalUserInfo();
    var cover = "cover";
    // debugger;
    if(videoWidth > videoHeight){
      cover = "";
    }
    // console.log(videomsg);
    me.setData({
      videoId: videomsg.id,
      videopath: src,
      videoInfo: videomsg,
      cover : cover
    });

    var loginUserId = "";
    if (user != null || user != undefined || user != ''){
      loginUserId = user.id;
    }
    //获取视频所属用户的详情信息
    wx.request({
      url: serverUrl + '/user/query/publisher?loginUserId=' + loginUserId + "&videoId=" + videomsg.id+
      "&publisherId="+videomsg.userId,
      method:"POST",
      success:function(res){
        console.log(res);
        var params = res.data.data;        
        me.setData({
          serverUrl: serverUrl,
          publisher: params.publisher,
          userLikeVideo : params.userLikeVideo,
        });
      }
    })
    me.getCommentsList(1);
  },

//页面完成渲染时触发，
  onShow: function () {
    var me = this;
    //播放
    me.videoCtx.play();
  },

//页面隐藏时加载！！！即跳转到搜索页面
  onHide: function () {
    var me = this;
    me.videoCtx.pause();
  },

  showSearch: function () {
    wx.navigateTo({
      url: '../searchVideo/searchVideo',
    })
  },

  showPublisher: function () {
      var me = this;
      var user = app.getGlobalUserInfo();
      var videoInfo = me.data.videoInfo;
      var redirectUrl = '../mine/mine#publisherId@' + videoInfo;
      if(user === null ||user === undefined || user === ''){
        wx.redirectTo({
          url: '../userLogin/login?redirectUrl=' + redirectUrl,
        })
      }else{
        wx.navigateTo({
          url: '../mine/mine?publisherId='+ videoInfo.userId,
        })
      }
  },


  upload: function () {
    var me = this;
    var videoInfo = JSON.stringify(me.data.videoInfo);
    
    var user = app.getGlobalUserInfo();
    // debugger;
    //因为在跳转的时候，redierctUrl会直接与跳转url中都有？与=符号
    //所以会默认使用左边的？=，也就是说该url？之后的数值都会被过滤
    var redirectUrl = '../videoinfo/videoinfo#videoInfo@' + videoInfo;
    if(user == null||user == undefined||user == ''){
      wx.redirectTo({
        //上传界面，页面拦截
        url: '../userLogin/login?redirectUrl=' + redirectUrl,
      })
    }else{
      //调用上传功能的方法
      videoUtil.uploadVideo();
    }
  },

  showIndex: function (){
      wx.redirectTo({
        url: '../index/index',
      })
  },

  showMine: function () {
    var me = this;
    var user = app.getGlobalUserInfo();
    var videoInfo = me.data.videoInfo;
    // console.log(videoInfo);
    var redirectUrl = '../videoinfo/videoinfo#videoInfo@' + videoInfo;
    if(user == null || user ==undefined||user == ''){
      //页面拦截跳转- 如果用户已经注销了，则执行该操作时，跳转到登录界面
        wx.redirectTo({
          url: '../userLogin/login?redirectUrl=' + redirectUrl,
        });
    }else{
      wx.navigateTo({
        url: '../mine/mine',
      });
    }
  },

  likeVideoOrNot: function () {
    var userInfo = app.getGlobalUserInfo();
    var me = this;
    var videoInfo = me.data.videoInfo;
    if (userInfo == null || userInfo == undefined || userInfo == '') {
      //页面拦截跳转- 如果用户已经注销了，则执行该操作时，跳转到登录界面
      wx.navigateTo({
        url: '../userLogin/login',
      })
    } else {
        //已经登录成功，则可以与后端进行交互
        // debugger;
      var userLikeVideo = me.data.userLikeVideo;
      var serverUrl = app.serverUrl;
      var url = '/video/userLike?userId=' + userInfo.id + "&videoId=" + videoInfo.id + "&videoCreateId="+
      videoInfo.userId;
        if(userLikeVideo){
          url = '/video/userUnLike?userId=' + userInfo.id + "&videoId=" + videoInfo.id + "&videoCreateId=" +
            videoInfo.userId;
        }
        wx.showLoading({
          title: '...',
        }),
        wx.request({
          url: serverUrl + url,
          method : "POST",
          header: {
            'content-type': "application/json",
            'headerUserId': userInfo.id,
            'headerUserToken': userInfo.userToken
          },
          success : function(res){
            wx.hideLoading();
            me.setData({
              userLikeVideo : !userLikeVideo,
            });
          }
        })
    }
  },

  shareMe: function() {
    var me = this;
      wx.showActionSheet({
        itemList: ['下载到本地','举报当前视频','分享到朋友圈','分享到QQ空间'],
        success:function(res){
          if(res.tapIndex == 0){
              //下载
            wx.showLoading({
              title: '下载中....',
            })
          wx.downloadFile({
         
            url: app.serverUrl+me.data.videoInfo.videoPath,
            success : function(res){
              if(res.statusCode === 200){
                wx.saveVideoToPhotosAlbum({
                  filePath: res.tempFilePath,
                  success:function(res){
                    wx.hideLoading();
                    wx.showToast({
                      title: '保存成功....',
                      duration: 1500,
                      icon:"success"
                    })
                  }
                })
              }
            }
          })



          }else if(res.tapIndex == 1){
              //举报
              // debugger;
            var user = app.getGlobalUserInfo();
            var videoInfo = me.data.videoInfo;
            var redirectUrl = '../mine/mine#publisherId@' + videoInfo;
            // debugger;
            if (user === null || user === undefined || user === '') {
              wx.redirectTo({
                url: '../userLogin/login?redirectUrl=' + redirectUrl,
              })
            } else {
              var videoId = videoInfo.id;
              var publisherId = videoInfo.userId
              // debugger;
              wx.navigateTo({
                url: '../report/report?videoId=' + videoId + '&publisherId=' + publisherId,
              })
            }

          }else if(res.tapIndex == 2){
            wx.showToast({
              title: '功能开发中...',
              duration:1400,
              icon : 'none'
            })
          }else if(res.tapIndex == 3){
            wx.showToast({
              title: '功能开发中...',
              duration: 1400,
              icon: 'none'
            })
          }
        }
      })
  },

//页面转发信息
  onShareAppMessage: function (res) {
    var me = this;
    var videoInfo = JSON.stringify(me.data.videoInfo);

      return {
        title: '短视频内容分享',
        path: '/pages/videoInfo/videoInfo?videoInfo=' + videoInfo
      }
  },

  leaveComment: function() {
      this.setData({
        commentFocus: true
      });
  },

//回复留言
  replyFocus: function(e) {
    var fatherCommentId = e.currentTarget.dataset.fathercommentid;
    var toUserId = e.currentTarget.dataset.touserid;
    var toNickname = e.currentTarget.dataset.tonickname;
    // debugger;
    this.setData({
      placeholder:"回复 " + toNickname,
      replyFatherCommentId: fatherCommentId,
      replyToUserId: toUserId,
      commentFocus:true
    });
  },

  saveComment:function(e) {
      var me = this;
      var content = e.detail.value;

      //获取评论回复的fatherCommentId和toUserId
    var fatherCommentId = e.currentTarget.dataset.replyfathercommentid;
    var toUserId = e.currentTarget.dataset.replytouserid;

  // debugger
      var user = app.getGlobalUserInfo();
    var serverUrl = app.serverUrl;
    
    var videoInfo = JSON.stringify(me.data.videoInfo);
    var redirectUrl = '../videoInfo/videoInfo#videoInfo@' + videoInfo;

//用户是否登录判断
    if (user === null || user === undefined || user === '') {
      wx.redirectTo({
        url: '../userLogin/login?redirectUrl=' + redirectUrl,
      })
    } else {
      wx.showLoading({
        title: '等等....',
      })
        wx.request({
          url: serverUrl + '/video/saveComment?fatherCommentId=' + fatherCommentId + "&toUserId=" + toUserId,
          method:'POST',
          header: {
            'content-type': "application/json",
            'headerUserId': user.id,
            'headerUserToken': user.userToken
          },
          data: {
            videoId: me.data.videoInfo.id,
            fromUserId: user.id,
            comment: content
          },
          success: function(res){
            wx.hideLoading();
            // console.log(res);
            me.setData({
              //清空留言完毕后的输入框
              contentValue: "",
              commentsList: [], //保存留言后，清空现有留言

            });
            //
            me.getCommentsList(1);
          },
        })
    }
  },

  // commentsPage: 1,
  // commentsTotalPage: 1,
  // commentsList: []

    getCommentsList: function(page) {
        var me = this;
        var serverUrl = app.serverUrl;
        var videoId = me.data.videoInfo.id;
        wx.request({
          url: serverUrl +'/video/getVideoComments?videoId='+videoId+"&page="+page+"&pageSize=5",
          method:"POST",
          success:function(res){
            var commentsList = res.data.data.rows;
            var newcommentsList = me.data.commentsList;
            // debugger;
              me.setData({
                commentsList : newcommentsList.concat(commentsList),
                commentsTotalPage : res.data.data.total,
                commentsPage : page
              });
          }
        })
    },

    onReachBottom: function() {
        var me = this;
        var page = me.data.commentsPage;
      var totalPage = me.data.commentsTotalPage;
      if(page === totalPage){
        return;
      }
      me.getCommentsList(page+1);
    }
})