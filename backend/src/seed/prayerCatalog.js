const prayerAudioBySlug = {
  "mahishasura-mardini": "mahishasura_mardini_stotram",
  "navarna-mantra": "navarna_mantra",
  "ya-devi-sarvabhuteshu": "ya_devi_sarvabhuteshu",
  "kerala-bhagavathi-stuti": "kerala_bhagavathi_stuti",
  "lalitha-sahasranama-108": "lalitha_sahasranama_108",
  "gayatri-mantra": "gayatri_mantra",
  "ganesh-aarti": "ganesh_aarti",
  "hanuman-chalisa": "hanuman_chalisa",
  "maha-mrityunjaya": "maha_mrityunjaya",
  "lakshmi-aarti": "lakshmi_aarti",
  "saraswati-vandana": "saraswati_vandana",
  "shiva-panchakshara": "shiva_panchakshara",
  "om-namah-shivaya": "om_namah_shivaya",
  "durga-chalisa": "durga_chalisa",
  "krishna-aarti": "krishna_aarti",
  "surya-mantra": "surya_mantra",
  "shanti-mantra": "shanti_mantra",
  "vishnu-sahasranama-108": "vishnu_sahasranama_108",
  "pratah-smaranam": "morning_prayer",
  "nirvana-shatakam": "nirvana_shatakam"
};

function glossary(word, transliteration, meaning) {
  return { word, transliteration, meaning };
}

function verse(number, script, iast, meaning, audioStartSec = 0, type = undefined) {
  return { number, type, script, iast, meaning, audioStartSec };
}

function buildAudioUrl(slug) {
  const audioKey = prayerAudioBySlug[slug];
  return audioKey ? `raw://${audioKey}` : null;
}

function buildScriptContent(prayer) {
  if (prayer.scriptMalayalam) return prayer.scriptMalayalam;
  if (prayer.scriptDevanagari) return prayer.scriptDevanagari;
  if (!Array.isArray(prayer.verses) || !prayer.verses.length) return "";
  return prayer.verses.map((item) => item.script).filter(Boolean).join("\n\n");
}

function buildIastContent(prayer) {
  if (prayer.iast) return prayer.iast;
  if (!Array.isArray(prayer.verses) || !prayer.verses.length) return prayer.transliteration || "";
  return prayer.verses.map((item) => item.iast).filter(Boolean).join("\n\n");
}

function buildMeaningContent(prayer) {
  if (prayer.meaning) return prayer.meaning;
  if (!Array.isArray(prayer.verses) || !prayer.verses.length) return prayer.description || "";
  return prayer.verses.map((item) => item.meaning).filter(Boolean).join("\n\n");
}

const AUTHORITATIVE_PRAYER_CATALOG = [];

AUTHORITATIVE_PRAYER_CATALOG.push(
  {
    order: 1,
    slug: "mahishasura-mardini",
    deitySlug: "bhadra-bhagavathi",
    titleEn: "Mahishasura Mardini Stotram",
    type: "stotram",
    difficulty: "intermediate",
    durationMinutes: 9,
    xpReward: 5,
    verseCount: 21,
    firstLinePreview: "Ayi girinandinī nanditamedinī...",
    description: "The beloved Devi hymn of protection, courage, and temple-near remembrance.",
    plainStory: "This hymn praises the Divine Mother as fierce, graceful, and protective through the story of her victory over Mahishasura. Each verse reveals a different quality of the Mother rather than only a battle narrative.\n\nFor families abroad, this stotram is one of the closest devotional sounds to standing inside Bhadra Bhagavathi Temple during Abhishekam. It keeps temple rhythm alive across distance.",
    wordGlossary: [
      glossary("Ayi", "ayi", "A tender cry of address: O Mother."),
      glossary("Girinandini", "giri-nan-di-ni", "Daughter of the mountain."),
      glossary("Nanditamedinī", "nan-di-ta-me-di-ni", "She who makes the earth rejoice."),
      glossary("Viśvavinodinī", "vish-va-vi-no-di-ni", "She who delights the universe."),
      glossary("Mahishasura", "ma-hi-sha-su-ra", "The buffalo demon representing arrogance.")
    ],
    familyContext: "Recite during Navaratri, on Fridays, or with evening lamp-lighting. One verse a day is a realistic family rhythm.",
    beginnerTip: "Start with the first verse only and listen to the melody three times before reading aloud.",
    nriRelevance: "This is one of the most recognisable Bhagavathi temple hymns. Learning even the first verses means you can follow what is being chanted for your family in Kerala.",
    verses: [
      verse(1, "अयि गिरिनन्दिनि नन्दितमेदिनि विश्वविनोदिनि नन्दनुते ।\nगिरिवरविन्ध्यशिरोऽधिनिवासिनि विष्णुविलासिनि जिष्णुनुते ॥", "ayi girinandinī nanditamedinī viśvavinodinī nandanute |\ngirivara vindhyaśiro'dhinivāsini viṣṇuvilāsini jiṣṇunute ||", "O daughter of the mountain, who brings joy to the earth and delight to the universe, praised by the noble and dwelling upon the lofty peaks, we bow to you.", 0),
      verse(2, "सुरवरवर्षिणि दुर्धरधर्षिणि दुर्मुखमर्षिणि हर्षरते ।\nत्रिभुवनपोषिणि शङ्करतोषिणि किल्बिषमोषिणि घोषरते ॥", "suravara varṣiṇi durdhara dharṣiṇi durmukha marṣiṇi harṣarate |\ntribhuvana poṣiṇi śaṅkara toṣiṇi kilbiṣa moṣiṇi ghoṣarate ||", "You shower blessings on the gods, humble arrogance, nourish the three worlds, please Shiva, and remove sin.", 23),
      verse(3, "अयि जगदम्ब मदम्ब कदम्ब वनप्रियवासिनि हासरते ।\nशिखरिशिरोमणि तुङ्गहिमालय शृङ्गनिजालय मध्यगते ॥", "ayi jagadamba madamba kadamba vanapriyavāsini hāsarate |\nśikhariśiromaṇi tuṅgahimālaya śṛṅganijālaya madhyagate ||", "O Mother of the world and my own Mother, lover of sacred groves, dwelling amidst the mountain heights, we remember you.", 46)
    ]
  },
  {
    order: 2,
    slug: "navarna-mantra",
    deitySlug: "bhadra-bhagavathi",
    titleEn: "Navarna Mantra",
    type: "mantra",
    difficulty: "beginner",
    durationMinutes: 5,
    xpReward: 3,
    verseCount: 1,
    firstLinePreview: "Aim Hreem Kleem Chamundaye Vicche",
    description: "The root Goddess mantra for clarity, protection, and disciplined Devi worship.",
    plainStory: "The Navarna Mantra gathers knowledge, cosmic power, beauty, and fierce protection into one short recitation. It is the compact heart of Shakta mantra practice.\n\nFor families abroad, it is the most practical Devi mantra to memorise completely. It is short enough for daily life and deep enough to connect home prayer with temple recitation.",
    wordGlossary: [
      glossary("Aim", "aim", "Seed sound of Saraswati and clarity."),
      glossary("Hreem", "hreem", "Seed sound of Devi as cosmic power."),
      glossary("Kleem", "kleem", "Seed sound of attraction, tenderness, and grace."),
      glossary("Chamundaye", "cha-mun-daa-yei", "To Chamunda, the fierce Goddess."),
      glossary("Vicche", "vich-chey", "Protective sealing syllable.")
    ],
    familyContext: "Teach this as a first Devi mantra for children. Recite before school, before travel, or on Ashtami.",
    beginnerTip: "Say it aloud once before trying to memorise it. The sound pattern teaches the mantra naturally.",
    nriRelevance: "This mantra turns a temple booking into something you can personally follow in real time instead of only observe.",
    verses: [verse(1, "ऐं ह्रीं क्लीं चामुण्डायै विच्चे", "aiṃ hrīṃ klīṃ cāmuṇḍāyai vicce", "Aim for wisdom, Hreem for power, Kleem for grace — to Chamunda — protect us.", 0)]
  },
  {
    order: 3,
    slug: "ya-devi-sarvabhuteshu",
    deitySlug: "bhadra-bhagavathi",
    titleEn: "Devi Mahatmyam Shloka",
    type: "stotram",
    difficulty: "beginner",
    durationMinutes: 4,
    xpReward: 3,
    verseCount: 3,
    firstLinePreview: "Yā Devī sarvabhūteṣu...",
    description: "A concise daily Devi refrain naming the Goddess as Power, Mother, and Intelligence in all beings.",
    plainStory: "This excerpt from the Devi Mahatmyam is a prayer of recognition: the Goddess lives in all beings as power, motherliness, and intelligence. The refrain bows to her repeatedly until the mind becomes quiet.\n\nIts repetition makes it especially suited to families abroad. Adults can lead the first line and children can join the refrain immediately.",
    wordGlossary: [
      glossary("Yā Devī", "yaa de-vee", "She who is the Goddess."),
      glossary("Sarvabhūteṣu", "sar-va-bhoo-te-shu", "In all beings."),
      glossary("Śaktirūpeṇa", "shak-ti-roo-pe-na", "In the form of power."),
      glossary("Mātr̥rūpeṇa", "maa-tri-roo-pe-na", "In the form of the Mother."),
      glossary("Namastasyai", "na-mas-tas-yai", "I bow to her.")
    ],
    familyContext: "Use this as a family call-and-response prayer on Mondays, Fridays, or festival days.",
    beginnerTip: "Memorise the refrain first. Once it is stable, the first lines become easy to follow.",
    nriRelevance: "This is heard across temple festivals throughout the diaspora. Knowing it lets you participate rather than watch from the edge.",
    verses: [
      verse(1, "या देवी सर्वभूतेषु शक्तिरूपेण संस्थिता ।\nनमस्तस्यै नमस्तस्यै नमस्तस्यै नमो नमः ॥", "yā devī sarvabhūteṣu śaktirūpeṇa saṃsthitā |\nnamastasyai namastasyai namastasyai namo namaḥ ||", "The Goddess who dwells in all beings as power — to her I bow again and again.", 0),
      verse(2, "या देवी सर्वभूतेषु मातृरूपेण संस्थिता ।\nनमस्तस्यै नमस्तस्यै नमस्तस्यै नमो नमः ॥", "yā devī sarvabhūteṣu mātr̥rūpeṇa saṃsthitā |\nnamastasyai namastasyai namastasyai namo namaḥ ||", "The Goddess who dwells in all beings as Mother — to her I bow again and again.", 18),
      verse(3, "या देवी सर्वभूतेषु बुद्धिरूपेण संस्थिता ।\nनमस्तस्यै नमस्तस्यै नमस्तस्यै नमो नमः ॥", "yā devī sarvabhūteṣu buddhirūpeṇa saṃsthitā |\nnamastasyai namastasyai namastasyai namo namaḥ ||", "The Goddess who dwells in all beings as intelligence — to her I bow again and again.", 36)
    ]
  },
  {
    order: 4,
    slug: "gayatri-mantra",
    deitySlug: "saraswati",
    titleEn: "Gayatri Mantra",
    type: "mantra",
    difficulty: "beginner",
    durationMinutes: 3,
    xpReward: 3,
    verseCount: 1,
    firstLinePreview: "Om Bhur Bhuvaḥ Svaḥ...",
    description: "The universal Vedic mantra for clear thinking, illumination, and right direction.",
    plainStory: "The Gayatri Mantra asks for one thing above all: may the divine light illuminate our minds. That is why it remains one of the most universal prayers in Hindu life.\n\nFor NRI families it is ideal as a morning practice because it is short, portable, and meaningful even in the middle of a busy schedule.",
    wordGlossary: [
      glossary("Om", "ohm", "The primordial sacred sound."),
      glossary("Bhūr", "bhoor", "Earth, the physical plane."),
      glossary("Bhuvaḥ", "bhu-vah", "The vital or atmospheric plane."),
      glossary("Bhargo", "bhar-go", "Radiance that removes darkness."),
      glossary("Prachodayāt", "pra-cho-da-yaat", "May it inspire or guide.")
    ],
    familyContext: "Say it three times before breakfast or study. It is one of the easiest shared prayers for families with young children.",
    beginnerTip: "Say it slowly three times from the Follow Along tab. Intention matters more than accent.",
    nriRelevance: "This is one of the few prayers recognised by Hindu families across nearly every region, making it a strong shared devotional language for diaspora homes.",
    verses: [verse(1, "ॐ भूर्भुवः स्वः ।\nतत्सवितुर्वरेण्यम् ।\nभर्गो देवस्य धीमहि ।\nधियो यो नः प्रचोदयात् ॥", "oṃ bhūr bhuvaḥ svaḥ |\ntatsaviturvareṇyam |\nbhargo devasya dhīmahi |\ndhiyo yo naḥ pracodayāt ||", "We meditate on the divine radiance. May that light guide and awaken our intellects.", 0)]
  },
  {
    order: 5,
    slug: "maha-mrityunjaya",
    deitySlug: "shiva",
    titleEn: "Maha Mrityunjaya Mantra",
    type: "mantra",
    difficulty: "beginner",
    durationMinutes: 4,
    xpReward: 3,
    verseCount: 1,
    firstLinePreview: "Om Tryambakaṃ Yajāmahe...",
    description: "A healing Shiva mantra for protection, release from fear, and graceful resilience.",
    plainStory: "The Maha Mrityunjaya Mantra is recited for healing, protection, and release from the fear of death. Its central metaphor is one of graceful ripening rather than panic.\n\nFor families abroad, this becomes especially meaningful during illness, surgery, and helpless waiting across countries. It gives prayer a concrete form when presence is impossible.",
    wordGlossary: [
      glossary("Tryambakam", "try-am-ba-kam", "The three-eyed Shiva."),
      glossary("Yajāmahe", "ya-jaa-ma-he", "We worship together."),
      glossary("Sugandhim", "su-gan-dhim", "Fragrant, spiritually purifying."),
      glossary("Puṣṭivardhanam", "push-ti-var-dha-nam", "The one who increases nourishment."),
      glossary("Mṛtyor", "mr-tyor", "From death.")
    ],
    familyContext: "Use on Mondays, during illness, before surgery, or whenever the family wants to pray for someone's strength and life.",
    beginnerTip: "Learn one line a day across four days. By day five, the whole mantra is yours.",
    nriRelevance: "This is one of the clearest prayers for moments when you cannot physically be with a loved one but need prayer to become action.",
    verses: [verse(1, "ॐ त्र्यम्बकं यजामहे\nसुगन्धिं पुष्टिवर्धनम् ।\nउर्वारुकमिव बन्धनान्\nमृत्योर्मुक्षीय माऽमृतात् ॥", "oṃ tryambakaṃ yajāmahe\nsugandhiṃ puṣṭivardhanam |\nurvārukamiva bandhanān\nmṛtyormukṣīya māmṛtāt ||", "We worship the three-eyed Shiva. May he release us from death and bondage as a ripe fruit is freed from the vine.", 0)]
  }
);

AUTHORITATIVE_PRAYER_CATALOG.push(
  {
    order: 16,
    slug: "surya-mantra",
    deitySlug: "saraswati",
    titleEn: "Surya Mantra",
    type: "mantra",
    difficulty: "beginner",
    durationMinutes: 2,
    xpReward: 2,
    verseCount: 1,
    firstLinePreview: "Om Sūryāya Namaḥ",
    description: "A sunrise salutation to visible light, vitality, health, and disciplined beginnings.",
    plainStory: "Surya is the deity you can literally see. That makes the morning sun mantra especially accessible: it joins spirituality with the ordinary fact of daylight.\n\nFor NRI life, it is one of the easiest spiritual anchors to keep while commuting, walking, or stepping outside for the day.",
    wordGlossary: [
      glossary("Sūrya", "soo-rya", "The sun deity."),
      glossary("Namaḥ", "na-mah", "I bow."),
      glossary("Pratyakṣa", "prat-yak-sha", "Visible, directly perceivable."),
      glossary("Devatā", "de-va-taa", "Divine form."),
      glossary("Tejas", "te-jas", "Radiant life energy.")
    ],
    familyContext: "Use on Sunday morning, while opening the curtains, or just before stepping into daylight.",
    beginnerTip: "Make it a ten-second ritual. One sincere recitation is enough to begin.",
    nriRelevance: "This is a deeply practical prayer for families whose lives are fast, mobile, and short on ritual setup time.",
    verses: [verse(1, "ॐ सूर्याय नमः", "oṃ sūryāya namaḥ", "I bow to Surya, the visible source of radiance, health, and sustaining energy.", 0)]
  },
  {
    order: 17,
    slug: "shanti-mantra",
    deitySlug: "saraswati",
    titleEn: "Shanti Mantra",
    type: "mantra",
    difficulty: "beginner",
    durationMinutes: 3,
    xpReward: 2,
    verseCount: 1,
    firstLinePreview: "Om Sarve Bhavantu Sukhinaḥ...",
    description: "A universal prayer for the wellbeing of all beings.",
    plainStory: "This prayer asks not for one family alone but for all beings to be happy, healthy, and free from suffering. Its generosity is part of its spiritual force.\n\nThat makes it especially fitting for mixed-faith or intercultural households abroad. It is devout without being exclusionary.",
    wordGlossary: [
      glossary("Sarve", "sar-vay", "All."),
      glossary("Bhavantu", "bha-van-tu", "May they be."),
      glossary("Sukhinaḥ", "su-khi-nah", "Happy and at ease."),
      glossary("Nirāmayāḥ", "ni-raa-ma-yaah", "Free from illness."),
      glossary("Śāntiḥ", "shaan-tih", "Peace.")
    ],
    familyContext: "Use to close family prayer, before sleep, or whenever the household wants a gentle inclusive ending.",
    beginnerTip: "Read the English meaning first and then chant it. The clarity of intent helps the words settle quickly.",
    nriRelevance: "Ideal for multi-faith families and non-Hindu partners because it asks simply for peace and wellbeing for everyone.",
    verses: [verse(1, "ॐ सर्वे भवन्तु सुखिनः ।\nसर्वे सन्तु निरामयाः ।\nसर्वे भद्राणि पश्यन्तु ।\nमा कश्चिद् दुःखभाग्भवेत् ।\nॐ शान्तिः शान्तिः शान्तिः ॥", "oṃ sarve bhavantu sukhinaḥ |\nsarve santu nirāmayāḥ |\nsarve bhadrāṇi paśyantu |\nmā kaścid duḥkhabhāgbhavet |\noṃ śāntiḥ śāntiḥ śāntiḥ ||", "May all beings be happy, healthy, see what is auspicious, and be free from suffering. Om peace, peace, peace.", 0)]
  },
  {
    order: 18,
    slug: "vishnu-sahasranama-108",
    deitySlug: "krishna",
    titleEn: "Vishnu Sahasranama (108 Names)",
    type: "stotram",
    difficulty: "advanced",
    durationMinutes: 16,
    xpReward: 10,
    verseCount: 108,
    firstLinePreview: "Om Viśvam Namaḥ, Om Viṣṇave Namaḥ...",
    description: "A 108-name cycle remembering Vishnu as sustainer, refuge, and all-pervading Lord.",
    plainStory: "A name-recitation tradition like Vishnu Sahasranama widens devotion by giving the mind many sacred angles to dwell in: protector, pervader, refuge, preserver, beloved Lord.\n\nFor diaspora families, a measured name-cycle keeps bhakti from collapsing into festival-only practice. It becomes a repeatable rhythm of remembrance.",
    wordGlossary: [
      glossary("Viśvam", "vish-vam", "The all, the universe."),
      glossary("Viṣṇu", "vish-nu", "The all-pervading one."),
      glossary("Nārāyaṇa", "naa-raa-ya-na", "The refuge of beings."),
      glossary("Govinda", "go-vin-da", "Protector and knower of beings."),
      glossary("Mādhava", "maa-dha-va", "The sweet auspicious Lord.")
    ],
    familyContext: "Use on Ekadashi, on Thursdays, or as a weekly name-recitation where one person leads and others follow silently.",
    beginnerTip: "Take ten names a day. A name-cycle becomes transformative only when it is not rushed.",
    nriRelevance: "This gives children and adults a more textured Vaishnava devotional vocabulary even when temple access is limited.",
    verses: [
      verse(1, "१. ॐ विश्वं नमः", "1. oṃ viśvaṃ namaḥ", "Salutations to the One who is the all.", 0),
      verse(2, "२. ॐ विष्णवे नमः", "2. oṃ viṣṇave namaḥ", "Salutations to the all-pervading Lord.", 8),
      verse(3, "३. ॐ वषट्काराय नमः", "3. oṃ vaṣaṭkārāya namaḥ", "Salutations to the receiver of sacred offering.", 16),
      verse(4, "४. ॐ भूतभव्यभवत्प्रभवे नमः", "4. oṃ bhūtabhavyabhavatprabhave namaḥ", "Salutations to the Lord of past, present, and future.", 24),
      verse(5, "५. ॐ भूतकृते नमः", "5. oṃ bhūtakṛte namaḥ", "Salutations to the maker of beings.", 32)
    ]
  },
  {
    order: 19,
    slug: "pratah-smaranam",
    deitySlug: "ganesha",
    titleEn: "Morning Prayer (Pratah Smaranam)",
    type: "prayer",
    difficulty: "beginner",
    durationMinutes: 3,
    xpReward: 2,
    verseCount: 1,
    firstLinePreview: "Prātaḥ smarāmi hṛdi saṃsphuradātmatattvam...",
    description: "A contemplative dawn remembrance that sets identity before the day begins pulling at it.",
    plainStory: "Pratah Smaranam is a prayer of recollection rather than petition. It remembers the deeper self before work, school, phone, and stress define the day.\n\nThat makes it particularly helpful in fast-paced urban life abroad, where attention is often claimed before it is offered.",
    wordGlossary: [
      glossary("Prātaḥ", "praa-tah", "At dawn."),
      glossary("Smarāmi", "sma-raa-mi", "I remember."),
      glossary("Hṛdi", "hri-di", "In the heart."),
      glossary("Ātmatattvam", "aat-ma-tat-tvam", "The truth of the Self."),
      glossary("Turīyam", "tu-ree-yam", "The fourth state beyond waking, dream, and sleep.")
    ],
    familyContext: "Use on waking, before checking the phone, or while opening the day quietly with tea or light.",
    beginnerTip: "Do not force philosophical understanding at first. Let the English meaning set the tone.",
    nriRelevance: "It is especially helpful when identity feels stretched across work, migration, language, and family obligation.",
    verses: [verse(1, "प्रातः स्मरामि हृदि संस्फुरदात्मतत्त्वं\nसच्चित्सुखं परमहंसगतिं तुरीयम् ।", "prātaḥ smarāmi hṛdi saṃsphuradātmatattvaṃ\nsaccitsukhaṃ paramahaṃsagatiṃ turīyam |", "At dawn I remember the Self in the heart — pure being, consciousness, joy, and the fourth state beyond ordinary experience.", 0)]
  },
  {
    order: 20,
    slug: "nirvana-shatakam",
    deitySlug: "shiva",
    titleEn: "Nirvana Shatakam",
    type: "stotram",
    difficulty: "advanced",
    durationMinutes: 5,
    xpReward: 8,
    verseCount: 6,
    firstLinePreview: "Manobuddhyahaṅkāracittāni nāham...",
    description: "Adi Shankaracharya's self-inquiry hymn: a meditation text that happens to be sung.",
    plainStory: "Nirvana Shatakam strips away false identity line by line: mind, ego, senses, body, element, role. What remains is pure awareness.\n\nFor people living across borders, its questions can feel unexpectedly immediate. Who are you when job, language, status, and nationality no longer explain everything?",
    wordGlossary: [
      glossary("Manas", "ma-nas", "Mind."),
      glossary("Buddhi", "bud-dhi", "Intellect."),
      glossary("Ahaṅkāra", "a-ham-kaa-ra", "Ego or I-maker."),
      glossary("Cidānanda", "chi-daa-nan-da", "Consciousness-bliss."),
      glossary("Śivo'ham", "shi-vo-ham", "I am Shiva; I am pure awareness.")
    ],
    familyContext: "Use in early morning quiet, after meditation, or on reflective evenings where the household wants depth rather than singing.",
    beginnerTip: "Read the English meaning first. This prayer opens as contemplation, not as performance.",
    nriRelevance: "The identity questions in this hymn are often sharpened by life abroad. It gives those questions a spiritual frame instead of leaving them unspoken.",
    verses: [verse(1, "मनोबुद्ध्यहङ्कारचित्तानि नाहम्\nन च श्रोत्रजिह्वे न च घ्राणनेत्रे ।\nन च व्योमभूमि न तेजो न वायुः\nचिदानन्दरूपः शिवोऽहम् शिवोऽहम् ॥", "manobuddhyahaṅkāracittāni nāham\nna ca śrotrajihve na ca ghrāṇanetre |\nna ca vyomabhūmi na tejo na vāyuḥ\ncidānandarūpaḥ śivo'ham śivo'ham ||", "I am not mind, intellect, ego, senses, or the elements. I am consciousness and bliss — I am Shiva.", 0)]
  }
);

AUTHORITATIVE_PRAYER_CATALOG.push(
  {
    order: 11,
    slug: "saraswati-vandana",
    deitySlug: "saraswati",
    titleEn: "Saraswati Vandana",
    type: "stotram",
    difficulty: "beginner",
    durationMinutes: 4,
    xpReward: 3,
    verseCount: 1,
    firstLinePreview: "Yā Kundendutuṣārahāradhavalā...",
    description: "A prayer for study, music, speech, and clear thought.",
    plainStory: "Saraswati Vandana remembers the Goddess as white as jasmine, moonlight, and snow, seated on a lotus with the veena. The imagery is itself part of the teaching: learning should be luminous, calm, and refined.\n\nFor diaspora children under academic pressure, this prayer reframes study as a request for clarity rather than a performance panic.",
    wordGlossary: [
      glossary("Kunda", "kun-da", "Jasmine."),
      glossary("Tushāra", "tu-shaa-ra", "Snow."),
      glossary("Vīṇā", "vee-naa", "The veena, symbol of art and learning."),
      glossary("Padmāsanā", "pad-maa-sa-naa", "Seated on a lotus."),
      glossary("Dhavalā", "dha-va-laa", "Radiantly white.")
    ],
    familyContext: "Use before school, exams, music class, or at Saraswati Puja.",
    beginnerTip: "Memorise the image first: white lotus, white cloth, veena. The words will follow.",
    nriRelevance: "It helps families redirect academic pressure toward wisdom, steadiness, and speech that is both clear and kind.",
    verses: [
      verse(1, "या कुन्देन्दुतुषारहारधवला\nया शुभ्रवस्त्रावृता ।\nया वीणावरदण्डमण्डितकरा\nया श्वेतपद्मासना ॥", "yā kundendutuṣārahāradhavalā\nyā śubhravastrāvṛtā |\nyā vīṇāvaradaṇḍamaṇḍitakarā\nyā śvetapadmāsanā ||", "She who is white as jasmine, moonlight, and snow, holding the veena and seated on a white lotus, may Saraswati bless us.", 0)
    ]
  },
  {
    order: 12,
    slug: "shiva-panchakshara",
    deitySlug: "shiva",
    titleEn: "Shiva Panchakshara Stotram",
    type: "stotram",
    difficulty: "beginner",
    durationMinutes: 4,
    xpReward: 3,
    verseCount: 5,
    firstLinePreview: "Nāgendrahārāya Trilocanāya...",
    description: "A Shiva hymn unfolding the five syllables Na-Ma-Śi-Vā-Ya as a meditative path.",
    plainStory: "This stotram opens the Panchakshara mantra into verse form so that each syllable becomes a doorway into Shiva's form and elemental presence.\n\nIt is one of the best bridges between short mantra repetition and fuller Shaiva hymn practice.",
    wordGlossary: [
      glossary("Na", "na", "Earth."),
      glossary("Ma", "ma", "Water."),
      glossary("Śi", "shi", "Fire."),
      glossary("Vā", "vaa", "Air."),
      glossary("Ya", "ya", "Space.")
    ],
    familyContext: "Use on Mondays or at Mahashivaratri when the family wants a fuller Shiva prayer after Om Namah Shivaya.",
    beginnerTip: "Learn one syllable-verse at a time across five days.",
    nriRelevance: "This is especially useful for community Shivaratri gatherings where a short mantra alone may feel too brief.",
    verses: [
      verse(1, "नागेन्द्रहाराय त्रिलोचनाय\nभस्माङ्गरागाय महेश्वराय ।\nनित्याय शुद्धाय दिगम्बराय\nतस्मै नकाराय नमः शिवाय ॥", "nāgendrahārāya trilocanāya\nbhasmāṅgarāgāya maheśvarāya |\nnityāya śuddhāya digambarāya\ntasmai nakārāya namaḥ śivāya ||", "To the serpent-garlanded three-eyed Lord, eternal and pure — to Shiva represented by the syllable Na, I bow.", 0)
    ]
  },
  {
    order: 13,
    slug: "om-namah-shivaya",
    deitySlug: "shiva",
    titleEn: "Om Namah Shivaya",
    type: "mantra",
    difficulty: "beginner",
    durationMinutes: 2,
    xpReward: 2,
    verseCount: 1,
    firstLinePreview: "Om Namaḥ Śivāya",
    description: "The shortest complete Shiva invocation: simple, total, and endlessly repeatable.",
    plainStory: "This mantra is small enough for anyone to begin and deep enough to support a lifetime of prayer. It is not ornate; it is direct reverence.\n\nFor families abroad it is one of the most sustainable mantras because it requires no setup, no long text, and no special time window.",
    wordGlossary: [
      glossary("Om", "ohm", "The primordial sacred sound."),
      glossary("Namaḥ", "na-mah", "I bow."),
      glossary("Śiva", "shi-va", "The auspicious one."),
      glossary("Pañcakṣara", "pan-cha-ksha-ra", "The five-syllable mantra."),
      glossary("Akāśa", "a-kaa-sha", "Space, the subtle element.")
    ],
    familyContext: "Use anytime: before sleep, during worry, while walking, or after disagreement when the mind needs calming.",
    beginnerTip: "If you know no other prayer, start here and repeat it with the breath.",
    nriRelevance: "This mantra makes devotional life possible even inside crowded workdays and small apartments.",
    verses: [verse(1, "ॐ नमः शिवाय", "oṃ namaḥ śivāya", "I bow to Shiva, the auspicious presence within and beyond the elements.", 0)]
  },
  {
    order: 14,
    slug: "durga-chalisa",
    deitySlug: "bhadra-bhagavathi",
    titleEn: "Durga Chalisa",
    type: "chalisa",
    difficulty: "intermediate",
    durationMinutes: 11,
    xpReward: 5,
    verseCount: 42,
    firstLinePreview: "Namo Namo Durge Sukh Karani...",
    description: "A protective forty-verse Devi hymn for courage, shielding, and relief during difficult periods.",
    plainStory: "Durga Chalisa praises the Mother as remover of sorrow and giver of strength. It is often the devotional bridge between region-specific Goddess traditions and wider pan-Indian Durga worship.\n\nFor Kerala families abroad, it helps Bhagavathi devotion stay legible inside mixed-community Navaratri settings.",
    wordGlossary: [
      glossary("Durge", "dur-ge", "O Durga, the one who carries us across difficulty."),
      glossary("Ambe", "am-bay", "Mother."),
      glossary("Jyoti", "jyo-ti", "Radiance or light."),
      glossary("Sukh", "sukh", "Joy and ease."),
      glossary("Haranī", "ha-ra-nee", "She who removes.")
    ],
    familyContext: "Use during Navaratri, on Fridays, or when the household wants a longer protective Devi prayer.",
    beginnerTip: "Start with the opening lines and let the audio teach the flow before trying to read the whole hymn.",
    nriRelevance: "This prayer helps bridge Kerala Bhagavathi devotion with the wider Durga prayer culture encountered across the diaspora.",
    verses: [
      verse(1, "नमो नमो दुर्गे सुख करनी ।\nनमो नमो अम्बे दुःख हरनी ॥", "namo namo durge sukha karanī |\nnamo namo ambe duḥkha haranī ||", "I bow to Durga, giver of joy; I bow to Mother Amba, remover of sorrow.", 0),
      verse(2, "निरंकार है ज्योति तुम्हारी ।\nतिहूँ लोक फैली उजियारी ॥", "niraṃkāra hai jyoti tumhārī |\ntihūṃ loka phailī ujiyārī ||", "Your light is formless and pure, spreading through all three worlds.", 18)
    ]
  },
  {
    order: 15,
    slug: "krishna-aarti",
    deitySlug: "krishna",
    titleEn: "Krishna Aarti",
    type: "aarti",
    difficulty: "beginner",
    durationMinutes: 5,
    xpReward: 3,
    verseCount: 2,
    firstLinePreview: "Ārati Kuñjabihārī Kī...",
    description: "A sweet evening aarti for Krishna as flute-player, protector, and beloved companion.",
    plainStory: "Krishna Aarti remembers the Lord through image and affection: flute, garland, forest play, and Govardhan. It is devotional intimacy in song form.\n\nFor homes that keep Krishna alongside Bhagavathi, it brings a softer evening mood and a joyful entry point for children.",
    wordGlossary: [
      glossary("Ārati", "aa-ra-ti", "Offering of light."),
      glossary("Kuñjabihārī", "kun-ja-bi-haa-ree", "The forest wanderer."),
      glossary("Giridhara", "gi-ri-dha-ra", "Lifter of the hill."),
      glossary("Murārī", "mu-raa-ree", "Krishna, conqueror of the demon Mura."),
      glossary("Muralī", "mu-ra-lee", "Flute.")
    ],
    familyContext: "Use on Thursdays, Janmashtami, or after evening lamp-lighting.",
    beginnerTip: "Sing the first verse and refrain slowly. The tune will carry the rest.",
    nriRelevance: "Krishna bhakti is broadly shared across diaspora communities, making this aarti a welcoming family prayer.",
    verses: [
      verse(1, "आरती कुञ्जबिहारी की,\nश्री गिरिधर कृष्णमुरारी की ।", "āratī kuñjabihārī kī,\nśrī giridhara kṛṣṇamurārī kī |", "Aarti to Krishna, the forest wanderer and lifter of Govardhan.", 0),
      verse(2, "गले में बैजन्ती माला,\nबजावत मुरली मधुर बाला ।", "gale meṃ baijantī mālā,\nbajāvat muralī madhura bālā |", "With a garland around his neck, the beautiful youth plays the sweet flute.", 18)
    ]
  }
);

AUTHORITATIVE_PRAYER_CATALOG.push(
  {
    order: 6,
    slug: "ganesh-aarti",
    deitySlug: "ganesha",
    titleEn: "Ganesh Aarti",
    type: "aarti",
    difficulty: "beginner",
    durationMinutes: 5,
    xpReward: 3,
    verseCount: 4,
    firstLinePreview: "Jai Ganesh, Jai Ganesh, Jai Ganesh Deva...",
    description: "A joyful family aarti for beginnings, study, travel, and clearing obstacles.",
    plainStory: "Ganesh Aarti is one of the most familiar household prayers in Hindu life. It is sung with light, clapping, and simple affection rather than formal distance.\n\nThat makes it one of the best entry prayers for children and for families abroad who want something immediately singable and warm.",
    wordGlossary: [
      glossary("Jai", "jai", "Glory, victory, hail."),
      glossary("Deva", "de-va", "Divine being."),
      glossary("Ekadanta", "e-ka-dan-ta", "The one-tusked one."),
      glossary("Dayāvanta", "da-yaa-van-ta", "Compassionate."),
      glossary("Savārī", "sa-va-ri", "Vehicle or mount.")
    ],
    familyContext: "Use on Wednesdays, before travel, before school, or at the start of any new venture.",
    beginnerTip: "Learn the chorus first. That is enough to begin joining the prayer at home and in community settings.",
    nriRelevance: "This aarti is sung at many diaspora Hindu gatherings, so knowing it creates immediate devotional belonging.",
    verses: [
      verse(1, "जय गणेश जय गणेश जय गणेश देवा ।\nमाता जाकी पार्वती पिता महादेवा ॥", "jaya gaṇeśa jaya gaṇeśa jaya gaṇeśa devā |\nmātā jākī pārvatī pitā mahādevā ||", "Victory to Ganesha, whose mother is Parvati and father is Mahadeva.", 0),
      verse(2, "एकदन्त दयावन्त चारभुज धारी ।\nमाथे सिन्दूर सोहे मूसे की सवारी ॥", "ekadanta dayāvanta cārabhuja dhārī |\nmāthe sindūra sohe mūse kī savārī ||", "The one-tusked compassionate Lord with four arms, shining with vermilion and riding the mouse.", 22),
      verse(3, "पान चढ़े फूल चढ़े और चढ़े मेवा ।\nलड्डुअन का भोग लगे सन्त करें सेवा ॥", "pān caṛhe phūla caṛhe aur caṛhe mevā |\nlaḍḍuan kā bhoga lage santa kareṃ sevā ||", "Leaves, flowers, and sweets are offered as devotees serve with love.", 44),
      verse(4, "अन्धन को आँख देत कोढ़िन को काया ।\nबाँझन को पुत्र देत निर्धन को माया ॥", "andhan ko āṃkh det koṛhin ko kāyā |\nbāṃjhan ko putra det nirdhan ko māyā ||", "He restores wholeness, blessing, and relief where households feel lack.", 66)
    ]
  },
  {
    order: 7,
    slug: "hanuman-chalisa",
    deitySlug: "hanuman",
    titleEn: "Hanuman Chalisa",
    type: "chalisa",
    difficulty: "intermediate",
    durationMinutes: 11,
    xpReward: 5,
    verseCount: 42,
    firstLinePreview: "Shri Guru Charan Saroj Raj...",
    description: "The most widely recited Hanuman hymn for courage, steadiness, and devoted action.",
    plainStory: "The Hanuman Chalisa is a forty-verse praise hymn that remembers Hanuman as strength without ego, service without self-display, and courage without aggression.\n\nFor NRI families, Hanuman often feels especially close: he crosses distance, carries duty across borders, and stays loyal to his source.",
    wordGlossary: [
      glossary("Guru", "gu-ru", "Teacher or guide."),
      glossary("Charan", "cha-ran", "Feet; a symbol of reverence."),
      glossary("Pavan Kumar", "pa-van ku-mar", "Son of the Wind."),
      glossary("Bal", "bal", "Strength."),
      glossary("Buddhi", "bud-dhi", "Discernment."),
      glossary("Sankat Mochan", "san-kat mo-chan", "Remover of difficulties.")
    ],
    familyContext: "Use on Tuesdays or Saturdays, before exams, work stress, travel, or when the household needs courage and steadiness.",
    beginnerTip: "Start with the opening dohas and first few verses. The beat of the audio teaches memory quickly.",
    nriRelevance: "Hanuman is one of the strongest devotional bridges between home culture and diaspora pressure: capable, loyal, grounded, and fearless.",
    verses: [
      verse(1, "श्रीगुरु चरन सरोज रज, निज मनु मुकुरु सुधारि ।\nबरनउँ रघुबर बिमल जसु, जो दायकु फल चारि ॥", "śrīguru carana saroja raja, nija manu mukuru sudhāri |\nbaranauṃ raghubara bimala jasu, jo dāyaku phala cāri ||", "Purifying the mirror of the mind with the dust of the Guru's lotus feet, I sing the pure glory of Rama.", 0, "doha"),
      verse(2, "बुद्धिहीन तनु जानिके, सुमिरौं पवन-कुमार ।\nबल बुधि बिद्या देहु मोहिं, हरहु कलेस बिकार ॥", "buddhihīna tanu jānike, sumirauṃ pavana-kumāra |\nbala budhi bidyā dehu mohiṃ, harahu kalesa bikāra ||", "Knowing myself limited, I remember Hanuman and ask for strength, wisdom, and knowledge.", 18, "doha"),
      verse(3, "जय हनुमान ज्ञान गुण सागर ।\nजय कपीस तिहुँ लोक उजागर ॥", "jaya hanumāna jñāna guṇa sāgara |\njaya kapīsa tihuṃ loka ujāgara ||", "Victory to Hanuman, ocean of wisdom and virtue.", 36, "chaupai"),
      verse(4, "राम दूत अतुलित बल धामा ।\nअञ्जनि-पुत्र पवनसुत नामा ॥", "rāma dūta atulita bala dhāmā |\nañjani-putra pavanasuta nāmā ||", "Messenger of Rama, abode of incomparable strength, son of Anjani and the Wind.", 52, "chaupai")
    ]
  },
  {
    order: 8,
    slug: "kerala-bhagavathi-stuti",
    deitySlug: "bhadra-bhagavathi",
    titleEn: "Kerala Bhagavathi Stuti",
    type: "prayer",
    difficulty: "beginner",
    durationMinutes: 6,
    xpReward: 3,
    verseCount: 4,
    firstLinePreview: "Bhadre Bhadrakāli Maheśvari Devi...",
    description: "A Malayalam-rooted praise of Bhadra Bhagavathi that carries Kerala temple cadence into the home.",
    plainStory: "This is a direct Malayalam prayer to Bhadra Bhagavathi, emotionally closer to Kerala family practice than a more formal Sanskrit stotram.\n\nFor NRI families it preserves more than devotion; it preserves the sound-world of Kerala itself.",
    wordGlossary: [
      glossary("ഭദ്രേ", "bhadre", "O auspicious one."),
      glossary("ഭദ്രകാലി", "bhadrakāli", "Bhadrakali, the fierce protecting Mother."),
      glossary("മഹേശ്വരി", "maheśvari", "Great Goddess."),
      glossary("ഭൂതനാഥേ", "bhūtanāthe", "Mistress of all beings."),
      glossary("നമോ", "namo", "I bow.")
    ],
    familyContext: "Use at evening lamp-lighting, on Fridays, or when grandparents want to pass on a Malayalam prayer to children abroad.",
    beginnerTip: "Read one line at a time with the audio. Malayalam prayer settles fastest through hearing.",
    nriRelevance: "This is the only Malayalam prayer in the core set, making it a direct connection to Kerala language and identity.",
    scriptMalayalam: "ഭദ്രേ ഭദ്രകാലി മഹേശ്വരി ദേവി\nഭൂതനാഥേ ഭൂതഭാവനേ ഭൂതേ\nകാളി കരാളി വികൃത്തൻ\nഭദ്ര ഭദ്രകാലി നമോ നമഃ",
    verses: [
      verse(1, "ഭദ്രേ ഭദ്രകാലി മഹേശ്വരി ദേവി", "bhadre bhadrakāli maheśvari devi", "O Bhadra, O Bhadrakali, Great Goddess.", 0),
      verse(2, "ഭൂതനാഥേ ഭൂതഭാവനേ ഭൂതേ", "bhūtanāthe bhūtabhāvane bhūte", "Mistress of beings, nurturer of all that exists.", 8),
      verse(3, "കാളി കരാളി വികൃത്തൻ", "kāli karāli vikr̥ttan", "Fierce Kali, formidable and awe-inspiring.", 16),
      verse(4, "ഭദ്ര ഭദ്രകാലി നമോ നമഃ", "bhadra bhadrakāli namo namaḥ", "To Bhadra Bhadrakali, I bow again and again.", 24)
    ]
  },
  {
    order: 9,
    slug: "lalitha-sahasranama-108",
    deitySlug: "bhadra-bhagavathi",
    titleEn: "Lalitha Sahasranama (108 Names)",
    type: "stotram",
    difficulty: "advanced",
    durationMinutes: 18,
    xpReward: 10,
    verseCount: 108,
    firstLinePreview: "Śrī Mātā, Śrī Mahārājñī...",
    description: "A 108-name cycle remembering the Goddess as Mother, Queen, radiance, power, and grace.",
    plainStory: "This 108-name cycle approaches the Goddess through many facets rather than one story. Each name reveals another angle of sovereignty, tenderness, beauty, and sacred purpose.\n\nFor families abroad, even a shortened name-cycle builds a deeper and more articulate relationship with the Divine Mother.",
    wordGlossary: [
      glossary("Śrī Mātā", "shree maa-taa", "The auspicious Mother."),
      glossary("Mahārājñī", "ma-haa-raaj-nyee", "The great Queen."),
      glossary("Siṃhāsaneśvarī", "sim-haa-sa-ne-shva-ree", "Ruler of the throne."),
      glossary("Cidagnikuṇḍa", "chid-ag-ni-kun-da", "The fire of consciousness."),
      glossary("Devakārya", "de-va-kaa-rya", "Divine work or sacred purpose.")
    ],
    familyContext: "Use on Fridays and during Navaratri. One person can lead the names while others answer mentally with devotion.",
    beginnerTip: "Do ten names a day rather than rushing 108. Depth comes from lingering.",
    nriRelevance: "A name-cycle like this gives children and adults a more precise devotional vocabulary for the Goddess over time.",
    verses: [
      verse(1, "१. श्रीमाता", "1. śrī mātā", "The auspicious Mother.", 0),
      verse(2, "२. श्रीमहाराज्ञी", "2. śrī mahārājñī", "The great Queen.", 8),
      verse(3, "३. श्रीमत्सिंहासनेश्वरी", "3. śrīmat siṃhāsaneśvarī", "Ruler of the auspicious throne.", 16),
      verse(4, "४. चिदग्निकुण्डसम्भूता", "4. cidagnikuṇḍasambhūtā", "Born from the fire of consciousness.", 24),
      verse(5, "५. देवकार्यसमुद्यता", "5. devakāryasamudyatā", "Risen for divine work.", 32)
    ]
  },
  {
    order: 10,
    slug: "lakshmi-aarti",
    deitySlug: "lakshmi",
    titleEn: "Lakshmi Aarti",
    type: "aarti",
    difficulty: "beginner",
    durationMinutes: 5,
    xpReward: 3,
    verseCount: 2,
    firstLinePreview: "Om Jai Lakshmi Mata...",
    description: "A lamp-centered evening prayer for gratitude, beauty, harmony, and auspicious prosperity.",
    plainStory: "Lakshmi Aarti is not just a prayer for money. It is a prayer for order, grace, hospitality, emotional balance, and the kind of prosperity that supports family wellbeing.\n\nFor NRI households it is especially relevant on Fridays, Diwali, and before a new financial or business step.",
    wordGlossary: [
      glossary("Lakṣmī", "lak-shmee", "Goddess of auspicious prosperity."),
      glossary("Mātā", "maa-taa", "Mother."),
      glossary("Nisadin", "ni-sa-din", "Day and night."),
      glossary("Sevat", "se-vat", "Serve or worship."),
      glossary("Jag-mātā", "jag maa-taa", "Mother of the world.")
    ],
    familyContext: "Use on Friday evenings, at Diwali, or before opening a new chapter related to home or work.",
    beginnerTip: "Light one lamp and sing just the first verse steadily for a month before adding more.",
    nriRelevance: "Lakshmi is invoked in homes and businesses across the diaspora, making this aarti both devotional and culturally connective.",
    verses: [
      verse(1, "ॐ जय लक्ष्मी माता, मैया जय लक्ष्मी माता ।\nतुमको निसदिन सेवत, हर विष्णु विधाता ॥", "oṃ jaya lakṣmī mātā, maiyā jaya lakṣmī mātā |\ntumako nisadina sevata, hara viṣṇu vidhātā ||", "Victory to Mother Lakshmi, worshipped day and night by Vishnu and the gods.", 0),
      verse(2, "उमा रमा ब्रह्माणी, तुम ही जग-माता ।\nसूर्य-चन्द्रमा ध्यावत, नारद ऋषि गाता ॥", "umā ramā brahmāṇī, tuma hī jagamātā |\nsūrya-candrama dhyāvata, nārada ṛṣi gātā ||", "You are the Mother of the world, contemplated by celestial beings and praised by sages.", 20)
    ]
  }
);

function buildPrayerUpdate(prayer, deityBySlug) {
  const deity = deityBySlug[prayer.deitySlug];
  if (!deity) {
    throw new Error(`Unable to resolve deity for prayer seed: ${prayer.slug}`);
  }

  const devanagari = prayer.scriptDevanagari || (!prayer.scriptMalayalam ? buildScriptContent(prayer) : null);
  const malayalam = prayer.scriptMalayalam || null;
  const setPayload = {
    slug: prayer.slug,
    deity: deity._id,
    externalId: `prayer-${prayer.order}`,
    order: prayer.order,
    "title.en": prayer.titleEn,
    type: prayer.type,
    difficulty: prayer.difficulty,
    durationMinutes: prayer.durationMinutes,
    plainStory: prayer.plainStory,
    wordGlossary: prayer.wordGlossary,
    familyContext: prayer.familyContext,
    beginnerTip: prayer.beginnerTip,
    beginnerNote: prayer.beginnerTip,
    nriRelevance: prayer.nriRelevance,
    verseCount: prayer.verseCount,
    verses: prayer.verses,
    xpReward: prayer.xpReward,
    firstLinePreview: prayer.firstLinePreview,
    transliteration: prayer.transliteration || buildIastContent(prayer),
    iast: buildIastContent(prayer),
    meaning: buildMeaningContent(prayer),
    "content.devanagari": devanagari,
    "content.malayalam": malayalam,
    "content.english": prayer.description,
    audioUrl: buildAudioUrl(prayer.slug),
    requiredTier: "free",
    isPremium: false,
    recommendedRepetitions: prayer.recommendedRepetitions || [1, 3, 11, 21, 108],
    tags: prayer.tags || [prayer.deitySlug, prayer.type, prayer.difficulty]
  };

  return {
    updateOne: {
      filter: { slug: prayer.slug },
      update: {
        $set: setPayload,
        $setOnInsert: {
          isFeatured: prayer.order <= 6
        }
      },
      upsert: true
    }
  };
}

export async function syncAuthoritativePrayerCatalog({ Prayer, deityBySlug }) {
  const operations = AUTHORITATIVE_PRAYER_CATALOG.map((prayer) => buildPrayerUpdate(prayer, deityBySlug));
  if (operations.length) {
    await Prayer.bulkWrite(operations, { ordered: true });
  }

  return Prayer.find({
    slug: { $in: AUTHORITATIVE_PRAYER_CATALOG.map((item) => item.slug) }
  });
}

export { AUTHORITATIVE_PRAYER_CATALOG };
