// Al-Quran Cloud API — https://alquran.cloud/api

const BASE = 'https://api.alquran.cloud/v1'

// Juz metadata (1-30)
export const JUZ_META = Array.from({ length: 30 }, (_, i) => ({
  number: i + 1,
  name:   `Juz ${i + 1}`,
}))

// Fetch a specific Juz (Arabic + English)
export const getJuz = async (juzNumber) => {
  const [arRes, enRes] = await Promise.all([
    fetch(`${BASE}/juz/${juzNumber}/quran-uthmani`),
    fetch(`${BASE}/juz/${juzNumber}/en.asad`),
  ])
  const [ar, en] = await Promise.all([arRes.json(), enRes.json()])
  return { arabic: ar.data, english: en.data }
}

// Fetch a random ayah (for daily card)
export const getRandomAyah = async () => {
  const randomSurah  = Math.floor(Math.random() * 114) + 1
  const randomAyah   = Math.floor(Math.random() * 6) + 1
  const [arRes, enRes] = await Promise.all([
    fetch(`${BASE}/ayah/${randomSurah}:${randomAyah}/quran-uthmani`),
    fetch(`${BASE}/ayah/${randomSurah}:${randomAyah}/en.asad`),
  ])
  const [ar, en] = await Promise.all([arRes.json(), enRes.json()])
  return {
    arabic:      ar.data?.text,
    english:     en.data?.text,
    surah:       ar.data?.surah?.englishName,
    surahArabic: ar.data?.surah?.name,
    ayahNum:     ar.data?.numberInSurah,
    reference:   `${ar.data?.surah?.englishName} ${ar.data?.numberInSurah}`,
  }
}

// Fetch Surah Al-Fatiha for adhkar opening
export const getFatiha = async () => {
  const [arRes, enRes] = await Promise.all([
    fetch(`${BASE}/surah/1/quran-uthmani`),
    fetch(`${BASE}/surah/1/en.asad`),
  ])
  const [ar, en] = await Promise.all([arRes.json(), enRes.json()])
  return { arabic: ar.data, english: en.data }
}
