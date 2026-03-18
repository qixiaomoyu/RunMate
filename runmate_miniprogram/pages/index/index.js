// pages/index/index.js — 首页逻辑
const app = getApp()

Page({
  data: {
    today: '',
    streak: 12,
    monthly_km: '28.4',
    best_pace: "5'32\"",
    weekDone: 3,
    weekTotal: 5,
    weekPct: 60,
    weekLeft: 2,
    todayTask: {},
    aiTip: '正在加载教练建议...'
  },

  onLoad() {
    const now = new Date()
    const month = now.getMonth() + 1
    const day = now.getDate()
    this.setData({
      today: `${month}月${day}日`,
      todayTask: app.globalData.todayTask
    })
    this.loadAiTip()
  },

  onShow() {
    // 每次显示时刷新
  },

  // 加载AI今日提示
  loadAiTip() {
    const profile = app.globalData.userProfile
    wx.request({
      url: app.globalData.baseUrl + '/chat',
      method: 'POST',
      data: {
        message: '根据我昨天完成了一次长距离跑，今天的训练任务是轻松慢跑5km，请给我一句今日训练提示，30字以内。',
        history: [],
        profile: profile
      },
      success: (res) => {
        if (res.data.success) {
          this.setData({ aiTip: res.data.reply })
        } else {
          this.setData({ aiTip: '今天的恢复跑，保持轻松节奏，感受呼吸就好 🌿' })
        }
      },
      fail: () => {
        this.setData({ aiTip: '今天的恢复跑，保持轻松节奏，感受呼吸就好 🌿' })
      }
    })
  },

  goRun() {
    wx.switchTab({ url: '/pages/run/run' })
  }
})
