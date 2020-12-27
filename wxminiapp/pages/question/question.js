const app = getApp()
const {
  request
} = require('./../../utils/request.js');
const common = require('./../../utils/common.js') //公共函数
const addata = require('./../../utils/addata.js')

Page({
  data: {
    questionlist:[],//预设问题列表
    answer_userid:null,//分享者用户id
    answeruserdata:{},//分享者用户信息
    shareuserquestion:[],//被分享用户进来，查看已经问分享者的问题
    question:null//提问的问题
  },
  onLoad: function (e) {
    // let answer_userid=e.query.answer_userid;//分享者用户id
    // this.setData({
    //   answer_userid: answer_userid
    // })
    // this.shareuserquestion()//被分享用户进来，查看已经问分享者的问题
    // this.questionlist()//预设问题列表
  },

  
  onShow: function () {

  },


  //被分享用户进来，查看已经问分享者的问题
  shareuserquestion:function(){
    var that =this
    wx.login({
      success: res => {
        request({
          service: 'miniapp.php/question/shareuserquestion',
          data: {
            answer_userid:that.data.answer_userid,
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

  
   //发起问题
   replyquestion:function(type){
    var that = this;
    let question_userid=wx.getStorageSync('userdata').id || 0;
    request({
      service: 'miniapp.php/question/launchquestion',
      data: {
        question_userid: question_userid,//发起人用户id
        answer_userid:that.data.answer_userid,//要回复的人（也就是分享者用户id）
        question:that.data.question//发起的问题
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




})