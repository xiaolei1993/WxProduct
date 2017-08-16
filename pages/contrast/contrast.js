// pages/config/config.js
let app = getApp(),
  util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //车系信息
    seriesInfo:{},
    //配置信息
    configData:{},
    //所有的列表信息
    listInfo:{},
    //对比的数量
    compareNumber:'',
    //锚点导航
    anchor:'',
    //是否显示锚点导航弹层
    classifyPop:false,
    //询底价人数
    askPriceNum:'',
  },
  //显示页面的时候
  onShow:function(){

    //证明是对比回来的，请求对比数据
    wx.getStorage({
      key: 'addProduct',
      success:() => {
        //获取缓存对比信息
        wx.getStorage({
          key: 'compareData',
          success: res => {
            console.log(this.data.seriesId, 'this.data.seriesId')
            if (res.data[this.data.seriesId].length) {
              let ajaxUrl = app.ajaxurl + 'index.php?r=weex/product/contrast&proId=' + res.data[this.data.seriesId][0];

              if (res.data[this.data.seriesId][1]) {
                ajaxUrl += '_' + res.data[this.data.seriesId][1]
              }

              //请求对比数据
              wx.request({
                url: ajaxUrl,
                success: ele => {

                  let configData = this.data.configData;
                  ele.data.data.forEach((list, index) => {
                    configData.paramList[index] = list.paramList;
                    configData.products[index] = list.proInfo;
                    configData.lowPrice[index] = list.lowPrice;
                  })
                  this.setData({
                    configData: configData,
                    compareNumber: ele.data.data.length
                  })

                  //删除请求对比车型缓存
                  wx.removeStorage({
                    key: 'addProduct'
                  })
                }
              })

              //添加对比历史记录
              wx.getStorage({
                key: 'compareHistory',
                complete:ele => {
                  //有存储
                  if(ele.data){
                    let data = ele.data;
                    data.forEach(item => {
                      // if(item.)
                    })
                  }else{//没有存储

                  }
                
                }
              })

            }
          },
        })
      },
    })
  },
  onLoad: function (options) {

    // 标题
    wx.setNavigationBarTitle({
      title: '车型对比'
    })

    // 获取车系缓存
    wx.getStorage({
      key: 'seriesInfo',
      success: res => {
        this.setData({
          seriesInfo:res.data,
          seriesId: res.data.F_SubCategoryId
        })

        //获取对比信息
        wx.getStorage({
          key: 'compareData',
          success: compare => {
            let data = compare.data[this.data.seriesInfo.F_SubCategoryId];
            let product = '';
            //判断对比的数量
            if (data.length == 2){
              product = data[0] + '_' + data[1];
            }else{
              product = data[0]
            }

            //请求对比车型数据
            wx.request({
              url: app.ajaxurl + 'index.php?r=weex/product/contrast&proId=' + product,
              success: ele => {

                let configData = {};
                configData.paramList = [];
                configData.products = [];
                configData.lowPrice = [];
                
                ele.data.data.forEach((list, index) => {
                  configData.paramList[index] = list.paramList;
                  configData.products[index] = list.proInfo;
                  configData.lowPrice[index] = list.lowPrice;
                })

                //存储对比历史记录
                //获取历史记录
                wx.getStorage({
                  key: 'compareHistory',
                  complete: res => {
                    let compareHistory = [];
                    if(res.data){
                      compareHistory = res.data;
                    }
                    configData.products.forEach(item => {
                      let has = true;
                      compareHistory.forEach(el => {
                        if (item.F_ProductId == el.F_ProductId){
                          has = false
                        }
                      })
                      if(has){
                        let o = {};
                        o.F_ProductId = item.F_ProductId;
                        o.F_ProductName = item.F_ProductName
                        compareHistory.unshift(o)
                      }
                    })
                    
                    //重新存储
                    wx.setStorage({
                      key: 'compareHistory',
                      data: compareHistory,
                    })

                  },
                })
                
                this.setData({
                  configData: configData,
                  compareNumber: ele.data.data.length
                })

                console.log(this.data.configData)
              }
            })
          },
        })
      },
    })
  },
  // 点击分类
  classifyShow(){
    this.setData({
      classifyPop: !this.data.classifyPop
    })
  },
  //页面滚动，隐藏分类弹窗
  hiddenPop() {
    if (this.data.classifyPop) {
      this.setData({
        classifyPop: !this.data.classifyPop
      })
    }
  },
  // 点击导航切换
  setSelected(index){
    this.setData({
      
    })
  },
  //锚点导航跳转
  anchor(e){
    this.setData({
      anchor:e.currentTarget.dataset.anchor,
      classifyPop:false
    })
    console.log(this.data.anchor)
  },
  //进入询底价页面
  goFooterPrice(e){
    let productId = e.currentTarget.dataset.productid;
    //其他询底价
    wx.setStorage({
      key: 'priceProductId',
      data: productId,
      success: () => {
        wx.navigateTo({
          url: '../footerPrice/footerPrice',
        })
      }
    })
  },
  //清除数据
  clear(e){
    let index = e.target.dataset.index;
    let configData = this.data.configData;

    //清空名字
    configData.products[index].F_ProductName = '';

    //清空数据
    configData.paramList.forEach((ele, key) => {
      if (key == index) {
        //清除厂商指导价 && 本地最低报价
        configData.lowPrice[key] = {};
        configData.lowPrice[key].F_BigPrice = 'kong';
        configData.products[key] = {};
        configData.products[key].F_Price = 'kong';

        //清空数据和单位
        ele.forEach((res, number) => {
          res.list.forEach((result, i) => {
            result.value = '';
            result.unit = '';
          })
        })
      }
    })

    //读取对比缓存，清除对比数据
    wx.getStorage({
      key: 'compareData',
      success: res => {
        let seriesId = this.data.seriesInfo.F_SubCategoryId;
        let data = res.data;

        //查看
        if (data[seriesId][index]) {
          data[seriesId].splice(index, 1)
        } else {
          data[seriesId].splice(index - 1, 1)
        }

        //重新存储
        wx.setStorage({
          key: 'compareData',
          data: data,
        })
      },
    })

    //重新更新数据
    this.setData({
      configData: configData,
      compareNumber: this.data.compareNumber -= 1
    })
  },
  //添加车型
  addProduct(e){
    let index = e.currentTarget.dataset.index;
    console.log(index)

    wx.setStorage({
      key: 'compareNumber',
      data: index,
      success:res => {
        wx.navigateTo({
          url: '../addProduct/addProduct',
        })
      }
    })
  },
  alert(text) {
    wx.showToast({
      title: text,
      icon: 'success',
      duration: 2000
    })
  },
})