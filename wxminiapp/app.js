//app.js
const common = require('./utils/common.js') //公共函数
const { request } = require('./utils/request.js')//公共请求方法
App({
  globalData: {
    //一定要，删除报错
  },
  onLaunch: function (e) {
    console.log("onLaunch打印信息", e)
    //this.autoUpdate()//检查更新
    //common.register(e) //用户注册
    //this.scene(e)//传入入口值判断
    // 获取系统状态栏信息
    this.seenum()//用户可以查看匿名次数
    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        let custom = wx.getMenuButtonBoundingClientRect();
        this.globalData.Custom = custom;
        this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
      }
    })
  },


  //用户可以查看匿名次数
  seenum:function(){
        wx.login({
          success: res => {
            request({
              service: 'miniapp.php/seenum/mynum',
              data: {
                code: res.code,
              },
              success: res => {
                wx.setStorageSync('seenum', res.number)
              },
            })
          }
        })
  },


  scene: function (e) {
    let scene = e.scene;
    let channel = e.query.channel || 0;
    if (channel == 1000 || channel == 0 && scene == 1001 || scene == 1129) {
      this.globalData.display = false;
    }
    else {
      this.globalData.display = true;
    }
    if (channel == 0 && scene == 1089 || scene == 1001) {
      this.globalData.addapptips = false;
    }
    else {
      this.globalData.addapptips = true;
    }
  },



  /**
   * 检测小程序版本
   */

  autoUpdate: function () {
    var self = this
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        if (res.hasUpdate) {
          wx.showModal({
            title: '更新提示',
            content: '检测到新版本，是否启用新版本？',
            success: function (res) {
              if (res.confirm) {
                self.downLoadAndUpdate(updateManager)
              } else if (res.cancel) {
                wx.showModal({
                  title: '温馨提示~',
                  content: '本次版本更新涉及到新的功能添加，旧版本访问可能存在问题哦~',
                  showCancel: false,
                  confirmText: "确定更新",
                  success: function (res) {
                    if (res.confirm) {
                      self.downLoadAndUpdate(updateManager)
                    }
                  }
                })
              }
            }
          })
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },


  /**
   * 下载小程序新版本并重启应用
   */
  downLoadAndUpdate: function (updateManager) {
    var self = this
    wx.showLoading();
    updateManager.onUpdateReady(function () {
      wx.hideLoading()
      updateManager.applyUpdate()
    })
    updateManager.onUpdateFailed(function () {
      wx.showModal({
        title: '已经有新版本了哟~',
        content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
      })
    })
  }








})