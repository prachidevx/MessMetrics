export const MEALS = ['Breakfast', 'Lunch', 'Snacks', 'Dinner']
export const TIMES = ['7:30 - 9:30 am', '12:00 - 2:30 pm', '4:30 - 6:30 pm', '7:30 - 9:30 pm']
export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
export const CAPACITY = 450 // students eligible for each meal

export const DEFAULT_WEEKLY_MENU = {
  Monday: {
    Breakfast: ['Idli Sambhar', 'Coconut Chutney', 'Filter Coffee'],
    Lunch: ['Rajma Masala', 'Steamed Rice', 'Tawa Roti', 'Cucumber Salad'],
    Snacks: ['Crispy Samosa', 'Green Mint Chutney', 'Masala Chai'],
    Dinner: ['Aloo Gobi', 'Dal Tadka', 'Phulka Roti', 'Gulab Jamun'],
  },
  Tuesday: {
    Breakfast: ['Poha', 'Bread & Butter', 'Masala Chai'],
    Lunch: ['Shahi Paneer', 'Jeera Rice', 'Tandoori Roti', 'Boondi Raita'],
    Snacks: ['Veg Cutlet', 'Tomato Sauce', 'Hot Ginger Tea'],
    Dinner: ['Mixed Vegetable', 'Dal Makhani', 'Butter Naan', 'Rice Kheer'],
  },
  Wednesday: {
    Breakfast: ['Masala Dosa', 'Sambhar', 'Green Chutney', 'Tea'],
    Lunch: ['Chole Bhature', 'Plain Rice', 'Onion Salad', 'Pickle'],
    Snacks: ['Bread Pakoda', 'Sweet Imli Chutney', 'Cardamom Tea'],
    Dinner: ['Palak Paneer', 'Yellow Dal', 'Chapati', 'Fruit Custard'],
  },
  Thursday: {
    Breakfast: ['Aloo Paratha', 'Curd', 'Pickle', 'Masala Chai'],
    Lunch: ['Kadhi Pakoda', 'Steamed Rice', 'Aloo Bhindi', 'Roti'],
    Snacks: ['Sev Bhel Puri', 'Crispy Papdi', 'Masala Chai'],
    Dinner: ['Veg Biryani', 'Mirchi Ka Salan', 'Raita', 'Moong Dal Halwa'],
  },
  Friday: {
    Breakfast: ['Veg Upma', 'Coconut Chutney', 'Filter Coffee'],
    Lunch: ['Paneer Butter Masala', 'Dal Fry', 'Tawa Roti', 'Veg Pulao'],
    Snacks: ['Crispy Onion Pakoda', 'Mint Dip', 'Filter Coffee'],
    Dinner: ['Dal Palak', 'Jeera Rice', 'Butter Roti', 'Sewaiyan Kheer'],
  },
  Saturday: {
    Breakfast: ['Puri Bhaji', 'Suji Halwa', 'Masala Chai'],
    Lunch: ['Veg Pulao', 'Curd Rice', 'Papad', 'Mixed Veg Curry'],
    Snacks: ['Grilled Veg Sandwich', 'Potato Chips', 'Chai'],
    Dinner: ['Paneer Do Pyaza', 'Dal Tadka', 'Missi Roti', 'Ice Cream'],
  },
  Sunday: {
    Breakfast: ['Chole Kulche', 'Sweet Lassi', 'Fresh Fruit Bowl'],
    Lunch: ['Paneer Lababdar', 'Dal Makhani', 'Veg Pulao', 'Butter Naan'],
    Snacks: ['White Sauce Veg Pasta', 'Garlic Bread', 'Cold Coffee / Tea'],
    Dinner: ['Pav Bhaji', 'Tawa Pulao', 'Green Salad', 'Fruit Custard'],
  },
}

export function getTodayDayName() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[new Date().getDay()]
}

export const SEED = {
  role: null, // null = portal landing / role selection; 'student' or 'staff'
  user: '',
  view: 'dash',
  weeklyMenu: DEFAULT_WEEKLY_MENU,
  menu: [
    ['Poha', 'Bread & Butter', 'Masala Chai'],
    ['Shahi Paneer', 'Jeera Rice', 'Tandoori Roti', 'Boondi Raita'],
    ['Veg Cutlet', 'Tomato Sauce', 'Hot Ginger Tea'],
    ['Mixed Vegetable', 'Dal Makhani', 'Butter Naan', 'Rice Kheer'],
  ],
  // Recent days attendance and waste (stored for months) - 4 values per day [B, L, S, D]
  historyDays: [],
  att: [
    [310, 398, 280, 372],
    [325, 405, 290, 380],
    [298, 392, 275, 368],
    [305, 388, 285, 362],
    [290, 380, 270, 355],
    [335, 420, 305, 395],
    [320, 410, 295, 385],
  ],
  waste: [
    [4, 10, 3.5, 7],
    [6, 11, 4.0, 9],
    [5, 9, 3.0, 6],
    [4, 13, 4.5, 8],
    [3, 8, 3.0, 7],
    [6, 12, 4.5, 10],
    [5, 12, 3.5, 8],
  ],
  ratings: [
    { sum: 163, count: 48 },
    { sum: 242, count: 62 },
    { sum: 185, count: 45 },
    { sum: 198, count: 55 },
  ],
  mine: [0, 0, 0, 0],
}

export const sum = (a) => (Array.isArray(a) ? a.reduce((x, y) => x + (Number(y) || 0), 0) : 0)
export const avgRating = (ratings, m) =>
  ratings[m]?.count > 0 ? ratings[m].sum / ratings[m].count : 4.0

export function computeStats({ att = [], waste = [], ratings = [] }) {
  const numDays = Math.max(1, att.length)
  const attByMeal = MEALS.map((_, m) => sum(att.map((d) => d[m])))
  const wasteByMeal = MEALS.map((_, m) => sum(waste.map((d) => d[m])))
  const skipPct = attByMeal.map((t) =>
    Math.max(0, Math.min(100, Math.round((1 - t / (CAPACITY * numDays)) * 100)))
  )
  const avgs = MEALS.map((_, m) => avgRating(ratings, m))
  const idx = [0, 1, 2, 3]

  return {
    attByMeal,
    wasteByMeal,
    skipPct,
    avgs,
    dailyWaste: waste.map(sum),
    best: idx.reduce((a, b) => (avgs[b] > avgs[a] ? b : a)),
    mostSkipped: idx.reduce((a, b) => (skipPct[b] > skipPct[a] ? b : a)),
    byRatingAsc: [...idx].sort((a, b) => avgs[a] - avgs[b]),
    bySkipDesc: [...idx].sort((a, b) => skipPct[b] - skipPct[a]),
  }
}
