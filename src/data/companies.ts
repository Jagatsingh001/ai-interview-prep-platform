// Static data for the Company Preparation section.
// Reusable by design: to add a new company, just push a new object into COMPANIES below.

export interface CodingQuestion {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  year?: string;
}

export interface TechnicalSubject {
  subject: string;
  questions: { q: string; a: string }[];
}

export interface HRQuestion {
  q: string;
  tip: string;
}

export interface InterviewRound {
  name: string;
  description: string;
}

export interface Company {
  slug: string;
  name: string;
  initials: string; // used for the colored avatar instead of a trademarked logo image
  color: string; // hex, used for the avatar background
  shortDescription: string;
  expectedPackage: string;
  eligibility: string[];
  selectionProcess: string[];
  preparationTips: string[];
  interviewRounds: InterviewRound[];
  codingQuestions: CodingQuestion[];
  technicalQuestions: TechnicalSubject[];
  hrQuestions: HRQuestion[];
}

// Shared across all companies — aptitude question patterns are generic, not company-specific.
export interface AptitudeQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface AptitudeCategory {
  name: string;
  questions: AptitudeQuestion[];
}

export const APTITUDE_BANK: AptitudeCategory[] = [
  {
    name: 'Quantitative Aptitude',
    questions: [
      { question: 'A train 150m long crosses a pole in 15 seconds. What is its speed?', options: ['10 m/s', '36 km/h', 'Both A and B', '15 m/s'], correctIndex: 2, difficulty: 'Easy' },
      { question: 'If the cost price of 20 articles equals the selling price of 16 articles, what is the profit %?', options: ['20%', '25%', '16%', '30%'], correctIndex: 1, difficulty: 'Medium' },
      { question: 'The average of 5 consecutive numbers is 20. What is the largest number?', options: ['20', '21', '22', '23'], correctIndex: 2, difficulty: 'Easy' },
      { question: 'A can do a work in 12 days, B in 18 days. Working together, how many days will they take?', options: ['7.2 days', '6 days', '8 days', '9 days'], correctIndex: 0, difficulty: 'Medium' },
      { question: 'What is the compound interest on ₹10,000 at 10% p.a. for 2 years?', options: ['₹2,000', '₹2,100', '₹2,200', '₹1,900'], correctIndex: 1, difficulty: 'Medium' },
    ],
  },
  {
    name: 'Logical Reasoning',
    questions: [
      { question: 'Find the next number: 2, 6, 12, 20, 30, ?', options: ['40', '42', '36', '38'], correctIndex: 1, difficulty: 'Easy' },
      { question: 'Using A=1, B=2 ... Z=26, and summing the letter values, what does "CAT" equal?', options: ['24', '45', '63', '39'], correctIndex: 0, difficulty: 'Medium' },
      { question: 'A man says, "She is the daughter of my grandfather\'s only son." Assuming he has no brothers, who is she?', options: ['His sister', 'His daughter', 'His niece', 'Cannot be determined'], correctIndex: 1, difficulty: 'Medium' },
      { question: 'Complete the pattern: Square, Circle, Triangle, Square, Circle, ?', options: ['Square', 'Triangle', 'Circle', 'Pentagon'], correctIndex: 1, difficulty: 'Easy' },
      { question: 'Five friends sit in a row. A is left of B, C is right of D, E is between B and C. Who is in the middle?', options: ['A', 'B', 'E', 'D'], correctIndex: 2, difficulty: 'Hard' },
    ],
  },
  {
    name: 'Verbal Ability',
    questions: [
      { question: 'Choose the correct synonym for "Ephemeral":', options: ['Permanent', 'Short-lived', 'Ancient', 'Colorful'], correctIndex: 1, difficulty: 'Easy' },
      { question: 'Choose the correct antonym for "Benevolent":', options: ['Kind', 'Generous', 'Malevolent', 'Caring'], correctIndex: 2, difficulty: 'Easy' },
      { question: 'Fill in the blank: "She has a ___ for painting."', options: ['knack', 'knick', 'nack', 'neck'], correctIndex: 0, difficulty: 'Medium' },
      { question: 'Identify the correctly punctuated sentence.', options: ['Its a nice day, isnt it', "It's a nice day, isn't it?", "Its' a nice day, isnt' it?", 'It is a nice day isnt it'], correctIndex: 1, difficulty: 'Medium' },
      { question: 'Choose the one-word substitute for "A person who can speak many languages":', options: ['Linguist', 'Polyglot', 'Translator', 'Bilingual'], correctIndex: 1, difficulty: 'Medium' },
    ],
  },
  {
    name: 'Data Interpretation',
    questions: [
      { question: 'A pie chart shows Sales=40%, Marketing=25%, R&D=20%, Others=15% of a ₹200 Cr budget. What is the R&D budget?', options: ['₹40 Cr', '₹50 Cr', '₹35 Cr', '₹30 Cr'], correctIndex: 0, difficulty: 'Easy' },
      { question: 'A bar graph shows monthly sales of 100, 120, 90, 150 units over 4 months. What is the average monthly sale?', options: ['110', '115', '120', '105'], correctIndex: 0, difficulty: 'Medium' },
      { question: "A company's revenue grew from ₹50L to ₹65L in a year. What is the growth percentage?", options: ['20%', '25%', '30%', '15%'], correctIndex: 1, difficulty: 'Medium' },
      { question: 'A table shows quarterly profits (in lakhs): Q1=10, Q2=15, Q3=12, Q4=18. Which quarter had the highest growth over the previous quarter?', options: ['Q2', 'Q3', 'Q4', 'Q1'], correctIndex: 2, difficulty: 'Hard' },
      { question: 'A line graph shows temperature rising steadily from 20°C to 35°C over 5 hours. What is the average rate of increase per hour?', options: ['2°C', '3°C', '4°C', '5°C'], correctIndex: 1, difficulty: 'Easy' },
    ],
  },
];

// Reusable defaults for common company archetypes, so each entry below only needs to override what's different.
const serviceBasedRounds: InterviewRound[] = [
  { name: 'Online Assessment', description: 'Aptitude (quant, logical, verbal) + 1-2 coding questions, usually 60-90 minutes.' },
  { name: 'Technical Interview', description: 'Core CS fundamentals, your projects, and basic coding on a whiteboard or shared editor.' },
  { name: 'HR Interview', description: 'Background, willingness to relocate/work shifts, and culture-fit questions.' },
];

const productBasedRounds: InterviewRound[] = [
  { name: 'Online Assessment', description: '2-3 DSA problems (Medium-Hard) on an online judge, plus sometimes a short MCQ section.' },
  { name: 'Technical Interview 1', description: 'Data structures & algorithms — expect follow-up optimization questions on your solution.' },
  { name: 'Technical Interview 2', description: 'System design (for experienced roles) or a second DSA round + CS fundamentals.' },
  { name: 'HR / Bar Raiser Round', description: 'Behavioral questions mapped to leadership principles or company values, plus team fit.' },
];

const commonAptitudeTip = 'Practice the shared Aptitude Practice bank on this platform regularly — the same patterns repeat across companies.';

export const COMPANIES: Company[] = [
  {
    slug: 'infosys',
    name: 'Infosys',
    initials: 'IN',
    color: '#4B6FFF',
    shortDescription: 'Global IT services & consulting company, one of the largest fresher recruiters in India.',
    expectedPackage: '₹3.6 – 6.5 LPA',
    eligibility: ['60%+ throughout academics (10th, 12th, graduation)', 'No standing backlogs at the time of interview', 'B.Tech/B.E/MCA/M.Sc from a recognized university'],
    selectionProcess: ['Online Assessment (InfyTQ or standard test)', 'Technical Interview', 'HR Interview'],
    preparationTips: ['Focus heavily on pseudocode and logical reasoning questions', 'Revise OOPS concepts and basic DBMS/SQL', 'Prepare a clear, honest walkthrough of your final-year project', commonAptitudeTip],
    interviewRounds: serviceBasedRounds,
    codingQuestions: [
      { title: 'Reverse a linked list', difficulty: 'Easy', year: '2024' },
      { title: 'Find the missing number in an array', difficulty: 'Easy', year: '2024' },
      { title: 'Check if a string is a palindrome', difficulty: 'Easy', year: '2023' },
      { title: 'Find the longest substring without repeating characters', difficulty: 'Medium', year: '2023' },
      { title: 'Implement a basic LRU cache', difficulty: 'Medium', year: '2022' },
    ],
    technicalQuestions: [
      { subject: 'Java', questions: [
        { q: 'What is the difference between an abstract class and an interface?', a: 'An abstract class can have both implemented and unimplemented methods and state; an interface (pre-Java 8) only declares methods with no state, though modern Java allows default methods.' },
        { q: 'What is method overloading vs overriding?', a: 'Overloading is same method name with different parameters in the same class (compile-time); overriding is redefining a parent class method in a subclass (runtime).' },
        { q: 'What is the purpose of the "final" keyword?', a: 'Marks a variable as constant, a method as non-overridable, or a class as non-inheritable.' },
      ]},
      { subject: 'DBMS', questions: [
        { q: 'What is normalization and why is it used?', a: 'The process of organizing data to reduce redundancy and improve integrity, done through normal forms (1NF, 2NF, 3NF, etc.).' },
        { q: 'Difference between DELETE, TRUNCATE, and DROP?', a: 'DELETE removes rows (can be rolled back, triggers fire); TRUNCATE removes all rows fast (minimal logging); DROP removes the entire table structure.' },
        { q: 'What is a primary key vs a foreign key?', a: 'A primary key uniquely identifies a row in its own table; a foreign key references a primary key in another table to enforce referential integrity.' },
      ]},
      { subject: 'Operating System', questions: [
        { q: 'What is a deadlock and its 4 necessary conditions?', a: 'A state where processes wait on each other indefinitely. Conditions: mutual exclusion, hold and wait, no preemption, circular wait.' },
        { q: 'Difference between process and thread?', a: 'A process has its own memory space; threads within a process share memory but have their own stack, making them lighter-weight.' },
        { q: 'What is virtual memory?', a: 'A memory management technique that gives an application the illusion of a large, contiguous memory space using disk space as an extension of RAM.' },
      ]},
    ],
    hrQuestions: [
      { q: 'Tell me about yourself.', tip: 'Give a 60-90 second summary: education, key project/internship, and why you want this role — not your full life story.' },
      { q: 'Why do you want to join Infosys?', tip: 'Mention their scale, learning culture (Infosys Mysore training), and specific service lines that interest you.' },
      { q: 'Are you willing to relocate?', tip: 'Answer honestly, but lean positive if you genuinely are flexible — this matters a lot for service companies.' },
      { q: 'What are your strengths and weaknesses?', tip: 'Pick a real weakness and show what you are actively doing to improve it — don\'t say "I work too hard".' },
      { q: 'Where do you see yourself in 5 years?', tip: 'Show ambition tied to growing within the company, not an unrelated career pivot.' },
    ],
  },
  {
    slug: 'tcs',
    name: 'TCS',
    initials: 'TCS',
    color: '#3C5FE0',
    shortDescription: "India's largest IT services company, known for TCS NQT (National Qualifier Test).",
    expectedPackage: '₹3.36 – 7 LPA',
    eligibility: ['60%+ in 10th, 12th, and graduation (varies by year)', 'No active backlogs', 'Any full-time degree, typically B.Tech/BCA/MCA'],
    selectionProcess: ['TCS NQT (Aptitude + Coding)', 'Technical Interview', 'HR Interview'],
    preparationTips: ['TCS NQT has a strict sectional cutoff — don\'t neglect any single section', 'Revise basic coding patterns (loops, arrays, strings)', 'Be ready to explain your resume line-by-line', commonAptitudeTip],
    interviewRounds: serviceBasedRounds,
    codingQuestions: [
      { title: 'Find duplicate elements in an array', difficulty: 'Easy', year: '2024' },
      { title: 'Print all prime numbers up to N', difficulty: 'Easy', year: '2024' },
      { title: 'Matrix rotation by 90 degrees', difficulty: 'Medium', year: '2023' },
      { title: 'Check balanced parentheses using a stack', difficulty: 'Medium', year: '2023' },
      { title: 'Find the first non-repeating character in a string', difficulty: 'Easy', year: '2022' },
    ],
    technicalQuestions: [
      { subject: 'SQL', questions: [
        { q: 'Write a query to find the second highest salary.', a: 'SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees);' },
        { q: 'What is a JOIN? Name its types.', a: 'Combines rows from two tables based on a related column. Types: INNER, LEFT, RIGHT, FULL OUTER JOIN.' },
        { q: 'What is an index and why does it help performance?', a: 'A data structure that speeds up row lookups at the cost of extra storage and slower writes.' },
      ]},
      { subject: 'Computer Networks', questions: [
        { q: 'What is the difference between TCP and UDP?', a: 'TCP is connection-oriented and reliable (acknowledgments, retransmission); UDP is connectionless and faster but unreliable.' },
        { q: 'What happens when you type a URL into a browser?', a: 'DNS resolution, TCP handshake, TLS negotiation (if HTTPS), HTTP request/response, and rendering.' },
        { q: 'What is the OSI model?', a: 'A 7-layer conceptual model: Physical, Data Link, Network, Transport, Session, Presentation, Application.' },
      ]},
      { subject: 'Java', questions: [
        { q: 'What is exception handling and why is it used?', a: 'A mechanism (try/catch/finally) to handle runtime errors gracefully without crashing the program.' },
        { q: 'What are constructors used for?', a: 'Special methods that initialize an object\'s state when it is created.' },
        { q: 'What is the difference between == and .equals() in Java?', a: '== compares references (memory address) for objects; .equals() compares logical/content equality when overridden.' },
      ]},
    ],
    hrQuestions: [
      { q: 'Tell me about yourself.', tip: 'Keep it structured: education → key project → why TCS.' },
      { q: 'Why TCS and not another company?', tip: 'Mention their global scale, training program (Ninja/Digital), and stability.' },
      { q: 'Are you comfortable with rotational shifts?', tip: 'Be honest — this is commonly asked and matters for many TCS roles.' },
      { q: 'Describe a challenge you faced in a project.', tip: 'Use a real example with a clear problem → action → result structure.' },
      { q: 'Do you have any questions for us?', tip: 'Always ask something — e.g. about the team you might join or growth opportunities.' },
    ],
  },
  {
    slug: 'wipro',
    name: 'Wipro',
    initials: 'WI',
    color: '#3AA6A0',
    shortDescription: 'Global IT, consulting, and business process services company, hires via WILP/Elite programs.',
    expectedPackage: '₹3.5 – 6.5 LPA',
    eligibility: ['60%+ throughout academics', 'No active backlogs', 'B.Tech/B.E/MCA/M.Sc from a recognized institute'],
    selectionProcess: ['Online Assessment (Aptitude + Coding + Essay)', 'Technical Interview', 'HR Interview'],
    preparationTips: ['Wipro often includes a written essay/communication section — practice writing clearly under time pressure', 'Revise fundamentals of OOPS and basic data structures', 'Know your resume and academic projects in depth', commonAptitudeTip],
    interviewRounds: serviceBasedRounds,
    codingQuestions: [
      { title: 'Sort an array using bubble sort', difficulty: 'Easy', year: '2024' },
      { title: 'Count vowels and consonants in a string', difficulty: 'Easy', year: '2023' },
      { title: 'Find the GCD and LCM of two numbers', difficulty: 'Easy', year: '2023' },
      { title: 'Implement a queue using two stacks', difficulty: 'Medium', year: '2022' },
      { title: 'Find all pairs in an array with a given sum', difficulty: 'Medium', year: '2022' },
    ],
    technicalQuestions: [
      { subject: 'OOP Concepts', questions: [
        { q: 'What are the 4 pillars of OOP?', a: 'Encapsulation, Abstraction, Inheritance, and Polymorphism.' },
        { q: 'What is polymorphism? Give an example.', a: 'The ability of a function/method to behave differently based on the object calling it — e.g. method overriding across subclasses.' },
        { q: 'What is encapsulation?', a: 'Bundling data and methods that operate on it within a class, restricting direct access to internal state.' },
      ]},
      { subject: 'DBMS', questions: [
        { q: 'What are ACID properties?', a: 'Atomicity, Consistency, Isolation, Durability — properties that guarantee reliable database transactions.' },
        { q: 'What is a foreign key constraint used for?', a: 'Enforces referential integrity by ensuring a column value matches an existing value in another table.' },
        { q: 'What is the difference between a clustered and non-clustered index?', a: 'A clustered index determines the physical order of data in a table (one per table); a non-clustered index is a separate structure pointing to the data (multiple allowed).' },
      ]},
      { subject: 'JavaScript', questions: [
        { q: 'What is the difference between let, const, and var?', a: 'var is function-scoped and hoisted; let and const are block-scoped, with const disallowing reassignment.' },
        { q: 'What is a closure?', a: 'A function that retains access to its lexical scope even after the outer function has returned.' },
        { q: 'What is event bubbling?', a: 'When an event triggered on a nested element propagates up through its ancestors in the DOM.' },
      ]},
    ],
    hrQuestions: [
      { q: 'Tell me about yourself.', tip: 'Highlight academic strengths and any project relevant to the role you\'re applying for.' },
      { q: 'Why should we hire you?', tip: 'Connect your specific skills to what the role needs — be concrete, not generic.' },
      { q: 'How do you handle pressure or tight deadlines?', tip: 'Give a real example with a calm, structured approach, not just "I stay positive".' },
      { q: 'What do you know about Wipro?', tip: 'Mention their IT services, consulting arms, and recent focus areas like cloud and AI.' },
      { q: 'Any questions for us?', tip: 'Ask about the specific team, project types, or onboarding/training process.' },
    ],
  },
  {
    slug: 'capgemini',
    name: 'Capgemini',
    initials: 'CG',
    color: '#0070AD',
    shortDescription: 'French multinational IT consulting company with a large India delivery presence.',
    expectedPackage: '₹4 – 7.5 LPA',
    eligibility: ['60%+ in 10th, 12th, and graduation', 'No standing backlogs', 'B.Tech/B.E/MCA (CS/IT preferred for technical roles)'],
    selectionProcess: ['Online Assessment (Pseudocode + English + Game-based test)', 'Technical Interview', 'HR Interview'],
    preparationTips: ['Capgemini\'s test includes a unique game-based assessment — practice sample games beforehand', 'Be comfortable reading and tracing pseudocode, not just writing real code', 'Prepare STAR-format answers for behavioral questions', commonAptitudeTip],
    interviewRounds: serviceBasedRounds,
    codingQuestions: [
      { title: 'Find the factorial of a number using recursion', difficulty: 'Easy', year: '2024' },
      { title: 'Remove duplicates from a sorted array', difficulty: 'Easy', year: '2023' },
      { title: 'Check if two strings are anagrams', difficulty: 'Easy', year: '2023' },
      { title: 'Find the maximum subarray sum (Kadane\'s algorithm)', difficulty: 'Medium', year: '2022' },
      { title: 'Implement binary search on a rotated sorted array', difficulty: 'Medium', year: '2022' },
    ],
    technicalQuestions: [
      { subject: 'Java', questions: [
        { q: 'What is the difference between checked and unchecked exceptions?', a: 'Checked exceptions must be declared/caught at compile time (e.g. IOException); unchecked ones occur at runtime (e.g. NullPointerException).' },
        { q: 'What is a static keyword used for?', a: 'Declares a member that belongs to the class itself rather than any instance.' },
        { q: 'What is multithreading?', a: 'Running multiple threads concurrently within a single process to improve performance and responsiveness.' },
      ]},
      { subject: 'DBMS', questions: [
        { q: 'What is a stored procedure?', a: 'A precompiled set of SQL statements stored in the database that can be executed as a unit.' },
        { q: 'What is the difference between UNION and UNION ALL?', a: 'UNION removes duplicate rows; UNION ALL keeps all rows including duplicates and is faster.' },
        { q: 'What is denormalization and when would you use it?', a: 'Intentionally introducing redundancy to improve read performance, often used in reporting/analytics databases.' },
      ]},
      { subject: 'Operating System', questions: [
        { q: 'What is thrashing?', a: 'A state where the system spends more time swapping pages than executing processes, due to excessive paging.' },
        { q: 'What is the difference between paging and segmentation?', a: 'Paging divides memory into fixed-size blocks; segmentation divides it into variable-sized logical units based on program structure.' },
        { q: 'What is a semaphore used for?', a: 'A synchronization tool used to control access to shared resources by multiple processes/threads.' },
      ]},
    ],
    hrQuestions: [
      { q: 'Tell me about yourself.', tip: 'Keep it under 2 minutes, end with why you\'re a good fit for Capgemini specifically.' },
      { q: 'Why do you want to work at Capgemini?', tip: 'Mention their global consulting reach and focus on digital transformation projects.' },
      { q: 'Tell me about a time you worked in a team.', tip: 'Use a specific example — your role, the challenge, and the outcome.' },
      { q: 'Are you open to working in shifts or relocating?', tip: 'Answer honestly and directly — this is a practical screening question.' },
      { q: 'What are your salary expectations?', tip: 'For freshers, it\'s usually fine to say you\'re open to the standard package for the role.' },
    ],
  },
  {
    slug: 'accenture',
    name: 'Accenture',
    initials: 'AC',
    color: '#A100FF',
    shortDescription: 'Global professional services company spanning strategy, consulting, and technology.',
    expectedPackage: '₹4.5 – 8 LPA',
    eligibility: ['60%+ throughout academics (varies by role — ASE vs Digital roles differ)', 'No active backlogs', 'Any full-time degree, CS/IT preferred for tech roles'],
    selectionProcess: ['Cognitive & Technical Assessment', 'Communication Assessment', 'Technical Interview', 'HR Interview'],
    preparationTips: ['Accenture places real weight on the communication assessment — practice clear spoken English', 'Revise core CS fundamentals for the technical round', 'Research Accenture\'s major service lines (Strategy, Technology, Operations)', commonAptitudeTip],
    interviewRounds: serviceBasedRounds,
    codingQuestions: [
      { title: 'Find the second largest element in an array', difficulty: 'Easy', year: '2024' },
      { title: 'Check if a number is an Armstrong number', difficulty: 'Easy', year: '2023' },
      { title: 'Reverse words in a sentence', difficulty: 'Easy', year: '2023' },
      { title: 'Find the intersection of two arrays', difficulty: 'Medium', year: '2022' },
      { title: 'Detect a cycle in a linked list', difficulty: 'Medium', year: '2022' },
    ],
    technicalQuestions: [
      { subject: 'Java', questions: [
        { q: 'What is the difference between an array and an ArrayList?', a: 'Arrays are fixed-size and can hold primitives; ArrayList is dynamically resizable and holds objects (with autoboxing for primitives).' },
        { q: 'What is inheritance? Why is it useful?', a: 'A mechanism where a class acquires properties/behavior of another, promoting code reuse and hierarchy.' },
        { q: 'What is the difference between interface and abstract class?', a: 'An interface only declares behavior (with optional default methods); an abstract class can hold state and partial implementation.' },
      ]},
      { subject: 'SQL', questions: [
        { q: 'Write a query to find employees with the same salary.', a: 'SELECT salary, COUNT(*) FROM employees GROUP BY salary HAVING COUNT(*) > 1;' },
        { q: 'What is the difference between WHERE and HAVING?', a: 'WHERE filters rows before grouping; HAVING filters groups after aggregation.' },
        { q: 'What is a subquery?', a: 'A query nested inside another query, used to compute intermediate results.' },
      ]},
      { subject: 'React', questions: [
        { q: 'What is the virtual DOM?', a: 'An in-memory representation of the real DOM that React uses to compute minimal updates efficiently.' },
        { q: 'What are React hooks?', a: 'Functions like useState and useEffect that let function components use state and lifecycle features.' },
        { q: 'What is the difference between props and state?', a: 'Props are passed from a parent and are read-only; state is managed internally by the component and can change over time.' },
      ]},
    ],
    hrQuestions: [
      { q: 'Tell me about yourself.', tip: 'Structure it around education, a standout project, and enthusiasm for consulting/tech work.' },
      { q: 'Why Accenture?', tip: 'Mention their breadth across strategy, consulting, and technology — and any specific service line you\'re drawn to.' },
      { q: 'Describe a time you had to learn something new quickly.', tip: 'Use a real, specific example — this maps directly to consulting culture.' },
      { q: 'How do you handle client-facing pressure?', tip: 'Even without direct experience, describe a related situation (team lead, presentation, group project).' },
      { q: 'Do you have any questions for us?', tip: 'Ask about the kind of projects freshers typically work on early in their career.' },
    ],
  },
  {
    slug: 'cognizant',
    name: 'Cognizant',
    initials: 'CTS',
    color: '#1A4FBF',
    shortDescription: 'IT services and consulting company known for its GenC fresher hiring program.',
    expectedPackage: '₹4 – 6.5 LPA',
    eligibility: ['60%+ throughout academics', 'No active backlogs', 'B.Tech/B.E/MCA from a recognized university'],
    selectionProcess: ['AMCAT-based Online Assessment', 'Technical Interview', 'HR Interview'],
    preparationTips: ['Cognizant\'s test is AMCAT-based — practice on AMCAT-style aptitude and coding sets', 'Be thorough with basic programming logic (loops, patterns, arrays)', 'Prepare a confident, honest project explanation', commonAptitudeTip],
    interviewRounds: serviceBasedRounds,
    codingQuestions: [
      { title: 'Print a pattern of stars/numbers (pyramid pattern)', difficulty: 'Easy', year: '2024' },
      { title: 'Find the sum of digits of a number', difficulty: 'Easy', year: '2023' },
      { title: 'Check if a string is a rotation of another string', difficulty: 'Medium', year: '2023' },
      { title: 'Find the majority element in an array', difficulty: 'Medium', year: '2022' },
      { title: 'Merge two sorted arrays', difficulty: 'Easy', year: '2022' },
    ],
    technicalQuestions: [
      { subject: 'Java', questions: [
        { q: 'What is the JVM, JRE, and JDK?', a: 'JVM runs bytecode; JRE is the JVM plus core libraries needed to run Java programs; JDK is the JRE plus development tools like the compiler.' },
        { q: 'What is garbage collection?', a: 'Automatic memory management that reclaims memory used by objects no longer reachable by the program.' },
        { q: 'What is method overriding used for?', a: 'Allows a subclass to provide a specific implementation of a method already defined in its parent class.' },
      ]},
      { subject: 'Computer Networks', questions: [
        { q: 'What is DNS and why is it needed?', a: 'Domain Name System — translates human-readable domain names into IP addresses.' },
        { q: 'What is the difference between HTTP and HTTPS?', a: 'HTTPS is HTTP over TLS/SSL, encrypting data in transit for security.' },
        { q: 'What is a firewall?', a: 'A security system that monitors and controls incoming/outgoing network traffic based on defined rules.' },
      ]},
      { subject: 'DBMS', questions: [
        { q: 'What is a transaction in DBMS?', a: 'A sequence of operations performed as a single logical unit of work, following ACID properties.' },
        { q: 'What is the difference between a view and a table?', a: 'A table stores actual data; a view is a virtual table generated from a query on one or more tables.' },
        { q: 'What is a composite key?', a: 'A primary key made up of two or more columns used together to uniquely identify a row.' },
      ]},
    ],
    hrQuestions: [
      { q: 'Tell me about yourself.', tip: 'Keep it relevant to the role — education, a key project, and career motivation.' },
      { q: 'Why do you want to join Cognizant?', tip: 'Mention their GenC program, learning culture, and global delivery model.' },
      { q: 'How do you prioritize tasks under a deadline?', tip: 'Describe a concrete method (e.g. listing tasks by urgency/impact) with a real example.' },
      { q: 'Are you willing to work in any location we assign?', tip: 'Answer honestly — flexibility is often a genuine plus point here.' },
      { q: 'What motivates you to do good work?', tip: 'Give a genuine, specific answer rather than a generic one — interviewers can tell the difference.' },
    ],
  },
  {
    slug: 'amazon',
    name: 'Amazon',
    initials: 'AMZ',
    color: '#FF9900',
    shortDescription: 'Global e-commerce and cloud computing giant, hires SDE roles through a rigorous DSA-focused process.',
    expectedPackage: '₹12 – 44 LPA (SDE-1, varies widely by role/experience)',
    eligibility: ['Strong DSA fundamentals expected', 'B.Tech/B.E/M.Tech in CS or related field (varies by role)', 'No fixed academic cutoff, but consistently strong performance helps'],
    selectionProcess: ['Online Assessment (2 DSA problems + work simulation/behavioral)', 'Technical Interview 1 (DSA)', 'Technical Interview 2 (DSA + LP-based behavioral)', 'Bar Raiser Round (Leadership Principles + technical depth)'],
    preparationTips: ['Master arrays, trees, graphs, and dynamic programming — Amazon\'s bar for DSA is high', 'Learn Amazon\'s 16 Leadership Principles and prepare a STAR-format story for each', 'Practice explaining your thought process out loud, not just arriving at the answer', commonAptitudeTip],
    interviewRounds: productBasedRounds,
    codingQuestions: [
      { title: 'Two Sum', difficulty: 'Easy', year: '2024' },
      { title: 'Merge K sorted lists', difficulty: 'Hard', year: '2024' },
      { title: 'Number of islands (graph traversal)', difficulty: 'Medium', year: '2023' },
      { title: 'LRU Cache design', difficulty: 'Medium', year: '2023' },
      { title: 'Word ladder (BFS shortest path)', difficulty: 'Hard', year: '2022' },
    ],
    technicalQuestions: [
      { subject: 'Data Structures', questions: [
        { q: 'When would you use a heap over a sorted array?', a: 'When you need efficient repeated access to the min/max element with frequent insertions — heaps give O(log n) insert/extract vs O(n) for a sorted array insert.' },
        { q: 'How does a hash map handle collisions?', a: 'Common strategies are chaining (linked lists/trees per bucket) or open addressing (probing for the next free slot).' },
        { q: 'What is the time complexity of common trie operations?', a: 'Insertion, search, and prefix search are all O(L) where L is the length of the word/key.' },
      ]},
      { subject: 'System Design', questions: [
        { q: 'How would you design a URL shortener?', a: 'Hash/encode the long URL to a short key, store the mapping in a fast key-value store, and handle redirects with a lookup + collision handling strategy.' },
        { q: 'How do you handle scaling a read-heavy system?', a: 'Add caching layers (e.g. Redis), read replicas, and CDN caching where applicable to reduce load on the primary database.' },
        { q: 'What is horizontal vs vertical scaling?', a: 'Vertical scaling adds more resources to a single machine; horizontal scaling adds more machines and distributes load across them.' },
      ]},
      { subject: 'Operating System', questions: [
        { q: 'What is context switching?', a: 'The process of saving the state of a running process/thread and loading another, enabling multitasking.' },
        { q: 'What is a race condition?', a: 'A bug that occurs when multiple threads access shared data concurrently and the outcome depends on timing.' },
        { q: 'What is the difference between concurrency and parallelism?', a: 'Concurrency is dealing with multiple tasks making progress in overlapping time periods; parallelism is executing multiple tasks literally at the same time on multiple cores.' },
      ]},
    ],
    hrQuestions: [
      { q: 'Tell me about a time you disagreed with a decision at work/college.', tip: 'Maps to "Have Backbone; Disagree and Commit" — show you spoke up respectfully, then committed once a decision was made.' },
      { q: 'Tell me about a time you went above and beyond for a user/customer.', tip: 'Maps to "Customer Obsession" — use a concrete example, even from a college project or internship.' },
      { q: 'Describe a time you failed. What did you learn?', tip: 'Be genuinely honest about the failure, then focus most of your answer on the concrete lesson and change in behavior.' },
      { q: 'Tell me about a time you had to make a decision with incomplete information.', tip: 'Maps to "Bias for Action" — show your reasoning process, not just the outcome.' },
      { q: 'Why do you want to work at Amazon?', tip: 'Be specific — mention a product, the scale of engineering challenges, or a Leadership Principle that resonates with you.' },
    ],
  },
  {
    slug: 'google',
    name: 'Google',
    initials: 'G',
    color: '#4285F4',
    shortDescription: 'Search, cloud, and consumer technology leader with one of the most selective hiring processes globally.',
    expectedPackage: '₹15 – 50+ LPA (varies significantly by role/level)',
    eligibility: ['Excellent DSA and problem-solving skills expected', 'CS fundamentals depth valued over degree pedigree', 'Strong project or open-source contributions are a plus'],
    selectionProcess: ['Online Assessment (2-3 coding problems)', 'Phone Screen (1-2 rounds of live coding)', 'Onsite/Virtual Onsite (4-5 rounds: coding, system design, googleyness)'],
    preparationTips: ['Practice medium-hard DSA problems daily — consistency matters more than cramming', 'Be ready to write clean, bug-free code on a shared doc with no autocomplete', 'Prepare examples showing "Googleyness" — collaboration, comfort with ambiguity, and humility', commonAptitudeTip],
    interviewRounds: productBasedRounds,
    codingQuestions: [
      { title: 'Longest palindromic substring', difficulty: 'Medium', year: '2024' },
      { title: 'Design a rate limiter', difficulty: 'Hard', year: '2024' },
      { title: 'Serialize and deserialize a binary tree', difficulty: 'Hard', year: '2023' },
      { title: 'Course schedule (topological sort)', difficulty: 'Medium', year: '2023' },
      { title: 'Median of two sorted arrays', difficulty: 'Hard', year: '2022' },
    ],
    technicalQuestions: [
      { subject: 'Algorithms', questions: [
        { q: 'When would you choose BFS over DFS?', a: 'BFS is preferred for finding the shortest path in an unweighted graph; DFS is often simpler for exploring all paths or detecting cycles.' },
        { q: 'How do you approach an optimization problem you don\'t immediately recognize?', a: 'Start with a brute-force solution, identify the bottleneck, and look for patterns (overlapping subproblems, sortedness, monotonicity) that suggest DP, greedy, or a specific data structure.' },
        { q: 'What is the difference between greedy and dynamic programming approaches?', a: 'Greedy makes locally optimal choices without reconsidering them; DP considers overlapping subproblems and combines optimal substructure, often needed when greedy doesn\'t guarantee a global optimum.' },
      ]},
      { subject: 'System Design', questions: [
        { q: 'How would you design a scalable search autocomplete feature?', a: 'Use a trie or precomputed top-K suggestions per prefix, cached in a fast in-memory store, updated periodically from query logs.' },
        { q: 'How do you ensure consistency in a distributed system?', a: 'Choose an appropriate consistency model (strong vs eventual) based on the use case, and use techniques like consensus protocols (Paxos/Raft) where strong consistency is required.' },
        { q: 'What is a load balancer and why is it needed?', a: 'Distributes incoming traffic across multiple servers to prevent any single server from being overwhelmed and to improve availability.' },
      ]},
      { subject: 'Computer Networks', questions: [
        { q: 'What happens during a TCP three-way handshake?', a: 'SYN from client, SYN-ACK from server, ACK from client — establishing a reliable connection before data transfer.' },
        { q: 'What is the difference between a forward proxy and a reverse proxy?', a: 'A forward proxy sits in front of clients and forwards their requests; a reverse proxy sits in front of servers and forwards client requests to them.' },
        { q: 'What is CDN and why does it improve performance?', a: 'A Content Delivery Network caches content at edge locations closer to users, reducing latency.' },
      ]},
    ],
    hrQuestions: [
      { q: 'Tell me about a time you worked with someone difficult.', tip: 'Focus on how you stayed collaborative and found common ground — avoid badmouthing the other person.' },
      { q: 'How do you handle ambiguity in a project?', tip: 'Describe how you break down unclear requirements into smaller, testable assumptions.' },
      { q: 'Why Google?', tip: 'Be specific about a product, the engineering scale, or the kind of problems you want to work on — avoid generic "innovation" answers.' },
      { q: 'Tell me about a project you\'re especially proud of.', tip: 'Pick one with real technical depth you can defend under follow-up questions.' },
      { q: 'How do you stay updated with new technology?', tip: 'Mention specific habits — blogs, courses, personal projects — not just "I read articles".' },
    ],
  },
  {
    slug: 'microsoft',
    name: 'Microsoft',
    initials: 'MS',
    color: '#00A4EF',
    shortDescription: 'Global technology company spanning cloud (Azure), productivity software, and developer tools.',
    expectedPackage: '₹12 – 45 LPA (varies significantly by role/level)',
    eligibility: ['Strong DSA and CS fundamentals expected', 'B.Tech/B.E/M.Tech in CS or related field for most SDE roles', 'Prior internship or strong project portfolio is a plus'],
    selectionProcess: ['Online Assessment (2 coding problems)', 'Technical Interview 1 (DSA)', 'Technical Interview 2 (DSA + design basics)', 'HR / As-Appropriate Round (culture fit + final technical questions)'],
    preparationTips: ['Be very comfortable with arrays, strings, trees, and recursion — these show up constantly', 'Practice explaining trade-offs between different approaches to the same problem', 'Review basic OOP design questions (e.g. design a parking lot, design a library system)', commonAptitudeTip],
    interviewRounds: productBasedRounds,
    codingQuestions: [
      { title: 'Find all subsets of a set (power set)', difficulty: 'Medium', year: '2024' },
      { title: 'Validate a binary search tree', difficulty: 'Medium', year: '2023' },
      { title: 'Rotate an array by K positions', difficulty: 'Easy', year: '2023' },
      { title: 'Clone a graph', difficulty: 'Medium', year: '2022' },
      { title: 'Design a min-stack (O(1) getMin)', difficulty: 'Medium', year: '2022' },
    ],
    technicalQuestions: [
      { subject: 'OOP Design', questions: [
        { q: 'How would you design a parking lot system?', a: 'Model entities like ParkingLot, Level, Spot, and Vehicle with clear responsibilities, using interfaces for different spot/vehicle types and a strategy for spot allocation.' },
        { q: 'What is the SOLID principle set?', a: 'Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion — guidelines for maintainable OOP design.' },
        { q: 'What is composition vs inheritance?', a: 'Composition builds objects from other objects ("has-a"); inheritance builds a hierarchy ("is-a"). Composition is often favored for flexibility.' },
      ]},
      { subject: 'Data Structures', questions: [
        { q: 'How does a balanced BST (like AVL) maintain O(log n) operations?', a: 'It performs rotations after insertions/deletions to keep the height balanced, preventing degeneration into a linked list.' },
        { q: 'What is a trie used for?', a: 'Efficient prefix-based lookups, commonly used in autocomplete and spell-check features.' },
        { q: 'When would you use a doubly linked list over a singly linked list?', a: 'When you need efficient backward traversal or O(1) deletion given a node reference, at the cost of extra memory per node.' },
      ]},
      { subject: 'DBMS', questions: [
        { q: 'What is database indexing and its trade-offs?', a: 'Indexes speed up reads but slow down writes and consume extra storage — a classic space/time trade-off.' },
        { q: 'What is a deadlock in a database context, and how is it resolved?', a: 'Two or more transactions waiting on each other\'s locks indefinitely; databases typically resolve it by detecting the cycle and aborting one transaction.' },
        { q: 'What is the CAP theorem?', a: 'A distributed system can only guarantee two of three: Consistency, Availability, and Partition tolerance, at any given time.' },
      ]},
    ],
    hrQuestions: [
      { q: 'Tell me about yourself.', tip: 'Focus on technical depth and a couple of standout projects relevant to the role.' },
      { q: 'Why Microsoft?', tip: 'Mention specific products (Azure, VS Code, Teams) or Microsoft\'s engineering culture that genuinely interests you.' },
      { q: 'Describe a time you had to convince a teammate of your technical approach.', tip: 'Show respectful, evidence-based persuasion — not just "I was right".' },
      { q: 'How do you handle receiving critical feedback on your code?', tip: 'Show openness and a growth mindset — describe how you\'ve used past feedback constructively.' },
      { q: 'What are you most proud of building?', tip: 'Choose something with real technical depth and be ready for detailed follow-up questions.' },
    ],
  },
];

export function getCompanyBySlug(slug: string): Company | undefined {
  return COMPANIES.find((c) => c.slug === slug);
}
