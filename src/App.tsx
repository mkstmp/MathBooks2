import React, { useState, useEffect } from "react";
import { Book } from "./types";
import { BOOKS } from "./data/books";
import BookShowcase from "./components/BookShowcase";
import SitemapView from "./components/SitemapView";
import CrawlerGuide from "./components/CrawlerGuide";
import InteractiveReader from "./components/InteractiveReader";
import {
  GraduationCap,
  BookOpen,
  Map,
  Terminal,
  LogIn,
  LogOut,
  Sparkles,
  Info,
  CheckCircle,
  HelpCircle
} from "lucide-react";

export default function App() {
  // Navigation Routing States
  const [activeTab, setActiveTab] = useState<"showcase" | "sitemap" | "crawler">("showcase");
  const [selectedBookSlug, setSelectedBookSlug] = useState<string | null>(null);

  // Authentication State with simple localStorage persistence
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [sessionToken, setSessionToken] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // Search and Category Filter triggers handled across components
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Inline login fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Restore authenticated session state across preview frame swaps
  useEffect(() => {
    const savedToken = localStorage.getItem("math_portal_token");
    const savedRole = localStorage.getItem("math_portal_role");
    if (savedToken && savedRole) {
      setIsAuthenticated(true);
      setSessionToken(savedToken);
      setUserRole(savedRole);
    }
  }, []);

  const handleLoginSuccess = (token: string, role: string) => {
    setIsAuthenticated(true);
    setSessionToken(token);
    setUserRole(role);
    localStorage.setItem("math_portal_token", token);
    localStorage.setItem("math_portal_role", role);
    setShowLoginModal(false);
    setAuthError("");
    setUsername("");
    setPassword("");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSessionToken("");
    setUserRole("");
    localStorage.removeItem("math_portal_token");
    localStorage.removeItem("math_portal_role");
    setSelectedBookSlug(null);
  };

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsLoggingIn(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        handleLoginSuccess(data.token, data.role);
      } else {
        setAuthError(data.error || "Authentication rejected.");
      }
    } catch (err) {
      setAuthError("Remote server authentication timing fault.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const selectedBook = selectedBookSlug ? BOOKS.find((b) => b.slug === selectedBookSlug) : null;

  return (
    <div id="portal-root" className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Editorial Navigation Top Header */}
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md flex items-center shrink-0">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedBookSlug(null)}>
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold shrink-0">
              Σ
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none flex items-center gap-1.5">
                <span>MathPortal</span>
                <span className="inline-flex px-1.5 py-0.5 bg-indigo-50 border border-indigo-150 rounded text-[9px] font-bold text-indigo-600 font-mono">
                  PRO
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5 tracking-wide">Classes 1 - 10 syllabus</p>
            </div>
          </div>

          {/* Nav pills links with indigo active state */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => {
                setActiveTab("showcase");
                setSelectedBookSlug(null);
              }}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${
                activeTab === "showcase" && !selectedBook
                  ? "bg-white text-indigo-700 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Catalogues</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("sitemap");
                setSelectedBookSlug(null);
              }}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${
                activeTab === "sitemap" && !selectedBook
                  ? "bg-white text-indigo-700 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Sitemap</span>
            </button>
            {isAuthenticated && (userRole === "admin" || userRole === "crawler") && (
              <button
                onClick={() => {
                  setActiveTab("crawler");
                  setSelectedBookSlug(null);
                }}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${
                  activeTab === "crawler" && !selectedBook
                    ? "bg-white text-indigo-700 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Crawler API</span>
              </button>
            )}
          </nav>

          {/* Action Login Controller with indigo focus */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg uppercase tracking-wider font-mono border border-emerald-150">
                  {userRole} Mode
                </span>
                <button
                  id="header-logout-btn"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-400" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  id="header-login-btn"
                  onClick={() => setShowLoginModal(true)}
                  className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* If a Book is selected, mount the Interactive sandbox reader directly */}
        {selectedBook ? (
          <InteractiveReader
            book={selectedBook}
            onBack={() => setSelectedBookSlug(null)}
            isAuthenticated={isAuthenticated}
            onLogin={handleLoginSuccess}
            sessionToken={sessionToken}
          />
        ) : (
          <>            {/* Elegant Hero Intro Card on Landing Catalog Page */}
            {activeTab === "showcase" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-8 text-slate-900 relative overflow-hidden shadow-xs">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50/30 rounded-full blur-3xl -z-10 opacity-70"></div>

                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-150 text-indigo-700 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider mb-4 leading-none">
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    <span>Olympiad & boards directory</span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight md:text-3xl text-slate-900 font-sans">
                    A Unified Platform For Mathematical Material Curation.
                  </h2>
                  <p className="text-slate-500 mt-2 text-xs sm:text-sm leading-relaxed max-w-xl">
                    Host of core worksheets modules from Class 1 up to Class 10. Direct crawl endpoints compiled as valid standard PDF files or play actively with immediate grading keys feedback.
                  </p>
                </div>
              </div>
            )}

            {/* Mobile Tab view panels */}
            <div className={`md:hidden mb-6 flex bg-white border border-slate-200 p-1 rounded-xl`}>
              <button
                onClick={() => setActiveTab("showcase")}
                className={`flex-1 text-center py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === "showcase" ? "bg-indigo-600 text-white shadow-xs font-bold" : "text-slate-500"
                }`}
              >
                Catalogue
              </button>
              <button
                onClick={() => setActiveTab("sitemap")}
                className={`flex-1 text-center py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === "sitemap" ? "bg-indigo-600 text-white shadow-xs font-bold" : "text-slate-500"
                }`}
              >
                Sitemap
              </button>
              {isAuthenticated && (userRole === "admin" || userRole === "crawler") && (
                <button
                  onClick={() => setActiveTab("crawler")}
                  className={`flex-1 text-center py-2 rounded-lg text-xs font-semibold transition ${
                    activeTab === "crawler" ? "bg-indigo-600 text-white shadow-xs font-bold" : "text-slate-500"
                  }`}
                >
                  Crawler Guide
                </button>
              )}
            </div>

            {/* Active view component map */}
            {activeTab === "showcase" && (
              <BookShowcase
                onSelectBook={(slug) => setSelectedBookSlug(slug)}
                isAuthenticated={isAuthenticated}
                onOpenLogin={() => setShowLoginModal(true)}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            )}

            {activeTab === "sitemap" && (
              <SitemapView
                onSelectBook={(slug) => {
                  setSelectedBookSlug(slug);
                }}
                onOpenClass={(cls) => {
                  setSearchQuery(cls);
                  setActiveTab("showcase");
                }}
              />
            )}

            {activeTab === "crawler" && isAuthenticated && (userRole === "admin" || userRole === "crawler") && <CrawlerGuide sessionToken={sessionToken} />}
          </>
        )}
      </main>

      {/* Footer details credit line as human standard */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-mono">
          <div>
            <span>Math Workbook Portal • Curated Curriculum Directory</span>
          </div>
          <div className="text-slate-350">
            <span>© {new Date().getFullYear()} National Mathematics Council</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal overlay for the public Catalogue card unlocks */}
      {showLoginModal && (
        <div id="login-modal-overlay" className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-150 p-6 sm:p-8 max-w-sm w-full relative shadow-xl">
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-3 font-bold">
                Σ
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Enter Math Portal</h3>
              <p className="text-xs text-slate-500 mt-1">Unlock raw syllabus contents and math graders.</p>
            </div>

            <form onSubmit={handleFormLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase font-mono">Portal Username</label>
                <input
                  id="modal-username-field"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="student"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 text-xs text-slate-800 font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase font-mono">Portal Password</label>
                <input
                  id="modal-password-field"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 text-xs text-slate-800 font-sans"
                />
              </div>

              {authError && (
                <div className="p-3 bg-rose-50 text-rose-600 text-xs font-semibold rounded-lg flex items-center gap-1.5 leading-relaxed">
                  <span>{authError}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    setAuthError("");
                  }}
                  className="flex-1 py-2 border border-slate-200 text-slate-500 hover:text-slate-950 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="modal-submit-login"
                  type="submit"
                  disabled={isLoggingIn}
                  className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  {isLoggingIn ? "Logging in..." : "Validate"}
                </button>
              </div>
            </form>

            {/* Elegant and secure developer credentials helper panel */}
            <div className="mt-5 pt-4 border-t border-slate-100 font-sans text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Access Credentials Directory</span>
              <div className="space-y-1.5 text-[11px] text-slate-500">
                <div className="inline-flex flex-wrap items-center justify-center gap-1 bg-slate-50 border border-slate-150 px-2 py-1 rounded-md w-full">
                  <span className="font-semibold text-slate-400">Student:</span>
                  <code className="bg-white px-1 py-0.5 border border-slate-100 rounded text-indigo-600 select-all font-mono">student</code>
                  <span className="text-slate-300">/</span>
                  <code className="bg-white px-1 py-0.5 border border-slate-100 rounded text-indigo-600 select-all font-mono">$ecret@123</code>
                </div>
                <div className="inline-flex flex-wrap items-center justify-center gap-1 bg-slate-50 border border-slate-150 px-2 py-1 rounded-md w-full">
                  <span className="font-semibold text-slate-400">Crawler:</span>
                  <code className="bg-white px-1 py-0.5 border border-slate-100 rounded text-slate-600 select-all font-mono font-medium">books_crawler</code>
                  <span className="text-slate-300">/</span>
                  <code className="bg-white px-1 py-0.5 border border-slate-100 rounded text-slate-600 select-all font-mono font-medium">super_secret_books_pass</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
