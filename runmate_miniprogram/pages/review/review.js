// pages/review/review.js
const app = getApp()

Page({
  data: { runData: {}, reviewText: '', loading: true },

  onLoad(options) {
    const runData = JSON.parse(decodeURIComponent(options.data || '{}'))
    this.setData({ runData })
    this.fetchReview(runData)
  },

  fetchReview(runData) {
    wx.request({
      url: app.globalData.baseUrl + '/review',
      method: 'POST',
      data: runData,
      timeout: 15000,
      success: (res) => {
        const text = res.data.success ? res.data.review : '完成得不错！记得做拉伸放松，明天继续加油 💪'
        this.setData({ reviewText: text, loading: false })
      },
      fail: () => {
        this.setData({ reviewText: '完成得不错！记得做拉伸放松，明天继续加油 💪', loading: false })
      }
    })
  },

  goHome() { wx.switchTab({ url: '/pages/index/index' }) }
})
