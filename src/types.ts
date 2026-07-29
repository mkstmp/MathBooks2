export interface Question {
  id: string;
  number: number;
  text: string;
  solution?: string;
  hint?: string;
  section: "CORE CONCEPTS" | "REAL WORLD APPLICATIONS" | "PRACTICE SETS" | string;
  answerType: "text" | "number" | "multiple-choice" | "proof";
  options?: string[];
  correctAnswer?: string | number;
}

export interface Chapter {
  id: string;
  title: string;
  ordinal: number;
  description?: string;
  questions: Question[];
}

export interface PracticeSet {
  id: string;
  level: string; // "Core Proficiency (Average Student)", "Advanced Application (Top 10%)", "Logical Reasoning (Top 1%)", "Critical Thinking (Top 0.1%)", "National Olympiad (Top 10)"
  setTitle: string; // e.g., "SET 1", "SET 2"
  description?: string;
  questions: Question[];
}

export interface Book {
  title: string;
  slug: string;
  language: string;
  pdf_url: string;
  thumbnail_link: string;
  subject: string;
  class: string;
  author: string;
  publication_year: number;
  description: string;
  pagesCount: number;
  chapters: Chapter[];
  practiceSets: PracticeSet[];
}

export interface User {
  username: string;
  role: "student" | "crawler" | "admin";
}
