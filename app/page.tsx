"use client";

import React, { useMemo, useState } from "react";

type AxisKey = "V" | "R" | "C" | "F" | "D" | "S" | "A" | "M";
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

const questions: Question[] = [
  {
    id: 1,
    title: "一个新项目刚开始，你最先抓什么？",
    subtitle: "看你更偏方向意义，还是业务回报。",
    options: [
      { text: "先讲清楚它为什么值得做。", scores: { V: 3 } },
      { text: "先算回报周期和投入产出。", scores: { R: 3 } },
    ],
  },
  {
    id: 2,
    title: "同事来问：这事怎么推进？",
    subtitle: "看你更愿意接管，还是放手。",
    options: [
      { text: "我给你步骤，你按步骤执行。", scores: { C: 3 } },
      { text: "你自己定，我主要看结果。", scores: { F: 3 } },
    ],
  },
  {
    id: 3,
    title: "团队状态差的时候，你更像——",
    subtitle: "看你更偏激发，还是稳定。",
    options: [
      { text: "我会先把大家状态拉起来。", scores: { D: 3 } },
      { text: "先稳住节奏，不让场面失控。", scores: { S: 3 } },
    ],
  },
  {
    id: 4,
    title: "遇到模糊问题时，你更常见的第一反应是？",
    subtitle: "看你更偏快速行动，还是充分对齐。",
    options: [
      { text: "先动起来，边做边修正。", scores: { A: 3 } },
      { text: "先对齐关键前提，避免返工。", scores: { M: 3 } },
    ],
  },
];

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

export default function Page() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Array<number | null>>(
    Array(questions.length).fill(null)
  );

  const currentQuestion = questions[step];
  const isComplete = answers.every((x) => x !== null);
  const progress = Math.round(
    (answers.filter((x) => x !== null).length / questions.length) * 100
  );

  const scores = useMemo(() => buildScores(answers), [answers]);
  const code = useMemo(() => (isComplete ? getCode(scores) : ""), [isComplete, scores]);

  const selectOption = (optionIndex: number) => {
    const next = [...answers];
    next[step] = optionIndex;
    setAnswers(next);

    if (step < questions.length - 1) {
      setStep(step + 1);
    }
  };

  const restart = () => {
    setStarted(false);
    setStep(0);
    setAnswers(Array(questions.length).fill(null));
  };

  return (
    <div className="min-h-dvh bg-slate-50 px-4 py-6">
      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          {!started ? (
            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                BOSSTI
              </div>
              <h1 className="text-3xl font-black text-slate-900">测你是哪一型 BOSS</h1>
              <p className="text-sm leading-7 text-slate-700">
                这是一个极简测试页，用来先确认手机端点击和页面切换正常。
                只要这一版能进入答题页，就说明手机交互已经恢复正常。
              </p>

              <button
                type="button"
                onClick={() => setStarted(true)}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-base font-semibold text-white active:scale-[0.99]"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                开始测试
              </button>
            </div>
          ) : !isComplete ? (
            <div className="space-y-5">
              <div>
                <div className="mb-2 text-sm text-slate-500">
                  第 {step + 1} 题 / {questions.length}
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-slate-900 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">{currentQuestion.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{currentQuestion.subtitle}</p>
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={option.text}
                    type="button"
                    onClick={() => selectOption(idx)}
                    className="flex w-full items-start justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left text-slate-900 shadow-sm active:scale-[0.99]"
                    style={{ WebkitTapHighlightColor: "transparent" }}
                  >
                    <span className="pr-4 text-[15px] leading-6">{option.text}</span>
                    <span className="text-slate-400">›</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 disabled:opacity-40"
              >
                上一题
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                BOSSTI RESULT
              </div>
              <h2 className="text-3xl font-black text-slate-900">{code}</h2>
              <p className="text-sm leading-7 text-slate-700">
                恭喜，手机端已经成功从开始页进入答题页并完成结果切换。
                这说明当前页面交互是正常的，后面只需要把完整功能逐步加回来。
              </p>

              <div className="rounded-2xl bg-slate-100 p-4 text-sm leading-7 text-slate-700">
                V: {scores.V} / R: {scores.R} / C: {scores.C} / F: {scores.F} / D: {scores.D} / S: {scores.S} / A: {scores.A} / M: {scores.M}
              </div>

              <button
                type="button"
                onClick={restart}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-base font-semibold text-white"
              >
                重新测试
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}