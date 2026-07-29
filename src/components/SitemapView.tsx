import React from "react";
import { Book } from "../types";
import { BOOKS } from "../data/books";
import { Globe, Map, BookOpen, User, GraduationCap, FileCode, CheckCircle } from "lucide-react";

interface SitemapViewProps {
  onSelectBook: (slug: string) => void;
  onOpenClass: (className: string) => void;
}

export default function SitemapView({ onSelectBook, onOpenClass }: SitemapViewProps) {
  // Extract unique authors
  const authorsSet = new Set<string>();
  BOOKS.forEach((b) => {
    const parts = b.author.split(/, | & /).map((s) => s.trim());
    parts.forEach((p) => {
      if (p) authorsSet.add(p);
    });
  });
  const authors = Array.from(authorsSet);

  return (
    <div id="sitemap-view-root" className="bg-white rounded-2xl border border-slate-205 shadow-xs p-6 sm:p-10 max-w-5xl mx-auto my-8">
      {/* Sitemap Header */}
      <div className="border-b border-slate-150 pb-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-mono text-xs uppercase tracking-wider mb-1">
            <Map className="w-4 h-4" />
            <span>Interactive Index Tree</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-sans">
            Portal Sitemap & Directory
          </h2>
          <p className="text-slate-500 mt-1 max-w-xl text-sm leading-relaxed">
            Open-access index directory listing all hosted math workbooks, authors profiles, and subject learning trees for crawlers and students.
          </p>
        </div>

        {/* JSON Sitemap Action button */}
        <a
          id="json-sitemap-btn"
          href="/sitemap.json"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold transition shadow-2xs"
        >
          <FileCode className="w-4 h-4 text-indigo-500" />
          <span>View JSON Sitemap</span>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Author Profiles */}
        <div className="md:col-span-1 space-y-6">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-300" />
              <span>Author Profiles</span>
            </h3>
            <div className="space-y-4">
              {authors.map((author, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-150">
                  <h4 className="font-semibold text-slate-900 text-sm">{author}</h4>
                  <p className="text-xs text-indigo-600 font-medium mt-0.5">Contributor Council</p>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Senior curriculum designer specializing in boards preparation and advanced Olympiad content curation.
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
            <h4 className="font-semibold text-indigo-900 text-xs uppercase tracking-wider mb-2">Subject Scope</h4>
            <div className="space-y-1.5 text-xs text-indigo-700">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />
                <span>Arithmetic & Number Lines</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />
                <span>Linear & Quadratics Algebra</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />
                <span>Trigonometric Heights</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />
                <span>Olympiad Combo Puzzles</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Book Navigation Tree Map (Lists All Titles & Subject Navigation Links) */}
        <div className="md:col-span-2 space-y-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-300" />
            <span>Subject Tree & Workbook Links</span>
          </h3>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {BOOKS.map((book) => (
              <div
                key={book.slug}
                className="p-4 sm:p-5 rounded-xl border border-slate-200 hover:border-indigo-200 bg-white hover:bg-slate-50/30 transition shadow-2xs group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-xs font-semibold mb-2">
                      {book.class}
                    </span>
                    <h4
                      onClick={() => onSelectBook(book.slug)}
                      className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer text-base transition"
                    >
                      {book.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 lines-clamp-2 leading-relaxed">
                      {book.description}
                    </p>
                  </div>
                </div>

                {/* Chapters list under this book in the Sitemap for direct Navigation */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">
                    Quick Syllabus Navigation:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {book.chapters.map((ch) => (
                      <button
                        key={ch.id}
                        onClick={() => onSelectBook(book.slug)}
                        className="text-left text-xs bg-slate-50 hover:bg-indigo-50/50 text-slate-600 hover:text-indigo-700 p-2 rounded-lg border border-transparent hover:border-indigo-100 transition flex items-center gap-2 group/btn cursor-pointer"
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-400 shrink-0 group-hover/btn:text-indigo-600" />
                        <span className="truncate">
                          CH {ch.ordinal}: {ch.title}
                        </span>
                      </button>
                    ))}
                    {book.chapters.length === 0 && (
                      <span className="text-xs italic text-slate-400">Chapters loading securely...</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
