// pages/addModel/addModel.js
let app = getApp(),
  util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //车系id
    seriesId:'',
    // 车型id
    productId: '',			
    //以选择的选项
    selected: 0,
    //所有的列表信息
    listInfo: {},
    // 存储选择对比历史信息
    compareHistory:[],
    //品牌导航
    indexNav: [],
    // sidebar列表信息
    sidebarData:[],
    // 是否显示 sidebar
    sidebarListPop: false,
    //sidebar  遮罩层
    shadeShow: false,
    //已经选中的对比信息
    compareData: {},
    //索引导航
    navInfo: '',
    //提示层显示与隐藏
    indicateShow:true,
    //是否显示品牌选择车型列表
    selectProductShow:false,
    //车型名称
    productName: [],
    //车型列表
    productList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 标题
    wx.setNavigationBarTitle({
      title:'车型筛选'
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
    //进入页面，获取缓存数据，
    wx.getStorage({
      key: 'seriesInfo',
      success: res => {
        let seriesInfo = res.data;
        console.log(seriesInfo)
        // 重新读取信息
        wx.getStorage({
          key: 'compareData',
          success: ele => {
            let compareData = ele.data;
            let ajaxUrl = app.ajaxurl + 'index.php?r=weex/series/filtrate&subId=' + seriesInfo.F_SubCategoryId;
            //查看是否还有车型id
            if (compareData[seriesInfo.F_SubCategoryId].length){
              //设置车型id为剩余的
              this.setData({
                compareData:compareData,
                productId: compareData[seriesInfo.F_SubCategoryId][0]
              })
              console.log(this.data.compareData,'this.data.compareData')

              //请求链接
              ajaxUrl += '&productId=' + this.data.productId;
            }else{
              this.setData({
                compareData: compareData
              })
            }
            ajaxUrl += '&seriesId=' + seriesInfo.F_SeriesId + '&brandId=' + seriesInfo.F_BrandId;
            console.log(seriesInfo.F_SubCategoryId,'seriesInfo.F_SeriesIdseriesId')
            wx.request({
              url: ajaxUrl,
              success: item => {
                if (item.errMsg == 'request:ok') {
                  this.setData({
                    //总数据赋值
                    listInfo: item.data,
                    //赋值车系数据
                    seriesInfo: seriesInfo,
                    //车系id
                    seriesId:seriesInfo.F_SubCategoryId
                  })
                  console.log(this.data.listInfo)
                }
              }
            })
          },
        })
      },
    })

    //进入页面，获取选择对比历史记录
    wx.getStorage({
      key: 'compareHistory',
      success: res => {
        this.setData({
          compareHistory:res.data
        })
      },
    })
    

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
  
  },
  //选择品牌导航
  setSelected(e){
    let selected = e.currentTarget.dataset.index;
    //如果是点击导航
    if (selected){
      this.setData({
        selected: selected
      })
    }else{
      //滑动时候
      this.setData({
        selected: e.detail.current
      })
    }
  },
  // 点击品牌显示 sidebar
  sidebarShow(e){
    let brandId = e.currentTarget.dataset.brandid;
    wx.request({
      url: app.ajaxurl + '/index.php?r=ajax%2Fproduct%2Fajaxprodlist&bid=' + brandId + '&subid=' + this.data.seriesInfo.F_SubCategoryId,
      success: (res) => {
        if (res.errMsg == 'request:ok') {
          this.setData({
            sidebarListPop: true,
            shadeShow: true,
            sidebarData: res.data
          })
          console.log(this.data.sidebarData)
        }
      }
    })
  },
  // 隐藏 sidebar
  sidebarListHide: function () {
    this.setData({
      sidebarListPop: false,
      shadeShow: false
    })
  },
  //点击进入选择车型页面
  goSelectProduct(e){
    let product = e.currentTarget.dataset.item;


    //请求车型列表
    wx.request({
      url: app.ajaxurl + 'index.php?r=weex/product/choose-product&sId=' + product.seriesId + '&subId=' + product.subCateId,
      success: ele => {
        this.setData({
          //品牌选择车型列表标题
          productName: product.seriesName,
          //品牌选择车型列表数据
          productList: ele.data.proList,
          //显示选择品牌车型的弹窗
          selectProductShow:true,
        })
      }
    })
    // wx.setStorage({
    //   key: 'selectProduct',
    //   data: product,
    //   success:res => {
    //     wx.navigateTo({
    //       url: '../selectProduct/selectProduct',
    //     })
    //   }
    // })
  },
  //点击车型选择车型
  selectProduct(e) {
    let productId = e.currentTarget.dataset.productid;
    let name = e.currentTarget.dataset.name;
    if (this.data.productId == productId) {
      return
    }


    let compareHistory = this.data.compareHistory;
    let has = true;
    let item = {};
    item.F_ProductId = productId;
    item.F_ProductName = name;
    compareHistory.forEach(ele => {
      if (ele.F_ProductId == productId){
        has = false;
        return ;
      } 
    })
    
    if (has){
      compareHistory.unshift(item)
    }

    //存储历史对比信息
    wx.setStorage({
      key: 'compareHistory',
      data: compareHistory
    })

    //查看缓存数据
    let compareData = this.data.compareData;
    //获取是第一个位置还是第二个位置
    wx.getStorage({
      key: 'compareNumber',
      success: num => {
        console.log(compareData)
        console.log(this.data.seriesId)
        if (num.data == 0) {
          compareData[this.data.seriesId].unshift(productId)
        } else {
          compareData[this.data.seriesId].push(productId)
        }
        //重新写入对比信息
        wx.setStorage({
          key: 'compareData',
          data: compareData,
          success: () => {
            //存储个缓存，代表选中了车型
            wx.setStorage({
              key: 'addProduct',
              data: true,
              success:() => {
                wx.navigateBack()
              }
            })
          }
        })
      },
    })
  },
  //清除缓存
  clearHistory(e){
    let index = e.currentTarget.dataset.index;
    let compareHistory = [];

    if(index != 'all'){
      compareHistory = this.data.compareHistory;
      compareHistory.splice(index,1)
    }
    //重新渲染
    this.setData({
      compareHistory: compareHistory
    })

    //重新缓存对比历史记录
    wx.setStorage({
      key: 'compareHistory',
      data: compareHistory,
    })
  },
  // 点击索引导航
  indexNav(e) {
    let index = e.target.dataset.index;
    this.setData({
      indicateShow: false,
      navInfo:index
    })
    let time = setTimeout(() => {
      this.setData({
        indicateShow: true,
      })
      clearTimeout(time)
    }, 500)
  },
  alert(text) {
    wx.showToast({
      title: text,
      icon: 'success',
      duration: 2000
    })
  },
  //返回选择品牌页面
  back(){
    this.setData({
      selectProductShow:false,
    })
  }
})