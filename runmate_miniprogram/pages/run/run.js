// pages/run/run.js
const app = getApp()
let timer = null
let encourageTimer = null

Page({
  data: {
    running: false,
    seconds: 0,
    distRaw: 0,       // 原始距离（数字）
    distance: '0.00', // 展示用
    timeStr: '00:00',
    pace: "--'--\"",
    calories: 0,
    progressPct: 0,
    encourageMsg: ''
  },

  onUnload() {
    this.stopTimers()
  },

  stopTimers() {
    if (timer) clearInterval(timer)
    if (encourageTimer) clearInterval(encourageTimer)
  },

  toggleRun() {
    const running = !this.data.running
    this.setData({ running })

    if (running) {
      // 开始/继续
      timer = setInterval(() => this.tick(), 300)
      // 每30秒获取一次激励语
      encourageTimer = setInterval(() => this.fetchEncourage(), 30000)
      // 立刻获取一条开场激励
      setTimeout(() => this.fetchEncourage(), 1000)
    } else {
      this.stopTimers()
    }
  },

  tick() {
    const s = this.data.seconds + 1 // 实际按0.3秒算，但+1模拟效果
    const dist = this.data.distRaw + 0.0013 + Math.random() * 0.0004
    const timeStr = this.formatTime(s)
    const pace = s > 5 ? this.calcPace(s, dist) : "--'--\""
    const calories = Math.round(dist * 62)
    const progressPct = Math.min(100, Math.round(dist / 5 * 100))

    this.setData({
      seconds: s,
      distRaw: dist,
      distance: dist.toFixed(2),
      timeStr,
      pace,
      calories,
      progressPct
    })
  },

  formatTime(s) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0')
  },

  calcPace(s, dist) {
    const paceS = Math.round(s / dist)
    const m = Math.floor(paceS / 60)
    const sec = paceS % 60
    return `${m}'${String(sec).padStart(2, '0')}"`
  },

  fetchEncourage() {
    if (!this.data.running) return
    wx.request({
      url: app.globalData.baseUrl + '/encourage',
      method: 'POST',
      data: {
        distance: parseFloat(this.data.distance),
        target_km: 5,
        pace_status: '正常'
      },
      success: (res) => {
        if (res.data.success) {
          this.setData({ encourageMsg: res.data.message })
        }
      }
    })
  },

  endRun() {
    this.stopTimers()
    this.setData({ running: false })

    if (this.data.distRaw < 0.1) {
      wx.showToast({ title: '距离太短啦', icon: 'none' })
      return
    }

    // 跳转到复盘页，传入跑步数据
    const params = encodeURIComponent(JSON.stringify({
      distance: this.data.distance,
      duration: this.data.timeStr,
      avg_pace: this.data.pace,
      target_km: 5,
      run_type: '慢跑'
    }))
    wx.navigateTo({ url: `/pages/review/review?data=${params}` })

    // 重置数据
    this.setData({ seconds: 0, distRaw: 0, distance: '0.00', timeStr: '00:00', pace: "--'--\"", calories: 0, progressPct: 0, encourageMsg: '' })
  }
})
