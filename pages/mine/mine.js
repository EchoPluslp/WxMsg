var videoUtil = require('../../utils/videoutil.js')
const app = getApp()

Page({
  data: {
    faceUrl: "../resource/images/noneface.png",
    //判断当前时候是本人
    isMe: true,
    //没有关注视频发布者
    isFollow: false,
    appImage: "http://119.23.242.242/",

    videoSelClass: "video-info",
    isSelectedWork: "video-info-selected",
    isSelectedLike: "",
    isSelectedFollow: "",

  //分页处理
    myVideoList: [],
    myVideoPage: 1,
    myVideoTotal: 1,

    likeVideoList: [],
    likeVideoPage: 1,
    likeVideoTotal: 1,

    followVideoList: [],
    followVideoPage: 1,
    followVideoTotal: 1,

    myWorkFalg: false,
    myLikesFalg: true,
    myFollowFalg: true
  },
  onLoad: function(params) {
    var me = this;
    var serverUrl = app.serverUrl;
    var appImage = app.appImage;
    var userInfo = app.getGlobalUserInfo();
    var userId = userInfo.id;
    // debugger;
    //视频发布者Id
    var publisherId = params.publisherId;
    if (publisherId != null && publisherId != undefined && publisherId != '') {
      //查询视频发布者的信息，而不是用户本身的信息
      userId = publisherId;
      me.setData({
        isMe: false,
        publisherId: publisherId,
        serverUrl: app.serverUrl
      });
    };
    me.setData({
      userId: userId
    })
    wx.showLoading({
      title: '请稍等...',
    });
    wx.request({
      url: serverUrl + '/user/query?userId=' + userId + "&fanId=" + userInfo.id,
      method: "POST",
      header: {
        'content-type': 'application/json',
        'headerUserId': userInfo.id,
        'headerUserToken': userInfo.userToken
      },
      success: function(res) {
        wx.hideLoading();
        var user = res.data;
        var usermsg = user.data;
        // debugger;
        if (user.status == 200) {
          var faceUrl = "../resource/images/noneface.png";
          if (usermsg.faceImage != null || usermsg.faceImage != undefined || usermsg.faceImage != '') {
            faceUrl = appImage + usermsg.faceImage;
          }
          // console.log(usermsg);
          me.setData({
            faceUrl: faceUrl,
            fansCounts: usermsg.fansCounts,
            followCounts: usermsg.followCounts,
            receiveLikeCounts: usermsg.receiveLikeCounts,
            nickname: usermsg.nickname,
            isFollow: usermsg.follow
          });
        } else if (user.status == 502) {
          // debugger;
          wx.showToast({
            title: res.data.msg,
            duration: 3000,
            icon: "none",
            success: function(res) {
              wx.redirectTo({
                url: '../userLogin/login',
              })
            }
          })
        }
      },
    })
  },
  logout: function() {
    var userInfo = app.getGlobalUserInfo();
    var serverUrl = app.serverUrl;
    wx.showLoading({
      title: '请稍等...',
    });
    wx.request({
      url: serverUrl + '/logout?userId=' + userInfo.id,
      method: "POST",
      header: {
        'content-type': "application/json"
      },
      success: function(res) {
        wx.hideLoading();
        if (res.data.status == 200) {
          //注销成功
          wx.showToast({
            title: '注销成功',
            duration: 3000,
            icon: 'success'
          });
          //  app.userInfo = null;
          wx.removeStorageSync("userInfo");
          //fixme 修改app的userInfo表达方式
          app.setGlobalUserInfo(null);
          // console.log(app.getGlobalUserInfo());
          wx.redirectTo({
            url: '../userLogin/login',
          })
        }
      }
    })
  },
  changeFace: function() {
    // console.log("Change Face..............................");
    var me = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'], //从相册选中
      success: function(res) {
        var serverUrl = app.serverUrl;
        var appImage = app.appImage;
        var tempFilepaths = res.tempFilePaths;
        var userInfo = app.getGlobalUserInfo();
        wx.showLoading({
            title: '上传中',
            duration: 3000,
            icon: "none"
          }),
          wx.uploadFile({
            url: serverUrl + '/user/uploadFace?userId=' + app.getGlobalUserInfo().id,
            filePath: tempFilepaths[0],
            name: 'files',
            header: {
              'content-type': 'application/json', //默认值
              'headerUserId': userInfo.id,
              'headerUserToken': userInfo.userToken
            },
            success(res) {
              var data = res.data;
              // debugger;
              data = JSON.parse(data);
              if (data.status == 200) {
                wx.hideLoading();
                // console.log(data);
                wx.showToast({
                  title: '上传成功',
                  duration: 1000,
                  icon: "success"
                });
                var imageUrl = data.data;
                me.setData({
                  //todo 修改访问路径
                  faceUrl: appImage + imageUrl
                });
              } else if (data.status == 500) {
                wx.showToast({
                  title: data.msg,
                  duration: 1000,
                  icon: "none"
                })
              } else if (data.status == 502) {
                // debugger;
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
  uploadVideo: function() {
    var me = this;
    wx.chooseVideo({
      sourceType: ['album'],
      success: function(res) {
        // console.log(res);
        var duration = res.duration;
        var height = res.height;
        var tempFilePath = res.tempFilePath;
        var thumbTempFilePath = res.thumbTempFilePath;
        var tmpHeight = res.height;
        var tmpWidth = res.width;
        var tmpVideoUrl = res.tempFilePath;
        var temCoverUrl = res.thumbTempFilePath;

        if (duration > 16) {
          wx.showToast({
            title: '视频时间不能超过15秒...',
            duration: 2500,
            icon: "none"
          })
        } else if (duration < 1) {
          wx.showToast({
            title: '视频时间太短了...',
            duration: 2000,
            icon: "none"
          })
        } else {
          //todo 选择bgm页面]
          wx.navigateTo({
            url: '../chooseBgm/chooseBgm?duration=' + duration +
              '&tmpHeight=' + tmpHeight +
              '&tmpWidth=' + tmpWidth +
              '&tmpVideoUrl=' + tmpVideoUrl +
              '&temCoverUrl=' + temCoverUrl +
              '&tmpHeight=' + tmpHeight,
          })

        }
      }
    })
  },

  followMe: function(res) {
    var me = this;
    var serverUrl = app.serverUrl;
    var user = app.getGlobalUserInfo();
    var publisherId = me.data.publisherId; //视频发布者用户Id
    var userId = user.id;
    var followType = res.currentTarget.dataset.followtype;

    var url = '';
    if (followType === '1') {
      url = '/user/query/beYourFans?publisherId=' + publisherId + "&fanId=" + userId;
    } else {
      url = '/user/query/notBeYourFans?publisherId=' + publisherId + "&fanId=" + userId;
    }
    wx.showLoading({
      title: '...',
    })
    wx.request({
      url: serverUrl + url,
      method: "POST",
      header: {
        'content-type': 'application/json', //默认值
        'headerUserId': user.id,
        'headerUserToken': user.userToken
      },
      success: function(res) {
        wx.hideLoading();
        //followType:0 取消i关注  1:关注当前视频发布者
        if (followType === '1') {
          me.setData({
            isFollow: true,
            fansCounts: ++me.data.fansCounts
          });
        } else {
          me.setData({
            isFollow: false,
            fansCounts: --me.data.fansCounts
          });
        }
      }
    })
  },

  doSelectWork: function () {
    this.setData({
      isSelectedWork: "video-info-selected",
      isSelectedLike: "",
      isSelectedFollow: "",

      myWorkFalg: false,
      myLikesFalg: true,
      myFollowFalg: true,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    });

    this.getMyVideoList(1);
  },

  doSelectLike: function () {
    this.setData({
      isSelectedWork: "",
      isSelectedLike: "video-info-selected",
      isSelectedFollow: "",

      myWorkFalg: true,
      myLikesFalg: false,
      myFollowFalg: true,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    });

    this.getMyLikesList(1);
  },

  doSelectFollow: function () {
    this.setData({
      isSelectedWork: "",
      isSelectedLike: "",
      isSelectedFollow: "video-info-selected",

      myWorkFalg: true,
      myLikesFalg: true,
      myFollowFalg: false,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    });

    this.getMyFollowList(1)
  },

  //获取我的作品信息
  getMyVideoList: function (page) {
    var me = this;
    // debugger;
    wx.showLoading();
    // 调用后端
    var serverUrl = app.serverUrl;
    // debugger;
    wx.request({
      url: serverUrl + '/video/showAllVideos/?page=' + page + '&pageSize=6',
      method: "POST",
      data: {
        userId: me.data.userId
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res.data);
        var myVideoList = res.data.data.rows;
        wx.hideLoading();

        var newVideoList = me.data.myVideoList;
        // debugger;
        me.setData({
          myVideoPage: page,
          myVideoList: newVideoList.concat(myVideoList),
          myVideoTotal: res.data.data.total,
          serverUrl: app.serverUrl
        });
      }
    })
  },

  getMyLikesList: function (page) {
    var me = this;
    var userId = me.data.userId;
    // 查询视频信息
    wx.showLoading();
    // 调用后端
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/video/showMyLike/?userId=' + userId + '&page=' + page + '&pageSize=6',
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res.data);
        var likeVideoList = res.data.data.rows;
        wx.hideLoading();

        var newVideoList = me.data.likeVideoList;
        me.setData({
          likeVideoPage: page,
          likeVideoList: newVideoList.concat(likeVideoList),
          likeVideoTotal: res.data.data.total,
          serverUrl: app.serverUrl
        });
      }
    })
  },

  getMyFollowList: function (page) {
    var me = this;
    var userId = me.data.userId
    // 查询视频信息
    wx.showLoading();
    // 调用后端
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/video/showMyFollow/?userId=' + userId + '&page=' + page + '&pageSize=6',
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res.data);
        var followVideoList = res.data.data.rows;
        wx.hideLoading();

        var newVideoList = me.data.followVideoList;
        me.setData({
          followVideoPage: page,
          followVideoList: newVideoList.concat(followVideoList),
          followVideoTotal: res.data.data.total,
          serverUrl: app.serverUrl
        });
      }
    })
  },


  // 点击跳转到视频详情页面
  showVideo: function (e) {

    console.log(e);

    var myWorkFalg = this.data.myWorkFalg;
    var myLikesFalg = this.data.myLikesFalg;
    var myFollowFalg = this.data.myFollowFalg;

    if (!myWorkFalg) {
      var videoList = this.data.myVideoList;
    } else if (!myLikesFalg) {
      var videoList = this.data.likeVideoList;
    } else if (!myFollowFalg) {
      var videoList = this.data.followVideoList;
    }

    var arrindex = e.target.dataset.arrindex;
    var videoInfo = JSON.stringify(videoList[arrindex]);

    wx.redirectTo({
      url: '../videoinfo/videoinfo?videoInfo=' + videoInfo
    })

  },

  // 到底部后触发加载
  onReachBottom: function () {
    var myWorkFalg = this.data.myWorkFalg;
    var myLikesFalg = this.data.myLikesFalg;
    var myFollowFalg = this.data.myFollowFalg;

    if (!myWorkFalg) {
      var currentPage = this.data.myVideoPage;
      var totalPage = this.data.myVideoTotal;
      // 获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if (currentPage === totalPage) {
        wx.showToast({
          title: '视频已经为空啦...',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyVideoList(page);
    } else if (!myLikesFalg) {
      var currentPage = this.data.likeVideoPage;
      var totalPage = this.data.myLikesTotal;
      // 获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if (currentPage === totalPage) {
        wx.showToast({
          title: '视频已经为空啦...',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyLikesList(page);
    } else if (!myFollowFalg) {
      var currentPage = this.data.followVideoPage;
      var totalPage = this.data.followVideoTotal;
      // 获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if (currentPage === totalPage) {
        wx.showToast({
          title: '视频已经为空啦...',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyFollowList(page);
    }
  }
})