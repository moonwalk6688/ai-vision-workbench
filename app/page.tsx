"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Priority = "紧急" | "重要" | "普通";
type Task = {
  id: number;
  title: string;
  project: string;
  due: string;
  priority: Priority;
  done: boolean;
};

const starterTasks: Task[] = [
  { id: 1, title: "完成公司七夕活动主视觉初稿", project: "企业设计", due: "今天 16:00", priority: "紧急", done: false },
  { id: 2, title: "整理周末人像拍摄选片", project: "摄影副业", due: "今晚", priority: "重要", done: false },
  { id: 3, title: "测试产品短片首尾帧提示词", project: "AIGC 练习", due: "明天", priority: "普通", done: false },
];

const pulseItems = [
  { tag: "图像", source: "模型与工具", title: "图像生成正在从“单张好看”转向可控编辑与系列一致性", time: "趋势观察", color: "mint" },
  { tag: "视频", source: "创作方法", title: "视频提示词更强调镜头时长、动作阶段与首尾帧衔接", time: "今日重点", color: "orange" },
  { tag: "工作流", source: "效率", title: "先锁定品牌资产，再批量适配尺寸，能显著减少返工", time: "方法沉淀", color: "blue" },
];

const navItems = ["今日工作", "AI 创作", "提示词库", "AI 动态", "素材资产", "项目作品"];

function formatDate() {
  return new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "long" }).format(new Date());
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(starterTasks);
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState<Priority>("重要");
  const [promptMode, setPromptMode] = useState<"image" | "video">("image");
  const [idea, setIdea] = useState("为一家现代咖啡品牌制作七夕限定海报，克制、温暖、有东方留白");
  const [style, setStyle] = useState("商业摄影");
  const [ratio, setRatio] = useState("4:5");
  const [prompt, setPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeNav, setActiveNav] = useState("今日工作");
  const [pulseTime, setPulseTime] = useState("刚刚整理");
  const [hydrated, setHydrated] = useState(false);
  const promptRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("vision-desk-tasks");
    if (saved) {
      try { setTasks(JSON.parse(saved)); } catch { /* keep starter data */ }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem("vision-desk-tasks", JSON.stringify(tasks));
  }, [tasks, hydrated]);

  const openCount = tasks.filter((task) => !task.done).length;
  const urgentCount = tasks.filter((task) => !task.done && task.priority === "紧急").length;
  const progress = tasks.length ? Math.round((tasks.filter((task) => task.done).length / tasks.length) * 100) : 0;

  const sortedTasks = useMemo(() => {
    const rank: Record<Priority, number> = { 紧急: 0, 重要: 1, 普通: 2 };
    return [...tasks].sort((a, b) => Number(a.done) - Number(b.done) || rank[a.priority] - rank[b.priority]);
  }, [tasks]);

  function addTask(event: FormEvent) {
    event.preventDefault();
    if (!newTask.trim()) return;
    setTasks((current) => [{ id: Date.now(), title: newTask.trim(), project: "临时事项", due: "待安排", priority, done: false }, ...current]);
    setNewTask("");
  }

  function toggleTask(id: number) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task));
  }

  function buildPrompt() {
    const cleanIdea = idea.trim() || "为一个生活方式品牌制作视觉内容";
    const nextPrompt = promptMode === "image"
      ? `【主体与目的】${cleanIdea}\n【视觉方向】${style}，真实材质，专业构图，主体信息明确\n【画面设计】前中后景层次清晰，保留标题与品牌信息安全区，避免杂乱背景和无意义装饰\n【光线与色彩】柔和定向光，克制配色，高级但不过度奢华\n【输出】${ratio} 画幅，商业可用，高分辨率，无乱码、无多余文字、无水印`
      : `【镜头目标】${cleanIdea}\n【时长】6 秒，单一核心动作，不在一个镜头内塞入过多事件\n【镜头设计】${style}；中景开场，镜头缓慢推进，主体完成一个连续动作，结尾稳定停留 1 秒\n【动态要求】动作自然、有重量感，人物与产品结构保持一致，避免突然变形、穿模和镜头跳切\n【光线与声音】环境光方向稳定，保留真实环境音，可后配音乐\n【输出】${ratio} 画幅，可作为成片素材，首尾帧连续`;
    setPrompt(nextPrompt);
    setCopied(false);
  }

  async function copyPrompt() {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function goTo(name: string) {
    setActiveNav(name);
    if (name === "AI 创作" || name === "提示词库") promptRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (name === "今日工作") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">V</div>
          <div><strong>视觉舱</strong><span>VISION DESK</span></div>
        </div>
        <nav aria-label="主导航">
          {navItems.map((item, index) => (
            <button className={activeNav === item ? "nav-item active" : "nav-item"} key={item} onClick={() => goTo(item)}>
              <span className="nav-index">0{index + 1}</span>{item}
              {item === "今日工作" && openCount > 0 && <em>{openCount}</em>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="status-dot"><i /> AI 服务 <span>待配置</span></div>
          <div className="profile"><div className="avatar">CH</div><div><strong>创意工作者</strong><span>设计 · 摄影 · AIGC</span></div></div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div><p>{formatDate()}</p><h1>早上好，先把重要的事做好。</h1></div>
          <div className="top-actions"><button className="ghost-btn" onClick={() => setPulseTime("刚刚刷新")}>↻ 同步动态</button><button className="primary-btn" onClick={() => promptRef.current?.scrollIntoView({ behavior: "smooth" })}>＋ 开始创作</button></div>
        </header>

        <section className="hero-grid">
          <article className="focus-card">
            <div className="section-kicker"><span>今日焦点</span><span>{progress}% 完成</span></div>
            <h2>{urgentCount ? "先完成七夕活动主视觉" : "今天的重点正在推进"}</h2>
            <p>把需要集中创造力的任务放在最前面。完成后，再处理选片和 AIGC 测试。</p>
            <div className="focus-meta"><span>企业设计</span><span>截止 16:00</span><span>预计 2.5 小时</span></div>
            <div className="progress-track"><i style={{ width: `${Math.max(progress, 14)}%` }} /></div>
          </article>
          <article className="metric-card"><span>待办事项</span><strong>{String(openCount).padStart(2, "0")}</strong><p><b>{urgentCount}</b> 项需要优先处理</p></article>
          <article className="metric-card accent"><span>本周创作</span><strong>12</strong><p>图片 9 · 视频 3</p></article>
        </section>

        <section className="content-grid">
          <div className="left-column">
            <article className="panel task-panel">
              <div className="panel-heading"><div><span className="eyebrow">WORK QUEUE</span><h2>近期工作事项</h2></div><button className="text-btn" onClick={() => setTasks((current) => current.filter((task) => !task.done))}>清理已完成</button></div>
              <form className="quick-add" onSubmit={addTask}>
                <span>＋</span><input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="添加一项工作，例如：整理公司品牌素材…" aria-label="新工作事项" />
                <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} aria-label="优先级"><option>紧急</option><option>重要</option><option>普通</option></select>
                <button>添加</button>
              </form>
              <div className="task-list">
                {sortedTasks.map((task) => (
                  <div className={task.done ? "task-row done" : "task-row"} key={task.id}>
                    <button className="check" aria-label={task.done ? "标记为未完成" : "标记为完成"} onClick={() => toggleTask(task.id)}>{task.done ? "✓" : ""}</button>
                    <div className="task-copy"><strong>{task.title}</strong><span>{task.project} · {task.due}</span></div>
                    <span className={`priority priority-${task.priority}`}>{task.priority}</span><button className="more" aria-label="更多操作">•••</button>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel prompt-panel" ref={promptRef}>
              <div className="panel-heading"><div><span className="eyebrow">PROMPT STUDIO</span><h2>提示词工坊</h2></div><div className="mode-toggle"><button className={promptMode === "image" ? "selected" : ""} onClick={() => setPromptMode("image")}>图片</button><button className={promptMode === "video" ? "selected" : ""} onClick={() => setPromptMode("video")}>视频</button></div></div>
              <div className="prompt-layout">
                <div className="prompt-form">
                  <label>用一句话描述你的想法<textarea value={idea} onChange={(e) => setIdea(e.target.value)} /></label>
                  <div className="field-row"><label>视觉方向<select value={style} onChange={(e) => setStyle(e.target.value)}><option>商业摄影</option><option>极简平面设计</option><option>电影感叙事</option><option>东方美学</option></select></label><label>画面比例<select value={ratio} onChange={(e) => setRatio(e.target.value)}><option>4:5</option><option>16:9</option><option>9:16</option><option>1:1</option></select></label></div>
                  <button className="generate-btn" onClick={buildPrompt}>✦ 生成结构化{promptMode === "image" ? "图片" : "视频"}提示词</button>
                </div>
                <div className="prompt-result">
                  <div className="result-top"><span>{prompt ? "已整理 · 可继续编辑" : "生成结果"}</span><button onClick={copyPrompt}>{copied ? "已复制 ✓" : "复制"}</button></div>
                  <pre>{prompt || "你的结构化提示词会出现在这里。\n\n图片提示词会补全主体、构图、光线与输出要求；视频提示词会补全时长、镜头、动作阶段与连续性。"}</pre>
                  <div className="api-bar"><span><i /> API 接口已预留</span><button disabled>连接模型后生成</button></div>
                </div>
              </div>
            </article>
          </div>

          <div className="right-column">
            <article className="panel pulse-panel">
              <div className="panel-heading compact"><div><span className="eyebrow">AI PULSE</span><h2>AI 动态雷达</h2></div><span className="live-label"><i /> {pulseTime}</span></div>
              <p className="demo-note">V1 趋势看板 · 后续可接入官方博客与行业资讯源</p>
              <div className="pulse-list">
                {pulseItems.map((item) => <article className="pulse-item" key={item.title}><div className={`pulse-thumb ${item.color}`}><span>{item.tag}</span></div><div><span>{item.source} · {item.time}</span><h3>{item.title}</h3><button onClick={() => { setIdea(item.title); setPromptMode(item.tag === "视频" ? "video" : "image"); promptRef.current?.scrollIntoView({ behavior: "smooth" }); }}>转为创作灵感 →</button></div></article>)}
              </div>
              <button className="wide-ghost" onClick={() => setPulseTime("刚刚刷新")}>刷新今日 AI 动态</button>
            </article>

            <article className="panel knowledge-panel">
              <div className="panel-heading compact"><div><span className="eyebrow">PLAYBOOK</span><h2>今日提示词技巧</h2></div><span className="lesson">01 / 05</span></div>
              <div className="lesson-card"><span>视频提示词</span><h3>一个镜头，只安排一个核心动作</h3><p>先写主体做什么，再写镜头如何观察，最后补充时长、光线和声音。6 秒镜头不要塞入三个情节转折。</p><div className="formula"><span>主体</span><b>＋</b><span>动作</span><b>＋</b><span>镜头</span><b>＋</b><span>时间</span></div></div>
              <button className="wide-ghost" onClick={() => { setPromptMode("video"); setIdea("一只旅行箱在机场地面平稳拖行，展示轮组稳定性"); promptRef.current?.scrollIntoView({ behavior: "smooth" }); }}>立即练习这个方法</button>
            </article>
          </div>
        </section>
      </section>
    </main>
  );
}
