// Hadith API — https://ahadith.co.uk/api
// Backup: https://api.sunnah.com (requires key for full access)

const BASE = 'https://ahadith.co.uk/api'

// Get a random hadith
export const getRandomHadith = async () => {
  try {
    // Random hadith from Sahih Bukhari (book 1, various hadiths)
    const randomId = Math.floor(Math.random() * 7000) + 1
    const res      = await fetch(`${BASE}/hadith/${randomId}`)
    const json     = await res.json()
    if (json && json.hadith) return json
    return getFallbackHadith()
  } catch {
    return getFallbackHadith()
  }
}

// Curated hadiths about worship, discipline, and self-improvement
const CURATED_HADITHS = [
  {
    hadith: "The most beloved deeds to Allah are those done regularly, even if they are few.",
    narrator: "Aisha (RA)",
    source: "Sahih Bukhari",
    arabic: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ",
  },
  {
    hadith: "None of you truly believes until he loves for his brother what he loves for himself.",
    narrator: "Anas ibn Malik (RA)",
    source: "Sahih Bukhari",
    arabic: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
  },
  {
    hadith: "Take advantage of five before five: your youth before old age, health before sickness, wealth before poverty, free time before busyness, and life before death.",
    narrator: "Ibn Abbas (RA)",
    source: "Shu'ab al-Iman",
    arabic: "اغْتَنِمْ خَمْسًا قَبْلَ خَمْسٍ",
  },
  {
    hadith: "Make things easy and do not make them difficult. Cheer people up and do not drive them away.",
    narrator: "Anas ibn Malik (RA)",
    source: "Sahih Bukhari",
    arabic: "يَسِّرُوا وَلَا تُعَسِّرُوا، وَبَشِّرُوا وَلَا تُنَفِّرُوا",
  },
  {
    hadith: "The strong man is not the one who wrestles others. The strong man is the one who controls himself when he is angry.",
    narrator: "Abu Hurairah (RA)",
    source: "Sahih Bukhari",
    arabic: "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ",
  },
  {
    hadith: "Whoever prays the two cool prayers (Fajr and Asr) will enter Paradise.",
    narrator: "Abu Musa (RA)",
    source: "Sahih Bukhari",
    arabic: "مَنْ صَلَّى الْبَرْدَيْنِ دَخَلَ الْجَنَّةَ",
  },
  {
    hadith: "There are two blessings which many people waste: health and free time.",
    narrator: "Ibn Abbas (RA)",
    source: "Sahih Bukhari",
    arabic: "نِعْمَتَانِ مَغْبُونٌ فِيهِمَا كَثِيرٌ مِنَ النَّاسِ: الصِّحَّةُ وَالْفَرَاغُ",
  },
  {
    hadith: "Perform Salah before it is performed for you (i.e. your funeral prayer).",
    narrator: "Omar ibn Al-Khattab (RA)",
    source: "Various",
    arabic: "صَلُّوا قَبْلَ أَنْ يُصَلَّى عَلَيْكُمْ",
  },
]

export const getFallbackHadith = () => {
  return CURATED_HADITHS[Math.floor(Math.random() * CURATED_HADITHS.length)]
}

export const getHadithForContext = (context) => {
  const contextMap = {
    missed_salat:   [5, 7],
    missed_quran:   [0, 2],
    streak_achieved:[1, 3],
    fasting:        [2, 6],
    default:        [0, 1, 2, 3, 4, 5, 6, 7],
  }
  const indices = contextMap[context] || contextMap.default
  const idx     = indices[Math.floor(Math.random() * indices.length)]
  return CURATED_HADITHS[idx]
}
