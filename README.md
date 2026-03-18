# RunMate - AI个性化跑步计划助手

## 产品简介
RunMate 是一款基于大语言模型的智能跑步助手微信小程序，提供：
- AI 个性化训练计划生成
- 实时 AI 教练对话
- 跑步中 AI 激励陪跑
- 跑后 AI 数据复盘

## 技术架构
- 前端：微信小程序原生开发
- 后端：Python Flask
- AI能力：智谱GLM大模型
- 部署：Railway云平台

## 项目结构
- `/runmate_backend` - Python Flask 后端服务
- `/runmate_miniprogram` - 微信小程序前端

## 在线体验
后端API地址：（部署后填写Railway地址）

## 产品文档
- 用户研究报告
- 竞品分析报告
- PRD文档
- 业务流程图
```

点 **Commit changes** 保存。

---

## 第二部分：部署后端到 Railway

Railway 是一个免费的云部署平台，可以让你的 Flask 后端 24 小时运行，面试官随时能访问。

**Step 1：注册 Railway**

1. 打开 **railway.app**
2. 点 **"Login"** → **用 GitHub 账号登录**（直接授权就行）

**Step 2：准备部署文件**

在你的 `runmate_backend` 文件夹里，确保有这几个文件：

**文件 1：`requirements.txt`**（你已经有了）
```
flask==3.0.0
flask-cors==4.0.0
zhipuai>=2.1.0
gunicorn==21.2.0
```

**文件 2：`Procfile`**（新建，告诉 Railway 怎么启动你的应用）
```
web: gunicorn app:app --bind 0.0.0.0:$PORT
```

**文件 3：`runtime.txt`**（新建，指定 Python 版本）
```
python-3.11.0
