"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Share2,
  Sparkles,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  Crown,
  Flame,
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";

type AxisKey = "V" | "R" | "C" | "F" | "D" | "S" | "A" | "M";
type FactionKey = "VC" | "VF" | "RC" | "RF";
type Scores = Record<AxisKey, number>;

type Option = {
  text: string;
  scores: Partial<Scores>;
};

type Question = {
  id: number;
  title: string;
  subtitle: string;
  options: Option[];
};

type Profile = {
  title: string;
  tone: string;
  tags: string[];
  guide: string[];
  socialCopy: string;
};

type FactionInfo = {
  name: string;
  short: string;
  slogan: string;
  tone: string;
  tags: string[];
  colors: {
    bgClass: string;
    panelClass: string;
    primary: string;
    secondary: string;
    ink: string;
  };
};

type FactionMeta = FactionInfo & {
  key: FactionKey;
  icon: "crown" | "compass" | "sword" | "coin";
  shape: "shield" | "circle" | "diamond" | "hex";
  accentWord: string;
};

type FactionLogoCardProps = {
  code: string;
  title: string;
  tone: string;
  confidence: number;
  bossLook: string[];
};

type RadarRowProps = {
  label: string;
  value: number;
};

const axes: Record<AxisKey, string> = {
  V: "愿景型",
  R: "营收型",
  C: "控制型",
  F: "放权型",
  D: "戏剧型",
  S: "稳定型",
  A: "开干型",
  M: "开会型",
};

const axisPairs: Array<[AxisKey, AxisKey]> = [
  ["V", "R"],
  ["C", "F"],
  ["D", "S"],
  ["A", "M"],
];

const baseQuestions: Question[] = [
  {
    id: 1,
    title: "一个新项目刚开始，你最先抓什么？",
    subtitle: "看你更偏方向意义，还是业务回报。",
    options: [
      { text: "先讲清楚它为什么值得做。", scores: { V: 3 } },
      { text: "先确认它对长期方向的价值。", scores: { V: 2 } },
      { text: "先算回报周期和投入产出。", scores: { R: 2 } },
      { text: "先看能不能尽快形成收入闭环。", scores: { R: 3 } },
    ],
  },
  {
    id: 2,
    title: "同事来问：这事怎么推进？",
    subtitle: "看你更愿意接管，还是放手。",
    options: [
      { text: "我给你步骤，你按步骤执行。", scores: { C: 3 } },
      { text: "我给你框架，按边界做。", scores: { C: 2 } },
      { text: "你先自己判断，我补关键风险。", scores: { F: 2 } },
      { text: "你自己定，我主要看结果。", scores: { F: 3 } },
    ],
  },
  {
    id: 3,
    title: "团队状态差的时候，你更像——",
    subtitle: "看你更偏激发，还是稳定。",
    options: [
      { text: "我会先把大家的状态拉起来。", scores: { D: 3 } },
      { text: "我要让大家感受到事情的重要性。", scores: { D: 2 } },
      { text: "先稳住节奏，不让场面失控。", scores: { S: 2 } },
      { text: "先处理问题，再慢慢恢复状态。", scores: { S: 3 } },
    ],
  },
  {
    id: 4,
    title: "遇到模糊问题时，你更常见的第一反应是？",
    subtitle: "看你更偏快速行动，还是充分对齐。",
    options: [
      { text: "先动起来，边做边修正。", scores: { A: 3 } },
      { text: "先试一版，再根据反馈调整。", scores: { A: 2 } },
      { text: "先把信息捋顺，再决定怎么动。", scores: { M: 2 } },
      { text: "先对齐关键前提，避免返工。", scores: { M: 3 } },
    ],
  },
  {
    id: 5,
    title: "别人说‘这个项目短期不赚钱，但很有意义’时，你更像——",
    subtitle: "看你更偏长期价值，还是即时回报。",
    options: [
      { text: "只要方向对，短期不赚钱可以接受。", scores: { V: 3 } },
      { text: "意义很重要，它关系到未来上限。", scores: { V: 2 } },
      { text: "意义可以有，但账必须讲得通。", scores: { R: 2 } },
      { text: "不赚钱就先别讲太远。", scores: { R: 3 } },
    ],
  },
  {
    id: 6,
    title: "你理想中的下属是——",
    subtitle: "更偏稳定执行，还是独立判断。",
    options: [
      { text: "执行精准，最好少出意外。", scores: { C: 3 } },
      { text: "边界清楚，少让我反复纠偏。", scores: { C: 2 } },
      { text: "能独立决策，有问题再同步。", scores: { F: 2 } },
      { text: "能自己长答案，不必事事等指令。", scores: { F: 3 } },
    ],
  },
  {
    id: 7,
    title: "你开会时更常让人感受到什么？",
    subtitle: "看你更偏存在感，还是稳定感。",
    options: [
      { text: "我一进来，会议会明显变得更紧。", scores: { D: 3 } },
      { text: "我会带来比较强的现场感。", scores: { D: 2 } },
      { text: "我会让会议逐步回到秩序里。", scores: { S: 2 } },
      { text: "大家知道我能把场面稳住。", scores: { S: 3 } },
    ],
  },
  {
    id: 8,
    title: "你对会议的真实态度是？",
    subtitle: "看你更偏动作，还是偏讨论。",
    options: [
      { text: "能不会议就尽量不会议。", scores: { A: 3 } },
      { text: "会议别太多，先推进。", scores: { A: 2 } },
      { text: "该开的会必须开明白。", scores: { M: 2 } },
      { text: "关键事必须先拉齐认知。", scores: { M: 3 } },
    ],
  },
  {
    id: 9,
    title: "做年度规划时，你最先想清楚的是——",
    subtitle: "看你先想愿景，还是先想结果。",
    options: [
      { text: "我们明年想成为什么样的组织。", scores: { V: 3 } },
      { text: "这件事对长期方向有什么意义。", scores: { V: 2 } },
      { text: "目标怎么拆，结果怎么验收。", scores: { R: 2 } },
      { text: "最后必须交出什么结果。", scores: { R: 3 } },
    ],
  },
  {
    id: 10,
    title: "当别人做得不如你预期时，你更可能——",
    subtitle: "看你更想接管，还是培养。",
    options: [
      { text: "我来接手，先保证质量。", scores: { C: 3 } },
      { text: "我改一版给你看，按这个标准来。", scores: { C: 2 } },
      { text: "先让他自己复盘再看。", scores: { F: 2 } },
      { text: "允许试错，组织也要留成长空间。", scores: { F: 3 } },
    ],
  },
  {
    id: 11,
    title: "发生失误时，你最不希望团队出现哪种状态？",
    subtitle: "看你更怕无感，还是更怕失序。",
    options: [
      { text: "太平静，好像没有意识到严重性。", scores: { D: 3 } },
      { text: "没有明显反应，像没痛感。", scores: { D: 2 } },
      { text: "乱成一团，没人收场。", scores: { S: 2 } },
      { text: "边慌边演，最后问题没解决。", scores: { S: 3 } },
    ],
  },
  {
    id: 12,
    title: "面对一个机会，你更信哪种判断方式？",
    subtitle: "看你更信动作，还是更信论证。",
    options: [
      { text: "先试，市场比讨论更诚实。", scores: { A: 3 } },
      { text: "快速小试，别拖太久。", scores: { A: 2 } },
      { text: "先讨论清楚边界和资源。", scores: { M: 2 } },
      { text: "先把关键问题讲透，再开始。", scores: { M: 3 } },
    ],
  },
];

const questions: Question[] = Array.from({ length: 36 }, (_, index) => {
  const source = baseQuestions[index % baseQuestions.length];
  return {
    ...source,
    id: index + 1,
  };
});

const factionMap: Record<FactionKey, FactionInfo> = {
  VC: {
    name: "天命统治派",
    short: "VC 阵营",
    slogan: "先定方向，再定秩序。",
    tone: "这一派更看重方向高度、组织边界和领导权威。通常拥有较强的目标感与控制力，适合在高不确定环境中快速确立中心。",
    tags: ["目标感强", "边界清晰", "中心稳定"],
    colors: {
      bgClass: "from-orange-500 via-rose-500 to-red-600",
      panelClass: "from-red-950/85 to-orange-950/30",
      primary: "#f59e0b",
      secondary: "#7c2d12",
      ink: "#111827",
    },
  },
  VF: {
    name: "理想游牧派",
    short: "VF 阵营",
    slogan: "先给方向，再给空间。",
    tone: "这一派更看重长期愿景、个体成长和组织弹性。通常具备开放性与想象力，适合新方向探索和非标准问题处理。",
    tags: ["想象力强", "组织弹性高", "开放度高"],
    colors: {
      bgClass: "from-emerald-500 via-teal-500 to-cyan-500",
      panelClass: "from-emerald-950/85 to-cyan-950/30",
      primary: "#14b8a6",
      secondary: "#065f46",
      ink: "#083344",
    },
  },
  RC: {
    name: "铁血绩效派",
    short: "RC 阵营",
    slogan: "先看结果，再谈过程。",
    tone: "这一派更重视交付质量、经营效率和组织纪律。通常具备强执行、强结果意识，适合在复杂环境中建立可验证的产出系统。",
    tags: ["结果导向", "执行力强", "秩序感高"],
    colors: {
      bgClass: "from-slate-700 via-zinc-600 to-amber-500",
      panelClass: "from-slate-950/88 to-amber-950/28",
      primary: "#f59e0b",
      secondary: "#334155",
      ink: "#0f172a",
    },
  },
  RF: {
    name: "掌柜经营派",
    short: "RF 阵营",
    slogan: "看似松弛，实则有数。",
    tone: "这一派更偏长期经营、边界感和低波动管理。通常不依赖高压存在感，而是通过持续经营与节奏管理推动组织向前。",
    tags: ["经营意识强", "节奏稳定", "长期主义"],
    colors: {
      bgClass: "from-cyan-600 via-sky-500 to-blue-600",
      panelClass: "from-cyan-950/88 to-indigo-950/28",
      primary: "#0ea5e9",
      secondary: "#164e63",
      ink: "#082f49",
    },
  },
};

const profileMap: Record<string, Profile> = {
  VCDA: {
    title: "控场指挥型 BOSS",
    tone: "你兼具方向驱动、组织控制、现场推动和行动执行能力。适合在目标清晰但节奏紧张的场景下快速统一方向。",
    tags: ["方向清晰", "控制力高", "推进迅速"],
    guide: ["注意预留他人的判断空间。", "避免把所有细节都收回自己手里。", "规模扩大后，机制会比持续亲自接管更重要。"],
    socialCopy: "我的 BOSSTI 结果是 VCDA：控场指挥型，偏方向驱动、控制清晰、行动迅速。",
  },
  VCDM: {
    title: "愿景统筹型 BOSS",
    tone: "你擅长定义方向、统一认知和组织讨论。适合需要长期布局与复杂协同的环境。",
    tags: ["愿景导向", "统筹力强", "善于对齐"],
    guide: ["避免讨论过度。", "同步给出行动优先级。", "留意节奏效率。"],
    socialCopy: "我的 BOSSTI 结果是 VCDM：愿景统筹型，偏长期方向、认知整合与组织协同。",
  },
  VCSA: {
    title: "驱动冲锋型 BOSS",
    tone: "你擅长点燃现场、强化注意力并快速推动行动。适合需要强驱动和高能量的项目阶段。",
    tags: ["驱动力强", "带动感高", "动作果断"],
    guide: ["照顾团队续航。", "增加节奏缓冲。", "把个人驱动力沉淀成组织能力。"],
    socialCopy: "我的 BOSSTI 结果是 VCSA：驱动冲锋型，偏高能量推进和快速行动。",
  },
  VCSM: {
    title: "价值收拢型 BOSS",
    tone: "你擅长在温和氛围中建立一致认知，并逐步把团队带入清晰的价值体系。适合做长期文化与组织建设。",
    tags: ["价值观强", "风格温和", "组织收拢"],
    guide: ["避免过度抽象。", "让价值感与执行感同步出现。", "把组织语言转化为具体机制。"],
    socialCopy: "我的 BOSSTI 结果是 VCSM：价值收拢型，偏温和一致、长期文化和认知建设。",
  },
  VFDA: {
    title: "方向放权型 BOSS",
    tone: "你擅长给出方向，同时愿意给团队较大行动空间。适合探索型组织和新业务孵化。",
    tags: ["方向感强", "授权度高", "探索感强"],
    guide: ["边界和收口机制要同步出现。", "需要更清晰的里程碑。", "方向清楚、节奏明确时授权效果更好。"],
    socialCopy: "我的 BOSSTI 结果是 VFDA：方向放权型，偏给方向、给空间、促探索。",
  },
  VFDM: {
    title: "概念策动型 BOSS",
    tone: "你擅长创造故事、定义可能性并把人吸引进更大的叙事中。适合创新、品牌和早期战略场景。",
    tags: ["概念能力强", "故事驱动", "创造力高"],
    guide: ["增强收尾能力。", "明确落地节奏。", "关注具体交付。"],
    socialCopy: "我的 BOSSTI 结果是 VFDM：概念策动型，偏故事塑造、可能性定义和创新驱动。",
  },
  VFSA: {
    title: "灵感行动型 BOSS",
    tone: "你拥有较强的方向感和行动力，也愿意给予团队空间。适合高变化、高创造性的业务环境。",
    tags: ["灵感驱动", "行动导向", "授权灵活"],
    guide: ["节奏管理要更有结构。", "建立稳定沟通机制。", "照顾组织可预期性。"],
    socialCopy: "我的 BOSSTI 结果是 VFSA：灵感行动型，偏快速尝试、开放协作和创新推进。",
  },
  VFSM: {
    title: "开放经营型 BOSS",
    tone: "你重视长期方向，也尊重个体空间，整体风格温和稳定。适合低波动、长期主义导向的组织。",
    tags: ["开放度高", "长期导向", "低压管理"],
    guide: ["关键边界要更清晰。", "仍然需要节奏指引。", "避免目标模糊。"],
    socialCopy: "我的 BOSSTI 结果是 VFSM：开放经营型，偏长期愿景、开放协作和稳定节奏。",
  },
  RCDA: {
    title: "高压结果型 BOSS",
    tone: "你高度关注结果、标准、执行和速度。适合目标明确、结果刚性强的组织环境。",
    tags: ["结果感强", "执行直接", "推进快速"],
    guide: ["关注团队承载力。", "建立过程反馈机制。", "避免长期紧绷。"],
    socialCopy: "我的 BOSSTI 结果是 RCDA：高压结果型，偏结果驱动、执行清晰、推进迅速。",
  },
  RCDM: {
    title: "规则运营型 BOSS",
    tone: "你重视结果，也重视制度、流程和组织协同。适合规模化管理、流程化经营和复杂系统治理。",
    tags: ["制度完善", "协同清晰", "管理成熟"],
    guide: ["避免流程代替判断。", "让规则真正服务稳定。", "适当保留灵活性。"],
    socialCopy: "我的 BOSSTI 结果是 RCDM：规则运营型，偏流程治理、制度建设和结果管理。",
  },
  RCSA: {
    title: "冷静推进型 BOSS",
    tone: "你不依赖高张力表达，而是通过清晰标准和果断动作拿结果。适合实战、项目制与复杂执行环境。",
    tags: ["冷静高效", "标准明确", "行动果断"],
    guide: ["增加解释和反馈。", "沟通可多一点温度。", "适合复杂项目收口。"],
    socialCopy: "我的 BOSSTI 结果是 RCSA：冷静推进型，偏标准明确、动作果断和结果清晰。",
  },
  RCSM: {
    title: "制度经营型 BOSS",
    tone: "你兼顾结果、秩序、稳定和组织成熟度。适合长期经营、规模管理和系统性优化。",
    tags: ["经营成熟", "制度清晰", "稳定有序"],
    guide: ["给创新留空间。", "增加组织弹性。", "提升组织韧性。"],
    socialCopy: "我的 BOSSTI 结果是 RCSM：制度经营型，偏稳定管理、制度清晰和长期经营。",
  },
  RFDA: {
    title: "目标放权型 BOSS",
    tone: "你重视结果，也愿意给团队较大空间；你偏行动而不偏细抠。适合成熟团队、目标明确的业务单元。",
    tags: ["目标清晰", "授权合理", "节点发力"],
    guide: ["提前讲清标准。", "节点管理更前置。", "适合高自主业务。"],
    socialCopy: "我的 BOSSTI 结果是 RFDA：目标放权型，偏结果导向、授权清晰和节点发力。",
  },
  RFDM: {
    title: "经营平衡型 BOSS",
    tone: "你整体风格松弛，但对收益、边界和协同非常清楚。适合做经营管理、资源配置和长期平衡。",
    tags: ["经营意识强", "平衡感好", "要求清楚"],
    guide: ["更早表达标准。", "发挥长期平衡优势。", "让目标更透明。"],
    socialCopy: "我的 BOSSTI 结果是 RFDM：经营平衡型，偏松弛外表、清晰经营和长期协调。",
  },
  RFSA: {
    title: "低调实干型 BOSS",
    tone: "你风格低调，重结果、重行动，也愿意给团队适当空间。适合务实推进、项目运营和长期合作场景。",
    tags: ["低调务实", "行动明确", "合作稳定"],
    guide: ["增加显性反馈。", "让团队更理解你的判断。", "适合长期合作型组织环境。"],
    socialCopy: "我的 BOSSTI 结果是 RFSA：低调实干型，偏务实推进、低调管理和稳定交付。",
  },
  RFSM: {
    title: "长期掌柜型 BOSS",
    tone: "你不依赖高压和高戏剧性，而是通过经营意识、稳定节奏和长期布局推动组织发展。适合做长期经营与组织维护。",
    tags: ["长期主义", "松弛经营", "边界清楚"],
    guide: ["关键时刻更显性一些。", "继续保持稳定与边界。", "很适合长期经营型组织。"],
    socialCopy: "我的 BOSSTI 结果是 RFSM：长期掌柜型，偏长期经营、节奏稳定和低波动管理。",
  },
};

function getFaction(code: string): FactionKey {
  const key = code.slice(0, 2) as FactionKey;
  return key in factionMap ? key : "RF";
}

function getFactionLogoMeta(code: string): FactionMeta {
  const factionKey = getFaction(code);
  const faction = factionMap[factionKey];
  const meta: Record<FactionKey, Pick<FactionMeta, "icon" | "shape" | "accentWord" | "key">> = {
    VC: { key: "VC", icon: "crown", shape: "shield", accentWord: "DOMINION" },
    VF: { key: "VF", icon: "compass", shape: "circle", accentWord: "VISION" },
    RC: { key: "RC", icon: "sword", shape: "diamond", accentWord: "RESULT" },
    RF: { key: "RF", icon: "coin", shape: "hex", accentWord: "BALANCE" },
  };
  return { ...faction, ...meta[factionKey] };
}

function getDominance(scores: Scores, a: AxisKey, b: AxisKey) {
  const total = scores[a] + scores[b] || 1;
  const gap = Math.abs(scores[a] - scores[b]);
  return {
    winner: scores[a] >= scores[b] ? a : b,
    loser: scores[a] >= scores[b] ? b : a,
    gap,
    strength: gap / total,
  };
}

function buildScores(answers: Array<number | null>): Scores {
  const total: Scores = {
    V: 0,
    R: 0,
    C: 0,
    F: 0,
    D: 0,
    S: 0,
    A: 0,
    M: 0,
  };

  answers.forEach((answerIndex, qIndex) => {
    if (answerIndex === null) return;
    const option = questions[qIndex]?.options[answerIndex];
    if (!option) return;
    Object.entries(option.scores).forEach(([k, v]) => {
      total[k as AxisKey] += v ?? 0;
    });
  });

  return total;
}

function getCode(scores: Scores): string {
  const first = scores.V >= scores.R ? "V" : "R";
  const second = scores.C >= scores.F ? "C" : "F";
  const third = scores.D >= scores.S ? "D" : "S";
  const fourth = scores.A >= scores.M ? "A" : "M";
  return `${first}${second}${third}${fourth}`;
}

function getConfidence(scores: Scores): number {
  const pairs = axisPairs.map(([a, b]) => getDominance(scores, a, b));
  const avg = pairs.reduce((sum, item) => sum + item.strength, 0) / pairs.length;
  return Math.max(60, Math.min(97, Math.round(64 + avg * 33)));
}

function getStrengthLabel(gap: number): string {
  if (gap >= 10) return "非常明显";
  if (gap >= 6) return "较明显";
  if (gap >= 3) return "中等";
  return "轻度";
}

function getLeadershipCore(scores: Scores): string {
  const vr = getDominance(scores, "V", "R");
  const cf = getDominance(scores, "C", "F");
  const ds = getDominance(scores, "D", "S");
  const am = getDominance(scores, "A", "M");

  const p1 =
    vr.winner === "V"
      ? `${getStrengthLabel(vr.gap)}愿景驱动。你在判断事情时更先看方向、长期意义和未来位置。`
      : `${getStrengthLabel(vr.gap)}营收驱动。你更关注结果、回报和业务闭环。`;

  const p2 =
    cf.winner === "C"
      ? `${getStrengthLabel(cf.gap)}控制倾向。你更重视统一标准、过程可控和关键节点的管理掌握。`
      : `${getStrengthLabel(cf.gap)}放权倾向。你更愿意让团队在明确目标下自主成长和独立判断。`;

  const p3 =
    ds.winner === "D"
      ? `${getStrengthLabel(ds.gap)}戏剧张力。你的存在感、表达力度和现场影响力会明显进入组织氛围。`
      : `${getStrengthLabel(ds.gap)}稳定倾向。你更偏向控节奏、压波动和建立可预期的推进环境。`;

  const p4 =
    am.winner === "A"
      ? `${getStrengthLabel(am.gap)}行动倾向。你更相信先动起来，再在动作中修正。`
      : `${getStrengthLabel(am.gap)}对齐倾向。你更相信先讲清楚，再组织推进。`;

  return `${p1}${p2}${p3}${p4}`;
}

function getTeamExperience(scores: Scores): string {
  const vr = getDominance(scores, "V", "R");
  const cf = getDominance(scores, "C", "F");
  const ds = getDominance(scores, "D", "S");
  const am = getDominance(scores, "A", "M");

  let sentence = "团队通常会感受到：你属于";
  sentence += cf.winner === "C" ? "边界更清楚、管理参与度更高的负责人，" : "更愿意给空间、强调自驱的负责人，";
  sentence += ds.winner === "D" ? "你的现场影响力较强，" : "你的稳定感和可预期性较强，";
  sentence += am.winner === "A" ? "整体推进节奏偏快，" : "前期对齐和认知同步会更充分，";
  sentence += vr.winner === "V" ? "同时你会反复把大家拉回长期方向和意义。" : "同时你会持续把大家拉回结果和业务目标。";
  return sentence;
}

function getBlindSpot(scores: Scores): string {
  const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] as AxisKey | undefined;
  const map: Record<AxisKey, string> = {
    V: "你可能容易把方向感表达得过于完整，从而让团队低估实际执行的不确定性。",
    R: "你可能容易把结果语言放在过高优先级，导致过程信息和风险暴露不足。",
    C: "你可能容易在关键节点收回过多管理权，影响团队独立成长。",
    F: "你可能容易把信任做得过于宽松，导致边界和责任感不够明确。",
    D: "你可能容易让组织过度感受到你的现场张力，从而影响长期松弛度。",
    S: "你可能容易把稳定做得过强，进而压低一些探索性和锐度。",
    A: "你可能容易过快进入动作，从而让前置共识不足。",
    M: "你可能容易在讨论和校准中投入过多时间，影响推进效率。",
  };
  return top ? map[top] : "你的结果整体较为均衡，主要盲区不算特别集中。";
}

function getIdealTeam(scores: Scores): string {
  const vr = getDominance(scores, "V", "R");
  const cf = getDominance(scores, "C", "F");
  const ds = getDominance(scores, "D", "S");
  const am = getDominance(scores, "A", "M");

  const a = cf.winner === "C" ? "能理解标准、愿意在边界内高质量执行" : "成熟自驱、可以独立承担任务闭环";
  const b = ds.winner === "D" ? "能适应较强的现场影响力与节奏变化" : "节奏稳定、不容易被波动打断";
  const c = am.winner === "A" ? "动作快、反馈快、对试错有适应力" : "逻辑清楚、能承接对齐和复杂协同";
  const d = vr.winner === "V" ? "愿意理解长期方向与组织意义" : "对结果和业务目标保持敏感";

  return `你比较适配的团队通常具备这些特征：${a}、${b}、${c}，并且${d}。当这些条件同时出现时，你的管理优势会发挥得更完整。`;
}

function getFlipRisk(code: string): string {
  const riskMap: Record<string, string> = {
    VCDA: "需要注意在高标准与高速度并行时，避免组织对你形成过度依赖。",
    VCDM: "需要注意讨论充分时，别让关键行动被持续延后。",
    VCSA: "需要注意高驱动场景下的团队续航与节奏恢复。",
    VCSM: "需要注意价值表达与执行落地之间保持平衡。",
    VFDA: "需要注意授权与收口机制必须同时存在。",
    VFDM: "需要注意概念创新之后的落地与结案能力。",
    VFSA: "需要注意变化节奏过快时的组织可预期性。",
    VFSM: "需要注意开放氛围之下目标边界不能变模糊。",
    RCDA: "需要注意结果压力过强时的组织承载与信息透明。",
    RCDM: "需要注意流程建设不能替代一线判断。",
    RCSA: "需要注意执行效率很高时，组织反馈通道仍要保持开放。",
    RCSM: "需要注意制度成熟之后仍要保留创新空间。",
    RFDA: "需要注意节点发力应前置为更清楚的标准。",
    RFDM: "需要注意隐性要求过多时，团队理解成本会升高。",
    RFSA: "需要注意低调风格之下，关键判断仍要适度显性表达。",
    RFSM: "需要注意长期松弛经营中保留足够的关键时刻推动力。",
  };
  return riskMap[code] ?? "请重点关注节奏、边界和组织沟通的一致性。";
}

function getBossLook(code: string): string[] {
  const map: Record<string, string[]> = {
    VCDA: ["方向清晰", "控制力高", "推进迅速", "标准明确"],
    VCDM: ["善于统筹", "认知整合", "愿景表达强", "组织协调度高"],
    VCSA: ["驱动力强", "行动速度快", "现场感明显", "目标聚焦"],
    VCSM: ["价值感强", "氛围温和", "组织收拢", "长期建设"],
    VFDA: ["方向感强", "授权度高", "探索感强", "节奏灵活"],
    VFDM: ["概念能力强", "表达力强", "创造力高", "启发性明显"],
    VFSA: ["灵感驱动", "行动导向", "开放协作", "节奏快速"],
    VFSM: ["开放稳定", "长期导向", "低压管理", "空间感强"],
    RCDA: ["结果优先", "动作直接", "执行清晰", "推进快速"],
    RCDM: ["制度完善", "协同清晰", "流程清楚", "管理成熟"],
    RCSA: ["冷静高效", "标准明确", "行动果断", "实战感强"],
    RCSM: ["经营成熟", "制度清晰", "稳定有序", "系统感强"],
    RFDA: ["目标清晰", "授权合理", "节点发力", "结果导向"],
    RFDM: ["经营平衡", "平衡感好", "要求清楚", "资源感强"],
    RFSA: ["低调务实", "行动明确", "合作稳定", "交付可靠"],
    RFSM: ["长期主义", "松弛经营", "边界清楚", "低波动管理"],
  };
  return map[code] ?? ["管理清晰", "风格稳定", "注重协同", "结果明确"];
}

function FactionLogoCard({
  code,
  title,
  tone,
  confidence,
  bossLook,
}: FactionLogoCardProps) {
  const faction = getFactionLogoMeta(code);

  return (
  <div className="min-h-dvh w-full overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_30%),radial-gradient(circle_at_right,_rgba(239,68,68,0.14),_transparent_24%),linear-gradient(180deg,#fafaf9_0%,#fff7ed_100%)] px-3 py-4 sm:px-4 md:p-8">
    <div className="mx-auto w-full max-w-5xl space-y-4 md:space-y-6">
      <div className="hidden rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-xl backdrop-blur md:block">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
            <Crown className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
                BOSSTI
              </h1>
              <Badge className="rounded-full px-3 py-1 text-xs">36 题正式版 · 16 型 BOSS 测评</Badge>
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-600 md:text-base">
              一份适合对外使用的娱乐型管理风格评估。通过 36 道题目，从四组核心维度识别你的 16 型风格与派系位置。
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            "36 道题，稳定区分 16 种 BOSSTI 类型",
            "核心维度：愿景/营收、控制/放权、戏剧/稳定、开干/开会",
            "采用派系 Logo 标志系统，适合正式测评场景展示",
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-800">
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{item}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Card className="rounded-[24px] border-white/60 bg-white/90 shadow-xl md:rounded-[28px]">
        <CardHeader className="space-y-4 pb-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl text-slate-900">
                {!started ? "开始测试" : isComplete ? "你的 16 型 BOSS 人格已完成判定" : `第 ${step + 1} 题 / ${questions.length}`}
              </CardTitle>
              <CardDescription className="mt-1 text-slate-600">
                {!started
                  ? "先阅读测评说明后开始。"
                  : isComplete
                  ? "结果页展示的是正式版解释，可直接用于用户测评、客户展示与内部测试。"
                  : "请选择最符合你的选项。"}
              </CardDescription>
            </div>
            <div className="min-w-24 text-left sm:text-right">
              <div className="text-sm text-slate-500">进度</div>
              <div className="text-2xl font-black text-slate-900">{started ? progress : "0%"}</div>
            </div>
          </div>
          <Progress value={started ? progress : 0} className="h-2.5" />
        </CardHeader>

        <CardContent className="pt-4">
          {!started ? (
            <div className="space-y-5">
              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5 md:rounded-[28px] md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      BOSSTI Formal Edition
                    </div>
                    <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">测你是哪一型 BOSS</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-800 sm:text-base">
                      这是一份基于 36 道题目的娱乐型管理风格评估。结果将从愿景/营收、控制/放权、戏剧/稳定、开干/开会四组维度，对你的管理偏好进行归类，并落入 16 种类型与 4 个派系之中。
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-lg">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-300">测评结构</div>
                    <div className="mt-1 text-lg font-bold">36 题 / 16 型 / 4 派系</div>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-sm font-semibold text-slate-900">适用对象</div>
                    <p className="mt-2 text-sm leading-7 text-slate-800">
                      适合创业者、管理者、团队负责人、业务合伙人，以及想从更客观视角了解自己管理风格的用户。也适合品牌活动页、客户互动页和团队内部娱乐式评估场景。
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-sm font-semibold text-slate-900">免责声明</div>
                    <p className="mt-2 text-sm leading-7 text-slate-800">
                      本测评用于娱乐化自我观察与风格识别，不构成心理诊断、能力认证或正式人事评估结论。结果会受到答题状态、语境与个人经历影响，请结合实际情况理解。
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
                  <Button
                    onClick={() => setStarted(true)}
                    className="w-full rounded-2xl bg-slate-900 text-white hover:bg-slate-800 sm:w-auto"
                  >
                    开始测试
                  </Button>
                </div>

                <div className="mt-6 border-t border-slate-200 pt-4 text-center text-xs leading-6 text-slate-500">
                  <div>给我的朋友做的娱乐评估，从客观角度认识一下自己</div>
                  <div>乌鲁木齐将予合信息科技服务有限公司——老王</div>
                </div>
              </div>
            </div>
          ) : !isComplete && currentQuestion ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{currentQuestion.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{currentQuestion.subtitle}</p>
              </div>

              <div className="grid gap-3">
                {currentQuestion.options.map((option, idx) => {
                  const active = answers[step] === idx;
                  return (
                    <button
                      key={option.text}
                      onClick={() => selectOption(idx)}
                      className={`group rounded-2xl border p-4 text-left transition-all ${
                        active
                          ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="text-[15px] font-medium leading-6 sm:text-base sm:leading-7">
                          {option.text}
                        </div>
                        <ArrowRight
                          className={`mt-1 h-4 w-4 shrink-0 ${
                            active ? "text-white" : "text-slate-400 group-hover:text-slate-700"
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  variant="outline"
                  className="rounded-2xl"
                  disabled={step === 0}
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                >
                  上一题
                </Button>
                <div className="text-xs text-slate-500">请选择最符合你的真实倾向，无标准答案。</div>
              </div>
            </div>
          ) : result && faction ? (
            <div className="space-y-5">
              {/* 结果页内容保持你原来那整段，不用改 */}
        </Card>
      </div>
    </div>
  );
}