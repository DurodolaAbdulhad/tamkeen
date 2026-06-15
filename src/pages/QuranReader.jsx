import { useState, useEffect, useRef, useMemo } from 'react'
import { BookOpen, Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, Search, X, Play, Pause, Volume2, Radio, Repeat, Repeat1 } from 'lucide-react'

// ─── RECITERS ────────────────────────────────────────────────────────────────
const RECITERS = [
  { flag: '🇰🇼', name: 'Mishary Alafasy',      networkId: 'ar.alafasy',               everyayahId: 'Alafasy_128kbps' },
  { flag: '🇸🇦', name: 'AbdurRahmaan Sudais',  networkId: 'ar.abdurrahmaansudais',     everyayahId: 'Abdurrahmaan_As-Sudais_192kbps' },
  { flag: '🇸🇦', name: 'Maher Al Muaiqly',     networkId: 'ar.maheralmuaiqly',         everyayahId: 'Maher_AlMuaiqly_128kbps' },
  { flag: '🇪🇬', name: 'Muhammad Al-Minshawi', networkId: 'ar.minshawi',               everyayahId: 'Minshawi_Mujawwad_128kbps' },
  { flag: '🇸🇦', name: 'Muhammad Ayyoub',      networkId: 'ar.muhammadayyoub',         everyayahId: 'Muhammad_Ayyoub_128kbps' },
  { flag: '🇪🇬', name: 'Mahmoud Al-Husary',    networkId: 'ar.husary',                 everyayahId: 'Husary_128kbps' },
]

function surahAudioUrl(networkId, surahNum) {
  return `https://cdn.islamic.network/quran/audio-surah/128/${networkId}/${surahNum}.mp3`
}
function ayahAudioUrl(everyayahId, surahNum, ayahNum) {
  return `https://everyayah.com/data/${everyayahId}/${String(surahNum).padStart(3,'0')}${String(ayahNum).padStart(3,'0')}.mp3`
}

const LS_BOOKMARKS = 'tamkeen_quran_bookmarks'
const LS_PROGRESS  = 'tamkeen_quran_progress'

function loadBookmarks() { try { return JSON.parse(localStorage.getItem(LS_BOOKMARKS)) || [] } catch { return [] } }
function saveBookmarks(b) { localStorage.setItem(LS_BOOKMARKS, JSON.stringify(b)) }
function loadProgress() { try { return JSON.parse(localStorage.getItem(LS_PROGRESS)) || { surah: 1, ayah: 1 } } catch { return { surah: 1, ayah: 1 } } }
function saveProgress(p) { localStorage.setItem(LS_PROGRESS, JSON.stringify(p)) }

// 114 surahs: [number, name, arabic name, ayah count, revelation type, meaning]
const SURAHS = [
  [1,'Al-Fatihah','الفاتحة',7,'Meccan','The Opening'],
  [2,'Al-Baqarah','البقرة',286,'Medinan','The Cow'],
  [3,'Ali \'Imran','آل عمران',200,'Medinan','Family of Imran'],
  [4,'An-Nisa\'','النساء',176,'Medinan','The Women'],
  [5,'Al-Ma\'idah','المائدة',120,'Medinan','The Table Spread'],
  [6,'Al-An\'am','الأنعام',165,'Meccan','The Cattle'],
  [7,'Al-A\'raf','الأعراف',206,'Meccan','The Heights'],
  [8,'Al-Anfal','الأنفال',75,'Medinan','The Spoils of War'],
  [9,'At-Tawbah','التوبة',129,'Medinan','The Repentance'],
  [10,'Yunus','يونس',109,'Meccan','Jonah'],
  [11,'Hud','هود',123,'Meccan','Hud'],
  [12,'Yusuf','يوسف',111,'Meccan','Joseph'],
  [13,'Ar-Ra\'d','الرعد',43,'Medinan','The Thunder'],
  [14,'Ibrahim','إبراهيم',52,'Meccan','Abraham'],
  [15,'Al-Hijr','الحجر',99,'Meccan','The Rocky Tract'],
  [16,'An-Nahl','النحل',128,'Meccan','The Bees'],
  [17,'Al-Isra\'','الإسراء',111,'Meccan','The Night Journey'],
  [18,'Al-Kahf','الكهف',110,'Meccan','The Cave'],
  [19,'Maryam','مريم',98,'Meccan','Mary'],
  [20,'Ta-Ha','طه',135,'Meccan','Ta-Ha'],
  [21,'Al-Anbiya\'','الأنبياء',112,'Meccan','The Prophets'],
  [22,'Al-Hajj','الحج',78,'Medinan','The Pilgrimage'],
  [23,'Al-Mu\'minun','المؤمنون',118,'Meccan','The Believers'],
  [24,'An-Nur','النور',64,'Medinan','The Light'],
  [25,'Al-Furqan','الفرقان',77,'Meccan','The Criterion'],
  [26,'Ash-Shu\'ara\'','الشعراء',227,'Meccan','The Poets'],
  [27,'An-Naml','النمل',93,'Meccan','The Ant'],
  [28,'Al-Qasas','القصص',88,'Meccan','The Stories'],
  [29,'Al-\'Ankabut','العنكبوت',69,'Meccan','The Spider'],
  [30,'Ar-Rum','الروم',60,'Meccan','The Romans'],
  [31,'Luqman','لقمان',34,'Meccan','Luqman'],
  [32,'As-Sajdah','السجدة',30,'Meccan','The Prostration'],
  [33,'Al-Ahzab','الأحزاب',73,'Medinan','The Combined Forces'],
  [34,'Saba\'','سبأ',54,'Meccan','Sheba'],
  [35,'Fatir','فاطر',45,'Meccan','Originator'],
  [36,'Ya-Sin','يس',83,'Meccan','Ya-Sin'],
  [37,'As-Saffat','الصافات',182,'Meccan','Those Who Set the Ranks'],
  [38,'Sad','ص',88,'Meccan','Sad'],
  [39,'Az-Zumar','الزمر',75,'Meccan','The Troops'],
  [40,'Ghafir','غافر',85,'Meccan','The Forgiver'],
  [41,'Fussilat','فصلت',54,'Meccan','Explained in Detail'],
  [42,'Ash-Shura','الشورى',53,'Meccan','The Consultation'],
  [43,'Az-Zukhruf','الزخرف',89,'Meccan','The Ornaments of Gold'],
  [44,'Ad-Dukhan','الدخان',59,'Meccan','The Smoke'],
  [45,'Al-Jathiyah','الجاثية',37,'Meccan','The Crouching'],
  [46,'Al-Ahqaf','الأحقاف',35,'Meccan','The Wind-Curved Sandhills'],
  [47,'Muhammad','محمد',38,'Medinan','Muhammad'],
  [48,'Al-Fath','الفتح',29,'Medinan','The Victory'],
  [49,'Al-Hujurat','الحجرات',18,'Medinan','The Rooms'],
  [50,'Qaf','ق',45,'Meccan','Qaf'],
  [51,'Adh-Dhariyat','الذاريات',60,'Meccan','The Winnowing Winds'],
  [52,'At-Tur','الطور',49,'Meccan','The Mount'],
  [53,'An-Najm','النجم',62,'Meccan','The Star'],
  [54,'Al-Qamar','القمر',55,'Meccan','The Moon'],
  [55,'Ar-Rahman','الرحمن',78,'Medinan','The Beneficent'],
  [56,'Al-Waqi\'ah','الواقعة',96,'Meccan','The Inevitable'],
  [57,'Al-Hadid','الحديد',29,'Medinan','The Iron'],
  [58,'Al-Mujadila','المجادلة',22,'Medinan','The Pleading Woman'],
  [59,'Al-Hashr','الحشر',24,'Medinan','The Exile'],
  [60,'Al-Mumtahanah','الممتحنة',13,'Medinan','She Who is to be Examined'],
  [61,'As-Saf','الصف',14,'Medinan','The Ranks'],
  [62,'Al-Jumu\'ah','الجمعة',11,'Medinan','The Congregation, Friday'],
  [63,'Al-Munafiqun','المنافقون',11,'Medinan','The Hypocrites'],
  [64,'At-Taghabun','التغابن',18,'Medinan','Mutual Disillusion'],
  [65,'At-Talaq','الطلاق',12,'Medinan','Divorce'],
  [66,'At-Tahrim','التحريم',12,'Medinan','The Prohibition'],
  [67,'Al-Mulk','الملك',30,'Meccan','The Sovereignty'],
  [68,'Al-Qalam','القلم',52,'Meccan','The Pen'],
  [69,'Al-Haqqah','الحاقة',52,'Meccan','The Reality'],
  [70,'Al-Ma\'arij','المعارج',44,'Meccan','The Ascending Stairways'],
  [71,'Nuh','نوح',28,'Meccan','Noah'],
  [72,'Al-Jinn','الجن',28,'Meccan','The Jinn'],
  [73,'Al-Muzzammil','المزمل',20,'Meccan','The Enshrouded One'],
  [74,'Al-Muddaththir','المدثر',56,'Meccan','The Cloaked One'],
  [75,'Al-Qiyamah','القيامة',40,'Meccan','The Resurrection'],
  [76,'Al-Insan','الإنسان',31,'Medinan','The Human'],
  [77,'Al-Mursalat','المرسلات',50,'Meccan','The Emissaries'],
  [78,'An-Naba\'','النبأ',40,'Meccan','The Tidings'],
  [79,'An-Nazi\'at','النازعات',46,'Meccan','Those Who Drag Forth'],
  [80,'\'Abasa','عبس',42,'Meccan','He Frowned'],
  [81,'At-Takwir','التكوير',29,'Meccan','The Overthrowing'],
  [82,'Al-Infitar','الإنفطار',19,'Meccan','The Cleaving'],
  [83,'Al-Mutaffifin','المطففين',36,'Meccan','The Defrauding'],
  [84,'Al-Inshiqaq','الانشقاق',25,'Meccan','The Sundering'],
  [85,'Al-Buruj','البروج',22,'Meccan','The Mansions of the Stars'],
  [86,'At-Tariq','الطارق',17,'Meccan','The Morning Star'],
  [87,'Al-A\'la','الأعلى',19,'Meccan','The Most High'],
  [88,'Al-Ghashiyah','الغاشية',26,'Meccan','The Overwhelming'],
  [89,'Al-Fajr','الفجر',30,'Meccan','The Dawn'],
  [90,'Al-Balad','البلد',20,'Meccan','The City'],
  [91,'Ash-Shams','الشمس',15,'Meccan','The Sun'],
  [92,'Al-Layl','الليل',21,'Meccan','The Night'],
  [93,'Ad-Duha','الضحى',11,'Meccan','The Morning Hours'],
  [94,'Ash-Sharh','الشرح',8,'Meccan','The Relief'],
  [95,'At-Tin','التين',8,'Meccan','The Fig'],
  [96,'Al-\'Alaq','العلق',19,'Meccan','The Clot'],
  [97,'Al-Qadr','القدر',5,'Meccan','The Power'],
  [98,'Al-Bayyinah','البينة',8,'Medinan','The Clear Proof'],
  [99,'Az-Zalzalah','الزلزلة',8,'Medinan','The Earthquake'],
  [100,'Al-\'Adiyat','العاديات',11,'Meccan','The Courser'],
  [101,'Al-Qari\'ah','القارعة',11,'Meccan','The Calamity'],
  [102,'At-Takathur','التكاثر',8,'Meccan','The Rivalry in World Increase'],
  [103,'Al-\'Asr','العصر',3,'Meccan','The Declining Day'],
  [104,'Al-Humazah','الهمزة',9,'Meccan','The Traducer'],
  [105,'Al-Fil','الفيل',5,'Meccan','The Elephant'],
  [106,'Quraysh','قريش',4,'Meccan','Quraysh'],
  [107,'Al-Ma\'un','الماعون',7,'Meccan','The Small Kindnesses'],
  [108,'Al-Kawthar','الكوثر',3,'Meccan','The Abundance'],
  [109,'Al-Kafirun','الكافرون',6,'Meccan','The Disbelievers'],
  [110,'An-Nasr','النصر',3,'Medinan','The Divine Support'],
  [111,'Al-Masad','المسد',5,'Meccan','The Palm Fibre'],
  [112,'Al-Ikhlas','الإخلاص',4,'Meccan','The Sincerity'],
  [113,'Al-Falaq','الفلق',5,'Meccan','The Daybreak'],
  [114,'An-Nas','الناس',6,'Meccan','Mankind'],
]

export default function QuranReader() {
  const [view,      setView]      = useState('surah-list')
  const [surahNum,  setSurahNum]  = useState(loadProgress().surah)
  const [ayahs,     setAyahs]     = useState([])
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const [bookmarks, setBookmarks] = useState(loadBookmarks)
  const [search,    setSearch]    = useState('')
  const [fontSize,  setFontSize]  = useState(22)
  const [reciterIdx, setReciterIdx] = useState(0)
  const [audioPlaying,  setAudioPlaying]  = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioLoading,  setAudioLoading]  = useState(false)
  const [playingAyah,   setPlayingAyah]   = useState(null)
  const [repeatMode,    setRepeatMode]    = useState('none') // 'none' | 'ayah' | 'surah'
  const audioRef   = useRef(null)
  const repeatRef  = useRef('none')

  const reciter = RECITERS[reciterIdx]

  // Stop audio when leaving reader
  useEffect(() => {
    if (view !== 'reader') {
      audioRef.current?.pause()
      setAudioPlaying(false)
      setAudioProgress(0)
      setPlayingAyah(null)
    }
  }, [view])

  // Stop audio when surah changes
  useEffect(() => {
    audioRef.current?.pause()
    setAudioPlaying(false)
    setAudioProgress(0)
    setPlayingAyah(null)
  }, [surahNum])

  const cycleRepeat = () => {
    setRepeatMode((m) => {
      const next = m === 'none' ? 'surah' : m === 'surah' ? 'ayah' : 'none'
      repeatRef.current = next
      return next
    })
  }

  const toggleSurahAudio = () => {
    const url = surahAudioUrl(reciter.networkId, surahNum)
    if (!audioRef.current) audioRef.current = new Audio()
    const audio = audioRef.current

    if (audioPlaying) {
      audio.pause()
      setAudioPlaying(false)
      return
    }

    if (!audio.src || !audio.src.includes(`/${surahNum}.mp3`)) {
      audio.src = url
      setAudioProgress(0)
    }

    setAudioLoading(true)

    audio.oncanplay = () => setAudioLoading(false)

    audio.play()
      .then(() => { setAudioPlaying(true) })
      .catch(() => { setAudioLoading(false) })

    audio.ontimeupdate = () => {
      if (audio.duration) setAudioProgress(audio.currentTime / audio.duration)
    }
    audio.onended = () => {
      if (repeatRef.current === 'surah') {
        audio.currentTime = 0
        audio.play().catch(() => {})
        setAudioProgress(0)
      } else {
        setAudioPlaying(false)
        setAudioProgress(0)
      }
    }
  }

  const playAyah = (ayahNum) => {
    const url = ayahAudioUrl(reciter.everyayahId, surahNum, ayahNum)
    if (!audioRef.current) audioRef.current = new Audio()
    const audio = audioRef.current

    if (playingAyah === ayahNum) {
      audio.pause()
      setPlayingAyah(null)
      setAudioPlaying(false)
      return
    }

    audio.pause()
    audio.ontimeupdate = null
    audio.oncanplay = null
    audio.src = url
    audio.play().catch(() => {})
    setPlayingAyah(ayahNum)
    setAudioPlaying(false)

    const repeatAyah = () => {
      if (repeatRef.current === 'ayah') {
        audio.currentTime = 0
        audio.play().catch(() => {})
      } else {
        setPlayingAyah(null)
      }
    }
    audio.onended = repeatAyah
  }

  const surahInfo = SURAHS.find((s) => s[0] === surahNum)

  useEffect(() => {
    if (view !== 'reader') return
    const load = async () => {
      setLoading(true); setError(null)
      try {
        const res  = await fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/editions/quran-simple,en.asad`)
        const json = await res.json()
        if (json.code !== 200) throw new Error('Failed to load')
        const arabic  = json.data[0].ayahs
        const english = json.data[1].ayahs
        setAyahs(arabic.map((a, i) => ({
          num:    a.numberInSurah,
          arabic: a.text,
          english: english[i]?.text || '',
        })))
        saveProgress({ surah: surahNum })
      } catch (e) {
        setError('Could not load surah. Check your internet connection.')
      }
      setLoading(false)
    }
    load()
  }, [surahNum, view])

  const isBookmarked = (surah, ayah) => bookmarks.some((b) => b.s === surah && b.a === ayah)

  const toggleBookmark = (surah, ayah, text) => {
    setBookmarks((b) => {
      const exists = b.some((x) => x.s === surah && x.a === ayah)
      const next = exists ? b.filter((x) => !(x.s === surah && x.a === ayah)) : [...b, { s: surah, a: ayah, text, surahName: SURAHS[surah-1][1], added: new Date().toISOString() }]
      saveBookmarks(next)
      return next
    })
  }

  const filteredSurahs = useMemo(() => {
    if (!search.trim()) return SURAHS
    const q = search.toLowerCase()
    return SURAHS.filter((s) => s[1].toLowerCase().includes(q) || s[2].includes(q) || s[5].toLowerCase().includes(q))
  }, [search])

  const prev = () => { if (surahNum > 1) { setSurahNum((n) => n - 1); setAyahs([]) } }
  const next = () => { if (surahNum < 114) { setSurahNum((n) => n + 1); setAyahs([]) } }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        {view === 'reader' && (
          <button onClick={() => setView('surah-list')} className="p-2 rounded-xl bg-gray-100">
            <ChevronLeft size={18} />
          </button>
        )}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-tamkeen-ink">
            {view === 'reader' && surahInfo ? `${surahInfo[2]} — ${surahInfo[1]}` : 'Quran Reader'}
          </h2>
          <p className="text-sm text-gray-500">
            {view === 'reader' && surahInfo ? `Surah ${surahNum} · ${surahInfo[3]} ayahs · ${surahInfo[4]}` : '114 Surahs'}
          </p>
        </div>
        <button onClick={() => setView(view === 'bookmarks' ? 'surah-list' : 'bookmarks')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1 ${view === 'bookmarks' ? 'bg-tamkeen-mint text-tamkeen-dark border-tamkeen-light' : 'border-gray-200 text-gray-500'}`}>
          <Bookmark size={12} /> {bookmarks.length}
        </button>
      </div>

      {/* SURAH LIST */}
      {view === 'surah-list' && (
        <>
          {/* Continue reading */}
          {loadProgress().surah > 1 && (
            <div onClick={() => { setSurahNum(loadProgress().surah); setView('reader') }}
              className="card bg-tamkeen-dark text-white flex items-center gap-3 cursor-pointer active:scale-95 transition-transform">
              <BookOpen size={20} className="text-tamkeen-mint" />
              <div>
                <p className="text-xs text-green-200">Continue reading</p>
                <p className="font-semibold">Surah {loadProgress().surah} — {SURAHS[loadProgress().surah-1]?.[1]}</p>
              </div>
              <ChevronRight size={16} className="ml-auto text-green-300" />
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9 text-sm" placeholder="Search surahs…" value={search}
              onChange={(e) => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={14} className="text-gray-400" /></button>}
          </div>

          {/* Surah list */}
          <div className="space-y-1.5">
            {filteredSurahs.map(([num, name, arabic, count, type, meaning]) => (
              <button key={num} onClick={() => { setSurahNum(num); setView('reader') }}
                className="w-full flex items-center gap-3 py-3 px-4 rounded-2xl bg-white border border-gray-100 hover:border-tamkeen-light transition-all active:scale-95 text-left">
                <div className="w-8 h-8 bg-tamkeen-mint text-tamkeen-dark rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {num}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-tamkeen-ink">{name}</p>
                  <p className="text-xs text-gray-400">{meaning} · {count} ayahs · {type}</p>
                </div>
                <p className="arabic text-lg text-tamkeen-dark">{arabic}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {/* READER */}
      {view === 'reader' && (
        <>
          {/* Reciter selector */}
          <div className="card py-3">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
              <Radio size={10} /> Reciter
            </p>
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              {RECITERS.map((r, i) => (
                <button key={r.networkId} onClick={() => { setReciterIdx(i); audioRef.current?.pause(); setAudioPlaying(false); setAudioProgress(0) }}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${reciterIdx === i ? 'bg-tamkeen-dark text-white border-tamkeen-dark' : 'border-gray-200 text-gray-500'}`}>
                  {r.flag} {r.name}
                </button>
              ))}
            </div>
          </div>

          {/* Surah audio player */}
          <div className="card bg-tamkeen-dark text-white py-3">
            <div className="flex items-center gap-3">
              <button onClick={toggleSurahAudio}
                className="w-10 h-10 bg-tamkeen-mint text-tamkeen-dark rounded-full flex items-center justify-center flex-shrink-0 active:scale-90 transition-all">
                {audioLoading
                  ? <div className="w-4 h-4 border-2 border-tamkeen-dark border-t-transparent rounded-full animate-spin" />
                  : audioPlaying ? <Pause size={16} /> : <Play size={16} />
                }
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-green-200 font-semibold">
                  Full Surah Audio {audioLoading ? '— buffering…' : ''}
                </p>
                <p className="text-sm font-medium text-tamkeen-mint truncate">{surahInfo?.[1]} — {reciter.flag} {reciter.name}</p>
                <div className="h-1 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-tamkeen-mint rounded-full transition-all" style={{ width: `${audioProgress * 100}%` }} />
                </div>
              </div>
              {/* Repeat toggle */}
              <button onClick={cycleRepeat} title={`Repeat: ${repeatMode}`}
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90 ${
                  repeatMode !== 'none' ? 'bg-tamkeen-mint text-tamkeen-dark' : 'bg-white/10 text-green-300'
                }`}>
                {repeatMode === 'ayah' ? <Repeat1 size={15} /> : <Repeat size={15} />}
              </button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-[10px] text-green-400">
                Tap ayah number for that verse · ▶ for full surah
              </p>
              {repeatMode !== 'none' && (
                <span className="text-[9px] bg-tamkeen-mint text-tamkeen-dark font-bold px-2 py-0.5 rounded-full">
                  {repeatMode === 'ayah' ? '🔂 Repeat Ayah' : '🔁 Repeat Surah'}
                </span>
              )}
            </div>
          </div>

          {/* Font size */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">Text size</span>
            <div className="flex gap-2">
              {[18, 22, 26, 30].map((s) => (
                <button key={s} onClick={() => setFontSize(s)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${fontSize === s ? 'bg-tamkeen-dark text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {s === 18 ? 'S' : s === 22 ? 'M' : s === 26 ? 'L' : 'XL'}
                </button>
              ))}
            </div>
            <span className="ml-auto text-xs text-gray-400">{surahInfo?.[3]} ayahs</span>
          </div>

          {/* Surah navigation */}
          <div className="flex items-center gap-3">
            <button onClick={prev} disabled={surahNum <= 1}
              className="flex items-center gap-1 text-xs text-tamkeen-dark font-medium disabled:opacity-30">
              <ChevronLeft size={16} /> Prev
            </button>
            <div className="flex-1 text-center text-sm font-medium text-tamkeen-ink">
              {surahNum} / 114
            </div>
            <button onClick={next} disabled={surahNum >= 114}
              className="flex items-center gap-1 text-xs text-tamkeen-dark font-medium disabled:opacity-30">
              Next <ChevronRight size={16} />
            </button>
          </div>

          {/* Bismillah (not for Al-Fatiha surah 1 or At-Tawbah surah 9) */}
          {surahNum !== 9 && (
            <div className="text-center py-4">
              <p className="arabic text-3xl text-tamkeen-dark" style={{ lineHeight: 2.2 }}>
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-tamkeen-dark border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm text-gray-400">Loading {surahInfo?.[1]}…</p>
            </div>
          )}

          {error && (
            <div className="card bg-red-50 text-center">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* Ayahs */}
          {!loading && !error && (
            <div className="space-y-4 pb-6">
              {ayahs.map((ayah) => (
                <div key={ayah.num} className={`card transition-all ${playingAyah === ayah.num ? 'border-2 border-tamkeen-light' : ''}`}>
                  <div className="flex justify-between items-start mb-3">
                    <button onClick={() => playAyah(ayah.num)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all active:scale-90 ${
                        playingAyah === ayah.num ? 'bg-tamkeen-dark text-white' : 'bg-tamkeen-mint text-tamkeen-dark'
                      }`}>
                      {playingAyah === ayah.num ? <Volume2 size={12} /> : ayah.num}
                    </button>
                    <button onClick={() => toggleBookmark(surahNum, ayah.num, ayah.arabic)}>
                      {isBookmarked(surahNum, ayah.num)
                        ? <BookmarkCheck size={18} className="text-tamkeen-dark" />
                        : <Bookmark size={18} className="text-gray-200" />
                      }
                    </button>
                  </div>
                  <p className="arabic text-right leading-loose text-tamkeen-ink mb-4"
                    style={{ fontSize: `${fontSize}px` }}>
                    {ayah.arabic}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">{ayah.english}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* BOOKMARKS */}
      {view === 'bookmarks' && (
        <>
          <p className="text-sm text-gray-500">{bookmarks.length} saved ayah{bookmarks.length !== 1 ? 's' : ''}</p>
          {bookmarks.length === 0 ? (
            <div className="text-center py-12">
              <Bookmark size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">No bookmarks yet — tap 🔖 next to any ayah</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarks.map((b) => (
                <div key={`${b.s}-${b.a}`} className="card">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs text-tamkeen-light font-semibold">{b.surahName} {b.s}:{b.a}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setSurahNum(b.s); setView('reader') }}
                        className="text-xs text-tamkeen-dark font-medium">Read →</button>
                      <button onClick={() => toggleBookmark(b.s, b.a, b.text)} className="text-gray-300">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="arabic text-xl text-tamkeen-ink">{b.text}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
