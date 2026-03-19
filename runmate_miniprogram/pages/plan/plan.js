// pages/plan/plan.js
const app = getApp()

// 跑步小知识库 - 等待时轮播展示
const runningTips = [
  "跑步前热身5分钟，能降低50%的受伤风险",
  "新手建议用\"能说话\"的配速跑，不要追求速度",
  "跑后拉伸比跑前更重要，每个动作保持30秒",
  "每周跑量增幅不超过10%，是防受伤的黄金法则",
  "晨跑前喝一杯温水，空腹跑步容易低血糖",
  "跑步时呼吸节奏：两步一吸，两步一呼",
  "选对跑鞋比什么训练技巧都重要",
  "休息日不是偷懒，是让肌肉变强的关键时刻",
  "跑步后30分钟内补充蛋白质，恢复效果最佳",
  "坚持跑步21天，你的身体就会开始适应",
  "下雨天也可以跑步，但注意防滑和保暖",
  "跑步是最简单的冥想，专注呼吸，放空大脑"
]

Page({
  data: {
    // 用户选项
    goalOptions: ['减脂塑形', '完成5km', '完成10km', '半马备赛', '健康维护'],
    levelOptions: ['入门（刚开始跑步）', '初级（月跑20-50km）', '中级（月跑50-100km）', '高级（月跑100km+）'],
    daysOptions: ['每周3天', '每周4天', '每周5天', '每周6天'],
    goalIndex: 0,
    levelIndex: 1,
    daysIndex: 1,
    // 身体数据
    genderOptions: ['男', '女'],
    genderIndex: 0,
    heightOptions: ['155cm', '160cm', '165cm', '170cm', '175cm', '180cm', '185cm', '190cm'],
    heightIndex: 3,
    weightOptions: ['45kg', '50kg', '55kg', '60kg', '65kg', '70kg', '75kg', '80kg', '85kg', '90kg'],
    weightIndex: 4,
    habitOptions: ['几乎不运动', '偶尔运动（每月1-2次）', '规律运动（每周1-2次）', '经常运动（每周3次+）'],
    habitIndex: 0,

    // 加载状态
    isLoading: false,
    loadingTip: '',
    loadingProgress: 0,
    loadingStage: '',

    // 计划数据
    hasPlan: false,
    currentWeek: 1,
    totalWeeks: 8,
    weekData: null,
    allWeeks: {},  // 缓存已加载的周数据
    planSummary: '',

    // 加载更多周
    isLoadingMore: false
  },

  onLoad() {
    // 随机显示一条tip
    this.setData({
      loadingTip: runningTips[Math.floor(Math.random() * runningTips.length)]
    })
  },

  // 选择器变化
  onGoalChange(e) { this.setData({ goalIndex: e.detail.value }) },
  onLevelChange(e) { this.setData({ levelIndex: e.detail.value }) },
  onDaysChange(e) { this.setData({ daysIndex: e.detail.value }) },
  onGenderChange(e) { this.setData({ genderIndex: e.detail.value }) },
  onHeightChange(e) { this.setData({ heightIndex: e.detail.value }) },
  onWeightChange(e) { this.setData({ weightIndex: e.detail.value }) },
  onHabitChange(e) { this.setData({ habitIndex: e.detail.value }) },

  // 生成计划（只生成第1周）
  generatePlan() {
    this.setData({
      isLoading: true,
      loadingProgress: 0,
      loadingStage: '正在分析你的身体数据...',
      loadingTip: runningTips[Math.floor(Math.random() * runningTips.length)]
    })

    // 启动加载动画：轮播tips + 模拟进度
    this.startLoadingAnimation()

    wx.request({
      url: app.globalData.baseUrl + '/generate-plan',
      method: 'POST',
      data: {
        goal: this.data.goalOptions[this.data.goalIndex],
        level: this.data.levelOptions[this.data.levelIndex],
        days: this.data.daysOptions[this.data.daysIndex],
        injury: '无',
        gender: this.data.genderOptions[this.data.genderIndex],
        height: this.data.heightOptions[this.data.heightIndex],
        weight: this.data.weightOptions[this.data.weightIndex],
        habit: this.data.habitOptions[this.data.habitIndex],
        week: 1
      },
      timeout: 120000,
      success: (res) => {
        if (res.data.success || res.data.data) {
          let weekData = res.data.data
          let allWeeks = {}
          allWeeks[1] = weekData
          this.setData({
            isLoading: false,
            hasPlan: true,
            currentWeek: 1,
            weekData: weekData,
            allWeeks: allWeeks,
            planSummary: weekData.summary || '你的专属训练计划已生成'
          })
        } else {
          this.setData({ isLoading: false })
          wx.showToast({ title: '生成失败，请重试', icon: 'none' })
        }
      },
      fail: (err) => {
        this.setData({ isLoading: false })
        wx.showToast({ title: '网络超时，请重试', icon: 'none' })
      }
    })
  },

  // 加载动画：轮播tips + 模拟进度条
  startLoadingAnimation() {
    let progress = 0
    const stages = [
      { at: 0, text: '正在分析你的身体数据...' },
      { at: 20, text: '制定配速策略...' },
      { at: 45, text: 'AI教练正在编排训练计划...' },
      { at: 70, text: '优化每日训练安排...' },
      { at: 90, text: '即将完成...' }
    ]

    // 每500ms更新进度
    this.progressTimer = setInterval(() => {
      if (!this.data.isLoading) {
        clearInterval(this.progressTimer)
        clearInterval(this.tipTimer)
        return
      }
      progress += Math.random() * 5 + 1
      if (progress > 95) progress = 95  // 不到100，等真正完成

      // 更新阶段文字
      let stage = stages[0].text
      for (let s of stages) {
        if (progress >= s.at) stage = s.text
      }

      this.setData({
        loadingProgress: Math.floor(progress),
        loadingStage: stage
      })
    }, 500)

    // 每3秒换一条tip
    this.tipTimer = setInterval(() => {
      if (!this.data.isLoading) {
        clearInterval(this.tipTimer)
        return
      }
      this.setData({
        loadingTip: runningTips[Math.floor(Math.random() * runningTips.length)]
      })
    }, 3000)
  },

  // 切换周数 - 上一周
  prevWeek() {
    if (this.data.currentWeek <= 1) return
    let week = this.data.currentWeek - 1
    this.showWeek(week)
  },

  // 切换周数 - 下一周
  nextWeek() {
    if (this.data.currentWeek >= this.data.totalWeeks) return
    let week = this.data.currentWeek + 1
    this.showWeek(week)
  },

  // 显示某一周（如果已缓存直接显示，否则请求后端）
  showWeek(week) {
    // 已缓存，直接展示
    if (this.data.allWeeks[week]) {
      this.setData({
        currentWeek: week,
        weekData: this.data.allWeeks[week]
      })
      return
    }

    // 未缓存，请求后端生成
    this.setData({ isLoadingMore: true, currentWeek: week })

    wx.request({
      url: app.globalData.baseUrl + '/generate-plan',
      method: 'POST',
      data: {
        goal: this.data.goalOptions[this.data.goalIndex],
        level: this.data.levelOptions[this.data.levelIndex],
        days: this.data.daysOptions[this.data.daysIndex],
        injury: '无',
        gender: this.data.genderOptions[this.data.genderIndex],
        height: this.data.heightOptions[this.data.heightIndex],
        weight: this.data.weightOptions[this.data.weightIndex],
        habit: this.data.habitOptions[this.data.habitIndex],
        week: week
      },
      timeout: 120000,
      success: (res) => {
        if (res.data.success || res.data.data) {
          let weekData = res.data.data
          let allWeeks = this.data.allWeeks
          allWeeks[week] = weekData
          this.setData({
            isLoadingMore: false,
            currentWeek: week,
            weekData: weekData,
            allWeeks: allWeeks
          })
        } else {
          this.setData({ isLoadingMore: false })
          wx.showToast({ title: '加载失败，请重试', icon: 'none' })
        }
      },
      fail: () => {
        this.setData({ isLoadingMore: false })
        wx.showToast({ title: '网络超时，请重试', icon: 'none' })
      }
    })
  },

  // 重新生成计划
  regenerate() {
    this.setData({
      hasPlan: false,
      allWeeks: {},
      weekData: null,
      currentWeek: 1
    })
  },

  onUnload() {
    if (this.progressTimer) clearInterval(this.progressTimer)
    if (this.tipTimer) clearInterval(this.tipTimer)
  }
})
