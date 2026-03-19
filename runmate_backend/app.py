from flask import Flask, request, jsonify
from flask_cors import CORS
from zhipuai import ZhipuAI
import os
import json

app = Flask(__name__)
CORS(app)  # 允许小程序跨域请求

# GLM API Key - 正式部署时从环境变量读取，本地测试直接填在这里
GLM_API_KEY = os.environ.get("GLM_API_KEY", "")

client = ZhipuAI(api_key=GLM_API_KEY)


# ───────────────────────────────────────────────
# 接口1：生成个性化训练计划（按周生成，提速）
# ───────────────────────────────────────────────
@app.route("/generate-plan", methods=["POST"])
def generate_plan():
    data = request.json
    goal = data.get("goal", "完成5km")
    level = data.get("level", "新手")
    days = data.get("days", "3天")
    injury = data.get("injury", "无")
    week = data.get("week", 1)  # 第几周，默认第1周

    # 根据周数给AI不同的指导
    if week == 1:
        week_hint = "这是第1周，从基础开始，强度较低。"
    elif week < 7:
        week_hint = f"这是第{week}周，训练量相比上周递增约10%。"
    elif week == 7:
        week_hint = "这是第7周减量恢复周，强度降低到第4周水平。"
    else:
        week_hint = "这是第8周最终冲刺周，为目标做最后准备。"

    prompt = f"""你是一名拥有10年经验的专业跑步教练。

用户信息：
- 跑步目标：{goal}
- 当前水平：{level}
- 每周可训练天数：{days}
- 伤病情况：{injury}

请生成8周训练计划中【第{week}周】的训练安排。{week_hint}

严格要求：
1. 只输出JSON，格式如下：
{{
  "week": {week},
  "theme": "本周主题（4-8字）",
  "summary": "本周训练说明（1句话）",
  "days": [
    {{"day": "周一", "type": "休息/慢跑/间歇跑/长跑/恢复跑", "km": 0, "pace": "-", "tip": "一句话建议"}},
    {{"day": "周二", "type": "慢跑", "km": 4, "pace": "6'30\\"", "tip": "保持轻松节奏"}},
    {{"day": "周三", "type": "休息", "km": 0, "pace": "-", "tip": "拉伸放松"}},
    {{"day": "周四", "type": "慢跑", "km": 5, "pace": "6'20\\"", "tip": "注意呼吸节奏"}},
    {{"day": "周五", "type": "休息", "km": 0, "pace": "-", "tip": "休息恢复"}},
    {{"day": "周六", "type": "长跑", "km": 7, "pace": "6'45\\"", "tip": "全程保持对话配速"}},
    {{"day": "周日", "type": "休息", "km": 0, "pace": "-", "tip": "主动恢复"}}
  ]
}}
2. 只输出JSON，不要任何解释文字、不要markdown标记
3. 必须包含7天，根据用户水平合理设置配速和距离"""

    try:
        response = client.chat.completions.create(
            model="glm-4-flash",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=1000,
        )
        result = response.choices[0].message.content
        result = result.replace("```json", "").replace("```", "").strip()
        plan_data = json.loads(result)
        return jsonify({"success": True, "data": plan_data})
    except json.JSONDecodeError:
        return jsonify({"success": True, "data": {"week": week, "theme": "本周训练", "summary": result[:100], "days": []}})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


# ───────────────────────────────────────────────
# 接口2：AI教练对话
# ───────────────────────────────────────────────
@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_message = data.get("message", "")
    history = data.get("history", [])  # 历史对话记录
    user_profile = data.get("profile", {})  # 用户跑步数据

    # 构建用户画像描述
    profile_desc = ""
    if user_profile:
        profile_desc = f"""
用户跑步数据背景：
- 目标：{user_profile.get('goal', '未设置')}
- 当前水平：{user_profile.get('level', '未知')}
- 本月已跑：{user_profile.get('monthly_km', 0)}km
- 最近一次跑步：{user_profile.get('last_run', '暂无记录')}
- 连续打卡：{user_profile.get('streak', 0)}天
"""

    system_prompt = f"""你是RunMate的专属AI跑步教练，名字叫「小跑」。

{profile_desc}

你的性格特点：
- 专业但温暖，像认识用户很久的朋友
- 回答具体、可执行，不说套话
- 擅长根据用户的实际数据给出个性化建议
- 激励语气积极但不夸张
- 回复控制在200字以内，简洁有力

注意：只回答跑步相关问题，其他话题礼貌引导回跑步。"""

    # 构建消息历史
    messages = [{"role": "system", "content": system_prompt}]
    for h in history[-6:]:  # 只保留最近6条对话，节省token
        messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": user_message})

    try:
        response = client.chat.completions.create(
            model="glm-4-flash",
            messages=messages,
            temperature=0.8,
            max_tokens=500,
        )
        reply = response.choices[0].message.content
        return jsonify({"success": True, "reply": reply})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ───────────────────────────────────────────────
# 接口3：跑后AI复盘
# ───────────────────────────────────────────────
@app.route("/review", methods=["POST"])
def review():
    data = request.json
    distance = data.get("distance", 0)
    duration = data.get("duration", "00:00")
    avg_pace = data.get("avg_pace", "--")
    target_km = data.get("target_km", 5)
    run_type = data.get("run_type", "慢跑")

    prompt = f"""你是专业跑步教练，请对本次跑步做简短复盘分析。

本次跑步数据：
- 训练类型：{run_type}
- 完成距离：{distance}km（目标{target_km}km）
- 用时：{duration}
- 平均配速：{avg_pace}

请用以下格式输出（直接输出内容，不要标题标签）：

总评：[一句话总结，带emoji，15字以内]
亮点：[做得好的1点，20字以内]  
建议：[改进建议1点，20字以内]
明日：[明天训练建议，20字以内]"""

    try:
        response = client.chat.completions.create(
            model="glm-4-flash",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=300,
        )
        reply = response.choices[0].message.content
        return jsonify({"success": True, "review": reply})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ───────────────────────────────────────────────
# 接口4：跑步中实时激励语
# ───────────────────────────────────────────────
@app.route("/encourage", methods=["POST"])
def encourage():
    data = request.json
    distance = data.get("distance", 0)
    target_km = data.get("target_km", 5)
    pace_status = data.get("pace_status", "正常")  # 正常/偏慢/偏快

    prompt = f"""你是跑步陪跑教练，现在用户正在跑步中。

当前状态：已跑{distance}km，目标{target_km}km，配速状态：{pace_status}

请生成一句实时激励语，严格要求：
- 字数10-15字，不能超过15字
- 结合当前跑步进度
- 语气像朋友，不像机器
- 直接输出激励语，不要任何其他内容"""

    try:
        response = client.chat.completions.create(
            model="glm-4-flash",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.9,
            max_tokens=50,
        )
        msg = response.choices[0].message.content.strip()
        return jsonify({"success": True, "message": msg})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ───────────────────────────────────────────────
# 健康检查（Railway部署需要）
# ───────────────────────────────────────────────
@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "RunMate Backend Running ✅"})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
