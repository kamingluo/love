const app = getApp()
const {
  request
} = require('./../../utils/request.js');
const baseConfig = require('./../../utils/config.js')


Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgurl: null,
    display: false

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.myqrcode()
    wx.showLoading({
      title: '生成中..',
    })

    this.setData({
      display: app.globalData.display || false
    })
  },

  myqrcode: function () {
    var userid = wx.getStorageSync('userdata').id
    if (userid == null) {
      wx.showToast({
        title: "生成失败",
        icon: 'none'
      })
      return;
    }
    request({
      service: 'currency/getqrcode',
      data: {
        userid: userid,
      },
      success: res => {
        console.log('生成二维码成功', res);
        wx.hideLoading()
        let host=baseConfig.host;
        this.setData({
          imgurl: host +'/qrcode/' + userid + '.png',
        })
      },
    })

  },


  dowloadimg: function () {
    var that = this
    var imgSrc = this.data.imgurl
    wx.getSetting({
      success(res) {
        console.log(res)
        var writePhotosAlbum = wx.getStorageSync('writePhotosAlbum')
        if (!res.authSetting['scope.writePhotosAlbum'] && writePhotosAlbum) {
          that.openSetting()
          wx.showToast({
            title: "请打开权限",
            icon: 'none'
          })
        }
        else {
          wx.downloadFile({
            url: imgSrc,
            success: function (res) {
              console.log("下载图片成功", res);
              //图片保存到本地
              wx.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                success: function (data) {
                  console.log(data);
                  wx.showToast({
                    title: "下载成功",
                    icon: 'none'
                  })
                },
                fail: function (res) {
                  console.log(res)
                  wx.setStorageSync('writePhotosAlbum', true)
                }
              })
            }
          })
        }
      }
    })
  },

  openSetting: function () {
    //console.log("打开设置")
    wx.openSetting()
  },
})