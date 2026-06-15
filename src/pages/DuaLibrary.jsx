import { useState, useMemo, useRef, useCallback } from 'react'
import { Search, Heart, BookOpen, X, Volume2, VolumeX } from 'lucide-react'

const CATEGORIES = [
  { id: 'all',        label: 'All',          icon: '📚' },
  { id: 'morning',    label: 'Morning',      icon: '🌅' },
  { id: 'evening',    label: 'Evening',      icon: '🌆' },
  { id: 'prayer',     label: 'Prayer',       icon: '🕌' },
  { id: 'food',       label: 'Food & Drink', icon: '🍽️' },
  { id: 'travel',     label: 'Travel',       icon: '✈️' },
  { id: 'sleep',      label: 'Sleep',        icon: '🌙' },
  { id: 'health',     label: 'Healing',      icon: '💚' },
  { id: 'anxiety',    label: 'Anxiety',      icon: '🤲' },
  { id: 'forgiveness',label: 'Forgiveness',  icon: '✨' },
  { id: 'gratitude',  label: 'Gratitude',    icon: '🌿' },
  { id: 'family',     label: 'Family',       icon: '👨‍👩‍👧' },
  { id: 'rizq',       label: 'Provision',    icon: '💼' },
  { id: 'protection', label: 'Protection',   icon: '🛡️' },
  { id: 'occasions',  label: 'Occasions',    icon: '🌙' },
]

// quranRef → everyayah.com URL; no quranRef → improved TTS
const DUAS = [
  // MORNING
  { id: 1,  cat: 'morning', title: 'Waking Up', arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ', translit: "Alhamdu lillahi alladhi ahyana ba'da ma amatana wa ilayhi al-nushur", trans: 'All praise is for Allah who gave us life after having taken it from us, and unto Him is the resurrection.', source: 'Sahih Bukhari 6312' },
  { id: 2,  cat: 'morning', title: 'After Waking (short)', arabic: 'لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', translit: "La ilaha illallahu wahdahu la sharika lahu, lahul mulku wa lahul hamdu, wa huwa 'ala kulli shay'in qadir", trans: 'None has the right to be worshipped but Allah alone, with no partner. His is the dominion and His is the praise, and He is omnipotent.', source: 'Sahih Bukhari 1154' },
  { id: 3,  cat: 'morning', title: 'Entering the Morning', arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ', translit: "Allahumma bika asbahna wa bika amsayna wa bika nahya wa bika namutu wa ilayka al-nushur", trans: 'O Allah, by You we enter the morning and by You we enter the evening, by You we live and by You we die, and unto You is the resurrection.', source: 'Tirmidhi 3391' },
  { id: 4,  cat: 'morning', title: 'Seeking beneficial knowledge', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا', translit: "Allahumma inni as'aluka 'ilman nafi'an wa rizqan tayyiban wa 'amalan mutaqabbalan", trans: 'O Allah, I ask You for beneficial knowledge, pure provision, and accepted deeds.', source: 'Ibn Majah 925' },
  { id: 5,  cat: 'morning', title: 'Morning protection (Bismillah)', arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ', translit: "Bismillahi alladhi la yadurru ma'a ismihi shay'un fi al-ardi wa la fi al-sama'i wa huwa al-Sami'u al-'Aleem", trans: 'In the name of Allah with whose name nothing is harmed on earth or in heaven, and He is the All-Hearing, All-Knowing.', source: 'Abu Dawud 5088 — × 3' },

  // EVENING
  { id: 6,  cat: 'evening', title: 'Entering the Evening', arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', translit: "Amsayna wa amsa al-mulku lillahi wal-hamdu lillahi la ilaha illallahu wahdahu la sharika lah", trans: 'We have entered the evening and all sovereignty belongs to Allah. All praise is for Allah. None has the right to be worshipped but Allah alone.', source: 'Abu Dawud 5076' },
  { id: 7,  cat: 'evening', title: 'Evening supplication', arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ', translit: "Allahumma bika amsayna wa bika asbahna wa bika nahya wa bika namutu wa ilayka al-maseer", trans: 'O Allah, by You we enter the evening and by You we enter the morning, by You we live and by You we die, and to You is our return.', source: 'Tirmidhi 3391' },
  { id: 8,  cat: 'evening', title: 'Protection at evening', arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', translit: "A'udhu bi kalimatillahi al-tammati min sharri ma khalaqa", trans: 'I seek refuge in the perfect words of Allah from the evil of what He has created.', source: 'Sahih Muslim 2709 — × 3' },

  // PRAYER
  { id: 9,  cat: 'prayer', title: 'Before Salah (entering masjid)', arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', translit: "Allahumma iftah li abwaba rahmatik", trans: 'O Allah, open the doors of Your mercy for me.', source: 'Sahih Muslim 713' },
  { id: 10, cat: 'prayer', title: 'Leaving the masjid', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ', translit: "Allahumma inni as'aluka min fadlik", trans: 'O Allah, I ask You of Your favour.', source: 'Sahih Muslim 713' },
  { id: 11, cat: 'prayer', title: 'After completing prayer', arabic: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ', translit: "Allahumma a'inni 'ala dhikrika wa shukrika wa husni 'ibadatik", trans: 'O Allah, help me to remember You, to give thanks to You, and to worship You properly.', source: 'Abu Dawud 1522' },
  { id: 12, cat: 'prayer', title: "Du'a for Tawbah (Salat)", arabic: 'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنتَ التَّوَّابُ الرَّحِيمُ', translit: "Rabbi ghfir li wa tub 'alayya innaka anta al-Tawwabu al-Raheem", trans: 'My Lord, forgive me and accept my repentance. Indeed, You are the Oft-Accepting of repentance, the Most Merciful.', source: 'Tirmidhi 3434' },
  { id: 13, cat: 'prayer', title: "Du'a Qunoot", arabic: 'اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ وَعَافِنِي فِيمَنْ عَافَيْتَ وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ', translit: "Allahumma ihdini fiman hadayt, wa 'afini fiman 'afayt, wa tawallani fiman tawallayt", trans: 'O Allah, guide me among those You have guided, and grant me wellbeing among those You have granted wellbeing, and take me under Your care among those You have taken care of.', source: 'Abu Dawud 1425' },
  { id: 14, cat: 'prayer', title: 'Dua between two Sujood', arabic: 'رَبِّ اغْفِرْ لِي وَارْحَمْنِي وَاهْدِنِي وَعَافِنِي وَارْزُقْنِي', translit: "Rabbi ghfir li warhamni wahdiniy wa 'afini warzuqni", trans: 'My Lord, forgive me, have mercy on me, guide me, grant me wellbeing, and provide for me.', source: 'Tirmidhi 284' },

  // FOOD
  { id: 15, cat: 'food', title: 'Before eating', arabic: 'بِسْمِ اللَّهِ', translit: 'Bismillah', trans: 'In the name of Allah.', source: 'Sahih Muslim 2017' },
  { id: 16, cat: 'food', title: 'If you forgot Bismillah', arabic: 'بِسْمِ اللَّهِ أَوَّلَهُ وَآخِرَهُ', translit: 'Bismillahi awwalahu wa akhirah', trans: 'In the name of Allah at its beginning and its end.', source: 'Abu Dawud 3767' },
  { id: 17, cat: 'food', title: 'After eating', arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ', translit: "Alhamdu lillahi alladhi at'amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah", trans: 'All praise is for Allah Who fed me this food and provided it for me, without any power or might from me.', source: 'Abu Dawud 4023' },
  { id: 18, cat: 'food', title: 'When breaking fast', arabic: 'اللَّهُمَّ لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ', translit: "Allahumma laka sumtu wa 'ala rizqika aftartu", trans: 'O Allah, for You I fasted and upon Your provision I break my fast.', source: 'Abu Dawud 2358' },
  { id: 19, cat: 'food', title: 'Before drinking water', arabic: 'بِسْمِ اللَّهِ', translit: 'Bismillah', trans: 'In the name of Allah. (Drink in three sips, breathing outside the vessel.)', source: 'Sahih Bukhari' },

  // TRAVEL
  { id: 20, cat: 'travel', title: 'Leaving the house', arabic: 'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', translit: "Bismillahi, tawakkaltu 'ala Allah, wa la hawla wa la quwwata illa billah", trans: 'In the name of Allah, I have put my trust in Allah, and there is no power and no strength except with Allah.', source: 'Abu Dawud 5095' },
  { id: 21, cat: 'travel', title: 'Entering the house', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلَجِ وَخَيْرَ الْمَخْرَجِ', translit: "Allahumma inni as'aluka khayra al-mawlaji wa khayra al-makhraji", trans: 'O Allah, I ask You for good as we enter and good as we leave.', source: 'Abu Dawud 5096' },
  { id: 22, cat: 'travel', title: 'Riding a vehicle', arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ', translit: "Subhana alladhi sakhkhara lana hadha wa ma kunna lahu muqrinin", trans: 'Glory be to the One Who made this subservient to us, as we were not capable of that.', source: 'Quran 43:13', quranRef: { s: 43, a: 13 } },
  { id: 23, cat: 'travel', title: 'Dua for a safe journey', arabic: 'اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى', translit: "Allahumma inna nas'aluka fi safarina hadha al-birra wal-taqwa", trans: 'O Allah, we ask You for righteousness and piety in this journey of ours.', source: 'Sahih Muslim 1342' },
  { id: 24, cat: 'travel', title: 'Returning home', arabic: 'آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ', translit: "Ayibuna ta'ibuna 'abiduna lirabbina hamidun", trans: 'Returning, repenting, worshipping and praising our Lord.', source: 'Sahih Muslim 1345' },

  // SLEEP
  { id: 25, cat: 'sleep', title: 'Before sleeping', arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', translit: "Bismika Allahumma amutu wa ahya", trans: 'In Your name, O Allah, I die and I live.', source: 'Sahih Bukhari 6324' },
  { id: 26, cat: 'sleep', title: 'Sleeping dua (longer)', arabic: 'اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ', translit: "Allahumma aslamtu nafsi ilayk, wa wajjahtu wajhi ilayk", trans: 'O Allah, I submit myself to You, I turn my face to You, I entrust my affairs to You.', source: 'Sahih Bukhari 247' },
  { id: 27, cat: 'sleep', title: 'Before sleeping (Quranic)', arabic: 'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا', translit: "Alladhi khalaqa al-mawta wal-hayata liyabluwakum ayyukum ahsanu 'amala", trans: 'He who created death and life to test which of you is best in deed. — Recite Surah Al-Mulk before sleep.', source: 'Quran 67:2', quranRef: { s: 67, a: 2 } },
  { id: 28, cat: 'sleep', title: 'Dua for good dreams', arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَسَاوِسِ الشَّيْطَانِ وَمِنْ شَرِّهِ', translit: "Allahumma inni a'udhu bika min wasawis al-shaytan wa min sharrih", trans: 'O Allah, I seek refuge in You from the whisperings of the devil and from his evil.', source: 'Abu Dawud' },
  { id: 29, cat: 'sleep', title: 'Upon waking from a nightmare', arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ غَضَبِهِ وَعِقَابِهِ', translit: "A'udhu bi kalimatillahi al-tammati min ghadabihi wa 'iqabihi", trans: 'I seek refuge in the perfect words of Allah from His anger and His punishment.', source: 'Tirmidhi 3528' },
  { id: 30, cat: 'sleep', title: 'Recite before sleep × 3', arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ', translit: "Qul huwallahu ahad", trans: 'Say: He is Allah, [who is] One. — Recite Surah Ikhlas, Falaq and Nas × 3, then wipe over body before sleep.', source: 'Sahih Bukhari 5017', quranRef: { s: 112, a: 1 } },

  // HEALTH
  { id: 31, cat: 'health', title: 'Dua for healing', arabic: 'اللَّهُمَّ رَبَّ النَّاسِ، أَذْهِبِ الْبَأْسَ، اشْفِهِ وَأَنْتَ الشَّافِي', translit: "Allahumma rabba al-nas, adhhib al-ba's, ishfihi wa anta al-shafi", trans: 'O Allah, Lord of mankind, take away the pain. Cure him and You are the Healer. There is no cure except Your cure.', source: 'Sahih Bukhari 5675' },
  { id: 32, cat: 'health', title: 'Ruqyah for illness', arabic: 'أَعُوذُ بِعِزَّةِ اللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ', translit: "A'udhu bi'izzatillahi wa qudratihi min sharri ma ajidu wa uhathir", trans: 'I seek refuge in the might of Allah and His power from the evil of what I find and what I guard against.', source: 'Sahih Muslim 2202 — × 7 over the pain' },
  { id: 33, cat: 'health', title: 'Visiting the sick', arabic: 'لَا بَأْسَ طَهُورٌ إِنْ شَاءَ اللَّهُ', translit: "La ba's, tahoorun in sha' Allah", trans: 'No harm — it will be a purification, Allah willing.', source: 'Sahih Bukhari 3616' },
  { id: 34, cat: 'health', title: 'Dua for pain (put hand on it)', arabic: 'بِسْمِ اللَّهِ', translit: "Bismillah × 3, then: A'udhu billahi wa qudratihi min sharri ma ajidu wa uhathiru × 7", trans: 'In the name of Allah × 3. I seek refuge in Allah and His might × 7.', source: 'Sahih Muslim 2202' },
  { id: 35, cat: 'health', title: 'After sneezing', arabic: 'الْحَمْدُ لِلَّهِ', translit: 'Alhamdu lillah', trans: 'All praise is for Allah. Response: Yarhamuk Allah (May Allah have mercy on you).', source: 'Sahih Bukhari 6224' },

  // ANXIETY
  { id: 36, cat: 'anxiety', title: 'In times of distress', arabic: 'لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ', translit: "La ilaha illallahu al-'Adhimu al-Halim, la ilaha illallahu rabbu al-'arshi al-'adhim", trans: 'There is no deity but Allah, the Magnificent, the Forbearing. There is no deity but Allah, Lord of the Magnificent Throne.', source: 'Sahih Bukhari 6346' },
  { id: 37, cat: 'anxiety', title: 'Dua al-Karb (grief)', arabic: 'لَا إِلَهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ', translit: "La ilaha illa anta subhanaka inni kuntu mina al-dhalimin", trans: "There is no deity but You; Glory be to You. Indeed I was among the wrongdoers.", source: 'Quran 21:87 — Dua of Yunus (as)', quranRef: { s: 21, a: 87 } },
  { id: 38, cat: 'anxiety', title: 'Feeling overwhelmed', arabic: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ', translit: "Hasbiyallahu la ilaha illa huwa 'alayhi tawakkaltu wa huwa rabbu al-'arshi al-'adheem", trans: "Allah is sufficient for me. None has the right to be worshipped except Him, upon Him I rely.", source: 'Quran 9:129 — × 7 morning and evening', quranRef: { s: 9, a: 129 } },
  { id: 39, cat: 'anxiety', title: 'Against worry and fear', arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ', translit: "Allahumma inni a'udhu bika mina al-hammi wal-hazan", trans: 'O Allah, I seek refuge in You from worry and grief, inability and laziness.', source: 'Sahih Bukhari 6369' },
  { id: 40, cat: 'anxiety', title: 'Feeling lost — dua of the believer', arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً', translit: "Rabbana la tuzigh qulubana ba'da idh hadaytana wahab lana min ladunka rahmah", trans: 'Our Lord, let not our hearts deviate after You have guided us, and grant us from Yourself mercy.', source: 'Quran 3:8', quranRef: { s: 3, a: 8 } },
  { id: 41, cat: 'anxiety', title: 'Tawakkul declaration', arabic: 'رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ', translit: "Rabbi inni lima anzalta ilayya min khayrin faqir", trans: 'My Lord, I am in absolute need of whatever good You send down to me.', source: 'Quran 28:24 — Dua of Musa (as)', quranRef: { s: 28, a: 24 } },

  // FORGIVENESS
  { id: 42, cat: 'forgiveness', title: 'Sayyid al-Istighfar', arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ', translit: "Allahumma anta rabbi la ilaha illa anta, khalaqtani wa ana 'abduka", trans: 'O Allah, You are my Lord. None has the right to be worshipped except You. You created me and I am Your servant.', source: 'Sahih Bukhari 6306 — If said in morning and dies that day, he is of the people of Paradise' },
  { id: 43, cat: 'forgiveness', title: 'Simple istighfar', arabic: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', translit: "Astaghfirullaha wa atubu ilayh", trans: "I seek Allah's forgiveness and I repent to Him.", source: 'Sahih Bukhari — The Prophet said this 100× per day' },
  { id: 44, cat: 'forgiveness', title: 'After sin — full repentance', arabic: 'اللَّهُمَّ أَنتَ رَبِّي، لَا إِلَهَ إِلَّا أَنتَ، غَفَرتَ لِي ذَنبِي', translit: "Allahumma anta rabbi, la ilaha illa anta, ghafarta li dhanbi", trans: 'O Allah, You are my Lord. There is no deity except You. You have forgiven my sin.', source: 'Ahmad' },
  { id: 45, cat: 'forgiveness', title: 'After bad deeds — complete atonement', arabic: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ', translit: "Subhanakallahumma wa bihamdika, ashhadu an la ilaha illa anta, astaghfiruka wa atubu ilayk", trans: 'Glory and praise be to You O Allah. I testify that there is none worthy of worship but You. I seek Your forgiveness. (Kaffaratul-majlis)', source: 'Abu Dawud 4857' },

  // GRATITUDE
  { id: 46, cat: 'gratitude', title: 'For any blessing', arabic: 'الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ', translit: "Alhamdu lillahi alladhi bini'matihi tatimmu al-salihat", trans: 'All praise is for Allah, by whose blessing good deeds are completed.', source: 'Ibn Majah 3803' },
  { id: 47, cat: 'gratitude', title: 'Gratitude for Islam', arabic: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ', translit: "Allahumma a'inni 'ala dhikrika wa shukrika wa husni 'ibadatik", trans: 'O Allah, help me remember You, give thanks to You, and worship You in the best manner.', source: 'Abu Dawud 1522' },
  { id: 48, cat: 'gratitude', title: 'After receiving good news', arabic: 'الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ', translit: "Alhamdu lillahi alladhi bini'matihi tatimmu al-salihat", trans: 'All praise is for Allah, by whose grace good deeds are completed.', source: 'Ibn Majah' },
  { id: 49, cat: 'gratitude', title: 'Shukr for provisions', arabic: 'اللَّهُمَّ لَكَ الْحَمْدُ أَنتَ كَسَوتَنِيهِ', translit: "Allahumma laka al-hamdu anta kasawtanihi", trans: 'O Allah, all praise is for You — You have clothed me. (When putting on new clothes)', source: 'Abu Dawud 4023' },

  // FAMILY
  { id: 50, cat: 'family', title: 'Dua for children', arabic: 'رَبِّ هَبْ لِي مِن لَّدُنكَ ذُرِّيَّةً طَيِّبَةً إِنَّكَ سَمِيعُ الدُّعَاءِ', translit: "Rabbi hab li min ladunka dhurriyyatan tayyibah, innaka sami'u al-du'a", trans: 'My Lord, grant me from Yourself a good offspring. Indeed, You are the Hearer of supplication.', source: 'Quran 3:38 — Dua of Zakariyya (as)', quranRef: { s: 3, a: 38 } },
  { id: 51, cat: 'family', title: 'For pious family', arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ', translit: "Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yunin", trans: 'Our Lord, grant us from among our wives and offspring comfort to our eyes.', source: 'Quran 25:74', quranRef: { s: 25, a: 74 } },
  { id: 52, cat: 'family', title: 'For parents', arabic: 'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا', translit: "Rabbi irhamhuma kama rabbayani saghira", trans: 'My Lord, have mercy upon them as they brought me up when I was small.', source: 'Quran 17:24', quranRef: { s: 17, a: 24 } },
  { id: 53, cat: 'family', title: 'For the family gathering', arabic: 'اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ', translit: "Allahumma barik lana fima razaqtana wa qina 'adhab al-nar", trans: 'O Allah, bless for us what You have provided us, and protect us from the punishment of the Fire.', source: 'Sahih' },

  // RIZQ
  { id: 54, cat: 'rizq', title: 'For barakah in rizq', arabic: 'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ', translit: "Allahumma ikfini bihalilaka 'an haramika, wa aghniniy bifadlika 'amman siwak", trans: 'O Allah, suffice me with Your lawful provisions from Your unlawful ones, and enrich me by Your favour over all others.', source: 'Tirmidhi 3563' },
  { id: 55, cat: 'rizq', title: 'Morning rizq dua', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ رِزْقًا طَيِّبًا وَعِلْمًا نَافِعًا وَعَمَلًا مُتَقَبَّلًا', translit: "Allahumma inni as'aluka rizqan tayyiban wa 'ilman nafi'an wa 'amalan mutaqabbalan", trans: 'O Allah, I ask You for pure provision, beneficial knowledge, and accepted deeds.', source: 'Ibn Majah 925' },
  { id: 56, cat: 'rizq', title: 'Dua of Ibrahim (as) — full sustenance', arabic: 'رَبَّنَا إِنِّي أَسْكَنتُ مِن ذُرِّيَّتِي بِوَادٍ غَيْرِ ذِي زَرْعٍ', translit: "Rabbana inni askantu min dhurriyyati biwadin ghayri dhi zar'in 'inda baytika al-muharram…", trans: 'Our Lord, I have settled some of my descendants in an uncultivated valley near Your sacred House... provide them with fruits.', source: 'Quran 14:37', quranRef: { s: 14, a: 37 } },
  { id: 57, cat: 'rizq', title: 'After paying debts', arabic: 'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ', translit: "Allahumma ikfini bihalilaka 'an haramika", trans: 'O Allah, suffice me with Your lawful provisions from Your unlawful ones.', source: 'Tirmidhi 3563' },
  { id: 58, cat: 'rizq', title: 'When in financial hardship', arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ وَضَلَعِ الدَّيْنِ', translit: "Allahumma inni a'udhu bika mina al-hammi wal-hazan wa dala'i al-dayn", trans: 'O Allah, I seek refuge in You from worry, grief, and the burden of debts.', source: 'Abu Dawud' },

  // PROTECTION
  { id: 59, cat: 'protection', title: 'Morning protection × 3', arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ', translit: "Bismillahi alladhi la yadurru ma'a ismihi shay'un", trans: 'In the name of Allah, with whose name nothing can cause harm.', source: 'Abu Dawud 5088' },
  { id: 60, cat: 'protection', title: 'Protection from evil eye', arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ', translit: "A'udhu bi kalimatillahi al-tammati min kulli shaytanin wa hammatin", trans: 'I seek refuge in the perfect words of Allah from every devil and harmful thing.', source: 'Sahih Bukhari 3371' },
  { id: 61, cat: 'protection', title: 'Protection for children', arabic: 'أُعِيذُكَ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ', translit: "U'idhuka bi kalimatillahi al-tammati min kulli shaytanin wa hammatin", trans: 'I seek protection for you in the perfect words of Allah from every devil, vermin, and every evil eye.', source: 'Sahih Bukhari 3371' },
  { id: 62, cat: 'protection', title: 'Ayat al-Kursi', arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ', translit: "Allahu la ilaha illa huwa al-Hayyu al-Qayyum, la ta'khudhuhu sinatun wa la nawm", trans: 'Allah — there is no deity except Him, the Ever-Living, the Sustainer. (Read after every salah for Jannah entry)', source: 'Quran 2:255', quranRef: { s: 2, a: 255 } },
  { id: 63, cat: 'protection', title: 'Dua for full ruqyah protection', arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', translit: "Rabbana atina fi al-dunya hasanatan wa fi al-akhirati hasanatan wa qina 'adhab al-nar", trans: 'Our Lord, give us good in this world and good in the Hereafter, and save us from the punishment of the Fire.', source: 'Quran 2:201', quranRef: { s: 2, a: 201 } },

  // OCCASIONS
  { id: 64, cat: 'occasions', title: 'Eid greeting & dua', arabic: 'تَقَبَّلَ اللَّهُ مِنَّا وَمِنكُم', translit: "Taqabbalallahu minna wa minkum", trans: 'May Allah accept [good deeds] from us and from you.', source: 'Sahih — Companions used to say this on Eid' },
  { id: 65, cat: 'occasions', title: 'New Year (Hijri)', arabic: 'اللَّهُمَّ أَدْخِلْهُ عَلَيْنَا بِالأَمْنِ وَالإِيمَانِ وَالسَّلَامَةِ وَالإِسْلَامِ', translit: "Allahumma adkhilhu 'alayna bil-amni wal-iman wal-salama wal-islam", trans: 'O Allah, let it enter upon us with security, faith, safety, and Islam.', source: 'Tabarani — New month/year dua' },
  { id: 66, cat: 'occasions', title: 'Seeing the new moon', arabic: 'اللَّهُ أَكْبَرُ، اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالأَمْنِ وَالإِيمَانِ', translit: "Allahu Akbar, Allahumma ahillahu 'alayna bil-amni wal-iman", trans: 'Allah is the Greatest. O Allah, let this moon appear to us with security, faith, safety, and Islam.', source: 'Tirmidhi 3451' },
  { id: 67, cat: 'occasions', title: 'Before making a decision (Istikhara)', arabic: 'اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ', translit: "Allahumma inni astakhiruka bi'ilmika, wa astaqdiruka biqudratika", trans: "O Allah, I seek Your guidance through Your knowledge, and I seek Your ability through Your power.", source: "Sahih Bukhari 6382 — Pray 2 rak'ah then make this dua" },
  { id: 68, cat: 'occasions', title: 'When in authority / leadership', arabic: 'رَّبِّ أَدْخِلْنِي مُدْخَلَ صِدْقٍ وَأَخْرِجْنِي مُخْرَجَ صِدْقٍ', translit: "Rabbi adkhilni mudkhala sidqin wa akhrijniy mukhraja sidqin", trans: 'My Lord, cause me to enter a sound entrance and to exit a sound exit and grant me from Yourself a supporting authority.', source: 'Quran 17:80', quranRef: { s: 17, a: 80 } },
]

const LS_FAV = 'tamkeen_dua_favorites'
function loadFavs() { try { return JSON.parse(localStorage.getItem(LS_FAV)) || [] } catch { return [] } }
function saveFavs(f) { localStorage.setItem(LS_FAV, JSON.stringify(f)) }

// Shared audio state for the page
function playDuaAudio(dua, audioRef, setPlayingId, playingId) {
  // Stop current
  if (audioRef.current) {
    audioRef.current.pause()
    audioRef.current.src = ''
  }
  window.speechSynthesis?.cancel()

  if (playingId === dua.id) { setPlayingId(null); return } // toggle off

  setPlayingId(dua.id)

  if (dua.quranRef) {
    // Real Mishary Alafasy audio from everyayah.com
    const { s, a } = dua.quranRef
    const url = `https://everyayah.com/data/Alafasy_128kbps/${String(s).padStart(3,'0')}${String(a).padStart(3,'0')}.mp3`
    const audio = new Audio(url)
    audioRef.current = audio
    audio.play().catch(() => {})
    audio.onended = () => setPlayingId(null)
    audio.onerror = () => {
      // Fallback to TTS if everyayah fails
      setPlayingId(null)
    }
  } else {
    // TTS with best Arabic voice
    if (!window.speechSynthesis) { setPlayingId(null); return }
    const utter = new SpeechSynthesisUtterance(dua.arabic)
    utter.lang  = 'ar-SA'
    utter.rate  = 0.6
    utter.pitch = 1.0
    const voices = window.speechSynthesis.getVoices()
    const best = voices.find(v => /Majed|Maged|Mariam/i.test(v.name))
      || voices.find(v => v.lang === 'ar-SA' && v.localService)
      || voices.find(v => v.lang === 'ar-SA')
      || voices.find(v => v.lang.startsWith('ar'))
    if (best) utter.voice = best
    utter.onend = () => setPlayingId(null)
    window.speechSynthesis.speak(utter)
  }
}

function DuaCard({ dua, isFav, onFav, playingId, onPlay, audioRef }) {
  const [showTranslit, setShowTranslit] = useState(false)
  const isPlaying = playingId === dua.id

  return (
    <div className={`card transition-all ${isPlaying ? 'border-2 border-tamkeen-light' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="text-xs text-tamkeen-light font-semibold uppercase tracking-wide mb-1">{dua.title}</p>
          <p className="arabic text-xl text-tamkeen-ink leading-loose">{dua.arabic}</p>
        </div>
        <button onClick={() => onFav(dua.id)} className={`ml-2 p-1.5 rounded-xl transition-all flex-shrink-0 ${isFav ? 'text-red-400' : 'text-gray-200 hover:text-gray-400'}`}>
          <Heart size={16} className={isFav ? 'fill-red-400' : ''} />
        </button>
      </div>

      <button onClick={() => setShowTranslit((s) => !s)} className="text-[10px] text-tamkeen-light font-medium mb-1">
        {showTranslit ? 'Hide' : 'Show'} transliteration
      </button>
      {showTranslit && <p className="text-xs text-gray-400 italic mb-2">{dua.translit}</p>}
      <p className="text-sm text-gray-600 leading-relaxed mb-2">"{dua.trans}"</p>

      <div className="flex items-center justify-between">
        <p className="text-[10px] text-gray-400">{dua.source}</p>
        <button
          onClick={() => onPlay(dua)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
            isPlaying
              ? 'bg-tamkeen-dark text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-tamkeen-mint hover:text-tamkeen-dark'
          }`}
        >
          {isPlaying ? <VolumeX size={12} /> : <Volume2 size={12} />}
          {isPlaying ? 'Stop' : dua.quranRef ? '🎵 Listen' : '🔤 Listen'}
        </button>
      </div>
    </div>
  )
}

export default function DuaLibrary() {
  const [cat,       setCat]       = useState('all')
  const [search,    setSearch]    = useState('')
  const [favs,      setFavs]      = useState(loadFavs)
  const [showFavs,  setShowFavs]  = useState(false)
  const [playingId, setPlayingId] = useState(null)
  const audioRef = useRef(null)

  const toggleFav = (id) => {
    setFavs((f) => {
      const next = f.includes(id) ? f.filter((x) => x !== id) : [...f, id]
      saveFavs(next)
      return next
    })
  }

  const handlePlay = useCallback((dua) => {
    playDuaAudio(dua, audioRef, setPlayingId, playingId)
  }, [playingId])

  const filtered = useMemo(() => {
    let list = showFavs ? DUAS.filter((d) => favs.includes(d.id)) : DUAS
    if (cat !== 'all') list = list.filter((d) => d.cat === cat)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((d) =>
        d.title.toLowerCase().includes(q) ||
        d.trans.toLowerCase().includes(q) ||
        d.arabic.includes(q)
      )
    }
    return list
  }, [cat, search, showFavs, favs])

  const quranCount = DUAS.filter((d) => d.quranRef).length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-tamkeen-ink">Dua Library</h2>
          <p className="text-sm text-gray-500">{DUAS.length} duas · {quranCount} with Mishary Alafasy audio</p>
        </div>
        <button onClick={() => setShowFavs((s) => !s)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${showFavs ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 text-gray-500'}`}>
          <Heart size={12} className={showFavs ? 'fill-red-400 text-red-400' : ''} />
          {showFavs ? 'Favourites' : 'My favs'}
          {favs.length > 0 && <span className="bg-red-100 text-red-500 text-[9px] rounded-full w-4 h-4 flex items-center justify-center">{favs.length}</span>}
        </button>
      </div>

      {/* Audio legend */}
      <div className="flex items-center gap-4 text-[10px] text-gray-400">
        <span className="flex items-center gap-1">🎵 <span>Real reciter audio (Quran-sourced)</span></span>
        <span className="flex items-center gap-1">🔤 <span>Device Arabic voice</span></span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input className="input pl-9 text-sm" placeholder="Search duas…" value={search}
          onChange={(e) => setSearch(e.target.value)} />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X size={14} className="text-gray-400" />
          </button>
        )}
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => { setCat(c.id); setShowFavs(false) }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              cat === c.id && !showFavs
                ? 'bg-tamkeen-dark text-white border-tamkeen-dark'
                : 'bg-white text-gray-500 border-gray-200'
            }`}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-gray-400">{filtered.length} dua{filtered.length !== 1 ? 's' : ''}</p>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-sm text-gray-400">{showFavs ? 'No favourites yet — tap ♡ on any dua' : 'No duas found'}</p>
        </div>
      ) : (
        <div className="space-y-3 pb-4">
          {filtered.map((dua) => (
            <DuaCard key={dua.id} dua={dua} isFav={favs.includes(dua.id)} onFav={toggleFav}
              playingId={playingId} onPlay={handlePlay} audioRef={audioRef} />
          ))}
        </div>
      )}
    </div>
  )
}
