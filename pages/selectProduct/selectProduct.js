// pages/selectProduct/selectProduct.js
let app = getApp(),
  util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //车型id
    productId:'',
    //车型名称
    productName:[],
    //车型列表
    productList:[],
    //已经选中的对比信息
    compareData:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 标题
    wx.setNavigationBarTitle({
      title: '请选择车型'
    })

    //获取车系信息
    wx.getStorage({
      key: 'seriesInfo',
      success: res => {
        //车系id赋值
        this.setData({
          seriesId: res.data.F_SubCategoryId,
        })
        //获取车型id
        console.log(res)
        wx.getStorage({
          key: 'compareData',
          success: ele => {
            let productId = '';
            if (ele.data[res.data.F_SubCategoryId].length){
              productId = ele.data[res.data.F_SubCategoryId][0];
            }
            //赋值车型id
            this.setData({
              compareData:ele.data,
              productId: productId
            })
          },
        })
      },
    })


    //获取选择车型的信息
    wx.getStorage({
      key: 'selectProduct',
      success: res => {
        let productData = res.data;

        //请求车型列表
        wx.request({
          url: app.ajaxurl + 'index.php?r=weex/product/choose-product&sId=' + productData.seriesId + '&subId=' + productData.subCateId ,
          success:ele => {
            this.setData({
              productName: productData.seriesName,
              productList: ele.data.proList
            })
          }
        })
      },
    })
  },
  //点击车型选择车型
  selectProduct(e){
    let productId = e.currentTarget.dataset.productid;
    let name = e.currentTarget.dataset.name;
    if (this.data.productId == productId){
      return 
    }

    //存储选择对比历史信息
    wx.getStorage({
      key: 'compareHistory',
      complete: res => {
        let data = [];
        let item = {};
        item.F_ProductId = productId;
        item.F_ProductName = name;
        let has = true;
        //有存储
        if (res.data) {
          data = res.data;
          data.forEach(item => {
            if (item.F_ProductId == productId){
              has = false;
            }
          })
        }
        if(has){
          data.push(item);
        }
        console.log(data)
        wx.setStorage({
          key: 'compareHistory',
          data: data
        })
      },
    })


    //查看缓存数据
    let compareData = this.data.compareData;
    //获取是第一个位置还是第二个位置
    wx.getStorage({
      key: 'compareNumber',
      success: num => {
          if(num.data == 0){
            compareData[this.data.seriesId].unshift(productId)
          } else {
            compareData[this.data.seriesId].push(productId)
          }
          //重新写入对比信息
          wx.setStorage({
            key: 'compareData',
            data: compareData,
            success:() => {
              //存储个缓存，代表选中了车型
              wx.setStorage({
                key: 'addProduct',
                data: true,
                success: () => {
                  wx.navigateBack({
                    delta: 2
                  })
                }
              })
            }
          })
      },
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})