import { useState, useRef, useCallback, useEffect } from 'react'
import { Play, Pause, SkipForward, SkipBack, Radio, Repeat, Repeat1 } from 'lucide-react'

const RECITERS = [
  { id: 'Alafasy_128kbps',               name: 'Mishary Alafasy',  flag: '🇰🇼', networkId: 'ar.alafasy' },
  { id: 'Abdurrahmaan_As-Sudais_192kbps', name: 'As-Sudais',        flag: '🇸🇦', networkId: 'ar.abdurrahmaansudais' },
  { id: 'Maher_AlMuaiqly_128kbps',        name: 'Maher Al Muaiqly', flag: '🇸🇦', networkId: 'ar.maheralmuaiqly' },
  { id: 'Minshawi_Mujawwad_128kbps',      name: 'Al-Minshawi',      flag: '🇪🇬', networkId: 'ar.minshawi' },
]

const RUQYAH_ITEMS = [
  {
    name: 'Al-Fatiha (× 3)',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
    transliteration: "Bismillahi al-Rahmani al-Raheem. Alhamdu lillahi rabbi al-'alamin, al-Rahmani al-Raheem, maliki yawmi al-deen. Iyyaka na'budu wa iyyaka nasta'een. Ihdina al-sirata al-mustaqeem, sirata alladhina an'amta 'alayhim ghayri al-maghdubi 'alayhim wa la al-dalleen.",
    translation: 'In the name of Allah, the Most Gracious, the Most Merciful. All praise belongs to Allah, Lord of all worlds, the Most Gracious, the Most Merciful, Master of the Day of Judgment. You alone we worship and You alone we ask for help. Guide us to the straight path — the path of those You have blessed, not those who have incurred Your anger, nor those who are astray.',
    count: 3, source: 'Surah Al-Fatiha (1) — the Prophet ﷺ used Al-Fatiha as ruqyah (Sahih Bukhari 5736)',
    audioType: 'surah', surahNum: 1,
  },
  {
    name: 'Ayat al-Kursi (× 3)',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    transliteration: "Allahu la ilaha illa huwa al-Hayyu al-Qayyum, la ta'khudhuhu sinatun wa la nawm, lahu ma fi al-samawati wa ma fi al-ard…",
    translation: 'Allah — there is no deity except Him, the Ever-Living, the Sustainer. Neither drowsiness nor sleep overtakes Him. To Him belongs all that is in the heavens and earth. None can intercede with Him except by His permission. He knows what is before them and what is behind them. His Throne encompasses the heavens and earth, and preserving them does not tire Him. He is the Most High, the Most Great.',
    count: 3, source: 'Quran 2:255 — reciting this once is enough to protect until morning/evening (Sahih Bukhari)',
    audioType: 'quran', quranAyah: { s: 2, a: 255 },
  },
  {
    name: 'Al-Baqarah 285–286 (× 1)',
    arabic: 'آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ۝ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
    transliteration: "Amana al-rasulu bima unzila ilayhi min rabbihi wa al-mu'minun… La yukallifu Allahu nafsan illa wus'aha…",
    translation: 'The Messenger has believed in what was revealed to him from his Lord, and so have the believers. All have believed in Allah, His angels, His books and His messengers… Allah does not burden a soul beyond its capacity. Our Lord, do not take us to task if we forget or make mistakes. Our Lord, do not place on us a burden like the one You placed on those before us. Pardon us, forgive us, and have mercy on us — You are our Protector.',
    count: 1, source: 'Quran 2:285–286 — "Whoever recites these two ayahs at night, they will suffice him" (Bukhari 5009)',
    audioType: 'quran', quranAyah: { s: 2, a: 285 },
  },
  {
    name: 'Al-Ikhlas (× 3)',
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
    transliteration: "Qul huwallahu ahad, Allahu al-Samad, lam yalid wa lam yulad, wa lam yakun lahu kufuwan ahad",
    translation: 'Say: He is Allah, [who is] One. Allah the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent.',
    count: 3, source: 'Quran 112 — Prophet ﷺ used Al-Ikhlas and the Mu\'awwidhatain as ruqyah (Sahih Bukhari 5017)',
    audioType: 'surah', surahNum: 112,
  },
  {
    name: 'Al-Falaq (× 3)',
    arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
    transliteration: "Qul a'udhu bi rabbi al-falaq, min sharri ma khalaq, wa min sharri ghasiqin idha waqab, wa min sharri al-naffathati fi al-'uqad, wa min sharri hasidin idha hasad",
    translation: 'Say: I seek refuge in the Lord of daybreak, from the evil of what He has created, from the evil of darkness when it settles, from the evil of those who blow on knots, and from the evil of an envier when he envies.',
    count: 3, source: 'Quran 113 — Al-Mu\'awwidhatain protect against evil eye, magic & jinn',
    audioType: 'surah', surahNum: 113,
  },
  {
    name: 'An-Nas (× 3)',
    arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ',
    transliteration: "Qul a'udhu bi rabbi al-nas, maliki al-nas, ilahi al-nas, min sharri al-waswasi al-khannas, alladhi yuwaswisu fi suduri al-nas, mina al-jinnati wa al-nas",
    translation: 'Say: I seek refuge in the Lord of mankind, the Sovereign of mankind, the God of mankind, from the evil of the retreating whisperer who whispers into the chests of mankind — from among jinn and mankind.',
    count: 3, source: 'Quran 114',
    audioType: 'surah', surahNum: 114,
  },
  {
    name: 'Ruqyah Healing Dua',
    arabic: 'اللَّهُمَّ رَبَّ النَّاسِ، أَذْهِبِ الْبَاسَ، اشْفِهِ وَأَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا',
    transliteration: "Allahumma rabba al-nas, adhhib al-ba's, ishfihi wa anta al-shafi, la shifa'a illa shifa'uka, shifa'an la yughadiru saqama",
    translation: 'O Allah, Lord of mankind, remove the harm and heal — You are the Healer. There is no cure except Your cure, a cure that leaves no illness behind.',
    count: 3, source: 'Sahih Bukhari 5742 — the ruqyah the Prophet ﷺ used when visiting the sick',
    audioType: 'tts',
  },
  {
    name: 'Blowing Ruqyah (× 3 per hand)',
    arabic: 'بِسْمِ اللَّهِ أَرْقِيكَ مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنٍ حَاسِدٍ، اللَّهُ يَشْفِيكَ، بِسْمِ اللَّهِ أَرْقِيكَ',
    transliteration: "Bismillahi arqeeka min kulli shay'in yu'dheeka, min sharri kulli nafsin aw 'aynin hasidin, Allahu yashfeeka, bismillahi arqeeka",
    translation: 'In the name of Allah I perform ruqyah on you, from everything that harms you, from the evil of every soul or envious eye — Allah heals you. In the name of Allah I perform ruqyah on you.',
    count: 3, source: 'Sahih Muslim 2186 — Recite, blow into both hands and wipe over the body. Do × 3.',
    audioType: 'tts',
  },
]

function useRuqyahAudio(listRef, reciterRef) {
  const [playing,    setPlaying]    = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [repeatMode, setRepeatMode] = useState('none')
  const audioRef  = useRef(null)
  const stateRef  = useRef({ playing: false, idx: 0 })
  const repeatRef = useRef('none')

  const getAudio = () => {
    if (!audioRef.current) audioRef.current = new Audio()
    return audioRef.current
  }

  const cycleRepeat = useCallback(() => {
    const next = repeatRef.current === 'none' ? 'all' : repeatRef.current === 'all' ? 'one' : 'none'
    repeatRef.current = next
    setRepeatMode(next)
  }, [])

  const playFrom = useCallback((idx) => {
    const list    = listRef.current
    const reciter = reciterRef.current

    if (idx < 0 || idx >= list.length) {
      if (repeatRef.current === 'all') { playFrom(0); return }
      stateRef.current.playing = false
      setPlaying(false); setCurrentIdx(0)
      stateRef.current.idx = 0
      getAudio().pause()
      window.speechSynthesis?.cancel()
      return
    }

    stateRef.current.idx = idx
    stateRef.current.playing = true
    setCurrentIdx(idx); setPlaying(true)

    const item    = list[idx]
    const advance = () => {
      if (!stateRef.current.playing) return
      if (repeatRef.current === 'one') playFrom(stateRef.current.idx)
      else playFrom(stateRef.current.idx + 1)
    }

    let url = null
    if (item.audioType === 'quran' && item.quranAyah) {
      url = `https://everyayah.com/data/${reciter.id}/${String(item.quranAyah.s).padStart(3,'0')}${String(item.quranAyah.a).padStart(3,'0')}.mp3`
    } else if (item.audioType === 'surah' && item.surahNum) {
      url = `https://cdn.islamic.network/quran/audio-surah/128/${reciter.networkId}/${item.surahNum}.mp3`
    }

    if (url) {
      window.speechSynthesis?.cancel()
      const audio = getAudio()
      audio.pause(); audio.onended = null; audio.onerror = null
      audio.src = url
      audio.onended = advance
      audio.onerror = advance
      audio.play().catch(advance)
    } else {
      const audio = getAudio()
      audio.pause(); audio.src = ''; audio.onended = null; audio.onerror = null
      if (!window.speechSynthesis) { advance(); return }
      window.speechSynthesis.cancel()
      const utter = new SpeechSynthesisUtterance(item.arabic)
      utter.lang = 'ar-SA'; utter.rate = 0.65; utter.pitch = 1
      const voices = window.speechSynthesis.getVoices()
      const best = voices.find(v => /Majed|Maged/i.test(v.name)) || voices.find(v => v.lang === 'ar-SA') || voices.find(v => v.lang.startsWith('ar'))
      if (best) utter.voice = best
      utter.onend = advance; utter.onerror = advance
      window.speechSynthesis.speak(utter)
    }
  }, [listRef, reciterRef])

  const stop = useCallback(() => {
    stateRef.current.playing = false
    getAudio().pause()
    window.speechSynthesis?.cancel()
    setPlaying(false)
  }, [])

  const prev = useCallback(() => playFrom(Math.max(0, stateRef.current.idx - 1)), [playFrom])
  const next = useCallback(() => playFrom(stateRef.current.idx + 1), [playFrom])
  const jumpTo = useCallback((idx) => { if (stateRef.current.playing) playFrom(idx); else { stateRef.current.idx = idx; setCurrentIdx(idx) } }, [playFrom])

  useEffect(() => () => { getAudio().pause(); window.speechSynthesis?.cancel() }, [])

  return { playing, currentIdx, repeatMode, cycleRepeat, play: playFrom, stop, prev, next, jumpTo }
}

export default function Ruqyah() {
  const [reciterIdx, setReciterIdx] = useState(0)
  const listRef    = useRef(RUQYAH_ITEMS)
  const reciterRef = useRef(RECITERS[0])

  useEffect(() => { reciterRef.current = RECITERS[reciterIdx] }, [reciterIdx])

  const { playing, currentIdx, repeatMode, cycleRepeat, play, stop, prev, next, jumpTo } = useRuqyahAudio(listRef, reciterRef)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-tamkeen-ink">Ruqyah شرعية</h2>
        <p className="text-sm text-gray-500">Islamic healing — Quranic verses & prophetic supplications</p>
      </div>

      {/* Info card */}
      <div className="card bg-green-50">
        <p className="text-xs font-semibold text-tamkeen-dark mb-1">📜 Ruqyah from the Sunnah</p>
        <p className="text-xs text-gray-600 leading-relaxed">
          The Prophet ﷺ performed ruqyah using Al-Fatiha, Ayat al-Kursi, and the Mu'awwidhatain.
          Recite with intention and certainty — cure belongs to Allah alone. Blow gently on your hands
          and wipe your body, or recite over the sick person.
        </p>
      </div>

      {/* Reciter */}
      <div className="card py-3">
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
          <Radio size={10} /> Reciter
        </p>
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {RECITERS.map((r, i) => (
            <button key={r.id}
              onClick={() => { setReciterIdx(i); reciterRef.current = RECITERS[i]; if (playing) stop() }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${reciterIdx === i ? 'bg-tamkeen-dark text-white border-tamkeen-dark' : 'border-gray-200 text-gray-500'}`}>
              {r.flag} {r.name}
            </button>
          ))}
        </div>
      </div>

      {/* Player bar */}
      <div className="card bg-tamkeen-dark text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-green-300 font-semibold uppercase tracking-wide">
              {playing ? '🔊 Playing Ruqyah' : '⏸ Paused'} · {currentIdx + 1}/{RUQYAH_ITEMS.length}
            </p>
            <p className="text-sm font-medium text-tamkeen-mint truncate">{RUQYAH_ITEMS[currentIdx]?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={cycleRepeat}
              className={`w-8 h-8 rounded-full flex items-center justify-center active:scale-90 ${repeatMode !== 'none' ? 'bg-tamkeen-mint text-tamkeen-dark' : 'bg-white/10'}`}>
              {repeatMode === 'one' ? <Repeat1 size={13} /> : <Repeat size={13} />}
            </button>
            <button onClick={prev}  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center active:scale-90"><SkipBack size={14} /></button>
            <button onClick={playing ? stop : () => play(currentIdx)}
              className="w-10 h-10 rounded-full bg-tamkeen-mint text-tamkeen-dark flex items-center justify-center active:scale-90">
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button onClick={next}  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center active:scale-90"><SkipForward size={14} /></button>
          </div>
        </div>
        <div className="flex gap-1">
          {RUQYAH_ITEMS.map((_, i) => (
            <button key={i} onClick={() => jumpTo(i)}
              className={`h-1.5 flex-1 rounded-full transition-all ${i === currentIdx ? 'bg-tamkeen-mint' : 'bg-white/20'}`} />
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {RUQYAH_ITEMS.map((item, i) => (
          <div key={i} className={`card transition-all border-2 ${playing && currentIdx === i ? 'border-tamkeen-light' : 'border-transparent'}`}>
            {playing && currentIdx === i && (
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 bg-tamkeen-light rounded-full animate-pulse" />
                <span className="text-[10px] text-tamkeen-light font-semibold uppercase tracking-wide">Now reciting</span>
              </div>
            )}
            <div className="flex items-start justify-between mb-1">
              <p className="text-[10px] text-gray-400 font-medium flex-1">{item.name}</p>
              <button onClick={() => playing && currentIdx === i ? stop() : play(i)}
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ml-2 transition-all active:scale-90 ${
                  playing && currentIdx === i ? 'bg-tamkeen-dark text-white' : 'bg-tamkeen-mint text-tamkeen-dark'
                }`}>
                {playing && currentIdx === i ? <Pause size={12} /> : <Play size={12} />}
              </button>
            </div>
            <p className="arabic text-xl text-tamkeen-ink mb-3 leading-loose">{item.arabic}</p>
            <p className="text-[10px] text-gray-400 italic mb-2">{item.transliteration}</p>
            <p className="text-sm text-gray-600 mb-2 leading-relaxed">{item.translation}</p>
            <p className="text-[10px] text-gray-400">{item.source}</p>
          </div>
        ))}
      </div>

      <div className="card bg-green-50 text-center">
        <p className="arabic text-xl text-tamkeen-dark mb-2">وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ</p>
        <p className="text-xs text-gray-500">"And when I am ill, it is He who cures me" — Quran 26:80</p>
      </div>
    </div>
  )
}
