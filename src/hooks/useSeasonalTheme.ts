import { useState, useEffect } from 'react';

export interface ThemeConfig {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgColor: string;
  fontSerif?: string;
  trivia: string[];
}

const THEMES: Record<number, ThemeConfig> = {
  0: { // January
    id: 'january',
    name: 'New Year',
    primaryColor: '#D4AF37', // Gold
    secondaryColor: '#1A1A1A', // Black
    accentColor: '#FDFCFB',
    bgColor: '#FDFCFB',
    trivia: [
      "Do you know? January is named after Janus, the god of beginnings and transitions.",
      "In many cultures, eating round fruits on New Year's Day brings good luck.",
      "Chinese New Year celebrations often fall in late January or February."
    ]
  },
  1: { // February
    id: 'february',
    name: 'Love Month',
    primaryColor: '#E0115F', // Ruby
    secondaryColor: '#FFB7C5', // Pink
    accentColor: '#FFF0F5',
    bgColor: '#FDFCFB',
    trivia: [
      "Do you know? St. Valentine's Day was originally a liturgical celebration.",
      "The oldest known valentine still in existence today was a poem written in 1415.",
      "Approximately 150 million Valentine's Day cards are exchanged annually."
    ]
  },
  2: { // March
    id: 'march',
    name: 'Women\'s Month',
    primaryColor: '#800080', // Purple
    secondaryColor: '#E6E6FA', // Lavender
    accentColor: '#F8F8FF',
    bgColor: '#FDFCFB',
    trivia: [
      "Do you know? International Women's Day has been observed since the early 1900s.",
      "March was named after Mars, the Roman god of war, but it's now a month of peace and advocacy.",
      "Purple, green, and white are the colors of International Women's Day."
    ]
  },
  3: { // April
    id: 'april',
    name: 'Spring Season',
    primaryColor: '#4CBB17', // Kelly Green
    secondaryColor: '#FFEFD5', // Papaya Whip
    accentColor: '#F0FFF0',
    bgColor: '#FDFCFB',
    trivia: [
      "Do you know? The word 'April' comes from the Latin 'aperire', meaning 'to open' (like buds).",
      "April is national poetry month in several countries.",
      "The first modern Olympic Games were held in April 1896 in Athens."
    ]
  },
  4: { // May
    id: 'may',
    name: 'Flores de Mayo',
    primaryColor: '#FF69B4', // Hot Pink
    secondaryColor: '#FFD700', // Gold
    accentColor: '#FFF5EE',
    bgColor: '#FDFCFB',
    trivia: [
      "Do you know? Flores de Mayo is a festival held in the Philippines in honor of the Virgin Mary.",
      "May is named after Maia, the Greek goddess of fertility.",
      "The 'Santacruzan' is the highlight of Flores de Mayo, featuring a rhythmic procession."
    ]
  },
  5: { // June
    id: 'june',
    name: 'Wedding Month',
    primaryColor: '#F4C2C2', // Baby Pink
    secondaryColor: '#708090', // Slate Gray
    accentColor: '#F5F5F5',
    bgColor: '#FDFCFB',
    trivia: [
      "Do you know? June is the month with the longest daylight hours in the Northern Hemisphere.",
      "June weddings are popular because of the Roman goddess Juno, patroness of marriage.",
      "The strawberry moon usually appears in June."
    ]
  },
  6: { // July
    id: 'july',
    name: 'Summer Zenith',
    primaryColor: '#FF4500', // Orange Red
    secondaryColor: '#4682B4', // Steel Blue
    accentColor: '#FFF8DC',
    bgColor: '#FDFCFB',
    trivia: [
      "Do you know? July was named after Julius Caesar by the Roman Senate.",
      "July is often the hottest month of the year in the Northern Hemisphere.",
      "The first moon landing occurred on July 20, 1969."
    ]
  },
  7: { // August
    id: 'august',
    name: 'Harvest Month',
    primaryColor: '#DAA520', // Goldenrod
    secondaryColor: '#556B2F', // Dark Olive Green
    accentColor: '#F5F5DC',
    bgColor: '#FDFCFB',
    trivia: [
      "Do you know? August was named after the first Roman emperor, Augustus.",
      "In many cultures, August is the time for the first harvest festivals.",
      "The Perseid meteor shower peaks in mid-August every year."
    ]
  },
  8: { // September
    id: 'september',
    name: 'Serene Autumn',
    primaryColor: '#8B4513', // Saddle Brown
    secondaryColor: '#F0E68C', // Khaki
    accentColor: '#FFFACD',
    bgColor: '#FDFCFB',
    trivia: [
      "Do you know? September marks the start of autumn in the Northern Hemisphere.",
      "The name September comes from the Latin 'septem', meaning seven (as it was the 7th month).",
      "September is National Library Card Sign-up Month."
    ]
  },
  9: { // October
    id: 'october',
    name: 'Mystic Month',
    primaryColor: '#FF8C00', // Dark Orange
    secondaryColor: '#4B0082', // Indigo
    accentColor: '#FFF5E6',
    bgColor: '#FDFCFB',
    trivia: [
      "Do you know? October is famous for Halloween and the harvest moon.",
      "The traditional birthstones for October are opal and tourmaline.",
      "In the original Roman calendar, October was the eighth month."
    ]
  },
  10: { // November
    id: 'november',
    name: 'Gratitude Month',
    primaryColor: '#A52A2A', // Brown
    secondaryColor: '#BC8F8F', // Rosy Brown
    accentColor: '#FFF0F0',
    bgColor: '#FDFCFB',
    trivia: [
      "Do you know? November is a month of remembrance and gratitude in many cultures.",
      "The Anglo-Saxons called November 'Blodmonath' or 'blood month'.",
      "World Kindness Day is celebrated on November 13th."
    ]
  },
  11: { // December
    id: 'december',
    name: 'Yuletide Season',
    primaryColor: '#006400', // Dark Green
    secondaryColor: '#B22222', // Firebrick
    accentColor: '#F0FFF0',
    bgColor: '#FDFCFB',
    trivia: [
      "Do you know? December hosts the winter solstice, the shortest day of the year.",
      "The word 'Yuletide' comes from the Old Norse word 'Jol', a midwinter festival.",
      "Sending Christmas cards started in the UK in 1843."
    ]
  }
};

const getSpecialTheme = (date: Date): ThemeConfig | null => {
  const month = date.getMonth();
  const day = date.getDate();

  // Chinese New Year 2026 (approx Jan 29)
  if (month === 0 && day >= 25 && day <= 31) {
    return {
      id: 'cny',
      name: 'Chinese New Year',
      primaryColor: '#FF0000', // Red
      secondaryColor: '#FFD700', // Gold
      accentColor: '#FFF5F5',
      bgColor: '#FDFCFB',
      trivia: [
        "Do you know? The red color in Chinese New Year symbolizes good fortune and joy.",
        "2026 is the Year of the Horse in the Chinese Zodiac.",
        "The Lunar New Year is also known as the Spring Festival."
      ]
    };
  }

  // St. Patrick's Day (March 17)
  if (month === 2 && day >= 14 && day <= 18) {
    return {
      id: 'stpatricks',
      name: 'St. Patrick\'s Day',
      primaryColor: '#009A44', // Green
      secondaryColor: '#FFFFFF', // White
      accentColor: '#F0FFF4',
      bgColor: '#FDFCFB',
      trivia: [
        "Do you know? St. Patrick used the three-leaved shamrock to explain the Holy Trinity.",
        "The first St. Patrick's Day parade actually took place in America, not Ireland.",
        "Blue was the original color associated with St. Patrick, not green!"
      ]
    };
  }

  // Earth Day (April 22)
  if (month === 3 && day >= 20 && day <= 24) {
    return {
      id: 'earthday',
      name: 'Earth Day',
      primaryColor: '#2E8B57', // Sea Green
      secondaryColor: '#87CEEB', // Sky Blue
      accentColor: '#F0FFFF',
      bgColor: '#FDFCFB',
      trivia: [
        "Do you know? The first Earth Day was held in 1970 and helped launch the modern environmental movement.",
        "Over 1 billion people in 192 countries now participate in Earth Day activities each year.",
        "Earth Day was renaming the 'International Mother Earth Day' by the UN in 2009."
      ]
    };
  }

  // Pride Month (June)
  if (month === 5) {
    return {
      id: 'pride',
      name: 'Pride Month',
      primaryColor: '#E40303', // Rainbow Start
      secondaryColor: '#FF8C00', 
      accentColor: '#FFF5E6',
      bgColor: '#FDFCFB',
      trivia: [
        "Do you know? Gilbert Baker designed the first rainbow flag in 1978.",
        "Pride Month commemorates the 1969 Stonewall Uprising in Manhattan.",
        "The colors of the original pride flag each had a meaning: hot pink for sex, red for life, orange for healing, etc."
      ]
    };
  }

  // International Day of Peace (September 21)
  if (month === 8 && day >= 19 && day <= 23) {
    return {
      id: 'peace',
      name: 'Peace Day',
      primaryColor: '#F0F8FF', // Alice Blue
      secondaryColor: '#4682B4', // Steel Blue
      accentColor: '#FFFFFF',
      bgColor: '#FDFCFB',
      trivia: [
        "Do you know? The Peace Bell was donated by the United Nations Association of Japan in 1954.",
        "The International Day of Peace was established in 1981 by the UN General Assembly.",
        "To inaugurate the day, the Peace Bell is rung at UN Headquarters in New York."
      ]
    };
  }

  // World Mental Health Day (October 10)
  if (month === 9 && day >= 8 && day <= 12) {
    return {
      id: 'mentalhealth',
      name: 'Mental Health Month',
      primaryColor: '#00FF00', // Lime Green (World Mental Health Day color)
      secondaryColor: '#006400', 
      accentColor: '#F5FFF5',
      bgColor: '#FDFCFB',
      trivia: [
        "Do you know? The green ribbon is the international symbol of mental health awareness.",
        "World Mental Health Day was first celebrated in 1992 at the initiative of the World Federation for Mental Health.",
        "Mental health is just as important as physical health. It's okay to not be okay."
      ]
    };
  }

  // Halloween (October 31)
  if (month === 9 && day >= 28 && day <= 31) {
    return {
      id: 'halloween',
      name: 'Halloween',
      primaryColor: '#FF8C00', // Dark Orange
      secondaryColor: '#000000', // Black
      accentColor: '#FEF3E2',
      bgColor: '#FDFCFB',
      trivia: [
        "Do you know? Samhain is the ancient Celtic festival that Halloween originated from.",
        "Jack-o'-lanterns were originally made out of turnips, not pumpkins.",
        "The word 'Halloween' is a contraction of 'All Hallows' Eve'."
      ]
    };
  }

  return null;
};

export const useSeasonalTheme = () => {
  const currentMonth = new Date().getMonth();
  const currentDayOfWeek = new Date().getDay();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayNames = days[currentDayOfWeek];
  
  const weeklyTriviaMap: Record<string, string[]> = {
    'Monday': [
      "Do you know? Today is Awareness Day. Share something that helps other members' mental health!",
      "Do you know? Monday is often called 'Blue Monday', but let's make it 'Bright Monday'!",
      "Do you know? Modern humans have a higher risk of stress on Mondays, let's keep it calm."
    ],
    'Tuesday': [
      "Do you know? It's Sharing Day. Your life experiences could be a great lesson for others.",
      "Do you know? Giving Tuesday originated as a day to encourage people to do good.",
      "Do you know? Tuesday is the most productive day of the work week according to surveys."
    ],
    'Wednesday': [
      "Do you know? Today is English Day from 6am to 6pm. Let's practice together!",
      "Do you know? Wednesday is 'Hump Day', marking the peak of the week's challenges.",
      "Do you know? The name Wednesday comes from Woden, a Norse god of wisdom."
    ],
    'Thursday': [
      "Do you know? It's Activity Day. Join a group of 5-10 members to earn a certificate!",
      "Do you know? Early Christians used Thursdays for commemorative meals.",
      "Do you know? Throwback Thursday (#TBT) is one of the most popular social media trends."
    ],
    'Friday': [
      "Do you know? Today is Tagalog Day. Try to express yourself in our national language!",
      "Do you know? 'TGIF' expresses the relief of reaching the end of the work week.",
      "Do you know? Friday is named after Frigg, the Norse goddess of love and family."
    ],
    'Saturday': [
      "Do you know? It's Moderators' Day. Thank our mods for their hard work and join the games at 5pm!",
      "Do you know? Saturday is traditionally a day of rest and social gatherings.",
      "Do you know? The weekend as we know it wasn't standardized until the early 20th century."
    ],
    'Sunday': [
      "Do you know? Today is No Cursing Day. Let's keep our environment clean and conyo!",
      "Do you know? Sunday is the 'Day of the Sun' in many cultures and languages.",
      "Do you know? Sunday is a great time to refuel your soul and be grateful for your blessings."
    ]
  };

  const getRandomWeeklyTrivia = () => {
    const options = weeklyTriviaMap[dayNames];
    if (!options) return "";
    return options[Math.floor(Math.random() * options.length)];
  };

  const getWorldwideTrivia = (date: Date) => {
    const m = date.getMonth();
    const d = date.getDate();
    const worldTrivia: string[] = [];

    if (m === 0 && d === 4) worldTrivia.push("Do you know? Today is World Braille Day, celebrating the birth of Louis Braille.");
    if (m === 0 && d === 24) worldTrivia.push("Do you know? Today is International Day of Education.");
    if (m === 1 && d === 4) worldTrivia.push("Do you know? Today is World Cancer Day, raising awareness for prevention.");
    if (m === 2 && d === 14) worldTrivia.push("Do you know? Today is Pi Day! 3.14 reflects the mathematical constant.");
    if (m === 3 && d === 23) worldTrivia.push("Do you know? Today is World Book Day. What are you reading?");
    if (m === 4 && d === 1) worldTrivia.push("Do you know? Today is International Workers' Day, also known as May Day.");
    if (m === 5 && d === 5) worldTrivia.push("Do you know? Today is World Environment Day.");
    if (m === 7 && d === 12) worldTrivia.push("Do you know? Today is International Youth Day.");
    if (m === 10 && d === 20) worldTrivia.push("Do you know? Today is World Children's Day, promoting international togetherness.");
    if (m === 11 && d === 10) worldTrivia.push("Do you know? Today is Human Rights Day, commemorating the UDHR adoption.");

    return worldTrivia;
  };

  const getEnhancedTrivia = (baseTh: ThemeConfig) => {
    const et = [...baseTh.trivia];
    const wt = getRandomWeeklyTrivia();
    if (wt) et.push(wt);
    
    const worldT = getWorldwideTrivia(new Date());
    et.push(...worldT);
    
    return et;
  };

  const initialTheme = getSpecialTheme(new Date()) || THEMES[currentMonth];
  const [theme, setTheme] = useState<ThemeConfig>(initialTheme);
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [allTrivia, setAllTrivia] = useState<string[]>(getEnhancedTrivia(initialTheme));

  useEffect(() => {
    const month = new Date().getMonth();
    const currentTh = getSpecialTheme(new Date()) || THEMES[month];
    setTheme(currentTh);
    setAllTrivia(getEnhancedTrivia(currentTh));

    const interval = setInterval(() => {
      setTriviaIndex(prev => (prev + 1) % allTrivia.length);
    }, 30000);

    return () => clearInterval(interval);
  }, [allTrivia.length]);

  useEffect(() => {
    if (theme) {
      document.documentElement.style.setProperty('--color-bento-primary', theme.primaryColor);
      document.documentElement.style.setProperty('--color-bento-secondary', theme.secondaryColor);
      document.documentElement.style.setProperty('--color-bento-accent', theme.accentColor);
    }
  }, [theme]);

  const currentTrivia = allTrivia[triviaIndex];

  return { theme, currentTrivia };
};
