const app = getApp()

Page({
  data: {
    totalPage : 1,
    page : 1,
    videoList : [],
    serverUrl : "",
    screenWidth: 350,
    searchValue : "",
  },

  onLoad: function (params) {
    var me = this;
    // console.log(params);
    //同步获取手机信息的api 
    //getSystemInfo 异步获取信息
    var screenWidth = wx.getSystemInfoSync().screenWidth;
    me.setData({
      screenWidth : screenWidth,
    });
    var isSaveRecord = params.isSaveRecord;
    var searchValue = params.searchValue;
    console.log(params);

      if(isSaveRecord==null||isSaveRecord==''||isSaveRecord==undefined){
        isSaveRecord = 0;
      };
    if (searchValue == null ||searchValue == undefined) {
      searchValue = " ";
    };

    me.setData({
      searchValue: searchValue,
    });

    wx.showLoading({
      title: '加载中，请稍后...',
    })
    //获取分页的参数
    // console.log(me);
    //获取当前分页数
    var page = me.data.page;
    me.getAllVideoList(page, isSaveRecord);
  },
  
  getAllVideoList: function (page, isSaveRecord) {
      var me = this;
      //隐藏导航栏刷新
     wx.hideNavigationBarLoading();
    //停止导航栏刷新
     wx.stopPullDownRefresh();
     wx.hideLoading();

    var searchValue = me.data.searchValue;
  
    // console.log(searchValue);
      var serverUrl = app.serverUrl;
      wx.request({
        url: serverUrl + '/video/showAllVideos?page' + page + "&isSaveRecord=" + isSaveRecord,
        method: "POST",
        data:{
          videoDesc: searchValue
        },  
        success : function(res){
        wx.hideLoading();
//    如果当前是第一页，那么重新生成首页
          if(page === 1){
            me.setData({
              videoList : []
            });
          };
          //后端传过来的VideoList
          // console.log(res);
          var videoList = res.data.data.rows;
          //当前页面的List
          var newVideoList = me.data.videoList;
          me.setData({
            videoList : videoList.concat(newVideoList),
            page      : page,
            totalPage :  res.data.data.total,
            serverUrl : serverUrl
          });
        }
      })
  },
  showVideoInfo: function(e) {
      var me = this;
      var videoList = me.data.videoList;
      var currIndex = e.target.dataset.arrindex;
      var videoInfo = JSON.stringify(videoList[currIndex]);
      wx.redirectTo({
        url: '../videoinfo/videoinfo?videoInfo=' + videoInfo,
      })
  },
  //上拉刷新
  onReachBottom : function(){
    var me = this;
    var currentPage = me.data.page;
    var totalPage = me.data.totalPage;
    if (currentPage === totalPage){
        wx.showToast({
          title: '视频已经空啦...',
          icon : 'none'
        })
        return ;
    }
    //当前page累加1，获取下一页数据
    var page = currentPage + 1;
    me.getAllVideoList(page,0);
  },


  //下拉刷新,当前列表进行刷新~~~
  //要处理下拉刷新时，我们需要在JSON配置文件里面，配置对应的事件
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    this.getAllVideoList(1,0);
  },

})
