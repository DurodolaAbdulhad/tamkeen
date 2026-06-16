import { useState, useRef, useCallback, useEffect } from 'react'
import { Play, Pause, Volume2 } from 'lucide-react'

const QUNOOT_ITEMS = [
  {
    id: 'prophetic',
    name: "Prophetic Qunoot (Complete)",
    subtitle: 'دعاء القنوت النبوي الكامل',
    badge: 'From the Prophet ﷺ',
    arabic: 'اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ، وَعَافِنِي فِيمَنْ عَافَيْتَ، وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ، وَبَارِكْ لِي فِيمَا أَعْطَيْتَ، وَقِنِي شَرَّ مَا قَضَيْتَ، فَإِنَّكَ تَقْضِي وَلَا يُقْضَى عَلَيْكَ، وَإِنَّهُ لَا يَذِلُّ مَنْ وَالَيْتَ، وَلَا يَعِزُّ مَنْ عَادَيْتَ، تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ، وَصَلَّى اللَّهُ عَلَى النَّبِيِّ مُحَمَّدٍ',
    transliteration: [
      "Allahumma ihdini fiman hadayt",
      "wa 'afini fiman 'afayt",
      "wa tawallani fiman tawallayt",
      "wa barik li fima a'tayt",
      "wa qini sharra ma qadayt",
      "fa innaka taqdi wa la yuqda 'alayk",
      "wa innahu la yadhillu man walayt",
      "wa la ya'izzu man 'adayt",
      "tabarakta rabbana wa ta'alayt",
      "wa sallallahu 'ala al-nabiyyi Muhammad",
    ],
    translation: [
      "O Allah, guide me among those You have guided,",
      "grant me wellbeing among those You have granted wellbeing,",
      "befriend me among those You have befriended,",
      "bless me in what You have given me,",
      "protect me from the evil of what You have decreed —",
      "for You decree and none decrees against You.",
      "Verily, whoever You befriend is not humiliated,",
      "and whoever You oppose is not honoured.",
      "Blessed are You, our Lord, Most High.",
      "And may Allah's peace and blessings be upon the Prophet Muhammad.",
    ],
    source: 'Complete version with salawat — Tirmidhi 464, Abu Dawud 1425. Taught by the Prophet ﷺ to his grandson Hasan ibn Ali. This is the most authentic and complete form, recited after ruku in the last rak\'ah of Witr.',
  },
  {
    id: 'witr',
    name: "Du'a Qunoot al-Witr",
    subtitle: 'دعاء قنوت الوتر',
    badge: 'Nightly Witr',
    arabic: 'اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ، وَعَافِنِي فِيمَنْ عَافَيْتَ، وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ، وَبَارِكْ لِي فِيمَا أَعْطَيْتَ، وَقِنِي شَرَّ مَا قَضَيْتَ، فَإِنَّكَ تَقْضِي وَلَا يُقْضَى عَلَيْكَ، وَإِنَّهُ لَا يَذِلُّ مَنْ وَالَيْتَ، وَلَا يَعِزُّ مَنْ عَادَيْتَ، تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ',
    transliteration: [
      "Allahumma ihdini fiman hadayt",
      "wa 'afini fiman 'afayt",
      "wa tawallani fiman tawallayt",
      "wa barik li fima a'tayt",
      "wa qini sharra ma qadayt",
      "fa innaka taqdi wa la yuqda 'alayk",
      "wa innahu la yadhillu man walayt",
      "wa la ya'izzu man 'adayt",
      "tabarakta rabbana wa ta'alayt",
    ],
    translation: [
      "O Allah, guide me among those You have guided,",
      "grant me wellbeing among those You have granted wellbeing,",
      "befriend me among those You have befriended,",
      "bless me in what You have given me,",
      "protect me from the evil of what You have decreed —",
      "for You decree and none decrees against You.",
      "Verily, whoever You befriend is not humiliated,",
      "and whoever You oppose is not honoured.",
      "Blessed are You, our Lord, Most High.",
    ],
    source: 'Transmitted from Hasan ibn Ali (رضي الله عنه) — Tirmidhi 464, Abu Dawud 1425, Ibn Majah 1178. Recited after ruku in the last rak\'ah of Witr prayer.',
  },
  {
    id: 'nazilah',
    name: "Du'a Qunoot al-Nazilah",
    subtitle: 'دعاء قنوت النازلة',
    badge: 'Calamity supplication',
    arabic: 'اللَّهُمَّ اهْدِنَا فِيمَنْ هَدَيْتَ، وَعَافِنَا فِيمَنْ عَافَيْتَ، وَتَوَلَّنَا فِيمَنْ تَوَلَّيْتَ، وَبَارِكْ لَنَا فِيمَا أَعْطَيْتَ، وَقِنَا شَرَّ مَا قَضَيْتَ، إِنَّكَ تَقْضِي وَلَا يُقْضَى عَلَيْكَ، وَإِنَّهُ لَا يَذِلُّ مَنْ وَالَيْتَ، تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ، وَصَلَّى اللَّهُ عَلَى النَّبِيِّ مُحَمَّدٍ',
    transliteration: [
      "Allahumma ihdina fiman hadayt",
      "wa 'afina fiman 'afayt",
      "wa tawallana fiman tawallayt",
      "wa barik lana fima a'tayt",
      "wa qina sharra ma qadayt",
      "innaka taqdi wa la yuqda 'alayk",
      "wa innahu la yadhillu man walayt",
      "tabarakta rabbana wa ta'alayt",
      "wa sallallahu 'ala al-nabiyyi Muhammad",
    ],
    translation: [
      "O Allah, guide us among those You have guided,",
      "grant us wellbeing among those You have granted wellbeing,",
      "befriend us among those You have befriended,",
      "bless us in what You have given us,",
      "protect us from the evil of what You have decreed —",
      "for You decree and none decrees against You.",
      "Verily, whoever You befriend is not humiliated.",
      "Blessed are You, our Lord, Most High.",
      "And may Allah's peace and blessings be upon the Prophet Muhammad.",
    ],
    source: 'Qunoot al-Nazilah is performed in Fajr (or all 5 prayers) during times of calamity. The Prophet ﷺ performed it for an entire month after the massacre at Bi\'r Ma\'unah (Sahih Bukhari 1002). Recite during ruku or after it.',
  },
  {
    id: 'fajr',
    name: "Extended Qunoot for Fajr",
    subtitle: 'قنوت الفجر الموسع',
    badge: 'Imam Shafi\'i tradition',
    arabic: 'اللَّهُمَّ إِنَّا نَسْتَعِينُكَ وَنَسْتَغْفِرُكَ وَنَسْتَهْدِيكَ وَنُؤْمِنُ بِكَ وَنَتَوَكَّلُ عَلَيْكَ وَنُثْنِي عَلَيْكَ الْخَيْرَ كُلَّهُ، نَشْكُرُكَ وَلَا نَكْفُرُكَ، وَنَخْلَعُ وَنَتْرُكُ مَنْ يَفْجُرُكَ، اللَّهُمَّ إِيَّاكَ نَعْبُدُ وَلَكَ نُصَلِّي وَنَسْجُدُ وَإِلَيْكَ نَسْعَى وَنَحْفِدُ نَرْجُو رَحْمَتَكَ وَنَخْشَى عَذَابَكَ إِنَّ عَذَابَكَ بِالْكَافِرِينَ مُلْحِقٌ',
    transliteration: [
      "Allahumma inna nasta'inuka wa nastaghfiruka wa nastahdika",
      "wa nu'minu bika wa natawakkalu 'alayk",
      "wa nuthni 'alayka al-khayra kullahu, nashkuruka wa la nakfuruk",
      "wa nakhla'u wa natruku man yafajuruk",
      "Allahumma iyyaka na'budu wa laka nusalli wa nasjudu",
      "wa ilayka nas'a wa nahfidu",
      "narju rahmataka wa nakhsha 'adhabak",
      "inna 'adhabaka bil-kafirin mulhiq",
    ],
    translation: [
      "O Allah, we seek Your help, Your forgiveness, and Your guidance.",
      "We believe in You and place our trust in You.",
      "We praise You with all goodness, we thank You and do not deny You.",
      "We disavow and abandon all who disobey You.",
      "O Allah, You alone we worship, to You alone we pray and prostrate,",
      "toward You we strive and hasten.",
      "We hope for Your mercy and fear Your punishment.",
      "Verily Your punishment will reach the disbelievers.",
    ],
    source: 'Narrated by Umar ibn al-Khattab (رضي الله عنه) — classified by scholars as Qunoot for Fajr. Widely recited in the Shafi\'i tradition as congregational Fajr Qunoot.',
  },
  {
    id: 'personal',
    name: "Personal Qunoot — Du'a for Yourself",
    subtitle: 'دعاء قنوت شخصي',
    badge: 'Personal supplication',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى، اللَّهُمَّ إِنِّي أَسْأَلُكَ الثَّبَاتَ فِي الأَمْرِ وَالْعَزِيمَةَ عَلَى الرُّشْدِ، وَأَسْأَلُكَ شُكْرَ نِعْمَتِكَ وَحُسْنَ عِبَادَتِكَ، وَأَسْأَلُكَ قَلْبًا سَلِيمًا وَلِسَانًا صَادِقًا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا تَعْلَمُ، وَأَسْأَلُكَ مِنْ خَيْرِ مَا تَعْلَمُ، وَأَسْتَغْفِرُكَ مِمَّا تَعْلَمُ، إِنَّكَ أَنْتَ عَلَّامُ الْغُيُوبِ',
    transliteration: [
      "Allahumma inni as'aluka al-huda wa al-tuqa wa al-'afafa wa al-ghina",
      "Allahumma inni as'aluka al-thabata fi al-amri wa al-'azimata 'ala al-rushd",
      "wa as'aluka shukra ni'matika wa husna 'ibadatik",
      "wa as'aluka qalban saliman wa lisanan sadiqan",
      "wa a'udhu bika min sharri ma ta'lam",
      "wa as'aluka min khayri ma ta'lam",
      "wa astaghfiruka mimma ta'lam",
      "innaka anta 'allamu al-ghuyub",
    ],
    translation: [
      "O Allah, I ask You for guidance, piety, chastity, and contentment.",
      "O Allah, I ask You for steadfastness in my affairs and determination upon righteousness.",
      "I ask You to be grateful for Your blessings and to worship You well.",
      "I ask You for a sound heart and a truthful tongue.",
      "I seek refuge in You from the evil of what You know,",
      "and I ask You for the good of what You know,",
      "and I seek Your forgiveness for what You know.",
      "Truly, You are the Knower of all that is hidden.",
    ],
    source: 'Compiled from authentic prophetic supplications — Ibn Mas\'ud (رضي الله عنه) reported the Prophet ﷺ saying: "Ask Allah for health, wellbeing, and certainty in this world and the hereafter." (Ahmad, Tirmidhi 3558)',
  },
  {
    id: 'ummah',
    name: "Qunoot for the Muslim Ummah",
    subtitle: 'قنوت للأمة الإسلامية',
    badge: 'Du\'a al-Nazilah',
    arabic: 'اللَّهُمَّ انْصُرِ الْمُسْتَضْعَفِينَ مِنَ الْمُؤْمِنِينَ، اللَّهُمَّ اشْدُدْ وَطْأَتَكَ عَلَى الظَّالِمِينَ، اللَّهُمَّ فَرِّجْ عَنِ الْمَكْرُوبِينَ وَاكْشِفِ الْبَلَاءَ عَنِ الْمُبْتَلَيْنَ، اللَّهُمَّ آمِنِ الْخَائِفِينَ وَاشْفِ الْمَرْضَى وَارْحَمِ الْمَوْتَى، اللَّهُمَّ أَعِزَّ الْإِسْلَامَ وَالْمُسْلِمِينَ وَأَذِلَّ الشِّرْكَ وَالْمُشْرِكِينَ، وَاحْفَظِ الدِّينَ وَأَهْلَهُ وَانْصُرِ الْإِسْلَامَ وَأَهْلَهُ',
    transliteration: [
      "Allahumma unsuri al-mustad'afina min al-mu'minin",
      "Allahumma ushdud wat'ataka 'ala al-zalimin",
      "Allahumma farrij 'an al-makrubin wa ushfi al-bala'a 'an al-mubtalayin",
      "Allahumma amin al-kha'ifin wa ashfi al-marda wa arham al-mawta",
      "Allahumma a'izza al-islama wa al-muslimin",
      "wa adhilla al-shirka wa al-mushrikin",
      "wa ihfadh al-dina wa ahlahu wa unsuri al-islama wa ahlahu",
    ],
    translation: [
      "O Allah, give victory to the oppressed believers.",
      "O Allah, tighten Your grip upon the oppressors.",
      "O Allah, relieve the distressed and lift affliction from the afflicted.",
      "O Allah, grant safety to the fearful, heal the sick, and have mercy on the dead.",
      "O Allah, honour Islam and the Muslims,",
      "and humiliate shirk and those who commit it,",
      "preserve the religion and its people, and give victory to Islam and its people.",
    ],
    source: 'Du\'a al-Nazilah — recited during times of collective hardship. The Prophet ﷺ performed Qunoot al-Nazilah for an entire month in Fajr prayer (Sahih Bukhari 1002). It is sunnah to add specific du\'a for the Ummah.',
  },
]

function speak(text, onDone) {
  if (!window.speechSynthesis) { onDone?.(); return }
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'ar-SA'; utter.rate = 0.62; utter.pitch = 1
  const voices = window.speechSynthesis.getVoices()
  const best = voices.find(v => /Majed|Maged/i.test(v.name)) || voices.find(v => v.lang === 'ar-SA') || voices.find(v => v.lang.startsWith('ar'))
  if (best) utter.voice = best
  utter.onend = onDone; utter.onerror = onDone
  window.speechSynthesis.speak(utter)
}

function QunootCard({ item }) {
  const [playing, setPlaying] = useState(false)
  const [lineIdx, setLineIdx] = useState(-1)
  const stateRef = useRef({ playing: false, idx: -1 })

  const playLine = useCallback((idx) => {
    const allLines = item.transliteration
    if (idx >= allLines.length) {
      stateRef.current.playing = false; stateRef.current.idx = -1
      setPlaying(false); setLineIdx(-1); window.speechSynthesis?.cancel()
      return
    }
    stateRef.current.idx = idx; stateRef.current.playing = true
    setLineIdx(idx); setPlaying(true)

    // Split Arabic by comma or use full text for single-line items
    const arabicParts = item.arabic.split(/[،,]/)
    const arabicPart = arabicParts[idx]?.trim() || item.arabic
    speak(arabicPart, () => {
      if (stateRef.current.playing) playLine(stateRef.current.idx + 1)
    })
  }, [item])

  const playAll = useCallback(() => {
    if (playing) {
      stateRef.current.playing = false
      window.speechSynthesis?.cancel()
      setPlaying(false); setLineIdx(-1)
      return
    }
    speak(item.arabic, () => { stateRef.current.playing = false; setPlaying(false); setLineIdx(-1) })
    stateRef.current.playing = true; stateRef.current.idx = 0
    setPlaying(true); setLineIdx(0)
  }, [playing, item])

  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  return (
    <div className="card space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-tamkeen-mint text-tamkeen-dark rounded-full">{item.badge}</span>
          </div>
          <h3 className="text-base font-bold text-tamkeen-ink">{item.name}</h3>
          <p className="arabic text-sm text-tamkeen-dark">{item.subtitle}</p>
        </div>
        <button onClick={playAll}
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90 ${
            playing ? 'bg-tamkeen-dark text-white' : 'bg-tamkeen-mint text-tamkeen-dark'
          }`}>
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
      </div>

      {/* Full Arabic */}
      <div className="bg-gray-50 rounded-2xl p-4">
        <p className="arabic text-xl text-tamkeen-ink leading-loose text-right">{item.arabic}</p>
      </div>

      {/* Line-by-line */}
      <div className="space-y-2">
        {item.transliteration.map((line, i) => (
          <div key={i} className={`rounded-xl p-3 transition-all ${lineIdx === i && playing ? 'bg-tamkeen-mint' : 'bg-gray-50'}`}>
            <div className="flex items-start gap-2">
              <button
                onClick={() => {
                  if (playing && lineIdx === i) { stateRef.current.playing = false; window.speechSynthesis?.cancel(); setPlaying(false); setLineIdx(-1) }
                  else playLine(i)
                }}
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold transition-all ${
                  lineIdx === i && playing ? 'bg-tamkeen-dark text-white' : 'bg-white border border-gray-200 text-gray-500'
                }`}>
                {lineIdx === i && playing ? <Volume2 size={10} /> : i + 1}
              </button>
              <div className="flex-1">
                <p className="text-xs text-gray-500 italic">{line}</p>
                <p className="text-sm text-tamkeen-ink mt-0.5">{item.translation[i]}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Source */}
      <div className="bg-green-50 rounded-xl p-3">
        <p className="text-[10px] text-gray-500 leading-relaxed">{item.source}</p>
      </div>
    </div>
  )
}

export default function Qunoot() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-tamkeen-ink">Du'a al-Qunoot</h2>
        <p className="text-sm text-gray-500">Witr supplication & prayer during calamities</p>
      </div>

      <div className="card bg-tamkeen-dark text-white">
        <p className="text-xs text-green-200 mb-2">📖 How to perform Qunoot</p>
        <div className="space-y-1.5 text-xs text-green-100">
          <p>• <strong>Witr Qunoot:</strong> After ruku in the last rak'ah, raise hands and recite</p>
          <p>• <strong>Nazilah Qunoot:</strong> Same position — recite when community faces difficulty</p>
          <p>• <strong>Hands:</strong> Raise hands like du'a, palms facing up, or hold them as in du'a</p>
          <p>• <strong>Congregation:</strong> Imam recites aloud, followers say Ameen after each phrase</p>
        </div>
      </div>

      <div className="card bg-amber-50 border border-amber-100">
        <p className="text-[10px] text-amber-800 font-semibold mb-1">🔤 Audio note</p>
        <p className="text-xs text-amber-700">
          Qunoot is not individual Quran ayahs, so audio uses your device's Arabic voice (TTS).
          Tap ▶ on any card to hear the full du'a, or tap line numbers to hear phrase by phrase.
          For best quality: Settings → Accessibility → on iPhone, enable Maged or Majed Arabic voice.
        </p>
      </div>

      {QUNOOT_ITEMS.map((item) => (
        <QunootCard key={item.id} item={item} />
      ))}

      <div className="card bg-green-50 text-center">
        <p className="arabic text-xl text-tamkeen-dark mb-2">وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ</p>
        <p className="text-xs text-gray-500">"And your Lord says: Call upon Me — I will respond to you" — Quran 40:60</p>
      </div>
    </div>
  )
}
