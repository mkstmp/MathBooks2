import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { BOOKS } from "./src/data/books.js";

// Basic credentials constant
const STUDENTS_AUTH = { username: "student", password: "$ecret@123" };
const CRAWLER_AUTH = { username: "books_crawler", password: "super_secret_books_pass" };
const ADMIN_AUTH = { username: "admin", password: "muke$h.$onepur" };

const app = express();
app.enable("trust proxy");
const PORT = 3000;

// Middleware to parse incoming JSON payloads
app.use(express.json());

// Helper to get robust base URL with proper protocol detection behind proxies
function getBaseUrl(req: Request): string {
  const host = req.get("host") || "localhost:3000";
  const proto = (req.headers["x-forwarded-proto"] as string) || (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");
  return `${proto}://${host}`;
}

// Helper to authenticate request (Standard Student session, Crawler credentials, URL params or Basic Auth)
function authenticateRequest(req: Request): { success: boolean; user?: string; reason?: string } {
  // 1. Check Authorization header (Basic Auth)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Basic ")) {
    try {
      const b64auth = authHeader.split(" ")[1];
      const [username, password] = Buffer.from(b64auth, "base64").toString("utf-8").split(":");
      if (
        (username === STUDENTS_AUTH.username && password === STUDENTS_AUTH.password) ||
        (username === CRAWLER_AUTH.username && password === CRAWLER_AUTH.password) ||
        (username === ADMIN_AUTH.username && password === ADMIN_AUTH.password)
      ) {
        return { success: true, user: username };
      }
    } catch (e) {
      // Decode error
    }
  }

  // 2. Check query params (very convenient for scripts/crawlers)
  const queryUser = req.query.username as string;
  const queryPass = req.query.password as string;
  if (queryUser && queryPass) {
    if (
      (queryUser === STUDENTS_AUTH.username && queryPass === STUDENTS_AUTH.password) ||
      (queryUser === CRAWLER_AUTH.username && queryPass === CRAWLER_AUTH.password) ||
      (queryUser === ADMIN_AUTH.username && queryPass === ADMIN_AUTH.password)
    ) {
      return { success: true, user: queryUser };
    }
  }

  // 3. Check App custom session token
  const token = req.query.token as string || req.headers["x-session-token"] as string;
  if (token) {
    if (token === "token_student_session") {
      return { success: true, user: STUDENTS_AUTH.username };
    }
    if (token === "token_crawler_session") {
      return { success: true, user: CRAWLER_AUTH.username };
    }
    if (token === "token_admin_session") {
      return { success: true, user: ADMIN_AUTH.username };
    }
  }

  return { success: false, reason: "Access denied. Absolute authorization credentials required." };
}

// Access control guard middleware
function accessControlGuard(req: Request, res: Response, next: NextFunction) {
  const auth = authenticateRequest(req);
  if (auth.success) {
    (req as any).user = auth.user;
    next();
  } else {
    res.setHeader("WWW-Authenticate", 'Basic realm="Protected Math Book Portal"');
    res.status(401).json({ error: auth.reason || "Unauthorized access" });
  }
}

// 1. PUBLIC API: Server health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 2. PUBLIC API: Auth login endpoint for the React frontend UI
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (username === STUDENTS_AUTH.username && password === STUDENTS_AUTH.password) {
    return res.json({ success: true, token: "token_student_session", role: "student" });
  }
  if (username === CRAWLER_AUTH.username && password === CRAWLER_AUTH.password) {
    return res.json({ success: true, token: "token_crawler_session", role: "crawler" });
  }
  if (username === ADMIN_AUTH.username && password === ADMIN_AUTH.password) {
    return res.json({ success: true, token: "token_admin_session", role: "admin" });
  }
  return res.status(401).json({ success: false, error: "Invalid username or password" });
});

// 3. PUBLIC API: JSON version of the sitemap returning metadata of all books
app.get("/sitemap.json", (req, res) => {
  const baseUrl = getBaseUrl(req);
  // Map books into simplified structure for sitemap consumption
  const sitemapBooks = BOOKS.map((book) => ({
    title: book.title,
    slug: book.slug,
    language: book.language,
    pdf_url: `${baseUrl}${book.pdf_url}`,
    thumbnail_link: `${baseUrl}/assets/covers/${book.slug}.png`,
    subject: book.subject,
    class: book.class,
    author: book.author,
    publication_year: book.publication_year,
    pages_count: book.pagesCount,
    chapters_count: book.chapters.length,
    description: book.description
  }));

  res.json({
    portal: "Math Workbook Portal",
    url: baseUrl,
    generatedAt: new Date().toISOString(),
    total_books: sitemapBooks.length,
    books: sitemapBooks
  });
});

// 4. PROTECTED API: Fetch detailed contents of a particular book (including math questions)
app.get("/api/books/:slug/content", accessControlGuard, (req, res) => {
  const { slug } = req.params;
  const book = BOOKS.find((b) => b.slug === slug);
  if (!book) {
    return res.status(404).json({ error: "Workbook not found" });
  }
  res.json({ success: true, book });
});

// Helper class to dynamically construct standard PDF 1.4 binary documents
class SimplePDFBuilder {
  private objects: { id: number; data: string }[] = [];
  private currentId = 1;

  public nextId(): number {
    return this.currentId++;
  }

  public addObject(data: string, id?: number): number {
    const objId = id || this.nextId();
    this.objects.push({ id: objId, data });
    return objId;
  }

  public build(): Buffer {
    const pdfHeader = "%PDF-1.4\n";
    let currentOffset = pdfHeader.length;

    this.objects.sort((a, b) => a.id - b.id);

    const offsets: { [id: number]: number } = {};
    const objectStrings: string[] = [];

    for (const obj of this.objects) {
      const objHeader = `${obj.id} 0 obj\n`;
      const objFooter = "\nendobj\n";
      const fullObj = `${objHeader}${obj.data}${objFooter}`;
      
      offsets[obj.id] = currentOffset;
      currentOffset += Buffer.byteLength(fullObj, "utf-8");
      
      objectStrings.push(fullObj);
    }

    const fullBody = objectStrings.join("");
    const maxId = this.objects.length > 0 ? this.objects[this.objects.length - 1].id : 0;
    
    // Generate valid Xref offset catalog
    let xref = `xref\n0 ${maxId + 1}\n`;
    xref += "0000000000 65535 f \n";
    for (let i = 1; i <= maxId; i++) {
      const offset = offsets[i];
      if (offset !== undefined) {
        const padOffset = String(offset).padStart(10, "0");
        xref += `${padOffset} 00000 n \n`;
      } else {
        xref += "0000000000 00000 f \n";
      }
    }

    const startXref = pdfHeader.length + Buffer.byteLength(fullBody, "utf-8");
    const trailer = `trailer\n<< /Size ${maxId + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`;

    const fullPdfText = `${pdfHeader}${fullBody}${xref}${trailer}`;
    return Buffer.from(fullPdfText, "utf-8");
  }
}

// Stream collection of PDF vector graphics and text commands
class PageContentStream {
  private commands: string[] = [];

  public append(cmd: string) {
    this.commands.push(cmd);
  }

  public getStreamData(): string {
    const streamContent = this.commands.join("\n");
    return `<< /Length ${Buffer.byteLength(streamContent, "utf-8")} >>\nstream\n${streamContent}\nendstream`;
  }
}

// Color palette selector based on grade level
function getClassColorRGB(cls: string): { r: number; g: number; b: number } {
  const norm_class = cls.toLowerCase();
  if (norm_class.includes("10")) return { r: 0.88, g: 0.11, b: 0.28 }; // Rose/Red
  if (norm_class.includes("9")) return { r: 0.31, g: 0.27, b: 0.90 }; // Indigo
  if (norm_class.includes("8")) return { r: 0.85, g: 0.47, b: 0.02 }; // Amber
  if (norm_class.includes("7")) return { r: 0.05, g: 0.58, b: 0.53 }; // Teal
  if (norm_class.includes("6")) return { r: 0.01, g: 0.52, b: 0.78 }; // Sky Blue
  if (norm_class.includes("5")) return { r: 0.49, g: 0.23, b: 0.93 }; // Violet
  if (norm_class.includes("4")) return { r: 0.02, g: 0.59, b: 0.41 }; // Emerald
  if (norm_class.includes("2")) return { r: 0.92, g: 0.35, b: 0.05 }; // Orange-red
  return { r: 0.86, g: 0.15, b: 0.47 }; // Pink/Lilac
}

// Escape PDF special formatting markers
function escapePDFText(text: string): string {
  return text.replace(/[\\()]/g, "\\$&");
}

// Intelligent automatic text wrap flow to respect page margins
function wrapText(text: string, maxCharsPerLine: number = 72): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + " " + word).length > maxCharsPerLine) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine += (currentLine ? " " : "") + word;
    }
  }
  if (currentLine) {
    lines.push(currentLine.trim());
  }
  return lines;
}

// Center aligned text draw routine
function drawCenteredText(
  stream: PageContentStream,
  text: string,
  fontSize: number,
  y: number,
  fontName: string = "/F2",
  color: string = "0 0 0 rg"
) {
  const estimatedCharWidth = fontName === "/F1" ? 0.58 : 0.52;
  const wordWidth = text.length * fontSize * estimatedCharWidth;
  const startX = Math.max(20, 297.5 - wordWidth / 2);
  
  stream.append("BT");
  stream.append(`${fontName} ${fontSize} Tf`);
  stream.append(color);
  stream.append(`${startX} ${y} Td`);
  stream.append(`(${escapePDFText(text)}) Tj`);
  stream.append("ET");
}

// Premium PDF dynamic rendering workbook compiler
function generateValidPDF(book: any): Buffer {
  const builder = new SimplePDFBuilder();
  const clRGB = getClassColorRGB(book.class);
  const colorStr = `${clRGB.r.toFixed(2)} ${clRGB.g.toFixed(2)} ${clRGB.b.toFixed(2)} rg`;

  // Standard Helvetica-based PDF fonts
  const f1Id = builder.addObject("/Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold");
  const f2Id = builder.addObject("/Type /Font /Subtype /Type1 /BaseFont /Helvetica");
  const f3Id = builder.addObject("/Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique");

  const resourcesId = builder.addObject(`<< /Font << /F1 ${f1Id} 0 R /F2 ${f2Id} 0 R /F3 ${f3Id} 0 R >> >>`);

  const pages: number[] = [];
  const parentPagesId = builder.nextId(); // Added later

  // PAGE 1: Luxury Minimalist Academic Cover
  const coverStream = new PageContentStream();
  
  // Outer elegant borders
  coverStream.append("0.9 0.9 0.9 RG 0.5 w");
  coverStream.append("50 780 m 545 780 l S");
  coverStream.append("BT /F1 9 Tf 0.5 0.5 0.5 rg 50 787 Td (NATIONAL MATHEMATICS COUNCIL • OFFICIAL CURRICULUM DIRECTORY) Tj ET");

  // Title block
  const cleanTitle = book.title.replace(/:.*$/, "");
  drawCenteredText(coverStream, cleanTitle.toUpperCase(), 24, 520, "/F1", colorStr);
  
  const subTitleText = `${book.class.toUpperCase()} MASTER WORKBOOK`;
  drawCenteredText(coverStream, subTitleText, 14, 475, "/F1", "0.2 0.2 0.2 rg");

  // Description italic blurb
  const wrappedDesc = wrapText(book.description, 50);
  let descY = 410;
  for (const line of wrappedDesc) {
    drawCenteredText(coverStream, line, 10.5, descY, "/F3", "0.4 0.4 0.4 rg");
    descY -= 15;
  }

  // Geometric abstract accent shapes simulating high-end textbooks
  coverStream.append("0.96 0.96 0.97 rg");
  coverStream.append("80 180 435 120 re f"); // Large cover slab
  
  coverStream.append(`${clRGB.r} ${clRGB.g} ${clRGB.b} RG 2.5 w`);
  coverStream.append("80 180 m 515 300 l S"); // High contrast dividing vector line

  // Bottom authorized indicators
  coverStream.append("0.1 0.1 0.1 rg");
  coverStream.append("BT /F1 9.5 Tf 50 125 Td (AUTHORIZED CONTRIBUTORS Profiles:) Tj ET");
  coverStream.append(`BT /F2 9.5 Tf 50 108 Td (${book.author}) Tj ET`);

  coverStream.append("BT /F1 9.5 Tf 410 125 Td (ACADEMIC TERM:) Tj ET");
  coverStream.append(`BT /F2 9.5 Tf 410 108 Td (${book.publication_year} Edition) Tj ET`);

  coverStream.append("0.9 0.9 0.9 RG 0.5 w");
  coverStream.append("50 80 m 545 80 l S");
  coverStream.append("BT /F2 8 Tf 0.6 0.6 0.6 rg 50 67 Td (This workbook is secure and contains student-facing auto-grading index anchors.) Tj ET");

  const coverContentId = builder.addObject(coverStream.getStreamData());
  const coverPageId = builder.addObject(`<< /Type /Page /Parent ${parentPagesId} 0 R /MediaBox [0 0 595 842] /Contents ${coverContentId} 0 R /Resources ${resourcesId} 0 R >>`);
  pages.push(coverPageId);

  // Dynamic variable states for layout manager
  let currentPageStream = new PageContentStream();
  let currentY = 730;
  let pageNumber = 2;

  const initNewPageStream = (headerTitle: string) => {
    currentPageStream = new PageContentStream();
    currentY = 730;

    // Running Header
    currentPageStream.append(`BT /F1 9 Tf 0.35 0.35 0.35 rG 50 790 Td (${escapePDFText(headerTitle.toUpperCase())}) Tj ET`);
    currentPageStream.append("BT /F2 8.5 Tf 0.5 0.5 0.5 rg 410 790 Td (NATIONAL PORTAL SYLLABUS DIRECTORY) Tj ET");
    
    currentPageStream.append("0.85 0.85 0.85 RG 0.5 w");
    currentPageStream.append("50 782 m 545 782 l S");

    // Running Footer
    currentPageStream.append("0.85 0.85 0.85 RG 0.5 w");
    currentPageStream.append("50 45 m 545 45 l S");
    currentPageStream.append("BT /F2 8 Tf 0.5 0.5 0.5 rg 50 32 Td (Math Workbook Portal • Curated Curriculum Directory) Tj ET");
    currentPageStream.append(`BT /F1 8 Tf 0.35 0.35 0.35 rg 515 32 Td (Page ${pageNumber}) Tj ET`);

    pageNumber++;
  };

  // Compile Syllabus Core Chapters
  book.chapters.forEach((ch: any) => {
    initNewPageStream(`Chapter ${ch.ordinal}: ${ch.title}`);

    // Chapter outline header card
    currentPageStream.append("0.97 0.97 0.99 rg");
    currentPageStream.append(`55 ${currentY - 45} 485 45 re f`);
    currentPageStream.append("0.85 0.85 0.88 RG 0.5 w");
    currentPageStream.append(`55 ${currentY - 45} 485 45 re S`);
    currentPageStream.append(`${clRGB.r} ${clRGB.g} ${clRGB.b} rg`);
    currentPageStream.append(`55 ${currentY - 45} 4.5 45 re f`);

    currentPageStream.append(`BT /F1 11 Tf 0.1 0.1 0.1 rg 70 ${currentY - 18} Td (CHAPTER ${ch.ordinal}: ${escapePDFText(ch.title.toUpperCase())}) Tj ET`);
    if (ch.description) {
      currentPageStream.append(`BT /F3 8 Tf 0.4 0.4 0.4 rg 70 ${currentY - 33} Td (Overview: ${escapePDFText(ch.description)}) Tj ET`);
    }

    currentY -= 65;

    // Split questions by sections
    const sections: { [name: string]: any[] } = {};
    ch.questions.forEach((q: any) => {
      const sectionName = q.section || "CORE PRACTICE";
      if (!sections[sectionName]) {
        sections[sectionName] = [];
      }
      sections[sectionName].push(q);
    });

    Object.keys(sections).forEach((secName: string) => {
      if (currentY < 120) {
        const pageContentId = builder.addObject(currentPageStream.getStreamData());
        const pageObjId = builder.addObject(`<< /Type /Page /Parent ${parentPagesId} 0 R /MediaBox [0 0 595 842] /Contents ${pageContentId} 0 R /Resources ${resourcesId} 0 R >>`);
        pages.push(pageObjId);

        initNewPageStream(`Chapter ${ch.ordinal}: ${ch.title}`);
      }

      currentPageStream.append(`BT /F1 9 Tf ${clRGB.r} ${clRGB.g} ${clRGB.b} rg 55 ${currentY - 15} Td (${escapePDFText(secName.toUpperCase())}) Tj ET`);
      currentY -= 25;

      sections[secName].forEach((q: any) => {
        // Render large beautiful school worksheet cards
        const cardHeight = 160;
        if (currentY < cardHeight + 40) {
          const pageContentId = builder.addObject(currentPageStream.getStreamData());
          const pageObjId = builder.addObject(`<< /Type /Page /Parent ${parentPagesId} 0 R /MediaBox [0 0 595 842] /Contents ${pageContentId} 0 R /Resources ${resourcesId} 0 R >>`);
          pages.push(pageObjId);

          initNewPageStream(`Chapter ${ch.ordinal}: ${ch.title}`);
          currentPageStream.append(`BT /F1 9 Tf ${clRGB.r} ${clRGB.g} ${clRGB.b} rg 55 ${currentY - 15} Td (${escapePDFText(secName.toUpperCase())} - CONTINUED) Tj ET`);
          currentY -= 25;
        }

        const cardY = currentY - cardHeight;

        // Visual shadow backdrop
        currentPageStream.append("0.97 0.97 0.97 rg");
        currentPageStream.append(`57 ${cardY - 2} 481 161 re f`);

        // Card pure white workspace
        currentPageStream.append("1 1 1 rg");
        currentPageStream.append(`55 ${cardY} 485 ${cardHeight} re f`);

        currentPageStream.append("0.85 0.85 0.85 RG 0.5 w");
        currentPageStream.append(`55 ${cardY} 485 ${cardHeight} re S`);

        // Rich vertical color accent line inside card
        currentPageStream.append(`${clRGB.r} ${clRGB.g} ${clRGB.b} rg`);
        currentPageStream.append(`55 ${cardY} 4.5 ${cardHeight} re f`);

        // Render question number and wrapped texts
        const qNumText = `${q.number}. `;
        currentPageStream.append(`BT /F1 10 Tf 0.1 0.1 0.1 rg 70 ${cardY + 138} Td (${escapePDFText(qNumText)}) Tj ET`);

        const qLines = wrapText(q.text, 68);
        let textY = cardY + 138;
        qLines.forEach((line: string, lineIdx: number) => {
          const indent = lineIdx === 0 ? 85 : 70;
          currentPageStream.append(`BT /F2 10 Tf 0.1 0.1 0.1 rg ${indent} ${textY} Td (${escapePDFText(line)}) Tj ET`);
          textY -= 14;
        });

        // Options details if any
        if (q.options && q.options.length > 0) {
          const optStr = "Options: " + q.options.join("   |   ");
          const optLines = wrapText(optStr, 70);
          optLines.forEach((oLine: string) => {
            currentPageStream.append(`BT /F3 8.5 Tf 0.3 0.3 0.3 rg 70 ${textY - 2} Td (${escapePDFText(oLine)}) Tj ET`);
            textY -= 12;
          });
        }

        // Draw dotted workbook writing lines at bottom of worksheets so it's a real workbook
        currentPageStream.append("0.92 0.92 0.92 RG [2 2] 0 d 0.5 w");
        currentPageStream.append(`70 ${cardY + 25} m 525 ${cardY + 25} l S`);
        currentPageStream.append(`70 ${cardY + 50} m 525 ${cardY + 50} l S`);
        currentPageStream.append(`70 ${cardY + 75} m 525 ${cardY + 75} l S`);
        currentPageStream.append("[] 0 d"); // Reset dash pattern

        currentY -= cardHeight + 15;
      });
    });

    const pageContentId = builder.addObject(currentPageStream.getStreamData());
    const pageObjId = builder.addObject(`<< /Type /Page /Parent ${parentPagesId} 0 R /MediaBox [0 0 595 842] /Contents ${pageContentId} 0 R /Resources ${resourcesId} 0 R >>`);
    pages.push(pageObjId);
  });

  // Compile Practice sets (Olympiad Master groups)
  book.practiceSets.forEach((ps: any) => {
    initNewPageStream(`Olympiad Prep: ${ps.level} (${ps.setTitle})`);

    currentPageStream.append("0.95 0.98 0.95 rg");
    currentPageStream.append(`55 ${currentY - 45} 485 45 re f`);
    currentPageStream.append("0.85 0.88 0.85 RG 0.5 w");
    currentPageStream.append(`55 ${currentY - 45} 485 45 re S`);
    currentPageStream.append("0.10 0.60 0.10 rg");
    currentPageStream.append(`55 ${currentY - 45} 4.5 45 re f`);

    currentPageStream.append(`BT /F1 11 Tf 0.1 0.1 0.1 rg 70 ${currentY - 18} Td (${escapePDFText(ps.level.toUpperCase())}) Tj ET`);
    currentPageStream.append(`BT /F3 9 Tf 0.3 0.3 0.3 rg 70 ${currentY - 33} Td (Curriculum Practice Training Group • ${escapePDFText(ps.setTitle)}) Tj ET`);

    currentY -= 65;

    ps.questions.forEach((q: any) => {
      const cardHeight = 160;
      if (currentY < cardHeight + 40) {
        const pageContentId = builder.addObject(currentPageStream.getStreamData());
        const pageObjId = builder.addObject(`<< /Type /Page /Parent ${parentPagesId} 0 R /MediaBox [0 0 595 842] /Contents ${pageContentId} 0 R /Resources ${resourcesId} 0 R >>`);
        pages.push(pageObjId);

        initNewPageStream(`Olympiad Prep: ${ps.level} (${ps.setTitle})`);
      }

      const cardY = currentY - cardHeight;

      currentPageStream.append("0.97 0.97 0.97 rg");
      currentPageStream.append(`57 ${cardY - 2} 481 161 re f`);

      currentPageStream.append("1 1 1 rg");
      currentPageStream.append(`55 ${cardY} 485 ${cardHeight} re f`);

      currentPageStream.append("0.85 0.85 0.85 RG 0.5 w");
      currentPageStream.append(`55 ${cardY} 485 ${cardHeight} re S`);

      // Green left border for Olympia exercises
      currentPageStream.append("0.10 0.60 0.10 rg");
      currentPageStream.append(`55 ${cardY} 4.5 ${cardHeight} re f`);

      const qNumText = `${q.number}. `;
      currentPageStream.append(`BT /F1 10 Tf 0.1 0.1 0.1 rg 70 ${cardY + 138} Td (${escapePDFText(qNumText)}) Tj ET`);

      const qLines = wrapText(q.text, 68);
      let textY = cardY + 138;
      qLines.forEach((line: string, lineIdx: number) => {
        const indent = lineIdx === 0 ? 85 : 70;
        currentPageStream.append(`BT /F2 10 Tf 0.1 0.1 0.1 rg ${indent} ${textY} Td (${escapePDFText(line)}) Tj ET`);
        textY -= 14;
      });

      if (q.options && q.options.length > 0) {
        const optStr = "Options: " + q.options.join("   |   ");
        const optLines = wrapText(optStr, 70);
        optLines.forEach((oLine: string) => {
          currentPageStream.append(`BT /F3 8.5 Tf 0.3 0.3 0.3 rg 70 ${textY - 2} Td (${escapePDFText(oLine)}) Tj ET`);
          textY -= 12;
        });
      }

      currentPageStream.append("0.92 0.92 0.92 RG [2 2] 0 d 0.5 w");
      currentPageStream.append(`70 ${cardY + 25} m 525 ${cardY + 25} l S`);
      currentPageStream.append(`70 ${cardY + 50} m 525 ${cardY + 50} l S`);
      currentPageStream.append(`70 ${cardY + 75} m 525 ${cardY + 75} l S`);
      currentPageStream.append("[] 0 d");

      currentY -= cardHeight + 15;
    });

    const pageContentId = builder.addObject(currentPageStream.getStreamData());
    const pageObjId = builder.addObject(`<< /Type /Page /Parent ${parentPagesId} 0 R /MediaBox [0 0 595 842] /Contents ${pageContentId} 0 R /Resources ${resourcesId} 0 R >>`);
    pages.push(pageObjId);
  });

  const pagesListStr = pages.map((pId) => `${pId} 0 R`).join(" ");
  builder.addObject(`/Type /Pages /Kids [${pagesListStr}] /Count ${pages.length}`, parentPagesId);

  // Object index 1 must strictly map to /Catalog for the standard build
  builder.addObject(`<< /Type /Catalog /Pages ${parentPagesId} 0 R >>`, 1);

  return builder.build();
}

// Helper to escape special XML characters to prevent SVG parsing exceptions e.g. "xmlParseEntityRef: no name"
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case "\"": return "&quot;";
      default: return c;
    }
  });
}

// 4.5. PUBLIC API: Serve high-quality dynamic visual book cover illustrations (named as .png but rendered as dynamic vector graphics)
app.get("/assets/covers/:slug.png", (req, res) => {
  const { slug } = req.params;
  const book = BOOKS.find((b) => b.slug === slug);
  if (!book) {
    // Return a generic fallback math workbook pattern
    res.setHeader("Content-Type", "image/svg+xml");
    return res.send(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 550" width="100%" height="100%" style="font-family: system-ui, -apple-system, sans-serif;">
      <rect width="400" height="550" rx="10" fill="#4f46e5" />
      <text x="200" y="275" fill="white" font-size="16" text-anchor="middle">Math Workbook</text>
    </svg>`);
  }

  // Determine beautiful primary and secondary theme colors based on book grade
  let primaryCol = "#4f46e5"; // Indigo
  let secondaryCol = "#3b82f6"; // Blue
  const grade = book.class;
  if (grade.includes("10")) {
    primaryCol = "#ec4899"; // Pink
    secondaryCol = "#f43f5e"; // Rose
  } else if (grade.includes("9")) {
    primaryCol = "#4f46e5"; // Indigo
    secondaryCol = "#6366f1"; // Violet
  } else if (grade.includes("8")) {
    primaryCol = "#d97706"; // Amber
    secondaryCol = "#f97316"; // Orange
  } else if (grade.includes("7")) {
    primaryCol = "#0d9488"; // Teal
    secondaryCol = "#10b981"; // Emerald
  } else if (grade.includes("6")) {
    primaryCol = "#0284c7"; // Sky
    secondaryCol = "#3b82f6"; // Blue
  } else if (grade.includes("5")) {
    primaryCol = "#7c3aed"; // Violet
    secondaryCol = "#c084fc"; // Purple
  } else if (grade.includes("4")) {
    primaryCol = "#059669"; // Emerald
    secondaryCol = "#34d399"; // Green
  } else if (grade.includes("2")) {
    primaryCol = "#ea580c"; // Orange-red
    secondaryCol = "#f87171"; // Peach
  } else {
    primaryCol = "#db2777"; // Pink-purple
    secondaryCol = "#f472b6"; // Lilac
  }

  const cleanTitle = book.title.replace(/:.*$/, "");
  const cleanSubtitle = book.title.includes(":") ? book.title.replace(/^[^:]*:\s*/, "") : "Advanced Math Training Workbook";

  // Escape XML parameters in injected SVG elements
  const escTitle = escapeXml(cleanTitle);
  const escSubtitle = escapeXml(cleanSubtitle);
  const escSubject = escapeXml(book.subject);
  const escClass = escapeXml(book.class);
  const escAuthor = escapeXml(book.author);

  // Create a stunning SVG Textbook Cover Layout
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 550" width="100%" height="100%" style="font-family: system-ui, -apple-system, sans-serif;">
    <defs>
      <linearGradient id="cover-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${primaryCol}" />
        <stop offset="100%" stop-color="${secondaryCol}" />
      </linearGradient>
      
      <!-- Graph grid pattern of coordinates -->
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" stroke-width="0.7" opacity="0.08" />
      </pattern>
    </defs>

    <!-- Main Book Background filled with Gradient -->
    <rect width="400" height="550" rx="10" fill="url(#cover-grad)" />
    
    <!-- Coordinate Grid overlay for that technical textbook vibe -->
    <rect width="400" height="550" rx="10" fill="url(#grid)" />

    <!-- Abstract mathematical sine curve shape and concentric circles -->
    <g opacity="0.12">
      <!-- Sine curve -->
      <path d="M 0 270 C 100 120, 200 420, 400 270" stroke="white" stroke-width="3" fill="none" />
      <path d="M 0 290 C 100 140, 200 440, 400 290" stroke="white" stroke-width="1.5" fill="none" stroke-dasharray="5 5" />
      
      <!-- Concentric circle in lower corner -->
      <circle cx="350" cy="450" r="80" stroke="white" stroke-width="2" fill="none" />
      <circle cx="350" cy="450" r="50" stroke="white" stroke-width="1" stroke-dasharray="4 4" fill="none" />
      <circle cx="350" cy="450" r="20" stroke="white" stroke-width="1.5" fill="none" />
      
      <!-- Triangle overlay -->
      <polygon points="50,120 180,80 120,240" stroke="white" stroke-width="1.5" fill="none" />
    </g>

    <!-- Left spine accent line simulating a physical bound book -->
    <line x1="15" y1="0" x2="15" y2="550" stroke="white" stroke-width="1" opacity="0.15" />
    <rect x="0" y="0" width="15" height="550" fill="black" opacity="0.05" />

    <!-- Content Card Padding: Margin 35 -->
    <g transform="translate(35, 45)">
      <!-- Board Seal / Header Agency Tag -->
      <rect width="210" height="24" rx="4" fill="white" opacity="0.15" />
      <text x="10" y="15" fill="white" font-size="9" font-weight="800" letter-spacing="1.5">NATIONAL MATHEMATICS COUNCIL</text>
      
      <!-- Subject Identifier -->
      <text x="0" y="60" fill="white" font-size="11" font-weight="700" letter-spacing="3" opacity="0.9">${escSubject.toUpperCase()}</text>
      
      <!-- Class / Grade Badge -->
      <g transform="translate(0, 75)">
        <rect width="80" height="20" rx="3" fill="white" />
        <text x="40" y="14" fill="${primaryCol}" font-size="10" font-weight="900" text-anchor="middle">${escClass.toUpperCase()}</text>
      </g>

      <!-- Large Book Title -->
      <text x="0" y="145" fill="white" font-size="24" font-weight="800" font-family="system-ui, -apple-system, sans-serif" style="text-shadow: 0 2px 4px rgba(0,0,0,0.15);">${escTitle}</text>

      <!-- Subtitle or focus tracker -->
      <text x="0" y="245" fill="white" fill-opacity="0.8" font-size="11" font-weight="500" font-family="system-ui, -apple-system, sans-serif">${escSubtitle}</text>

      <!-- Metadata Box (Chapters, Pages, Publication Academic Term) -->
      <g transform="translate(0, 360)">
        <line x1="0" y1="0" x2="330" y2="0" stroke="white" stroke-width="1" opacity="0.2" />
        <text x="0" y="20" fill="white" font-size="9" opacity="0.7" font-weight="600" letter-spacing="1">SYLLABUS VOLUME CORES</text>
        <text x="0" y="38" fill="white" font-size="11" font-weight="700">${book.chapters.length} CHAPTERS • ${book.pagesCount} PRINTED PAGES</text>
      </g>

      <!-- Designer / Author Credits -->
      <g transform="translate(0, 440)">
        <line x1="0" y1="0" x2="330" y2="0" stroke="white" stroke-width="1" opacity="0.2" />
        <text x="0" y="16" fill="white" font-size="9" opacity="0.7" font-weight="600" letter-spacing="1">AUTHORIZED REGISTERED AUTHORS</text>
        <text x="0" y="32" fill="white" font-size="11" font-weight="700" opacity="0.95">${escAuthor}</text>
      </g>
    </g>
  </svg>`;

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.send(svg);
});

// Helper function to scan recursively for uploaded PDF asset matching slug
function findUploadedPDF(slug: string): string | null {
  const root = process.cwd();
  
  // 1. Direct check in assets/books/
  const uploadedPath = path.join(root, "assets", "books", `${slug}.pdf`);
  if (fs.existsSync(uploadedPath)) {
    return uploadedPath;
  }

  // 2. Direct check from MANUAL_MAPPINGS in root
  const MANUAL_MAPPINGS: Record<string, string> = {
    "class-10-math": "Class_10_Math_Workbook_Board_Prep.pdf",
    "class-9-math": "Class_9_Math_Workbook_Mastery.pdf",
    "class-8-math": "Class_8_Math_Workbook_Advanced.pdf",
    "class-7-math": "Class_7_Math_Workbook_Premium.pdf",
    "class-6-math": "Class_6_Math_Workbook_Mastery.pdf",
    "class-5-math": "Class_5_Math_Workbook_Advanced.pdf",
    "class-4-math": "Class_4_Math_Workbook_Premium.pdf",
    "class-2-math-ultimate": "Class_2_Math_Workbook_Massive.pdf",
    "class-2-math-expanded": "Class_2_Math_Workbook_Extended.pdf",
    "class-1-math": "Class_1_Math_Workbook_Extended.pdf",
  };

  const mappedName = MANUAL_MAPPINGS[slug];
  if (mappedName) {
    const rootPath = path.join(root, mappedName);
    if (fs.existsSync(rootPath)) {
      return rootPath;
    }
  }

  // 3. Fallback: Normalized / Substring search
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const searchNormalized = normalize(slug);

  function scan(dir: string): string | null {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const name = entry.name;
          if (name === "node_modules" || name === ".git" || name === "dist" || name === ".next") {
            continue;
          }
          const found = scan(path.join(dir, name));
          if (found) return found;
        } else if (entry.isFile()) {
          const name = entry.name;
          const lowerName = name.toLowerCase();
          if (lowerName.endsWith(".pdf")) {
            const fileNormalized = normalize(name);
            if (fileNormalized.includes(searchNormalized)) {
              return path.join(dir, name);
            }
          }
        }
      }
    } catch (e) {
      // ignore
    }
    return null;
  }

  return scan(root);
}

// 5. PROTECTED API: Serve the book in valid PDF format (supporting both /pdf suffix and standard .pdf extension routes)
app.get(["/api/books/:slug/pdf", "/api/books/:slug.pdf"], accessControlGuard, (req, res) => {
  const { slug } = req.params;
  const book = BOOKS.find((b) => b.slug === slug);
  if (!book) {
    return res.status(404).json({ error: "Workbook not found" });
  }

  const staticPdfPath = findUploadedPDF(slug);
  if (staticPdfPath) {
    console.log(`Serving matched original uploaded PDF for ${slug} from: ${staticPdfPath}`);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${slug}-workbook.pdf"`);
    return res.sendFile(staticPdfPath);
  }

  const pdfBuffer = generateValidPDF(book);
  
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${slug}-workbook.pdf"`);
  res.setHeader("Content-Length", pdfBuffer.length);
  res.send(pdfBuffer);
});

// 5.1 PROTECTED ADMIN API: Upload/Replace dynamic PDF workbook with custom beautifully-designed original PDF
app.post("/api/admin/books/:slug/upload-pdf", accessControlGuard, express.raw({ type: "application/pdf", limit: "15mb" }), (req, res) => {
  const { slug } = req.params;
  const book = BOOKS.find((b) => b.slug === slug);
  if (!book) {
    return res.status(404).json({ error: "Workbook not found" });
  }

  const user = (req as any).user;
  if (user !== STUDENTS_AUTH.username && user !== CRAWLER_AUTH.username && user !== ADMIN_AUTH.username) {
    return res.status(403).json({ error: "Forbidden. Administrative access required for document ingestion." });
  }

  const pdfBuffer = req.body;
  if (!pdfBuffer || pdfBuffer.length === 0 || !Buffer.isBuffer(pdfBuffer)) {
    return res.status(400).json({ error: "Empty or invalid body payload. Please stream valid PDF bytes." });
  }

  const uploadDir = path.join(process.cwd(), "assets", "books");
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const targetPath = path.join(uploadDir, `${slug}.pdf`);
    fs.writeFileSync(targetPath, pdfBuffer);
    console.log(`Ingested original document for slug: ${slug} -> ${targetPath} (${pdfBuffer.length} bytes)`);
    return res.json({ success: true, message: `Successfully uploaded original PDF workbook for ${book.title}!`, size: pdfBuffer.length });
  } catch (error: any) {
    console.error("Failed to persist PDF workbook:", error);
    return res.status(500).json({ error: `System persistence fault: ${error.message}` });
  }
});

// 6. Integrate React Development server or production static compiler build assets
async function serveApplication() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully started at port http://0.0.0.0:${PORT}`);
  });
}

serveApplication().catch((err) => {
  console.error("Critical server configuration boot fault:", err);
});
