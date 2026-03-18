# RunMate MVP · 启动指南

## 你拿到的两个文件夹

```
runmate_backend/     ← Python后端，用 PyCharm 打开
  app.py             ← 主程序（4个AI接口）
  requirements.txt   ← 依赖包列表
  Procfile           ← Railway部署配置

runmate_miniprogram/ ← 微信小程序，用微信开发者工具打开
  app.js / app.json / app.wxss   ← 全局配置
  pages/
    index/   ← 首页
    plan/    ← 计划生成
    run/     ← 跑步中
    coach/   ← AI教练对话
    history/ ← 历史记录
    review/  ← 跑后复盘
```

---

## 第一步：启动后端（PyCharm）

### 1. 打开项目
用 PyCharm 打开 `runmate_backend` 文件夹

### 2. 填入你的 GLM API Key
打开 `app.py`，找到第9行：
```python
GLM_API_KEY = os.environ.get("GLM_API_KEY", "你的完整GLM_API_KEY填在这里")
```
把引号里的文字替换成你的真实 Key，例如：
```python
GLM_API_KEY = os.environ.get("GLM_API_KEY", "9739xxxx.WX04xxxx")
```

### 3. 安装依赖
在 PyCharm 底部打开 Terminal，输入：
```bash
pip install -r requirements.txt
```
等待安装完成（大约1分钟）

### 4. 运行后端
在 Terminal 输入：
```bash
python app.py
```
看到如下输出说明成功：
```
* Running on http://0.0.0.0:5000
```

### 5. 测试后端是否正常
打开浏览器访问 http://localhost:5000
看到 `{"status": "RunMate Backend Running ✅"}` 说明后端正常运行

---

## 第二步：启动小程序（微信开发者工具）

### 1. 打开项目
- 打开微信开发者工具
- 点击「+」新建项目
- 目录选择 `runmate_miniprogram` 文件夹
- AppID 填入：`wx53602f9d3ff7ab39`
- 点击「确定」

### 2. 配置后端地址
打开 `app.js`，第5行：
```javascript
baseUrl: 'http://localhost:5000',
```
本地测试不用改，保持这个地址即可。

### 3. 开启「不校验域名」
工具栏点击「详情」→「本地设置」→ 勾选「不校验合法域名」
（这样本地开发时才能访问 localhost）

### 4. 预览效果
点击微信开发者工具左上角「编译」按钮，右侧模拟器会显示小程序界面。

---

## 第三步：测试核心功能

后端和小程序都启动后，按以下顺序测试：

**测试1：AI生成计划**
- 点击底部「计划」Tab
- 选择目标/水平/天数
- 点击「生成我的专属计划」
- ✅ 成功：3秒内出现计划内容和周日历

**测试2：AI教练对话**
- 点击底部「AI教练」Tab
- 点击快捷问题「如何提升配速？」
- ✅ 成功：AI返回个性化回复

**测试3：跑步+复盘**
- 点击底部「开跑」Tab
- 点击「开始跑步」，等待数据开始跳动
- 约10秒后点击「结束」
- ✅ 成功：跳转复盘页，AI生成复盘报告

---

## 常见报错处理

| 报错内容 | 原因 | 解决方法 |
|---------|------|---------|
| `Module not found: zhipuai` | 依赖未安装 | 重新运行 `pip install -r requirements.txt` |
| `Invalid API Key` | GLM Key 填错 | 检查 app.py 第9行的 Key 是否完整 |
| `网络连接失败` | 后端未启动 | 确认 PyCharm 里 `python app.py` 正在运行 |
| 小程序白屏 | 编译错误 | 看微信开发者工具底部「控制台」的红色报错 |
| `request:fail` | 域名未配置 | 确认勾选了「不校验合法域名」 |

遇到其他报错：把红色错误信息截图，发给 Claude 帮你看。

---

## 第四步：部署到线上（Railway）

本地测试没问题后，把后端部署到网上，这样手机真机也能用。

1. 去 railway.app 注册账号（用 GitHub 登录）
2. 新建项目 → Deploy from GitHub → 上传 `runmate_backend` 文件夹
3. 在 Variables 里添加环境变量：
   - Key: `GLM_API_KEY`
   - Value: 你的完整 GLM Key
4. 部署完成后会得到一个 URL，例如 `https://runmate-backend-xxxx.railway.app`
5. 把这个 URL 填入小程序 `app.js` 第5行的 `baseUrl`
6. 微信开发者工具里点「真机调试」，用手机扫码即可体验完整版

---

## 面试演示路径（3分钟）

1. 打开小程序，展示首页数据
2. 进入「计划」Tab → 填写信息 → 点击生成 → 等待AI输出（**核心亮点**）
3. 进入「AI教练」→ 问「我怎么提升配速？」→ 展示AI个性化回复
4. 进入「开跑」→ 点开始 → 展示实时数据跳动 → 点结束 → 展示AI复盘

**面试时说的话：**
「这是我独立设计并开发的 RunMate MVP，前端是微信小程序，后端是 Python Flask，
AI 能力接入了 GLM-4 大模型。核心功能包括：AI个性化训练计划生成、
实时AI陪跑激励、以及基于跑步数据的AI智能复盘。
整个产品从需求分析、竞品分析、PRD到原型落地，全程由我一人完成。」
