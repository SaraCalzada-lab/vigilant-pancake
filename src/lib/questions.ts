export interface BaseQuestion {
  id: number;
  text: string;
  timeLimit?: number;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple_choice";
  options: [string, string, string, string];
  correctIndex: number;
}

export interface OrderingItem {
  id: string;
  imageUrl: string;
  label: string;
  correctPosition: number;
}

export interface OrderingQuestion extends BaseQuestion {
  type: "ordering";
  items: OrderingItem[];
}

export interface TypingBlitzQuestion extends BaseQuestion {
  type: "typing_blitz";
  validAnswers: string[];
  revealDuration?: number; // seconds; default TYPING_BLITZ_REVEAL_DURATION
  pointsPerAnswer?: number; // default TYPING_BLITZ_POINTS_PER_ANSWER
}

export type Question = MultipleChoiceQuestion | OrderingQuestion | TypingBlitzQuestion;

export const QUESTIONS: Question[] = [
  {
    id: 1,
    type: "multiple_choice",
    text: "What planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctIndex: 1,
  },
  {
    id: 2,
    type: "multiple_choice",
    text: "What is the largest ocean on Earth?",
    options: ["Atlantic", "Indian", "Arctic", "Pacific"],
    correctIndex: 3,
  },
  {
    id: 3,
    type: "multiple_choice",
    text: "In what year did the first iPhone launch?",
    options: ["2005", "2006", "2007", "2008"],
    correctIndex: 2,
  },
  {
    id: 4,
    type: "multiple_choice",
    text: "Which element has the chemical symbol 'O'?",
    options: ["Gold", "Osmium", "Oxygen", "Oganesson"],
    correctIndex: 2,
  },
  {
    id: 5,
    type: "multiple_choice",
    text: "What is the capital of Japan?",
    options: ["Osaka", "Kyoto", "Hiroshima", "Tokyo"],
    correctIndex: 3,
  },
  {
    id: 6,
    type: "ordering",
    text: "Order these planets from closest to farthest from the Sun",
    items: [
      { id: "mercury", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Mercury_in_color_-_Prockter07-edit1.jpg/220px-Mercury_in_color_-_Prockter07-edit1.jpg", label: "Mercury", correctPosition: 0 },
      { id: "venus", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Venus_Real_Color_%28Mosaic%29.jpg/220px-Venus_Real_Color_%28Mosaic%29.jpg", label: "Venus", correctPosition: 1 },
      { id: "earth", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/The_Blue_Marble_%28remastered%29.jpg/220px-The_Blue_Marble_%28remastered%29.jpg", label: "Earth", correctPosition: 2 },
      { id: "mars", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Mars_-_August_30_2021_-_Flickr_-_Kevin_M._Gill.png/220px-Mars_-_August_30_2021_-_Flickr_-_Kevin_M._Gill.png", label: "Mars", correctPosition: 3 },
      { id: "jupiter", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Jupiter_New_Horizons.jpg/220px-Jupiter_New_Horizons.jpg", label: "Jupiter", correctPosition: 4 },
    ],
  },
  {
    id: 7,
    type: "multiple_choice",
    text: "How many legs does a spider have?",
    options: ["6", "8", "10", "12"],
    correctIndex: 1,
  },
  {
    id: 8,
    type: "multiple_choice",
    text: "Who painted the Mona Lisa?",
    options: ["Michelangelo", "Raphael", "Da Vinci", "Botticelli"],
    correctIndex: 2,
  },
  {
    id: 9,
    type: "ordering",
    text: "Order these animals from smallest to largest",
    items: [
      { id: "mouse", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Mouse_white_background.jpg/220px-Mouse_white_background.jpg", label: "Mouse", correctPosition: 0 },
      { id: "cat", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/220px-Cat03.jpg", label: "Cat", correctPosition: 1 },
      { id: "dog", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/YellowLabradorLooking_new.jpg/220px-YellowLabradorLooking_new.jpg", label: "Dog", correctPosition: 2 },
      { id: "horse", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Nokota_Horses_cropped.jpg/220px-Nokota_Horses_cropped.jpg", label: "Horse", correctPosition: 3 },
      { id: "elephant", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/African_Bush_Elephant.jpg/220px-African_Bush_Elephant.jpg", label: "Elephant", correctPosition: 4 },
    ],
  },
  {
    id: 10,
    type: "multiple_choice",
    text: "What is the fastest land animal?",
    options: ["Lion", "Cheetah", "Gazelle", "Greyhound"],
    correctIndex: 1,
  },
  {
    id: 11,
    type: "multiple_choice",
    text: "Which language was created by Brendan Eich in 10 days?",
    options: ["Python", "Java", "JavaScript", "Ruby"],
    correctIndex: 2,
  },
  {
    id: 12,
    type: "ordering",
    text: "Order these historical events from earliest to latest",
    items: [
      { id: "pyramids", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Kheops-Pyramid.jpg/220px-Kheops-Pyramid.jpg", label: "Great Pyramid Built", correctPosition: 0 },
      { id: "rome", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Rome_Colosseum_interior.jpg/220px-Rome_Colosseum_interior.jpg", label: "Roman Colosseum", correctPosition: 1 },
      { id: "printing", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/PrintMus_038.jpg/220px-PrintMus_038.jpg", label: "Printing Press", correctPosition: 2 },
      { id: "moon", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Aldrin_Apollo_11_original.jpg/220px-Aldrin_Apollo_11_original.jpg", label: "Moon Landing", correctPosition: 3 },
    ],
  },
  {
    id: 13,
    type: "multiple_choice",
    text: "What is the smallest country in the world by area?",
    options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
    correctIndex: 1,
  },
  {
    id: 14,
    type: "typing_blitz",
    text: "Type as many actors who appear in The Avengers (2012) as you can",
    validAnswers: [
      "robert downey jr",
      "chris evans",
      "mark ruffalo",
      "chris hemsworth",
      "scarlett johansson",
      "jeremy renner",
      "samuel l jackson",
      "tom hiddleston",
      "clark gregg",
      "cobie smulders",
      "gwyneth paltrow",
      "stellan skarsgard",
    ],
  },
  {
    id: 15,
    type: "typing_blitz",
    text: "Type as many countries in South America as you can",
    validAnswers: [
      "argentina",
      "bolivia",
      "brazil",
      "chile",
      "colombia",
      "ecuador",
      "guyana",
      "paraguay",
      "peru",
      "suriname",
      "uruguay",
      "venezuela",
    ],
  },
  {
    id: 16,
    type: "typing_blitz",
    text: "Type as many planets in our solar system as you can",
    validAnswers: [
      "mercury",
      "venus",
      "earth",
      "mars",
      "jupiter",
      "saturn",
      "uranus",
      "neptune",
    ],
  },
];

import type { GameConfig, QuestionMode } from "./game-state";

export function getAvailableCounts(modes: QuestionMode[]): { min: number; max: number } {
  const filtered = QUESTIONS.filter((q) => modes.includes(q.type));
  return { min: Math.min(1, filtered.length), max: filtered.length };
}

export function selectQuestions(config: GameConfig): Question[] {
  const filtered = QUESTIONS.filter((q) => config.modes.includes(q.type));
  const shuffled = shuffleItems(filtered);
  return shuffled.slice(0, Math.min(config.questionCount, shuffled.length));
}

export const MC_TIME_LIMIT = 15;
export const ORDERING_TIME_LIMIT = 25;
export const TYPING_BLITZ_TIME_LIMIT = 25;
export const DEFAULT_REVEAL_DURATION = 4;
export const TYPING_BLITZ_REVEAL_DURATION = 10;
export const TYPING_BLITZ_POINTS_PER_ANSWER = 10;

export function getTimeLimit(question: Question): number {
  if (question.timeLimit) return question.timeLimit;
  switch (question.type) {
    case "ordering":
      return ORDERING_TIME_LIMIT;
    case "typing_blitz":
      return TYPING_BLITZ_TIME_LIMIT;
    default:
      return MC_TIME_LIMIT;
  }
}

/** How long the results/reveal screen holds before advancing to the leaderboard. */
export function getRevealDuration(question: Question): number {
  if (question.type === "typing_blitz") {
    return question.revealDuration ?? TYPING_BLITZ_REVEAL_DURATION;
  }
  return DEFAULT_REVEAL_DURATION;
}

export function getPointsPerAnswer(question: TypingBlitzQuestion): number {
  return question.pointsPerAnswer ?? TYPING_BLITZ_POINTS_PER_ANSWER;
}

/** Fisher-Yates shuffle that guarantees result differs from input order */
export function shuffleItems<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  // If shuffle produced the same order, swap first two
  const isSame = shuffled.every((item, idx) => item === items[idx]);
  if (isSame && shuffled.length > 1) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }
  return shuffled;
}
