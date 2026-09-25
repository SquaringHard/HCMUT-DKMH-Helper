const selectedCourses = new Map();
const EMPTY_DAY = Array(17).fill(false);
const TIME_SLOTS = [
    "06:00 – 06:50",
    "07:00 – 07:50",
    "08:00 – 08:50",
    "09:00 – 09:50",
    "10:00 – 10:50",
    "11:00 – 11:50",
    "12:00 – 12:50",
    "13:00 – 13:50",
    "14:00 – 14:50",
    "15:00 – 15:50",
    "16:00 – 16:50",
    "17:00 – 17:50",
    "18:00 – 18:50",
    "18:50 – 19:40",
    "19:40 – 20:30",
    "20:30 – 21:20",
    "21:20 – 22:10"
];
const COURSE_COLORS = [
    { bg: "#e3f2fd", border: "#90caf9", text: "#0d47a1" },
    { bg: "#e8f5e9", border: "#a5d6a7", text: "#1b5e20" },
    { bg: "#fff3e0", border: "#ffcc80", text: "#e65100" },
    { bg: "#f3e5f5", border: "#ce93d8", text: "#4a148c" },
    { bg: "#fce4ec", border: "#f48fb1", text: "#880e4f" },
    { bg: "#e0f2f1", border: "#80cbc4", text: "#004d40" },
    { bg: "#fffde7", border: "#fff59d", text: "#f57f17" },
    { bg: "#efebe9", border: "#bcaaa4", text: "#3e2723" },
    { bg: "#eceff1", border: "#b0bec5", text: "#263238" },
    { bg: "#f1f8e9", border: "#c5e1a5", text: "#33691e" }
];
let sortedSchedules = [];
let currentScheduleIndex = 0;
let displayScheduleNode = null;