// pages/coach/coach.js
const app = getApp()
let msgId = 0

Page({
  data: {
    messages: [
      { id: msgId++, role: 'ai', content: '你好！我是你的 AI 跑步教练 🏃 你可以问我关于训练计划、配速提升、伤病预防的任何问题。根据你最近的训练，状态不错，继续保持！' }
    ],
    inputText: '',
    scrollId: '',
    quickQuestions: ['赛前建议', '跑步膝怎么预防？', '怎么提升配速？', '跑前热身方法', '今天适合跑步吗？']
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value })
  },

  quickAsk(e) {
    this.setData({ inputText: e.currentTarget.dataset.q })
    this.sendMessage()
  },

  sendMessage() {
    const text = this.data.inputText.trim()
    if (!text) return

    // 添加用户消息
    const userMsg = { id: msgId++, role: 'user', content: text }
    const loadingMsg = { id: msgId++, role: 'loading', content: '' }
    const loadingId = loadingMsg.id

    this.setData({
      messages: [...this.data.messages, userMsg, loadingMsg],
      inputText: '',
      scrollId: 'msg' + loadingId
    })

    // 构建历史记录（只取非loading的）
    const history = this.data.messages
      .filter(m => m.role !== 'loading')
      .slice(-6)
      .map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }))

    wx.request({
      url: app.globalData.baseUrl + '/chat',
      method: 'POST',
      data: {
        message: text,
        history,
        profile: app.globalData.userProfile
      },
      timeout: 15000,
      success: (res) => {
        const reply = res.data.success ? res.data.reply : '教练暂时不在，请稍后再试 😅'
        const newId = msgId++
        const msgs = this.data.messages.filter(m => m.id !== loadingId)
        msgs.push({ id: newId, role: 'ai', content: reply })
        this.setData({ messages: msgs, scrollId: 'msg' + newId })
      },
      fail: () => {
        const newId = msgId++
        const msgs = this.data.messages.filter(m => m.id !== loadingId)
        msgs.push({ id: newId, role: 'ai', content: '网络连接失败，请检查网络后重试 📶' })
        this.setData({ messages: msgs, scrollId: 'msg' + newId })
      }
    })
  }
})
