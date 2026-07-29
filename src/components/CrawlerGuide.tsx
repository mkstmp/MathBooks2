import React, { useState } from "react";
import { Terminal, Key, Shield, Copy, Check, Info, Upload, BookOpen, AlertCircle, Sparkles } from "lucide-react";
import { BOOKS } from "../data/books";

interface CrawlerGuideProps {
  sessionToken?: string;
}

export default function CrawlerGuide({ sessionToken }: CrawlerGuideProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  // Ingestion States
  const [selectedSlug, setSelectedSlug] = useState<string>(BOOKS[0]?.slug || "");
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const codeSnippets = {
    sitemap: "curl -s https://[APP_HOST]/sitemap.json",
    basicAuth: "curl -u books_crawler:super_secret_books_pass https://[APP_HOST]/api/books/class-10-math/pdf -o math-10.pdf",
    studentAuth: "curl -u student:$ecret@123 https://[APP_HOST]/api/books/class-10-math/content",
    queryAuth: "curl \"https://[APP_HOST]/api/books/class-10-math/pdf?username=books_crawler&password=super_secret_books_pass\" -o math-10.pdf"
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus("idle");
      setStatusMessage("");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf" || droppedFile.name.endsWith(".pdf")) {
        setFile(droppedFile);
        setUploadStatus("idle");
        setStatusMessage("");
      } else {
        setUploadStatus("error");
        setStatusMessage("Unsupported format! Please drop a valid standard PDF document.");
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedSlug) return;

    setUploadStatus("uploading");
    setStatusMessage("");

    try {
      const response = await fetch(`/api/admin/books/${selectedSlug}/upload-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/pdf",
          "x-session-token": sessionToken || ""
        },
        body: file
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUploadStatus("success");
        setStatusMessage(data.message || `Successfully ingested original workbook size: ${(data.size / 1024).toFixed(1)} KB`);
        setFile(null); // Clear selected file
      } else {
        setUploadStatus("error");
        setStatusMessage(data.error || "Authentication or file verification fault.");
      }
    } catch (err) {
      setUploadStatus("error");
      setStatusMessage("Remote server stream timing exception occurred.");
    }
  };

  return (
    <div id="crawler-guide-root" className="bg-white text-slate-800 rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-10 max-w-5xl mx-auto my-8 font-sans">
      {/* Title Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
          <Terminal className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Crawler & Robotics Registry Guide</h2>
          <p className="text-slate-500 text-xs mt-1">Instructions for automated book crawlers, indices engines, and terminal downloads.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pb-10 border-b border-slate-100">
        {/* Credentials Directory */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-indigo-600 font-mono text-xs uppercase tracking-wider">
            <Key className="w-4 h-4" />
            <span>Authorized Security Credentials</span>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed">
            The listing endpoints and landing frames are public. However, raw math exercises payload records and workbook streaming binaries require standard registration. Portals support automated scraping via <span className="text-indigo-600 font-mono font-semibold">HTTP Basic Auth</span> or URL query parameter binding.
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">Standard Student Node</span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-slate-400">Username:</span> <span className="text-slate-950 font-bold">student</span>
                </div>
                <div>
                  <span className="text-slate-400">Password:</span> <span className="text-slate-950 font-bold">$ecret@123</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block mb-1">Automated Crawler Engine</span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-slate-400">Username:</span> <span className="text-slate-950 font-bold">books_crawler</span>
                </div>
                <div>
                  <span className="text-slate-400">Password:</span> <span className="text-slate-950 font-bold">super_secret_books_pass</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-900 text-xs leading-relaxed font-sans">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>
              <strong>Note on IFrame downloads:</strong> In AI Studio, the portal is embedded in an iframe context. If downloading fails inside the frame due to iframe restrictions, click "Open in New Tab" to test crawling requests smoothly.
            </span>
          </div>
        </div>

        {/* Console Copyable Commands Card */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-indigo-600 font-mono text-xs uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Terminal Scraper Recipes</span>
          </div>

          {Object.entries(codeSnippets).map(([key, code]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-xs font-sans font-semibold">
                  {key === "sitemap" && "Fetch Directory Index (Public)"}
                  {key === "basicAuth" && "Download PDF (Crawler Basic Auth)"}
                  {key === "studentAuth" && "Get Book Metadata (Student Basic Auth)"}
                  {key === "queryAuth" && "Download PDF (URL Query parameter alternative)"}
                </span>

                <button
                  onClick={() => copyToClipboard(code, key)}
                  className="text-slate-400 hover:text-slate-950 p-1 hover:bg-slate-100 rounded transition cursor-pointer"
                >
                  {copiedText === key ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="bg-slate-900 p-3 rounded-lg border border-slate-950 text-xs font-mono overflow-x-auto whitespace-pre text-indigo-200">
                {code}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PDF Document Asset Ingestion (The "keep with app" Asset Ingester requested by user) */}
      <div className="mt-10 space-y-6">
        <div className="flex items-center gap-2 text-indigo-600 font-mono text-xs uppercase tracking-wider">
          <Upload className="w-4 h-4" />
          <span>Ingest Source Document Assets</span>
        </div>

        <div className="bg-indigo-50/50 rounded-2xl border border-indigo-100 p-6 md:p-8">
          <div className="max-w-xl">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Workbook Document Uploader</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed">
              Upload beautifully-formatted math workbook PDF files into the local server directory. When users download this curriculum workbook, the system will serve your exact original PDF file securely instead of the auto-compiled fallback.
            </p>
          </div>

          <form onSubmit={handleUpload} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 tracking-wider">Target Math Workbook</label>
                <select
                  value={selectedSlug}
                  onChange={(e) => setSelectedSlug(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-xs rounded-lg p-2.5 outline-hidden text-slate-800 font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  {BOOKS.map((b) => (
                    <option key={b.slug} value={b.slug}>
                      {b.class.toUpperCase()} - {b.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Drag and Drop File Input Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition ${
                  isDragOver ? "bg-indigo-50 border-indigo-400" : "bg-white border-slate-200"
                }`}
              >
                <div className="flex flex-col items-center justify-center">
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs text-slate-500 block mb-1">
                    Drag and drop your original PDF file here, or click to browse
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Supports PDF up to 15MB</span>
                  
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="pdf-asset-input"
                  />
                  <label
                    htmlFor="pdf-asset-input"
                    className="mt-3 inline-flex px-3 py-1.5 bg-slate-100 hover:bg-slate-200 cursor-pointer rounded-lg text-xs font-semibold text-slate-700 transition"
                  >
                    Select File
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-white border border-slate-150 p-5 rounded-xl flex flex-col justify-between self-stretch">
              <div>
                <span className="block text-xs font-bold text-slate-700 uppercase mb-2 tracking-wider">Ingestion Context</span>
                {file ? (
                  <div className="space-y-1 bg-indigo-50/50 p-3 rounded-lg border border-indigo-150 text-xs">
                    <div className="font-semibold text-slate-800 truncate">File: {file.name}</div>
                    <div className="text-slate-500 text-[10px] font-mono">Size: {(file.size / 1024).toFixed(1)} KB</div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 block italic">No file selected. Drop a pre-designed math workbook PDF to replace dynamic templates.</span>
                )}

                {/* Upload Status Indicators */}
                {uploadStatus === "uploading" && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Streaming binary payloads to MathPortal server...</span>
                  </div>
                )}

                {uploadStatus === "success" && (
                  <div className="mt-4 p-3 bg-emerald-50 text-emerald-850 rounded-lg border border-emerald-150 text-xs flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Ingestion Completed Successfully</p>
                      <p className="text-[10px] opacity-90 mt-0.5">{statusMessage}</p>
                    </div>
                  </div>
                )}

                {uploadStatus === "error" && (
                  <div className="mt-4 p-3 bg-rose-50 text-rose-850 rounded-lg border border-rose-150 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Document Ingestion Failed</p>
                      <p className="text-[10px] opacity-90 mt-0.5">{statusMessage}</p>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!file || uploadStatus === "uploading"}
                className={`w-full py-2.5 text-center text-xs font-bold rounded-lg transition shadow-sm ${
                  !file || uploadStatus === "uploading"
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-205"
                    : "bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700"
                }`}
              >
                {uploadStatus === "uploading" ? "Uploading Document..." : "Commit Ingestion & Overwrite"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
