function uploadVideo() {
  var me = this;
  wx.chooseVideo({
    sourceType: ['album'],
    success: function(res) {
      console.log(res);
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
}

//导出方法
module.exports = {
  uploadVideo: uploadVideo
}