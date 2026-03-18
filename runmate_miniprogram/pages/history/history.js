// pages/history/history.js
Page({
  data: {
    records: [
      { id:1, type:'节奏跑',   date:'3月15日', pace:"5'44\"", duration:'35分钟', km:'8.2', isBest:false },
      { id:2, type:'长距离跑', date:'3月13日', pace:"6'15\"", duration:'68分钟', km:'11.0',isBest:false },
      { id:3, type:'慢跑恢复', date:'3月12日', pace:"6'50\"", duration:'28分钟', km:'5.0', isBest:false },
      { id:4, type:'间歇训练', date:'3月10日', pace:"5'20\"", duration:'40分钟', km:'7.1', isBest:true  },
      { id:5, type:'慢跑',     date:'3月8日',  pace:"6'30\"", duration:'30分钟', km:'5.0', isBest:false },
    ]
  }
})
