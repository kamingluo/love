const app = getApp()
const {
  request
} = require('./../../utils/request.js');
const common = require('./../../utils/common.js') //公共函数
const addata = require('./../../utils/addata.js')
let preventShake = 0; //防止快速点击
Page({
  data: {
    myquestionlist:[],//我的问题列表
    answer:null,//回复问题
    questionid:1//回复的id
  },
  onLoad: function(e) {
  
  },
  onShow: function() {
   
  },

   //回复问题
   replyquestion:function(type){
    var that = this;
    request({
      service: 'miniapp.php/question/replyquestion',
      data: {
        answer: that.data.answer,
        questionid:that.data.questionid
      },
      method: 'GET',
      success: res => {
        that.wxshowToast("回复成功")
        that.usergroup()//刷新列表
      }
    })

  },




  //用户问题列表
  usergroup:function(){
      var that =this
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
              })
            },
          })
        }
      })
    },


    //观看激励视频
    videoad: function() {
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

    
  wxshowToast: function(title) {
    wx.showToast({
      title: title,
      icon: 'none',
      duration: 2000
    })

  },

  //操作用户的次数，加或者减(type=0加1减)
  operationnum:function(type){
    var nowTime = Date.now();
    if (nowTime - preventShake < 5000) {
      //console.log("防止短时间内多次调用")
      return
    }
    preventShake = nowTime;
    var that = this;
    let openid=wx.getStorageSync('userdata').openid || 0;
    request({
      service: 'miniapp.php/seenum/operationnum',
      data: {
        openid: openid,
        type:type
      },
      method: 'GET',
      success: res => {
        console.log('操作用户可观看次数成功', res);
        let num =wx.getStorageSync('seenum')
        if(type==0){
          var newnum=num++;
          that.wxshowToast("增加次数成功！")
        }
        else{
          var newnum=num--;
          that.wxshowToast("扣除次数成功")
        }
        wx.setStorageSync('seenum', newnum)
      }
    })

  },

})