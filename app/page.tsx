import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Share2, Sparkles, RotateCcw, ArrowRight, CheckCircle2, Crown, Flame } from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";

const axes = {
  V: "愿景型",
  R: "营收型",
  C: "控制型",
  F: "放权型",
  D: "戏剧型",
  S: "稳定型",
  A: "开干型",
  M: "开会型",
};

const axisPairs = [
  ["V", "R"],
  ["C", "F"],
  ["D", "S"],
  ["A", "M"],
];

const questions = [
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
  {
    id: 13,
    title: "听到‘这个方向不性感，但能赚钱’时，你会——",
    subtitle: "看你更偏理想，还是更偏业务现实。",
    options: [
      { text: "如果方向对，不性感也没关系。", scores: { V: 3 } },
      { text: "能不能做大，比短期观感更重要。", scores: { V: 2 } },
      { text: "不性感没关系，赚钱是事实。", scores: { R: 2 } },
      { text: "能赚钱就值得认真看。", scores: { R: 3 } },
    ],
  },
  {
    id: 14,
    title: "你的管理潜台词更像哪一句？",
    subtitle: "看你更偏控制，还是更偏授权。",
    options: [
      { text: "先按我的标准来。", scores: { C: 3 } },
      { text: "你可以做，但别越边界。", scores: { C: 2 } },
      { text: "你自己定，我不想全包。", scores: { F: 2 } },
      { text: "别什么都等我拍板。", scores: { F: 3 } },
    ],
  },
  {
    id: 15,
    title: "别人形容你的管理气质，更像——",
    subtitle: "看你更偏舞台感，还是更偏稳定感。",
    options: [
      { text: "存在感强，容易带动现场。", scores: { D: 3 } },
      { text: "我一讲话，空气会自动收紧。", scores: { D: 2 } },
      { text: "不一定热闹，但会让人有底。", scores: { S: 2 } },
      { text: "不靠表演，靠稳。", scores: { S: 3 } },
    ],
  },
  {
    id: 16,
    title: "推进一个项目时，你更怕什么？",
    subtitle: "看你更怕停滞，还是更怕失焦。",
    options: [
      { text: "一直聊，最后没有动作。", scores: { A: 3 } },
      { text: "节奏不够快，被外部抢先。", scores: { A: 2 } },
      { text: "没讲明白，各做各的。", scores: { M: 2 } },
      { text: "没有共识，后面返工。", scores: { M: 3 } },
    ],
  },
  {
    id: 17,
    title: "哪种表述更容易打动你？",
    subtitle: "看你更偏愿景叙事，还是偏结果承诺。",
    options: [
      { text: "这件事会让我们更不一样。", scores: { V: 3 } },
      { text: "这会拉高我们的长期天花板。", scores: { V: 2 } },
      { text: "这件事客户会直接买单。", scores: { R: 2 } },
      { text: "做完后下个月数字会明显改善。", scores: { R: 3 } },
    ],
  },
  {
    id: 18,
    title: "跨部门出现分歧时，你通常怎么处理？",
    subtitle: "看你更偏定夺，还是更偏自治。",
    options: [
      { text: "我来定，先别继续消耗。", scores: { C: 3 } },
      { text: "我给规则，按规则收口。", scores: { C: 2 } },
      { text: "让他们先自己对一下。", scores: { F: 2 } },
      { text: "谁最该负责，谁来解决。", scores: { F: 3 } },
    ],
  },
  {
    id: 19,
    title: "危机出现时，你最像哪种状态？",
    subtitle: "看你更偏高压在场，还是更偏冷静止损。",
    options: [
      { text: "我会快速提高现场张力。", scores: { D: 3 } },
      { text: "这时候我会变得非常有存在感。", scores: { D: 2 } },
      { text: "先做减震器，防止局面失控。", scores: { S: 2 } },
      { text: "先控节奏，再控局面。", scores: { S: 3 } },
    ],
  },
  {
    id: 20,
    title: "你对‘先干再说’这句话的态度是——",
    subtitle: "看你更偏先动，还是先讲清。",
    options: [
      { text: "这是大多数问题最有效的起点。", scores: { A: 3 } },
      { text: "很多事值得先动起来再说。", scores: { A: 2 } },
      { text: "可以先动，但前提要清楚。", scores: { M: 2 } },
      { text: "不讲清楚就动，后面通常更贵。", scores: { M: 3 } },
    ],
  },
  {
    id: 21,
    title: "评价一个人的价值时，你更看重——",
    subtitle: "看你更偏定义方向，还是更偏交付结果。",
    options: [
      { text: "他能不能把事情讲成一个更高阶的方向。", scores: { V: 3 } },
      { text: "他对长期布局有没有判断。", scores: { V: 2 } },
      { text: "他到底能不能把结果拿回来。", scores: { R: 2 } },
      { text: "说再多，最终还是看交付。", scores: { R: 3 } },
    ],
  },
  {
    id: 22,
    title: "当团队逐渐成熟时，你最希望发生什么？",
    subtitle: "看你更想标准统一，还是独立长成。",
    options: [
      { text: "所有人越来越像统一标准。", scores: { C: 3 } },
      { text: "组织越来越整齐，越来越少失控。", scores: { C: 2 } },
      { text: "更多人能替我判断，不必事事找我。", scores: { F: 2 } },
      { text: "我可以逐渐退出细节，系统自己长。", scores: { F: 3 } },
    ],
  },
  {
    id: 23,
    title: "你更像哪种存在？",
    subtitle: "火把型，还是压舱石型。",
    options: [
      { text: "火把，我负责点燃。", scores: { D: 3 } },
      { text: "我会把场子带起来。", scores: { D: 2 } },
      { text: "压舱石，我负责不塌。", scores: { S: 2 } },
      { text: "我不一定最亮，但我会让系统更稳。", scores: { S: 3 } },
    ],
  },
  {
    id: 24,
    title: "如果今天必须给自己一句真话，你更接近——",
    subtitle: "看你更偏迅速推进，还是偏先想清楚。",
    options: [
      { text: "我不是急，我只是受不了磨蹭。", scores: { A: 3 } },
      { text: "很多事先动了才有答案。", scores: { A: 2 } },
      { text: "我不是慢，我只是不想做错。", scores: { M: 2 } },
      { text: "很多问题不讲清楚，后面只会更贵。", scores: { M: 3 } },
    ],
  },
  {
    id: 25,
    title: "当资源有限时，你更倾向于——",
    subtitle: "看你更偏战略聚焦，还是营收优先。",
    options: [
      { text: "优先投向最能代表未来方向的事情。", scores: { V: 3 } },
      { text: "优先保证长期价值不被牺牲。", scores: { V: 2 } },
      { text: "优先投向回报最清晰的项目。", scores: { R: 2 } },
      { text: "优先保证收入和现金流安全。", scores: { R: 3 } },
    ],
  },
  {
    id: 26,
    title: "遇到执行偏差时，你更偏向——",
    subtitle: "看你更偏修正细节，还是相信成长。",
    options: [
      { text: "我会重新定义标准并校正动作。", scores: { C: 3 } },
      { text: "先收紧边界，避免继续偏差。", scores: { C: 2 } },
      { text: "先让对方自己修正看看。", scores: { F: 2 } },
      { text: "把问题讲清楚，让对方自己长出来。", scores: { F: 3 } },
    ],
  },
  {
    id: 27,
    title: "你更认可哪种领导影响力？",
    subtitle: "看你更偏感染，还是偏稳住。",
    options: [
      { text: "让团队感到被点燃。", scores: { D: 3 } },
      { text: "让团队感受到现场变化。", scores: { D: 2 } },
      { text: "让团队在复杂里仍然有秩序。", scores: { S: 2 } },
      { text: "让团队觉得有依靠、有节奏。", scores: { S: 3 } },
    ],
  },
  {
    id: 28,
    title: "面对一个不确定机会，你更会先做什么？",
    subtitle: "看你更偏原型验证，还是先建共识。",
    options: [
      { text: "先跑出一个最小版本。", scores: { A: 3 } },
      { text: "先找一小块试点。", scores: { A: 2 } },
      { text: "先把关键相关方说服。", scores: { M: 2 } },
      { text: "先确认范围、目标、边界。", scores: { M: 3 } },
    ],
  },
  {
    id: 29,
    title: "组织讨论新机会时，你最容易关注——",
    subtitle: "看你更先看方向，还是先看变现。",
    options: [
      { text: "它是否代表更大的位置。", scores: { V: 3 } },
      { text: "它会不会让我们更有辨识度。", scores: { V: 2 } },
      { text: "它会不会带来真实订单。", scores: { R: 2 } },
      { text: "它多久能转成业务结果。", scores: { R: 3 } },
    ],
  },
  {
    id: 30,
    title: "别人做事与你思路不同，但结果可能也不错时，你更可能——",
    subtitle: "看你更偏统一标准，还是偏多样路径。",
    options: [
      { text: "我还是希望过程更贴近我的标准。", scores: { C: 3 } },
      { text: "只要方向一致，过程也要相对可控。", scores: { C: 2 } },
      { text: "如果结果成立，我可以接受差异。", scores: { F: 2 } },
      { text: "不同人可以走不同路径，不必都像我。", scores: { F: 3 } },
    ],
  },
  {
    id: 31,
    title: "团队进入高压阶段时，你更愿意做什么？",
    subtitle: "看你更偏把气氛拉起来，还是把波动压下去。",
    options: [
      { text: "用更强的存在感把大家带起来。", scores: { D: 3 } },
      { text: "提高节奏，让所有人集中注意。", scores: { D: 2 } },
      { text: "先减少噪音，让组织先稳住。", scores: { S: 2 } },
      { text: "把最关键的问题和资源压稳。", scores: { S: 3 } },
    ],
  },
  {
    id: 32,
    title: "在启动复杂任务前，你最需要的是——",
    subtitle: "看你更需要开始，还是更需要确认。",
    options: [
      { text: "一个可执行的起点。", scores: { A: 3 } },
      { text: "一条能先跑起来的路径。", scores: { A: 2 } },
      { text: "一份清晰的前提和共识。", scores: { M: 2 } },
      { text: "一套明白的框架和边界。", scores: { M: 3 } },
    ],
  },
  {
    id: 33,
    title: "当你说‘这个组织需要升级’时，你通常指的是——",
    subtitle: "看你更偏目标升级，还是结果升级。",
    options: [
      { text: "我们得有更大的方向感。", scores: { V: 3 } },
      { text: "我们得重新定义长期位置。", scores: { V: 2 } },
      { text: "我们得把结果效率拉起来。", scores: { R: 2 } },
      { text: "我们得让交付更稳定、更清晰。", scores: { R: 3 } },
    ],
  },
  {
    id: 34,
    title: "你最欣赏哪种组织能力？",
    subtitle: "看你更偏整齐统一，还是自治进化。",
    options: [
      { text: "标准一致、少出偏差。", scores: { C: 3 } },
      { text: "动作统一、边界稳定。", scores: { C: 2 } },
      { text: "每个人都能独立承担。", scores: { F: 2 } },
      { text: "组织能自己长出新的解法。", scores: { F: 3 } },
    ],
  },
  {
    id: 35,
    title: "一个好的管理现场，在你眼里更像——",
    subtitle: "看你更偏有火花，还是更偏可预期。",
    options: [
      { text: "大家能明显感到能量被调动起来。", scores: { D: 3 } },
      { text: "现场有张力，事情有推动力。", scores: { D: 2 } },
      { text: "大家知道下一步是什么。", scores: { S: 2 } },
      { text: "节奏稳定，推进可预期。", scores: { S: 3 } },
    ],
  },
  {
    id: 36,
    title: "如果必须二选一，你更相信——",
    subtitle: "最后一题，用来校准你的行动方式。",
    options: [
      { text: "先做对一部分，比先想清全部更重要。", scores: { A: 3 } },
      { text: "很多结论只能在动作里产生。", scores: { A: 2 } },
      { text: "先把关键逻辑对齐，比盲动更重要。", scores: { M: 2 } },
      { text: "说清楚，往往比冲得快更省成本。", scores: { M: 3 } },
    ],
  },
];

const factionMap = {
  VC: {
    name: "天命统治派",
    short: "VC 阵营",
    slogan: "先定方向，再定秩序。",
    tone: "这一派更看重方向高度、组织边界和领导权威。通常拥有较强的目标感与控制力，适合在高不确定环境中快速确立中心。",
    tags: ["目标感强", "边界清晰", "中心稳定"],
    colors: {
      bg: "from-orange-500 via-rose-500 to-red-600",
      panel: "from-red-950/82 to-orange-950/28",
      primary: "#f59e0b",
      secondary: "#7c2d12",
      ink: "#111827"
    }
  },
  VF: {
    name: "理想游牧派",
    short: "VF 阵营",
    slogan: "先给方向，再给空间。",
    tone: "这一派更看重长期愿景、个体成长和组织弹性。通常具备开放性与想象力，适合新方向探索和非标准问题处理。",
    tags: ["想象力强", "组织弹性高", "开放度高"],
    colors: {
      bg: "from-emerald-500 via-teal-500 to-cyan-500",
      panel: "from-emerald-950/80 to-cyan-950/28",
      primary: "#14b8a6",
      secondary: "#065f46",
      ink: "#083344"
    }
  },
  RC: {
    name: "铁血绩效派",
    short: "RC 阵营",
    slogan: "先看结果，再谈过程。",
    tone: "这一派更重视交付质量、经营效率和组织纪律。通常具备强执行、强结果意识，适合在复杂环境中建立可验证的产出系统。",
    tags: ["结果导向", "执行力强", "秩序感高"],
    colors: {
      bg: "from-slate-700 via-zinc-600 to-amber-500",
      panel: "from-slate-950/84 to-amber-950/26",
      primary: "#f59e0b",
      secondary: "#334155",
      ink: "#0f172a"
    }
  },
  RF: {
    name: "掌柜经营派",
    short: "RF 阵营",
    slogan: "看似松弛，实则有数。",
    tone: "这一派更偏长期经营、边界感和低波动管理。通常不依赖高压存在感，而是通过持续经营与节奏管理推动组织向前。",
    tags: ["经营意识强", "节奏稳定", "长期主义"],
    colors: {
      bg: "from-cyan-600 via-sky-500 to-blue-600",
      panel: "from-cyan-950/82 to-indigo-950/26",
      primary: "#0ea5e9",
      secondary: "#164e63",
      ink: "#082f49"
    }
  }
};

const profileMap = {
  VCDA: {
    title: "控场指挥型 BOSS",
    tone: "你兼具方向驱动、组织控制、现场推动和行动执行能力。适合在目标清晰但节奏紧张的场景下快速统一方向。",
    tags: ["方向清晰", "控制力高", "推进迅速"],
    guide: [
      "在高压推进时，注意预留他人的判断空间。",
      "明确标准是优势，但避免把所有细节都收回自己手里。",
      "当组织规模扩大时，建立机制比持续亲自接管更重要。",
    ],
    socialCopy: "我的 BOSSTI 结果是 VCDA：控场指挥型，偏方向驱动、控制清晰、行动迅速。",
  },
  VCDM: {
    title: "愿景统筹型 BOSS",
    tone: "你擅长定义方向、统一认知和组织讨论。适合需要长期布局与复杂协同的环境。",
    tags: ["愿景导向", "统筹力强", "善于对齐"],
    guide: [
      "对齐能力很强，但也要避免讨论过度。",
      "愿景表达越强，越要同步给出行动优先级。",
      "你适合做大局统筹，也要留意节奏效率。",
    ],
    socialCopy: "我的 BOSSTI 结果是 VCDM：愿景统筹型，偏长期方向、认知整合与组织协同。",
  },
  VCSA: {
    title: "驱动冲锋型 BOSS",
    tone: "你擅长点燃现场、强化注意力并快速推动行动。适合需要强驱动和高能量的项目阶段。",
    tags: ["驱动力强", "带动感高", "动作果断"],
    guide: [
      "高能量是优势，但也要照顾团队续航。",
      "推动速度快时，适当增加节奏缓冲。",
      "把个人驱动力沉淀成组织能力，会更可持续。",
    ],
    socialCopy: "我的 BOSSTI 结果是 VCSA：驱动冲锋型，偏高能量推进和快速行动。",
  },
  VCSM: {
    title: "价值收拢型 BOSS",
    tone: "你擅长在温和氛围中建立一致认知，并逐步把团队带入清晰的价值体系。适合做长期文化与组织建设。",
    tags: ["价值观强", "风格温和", "组织收拢"],
    guide: [
      "你很适合建立文化，但也要防止抽象化。",
      "价值感与执行感同步出现时，团队会更稳。",
      "把组织语言转化为具体机制，会更有效。",
    ],
    socialCopy: "我的 BOSSTI 结果是 VCSM：价值收拢型，偏温和一致、长期文化和认知建设。",
  },
  VFDA: {
    title: "方向放权型 BOSS",
    tone: "你擅长给出方向，同时愿意给团队较大行动空间。适合探索型组织和新业务孵化。",
    tags: ["方向感强", "授权度高", "探索感强"],
    guide: [
      "放权时，边界和收口机制要同步出现。",
      "你适合带探索团队，但需要更清晰的里程碑。",
      "方向清楚、节奏明确时，授权效果会更好。",
    ],
    socialCopy: "我的 BOSSTI 结果是 VFDA：方向放权型，偏给方向、给空间、促探索。",
  },
  VFDM: {
    title: "概念策动型 BOSS",
    tone: "你擅长创造故事、定义可能性并把人吸引进更大的叙事中。适合创新、品牌和早期战略场景。",
    tags: ["概念能力强", "故事驱动", "创造力高"],
    guide: [
      "你在创造新叙事上很强，也要增强收尾能力。",
      "当概念落地节奏清楚时，影响力会更稳定。",
      "适合做新方向定义，也要关注具体交付。",
    ],
    socialCopy: "我的 BOSSTI 结果是 VFDM：概念策动型，偏故事塑造、可能性定义和创新驱动。",
  },
  VFSA: {
    title: "灵感行动型 BOSS",
    tone: "你拥有较强的方向感和行动力，也愿意给予团队空间。适合高变化、高创造性的业务环境。",
    tags: ["灵感驱动", "行动导向", "授权灵活"],
    guide: [
      "你的灵感和动作都很快，节奏管理要更有结构。",
      "当变化频率较高时，更需要稳定沟通机制。",
      "你适合带创新团队，也要照顾组织可预期性。",
    ],
    socialCopy: "我的 BOSSTI 结果是 VFSA：灵感行动型，偏快速尝试、开放协作和创新推进。",
  },
  VFSM: {
    title: "开放经营型 BOSS",
    tone: "你重视长期方向，也尊重个体空间，整体风格温和稳定。适合低波动、长期主义导向的组织。",
    tags: ["开放度高", "长期导向", "低压管理"],
    guide: [
      "温和是优势，但关键边界要更清晰。",
      "稳定氛围之下，仍然需要节奏指引。",
      "你适合长期经营，也要避免目标模糊。",
    ],
    socialCopy: "我的 BOSSTI 结果是 VFSM：开放经营型，偏长期愿景、开放协作和稳定节奏。",
  },
  RCDA: {
    title: "高压结果型 BOSS",
    tone: "你高度关注结果、标准、执行和速度。适合目标明确、结果刚性强的组织环境。",
    tags: ["结果感强", "执行直接", "推进快速"],
    guide: [
      "在追求效率时，也要关注团队承载力。",
      "明确目标之外，过程反馈机制也很重要。",
      "你适合带高标准团队，但要避免长期紧绷。",
    ],
    socialCopy: "我的 BOSSTI 结果是 RCDA：高压结果型，偏结果驱动、执行清晰、推进迅速。",
  },
  RCDM: {
    title: "规则运营型 BOSS",
    tone: "你重视结果，也重视制度、流程和组织协同。适合规模化管理、流程化经营和复杂系统治理。",
    tags: ["制度完善", "协同清晰", "管理成熟"],
    guide: [
      "流程是你的优势，但要避免流程代替判断。",
      "规则足够清楚时，组织会更稳定。",
      "适当保留灵活性，有助于组织保持活力。",
    ],
    socialCopy: "我的 BOSSTI 结果是 RCDM：规则运营型，偏流程治理、制度建设和结果管理。",
  },
  RCSA: {
    title: "冷静推进型 BOSS",
    tone: "你不依赖高张力表达，而是通过清晰标准和果断动作拿结果。适合实战、项目制与复杂执行环境。",
    tags: ["冷静高效", "标准明确", "行动果断"],
    guide: [
      "你的执行判断很强，也可以适当增加解释和反馈。",
      "清晰与冷静是优势，沟通可再多一点温度。",
      "你适合高执行场景，也适合做复杂项目收口。",
    ],
    socialCopy: "我的 BOSSTI 结果是 RCSA：冷静推进型，偏标准明确、动作果断和结果清晰。",
  },
  RCSM: {
    title: "制度经营型 BOSS",
    tone: "你兼顾结果、秩序、稳定和组织成熟度。适合长期经营、规模管理和系统性优化。",
    tags: ["经营成熟", "制度清晰", "稳定有序"],
    guide: [
      "稳定与制度是优势，也要给创新留空间。",
      "你很适合复杂系统管理，适当增加组织弹性会更平衡。",
      "当稳定与效率并行时，组织韧性会更强。",
    ],
    socialCopy: "我的 BOSSTI 结果是 RCSM：制度经营型，偏稳定管理、制度清晰和长期经营。",
  },
  RFDA: {
    title: "目标放权型 BOSS",
    tone: "你重视结果，也愿意给团队较大空间；你偏行动而不偏细抠。适合成熟团队、目标明确的业务单元。",
    tags: ["目标清晰", "授权合理", "节点发力"],
    guide: [
      "放权效果很好时，记得提前讲清标准。",
      "节点管理要更前置，避免尾段压力过大。",
      "你适合带成熟团队，也适合做高自主业务。",
    ],
    socialCopy: "我的 BOSSTI 结果是 RFDA：目标放权型，偏结果导向、授权清晰和节点发力。",
  },
  RFDM: {
    title: "经营平衡型 BOSS",
    tone: "你整体风格松弛，但对收益、边界和协同非常清楚。适合做经营管理、资源配置和长期平衡。",
    tags: ["经营意识强", "平衡感好", "要求隐性但清楚"],
    guide: [
      "你对结果很清楚，也要更早表达标准。",
      "平衡感是优势，适合处理长期复杂关系。",
      "当目标透明时，你的管理会更高效。",
    ],
    socialCopy: "我的 BOSSTI 结果是 RFDM：经营平衡型，偏松弛外表、清晰经营和长期协调。",
  },
  RFSA: {
    title: "低调实干型 BOSS",
    tone: "你风格低调，重结果、重行动，也愿意给团队适当空间。适合务实推进、项目运营和长期合作场景。",
    tags: ["低调务实", "行动明确", "合作稳定"],
    guide: [
      "你的稳定执行力很强，也可以多做显性反馈。",
      "当团队更理解你的判断时，配合效率会更高。",
      "你适合长期合作型组织环境。",
    ],
    socialCopy: "我的 BOSSTI 结果是 RFSA：低调实干型，偏务实推进、低调管理和稳定交付。",
  },
  RFSM: {
    title: "长期掌柜型 BOSS",
    tone: "你不依赖高压和高戏剧性，而是通过经营意识、稳定节奏和长期布局推动组织发展。适合做长期经营与组织维护。",
    tags: ["长期主义", "松弛经营", "边界清楚"],
    guide: [
      "你的长期经营意识很强，关键时刻可以更显性一些。",
      "稳定和边界是优势，继续保持。",
      "你适合做长期经营型组织的负责人。",
    ],
    socialCopy: "我的 BOSSTI 结果是 RFSM：长期掌柜型，偏长期经营、节奏稳定和低波动管理。",
  },
};

function getDominance(scores, a, b) {
  const total = scores[a] + scores[b] || 1;
  const gap = Math.abs(scores[a] - scores[b]);
  return {
    winner: scores[a] >= scores[b] ? a : b,
    loser: scores[a] >= scores[b] ? b : a,
    gap,
    strength: gap / total,
  };
}

function buildScores(answers) {
  const total = { V: 0, R: 0, C: 0, F: 0, D: 0, S: 0, A: 0, M: 0 };
  answers.forEach((answerIndex, qIndex) => {
    if (answerIndex === null || answerIndex === undefined) return;
    const scores = questions[qIndex].options[answerIndex].scores;
    Object.entries(scores).forEach(([k, v]) => {
      total[k] += v;
    });
  });
  return total;
}

function getCode(scores) {
  const first = scores.V >= scores.R ? "V" : "R";
  const second = scores.C >= scores.F ? "C" : "F";
  const third = scores.D >= scores.S ? "D" : "S";
  const fourth = scores.A >= scores.M ? "A" : "M";
  return `${first}${second}${third}${fourth}`;
}

function getConfidence(scores) {
  const pairs = axisPairs.map(([a, b]) => getDominance(scores, a, b));
  const avg = pairs.reduce((sum, item) => sum + item.strength, 0) / pairs.length;
  return Math.max(60, Math.min(97, Math.round(64 + avg * 33)));
}

function getStrengthLabel(gap) {
  if (gap >= 10) return "非常明显";
  if (gap >= 6) return "较明显";
  if (gap >= 3) return "中等";
  return "轻度";
}

function getLeadershipCore(scores) {
  const vr = getDominance(scores, "V", "R");
  const cf = getDominance(scores, "C", "F");
  const ds = getDominance(scores, "D", "S");
  const am = getDominance(scores, "A", "M");

  const p1 = vr.winner === "V"
    ? `${getStrengthLabel(vr.gap)}愿景驱动。你在判断事情时更先看方向、长期意义和未来位置。`
    : `${getStrengthLabel(vr.gap)}营收驱动。你更关注结果、回报和业务闭环。`;

  const p2 = cf.winner === "C"
    ? `${getStrengthLabel(cf.gap)}控制倾向。你更重视统一标准、过程可控和关键节点的管理掌握。`
    : `${getStrengthLabel(cf.gap)}放权倾向。你更愿意让团队在明确目标下自主成长和独立判断。`;

  const p3 = ds.winner === "D"
    ? `${getStrengthLabel(ds.gap)}戏剧张力。你的存在感、表达力度和现场影响力会明显进入组织氛围。`
    : `${getStrengthLabel(ds.gap)}稳定倾向。你更偏向控节奏、压波动和建立可预期的推进环境。`;

  const p4 = am.winner === "A"
    ? `${getStrengthLabel(am.gap)}行动倾向。你更相信先动起来，再在动作中修正。`
    : `${getStrengthLabel(am.gap)}对齐倾向。你更相信先讲清楚，再组织推进。`;

  return `${p1}${p2}${p3}${p4}`;
}

function getTeamExperience(scores) {
  const vr = getDominance(scores, "V", "R");
  const cf = getDominance(scores, "C", "F");
  const ds = getDominance(scores, "D", "S");
  const am = getDominance(scores, "A", "M");

  let sentence = "团队通常会感受到：你属于";
  sentence += cf.winner === "C" ? "边界更清楚、管理参与度更高的负责人，" : "更愿意给空间、强调自驱的负责人，";
  sentence += ds.winner === "D" ? "你的现场影响力较强，" : "你的稳定感和可预期性较强，";
  sentence += am.winner === "A" ? "整体推进节奏偏快，" : "前期对齐和认知同步会更充分，";
  sentence += vr.winner === "V"
    ? "同时你会反复把大家拉回长期方向和意义。"
    : "同时你会持续把大家拉回结果和业务目标。";
  return sentence;
}

function getBlindSpot(scores) {
  const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  const map = {
    V: "你可能容易把方向感表达得过于完整，从而让团队低估实际执行的不确定性。",
    R: "你可能容易把结果语言放在过高优先级，导致过程信息和风险暴露不足。",
    C: "你可能容易在关键节点收回过多管理权，影响团队独立成长。",
    F: "你可能容易把信任做得过于宽松，导致边界和责任感不够明确。",
    D: "你可能容易让组织过度感受到你的现场张力，从而影响长期松弛度。",
    S: "你可能容易把稳定做得过强，进而压低一些探索性和锐度。",
    A: "你可能容易过快进入动作，从而让前置共识不足。",
    M: "你可能容易在讨论和校准中投入过多时间，影响推进效率。",
  };
  return map[top];
}

function getIdealTeam(scores) {
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

function getFlipRisk(code) {
  const riskMap = {
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
  return riskMap[code] || riskMap.RFSA;
}

function getFaction(code) {
  return code ? code.slice(0, 2) : "";
}

function getFactionLogoMeta(code) {
  const factionKey = getFaction(code);
  const faction = factionMap[factionKey] || factionMap.RF;
  const meta = {
    VC: { icon: "crown_shield", shape: "shield", accentWord: "DOMINION" },
    VF: { icon: "compass_banner", shape: "circle", accentWord: "VISION" },
    RC: { icon: "sword_grid", shape: "diamond", accentWord: "RESULT" },
    RF: { icon: "coin_gate", shape: "hex", accentWord: "BALANCE" },
  };
  return { ...faction, ...(meta[factionKey] || meta.RF), key: factionKey };
}

function getBossLook(code) {
  const map = {
    VCDA: ["方向清晰", "控制力高", "推进迅速", "标准明确"],
    VCDM: ["善于统筹", "认知整合", "愿景表达强", "组织协调度高"],
    VCSA: ["驱动力强", "行动速度快", "现场感明显", "目标聚焦"],
    VCSM: ["价值感强", "氛围温和", "长期建设", "组织收拢"],
    VFDA: ["方向感强", "授权度高", "探索感强", "节奏灵活"],
    VFDM: ["创新导向", "表达能力强", "概念感高", "启发性明显"],
    VFSA: ["灵感驱动", "尝试意愿强", "开放协作", "节奏快速"],
    VFSM: ["开放稳定", "长期导向", "低压管理", "空间感强"],
    RCDA: ["结果优先", "动作直接", "执行清晰", "压力管理强"],
    RCDM: ["流程能力强", "制度意识高", "协同度高", "系统感强"],
    RCSA: ["冷静高效", "标准明确", "执行果断", "实战感强"],
    RCSM: ["经营成熟", "秩序稳定", "长期有效", "管理感强"],
    RFDA: ["目标清晰", "授权合理", "节奏分明", "节点发力"],
    RFDM: ["经营平衡", "节奏松弛", "要求清楚", "资源感强"],
    RFSA: ["低调务实", "合作稳定", "交付可靠", "风格克制"],
    RFSM: ["长期主义", "经营稳定", "边界清楚", "低波动管理"],
  };
  return map[code] || map.RFSA;
}

function FactionLogoCard({ code, title, tone, confidence, bossLook }) {
  const faction = getFactionLogoMeta(code);

  return (
    <div className={`relative overflow-hidden rounded-[30px] bg-gradient-to-br ${faction.bg} p-1 shadow-[0_24px_80px_rgba(15,23,42,0.24)]`}>
      <div className="relative overflow-hidden rounded-[26px] bg-black/10">
        <div className="absolute inset-0 opacity-70">
          <div className="absolute -left-12 top-8 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute left-1/3 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-black/20 blur-3xl" />
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-black/24 blur-3xl" />
        </div>

        <div className="absolute left-5 top-5 rounded-full bg-black/78 px-3 py-1 text-[11px] font-bold tracking-[0.24em] text-white">
          FACTION LOGO CARD
        </div>
        <div className="absolute right-5 top-5 rounded-full border border-white/25 bg-black/28 px-3 py-1 text-xs font-semibold text-white">
          匹配度 {confidence}%
        </div>
        <div className="absolute -right-10 bottom-5 hidden rotate-[-90deg] text-[64px] font-black tracking-[0.28em] text-white/10 md:block">
          {code}
        </div>

        <div className="relative grid min-h-[320px] gap-0 md:min-h-[360px] md:grid-cols-[0.9fr_1.1fr]">
          <div className="relative flex items-center justify-center bg-black/12 p-4 sm:p-6 md:p-8">
            <svg viewBox="0 0 360 320" className="h-[220px] w-full max-w-[260px] drop-shadow-[0_18px_32px_rgba(0,0,0,0.22)] sm:h-[260px] sm:max-w-[300px] md:h-[300px] md:max-w-[340px]">
              <defs>
                <linearGradient id="logoGlowStrong" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="rgba(255,255,255,1)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.78)" />
                </linearGradient>
              </defs>
              <ellipse cx="160" cy="280" rx="102" ry="18" fill="rgba(15,23,42,0.22)" />
              <circle cx="160" cy="150" r="88" fill="rgba(255,255,255,0.09)" />
              <circle cx="160" cy="150" r="70" fill="rgba(255,255,255,0.14)" />

              {faction.shape === "shield" && (
                <path d="M160 72 L228 98 L218 176 Q210 226 160 252 Q110 226 102 176 L92 98 Z" fill="rgba(15,23,42,0.82)" stroke="url(#logoGlowStrong)" strokeWidth="6" />
              )}
              {faction.shape === "circle" && (
                <circle cx="160" cy="152" r="84" fill="rgba(6,95,70,0.72)" stroke="url(#logoGlowStrong)" strokeWidth="6" />
              )}
              {faction.shape === "diamond" && (
                <path d="M160 62 L246 152 L160 242 L74 152 Z" fill="rgba(15,23,42,0.82)" stroke="url(#logoGlowStrong)" strokeWidth="6" />
              )}
              {faction.shape === "hex" && (
                <path d="M116 82 H204 L248 152 L204 222 H116 L72 152 Z" fill="rgba(8,47,73,0.82)" stroke="url(#logoGlowStrong)" strokeWidth="6" />
              )}

              {faction.icon === "crown_shield" && (
                <g>
                  <path d="M124 124 L138 98 L154 124 L170 92 L186 124 L202 98 L216 124 L216 140 L124 140 Z" fill={faction.colors.primary} stroke="#fff7ed" strokeWidth="4" />
                  <path d="M126 170 H194" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
                  <path d="M140 190 H180" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
                </g>
              )}
              {faction.icon === "compass_banner" && (
                <g>
                  <circle cx="160" cy="150" r="40" fill="none" stroke="#ecfeff" strokeWidth="6" />
                  <path d="M160 104 L176 150 L160 196 L144 150 Z" fill={faction.colors.primary} stroke="#ecfeff" strokeWidth="4" />
                  <path d="M210 112 Q232 126 224 154 Q214 174 190 176" fill="none" stroke="#ecfeff" strokeWidth="5" strokeLinecap="round" />
                </g>
              )}
              {faction.icon === "sword_grid" && (
                <g>
                  <path d="M160 96 L174 128 L160 208 L146 128 Z" fill="#e2e8f0" stroke="#fff" strokeWidth="3" />
                  <path d="M134 132 H186" stroke={faction.colors.primary} strokeWidth="8" strokeLinecap="round" />
                  <path d="M116 176 H204 M116 200 H204" stroke="#f8fafc" strokeWidth="5" opacity="0.98" />
                </g>
              )}
              {faction.icon === "coin_gate" && (
                <g>
                  <circle cx="160" cy="128" r="24" fill={faction.colors.primary} stroke="#fff7ed" strokeWidth="4" />
                  <rect x="152" y="120" width="16" height="16" rx="2" fill={faction.colors.secondary} />
                  <path d="M118 200 Q160 150 202 200" fill="none" stroke="#f8fafc" strokeWidth="8" strokeLinecap="round" />
                  <path d="M132 200 V224 H188 V200" fill="none" stroke="#f8fafc" strokeWidth="8" strokeLinecap="round" />
                </g>
              )}

              <text x="160" y="268" textAnchor="middle" fill="rgba(255,255,255,0.98)" fontSize="20" fontWeight="800" letterSpacing="4">
                {faction.accentWord}
              </text>
            </svg>
          </div>

          <div className={`relative flex flex-col justify-between bg-gradient-to-b ${faction.panel} p-4 text-white sm:p-6 md:p-8`}>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/82">FACTION-STYLE BOSS PROFILE</div>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <h3 className="text-2xl font-black leading-tight text-white sm:text-3xl md:text-4xl">{title}</h3>
                <span
                  className="rounded-full border border-white/35 bg-white/92 px-3 py-1 text-sm font-bold shadow-sm"
                  style={{ color: faction.colors.ink }}
                >
                  {code}
                </span>
              </div>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white md:text-base md:leading-7">{tone}</p>
            </div>

            <div className="mt-6 space-y-5">
              <div className="flex flex-wrap gap-2">
                <span
                  className="rounded-full border border-white/35 bg-white/92 px-3 py-1.5 text-sm font-medium shadow-sm"
                  style={{ color: faction.colors.ink }}
                >
                  {faction.name}
                </span>
                {bossLook.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/30 bg-white/88 px-3 py-1.5 text-sm shadow-sm"
                    style={{ color: faction.colors.ink }}
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-3xl border border-white/16 bg-black/28 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-white/72">所属派系</div>
                  <div className="mt-2 text-xl font-black text-white">{faction.name}</div>
                  <div className="mt-1 text-sm leading-6 text-white/90">{faction.slogan}</div>
                </div>
                <div className="rounded-3xl border border-white/16 bg-black/28 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-white/72">派系简称</div>
                  <div className="mt-2 text-xl font-black text-white">{faction.short}</div>
                  <div className="mt-1 text-sm leading-6 text-white/90">16 型中的一个阵营坐标</div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-white/15 pt-4 text-xs uppercase tracking-[0.18em] text-white/70">
              <span>Organization Style Matrix</span>
              <span>BOSSTI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RadarRow({ label, value }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-900">{value}</span>
      </div>
      <Progress value={Math.min(100, value * 8)} className="h-2" />
    </div>
  );
}

export default function BOSSTIApp() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const progress = Math.round((answers.filter((x) => x !== null).length / questions.length) * 100);
  const currentQuestion = questions[step];
  const isComplete = answers.every((x) => x !== null);

  const scores = useMemo(() => buildScores(answers), [answers]);
  const code = useMemo(() => (isComplete ? getCode(scores) : ""), [isComplete, scores]);
  const result = useMemo(() => (code ? profileMap[code] : null), [code]);
  const confidence = useMemo(() => getConfidence(scores), [scores]);
  const bossLook = useMemo(() => (code ? getBossLook(code) : []), [code]);
  const faction = useMemo(() => (code ? factionMap[getFaction(code)] : null), [code]);

  const radarData = [
    { subject: "愿景 V", value: scores.V },
    { subject: "营收 R", value: scores.R },
    { subject: "控制 C", value: scores.C },
    { subject: "放权 F", value: scores.F },
    { subject: "戏剧 D", value: scores.D },
    { subject: "稳定 S", value: scores.S },
    { subject: "开干 A", value: scores.A },
    { subject: "开会 M", value: scores.M },
  ];

  const dynamicAnalysis = useMemo(() => {
    if (!isComplete || !code) return null;
    return {
      core: getLeadershipCore(scores),
      team: getTeamExperience(scores),
      blind: getBlindSpot(scores),
      fit: getIdealTeam(scores),
      risk: getFlipRisk(code),
    };
  }, [isComplete, scores, code]);

  const dimensionText = code
    ? code
        .split("")
        .map((letter) => `${letter} - ${axes[letter]}`)
        .join("\n")
    : "";

  const detailText = dynamicAnalysis
    ? `你是怎么当 BOSS 的：${dynamicAnalysis.core}

团队怎么感受你：${dynamicAnalysis.team}

你的主要盲区：${dynamicAnalysis.blind}

适配团队：${dynamicAnalysis.fit}

需要重点关注的风险：${dynamicAnalysis.risk}`
    : "";

  const resultText = result
    ? `BOSSTI：${code} ${result.title}

匹配度：${confidence}%

${result.tone}

所属派系：${factionMap[getFaction(code)]?.name}｜${factionMap[getFaction(code)]?.slogan}

关键词：
${bossLook.map((item, i) => `${i + 1}. ${item}`).join("\n")}

维度说明：
${dimensionText}

${detailText}

建议：
${result.guide.map((g, i) => `${i + 1}. ${g}`).join("\n")}

结果摘要：${result.socialCopy}`
    : "";

  const selectOption = (optionIndex) => {
    const next = [...answers];
    next[step] = optionIndex;
    setAnswers(next);
    if (step < questions.length - 1) setStep(step + 1);
  };

  const restart = () => {
    setAnswers(Array(questions.length).fill(null));
    setStep(0);
    setCopied(false);
    setLinkCopied(false);
    setStarted(false);
  };

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (e) {
      console.error(e);
    }
  };

  const copyShareLink = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1600);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_30%),radial-gradient(circle_at_right,_rgba(239,68,68,0.14),_transparent_24%),linear-gradient(180deg,#fafaf9_0%,#fff7ed_100%)] px-3 py-4 sm:px-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-4 md:space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-xl backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl md:text-4xl">BOSSTI</h1>
                <Badge className="rounded-full px-3 py-1 text-xs">36 题正式版 · 16 型 BOSS 测评</Badge>
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-600 md:text-base">
                这是一版更适合正式对外使用的 BOSSTI 测评。题目扩展为 36 道，结果解释采用更专业、清晰、稳定的测评表达，适合用户自测与客户测评场景。
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              "36 道题，稳定区分 16 种 BOSSTI 类型",
              "四组核心维度：愿景/营收、控制/放权、戏剧/稳定、开干/开会",
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
        </motion.div>

        <Card className="rounded-[24px] md:rounded-[28px] border-white/60 bg-white/90 shadow-xl">
          <CardHeader className="space-y-4 pb-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl text-slate-900">
                  {!started ? "开始测试" : isComplete ? "你的 16 型 BOSS 人格已完成判定" : `第 ${step + 1} 题 / ${questions.length}`}
                </CardTitle>
                <CardDescription className="mt-1 text-slate-600">
                  {!started ? "先阅读测评说明后开始。该版本适合正式对外测试、活动页和客户体验页。" : isComplete ? "结果页展示的是正式版解释，可直接用于用户测评、客户展示与内部测试。" : "请选择最符合你的选项。题目已扩展为 36 道，分型会更稳定。"}
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
            <AnimatePresence mode="wait">
              {!started ? (
                <motion.div key="cover" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.2 }} className="space-y-5">
                  <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">BOSSTI Formal Edition</div>
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
                      <Button onClick={() => setStarted(true)} className="rounded-2xl w-full sm:w-auto">
                        开始测试
                      </Button>
                    </div>

                    <div className="mt-6 border-t border-slate-200 pt-4 text-center text-xs leading-6 text-slate-500">
                      <div>给我的朋友做的娱乐评估，从客观角度认识一下自己</div>
                      <div>乌鲁木齐将予合信息科技服务有限公司——老王</div>
                    </div>
                  </div>
                </motion.div>
              ) : !isComplete ? (
                <motion.div key={currentQuestion.id} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.2 }} className="space-y-5">
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
                          className={`group rounded-2xl border p-4 text-left transition-all ${active ? "border-slate-900 bg-slate-900 text-white shadow-lg" : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="text-[15px] font-medium leading-6 sm:text-base sm:leading-7">{option.text}</div>
                            <ArrowRight className={`mt-1 h-4 w-4 shrink-0 ${active ? "text-white" : "text-slate-400 group-hover:text-slate-700"}`} />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <Button variant="outline" className="rounded-2xl" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
                      上一题
                    </Button>
                    <div className="text-xs text-slate-500">请选择最符合你的真实倾向，无标准答案。</div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="result" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl">
                    <div className="p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">BOSSTI 编号</div>
                          <div className="mt-2 flex flex-wrap items-end gap-3">
                            <h2 className="text-3xl font-black text-slate-900 md:text-4xl">{result.title}</h2>
                            <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white">{code}</span>
                          </div>
                          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-800">{result.tone}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-lg">
                          <div className="text-xs uppercase tracking-[0.2em] text-slate-300">匹配度</div>
                          <div className="mt-1 flex items-center gap-2 text-lg font-bold"><Flame className="h-4 w-4" />{confidence}%</div>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {result.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="rounded-full px-3 py-1 text-sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                        {code.split("").map((letter) => (
                          <div key={letter} className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm sm:p-4">
                            <div className="text-xl font-black text-slate-900 sm:text-2xl">{letter}</div>
                            <div className="mt-1 text-sm text-slate-600">{axes[letter]}</div>
                          </div>
                        ))}
                      </div>

                      <div
                        className="mt-6 rounded-2xl border p-5 shadow-sm"
                        style={faction ? { backgroundColor: `${faction.colors.primary}12`, borderColor: `${faction.colors.primary}40` } : undefined}
                      >
                        <div className="text-sm font-semibold text-slate-900">你的派系标志</div>
                        <div className="mt-4">
                          <FactionLogoCard code={code} title={result.title} tone={result.tone} confidence={confidence} bossLook={bossLook} />
                        </div>
                      </div>

                      <div
                        className="mt-6 rounded-2xl border p-5 shadow-sm"
                        style={faction ? { backgroundColor: `${faction.colors.primary}10`, borderColor: `${faction.colors.primary}40` } : undefined}
                      >
                        <div className="text-sm font-semibold text-slate-900">你所属的派系</div>
                        <div className="mt-3 grid gap-4 md:grid-cols-[0.9fr_1.1fr] md:items-start">
                          <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm" style={faction ? { borderColor: `${faction.colors.primary}35` } : undefined}>
                            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Faction</div>
                            <div className="mt-2 text-2xl font-black text-slate-900">{factionMap[getFaction(code)]?.name}</div>
                            <div className="mt-2 text-sm leading-7 text-slate-800">{factionMap[getFaction(code)]?.tone}</div>
                          </div>
                          <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm" style={faction ? { borderColor: `${faction.colors.primary}35` } : undefined}>
                            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">派系标签</div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {factionMap[getFaction(code)]?.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="rounded-full px-3 py-1 text-sm">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="mt-4 rounded-xl p-3 text-sm leading-7 text-slate-900" style={faction ? { backgroundColor: `${faction.colors.primary}18` } : undefined}>
                              {factionMap[getFaction(code)]?.slogan}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
                        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                          <h3 className="text-lg font-bold text-slate-900">你的维度图</h3>
                          <div className="mt-3 h-64 w-full sm:h-72">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart data={radarData} outerRadius="72%">
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                                <Radar dataKey="value" fill="currentColor" fillOpacity={0.2} stroke="currentColor" className="text-slate-900" />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900">你的维度分布</h3>
                            <div className="mt-4 space-y-4">
                              <RadarRow label="愿景输出值 V" value={scores.V} />
                              <RadarRow label="营收执念值 R" value={scores.R} />
                              <RadarRow label="控制冲动值 C" value={scores.C} />
                              <RadarRow label="放权松手值 F" value={scores.F} />
                              <RadarRow label="戏剧张力值 D" value={scores.D} />
                              <RadarRow label="稳定压场值 S" value={scores.S} />
                              <RadarRow label="开干速度值 A" value={scores.A} />
                              <RadarRow label="开会浓度值 M" value={scores.M} />
                            </div>
                          </div>

                          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900">结果摘要</h3>
                            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm leading-7 text-slate-800">
                              {result.socialCopy}
                            </div>
                            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                              <Button onClick={copyResult} className="rounded-2xl w-full sm:w-auto">
                                <Share2 className="mr-2 h-4 w-4" />
                                {copied ? "已复制摘要" : "复制结果摘要"}
                              </Button>
                              <Button variant="outline" onClick={restart} className="rounded-2xl w-full sm:w-auto">
                                <RotateCcw className="mr-2 h-4 w-4" />
                                重新测试
                              </Button>
                              <Button variant="outline" onClick={copyShareLink} className="rounded-2xl w-full sm:w-auto">
                                <Share2 className="mr-2 h-4 w-4" />
                                {linkCopied ? "已复制链接" : "分享链接"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                          <div className="text-sm font-semibold text-slate-900">你的管理核心</div>
                          <p className="mt-3 text-sm leading-7 text-slate-800">{dynamicAnalysis?.core}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                          <div className="text-sm font-semibold text-slate-900">团队感知</div>
                          <p className="mt-3 text-sm leading-7 text-slate-800">{dynamicAnalysis?.team}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                          <div className="text-sm font-semibold text-slate-900">主要盲区</div>
                          <p className="mt-3 text-sm leading-7 text-slate-800">{dynamicAnalysis?.blind}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                          <div className="text-sm font-semibold text-slate-900">适配团队画像</div>
                          <p className="mt-3 text-sm leading-7 text-slate-800">{dynamicAnalysis?.fit}</p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="text-sm font-semibold text-slate-900">重点关注风险</div>
                        <p className="mt-3 text-sm leading-7 text-slate-800">{dynamicAnalysis?.risk}</p>
                      </div>

                      <div className="mt-6 grid gap-4 md:grid-cols-3">
                        {result.guide.map((item, i) => (
                          <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                              <CheckCircle2 className="h-4 w-4" />
                              建议 {i + 1}
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-800">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
