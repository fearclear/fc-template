// app.ts
App({
  globalData: {},
  async onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    try {
      // 登录
      const res = await wx.login()
      console.log(res.code)
    } catch (error) {
      console.warn('没有拿到登录信息')
    }
  }
})
