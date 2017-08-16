let app = getApp(),
    util = require('../../utils/util.js');
// pages/brand/brand.js
Page({
  data: {
    // 推荐品牌列表
    recommendList:[],
    // 品牌了列表
    brandList:[],
    // 索引导航
    indexNav:[],
    // 更多品牌列表
    otherBrandList:[],
    // sidebar
    sidebarList:{},
    otherBrandShow:false,
    indicateShow:true,
    indicateText:'',
    activeIndex:'',
    navInfo:'',
    // 是否显示 sidebar
    sidebarListPop: false,
    //sidebar  遮罩层
    shadeShow:false,
    // sidebar 所有数据
    sidebarData:{},
    // sidebar 更多车系
    moreSeriesShow:false,
    // 导航条距离顶部的距离
    navTop:200,
    // 回顶部显示隐藏
    goTop:false,
    // 是否禁止页面滑动
    noScroll:'none',
    // 刚开始隐藏展开更多车系按钮
    moreShow: false,
    animation:'',
    //错误弹层是否显示和提示
    errPop:false,
    errText:'',
  },


  onLoad: function () {

    //清除缓存
    wx.removeStorage({key: 'seriesInfo'})
    wx.removeStorage({ key: 'myRegion' })
    wx.removeStorage({ key: 'locationInfo' })
    wx.removeStorage({ key: 'myDate' })
    wx.removeStorage({ key: 'provinceData' })
    wx.removeStorage({ key: 'hotLocation' })
    wx.removeStorage({ key: 'my_region' })
    wx.removeStorage({ key: 'PhotoTabName' })
    wx.removeStorage({ key: 'imgInfoData' })
    wx.removeStorage({ key: 'compareTask' })

    wx.removeStorage({ key: 'compareData' })
    wx.removeStorage({ key: 'selectProduct' })
    wx.removeStorage({ key: 'compareNumber' })

    wx.removeStorage({ key: 'productData' })
    wx.removeStorage({ key: 'brandData' })


    wx.setNavigationBarTitle({
      title: '品牌选车'
    })
    // 请求品牌列表数据

    wx.getStorage({
      key: 'brandData',
      success: res => {
        this.setData({
          recommendList: res.recommend,
          brandList: res.brandList,
          indexNav: res.letter,
          otherBrandList: res.otherBrandList,
        })

        let time = setTimeout(() => {
          this.setData({
            moreShow: true
          })
          clearTimeout(time)
        }, 2000)   

        //请求品牌数据
        this.getBrandData()    
      },
      fail:error => {
        //请求品牌数据
        this.getBrandData()
      }
    })

  },
  //请求品牌数据
  getBrandData(){
    wx.request({
      url: app.ajaxurl + 'index.php?r=api/gethotbrandlist&haveGroup=1&noIndex=1',
      data: {},
      success: (res) => {
        if (res.errMsg == 'request:ok') {
          this.setData({
            recommendList: res.data.recommend,
            brandList: res.data.brandList,
            indexNav: res.data.letter,
            otherBrandList: res.data.otherBrandList,
          })

          let time = setTimeout(() => {
            this.setData({
              moreShow: true
            })
            clearTimeout(time)
          }, 2000)

          // wx.setStorage({
          //   key: 'brandData',
          //   data: res.data,
          // })
        }
      },
    })
  },

  // 点击返回顶部
  backTop:function(e){
    this.setData({
      navInfo:'top'
    })
  },

  // 页面滑动索引导航固定
  scrollNav:function(e){
    let number = 200
    // if (e.detail.scrollTop < 200){
    //   this.setData({
    //     navTop: number - e.detail.scrollTop
    //   })
    // }
    if (e.detail.scrollTop >= 1500){
      this.setData({
        goTop:true
      })
    }else{
      this.setData({
        goTop: false
      })
    }
  },

  // 点击展开更多品牌
  moreBrand:function(){
    let deg = 180;
    if (this.data.otherBrandShow){
      deg = 0;
    }
    this.animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'linear',
      delay: 0,
      transformOrigin: '50% 50% 0',
      success: function (res) {
        console.log("res")
      }
    })
    this.animation.rotate(deg).step()
    this.setData({
      otherBrandShow: !this.data.otherBrandShow,
      animation: this.animation.export()
    })
  },

  // 点击索引导航
  indexNav:function(e){
    let index = e.target.dataset.index;
    this.setData({
      activeIndex: index,
      indicateShow:false,
      navInfo: index,
    })
    let time = setTimeout(() => {
      this.setData({
        indicateShow: true,
      })
      clearTimeout(time)
    }, 500)
  },

  // 点击品牌显示 sidebar
  sidebarShow(e){
   let ajaxUrl =  e.currentTarget.dataset.ajaxurl
    wx.request({
      url: ajaxUrl + '&isJson=1&noIndex=1',
      data: {},
      success: (res) => {
        if (res.errMsg == 'request:ok') {
          this.setData({
            sidebarListPop:true,
            shadeShow: true,
            sidebarData: res.data,
            noScroll: 'none'        
          })
        }
      }
    })
  },
  // 点击展开更多车系
  moreSeries:function(){
    let deg = 180;
    if (this.data.moreSeriesShow) {
      deg = 0;
    }
    this.animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'linear',
      delay: 0,
      transformOrigin: '50% 50% 0',
      success: function (res) {
        console.log("res")
      }
    })
    this.animation.rotate(deg).step()
    this.setData({
      moreSeriesShow: !this.data.moreSeriesShow,
      animation: this.animation.export()
    })
  },
  // 隐藏 sidebar
  sidebarListHide:function (){
    this.setData({
      sidebarListPop:false,
      shadeShow: false,
      noScroll: 'vertical' 
    })
  },
  // 点击侧边栏内容
  clickSidebar(e){
    console.log()

    //存储品牌和车系数据
    wx.setStorage({
      key: 'seriesInfo',
      data: e.currentTarget.dataset.item,
      success: function(res){
        wx.navigateTo({
          url: '../series/series'
        })
      },
      fail: function() {
        this.setData({
          errText:'网络错误~',
          errPop:true
        })
      }
    })
  },
    //关闭报错弹层
  closeErrPop(){
    this.setData({
      errPop:false,
      errText:'',
    })
  },
  //转发
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '品牌选车',
      path: 'pages/brand/brand',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})