"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Language = "en" | "zh";
type Dictionary = Record<string, string>;

const dictionary: Record<Language, Dictionary> = {
  en: {
    dashboard: "Dashboard",
    markets: "Markets",
    macro: "Macro",
    stress: "Stress",
    library: "Library",
    dataLab: "Data Lab",
    localCockpit: "Local macro cockpit",
    language: "Language",
    updated: "Updated",
    latest: "Latest",
    change: "Change",
    dashboardHome: "Research home",
    viewDiagnostics: "View diagnostics",
    pinnedIndicators: "Pinned indicators",
    addPin: "Add pin",
    removePin: "Remove pin",
    resetPins: "Reset defaults",
    noPinnedItems: "No pinned items yet.",
    explorer: "Explorer",
    assetExplorer: "Asset explorer",
    table: "Table",
    cards: "Cards",
    selectedAsset: "Selected asset",
    openDetail: "Open detail",
    localHistoryChart: "Local history chart",
    recentRows: "Recent rows",
    stressRadar: "Stress radar",
    partial: "partial",
    contextPercentile: "Context percentile",
    notAScore: "Not a score",
    contextOnly: "context only",
    notScored: "not scored",
    pending: "pending",
    unavailable: "Unavailable",
    chartRange: "Range",
    overlays: "Overlays",
    localData: "Local JSON data",
    diagnostics: "Diagnostics",
    evidenceLibrary: "Evidence Library",
  },
  zh: {
    dashboard: "仪表盘",
    markets: "市场",
    macro: "宏观",
    stress: "压力",
    library: "证据库",
    dataLab: "数据实验室",
    localCockpit: "本地宏观驾驶舱",
    language: "语言",
    updated: "更新",
    latest: "最新",
    change: "变化",
    dashboardHome: "研究主页",
    viewDiagnostics: "查看诊断",
    pinnedIndicators: "置顶指标",
    addPin: "添加置顶",
    removePin: "移除置顶",
    resetPins: "恢复默认",
    noPinnedItems: "暂无置顶项目。",
    explorer: "探索",
    assetExplorer: "资产探索",
    table: "表格",
    cards: "卡片",
    selectedAsset: "选中资产",
    openDetail: "打开详情",
    localHistoryChart: "本地历史图表",
    recentRows: "近期数据",
    stressRadar: "压力雷达",
    partial: "部分",
    contextPercentile: "背景百分位",
    notAScore: "不是评分",
    contextOnly: "仅作背景",
    notScored: "未评分",
    pending: "待接入",
    unavailable: "不可用",
    chartRange: "区间",
    overlays: "叠加",
    localData: "本地 JSON 数据",
    diagnostics: "诊断",
    evidenceLibrary: "证据库",
  },
};

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}>({
  language: "en",
  setLanguage: () => undefined,
  t: (key) => dictionary.en[key] ?? key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("macro-watch:language");
    if (saved === "zh" || saved === "en") setLanguageState(saved);
  }, []);

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    window.localStorage.setItem("macro-watch:language", next);
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: string) => dictionary[language][key] ?? dictionary.en[key] ?? key,
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div className="rounded-lg border border-line bg-ink p-2">
      <p className="mb-2 text-[11px] uppercase tracking-wide text-slate-500">{t("language")}</p>
      <div className="grid grid-cols-2 gap-1">
        {(["en", "zh"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setLanguage(item)}
            className={`rounded px-2 py-1.5 text-xs font-medium ${language === item ? "bg-cyan-400/15 text-cyan-200" : "text-slate-400 hover:bg-panel hover:text-white"}`}
          >
            {item === "en" ? "EN" : "中文"}
          </button>
        ))}
      </div>
    </div>
  );
}

export function LocalizedText({ id, fallback }: { id: string; fallback: string }) {
  const { t } = useLanguage();
  return <>{t(id) === id ? fallback : t(id)}</>;
}
