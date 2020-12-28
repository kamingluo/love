const app = getApp()
const {
  request
} = require('./../../utils/request.js');
const common = require('./../../utils/common.js') //公共函数
const baseConfig = require('./../../utils/config.js')//配置文件
let preventShake = 0;
Page({
  data: {
    questionlist: [],//预设问题列表
    answer_userid: null,//分享者用户id
    answeruserdata: {},//分享者用户信息
    shareuserquestion: [],//被分享用户进来，查看已经问分享者的问题
    question: null,//提问的问题
    ifauthorized: false//用户是否有授权
  },
  onLoad: function (e) {
    // let answer_userid=e.query.answer_userid;//分享者用户id
    // this.setData({
    //   answer_userid: answer_userid
    // })
    // this.shareuserquestion()//被分享用户进来，查看已经问分享者的问题
    // this.questionlist()//预设问题列表
    //this.getUserInfoif()//检查用户授权
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

  onShow: function () {

  },

  //被分享用户进来，查看已经问分享者的问题
  shareuserquestion: function () {
    var that = this
    wx.login({
      success: res => {
        request({
          service: 'miniapp.php/question/shareuserquestion',
          data: {
            answer_userid: that.data.answer_userid,
            code: res.code,
          },
          success: res => {
            that.setData({
              shareuserquestion: res.questionlist,
              answeruserdata: res.answeruserdata,
            })
          },
        })
      }
    })
  },

  //用户输入问题
  inputquestion: function (e) {
    this.setData({
      question: e.detail.value,
    })
  },

  //用户选择问题
  choicequestion: function (e) {
    let question = e.currentTarget.dataset.question
    this.setData({
      question: question,
    })
  },

  //发起问题之前先授权回复的推送
  replyquestionmsg: function() {
    const nowTime = Date.now();
    if (nowTime - preventShake < 2000) {
      return
    }
    preventShake = nowTime;
    var that = this
    let questions_temid=baseConfig.questions_temid;//问题被回复通知推送id
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

  //发起问题
  replyquestion: function () {
    var that = this;
    let question_userid = wx.getStorageSync('userdata').id || 0;
    request({
      service: 'miniapp.php/question/launchquestion',
      data: {
        question_userid: question_userid,//发起人用户id
        answer_userid: that.data.answer_userid,//要回复的人（也就是分享者用户id）
        question: that.data.question//发起的问题
      },
      method: 'GET',
      success: res => {
        that.wxshowToast("发起问题成功")
        that.shareuserquestion()//刷新列表
      }
    })

  },

  //预设问题列表
  questionlist: function () {
    request({
      service: 'miniapp.php/prequestion/questionlist',
      method: 'GET',
      success: res => {
        console.log('预设问题列表', res.questionlist);
        this.setData({
          questionlist: res.questionlist,
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