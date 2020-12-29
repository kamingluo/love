const app = getApp()
const {
  request
} = require('./../../utils/request.js');
const common = require('./../../utils/common.js') //公共函数
const baseConfig = require('./../../utils/config.js')//配置文件
let preventShake = 0; //防止快速点击
Page({
  data: {
    myquestionlist: [],//我的问题列表
    seenum: 0,//用户的可查看匿名次数
    answer: null,//回复问题
    questionid: null,//回复的id
    replymodel: false,//回复的弹框
    ifauthorized: false,//用户是否有授权
    deleteid: null,//删除id
    deletemodel: false//删除弹框
  },
  onLoad: function (e) {
    this.getUserInfoif()//判断用户有没有授权
    let num = wx.getStorageSync('seenum') || 0;
    this.setData({
      seenum: num,
    })

  },
  onShow: function () {
    this.usergroup()//查询用户问题列表
  },
  //判断用户有没有授权
  getUserInfoif: function () {
    var that = this
    wx.getSetting({
      success(res) {
        console.log("onshow拿到用户授权过的配置", res)
        if (res.authSetting['scope.userInfo']) {
          that.setData({
            ifauthorized: true,
          })
        }
      }
    })
  },
  //用户授权
  getUserInfo: function (e) {
    let that = this;
    var data = {
      channel: wx.getStorageSync('userdata').channel,
      scene: wx.getStorageSync('userdata').scene,
    }
    wx.getSetting({
      success(res) {
        console.log("查看授权设置", res)
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success(res) {
              console.log("授权成功更新信息啦")
              let userdata = Object.assign(data, res.userInfo);
              common.authorized(userdata) //用户注册已经授权
              // wx.showToast({
              //   title: '授权成功',
              //   icon: 'success',
              //   duration: 2000,
              // })
              that.setData({
                ifauthorized: true,
              })
            }
          })
        }
      }
    })
  },
  //调起回复
  ejectreply: function (e) {
    let questionid = e.currentTarget.dataset.questionid;
    this.setData({
      questionid: questionid,
      replymodel: true
    })
  },
  //用户输入回复
  inputreply: function (e) {
    this.setData({
      answer: e.detail.value,
    })
  },

  //回复问题之前，收集
  replyquestionmsg: function () {
    const nowTime = Date.now();
    if (nowTime - preventShake < 2000) {
      return
    }
    preventShake = nowTime;
    var that = this
    let questions_temid = baseConfig.questions_temid;//问题被回复通知推送id
    wx.requestSubscribeMessage({
      tmplIds: [questions_temid],
      success(res) {
        //console.log("同意了请求，统计一下推送id")
        common.collectmsg(questions_temid)
      },
      complete() {
        that.replyquestion() //成功不成功都执行下一步发起问题
      }
    })
  },
  //回复问题
  replyquestion: function () {
    var that = this;
    let answer = that.data.answer;
    if (answer == null) {
      this.wxshowToast("回复内容不能为空")
      return;
    }
    request({
      service: 'miniapp.php/question/replyquestion',
      data: {
        answer: answer,
        questionid: that.data.questionid
      },
      method: 'GET',
      success: res => {
        that.wxshowToast("回复成功")
        that.usergroup()//刷新列表
        this.setData({//清空回复内容并关闭弹框
          answer: null,
          replymodel: false
        })
      }
    })
  },
  //用户问题列表
  usergroup: function () {
    var that = this
    wx.login({
      success: res => {
        request({
          service: 'miniapp.php/question/myquestion',
          data: {
            code: res.code,
          },
          success: res => {
            that.setData({
              myquestionlist: res.myquestionlist,
              deletemodel: false,
            })
          },
        })
      }
    })
  },
  //观看激励视频
  videoad: function () {
    var that = this;
    // 在页面中定义激励视频广告
    let videoAd = null
    // 在页面onLoad回调事件中创建激励视频广告实例
    if (wx.createRewardedVideoAd) {
      videoAd = wx.createRewardedVideoAd({
        adUnitId: baseConfig.videoadid
      })
      videoAd.onLoad(() => {
        //console.log("onLoad")
      })
      videoAd.onError((err) => {
        //console.log("onError")
      })
      videoAd.onClose((res) => {
        //console.log("点击关闭视频广告", res)
        if (res && res.isEnded || res === undefined) {
          that.operationnum(0)
          //console.log("正常播放结束，可以下发游戏奖励")
        } else {
          that.wxshowToast("观看完成才能获得奖励哦！")
          //console.log("播放中途退出，不下发游戏奖励")
        }
      })
    }
    // 用户触发广告后，显示激励视频广告
    if (videoAd) {
      videoAd.show().catch(() => {
        //console.log("失败重试")
        // 失败重试
        videoAd.load()
          .then(() => videoAd.show())
          .catch(err => {
            //console.log('激励视频 广告显示失败')
            that.wxshowToast("暂无广告,等会再试试！")
          })
      })
    }

  },
  //用户查看匿名者信息
  seeanonymous: function (e) {
    var that = this;
    let id = e.currentTarget.dataset.id;
    let index = e.currentTarget.dataset.index;
    let num = wx.getStorageSync('seenum')
    if (num < 1) {
      this.wxshowToast("查看次数不足，请获取查看次数")
      return
    }
    else {
      //扣除查看次数
      that.operationnum(1)
      //将改条记录匿名变成不匿名
      let newmyquestionlist = that.data.myquestionlist;//拿到问题列表
      newmyquestionlist[index].anonymous = 1;
      that.setData({
        myquestionlist: newmyquestionlist,
      })

      //发送请求修改记录
      let openid = wx.getStorageSync('userdata').openid || 0;
      request({
        service: 'miniapp.php/question/seeanonymous',
        data: {
          id: id,
          openid: openid
        },
        method: 'GET',
        success: res => {
          console.log("修改匿名记录成功")
        }
      })
    }


  },
  //调起删除问题
  ejectdel: function (e) {
    let questionid = e.currentTarget.dataset.questionid;
    this.setData({
      deleteid: questionid,
      deletemodel: true
    })
  },
  //弹框隐藏(回复弹框和删除弹框)
  hideModal: function () {
    this.setData({
      deletemodel: false,
      replymodel: false
    })
  },
  //删除问题记录
  delquestion: function () {
    var that = this;
    let id = this.data.deleteid;
    request({
      service: 'miniapp.php/question/delquestion',
      data: {
        id: id,
      },
      method: 'GET',
      success: res => {
        console.log("删除成功，刷新列表")
        that.usergroup()
      }
    })
  },
  //微信toast提示
  wxshowToast: function (title) {
    wx.showToast({
      title: title,
      icon: 'none',
      duration: 2000
    })

  },
  //操作用户的次数，加或者减(type=0加1减)
  operationnum: function (type) {
    var that = this;
    var nowTime = Date.now();
    if (nowTime - preventShake < 5000) {
      //console.log("防止短时间内多次调用")
      return
    }
    preventShake = nowTime;
    var that = this;
    let openid = wx.getStorageSync('userdata').openid || 0;
    request({
      service: 'miniapp.php/seenum/operationnum',
      data: {
        openid: openid,
        type: type
      },
      method: 'GET',
      success: res => {
        console.log('操作用户可观看次数成功', res);
        let num = wx.getStorageSync('seenum')
        if (type == 0) {
          var newnum = num++;
          that.wxshowToast("增加次数成功！")
        }
        else {
          var newnum = num--;
          that.wxshowToast("扣除次数成功")
        }
        wx.setStorageSync('seenum', newnum)
        that.setData({
          seenum: newnum,
        })
      }
    })

  },
  //跳转到二维码页面
  qrcode: function () {
    wx.navigateTo({
      url: '/pages/qrcode/qrcode'
    })
  },

})