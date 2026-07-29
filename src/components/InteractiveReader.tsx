import React, { useState, useEffect } from "react";
import { Book, Chapter, PracticeSet, Question } from "../types";
import {
  Lock,
  ArrowLeft,
  GraduationCap,
  Play,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Lightbulb,
  CheckCircle,
  XCircle,
  HelpCircle,
  Download,
  KeyRound,
  Info
} from "lucide-react";

interface InteractiveReaderProps {
  book: Book;
  onBack: () => void;
  isAuthenticated: boolean;
  onLogin: (token: string, role: string) => void;
  sessionToken: string;
}

export default function InteractiveReader({
  book,
  onBack,
  isAuthenticated,
  onLogin,
  sessionToken
}: InteractiveReaderProps) {
  // Navigation State
  const [activeTab, setActiveTab] = useState<"chapters" | "practices">("chapters");
  const [selectedChapterIdx, setSelectedChapterIdx] = useState(0);
  const [selectedPracticeIdx, setSelectedPracticeIdx] = useState(0);

  // Authentication Fields inside reader lock state
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Student interaction arrays inside sandbox
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: string | number }>({});
  const [gradedQuestions, setGradedQuestions] = useState<{ [qId: string]: { correct: boolean; checked: boolean } }>({});
  const [shownHints, setShownHints] = useState<{ [qId: string]: boolean }>({});

  const activeChapter = book.chapters[selectedChapterIdx] || null;
  const activePractice = book.practiceSets[selectedPracticeIdx] || null;

  // Initialize arrays cleanly when swapping tabs or chapters
  useEffect(() => {
    setUserAnswers({});
    setGradedQuestions({});
    setShownHints({});
  }, [selectedChapterIdx, selectedPracticeIdx, activeTab]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUser, password: loginPass })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        onLogin(data.token, data.role);
      } else {
        setLoginError(data.error || "Invalid username or password credentials.");
      }
    } catch (err) {
      setLoginError("Could not connect to the authentication server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerChange = (qId: string, val: string | number) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleRevealHint = (qId: string) => {
    setShownHints((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const verifyStudentAnswer = (q: Question) => {
    const studentAns = userAnswers[q.id];
    if (studentAns === undefined || studentAns === "") return;

    let isCorrect = false;

    if (q.answerType === "number") {
      isCorrect = Number(studentAns) === Number(q.correctAnswer);
    } else {
      isCorrect = String(studentAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
    }

    setGradedQuestions((prev) => ({
      ...prev,
      [q.id]: { correct: isCorrect, checked: true }
    }));
  };

  const resetWorkbookSandbox = () => {
    setUserAnswers({});
    setGradedQuestions({});
    setShownHints({});
  };

  // Grade color helper based on Class Book Level
  const getSubjectColor = () => {
    const cls = book.class;
    if (cls.includes("10")) return "rose";
    if (cls.includes("9")) return "indigo";
    if (cls.includes("8")) return "amber";
    if (cls.includes("7")) return "teal";
    return "purple";
  };

  const gradeColor = getSubjectColor();

  const getBorderClass = (graded: { checked: boolean; correct: boolean } | undefined) => {
    if (!graded || !graded.checked) {
      if (gradeColor === "rose") return "border-rose-100 hover:border-rose-200 bg-rose-50/20";
      if (gradeColor === "indigo") return "border-indigo-100 hover:border-indigo-200 bg-indigo-50/20";
      if (gradeColor === "amber") return "border-amber-100 hover:border-amber-200 bg-amber-50/20";
      if (gradeColor === "teal") return "border-teal-100 hover:border-teal-200 bg-teal-50/20";
      return "border-purple-100 hover:border-purple-200 bg-purple-50/20";
    }
    return graded.correct ? "border-emerald-200 bg-emerald-50/10" : "border-rose-200 bg-rose-50/10";
  };

  // Calculate global workbook score for progress tracking
  const activeQuestionsList: Question[] =
    activeTab === "chapters"
      ? (activeChapter ? activeChapter.questions : [])
      : (activePractice ? activePractice.questions : []);

  const totalQuestions = activeQuestionsList.length;
  const gradedValues = Object.keys(gradedQuestions).map(key => gradedQuestions[key]);
  const correctCount = gradedValues.filter((g) => g.checked && g.correct).length;

  // LArge locked view rendering to preserve access control constraints physically on the client
  if (!isAuthenticated) {
    return (
      <div id="interactive-reader-locked-screen" className="max-w-md mx-auto my-12 p-8 bg-white border border-slate-200 rounded-2xl shadow-xs relative overflow-hidden">
        {/* Decorative backdrop */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl -z-10 opacity-60"></div>

        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs font-semibold mb-6 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Book Showcase</span>
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-indigo-50 rounded-full border border-indigo-100 flex items-center justify-center text-indigo-650 mb-4 font-bold">
            Σ
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-sans">Workbook Access Registry</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            Content within <span className="font-semibold text-slate-800">{book.title}</span> is restricted to validated student profiles and verified crawling crawlers.
          </p>
        </div>

        {/* Interactive login form inside locks */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase font-mono">Profile Name</label>
            <input
              id="reader-username-input"
              type="text"
              required
              value={loginUser}
              onChange={(e) => setLoginUser(e.target.value)}
              placeholder="e.g. student"
              className="w-full px-3.5 py-2 bg-slate-100 border border-slate-205 rounded-lg text-xs outline-none focus:border-indigo-500 focus:bg-white text-slate-800 font-sans"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase font-mono">Gateway Password</label>
            <input
              id="reader-password-input"
              type="password"
              required
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 bg-slate-100 border border-slate-205 rounded-lg text-xs outline-none focus:border-indigo-500 focus:bg-white text-slate-800 font-sans"
            />
          </div>

          {loginError && (
            <div className="p-3 bg-rose-50 text-rose-600 text-xs font-semibold rounded-lg flex items-center gap-1.5 leading-relaxed font-sans">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <button
            id="reader-login-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-lg py-2 text-xs font-semibold tracking-wide transition uppercase cursor-pointer"
          >
            {isSubmitting ? "Authenticating Profile..." : "Unlock Math Workbook"}
          </button>
        </form>
      </div>
    );
  }

  // Double Check if Book has categories and elements
  return (
    <div id="interactive-reader-panel" className="max-w-7xl mx-auto my-6 px-1">
      {/* Book header navigation bar containing quick actions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 rounded-lg transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block font-mono">
              Unrestricted Academic Reader
            </span>
            <h2 className="text-lg font-bold text-slate-900 font-sans tracking-tight">
              {book.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          {/* Download PDF button enabled under active login context */}
          <a
            href={`${book.pdf_url}?token=${sessionToken}`}
            download
            className="inline-flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 px-4 rounded-lg text-xs font-bold transition border border-indigo-150"
          >
            <Download className="w-4 h-4" />
            <span>Download Book PDF</span>
          </a>
        </div>
      </div>

      {/* Main split dual-pane work sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar Table of Syllabus & Practice levels (Col-Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
            {/* Sidebar toggle between Chapters and Combined Practice Sets */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg border border-slate-150">
              <button
                onClick={() => {
                  setActiveTab("chapters");
                  resetWorkbookSandbox();
                }}
                className={`py-1.5 px-3 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "chapters" ? "bg-white text-indigo-700 shadow-3xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Chapters</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("practices");
                  resetWorkbookSandbox();
                }}
                className={`py-1.5 px-3 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "practices" ? "bg-white text-indigo-700 shadow-3xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Olympiad Prep</span>
              </button>
            </div>

            {/* Selector listing based on active navigation category */}
            {activeTab === "chapters" ? (
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 font-mono">
                  Syllabus Core Chapters:
                </h4>
                <div className="space-y-1">
                  {book.chapters.map((ch, idx) => (
                    <button
                      key={ch.id}
                      onClick={() => {
                        setSelectedChapterIdx(idx);
                        resetWorkbookSandbox();
                      }}
                      className={`w-full text-left p-3 rounded-xl text-xs transition border flex items-start gap-2.5 cursor-pointer ${
                        selectedChapterIdx === idx
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-2xs font-semibold"
                          : "bg-white border-transparent hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        selectedChapterIdx === idx ? "bg-indigo-200 text-indigo-800" : "bg-slate-100 text-slate-500"
                      }`}>
                        {ch.ordinal}
                      </span>
                      <div>
                        <div className="font-bold">{ch.title}</div>
                        {ch.description && (
                          <div className={`text-[10px] mt-0.5 truncate ${
                            selectedChapterIdx === idx ? "text-indigo-650" : "text-slate-400"
                          }`}>
                            {ch.description}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                  {book.chapters.length === 0 && (
                    <div className="text-center py-4 bg-slate-50/55 rounded-xl text-xs italic text-slate-400 leading-relaxed font-sans border border-slate-100">
                      No chapters loaded under this book.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 font-mono">
                  Combined Practice Sets:
                </h4>
                <div className="space-y-1">
                  {book.practiceSets.map((ps, idx) => (
                    <button
                      key={ps.id}
                      onClick={() => {
                        setSelectedPracticeIdx(idx);
                        resetWorkbookSandbox();
                      }}
                      className={`w-full text-left p-3 rounded-xl text-xs transition border flex items-start gap-2.5 cursor-pointer ${
                        selectedPracticeIdx === idx
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold"
                          : "bg-white border-transparent hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="w-full">
                        <div className="truncate font-bold">{ps.level}</div>
                        <div className={`text-[10px] mt-0.5 ${
                          selectedPracticeIdx === idx ? "text-indigo-650" : "text-indigo-600 font-mono"
                        }`}>
                          {ps.setTitle} Questions
                        </div>
                      </div>
                    </button>
                  ))}
                  {book.practiceSets.length === 0 && (
                    <div className="text-center py-6 px-4 bg-slate-50 rounded-xl text-xs text-slate-500 leading-relaxed font-sans border border-slate-150">
                      <GraduationCap className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                      <span>Special Olympiad multi-sets loading... Custom exercises available across junior grades.</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Active Sandbox Panel (Col-Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Practice Set or Chapter Title Banner */}
          <div className="bg-white rounded-2xl border border-slate-205 shadow-2xs p-6 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1.5 h-full bg-indigo-500`}></div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono mb-1">
              <span>ACTIVE SANDBOX VIEW</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-sans tracking-tight">
              {activeTab === "chapters"
                ? (activeChapter ? `Chapter ${activeChapter.ordinal}: ${activeChapter.title}` : "Syllabus Outlines")
                : (activePractice ? `Olympiad Prep: ${activePractice.level} (${activePractice.setTitle})` : "Practice Drill")}
            </h3>
            {activeTab === "chapters" && activeChapter?.description && (
              <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
                {activeChapter.description}
              </p>
            )}

            {/* Scorecard tracker overlay */}
            {totalQuestions > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="text-xs text-slate-500 font-semibold font-mono">
                    Progress Tracker: <span className="text-indigo-600 font-bold">{correctCount}/{totalQuestions} Correct</span>
                  </div>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={resetWorkbookSandbox}
                    className="text-[10px] font-bold text-slate-450 hover:text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-400" />
                    <span>Reset Node</span>
                  </button>
                </div>

                {/* Score bar */}
                <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden shrink-0">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-300"
                    style={{ width: `${(correctCount / totalQuestions) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* List of active interactive questions with Auto-Grading validation */}
          <div className="space-y-4">
            {activeQuestionsList.map((q) => {
              const graded = gradedQuestions[q.id];
              const isHintRevealed = shownHints[q.id];
              
              // Apply unified clean borders
              const borderStyle = graded && graded.checked
                ? (graded.correct ? "border-emerald-250 bg-emerald-50/10" : "border-rose-250 bg-rose-50/10")
                : "border-slate-200 bg-white hover:border-slate-300";

              return (
                <div
                  key={q.id}
                  className={`rounded-2xl border p-5 sm:p-6 transition-all shadow-3xs relative overflow-hidden ${borderStyle}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-800 shrink-0 mt-0.5">
                        {q.number}
                      </span>
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded text-[9px] font-mono tracking-wider font-bold text-indigo-700 uppercase">
                          {q.section}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-900 leading-relaxed font-sans pt-1">
                          {q.text}
                        </h4>
                      </div>
                    </div>

                    {/* Graded validation icon */}
                    {graded && graded.checked && (
                      <div className="shrink-0 mt-1">
                        {graded.correct ? (
                          <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs uppercase font-mono">
                            <CheckCircle className="w-4 h-4 shrink-0" />
                            <span className="hidden sm:inline">Correct</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-rose-600 font-bold text-xs uppercase font-mono">
                            <XCircle className="w-4 h-4 shrink-0" />
                            <span className="hidden sm:inline">Incorrect</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Answer Input and Action Buttons Block */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-4">
                    {/* Different layouts for input methods */}
                    {q.answerType === "multiple-choice" && q.options ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {q.options.map((option, oIdx) => (
                          <label
                            key={oIdx}
                            className={`p-3 rounded-xl border text-xs transition cursor-pointer flex items-start gap-2.5 ${
                              userAnswers[q.id] === option
                                ? "bg-indigo-50 text-indigo-700 border-indigo-250 font-bold"
                                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`opts-${q.id}`}
                              checked={userAnswers[q.id] === option}
                              onChange={() => handleAnswerChange(q.id, option)}
                              className="hidden"
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    ) : q.answerType === "proof" ? (
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 mt-1 text-xs text-slate-600 leading-relaxed font-sans flex items-start gap-2.5">
                        <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <span>
                            This question requires physical derivation / algebraic proof matching. Work out the proof on paper and click verify model to compare with standard solution parameters:
                          </span>
                          <span className="block font-mono text-slate-800 mt-2 font-bold select-all bg-white p-2 rounded border border-slate-200">
                            {q.correctAnswer}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type={q.answerType === "number" ? "number" : "text"}
                          placeholder={q.answerType === "number" ? "Enter computed numeric value..." : "Enter short text answer..."}
                          value={userAnswers[q.id] || ""}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200/80 rounded-lg text-xs outline-none bg-white focus:border-indigo-500 font-mono tracking-wide"
                        />
                      </div>
                    )}

                    {/* Actions and reveal boxes */}
                    <div className="flex items-center justify-between gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        {q.hint && (
                          <button
                            onClick={() => handleRevealHint(q.id)}
                            className="text-[10px] font-bold text-slate-450 hover:text-indigo-600 uppercase font-mono tracking-wider flex items-center gap-1 cursor-pointer"
                          >
                            <Lightbulb className="w-3.5 h-3.5" />
                            <span>{isHintRevealed ? "Hide Hint" : "Reveal Hint"}</span>
                          </button>
                        )}
                      </div>

                      {q.answerType !== "proof" && (
                        <button
                          onClick={() => verifyStudentAnswer(q)}
                          disabled={userAnswers[q.id] === undefined || userAnswers[q.id] === ""}
                          className="px-4 py-1.5 bg-indigo-650 disabled:bg-slate-200 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 disabled:text-slate-400 transition cursor-pointer"
                        >
                          Check Answer
                        </button>
                      )}
                    </div>

                    {/* Interactive hint display block */}
                    {isHintRevealed && q.hint && (
                      <div className="p-3 bg-amber-50/60 text-amber-900 text-xs rounded-xl border border-amber-100 flex items-start gap-2.5 animate-fadeIn leading-relaxed">
                        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-amber-950 block text-[9px] uppercase tracking-wider mb-0.5">Hint guide:</span>
                          <span>{q.hint}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {totalQuestions === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-3xs max-w-sm mx-auto">
                <div className="p-3 bg-slate-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-slate-450 mb-3">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-slate-900 text-sm">Interactive Syllabus Blank</h4>
                <p className="text-xs text-slate-500 mt-1 px-4">
                  Select an active syllabus chapter or progressive training level from the sidebar registry tree.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
