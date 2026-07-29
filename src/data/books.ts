import { Book } from "../types";

export const BOOKS: Book[] = [
  {
    title: "Class 10 Math: Advanced Board & Olympiad Prep",
    slug: "class-10-math",
    language: "English",
    pdf_url: "/api/books/class-10-math.pdf",
    thumbnail_link: "cosmic-or-crimson",
    subject: "Mathematics",
    class: "Class 10",
    author: "Mukesh Kumar, Priyanka",
    publication_year: 2026,
    description: "Expert level board preparation and Olympiad training workbook covering quadratics, advanced trigonometry, statistics, and critical thinking sets.",
    pagesCount: 53,
    chapters: [
      {
        id: "c1",
        ordinal: 1,
        title: "Real Numbers & Polynomials",
        description: "Euclid's Division Lemma, HCF calculations, prime factor checking, and polynomial root-coefficient relations.",
        questions: [
          {
            id: "q1",
            number: 1,
            section: "CORE CONCEPTS",
            text: "State Euclid's Division Lemma.",
            answerType: "proof",
            correctAnswer: "a = bq + r, where 0 <= r < b"
          },
          {
            id: "q2",
            number: 2,
            section: "CORE CONCEPTS",
            text: "Find the HCF of 867 and 255 using Euclid's division algorithm.",
            answerType: "number",
            correctAnswer: 51,
            hint: "867 = 255 * 3 + 102; 255 = 102 * 2 + 51; 102 = 51 * 2 + 0."
          },
          {
            id: "q3",
            number: 3,
            section: "CORE CONCEPTS",
            text: "Explain why 3 * 5 * 7 + 7 is a composite number.",
            answerType: "multiple-choice",
            options: [
              "It is divisible by 7, hence has factors other than 1 and itself",
              "It is a prime number",
              "It cannot be factored",
              "It is an odd number"
            ],
            correctAnswer: "It is divisible by 7, hence has factors other than 1 and itself"
          },
          {
            id: "q4",
            number: 4,
            section: "CORE CONCEPTS",
            text: "Find the zeroes of the quadratic polynomial 3x^2 - x - 4 and verify the relationship between zeroes and coefficients.",
            answerType: "multiple-choice",
            options: [
              "Zeroes are -1 and 4/3",
              "Zeroes are 1 and -4/3",
              "Zeroes are 2 and 2/3",
              "Zeroes are -2 and 4"
            ],
            correctAnswer: "Zeroes are -1 and 4/3"
          },
          {
            id: "q5",
            number: 5,
            section: "CORE CONCEPTS",
            text: "If alpha and beta are zeroes of p(x) = 2x^2 + 5x + 1, find the value of alpha + beta + alpha * beta.",
            answerType: "number",
            correctAnswer: -2,
            hint: "Sum of zeroes (alpha+beta) = -b/a = -5/2. Product of zeroes (alpha*beta) = c/a = 1/2. Find sum."
          },
          {
            id: "q6",
            number: 1,
            section: "REAL WORLD APPLICATIONS",
            text: "An army contingent of 616 members is to march behind an army band of 32 members in a parade. The two groups are to march in the same number of columns. What is the maximum number of columns in which they can march?",
            answerType: "number",
            correctAnswer: 8,
            hint: "Find the HCF of 616 and 32."
          },
          {
            id: "q7",
            number: 2,
            section: "REAL WORLD APPLICATIONS",
            text: "There is a circular path around a sports field. Sonia takes 18 minutes to drive one round of the field, while Ravi takes 12 minutes for the same. Suppose they both start at the same point and at the same time, and go in the same direction. After how many minutes will they meet again at the starting point?",
            answerType: "number",
            correctAnswer: 36,
            hint: "Find the LCM of 18 and 12."
          },
          {
            id: "q8",
            number: 3,
            section: "REAL WORLD APPLICATIONS",
            text: "A manufacturer produces two types of electronics. If the production is modeled by P(x) = x^2 - 10x + 21, find the production milestones (zeroes of the polynomial).",
            answerType: "multiple-choice",
            options: [
              "3 and 7",
              "2 and 8",
              "5 and 5",
              "1 and 21"
            ],
            correctAnswer: "3 and 7",
            hint: "Factorize x^2 - 10x + 21 = (x - 3)(x - 7)."
          }
        ]
      },
      {
        id: "c2",
        ordinal: 2,
        title: "Algebra (Linear & Quadratic Equations)",
        description: "Solving systems of equations, determining consistent values, nature of roots, and quadratic word problems.",
        questions: [
          {
            id: "q9",
            number: 1,
            section: "CORE CONCEPTS",
            text: "Solve the pair of linear equations by substitution: x + y = 14, x - y = 4.",
            answerType: "multiple-choice",
            options: [
              "x = 9, y = 5",
              "x = 10, y = 4",
              "x = 8, y = 6",
              "x = 11, y = 3"
            ],
            correctAnswer: "x = 9, y = 5"
          },
          {
            id: "q10",
            number: 2,
            section: "CORE CONCEPTS",
            text: "For what value of k will the following pair of linear equations have no solution? 3x + y = 1; (2k-1)x + (k-1)y = 2k+1.",
            answerType: "number",
            correctAnswer: 2,
            hint: "Set ratio of coefficients a1/a2 = b1/b2 != c1/c2. 3/(2k-1) = 1/(k-1)."
          },
          {
            id: "q11",
            number: 3,
            section: "CORE CONCEPTS",
            text: "Find the roots of the quadratic equation 2x^2 - x + 1/8 = 0.",
            answerType: "multiple-choice",
            options: [
              "x = 1/4, 1/4",
              "x = 1/2, 1/2",
              "x = -1/4, -1/4",
              "x = 1/8, 1/2"
            ],
            correctAnswer: "x = 1/4, 1/4"
          },
          {
            id: "q12",
            number: 4,
            section: "CORE CONCEPTS",
            text: "Find the discriminant of the equation 3x^2 - 2x + 1/3 = 0 and hence find the nature of its roots.",
            answerType: "multiple-choice",
            options: [
              "Discriminant = 0, roots are real and equal",
              "Discriminant > 0, roots are distinct and real",
              "Discriminant < 0, roots are imaginary",
              "Discriminant = 1, roots are integers"
            ],
            correctAnswer: "Discriminant = 0, roots are real and equal"
          },
          {
            id: "q13",
            number: 5,
            section: "CORE CONCEPTS",
            text: "Find two consecutive odd positive integers, sum of whose squares is 290.",
            answerType: "multiple-choice",
            options: [
              "11 and 13",
              "9 and 11",
              "13 and 15",
              "15 and 17"
            ],
            correctAnswer: "11 and 13",
            hint: "Assume integers x and x+2. x^2 + (x+2)^2 = 290."
          },
          {
            id: "q14",
            number: 1,
            section: "REAL WORLD APPLICATIONS",
            text: "A train travels 360 km at a uniform speed. If the speed had been 5 km/h more, it would have taken 1 hour less for the same journey. Find the speed of the train.",
            answerType: "number",
            correctAnswer: 40,
            hint: "360/x - 360/(x+5) = 1. Solve the quadratic equation x^2 + 5x - 1800 = 0."
          },
          {
            id: "q15",
            number: 2,
            section: "REAL WORLD APPLICATIONS",
            text: "Five years ago, Nuri was thrice as old as Sonu. Ten years later, Nuri will be twice as old as Sonu. How old are Nuri and Sonu today?",
            answerType: "multiple-choice",
            options: [
              "Nuri is 50, Sonu is 20",
              "Nuri is 40, Sonu is 15",
              "Nuri is 60, Sonu is 25",
              "Nuri is 45, Sonu is 18"
            ],
            correctAnswer: "Nuri is 50, Sonu is 20"
          }
        ]
      },
      {
        id: "c3",
        ordinal: 3,
        title: "Trigonometry & Triangles",
        description: "Sine, cosine, tangent relations, proof of geometric identities, heights and distances in real situations.",
        questions: [
          {
            id: "q16",
            number: 1,
            section: "CORE CONCEPTS",
            text: "Given 15 cot A = 8, find sin A.",
            answerType: "multiple-choice",
            options: [
              "15/17",
              "8/17",
              "17/15",
              "15/8"
            ],
            correctAnswer: "15/17"
          },
          {
            id: "q17",
            number: 2,
            section: "CORE CONCEPTS",
            text: "Evaluate: (2 tan 30) / (1 + tan^2 30).",
            answerType: "multiple-choice",
            options: [
              "sin 60",
              "cos 60",
              "tan 60",
              "sin 30"
            ],
            correctAnswer: "sin 60",
            hint: "Recall tan 30 = 1/sqrt(3). Calculate numerator and denominator."
          },
          {
            id: "q18",
            number: 4,
            section: "CORE CONCEPTS",
            text: "In triangle ABC, right-angled at B, AB = 24 cm, BC = 7 cm. Determine cos A.",
            answerType: "multiple-choice",
            options: [
              "24/25",
              "7/25",
              "25/24",
              "7/15"
            ],
            correctAnswer: "24/25",
            hint: "Find hypotenuse AC = sqrt(24^2 + 7^2) = 25. Then Cos A = Adjacent/Hypotenuse."
          },
          {
            id: "q19",
            number: 1,
            section: "REAL WORLD APPLICATIONS",
            text: "A tree breaks due to a storm and the broken part bends so that the top of the tree touches the ground making an angle 30 degrees with it. The distance between the foot of the tree to the point where the top touches the ground is 8 m. Find the height of the tree.",
            answerType: "multiple-choice",
            options: [
              "8 * sqrt(3) meters",
              "8 / sqrt(3) meters",
              "16 * sqrt(3) meters",
              "12 meters"
            ],
            correctAnswer: "8 * sqrt(3) meters",
            hint: "Height of tree = AB + AC, where AB = adjacent * tan 30 and AC = adjacent * sec 30. Height = 8/sqrt(3) + 16/sqrt(3) = 24/sqrt(3) = 8*sqrt(3)."
          }
        ]
      }
    ],
    practiceSets: [
      {
        id: "ps1",
        level: "Core Proficiency (Average Student)",
        setTitle: "SET 1",
        questions: [
          {
            id: "ps1_q1",
            number: 1,
            section: "PRACTICE SETS",
            text: "Find the HCF and LCM of 12, 15, and 21 using the prime factorization method.",
            answerType: "multiple-choice",
            options: [
              "HCF = 3, LCM = 420",
              "HCF = 5, LCM = 350",
              "HCF = 3, LCM = 210",
              "HCF = 7, LCM = 840"
            ],
            correctAnswer: "HCF = 3, LCM = 420"
          },
          {
            id: "ps1_q2",
            number: 2,
            section: "PRACTICE SETS",
            text: "Find the zeroes of the quadratic polynomial x^2 - 2x - 8.",
            answerType: "multiple-choice",
            options: [
              "4 and -2",
              "-4 and 2",
              "4 and 2",
              "-4 and -2"
            ],
            correctAnswer: "4 and -2"
          }
        ]
      },
      {
        id: "ps2",
        level: "National Olympiad (Top 10)",
        setTitle: "SET 1",
        questions: [
          {
            id: "ps2_q1",
            number: 1,
            section: "PRACTICE SETS",
            text: "Find the highest power of 10 that divides 1000!.",
            answerType: "number",
            correctAnswer: 249,
            hint: "Find power of 5 in 1000! using Legendre's formula: floor(1000/5) + floor(1000/25) + floor(1000/125) + floor(1000/625)."
          },
          {
            id: "ps2_q2",
            number: 3,
            section: "PRACTICE SETS",
            text: "Solve in integers the equation x^2 - y^2 = 2026.",
            answerType: "multiple-choice",
            options: [
              "No integer solutions",
              "Infinity of solutions",
              "Four integer solutions",
              "Exactly two solutions"
            ],
            correctAnswer: "No integer solutions",
            hint: "x^2 - y^2 is congruent to 0, 1, or 3 mod 4. But 2026 = 4 * 506 + 2, which is congruent to 2 mod 4. Hence no solutions."
          }
        ]
      }
    ]
  },
  {
    title: "Class 9 Math: Advanced Mastery Workbook",
    slug: "class-9-math",
    language: "English",
    pdf_url: "/api/books/class-9-math.pdf",
    thumbnail_link: "sapphire-classic",
    subject: "Mathematics",
    class: "Class 9",
    author: "Atharv Singh, Anaya Singh",
    publication_year: 2026,
    description: "Rigorous grade-9 training including algebraic structure reductions, coordinate systems, Heron's geometry, and 100 Olympiad training problems.",
    pagesCount: 53,
    chapters: [
      {
        id: "c1_9",
        ordinal: 1,
        title: "Number Systems & Polynomials",
        description: "Rationalizing denominators, polynomial divisions containing parameters, factored expansions, and repeating decimals.",
        questions: [
          {
            id: "q9_1",
            number: 1,
            section: "CORE CONCEPTS",
            text: "Rationalize the denominator of 1 / (sqrt(7) - sqrt(6)).",
            answerType: "multiple-choice",
            options: [
              "sqrt(7) + sqrt(6)",
              "sqrt(7) - sqrt(6)",
              "1",
              "13"
            ],
            correctAnswer: "sqrt(7) + sqrt(6)"
          },
          {
            id: "q9_2",
            number: 2,
            section: "CORE CONCEPTS",
            text: "Evaluate: (64/125)^(-2/3).",
            answerType: "multiple-choice",
            options: [
              "25/16",
              "16/25",
              "5/4",
              "4/5"
            ],
            correctAnswer: "25/16",
            hint: "(64/125)^(-2/3) = (125/64)^(2/3) = (5/4)^2 = 25/16."
          },
          {
            id: "q9_3",
            number: 3,
            section: "CORE CONCEPTS",
            text: "Find the remainder when x^3 - ax^2 + 6x - a is divided by x - a.",
            answerType: "multiple-choice",
            options: [
              "5a",
              "6a",
              "4a",
              "a"
            ],
            correctAnswer: "5a",
            hint: "Substitute x = a in the polynomial to find remainder: a^3 - a(a^2) + 6a - a = 5a."
          },
          {
            id: "q9_4",
            number: 5,
            section: "CORE CONCEPTS",
            text: "Express 0.2353535... in the form p/q.",
            answerType: "multiple-choice",
            options: [
              "233/990",
              "235/999",
              "233/900",
              "235/990"
            ],
            correctAnswer: "233/990",
            hint: "Let x = 0.2353535... then 10x = 2.3535... and 1000x = 235.3535... Subtract to get 990x = 233."
          },
          {
            id: "q9_5",
            number: 1,
            section: "REAL WORLD APPLICATIONS",
            text: "The revenue of the Crunchley makhana brand over 'x' months is modeled by the polynomial p(x) = 3x^3 - 5x^2 + 2x - 8. Find the revenue at x = 3.",
            answerType: "number",
            correctAnswer: 34,
            hint: "p(3) = 3(27) - 5(9) + 2(3) - 8 = 81 - 45 + 6 - 8 = 34."
          }
        ]
      }
    ],
    practiceSets: []
  },
  {
    title: "Class 8 Math: Advanced Mastery Workbook",
    slug: "class-8-math",
    language: "English",
    pdf_url: "/api/books/class-8-math.pdf",
    thumbnail_link: "sunset-amber",
    subject: "Mathematics",
    class: "Class 8",
    author: "Priyanka",
    publication_year: 2026,
    description: "Key foundations in algebraic factorizations, perfect square multipliers, linear equations in one variable, and Olympiad puzzle sets.",
    pagesCount: 53,
    chapters: [
      {
        id: "c1_8",
        ordinal: 1,
        title: "Rational Numbers, Squares & Cubes",
        description: "Finding prime factor pairs, Pythagorean triplets, indices operations, and square roots.",
        questions: [
          {
            id: "q8c_1",
            number: 1,
            section: "CORE CONCEPTS",
            text: "Find the smallest number by which 252 must be multiplied to get a perfect square.",
            answerType: "number",
            correctAnswer: 7,
            hint: "252 = 2 * 2 * 3 * 3 * 7. To pair the 7, we must multiply by 7."
          },
          {
            id: "q8c_2",
            number: 2,
            section: "CORE CONCEPTS",
            text: "Find the cube root of 13,824.",
            answerType: "number",
            correctAnswer: 24
          },
          {
            id: "q8c_3",
            number: 3,
            section: "CORE CONCEPTS",
            text: "Find a Pythagorean triplet whose one member is 16.",
            answerType: "multiple-choice",
            options: [
              "16, 63, 65",
              "16, 30, 34",
              "16, 60, 62",
              "16, 20, 25"
            ],
            correctAnswer: "16, 63, 65",
            hint: "Using 2m = 16 => m = 8. Other members: m^2 - 1 = 63, and m^2 + 1 = 65."
          }
        ]
      }
    ],
    practiceSets: []
  },
  {
    title: "Class 7 Math: Premium Workbook & Olympiad Prep",
    slug: "class-7-math",
    language: "English",
    pdf_url: "/api/books/class-7-math.pdf",
    thumbnail_link: "forest-teal",
    subject: "Mathematics",
    class: "Class 7",
    author: "Mukesh Kumar, Atharv Singh, Anaya Singh",
    publication_year: 2026,
    description: "Introductory algebra, comparing quantities, percentage calculation models, exponents and geometry elements.",
    pagesCount: 51,
    chapters: [
      {
        id: "c1_7",
        ordinal: 1,
        title: "Rational Numbers & Exponents",
        description: "Reducing numbers, inserting middle rationals, index laws, and standard scientific syntax.",
        questions: [
          {
            id: "q7c_1",
            number: 1,
            section: "CORE CONCEPTS",
            text: "Express the rational number -48/72 in its standard form.",
            answerType: "multiple-choice",
            options: [
              "-2/3",
              "-4/6",
              "-3/4",
              "-12/18"
            ],
            correctAnswer: "-2/3"
          },
          {
            id: "q7c_2",
            number: 3,
            section: "CORE CONCEPTS",
            text: "Evaluate using laws of exponents: (3^5 * 10^5 * 25) / (5^7 * 6^5).",
            answerType: "number",
            correctAnswer: 1,
            hint: "Expand prime factors: 10^5 = 2^5 * 5^5, 6^5 = 2^5 * 3^5. Substitute and divide."
          }
        ]
      }
    ],
    practiceSets: []
  },
  {
    title: "Class 6 Math: Mastery & Olympiad Workbook",
    slug: "class-6-math",
    language: "English",
    pdf_url: "/api/books/class-6-math.pdf",
    thumbnail_link: "midnight-indigo",
    subject: "Mathematics",
    class: "Class 6",
    author: "Mukesh Kumar",
    publication_year: 2026,
    description: "Fundamental training in decimal systems, integer signs addition, ratio scaling, and introduction to basic algebraic expressions.",
    pagesCount: 51,
    chapters: [
      {
        id: "c1_6",
        ordinal: 1,
        title: "Integers & Number Systems",
        description: "Sign rankings, absolute magnitude math, and temperature modeling.",
        questions: [
          {
            id: "q6c_1",
            number: 1,
            section: "CORE CONCEPTS",
            text: "Arrange the following integers in ascending order: -15, 8, -4, 0, -2, 12.",
            answerType: "multiple-choice",
            options: [
              "-15, -4, -2, 0, 8, 12",
              "-15, -2, -4, 0, 8, 12",
              "0, -2, -4, 8, 12, -15",
              "-2, -4, -15, 0, 8, 12"
            ],
            correctAnswer: "-15, -4, -2, 0, 8, 12"
          },
          {
            id: "q6c_2",
            number: 2,
            section: "CORE CONCEPTS",
            text: "Evaluate the absolute value expression: |-45| + |-12| - |-5|.",
            answerType: "number",
            correctAnswer: 52,
            hint: "45 + 12 - 5 = 52."
          }
        ]
      }
    ],
    practiceSets: []
  },
  {
    title: "Class 5 Math: Advanced Single-Column Workbook",
    slug: "class-5-math",
    language: "English",
    pdf_url: "/api/books/class-5-math.pdf",
    thumbnail_link: "royal-aubergine",
    subject: "Mathematics",
    class: "Class 5",
    author: "Atharv Singh, Priyanka",
    publication_year: 2026,
    description: "International vs. unified Indian numbering systems, strict BODMAS bracket evaluation order, fractions, and 100 Olympiad challenges.",
    pagesCount: 45,
    chapters: [
      {
        id: "c1_5",
        ordinal: 1,
        title: "Millions and Crores",
        description: "Number names parsing and place-face values discrepancies.",
        questions: [
          {
            id: "q5c_1",
            number: 1,
            section: "CORE CONCEPTS",
            text: "Write the number 45,067,890 in words using the International System.",
            answerType: "multiple-choice",
            options: [
              "Forty-five million sixty-seven thousand eight hundred ninety",
              "Four crore fifty lakh sixty-seven thousand eight hundred ninety",
              "Forty-five million six hundred seventy-eight thousand ninety",
              "Four hundred fifty million sixty-seven thousand eight hundred ninety"
            ],
            correctAnswer: "Forty-five million sixty-seven thousand eight hundred ninety"
          },
          {
            id: "q5c_2",
            number: 3,
            section: "CORE CONCEPTS",
            text: "What is the difference between the place value and face value of 7 in 8,765,432?",
            answerType: "number",
            correctAnswer: 699993,
            hint: "Place value is 700,000. Face value is 7. 700,000 - 7 = 699,993."
          }
        ]
      }
    ],
    practiceSets: []
  },
  {
    title: "Class 4 Math: Premium Single-Column Workbook",
    slug: "class-4-math",
    language: "English",
    pdf_url: "/api/books/class-4-math.pdf",
    thumbnail_link: "slate-mint",
    subject: "Mathematics",
    class: "Class 4",
    author: "Anaya Singh",
    publication_year: 2026,
    description: "Large numbers rounding, advanced multidimensional additions, division algorithms, and modular fraction groupings.",
    pagesCount: 41,
    chapters: [
      {
        id: "c1_4",
        ordinal: 1,
        title: "Large Numbers",
        description: "Naming systems, place value identification, expanded notations, and rounding.",
        questions: [
          {
            id: "q4c_1",
            number: 1,
            section: "CORE CONCEPTS",
            text: "Write the number name for 4,567,890 in the International System.",
            answerType: "multiple-choice",
            options: [
              "Four million five hundred sixty-seven thousand eight hundred ninety",
              "Forty-five lakh sixty-seven thousand eight hundred ninety",
              "Four million fifty-six thousand seven hundred eighty-nine",
              "Four crore fifty-six lakh seventy-eight thousand ninety"
            ],
            correctAnswer: "Four million five hundred sixty-seven thousand eight hundred ninety"
          },
          {
            id: "q4c_2",
            number: 4,
            section: "CORE CONCEPTS",
            text: "Round 54,672 to the nearest thousand.",
            answerType: "number",
            correctAnswer: 55000,
            hint: "The hundreds digit is 6 (which is >= 5), so we round up to 55,000."
          }
        ]
      }
    ],
    practiceSets: []
  },
  {
    title: "Class 2 Math: Ultimate Practice Workbook",
    slug: "class-2-math-ultimate",
    language: "English",
    pdf_url: "/api/books/class-2-math-ultimate.pdf",
    thumbnail_link: "coral-blush",
    subject: "Mathematics",
    class: "Class 2",
    author: "Mukesh Kumar, Priyanka, Atharv Singh",
    publication_year: 2026,
    description: "Classic math drills database covering standard hundreds units ordering, addition algorithms with carrying, and basic multiplications tables.",
    pagesCount: 28,
    chapters: [
      {
        id: "c1_2u",
        ordinal: 1,
        title: "Numbers up to 1000",
        description: "Number names, place weights, inequalities, and building largest digits.",
        questions: [
          {
            id: "q2uc_1",
            number: 1,
            section: "CORE CONCEPTS",
            text: "Write the number name for 345.",
            answerType: "multiple-choice",
            options: [
              "Three hundred forty-three",
              "Three hundred forty-five",
              "Three hundred fifty-four",
              "Three hundred fifty"
            ],
            correctAnswer: "Three hundred forty-five"
          },
          {
            id: "q2uc_2",
            number: 19,
            section: "CORE CONCEPTS",
            text: "Make the largest 3-digit number using 4, 1, 9.",
            answerType: "number",
            correctAnswer: 941,
            hint: "Arrange the digits in descending order: 9, 4, 1."
          }
        ]
      }
    ],
    practiceSets: []
  },
  {
    title: "Class 2 Mathematics: Expanded Practice Workbook",
    slug: "class-2-math-expanded",
    language: "English",
    pdf_url: "/api/books/class-2-math-expanded.pdf",
    thumbnail_link: "sunny-sand",
    subject: "Mathematics",
    class: "Class 2",
    author: "Atharv Singh",
    publication_year: 2026,
    description: "Expanded core practice worksheets focusing heavily on tactile number lines, carrying additions, and subtraction doublechecks.",
    pagesCount: 34,
    chapters: [
      {
        id: "c1_2e",
        ordinal: 1,
        title: "Numbers up to 1000",
        description: "Writing names, counting blocks, and next batch sequences.",
        questions: [
          {
            id: "q2ec_1",
            number: 11,
            section: "CORE CONCEPTS",
            text: "Atharv is organizing his toy blocks. He has 3 boxes of 100, 4 stacks of 10, and 6 loose blocks. What is the total number of blocks he has?",
            answerType: "number",
            correctAnswer: 346,
            hint: "3 * 100 + 4 * 10 + 6 = 346."
          },
          {
            id: "q2ec_2",
            number: 13,
            section: "CORE CONCEPTS",
            text: "In a factory producing Crunchley snacks, the machine packed batch number 899. What will be the number of the next batch?",
            answerType: "number",
            correctAnswer: 900
          }
        ]
      }
    ],
    practiceSets: []
  },
  {
    title: "Class 1 Mathematics: Expanded Master Workbook",
    slug: "class-1-math",
    language: "English",
    pdf_url: "/api/books/class-1-math.pdf",
    thumbnail_link: "lilac-bloom",
    subject: "Mathematics",
    class: "Class 1",
    author: "Anaya Singh",
    publication_year: 2026,
    description: "Basic integer patterns, double single-digit additions, subtraction blocks, shapes drawings, and simple matching games.",
    pagesCount: 13,
    chapters: [
      {
        id: "c1_1",
        ordinal: 1,
        title: "Numbers (1 to 100)",
        description: "Number names, neighbor indices, and forward sequence drills.",
        questions: [
          {
            id: "q1c_1",
            number: 1,
            section: "CORE CONCEPTS",
            text: "Write the number name for 45.",
            answerType: "multiple-choice",
            options: [
              "Fourteen",
              "Forty-five",
              "Fifty-four",
              "Forty"
            ],
            correctAnswer: "Forty-five"
          },
          {
            id: "q1c_2",
            number: 3,
            section: "CORE CONCEPTS",
            text: "What number comes just before 80?",
            answerType: "number",
            correctAnswer: 79
          }
        ]
      }
    ],
    practiceSets: []
  }
];
