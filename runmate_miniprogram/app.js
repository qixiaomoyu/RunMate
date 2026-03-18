// app.js — 全局配置
App({
  globalData: {
    // ⚠️ 部署后端到Railway后，把这里换成你的Railway URL
    // 本地测试时用 http://localhost:5000
    baseUrl: 'http://127.0.0.1:5000',

    // 用户数据（模拟，正式版接数据库）
    userProfile: {
      goal: '挑战半程马拉松',
      level: '初级',
      monthly_km: 28.4,
      last_run: '8.2km 节奏跑，配速5\'44"',
      streak: 12
    },

    // 当前训练计划（生成后存这里）
    currentPlan: null,

    // 今日任务
    todayTask: {
      type: '轻松慢跑',
      km: 5,
      pace: '6\'00"-6\'30"',
      duration: '约35分钟',
      tag: '恢复跑'
    }
  }
})
