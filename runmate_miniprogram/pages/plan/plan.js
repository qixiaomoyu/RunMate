// pages/plan/plan.js
const app = getApp()

Page({
  data: {
    goalOptions: ['完成第一个5km', '挑战半程马拉松', '全程马拉松备赛', '提升配速', '减脂塑形'],
    levelOptions: ['新手（月跑<20km）', '初级（月跑20-50km）', '中级（月跑50-100km）', '进阶（月跑100km+）'],
    daysOptions: ['每周3天', '每周4天', '每周5天'],
    goalIndex: 1,
    levelIndex: 1,
    daysIndex: 1,
    loading: false,
    planData: null,
    errorMsg: ''
  },

  onGoalChange(e)  { this.setData({ goalIndex:  parseInt(e.detail.value) }) },
  onLevelChange(e) { this.setData({ levelIndex: parseInt(e.detail.value) }) },
  onDaysChange(e)  { this.setData({ daysIndex:  parseInt(e.detail.value) }) },

  generatePlan() {
    this.setData({ loading: true, errorMsg: '', planData: null })

    const goal  = this.data.goalOptions[this.data.goalIndex]
    const level = this.data.levelOptions[this.data.levelIndex]
    const days  = this.data.daysOptions[this.data.daysIndex]

    wx.request({
      url: app.globalData.baseUrl + '/generate-plan',
      method: 'POST',
      data: { goal, level, days, injury: '无' },
      timeout: 120000,
      success: (res) => {
        if (res.data.success) {
          const planData = res.data.data
          app.globalData.currentPlan = planData
          this.setData({ planData, loading: false })
          wx.showToast({ title: '计划生成成功！', icon: 'success' })
        } else {
          this.setData({ loading: false, errorMsg: '生成失败：' + res.data.error })
        }
      },
      fail: (err) => {
        this.setData({ loading: false, errorMsg: '网络连接失败，请检查后端服务是否启动' })
        console.error(err)
      }
    })
  }
})
