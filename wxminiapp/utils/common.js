var app = getApp();
const {
  request
} = require('./request.js')
const baseConfig = require('./config.js')
let preventShake = 0;

function register(e) {
  var data = e
  wx.login({
    success: res => {
      data.code = res.code
      request({
        service: 'miniapp.php/user/register',
        data: data,
        success: res => {
          wx.setStorageSync('userdata', res.userdata)
        },
        fail: res => {
          console.log('未授权注册错误', res);
        },
      })
    }
  })
}




function authorized(e) {
  var data = e
  wx.login({
    success: res => {
      data.code = res.code
      request({
        service: 'miniapp.php/user/authorized',
        data: data,
        success: res => {
          wx.setStorageSync('userdata', res.userdata)
        },
        fail: res => {
          console.log('已授权注册错误', res);
        }
      })
    }
  })
}


//跳转内部页面
function insidejump(e) {
  //console.log("跳转tab页面")
  let type = e.type
  if (type == 0) {
    wx.switchTab({
      url: e.url
    })
  }
  else if (type == 1) {
    //console.log("关闭其他页面跳转")
    wx.reLaunch({
      url: e.url
    })
  }
  else {
    //console.log("普通跳转")
    wx.navigateTo({
      url: e.url
    })
  }
}


//广告统计
function clickgdtadstatistics(e) {
  const nowTime = Date.now();
  if (nowTime - preventShake < 2000) {
    return
  }
  preventShake = nowTime;

  let data = e;
  let user_id = wx.getStorageSync('userdata').id || 0;
  data.user_id = user_id;
  request({
    service: 'ad/gdtad/clickad',
    data: data,
    success: res => {
      console.log("点击广告统计返回", res)
    }
  })
}

//广告加载成功失败统计
function adloadstatistics(e){
  let data = e;
  let user_id = wx.getStorageSync('userdata').id || 0;
  data.user_id = user_id;
  request({
    service: 'ad/gdtad/adload',
    data: data,
    success: res => {
      console.log("加载广告统计返回", res)
    }
  })

}


//收集推送
function collectmsg(temmsg_id){
  let openid = wx.getStorageSync('userdata').openid || 0;
  request({
    service: 'miniapp.php/sendmsg/collectmsg',
    data:{
      temmsg_id:temmsg_id,
      openid:openid
    },
    success: res => {
      console.log("收集推送id成功", res)
    }
  })

}





module.exports = {
  register: register,
  authorized:authorized,
  insidejump: insidejump,
  clickgdtadstatistics: clickgdtadstatistics,
  adloadstatistics: adloadstatistics,
  collectmsg:collectmsg
}