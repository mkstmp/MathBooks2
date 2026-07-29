import React, { useState } from "react";
import { Book } from "../types";
import { BOOKS } from "../data/books";
import { Search, GraduationCap, Download, Calendar, Layers, Sparkles, BookOpen, Lock } from "lucide-react";

interface BookShowcaseProps {
  onSelectBook: (slug: string) => void;
  isAuthenticated: boolean;
  onOpenLogin: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

export default function BookShowcase({
  onSelectBook,
  isAuthenticated,
  onOpenLogin,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory
}: BookShowcaseProps) {
  // Available filter groups
  const categories = [
    { label: "All Grades", value: "all" },
    { label: "Primary (Class 1-2)", value: "primary" },
    { label: "Junior (Class 4-6)", value: "junior" },
    { label: "Middle School (Class 7-8)", value: "middle" },
    { label: "Olympiad Prep (Class 9-10)", value: "olympiad" }
  ];

  // Helper matching books to category criteria
  const isBookInCategory = (book: Book, catValue: string) => {
    if (catValue === "all") return true;
    const cls = book.class.toLowerCase();
    if (catValue === "primary") return cls.includes("class 1") || cls.includes("class 2");
    if (catValue === "junior") return cls.includes("class 4") || cls.includes("class 5") || cls.includes("class 6");
    if (catValue === "middle") return cls.includes("class 7") || cls.includes("class 8");
    if (catValue === "olympiad") return cls.includes("class 9") || cls.includes("class 10");
    return true;
  };

  // Combined categorization and search term filtering
  const filteredBooks = BOOKS.filter((book) => {
    const matchesCategory = isBookInCategory(book, selectedCategory);
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      book.title.toLowerCase().includes(searchLower) ||
      book.description.toLowerCase().includes(searchLower) ||
      book.class.toLowerCase().includes(searchLower) ||
      book.author.toLowerCase().includes(searchLower) ||
      book.subject.toLowerCase().includes(searchLower);

    return matchesCategory && matchesSearch;
  });

  // Dynamic SVG cover representations matching style motifs in snapshots
  const renderMathSketchCover = (book: Book) => {
    const cls = book.class;
    if (cls.includes("10")) {
      return (
        <svg className="w-full h-full text-rose-500/10" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M10 50 Q 30 20, 50 50 T 90 50" stroke="currentColor" strokeWidth="3" />
          <line x1="20" y1="20" x2="80" y2="80" stroke="currentColor" strokeWidth="1" />
          <line x1="20" y1="80" x2="80" y2="20" stroke="currentColor" strokeWidth="1" />
        </svg>
      );
    }
    if (cls.includes("9")) {
      return (
        <svg className="w-full h-full text-indigo-500/10" viewBox="0 0 100 100" fill="none">
          <rect x="25" y="25" width="50" height="50" stroke="currentColor" strokeWidth="2" />
          <line x1="10" y1="10" x2="90" y2="90" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="25" cy="25" r="5" fill="currentColor" />
          <circle cx="75" cy="75" r="5" fill="currentColor" />
          <circle cx="75" cy="25" r="5" fill="currentColor" />
        </svg>
      );
    }
    if (cls.includes("8")) {
      return (
        <svg className="w-full h-full text-amber-500/10" viewBox="0 0 100 100" fill="none">
          <polygon points="50,15 90,85 10,85" stroke="currentColor" strokeWidth="2.5" />
          <line x1="50" y1="15" x2="50" y2="85" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="50" cy="55" r="12" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    }
    if (cls.includes("7")) {
      return (
        <svg className="w-full h-full text-teal-500/10" viewBox="0 0 100 100" fill="none">
          <path d="M20,50 L80,50 M50,20 L50,80" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="2" />
          <path d="M30,30 L70,70" stroke="currentColor" strokeWidth="1" />
        </svg>
      );
    }
    if (cls.includes("6")) {
      return (
        <svg className="w-full h-full text-sky-500/10" viewBox="0 0 100 100" fill="none">
          <polygon points="50,10 85,35 85,75 50,90 15,75 15,35" stroke="currentColor" strokeWidth="2" />
          <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="1" />
        </svg>
      );
    }
    if (cls.includes("5")) {
      return (
        <svg className="w-full h-full text-violet-500/10" viewBox="0 0 100 100" fill="none">
          <rect x="20" y="20" width="60" height="60" rx="10" stroke="currentColor" strokeWidth="2" />
          <line x1="20" y1="50" x2="80" y2="50" stroke="currentColor" strokeWidth="2" />
          <rect x="35" y="32" width="30" height="12" rx="4" fill="currentColor" opacity="0.3" />
        </svg>
      );
    }
    if (cls.includes("4")) {
      return (
        <svg className="w-full h-full text-emerald-500/10" viewBox="0 0 100 100" fill="none">
          <line x1="10" y1="90" x2="90" y2="10" stroke="currentColor" strokeWidth="3" />
          <circle cx="30" cy="40" r="15" stroke="currentColor" strokeWidth="2" />
          <rect x="55" y="55" width="25" height="25" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    }
    // Default / Elementary patterns
    return (
      <svg className="w-full h-full text-pink-500/10" viewBox="0 0 100 100" fill="none">
        <circle cx="30" cy="30" r="12" fill="currentColor" opacity="0.4" />
        <rect x="52" y="18" width="24" height="24" fill="currentColor" opacity="0.4" />
        <polygon points="50,55 75,85 25,85" fill="currentColor" opacity="0.4" />
      </svg>
    );
  };

  const getCoverBgStyle = (cls: string) => {
    if (cls.includes("10")) return "from-rose-50 to-pink-50 border-rose-100";
    if (cls.includes("9")) return "from-indigo-50 to-blue-50 border-indigo-100";
    if (cls.includes("8")) return "from-amber-50 to-orange-50 border-amber-100";
    if (cls.includes("7")) return "from-teal-50 to-emerald-50 border-teal-100";
    if (cls.includes("6")) return "from-sky-50 to-blue-50 border-sky-100";
    if (cls.includes("5")) return "from-violet-50 to-fuchsia-50 border-violet-100";
    if (cls.includes("4")) return "from-emerald-50 to-green-50 border-emerald-100";
    if (cls.includes("2")) return "from-orange-50 to-red-50 border-orange-100";
    return "from-purple-50 to-pink-50 border-purple-100";
  };

  return (
    <div id="books-showcase-panel" className="space-y-8 max-w-7xl mx-auto px-1">
      {/* Category selector pill options & search combined card layout */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Real-time search filter */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              id="showcase-search-input"
              type="text"
              placeholder="Search math titles, subjects, equations or author name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200/80 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800 font-sans"
            />
          </div>

          <div className="text-xs text-slate-400 font-mono">
            {filteredBooks.length} / {BOOKS.length} books found
          </div>
        </div>

        {/* Categories scroll panel */}
        <div id="category-selector-nav" className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                selectedCategory === cat.value
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-2xs font-bold"
                  : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Book cards grid listing */}
      <div id="book-cards-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBooks.map((book) => {
          const coverBg = getCoverBgStyle(book.class);
          return (
            <div
              key={book.slug}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col h-full group"
            >
              {/* Dynamic generated book spine and visual abstract math pattern cover decoration */}
              <div className={`aspect-3/4 relative bg-gradient-to-br ${coverBg} border-b border-slate-200 p-6 flex flex-col justify-between overflow-hidden transition-all duration-300 group-hover:scale-[1.01]`}>
                {/* Background abstract sketch math SVG */}
                <div className="absolute inset-0 z-0">
                  {renderMathSketchCover(book)}
                </div>

                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-wider font-bold text-slate-500 uppercase">
                    {book.subject}
                  </span>
                  <div className="px-2.5 py-0.5 bg-white/95 backdrop-blur-xs rounded-md text-[10px] font-bold text-slate-700 shadow-2xs border border-white">
                    {book.class.toUpperCase()}
                  </div>
                </div>

                {/* Cover Centered typography mimicking scanned files layout */}
                <div className="relative z-10 my-4">
                  <h3 className="text-xl font-extrabold tracking-tight text-slate-900 font-sans leading-tight">
                    {book.title.replace(/:.*$/, "")}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono tracking-wide mt-1.5 font-bold">
                    {book.title.includes(":") ? book.title.replace(/^[^:]*:\s*/, "") : "Olympiad and Concept Workbook"}
                  </p>
                </div>

                <div className="relative z-10 flex items-center justify-between border-t border-slate-900/5 pt-3">
                  <span className="text-[11px] text-slate-400 font-medium">AUTHOR & PUBLISHER</span>
                  <span className="text-[10px] text-indigo-600 font-mono tracking-wider font-semibold">
                    {book.author.split(" ")[0]} COUNCIL
                  </span>
                </div>
              </div>

              {/* Text metadata footer content text blocks */}
              <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 leading-relaxed font-sans line-clamp-3">
                    {book.description}
                  </p>

                  <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-400 font-mono font-medium">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      <span>{book.chapters.length} Chapters</span>
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                    <span>{book.pagesCount} Printed Pages</span>
                  </div>
                </div>

                {/* Primary showcase access operations */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => onSelectBook(book.slug)}
                    className="inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read Book</span>
                  </button>

                  {/* Secured direct download button */}
                  {isAuthenticated ? (
                    <a
                      href={`${book.pdf_url}?token=token_student_session`}
                      download
                      className="inline-flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2 px-3 rounded-lg text-xs font-semibold transition text-center border border-emerald-150"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Saved PDF</span>
                    </a>
                  ) : (
                    <button
                      onClick={onOpenLogin}
                      className="inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer border border-transparent"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Get PDF</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-2xs max-w-md mx-auto">
          <div className="p-3 bg-slate-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="font-semibold text-slate-900 text-sm">No Math Workbooks Match Filter</h4>
          <p className="text-xs text-slate-500 mt-1 px-4">
            Try revising your search text or select another grade block category.
          </p>
        </div>
      )}
    </div>
  );
}
