import { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Pause, SkipForward, SkipBack, Radio, RefreshCw } from 'lucide-react'

// ─── RECITERS ────────────────────────────────────────────────────────────────
const RECITERS = [
  { id: 'Alafasy_128kbps',               name: 'Mishary Alafasy',      flag: '🇰🇼', networkId: 'ar.alafasy' },
  { id: 'Abdurrahmaan_As-Sudais_192kbps', name: 'As-Sudais',            flag: '🇸🇦', networkId: 'ar.abdurrahmaansudais' },
  { id: 'Maher_AlMuaiqly_128kbps',        name: 'Maher Al Muaiqly',     flag: '🇸🇦', networkId: 'ar.maheralmuaiqly' },
  { id: 'Minshawi_Mujawwad_128kbps',      name: 'Al-Minshawi',          flag: '🇪🇬', networkId: 'ar.minshawi' },
]

// ─── MORNING ADHKAR (Hisnul Muslim order) ────────────────────────────────────
const MORNING_ADHKAR = [
  {
    name: 'Ayat al-Kursi',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    transliteration: "Allahu la ilaha illa huwa al-Hayyu al-Qayyum, la ta'khudhuhu sinatun wa la nawm…",
    translation: 'Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and on earth.',
    count: 1, source: 'Quran 2:255 — Read after every Fajr',
    audioType: 'quran', quranAyah: { s: 2, a: 255 },
  },
  {
    name: 'Surah Al-Ikhlas × 3',
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
    transliteration: "Qul huwallahu ahad, Allahu al-Samad, lam yalid wa lam yulad, wa lam yakun lahu kufuwan ahad",
    translation: 'Say: He is Allah, [who is] One. Allah the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent.',
    count: 3, source: 'Quran 112 — × 3 equals reciting the whole Quran once (Tirmidhi)',
    audioType: 'surah', surahNum: 112,
  },
  {
    name: 'Surah Al-Falaq × 3',
    arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
    transliteration: "Qul a'udhu bi rabbi al-falaq, min sharri ma khalaq, wa min sharri ghasiqin idha waqab, wa min sharri al-naffathati fi al-'uqad, wa min sharri hasidin idha hasad",
    translation: 'Say: I seek refuge in the Lord of daybreak, from the evil of what He has created, from the evil of darkness when it settles, from the evil of those who blow on knots, and from the evil of an envier when he envies.',
    count: 3, source: 'Quran 113',
    audioType: 'surah', surahNum: 113,
  },
  {
    name: 'Surah An-Nas × 3',
    arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ',
    transliteration: "Qul a'udhu bi rabbi al-nas, maliki al-nas, ilahi al-nas, min sharri al-waswasi al-khannas, alladhi yuwaswisu fi suduri al-nas, mina al-jinnati wa al-nas",
    translation: 'Say: I seek refuge in the Lord of mankind, the Sovereign of mankind, the God of mankind, from the evil of the retreating whisperer who whispers into the chests of mankind — from among jinn and mankind.',
    count: 3, source: 'Quran 114',
    audioType: 'surah', surahNum: 114,
  },
  {
    name: 'Morning Entry',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ',
    transliteration: "Asbahna wa asbahal mulku lillah, wal-hamdu lillah, la ilaha illallahu wahdahu la sharika lah, lahul mulku wa lahul hamdu wa huwa 'ala kulli shay'in qadir. Rabbi as'aluka khayra ma fi hadhal yawm wa khayra ma ba'dah, wa a'udhu bika min sharri ma fi hadhal yawm wa sharri ma ba'dah",
    translation: 'We have entered the morning and the whole dominion belongs to Allah. All praise is for Allah. None has the right to be worshipped except Allah alone. His is the dominion and His is the praise, and He is Omnipotent. My Lord, I ask You for the good of this day and the good of what follows it, and I seek refuge in You from the evil of this day and the evil of what follows it.',
    count: 1, source: 'Muslim 2723 / Abu Dawud 5076',
    audioType: 'tts',
  },
  {
    name: 'Morning Supplication',
    arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
    transliteration: "Allahumma bika asbahna wa bika amsayna wa bika nahya wa bika namutu wa ilayka al-nushur",
    translation: 'O Allah, by You we enter the morning and by You we enter the evening, by You we live and by You we die, and unto You is the resurrection.',
    count: 1, source: 'Tirmidhi 3391',
    audioType: 'tts',
  },
  {
    name: 'Sayyid al-Istighfar',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ',
    transliteration: "Allahumma anta rabbi la ilaha illa anta, khalaqtani wa ana 'abduka, wa ana 'ala 'ahdika wa wa'dika mastata'tu, a'udhu bika min sharri ma sana'tu, abu'u laka bini'matika 'alayya, wa abu'u laka bidhanbi faghfir li, fa innahu la yaghfiru al-dhunuba illa anta",
    translation: 'O Allah, You are my Lord. None has the right to be worshipped except You. You created me and I am Your servant. I remain on Your covenant and promise as much as I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favours upon me and I acknowledge my sin. So forgive me, for verily none forgives sin except You.',
    count: 1, source: 'Sahih Bukhari 6306 — "Master supplication for forgiveness" — Whoever says this in morning and dies that day enters Paradise',
    audioType: 'tts',
  },
  {
    name: 'Body Health × 3',
    arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ',
    transliteration: "Allahumma 'afini fi badani, Allahumma 'afini fi sam'i, Allahumma 'afini fi basari, la ilaha illa anta",
    translation: 'O Allah, grant my body health. O Allah, grant my hearing health. O Allah, grant my sight health. There is no deity except You.',
    count: 3, source: 'Abu Dawud 5090',
    audioType: 'tts',
  },
  {
    name: 'Bismillah Protection × 3',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    transliteration: "Bismillahi alladhi la yadurru ma'a ismihi shay'un fi al-ardi wa la fi al-sama'i wa huwa al-Sami'u al-'Aleem",
    translation: 'In the name of Allah with whose name nothing is harmed on earth or in heaven, and He is the All-Hearing, All-Knowing.',
    count: 3, source: 'Abu Dawud 5088 — Nothing will harm you until evening, insha\'Allah',
    audioType: 'tts',
  },
  {
    name: 'Raditu billah × 3',
    arabic: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالإِسْلاَمِ دِيناً، وَبِمُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا',
    transliteration: "Raditu billahi rabban, wa bil-islami dinan, wa bi-Muhammadin sallallahu 'alayhi wa sallam nabiyyan",
    translation: 'I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad (ﷺ) as my Prophet.',
    count: 3, source: 'Abu Dawud 5072 — Allah is pleased with whoever says this × 3',
    audioType: 'tts',
  },
  {
    name: 'Refuge from Worry',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنَ الْبُخْلِ وَالْجُبْنِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ',
    transliteration: "Allahumma inni a'udhu bika mina al-hammi wal-hazan, wa a'udhu bika mina al-'ajzi wal-kasal, wa a'udhu bika mina al-bukhli wal-jubn, wa a'udhu bika min ghalabati al-dayn wa qahri al-rijal",
    translation: 'O Allah, I seek refuge in You from worry and grief. I seek refuge in You from inability and laziness. I seek refuge in You from miserliness and cowardice. I seek refuge in You from being overwhelmed by debt and overpowered by men.',
    count: 1, source: 'Sahih Bukhari 6369',
    audioType: 'tts',
  },
  {
    name: 'Tawakkul × 7',
    arabic: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
    transliteration: "Hasbiyallahu la ilaha illa huwa, 'alayhi tawakkaltu wa huwa rabbul 'arshi al-'adheem",
    translation: 'Allah is sufficient for me. None has the right to be worshipped except Him, upon Him I rely, and He is the Lord of the Magnificent Throne.',
    count: 7, source: 'Abu Dawud 5081 — Allah will suffice him in his concerns',
    audioType: 'tts',
  },
  {
    name: 'La ilaha illallah × 10',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: "La ilaha illallahu wahdahu la sharika lahu, lahul mulku wa lahul hamdu wa huwa 'ala kulli shay'in qadir",
    translation: 'None has the right to be worshipped except Allah alone, with no partner. His is the dominion and His is the praise, and He is Omnipotent.',
    count: 10, source: 'Sahih Bukhari 6404 — Equals freeing 10 slaves, 100 good deeds recorded, 100 sins erased',
    audioType: 'tts',
  },
  {
    name: 'SubhanAllah wa bihamdihi × 100',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    transliteration: 'SubhanAllahi wa bihamdihi',
    translation: 'Glory be to Allah and all praise is due to Him.',
    count: 100, source: 'Sahih Muslim 2692 — Sins forgiven even if like the foam of the sea',
    audioType: 'tts',
  },
  {
    name: 'Post-Salah: SubhanAllah × 33',
    arabic: 'سُبْحَانَ اللَّهِ',
    transliteration: 'SubhanAllah',
    translation: 'Glory be to Allah.',
    count: 33, source: 'Sahih Muslim 597',
    audioType: 'tts',
  },
  {
    name: 'Post-Salah: Alhamdulillah × 33',
    arabic: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    translation: 'All praise is due to Allah.',
    count: 33, source: 'Sahih Muslim 597',
    audioType: 'tts',
  },
  {
    name: 'Post-Salah: Allahu Akbar × 34',
    arabic: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest.',
    count: 34, source: 'Sahih Muslim 597',
    audioType: 'tts',
  },
  {
    name: 'Seeking Knowledge (After Fajr)',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
    transliteration: "Allahumma inni as'aluka 'ilman nafi'an, wa rizqan tayyiban, wa 'amalan mutaqabbalan",
    translation: 'O Allah, I ask You for beneficial knowledge, pure provision, and accepted deeds.',
    count: 1, source: 'Ibn Majah 925 — After Fajr salah',
    audioType: 'tts',
  },
  {
    name: 'La hawla wa la quwwata × 100',
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ',
    transliteration: "La hawla wa la quwwata illa billahi al-'aliyyi al-'adheem",
    translation: 'There is no might nor power except with Allah, the Most High, the Most Great.',
    count: 100, source: 'Sahih Muslim — A treasure from the treasures of Paradise',
    audioType: 'tts',
  },
  {
    name: 'Dua for Dunya & Akhira × 3',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    transliteration: "Rabbana atina fi al-dunya hasanatan wa fi al-akhirati hasanatan wa qina 'adhab al-nar",
    translation: 'Our Lord, give us good in this world and good in the hereafter, and save us from the punishment of the Fire.',
    count: 3, source: 'Quran 2:201',
    audioType: 'quran', quranAyah: { s: 2, a: 201 },
  },
]

// ─── EVENING ADHKAR ──────────────────────────────────────────────────────────
const EVENING_ADHKAR = [
  {
    name: 'Ayat al-Kursi (Evening)',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    transliteration: "Allahu la ilaha illa huwa al-Hayyu al-Qayyum…",
    translation: 'Allah — there is no deity except Him, the Ever-Living, the Sustainer. (Protects until morning when read in the evening)',
    count: 1, source: 'Quran 2:255',
    audioType: 'quran', quranAyah: { s: 2, a: 255 },
  },
  {
    name: 'Surah Al-Ikhlas (Evening) × 3',
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
    transliteration: "Qul huwallahu ahad, Allahu al-Samad, lam yalid wa lam yulad, wa lam yakun lahu kufuwan ahad",
    translation: 'Say: He is Allah, [who is] One. Allah the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent.',
    count: 3, source: 'Quran 112',
    audioType: 'surah', surahNum: 112,
  },
  {
    name: 'Surah Al-Falaq (Evening) × 3',
    arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
    transliteration: "Qul a'udhu bi rabbi al-falaq…",
    translation: 'Say: I seek refuge in the Lord of daybreak from the evil of what He has created.',
    count: 3, source: 'Quran 113',
    audioType: 'surah', surahNum: 113,
  },
  {
    name: 'Surah An-Nas (Evening) × 3',
    arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ',
    transliteration: "Qul a'udhu bi rabbi al-nas…",
    translation: 'Say: I seek refuge in the Lord of mankind from the evil of the retreating whisperer.',
    count: 3, source: 'Quran 114',
    audioType: 'surah', surahNum: 114,
  },
  {
    name: 'Evening Entry',
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا',
    transliteration: "Amsayna wa amsa al-mulku lillah, wal-hamdu lillah, la ilaha illallahu wahdahu la sharika lah…",
    translation: 'We have entered the evening and the whole dominion belongs to Allah. All praise is for Allah. None has the right to be worshipped except Allah alone. My Lord, I ask You for the good of this night and the good of what follows, and I seek refuge in You from the evil of this night and the evil of what follows.',
    count: 1, source: 'Muslim 2723 / Abu Dawud 5076',
    audioType: 'tts',
  },
  {
    name: 'Evening Supplication',
    arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
    transliteration: "Allahumma bika amsayna wa bika asbahna wa bika nahya wa bika namutu wa ilayka al-maseer",
    translation: 'O Allah, by You we enter the evening and by You we enter the morning, by You we live and by You we die, and to You is our return.',
    count: 1, source: 'Tirmidhi 3391',
    audioType: 'tts',
  },
  {
    name: 'Sayyid al-Istighfar (Evening)',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ',
    transliteration: "Allahumma anta rabbi la ilaha illa anta, khalaqtani wa ana 'abduka…",
    translation: 'O Allah, You are my Lord. None has the right to be worshipped except You. You created me and I am Your servant. I remain on Your covenant and promise as much as I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favours and I acknowledge my sin. So forgive me, for none forgives sin except You.',
    count: 1, source: 'Sahih Bukhari 6306 — Whoever says this in the evening and dies that night enters Paradise',
    audioType: 'tts',
  },
  {
    name: 'Protection from Harm × 3',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    transliteration: "A'udhu bi kalimatillahi al-tammati min sharri ma khalaqa",
    translation: 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
    count: 3, source: 'Sahih Muslim 2709 — Nothing will harm you until morning',
    audioType: 'tts',
  },
  {
    name: 'Body Health (Evening) × 3',
    arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ',
    transliteration: "Allahumma 'afini fi badani, Allahumma 'afini fi sam'i, Allahumma 'afini fi basari, la ilaha illa anta",
    translation: 'O Allah, grant my body health. O Allah, grant my hearing health. O Allah, grant my sight health. There is no deity except You.',
    count: 3, source: 'Abu Dawud 5090',
    audioType: 'tts',
  },
  {
    name: 'Bismillah Protection (Evening) × 3',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    transliteration: "Bismillahi alladhi la yadurru ma'a ismihi shay'un fi al-ardi wa la fi al-sama'i",
    translation: 'In the name of Allah with whose name nothing is harmed on earth or in heaven, and He is the All-Hearing, All-Knowing.',
    count: 3, source: 'Abu Dawud 5088',
    audioType: 'tts',
  },
  {
    name: 'Refuge from Worry (Evening)',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنَ الْبُخْلِ وَالْجُبْنِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ',
    transliteration: "Allahumma inni a'udhu bika mina al-hammi wal-hazan, wa a'udhu bika mina al-'ajzi wal-kasal…",
    translation: 'O Allah, I seek refuge in You from worry and grief, from inability and laziness, from miserliness and cowardice, from being overwhelmed by debt and overpowered by men.',
    count: 1, source: 'Sahih Bukhari 6369',
    audioType: 'tts',
  },
  {
    name: 'Tawakkul (Evening) × 7',
    arabic: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
    transliteration: "Hasbiyallahu la ilaha illa huwa 'alayhi tawakkaltu wa huwa rabbul 'arshi al-'adheem",
    translation: 'Allah is sufficient for me. None has the right to be worshipped except Him.',
    count: 7, source: 'Abu Dawud 5081',
    audioType: 'tts',
  },
  {
    name: 'Istighfar × 100',
    arabic: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ',
    transliteration: "Astaghfirullaha al-'Adheem alladhi la ilaha illa huwa al-Hayyu al-Qayyum wa atubu ilayh",
    translation: 'I seek forgiveness from Allah the Magnificent, besides Whom there is no God, the Ever-Living, the Sustainer, and I repent to Him.',
    count: 100, source: 'Tirmidhi — Prophet ﷺ sought forgiveness 70-100 times daily',
    audioType: 'tts',
  },
  {
    name: 'Sending Salawat × 10',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ',
    transliteration: "Allahumma salli 'ala Muhammadin wa 'ala ali Muhammad, kama sallayta 'ala Ibrahima wa 'ala ali Ibrahim, innaka Hamidun Majid",
    translation: 'O Allah, send prayers upon Muhammad and upon the family of Muhammad, just as You sent prayers upon Ibrahim and upon the family of Ibrahim. Indeed You are Praiseworthy and Glorious.',
    count: 10, source: 'Sahih Bukhari — 10 blessings returned for each salawat',
    audioType: 'tts',
  },
  {
    name: 'Surah Al-Mulk (Evening)',
    arabic: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: "Tabarakal-ladhi biyadihi al-mulku wa huwa 'ala kulli shay'in qadir",
    translation: 'Blessed is He in whose hand is dominion, and He is over all things competent. (Recite full Surah Al-Mulk — 30 verses — it intercedes for its reciter on the Day of Judgement)',
    count: 1, source: 'Quran 67:1 — Tirmidhi 2891',
    audioType: 'surah', surahNum: 67,
  },
  {
    name: 'Closing Dua × 3',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    transliteration: "Rabbana atina fi al-dunya hasanatan wa fi al-akhirati hasanatan wa qina 'adhab al-nar",
    translation: 'Our Lord, give us good in this world and good in the hereafter, and save us from the punishment of the Fire.',
    count: 3, source: 'Quran 2:201',
    audioType: 'quran', quranAyah: { s: 2, a: 201 },
  },
]

// ─── AUDIO ENGINE (stateRef pattern — no stale closures) ─────────────────────
function useAdhkarAudio(listRef, reciterRef) {
  const [playing,    setPlaying]    = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const audioRef = useRef(null)
  const stateRef = useRef({ playing: false, idx: 0 })

  const getAudio = () => {
    if (!audioRef.current) audioRef.current = new Audio()
    return audioRef.current
  }

  const playFrom = useCallback((idx) => {
    const list     = listRef.current
    const reciter  = reciterRef.current

    if (idx < 0 || idx >= list.length) {
      stateRef.current.playing = false
      stateRef.current.idx = 0
      setPlaying(false)
      setCurrentIdx(0)
      getAudio().pause()
      window.speechSynthesis?.cancel()
      return
    }

    stateRef.current.idx = idx
    stateRef.current.playing = true
    setCurrentIdx(idx)
    setPlaying(true)

    const item   = list[idx]
    const advance = () => { if (stateRef.current.playing) playFrom(stateRef.current.idx + 1) }

    // Resolve URL
    let url = null
    if (item.audioType === 'quran' && item.quranAyah) {
      url = `https://everyayah.com/data/${reciter.id}/${String(item.quranAyah.s).padStart(3,'0')}${String(item.quranAyah.a).padStart(3,'0')}.mp3`
    } else if (item.audioType === 'surah' && item.surahNum) {
      url = `https://cdn.islamic.network/quran/audio-surah/128/${reciter.networkId}/${item.surahNum}.mp3`
    }

    if (url) {
      window.speechSynthesis?.cancel()
      const audio = getAudio()
      audio.onended = null
      audio.onerror = null
      audio.pause()
      audio.src = url
      audio.onended = advance
      audio.onerror = advance
      audio.play().catch(advance)
    } else {
      const audio = getAudio()
      audio.pause()
      audio.src = ''
      audio.onended = null
      audio.onerror = null

      if (!window.speechSynthesis) { advance(); return }
      window.speechSynthesis.cancel()
      const utter = new SpeechSynthesisUtterance(item.arabic)
      utter.lang  = 'ar-SA'
      utter.rate  = 0.65
      utter.pitch = 1
      const voices = window.speechSynthesis.getVoices()
      const best = voices.find(v => /Majed|Maged|Mariam/i.test(v.name))
        || voices.find(v => v.lang === 'ar-SA' && v.localService)
        || voices.find(v => v.lang === 'ar-SA')
        || voices.find(v => v.lang.startsWith('ar'))
      if (best) utter.voice = best
      utter.onend  = advance
      utter.onerror = advance
      window.speechSynthesis.speak(utter)
    }

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({ title: item.name, artist: 'Tamkeen Adhkar' })
      navigator.mediaSession.playbackState = 'playing'
    }
  }, [listRef, reciterRef])

  const stop = useCallback(() => {
    stateRef.current.playing = false
    getAudio().pause()
    window.speechSynthesis?.cancel()
    setPlaying(false)
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused'
  }, [])

  const jumpTo = useCallback((idx) => {
    if (stateRef.current.playing) playFrom(idx)
    else { stateRef.current.idx = idx; setCurrentIdx(idx) }
  }, [playFrom])

  const prev = useCallback(() => playFrom(Math.max(0, stateRef.current.idx - 1)), [playFrom])
  const next = useCallback(() => playFrom(stateRef.current.idx + 1), [playFrom])

  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.setActionHandler('play',          () => { if (!stateRef.current.playing) playFrom(stateRef.current.idx) })
    navigator.mediaSession.setActionHandler('pause',         stop)
    navigator.mediaSession.setActionHandler('previoustrack', prev)
    navigator.mediaSession.setActionHandler('nexttrack',     next)
    return () => ['play','pause','previoustrack','nexttrack'].forEach(a => {
      try { navigator.mediaSession.setActionHandler(a, null) } catch(_) {}
    })
  }, [playFrom, stop, prev, next])

  useEffect(() => () => { getAudio().pause(); window.speechSynthesis?.cancel() }, [])

  return { playing, currentIdx, play: playFrom, stop, prev, next, jumpTo }
}

// ─── ADHKAR CARD ─────────────────────────────────────────────────────────────
function AdhkarCard({ item, isActive, onTap, index }) {
  const [count, setCount] = useState(0)
  const done = count >= item.count
  const [showTranslit, setShowTranslit] = useState(false)

  const badge = item.audioType === 'quran' ? '🎵' : item.audioType === 'surah' ? '🎵' : '🔤'
  const badgeTip = item.audioType === 'tts' ? 'TTS voice' : 'Reciter audio'

  return (
    <div className={`card transition-all border-2 ${isActive ? 'border-tamkeen-light shadow-md' : 'border-transparent'} ${done ? 'opacity-60' : ''}`}>
      {isActive && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className="w-2 h-2 bg-tamkeen-light rounded-full animate-pulse" />
          <span className="text-[10px] text-tamkeen-light font-semibold uppercase tracking-wide">Now playing</span>
        </div>
      )}
      <div className="flex items-start justify-between mb-1">
        <p className="text-[10px] text-gray-400 font-medium flex-1">{item.name}</p>
        <span className="text-[10px] text-gray-300 ml-2 flex-shrink-0" title={badgeTip}>{badge}</span>
      </div>
      <p className="arabic text-xl text-tamkeen-ink mb-3 leading-loose">{item.arabic}</p>
      <button onClick={() => setShowTranslit(!showTranslit)} className="text-[10px] text-tamkeen-light font-medium mb-1">
        {showTranslit ? 'Hide' : 'Show'} transliteration
      </button>
      {showTranslit && <p className="text-xs text-gray-400 italic mb-2">{item.transliteration}</p>}
      <p className="text-sm text-gray-600 mb-2 leading-relaxed">{item.translation}</p>
      <p className="text-[10px] text-gray-400 mb-3">{item.source}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { if (!done) setCount((c) => Math.min(c + 1, item.count)); onTap(index) }}
            className={`w-10 h-10 rounded-full font-bold text-sm transition-all active:scale-90 ${done ? 'bg-tamkeen-mint text-tamkeen-dark' : 'bg-tamkeen-dark text-white'}`}
          >
            {done ? '✓' : '+'}
          </button>
          <span className={`text-sm font-semibold ${done ? 'text-green-600' : 'text-tamkeen-ink'}`}>
            {count} / {item.count}
          </span>
        </div>
        {count > 0 && <button onClick={() => setCount(0)} className="text-[10px] text-gray-400">Reset</button>}
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Adhkar() {
  const [tab,        setTab]        = useState('morning')
  const [reciterIdx, setReciterIdx] = useState(0)

  const listRef    = useRef(MORNING_ADHKAR)
  const reciterRef = useRef(RECITERS[0])

  const list    = tab === 'morning' ? MORNING_ADHKAR : EVENING_ADHKAR
  const reciter = RECITERS[reciterIdx]

  // Keep refs current
  useEffect(() => { listRef.current = list }, [list])
  useEffect(() => { reciterRef.current = reciter }, [reciter])

  const { playing, currentIdx, play, stop, prev, next, jumpTo } = useAdhkarAudio(listRef, reciterRef)

  const quranCount = list.filter(i => i.audioType !== 'tts').length

  const handleTabChange = (newTab) => {
    stop()
    setTab(newTab)
  }

  return (
    <>
    <div className="space-y-4 pb-44">
      {/* Tab */}
      <div className="grid grid-cols-2 gap-2 bg-gray-100 rounded-2xl p-1">
        {[
          { id: 'morning', label: '🌅 Morning', sub: 'أذكار الصباح', count: MORNING_ADHKAR.length },
          { id: 'evening', label: '🌆 Evening', sub: 'أذكار المساء', count: EVENING_ADHKAR.length },
        ].map((t) => (
          <button key={t.id} onClick={() => handleTabChange(t.id)}
            className={`py-2.5 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'bg-white text-tamkeen-dark shadow-sm' : 'text-gray-500'}`}>
            <div>{t.label}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{t.sub}</div>
            <div className="text-[10px] text-gray-300">{t.count} adhkar</div>
          </button>
        ))}
      </div>

      {/* Reciter */}
      <div className="card py-3">
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
          <Radio size={10} /> Reciter — {quranCount} items have real audio · rest use TTS
        </p>
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {RECITERS.map((r, i) => (
            <button key={r.id}
              onClick={() => { setReciterIdx(i); if (playing) { stop() } }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${reciterIdx === i ? 'bg-tamkeen-dark text-white border-tamkeen-dark' : 'border-gray-200 text-gray-500'}`}>
              {r.flag} {r.name}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {list.map((item, i) => (
          <AdhkarCard key={`${tab}-${i}`} item={item} index={i}
            isActive={playing && currentIdx === i} onTap={jumpTo} />
        ))}
      </div>

      <div className="card bg-green-50 text-center">
        <p className="arabic text-xl text-tamkeen-dark mb-2">سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ</p>
        <p className="text-xs text-gray-500">Kaffaratul Majlis — seal every session with this</p>
      </div>
    </div>

    {/* Sticky player — fixed above bottom nav */}
    <div className="fixed bottom-16 left-0 right-0 z-40 pointer-events-none">
      <div className="max-w-lg mx-auto px-4 pb-2 pointer-events-auto">
        <div className="bg-tamkeen-dark text-white rounded-2xl shadow-2xl px-4 py-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-green-300 font-semibold uppercase tracking-wide">
                {playing ? '🔊 Playing' : '⏸ Paused'} · {currentIdx + 1}/{list.length}
              </p>
              <p className="text-sm font-medium text-tamkeen-mint truncate">{list[currentIdx]?.name || '—'}</p>
              <p className="text-[10px] text-green-400 mt-0.5">
                {list[currentIdx]?.audioType === 'tts' ? '🔤 Device Arabic voice' : `🎵 ${reciter.flag} ${reciter.name}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={prev}  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center active:scale-90"><SkipBack size={14} /></button>
              <button onClick={playing ? stop : () => play(currentIdx)}
                className="w-10 h-10 rounded-full bg-tamkeen-mint text-tamkeen-dark flex items-center justify-center font-bold active:scale-90">
                {playing ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button onClick={next}  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center active:scale-90"><SkipForward size={14} /></button>
            </div>
          </div>
          <div className="flex gap-1 flex-wrap">
            {list.map((item, i) => (
              <button key={i} onClick={() => jumpTo(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentIdx ? 'bg-tamkeen-mint w-5' :
                  item.audioType !== 'tts' ? 'bg-green-500/40 w-1.5' : 'bg-white/15 w-1.5'
                }`}
              />
            ))}
          </div>
          <p className="text-[9px] text-green-500/70 mt-1.5">🟢 reciter audio · ⬜ TTS · tap any dot to jump</p>
        </div>
      </div>
    </div>
    </>
  )
}
