const app = getApp()
const {
  request
} = require('./../../utils/request.js');
const common = require('./../../utils/common.js') //公共函数
const addata = require('./../../utils/addata.js')

Page({
  data: {
  },
  onLoad: function (e) {

  },
  onShow: function () {

  },

  //查询首页配置
  indexconfig: function () {
    request({
      service: 'index/indexconfig',
      method: 'GET',
      success: res => {
        console.log('首页配置数据', res.indexconfig);
        this.setData({
          indexconfig: res.indexconfig,
        })

      }
    })
  },

})