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
      service: 'miniapp.php/currency/getqrcode',
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

  /**
 * 用户点击右上角分享
 */
  onShareAppMessage: function () {
    var name = wx.getStorageSync('userdata').nickName;
    var userid = wx.getStorageSync('userdata').id
    return {
      title: "你的好友" + name +"邀请你回答问题啦",
      desc: "你的好友" + name + "邀请你回答问题啦",
      // imageUrl: baseConfig.imageurl+'miniapp/images/appicon.png',
      imageUrl: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimgres.sj88.com%2Fsj88%2F146%2F726094-202004261141445ea57378bc0a9.jpg&refer=http%3A%2F%2Fimgres.sj88.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1611846557&t=a13f37a0ce90a530792cd8d2f20955f3',
      path: '/pages/question/question?channel=1001&answer_userid=' + userid, // 路径，传递参数到指定页面。
    }

  },



})