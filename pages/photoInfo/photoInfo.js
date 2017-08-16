// pages/photoInfo/photoInfo.js
let app = getApp(),
  util = require('../../utils/util.js');
Page({
  data: {          
    //标题名称
    titleName: '',
    //车型id
    productId: '',
    //当前选项的TypeId
    typeId: '',
    tagName:[],
    // 图片的详细信息
    imgDataList: {},
    // 暂时存储的轮播图数据
    arr: [],
    imgList: [],
    // 图片总数量
    total:0,
    // 图片的下标
    index:0,
    // page
    page:1,
    // 隐藏其他
    imgInfo:false,
    // 请求次数
    forNum:0,
    //看图模式
    simpleModel:false,
    //是否显示询底价按钮
    priceButton:false,
  },
  onLoad: function (options) {

    //获取来源
    wx.getStorage({
      key: 'photoSource',
      success: res => {
        console.log(res,'res')
        this.setData({
          priceButton:true,
        })

        wx.removeStorage({key: 'photoSource'})
      },
    })

    // 获取图片页面的tab头部标题
    wx.getStorage({
      key: 'PhotoTabName',
      success:res => {
        if (res.errMsg == 'getStorage:ok'){
          this.setData({
            tagName:res.data
          })
        }
      },
    })

    // 获取车型id
    wx.getStorage({
      key: 'productId',
      success: res => {
        this.setData({
          productId:res.data
        })
        wx.removeStorage({
          key: 'productId',
        })
      },
    })

    //获取图片详情信息
    wx.getStorage({
      key: 'imgInfoData',
      success: res => {
        this.setData({
          imgDataList:res.data,
          index: res.data.bs - 1,
          typeId: res.data.typeId,
        })
        console.log(res.data,'res.data')
        // console.log(this.data.imgDataList,'this.data.imgDataList')
        let forNum = Math.ceil(res.data.bs / 100) == 0 ? 1 : Math.ceil(res.data.bs / 100);

        this.setData({
          forNum: forNum,
        })
        
        //请求图片数据
        this.getImgData();

      },
    })
  },
  //请求图片数据
  getImgData(){
    let ajaxUrl = app.ajaxurl + '/index.php?r=api/getweekpicturedetail&imageId=' + this.data.imgDataList.F_ImageId + '&typeId=' + this.data.typeId + '&page=' + this.data.page;
    
    //查看有没有车型id
    if (this.data.productId) {
      ajaxUrl += '&productId=' + this.data.productId;
    }
    console.log(ajaxUrl)
    wx.request({
      url: ajaxUrl,
      success:ele => {
        //只有没有标题的时候运行一次
        // if (!this.data.titleName) {
          //车型
          let titleName = '';
          if (ele.data.proName) {
            titleName = ele.data.proName + ele.data.typeName + '图片';
            //发送GA
            // this.goUrlGa(weex.config.deviceId, 'product.m.360che.com', '产品库-访问车型图片最终页', this.titleName)
          } else {//车系
            titleName = ele.data.title;
            //发送GA
            // this.goUrlGa(weex.config.deviceId, 'product.m.360che.com', '产品库-子类车系图片最终页', this.titleName)
          }
          //设置标题
          wx.setNavigationBarTitle({
            title: titleName
          })
        // }
        console.log(ele,'ele')

          //图片列表详细数据
        let imgList = this.data.imgList;
        imgList.push(...ele.data.data)

        this.setData({
          //图片列表
          imgList: imgList,
          //图片总数量
          total: ele.data.total,
          //设置数据
          titleName: titleName,
        })

          // if (this.index >= this.total) {
          //   this.index = -(this.total - 1)
          // }
          
        if (this.data.forNum > 1){
          console.log(this.data.forNum)
          this.setData({
            forNum:this.data.forNum-=1,
            page:this.data.page+=1,
          })
          this.getImgData()
        }
      }
    })
  },
  imgChange(e){
    this.setData({
      index: e.detail.current
    })
  },
  alert(text) {
    wx.showToast({
      title: text,
      icon: 'success',
      duration: 2000
    })
  },
  //滑动图片，更改图片的index
  switchTab(e){
    let typeId = e.currentTarget.dataset.typeid;

    this.setData({
      //更换tab头
      typeId: typeId,
      // 重新变成空数组
      imgList:[],
      // 页数重新变成1
      page:1,
      // 把下标置为0
      index:0,
    })
    this.getImgData();
  },
  //点击询底价按钮，进入询底价页面
  goFooterPrice(e){
    let productId = e.currentTarget.dataset.productid;
    console.log(productId)

    //存储询底价页面车型id
    wx.setStorage({
      key: 'priceProductId',
      data: productId,
      success: res => {
        wx.navigateTo({
          url: '../footerPrice/footerPrice',
        })
      }
    })
  },
  //看图模式
  simpleModel(){
    this.setData({
      simpleModel: !this.data.simpleModel
    })
    console.log(this.data.simpleModel)
  }
})