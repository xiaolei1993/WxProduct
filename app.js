//app.js
App({
    onLaunch: function() {
        //调用API从本地缓存中获取数据
        var logs = wx.getStorageSync('logs') || []
        logs.unshift(Date.now())
        wx.setStorageSync('logs', logs)
        this.ajaxurl = 'https://product.360che.com/'
    },
    getUserInfo: function(cb) {
        var that = this
        if (this.globalData.userInfo) {
            typeof cb == "function" && cb(this.globalData.userInfo)
        } else {
            //调用登录接口
            wx.login({
                success: function() {
                    wx.getUserInfo({
                        success: function(res) {
                            that.globalData.userInfo = res.userInfo
                            typeof cb == "function" && cb(that.globalData.userInfo)
                        }
                    })
                }
            })
        }
    },
    //进入页面判断是否是转发过来
    updateDataForShare(options, _this, success, fail) {
        console.log(options.share);
        if (options.share) {
          let share = JSON.parse(options.share)
            //给data信息赋值
            _this.setData(share)
            //存储信息缓存
            for (let key in share){
              wx.setStorage({
                key: key,
                data: share[key],
              })
            }
            // wx.showToast({
            //   title: '转发进来',
            //   icon: 'success',
            //   duration: 2000
            // })
            success && success.call(_this)
        }else{
          // wx.showToast({
          //   title: '正常进来',
          //   icon: 'success',
          //   duration: 2000
          // })
            fail && fail.call(_this)
        }
    },
    //页面分享转发
    shareCurrentPage(shareParams, _this) {
        let [params, path, title] = [{}, '', ''];
        shareParams.forEach(item => {
            params[item] = _this.data[item]
        })
        title = this.globalData.shareTitle
        path = `${_this.route}?share=${JSON.stringify(params)}`
        console.log(path)
        console.log(title)
        return {
            title: title,
            path: path,
            success: function(res) {
                // 转发成功
              wx.showToast({
                title: '成功',
                icon: 'success',
                duration: 2000
              })
            },
            fail: function(res) {
                // 转发失败
            }
        }
    },
    globalData: {
        userInfo: null,
        // 分享的标题
        shareTitle: '',
        //显示loading
        showLoading: function(name) {
            return wx.showToast({
                title: name,
                icon: 'loading'
            });
        },
        //关闭loading
        hideLoading: function() {
            return wx.hideToast();
        }
    }
})
