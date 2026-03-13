package com.divya.android.ui.screens

import com.divya.data.models.Coordinates
import com.divya.data.models.CurrencyAmount
import com.divya.data.models.Deity
import com.divya.data.models.LocalizedText
import com.divya.data.models.Nakshatra
import com.divya.data.models.Panchang
import com.divya.data.models.PanchangLocation
import com.divya.data.models.Prayer
import com.divya.data.models.PrayerContent
import com.divya.data.models.Puja
import com.divya.data.models.PujaDescription
import com.divya.data.models.PujaPricing
import com.divya.data.models.Temple
import com.divya.data.models.TempleLocation
import com.divya.data.models.TemplePujaTiming
import com.divya.data.models.TempleTimings
import com.divya.data.models.Tithi

object AppContent {
    data class ProofStat(
        val value: String,
        val label: String,
    )

    data class SubscriptionTier(
        val name: String,
        val price: String,
        val summary: String,
        val perks: List<String>,
        val badge: String? = null,
        val cta: String,
        val footnote: String,
    )

    data class ComparisonRow(
        val feature: String,
        val free: String,
        val bhakt: String,
        val seva: String,
    )

    val bhagavathi = Deity(
        id = "deity-bhadra",
        slug = "bhadra-bhagavathi",
        name = LocalizedText(
            en = "Bhadra Bhagavathi",
            ml = "ഭദ്ര ഭഗവതി",
            sa = "भद्र भगवती",
        ),
        shortDescription = "Protective Kerala Tantric form of Devi for devotees living far from home.",
        fullDescription = "She is worshipped as a fierce yet compassionate mother who grants courage, protection, and emotional rootedness to diaspora families who cannot be physically present at the temple.",
        pronunciationGuide = "BHUD-ra Bha-ga-va-thee",
        tradition = "Shaktism · Kerala Tantric Agama",
        isFeatured = true,
        order = 1,
    )

    val ganesha = Deity(
        id = "deity-ganesha",
        slug = "ganesha",
        name = LocalizedText(en = "Ganesha", sa = "गणेश"),
        shortDescription = "Remover of obstacles and guardian of auspicious beginnings.",
        fullDescription = "Ganesha is traditionally invoked first so prayer, travel, work, and family milestones begin with clarity and fewer obstacles.",
        pronunciationGuide = "Guh-nay-sha",
        tradition = "Smarta",
        isFeatured = true,
        order = 0,
    )

    val shiva = Deity(
        id = "deity-shiva",
        slug = "shiva",
        name = LocalizedText(en = "Shiva", sa = "शिव"),
        shortDescription = "Lord of stillness, transformation, and inner surrender.",
        fullDescription = "Shiva prayers in the app focus on calm, surrender, healing, and spiritual steadiness for devotees balancing intense modern lives.",
        pronunciationGuide = "Shi-va",
        tradition = "Shaivism",
        order = 2,
    )

    val vishnu = Deity(
        id = "deity-vishnu",
        slug = "vishnu",
        name = LocalizedText(en = "Vishnu", sa = "विष्णु"),
        shortDescription = "Preserver and protector associated with steadiness and grace.",
        fullDescription = "Vishnu prayers in the app support family stability, inner reassurance, and devotional consistency across busy routines abroad.",
        pronunciationGuide = "Vish-nu",
        tradition = "Vaishnavism",
        order = 3,
    )

    val krishna = Deity(
        id = "deity-krishna",
        slug = "krishna",
        name = LocalizedText(en = "Krishna", sa = "कृष्ण"),
        shortDescription = "Beloved form of Vishnu associated with devotion, joy, and loving remembrance.",
        fullDescription = "Krishna prayers in the app are positioned for warmth, bhakti, and devotional music that families can return to daily.",
        pronunciationGuide = "Krish-na",
        tradition = "Vaishnavism",
        order = 4,
    )

    val lakshmi = Deity(
        id = "deity-lakshmi",
        slug = "lakshmi",
        name = LocalizedText(en = "Lakshmi", sa = "लक्ष्मी"),
        shortDescription = "Goddess of auspicious abundance, harmony, and grace.",
        fullDescription = "Lakshmi prayers in the app focus on gratitude, household harmony, and an abundance mindset rooted in dharma rather than material excess.",
        pronunciationGuide = "Luck-shmee",
        tradition = "Shaktism",
        order = 5,
    )

    val saraswati = Deity(
        id = "deity-saraswati",
        slug = "saraswati",
        name = LocalizedText(en = "Saraswati", sa = "सरस्वती"),
        shortDescription = "Goddess of wisdom, learning, and artistic clarity.",
        fullDescription = "Saraswati prayers are especially valuable for students, children, and professionals who want a devotional practice around study and expression.",
        pronunciationGuide = "Suh-rus-wa-thee",
        tradition = "Shaktism",
        order = 6,
    )

    val hanuman = Deity(
        id = "deity-hanuman",
        slug = "hanuman",
        name = LocalizedText(en = "Hanuman", sa = "हनुमान"),
        shortDescription = "Embodiment of devotion, courage, and unwavering service.",
        fullDescription = "Hanuman prayers in the app support resilience, discipline, travel, and courage during difficult seasons.",
        pronunciationGuide = "Hun-oo-maan",
        tradition = "Vaishnavism",
        order = 7,
    )

    val durga = Deity(
        id = "deity-durga",
        slug = "durga",
        name = LocalizedText(en = "Durga", sa = "\u0926\u0941\u0930\u094d\u0917\u093e"),
        shortDescription = "Warrior Mother who protects dharma and removes fear.",
        fullDescription = "Durga prayers in the app support courage, resilience, and disciplined devotion during uncertain life phases.",
        pronunciationGuide = "Dur-ga",
        tradition = "Shaktism",
        order = 8,
    )

    val rama = Deity(
        id = "deity-rama",
        slug = "rama",
        name = LocalizedText(en = "Rama", sa = "\u0930\u093e\u092e"),
        shortDescription = "Embodiment of dharma, integrity, and steady devotion.",
        fullDescription = "Rama prayers in the app are positioned for families seeking values-centered practice and inner steadiness.",
        pronunciationGuide = "Raa-ma",
        tradition = "Vaishnavism",
        order = 9,
    )

    val surya = Deity(
        id = "deity-surya",
        slug = "surya",
        name = LocalizedText(en = "Surya", sa = "\u0938\u0942\u0930\u094d\u092f"),
        shortDescription = "Solar deity associated with vitality, health, and discipline.",
        fullDescription = "Surya prayers in the app support daily structure, focus, and morning prayer routines.",
        pronunciationGuide = "Sur-ya",
        tradition = "Smarta",
        order = 10,
    )

    val murugan = Deity(
        id = "deity-murugan",
        slug = "murugan",
        name = LocalizedText(en = "Murugan", sa = "\u0938\u094d\u0915\u0928\u094d\u0926"),
        shortDescription = "South Indian deity of courage, wisdom, and youthful strength.",
        fullDescription = "Murugan prayers in the app serve diaspora families seeking South Indian devotional continuity across generations.",
        pronunciationGuide = "Moo-roo-gan",
        tradition = "Smarta",
        order = 11,
    )

    val deities = listOf(
        ganesha,
        bhagavathi,
        shiva,
        vishnu,
        krishna,
        lakshmi,
        saraswati,
        hanuman,
        durga,
        rama,
        surya,
        murugan,
    )

    val temple = Temple(
        id = "temple-bhadra",
        name = LocalizedText(
            en = "Bhadra Bhagavathi Temple, Karunagapally",
            ml = "ഭദ്ര ഭഗവതി ക്ഷേത്രം, കരുനാഗപ്പള്ളി",
            sa = "भद्र भगवती मंदिर, करुनागपल्ली",
        ),
        deity = bhagavathi,
        shortDescription = "The one sacred temple in Divya, serving the Kerala diaspora worldwide.",
        fullDescription = "Divya is designed as a temple bridge for devotees in New York, London, Toronto, Dubai, and Melbourne who want an authentic ritual connection to Kerala without flattening tradition into generic wellness language.",
        significance = "The Goddess is revered as a guardian who removes fear, protects the household, and receives prayers offered through the temple's licensed Tantri.",
        tradition = "Kerala Tantric Agama",
        location = TempleLocation(
            city = "Karunagapally",
            district = "Kollam",
            state = "Kerala",
            country = "India",
            coordinates = Coordinates(9.0167, 76.5333),
        ),
        heroImage = null,
        timings = TempleTimings(
            pujas = listOf(
                TemplePujaTiming("Usha Puja", "ഉഷ പൂജ", "4:30 AM – 5:30 AM IST", "Pre-dawn awakening of the Goddess."),
                TemplePujaTiming("Ethrittu Puja", "എതിരിട്ട് പൂജ", "7:00 AM – 9:00 AM IST", "Morning ritual sequence after sunrise."),
                TemplePujaTiming("Pantheeradi Puja", "പന്ത്രണ്ടടി പൂജ", "12:00 PM – 1:00 PM IST", "Noon offering before the temple quietens."),
                TemplePujaTiming("Athazha Puja", "അത്താഴ പൂജ", "5:30 PM – 7:00 PM IST", "Evening lamp ritual and deeparadhana."),
                TemplePujaTiming("Athazha Sheeveli", "അത്താഴ ശ്രീ വേലി", "7:30 PM – 8:30 PM IST", "Night circumambulation in Kerala temple tradition."),
            ),
        ),
        nriNote = "Pujas are performed by the temple's licensed Tantri at Bhadra Bhagavathi Temple in Karunagapally, Kerala, and a full HD video is delivered within 48 hours.",
        panchangLocation = PanchangLocation(9.0167, 76.5333, "Asia/Kolkata"),
    )

    val panchang = Panchang(
        date = "2026-03-04",
        timezone = "America/New_York",
        tithi = Tithi("Ekadashi", "Shukla", 11),
        nakshatra = Nakshatra(8, "Pushya", "पुष्य", "Brihaspati"),
        sunriseUtc = "2026-03-04T11:22:00Z",
        sunsetUtc = "2026-03-04T22:10:00Z",
        rahuKaalStartUtc = "2026-03-04T14:00:00Z",
        rahuKaalEndUtc = "2026-03-04T15:30:00Z",
        sunriseLocal = "6:22 AM EST",
        sunsetLocal = "5:10 PM EST",
        rahuKaalStartLocal = "9:00 AM EST",
        rahuKaalEndLocal = "10:30 AM EST",
        infoTooltip = "Panchang timings are referenced from Karunagapally, Kerala and converted to your local timezone.",
    )

    private fun simplePrayer(
        id: String,
        deity: Deity?,
        nameEn: String,
        nameSa: String? = null,
        nameMl: String? = null,
        slug: String,
        type: String,
        difficulty: String,
        duration: Int,
        transliteration: String,
        devanagari: String? = null,
        english: String,
        meaning: String,
        tags: List<String>,
        recommendedRepetitions: List<Int>,
        audioUrl: String? = null,
        beginnerNote: String? = null,
        order: Int,
    ): Prayer {
        return Prayer(
            id = id,
            deity = deity,
            title = LocalizedText(en = nameEn, sa = nameSa, ml = nameMl),
            slug = slug,
            type = type,
            difficulty = difficulty,
            durationMinutes = duration,
            transliteration = transliteration,
            content = PrayerContent(
                devanagari = devanagari,
                malayalam = nameMl,
                english = english,
            ),
            iast = transliteration,
            beginnerNote = beginnerNote,
            meaning = meaning,
            audioUrl = audioUrl,
            recommendedRepetitions = recommendedRepetitions,
            tags = tags,
            order = order,
        )
    }

    val mahishasuraMardini = Prayer(
        id = "prayer-1",
        deity = bhagavathi,
        title = LocalizedText(
            en = "Mahishasura Mardini Stotram",
            ml = "മഹിഷാസുര മർദിനി സ്തോത്രം",
            sa = "महिषासुरमर्दिनि स्तोत्रम्",
        ),
        slug = "mahishasura-mardini-stotram",
        type = "stotram",
        difficulty = "intermediate",
        durationMinutes = 9,
        transliteration = "Ayi giri nandini nandita medini visva vinodini nandanute",
        content = PrayerContent(
            devanagari = "अयि गिरिनन्दिनि नन्दितमेदिनि विश्वविनोदिनि नन्दनुते",
            malayalam = "അയി ഗിരിനന്ദിനി നന്ദിതമേദിനി വിശ്വവിനോദിനി നന്ദനുതേ",
            english = "O mountain-born Mother, delight of the world, praised by all who seek your grace.",
        ),
        iast = "Ayi giri nandini nandita medini visva vinodini nandanute",
        beginnerNote = "Listen first, then follow the transliteration line by line.",
        meaning = "A deeply loved hymn to the Goddess for courage, protection, and inner steadiness.",
        audioUrl = "raw://mahishasura_mardini_stotram",
        recommendedRepetitions = listOf(1, 3, 11, 21),
        isFeatured = true,
        tags = listOf("Devi", "Kerala", "Protection"),
        order = 1,
    )

    val navarnaMantra = Prayer(
        id = "prayer-2",
        deity = bhagavathi,
        title = LocalizedText(
            en = "Navarna Mantra",
            ml = "നവാർണ മന്ത്രം",
            sa = "नवार्ण मन्त्रः",
        ),
        slug = "navarna-mantra",
        type = "mantra",
        difficulty = "beginner",
        durationMinutes = 12,
        transliteration = "Om Aim Hrim Klim Camundayai Vicce",
        content = PrayerContent(
            devanagari = "ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे",
            malayalam = "ഓം ഐം ഹ്രീം ക്ലീം ചാമുണ്ഡായൈ വിച്ചേ",
            english = "A compact mantra invoking the protective power of the Divine Mother.",
        ),
        iast = "Om Aim Hrim Klim Camundayai Vicce",
        beginnerNote = "Recommended with a 108-bead mala for steady daily practice.",
        meaning = "The nine-syllable mantra of the Goddess used for protection and spiritual focus.",
        audioUrl = "raw://navarna_mantra",
        recommendedRepetitions = listOf(11, 21, 51, 108),
        isFeatured = true,
        tags = listOf("Daily practice", "108 reps", "Shakta"),
        order = 2,
    )

    val gayatri = Prayer(
        id = "prayer-3",
        deity = null,
        title = LocalizedText(
            en = "Gayatri Mantra",
            ml = "ഗായത്രി മന്ത്രം",
            sa = "गायत्री मन्त्रः",
        ),
        slug = "gayatri-mantra",
        type = "mantra",
        difficulty = "beginner",
        durationMinutes = 6,
        transliteration = "Om bhur bhuvah svah tat savitur varenyam",
        content = PrayerContent(
            devanagari = "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं",
            malayalam = "ഓം ഭൂർഭുവഃ സ്വഃ തത് സവിതുര് വരേണ്യം",
            english = "A universal prayer for clarity, light, and right understanding.",
        ),
        iast = "Om bhur bhuvah svah tat savitur varenyam",
        beginnerNote = "Ideal for morning prayer reminders at 7:00 AM local time.",
        meaning = "A Vedic prayer for illumination and wisdom.",
        audioUrl = "raw://gayatri_mantra",
        recommendedRepetitions = listOf(3, 11, 21),
        isFeatured = true,
        tags = listOf("Morning", "Clarity", "Family"),
        order = 3,
    )

    val deviMahatmyam = Prayer(
        id = "prayer-4",
        deity = bhagavathi,
        title = LocalizedText(
            en = "Ya Devi Sarvabhuteshu",
            ml = "യാ ദേവി സർവഭൂതേഷു",
            sa = "या देवी सर्वभूतेषु",
        ),
        slug = "ya-devi-sarvabhuteshu",
        type = "shloka",
        difficulty = "beginner",
        durationMinutes = 5,
        transliteration = "Ya devi sarvabhuteshu saktirupena samsthita",
        content = PrayerContent(
            devanagari = "या देवी सर्वभूतेषु शक्तिरूपेण संस्थिता",
            malayalam = "യാ ദേവി സർവഭൂതേഷു ശക്തിരൂപേണ സംസ്ഥിതാ",
            english = "Salutations to the Goddess who abides in all beings as divine power.",
        ),
        iast = "Ya devi sarvabhuteshu saktirupena samsthita",
        beginnerNote = "A concise Devi prayer for daily grounding.",
        meaning = "A prayer recognizing the Goddess in all forms of life.",
        audioUrl = "raw://ya_devi_sarvabhuteshu",
        recommendedRepetitions = listOf(3, 11, 21),
        isFeatured = true,
        tags = listOf("Universal Devi", "Beginner", "Daily"),
        order = 4,
    )

    val keralaBhagavathiStuti = Prayer(
        id = "prayer-5",
        deity = bhagavathi,
        title = LocalizedText(
            en = "Kerala Bhagavathi Stuti",
            ml = "കേരള ഭഗവതി സ്തുതി",
            sa = "भगवती स्तुतिः",
        ),
        slug = "kerala-bhagavathi-stuti",
        type = "stuti",
        difficulty = "intermediate",
        durationMinutes = 7,
        transliteration = "Bhagavathi amma rakshikkaname",
        content = PrayerContent(
            devanagari = null,
            malayalam = "ഭഗവതി അമ്മേ രക്ഷിക്കണമേ, കനിവോടെ കണ്ണ് പതിയണമേ",
            english = "Mother Bhagavathi, protect us and rest your compassionate gaze on our home.",
        ),
        iast = null,
        beginnerNote = "Ideal for Malayalam-speaking families who want a direct emotional connection to home.",
        meaning = "A Kerala devotional song seeking the Mother's protection.",
        audioUrl = "raw://kerala_bhagavathi_stuti",
        recommendedRepetitions = listOf(1, 3, 11),
        isFeatured = false,
        tags = listOf("Malayalam", "Home", "Protection"),
        order = 5,
    )

    val mrityunjaya = Prayer(
        id = "prayer-6",
        deity = null,
        title = LocalizedText(
            en = "Maha Mrityunjaya",
            ml = "മഹാമൃത്യുഞ്ജയ മന്ത്രം",
            sa = "महामृत्युञ्जय मन्त्रः",
        ),
        slug = "maha-mrityunjaya",
        type = "mantra",
        difficulty = "beginner",
        durationMinutes = 8,
        transliteration = "Om tryambakam yajamahe sugandhim pustivardhanam",
        content = PrayerContent(
            devanagari = "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्",
            malayalam = "ഓം ത്ര്യംബകം യജാമഹേ സുഗന്ധിം പുഷ്ടിവർധനം",
            english = "A healing prayer for strength, endurance, and release from fear.",
        ),
        iast = "Om tryambakam yajamahe sugandhim pustivardhanam",
        beginnerNote = "Often chosen during periods of illness or uncertainty.",
        meaning = "A prayer for healing, resilience, and freedom from fear.",
        audioUrl = "raw://maha_mrityunjaya",
        recommendedRepetitions = listOf(3, 11, 21, 108),
        tags = listOf("Healing", "Calm", "Family"),
        order = 6,
    )

    val omChant = simplePrayer(
        id = "prayer-7",
        deity = null,
        nameEn = "Om Chant",
        nameSa = "ॐ",
        slug = "om-chant",
        type = "mantra",
        difficulty = "beginner",
        duration = 3,
        transliteration = "Om",
        devanagari = "ॐ",
        english = "A foundational sacred sound used for centering before prayer or meditation.",
        meaning = "A grounding chant to settle breath, attention, and devotional focus.",
        tags = listOf("Breath", "Focus", "Audio"),
        recommendedRepetitions = listOf(3, 11, 21, 108),
        audioUrl = "raw://om_chant",
        beginnerNote = "A simple starting point for anyone building a daily practice.",
        order = 7,
    )

    val omTatSat = simplePrayer(
        id = "prayer-8",
        deity = null,
        nameEn = "Om Tat Sat",
        nameSa = "ॐ तत् सत्",
        slug = "om-tat-sat",
        type = "mantra",
        difficulty = "beginner",
        duration = 2,
        transliteration = "Om Tat Sat",
        devanagari = "ॐ तत् सत्",
        english = "A concise sacred formula used to sanctify action and remembrance.",
        meaning = "A short chant for grounding actions in truth and devotion.",
        tags = listOf("Short", "Daily", "Audio"),
        recommendedRepetitions = listOf(3, 11, 21),
        audioUrl = "raw://om_tat_sat",
        beginnerNote = "Useful before work, study, or a longer prayer session.",
        order = 8,
    )

    val omNamoBhagavate = simplePrayer(
        id = "prayer-9",
        deity = vishnu,
        nameEn = "Om Namo Bhagavate Vasudevaya",
        nameSa = "ॐ नमो भगवते वासुदेवाय",
        slug = "om-namo-bhagavate-vasudevaya",
        type = "mantra",
        difficulty = "beginner",
        duration = 6,
        transliteration = "Om Namo Bhagavate Vasudevaya",
        devanagari = "ॐ नमो भगवते वासुदेवाय",
        english = "A deeply loved Vaishnava mantra of surrender and remembrance.",
        meaning = "A mantra for trust, emotional steadiness, and surrender to the Divine.",
        tags = listOf("Vaishnava", "Audio", "Family"),
        recommendedRepetitions = listOf(11, 21, 51, 108),
        audioUrl = "raw://om_namo_bhagavate_vasudevaya",
        beginnerNote = "A warm, accessible mantra for families and second-generation devotees.",
        order = 9,
    )

    val omNamahShivaya = simplePrayer(
        id = "prayer-10",
        deity = shiva,
        nameEn = "Om Namah Shivaya",
        nameSa = "ॐ नमः शिवाय",
        slug = "om-namah-shivaya",
        type = "mantra",
        difficulty = "beginner",
        duration = 5,
        transliteration = "Om Namah Shivaya",
        devanagari = "ॐ नमः शिवाय",
        english = "A five-syllable Shiva mantra for surrender and inner stillness.",
        meaning = "A stabilizing mantra used for calm, surrender, and inner quiet.",
        tags = listOf("Shiva", "Calm", "Daily"),
        recommendedRepetitions = listOf(11, 21, 108),
        audioUrl = "raw://om_namah_shivaya",
        order = 10,
    )

    val shantiMantra = simplePrayer(
        id = "prayer-11",
        deity = null,
        nameEn = "Shanti Mantra",
        nameSa = "ॐ शान्तिः शान्तिः शान्तिः",
        slug = "shanti-mantra",
        type = "mantra",
        difficulty = "beginner",
        duration = 4,
        transliteration = "Om Shantih Shantih Shantih",
        devanagari = "ॐ शान्तिः शान्तिः शान्तिः",
        english = "A peace invocation suitable for home, work, or closing a longer prayer.",
        meaning = "A chant for peace within, around, and beyond oneself.",
        tags = listOf("Peace", "Beginner", "Family"),
        recommendedRepetitions = listOf(3, 11, 21),
        audioUrl = "raw://shanti_mantra",
        order = 11,
    )

    val suryaMantra = simplePrayer(
        id = "prayer-12",
        deity = null,
        nameEn = "Surya Mantra",
        nameSa = "ॐ सूर्याय नमः",
        slug = "surya-mantra",
        type = "mantra",
        difficulty = "beginner",
        duration = 4,
        transliteration = "Om Suryaya Namah",
        devanagari = "ॐ सूर्याय नमः",
        english = "A bright morning mantra for discipline, vitality, and clarity.",
        meaning = "A chant for energy, clarity, and a strong beginning to the day.",
        tags = listOf("Morning", "Energy", "Beginner"),
        recommendedRepetitions = listOf(3, 11, 21),
        audioUrl = "raw://surya_mantra",
        order = 12,
    )

    val ganeshAarti = simplePrayer(
        id = "prayer-13",
        deity = ganesha,
        nameEn = "Ganesh Aarti",
        nameSa = "जय गणेश जय गणेश",
        slug = "ganesh-aarti",
        type = "aarti",
        difficulty = "beginner",
        duration = 6,
        transliteration = "Jaya Ganesha Jaya Ganesha",
        english = "A devotional aarti to begin important work, travel, or family milestones.",
        meaning = "A familiar opening prayer for auspicious beginnings and fewer obstacles.",
        tags = listOf("Ganesha", "Aarti", "Beginnings"),
        recommendedRepetitions = listOf(1, 3, 11),
        audioUrl = "raw://ganesh_aarti",
        order = 13,
    )

    val lakshmiAarti = simplePrayer(
        id = "prayer-14",
        deity = lakshmi,
        nameEn = "Lakshmi Aarti",
        nameSa = "जय लक्ष्मी माता",
        slug = "lakshmi-aarti",
        type = "aarti",
        difficulty = "beginner",
        duration = 6,
        transliteration = "Jaya Lakshmi Mata",
        english = "An evening aarti for gratitude, harmony, and auspicious abundance in the home.",
        meaning = "A household prayer for grace, harmony, and gratitude.",
        tags = listOf("Lakshmi", "Evening", "Family"),
        recommendedRepetitions = listOf(1, 3, 11),
        audioUrl = "raw://lakshmi_aarti",
        order = 14,
    )

    val saraswatiVandana = simplePrayer(
        id = "prayer-15",
        deity = saraswati,
        nameEn = "Saraswati Vandana",
        nameSa = "या कुन्देन्दुतुषारहारधवला",
        slug = "saraswati-vandana",
        type = "vandana",
        difficulty = "beginner",
        duration = 5,
        transliteration = "Ya Kundendu Tusharahara Dhavala",
        english = "A prayer for study, speech, art, and graceful learning.",
        meaning = "A devotional invocation for clarity of thought and expression.",
        tags = listOf("Study", "Children", "Wisdom"),
        recommendedRepetitions = listOf(1, 3, 11),
        audioUrl = "raw://saraswati_vandana",
        order = 15,
    )

    val krishnaAarti = simplePrayer(
        id = "prayer-16",
        deity = krishna,
        nameEn = "Krishna Aarti",
        nameSa = "आरती कुंज बिहारी की",
        slug = "krishna-aarti",
        type = "aarti",
        difficulty = "beginner",
        duration = 6,
        transliteration = "Aarti Kunj Bihari Ki",
        english = "A devotional aarti full of warmth, bhakti, and loving remembrance.",
        meaning = "A prayer of affectionate devotion centered on Krishna.",
        tags = listOf("Krishna", "Bhakti", "Music"),
        recommendedRepetitions = listOf(1, 3, 11),
        audioUrl = "raw://krishna_aarti",
        order = 16,
    )

    val morningPrayer = simplePrayer(
        id = "prayer-17",
        deity = null,
        nameEn = "Morning Prayer",
        nameSa = "प्रातः स्मरणम्",
        slug = "morning-prayer",
        type = "prayer",
        difficulty = "beginner",
        duration = 4,
        transliteration = "Pratah Smaranam",
        english = "A short morning remembrance for calm focus before the day begins.",
        meaning = "A gentle devotional reset for mornings before work, school, or travel.",
        tags = listOf("Morning", "Routine", "Beginner"),
        recommendedRepetitions = listOf(1, 3, 11),
        audioUrl = "raw://morning_prayer",
        order = 17,
    )

    val shivaPanchakshara = simplePrayer(
        id = "prayer-18",
        deity = shiva,
        nameEn = "Shiva Panchakshara",
        nameSa = "नमः शिवाय",
        slug = "shiva-panchakshara",
        type = "stotram",
        difficulty = "intermediate",
        duration = 9,
        transliteration = """
            naagEndrahaaraaya trilOchanaaya
            bhasmaangaraagaaya mahEshvaraaya ।
            nityaaya shuddhaaya digambaraaya
            tasmai "na" kaaraaya namaH shivaaya ॥ 1 ॥
            mandaakinee salila chandana charchitaaya
            nandeeshvara pramathanaatha mahEshvaraaya ।
            mandaara mukhya bahupushhpa supoojitaaya
            tasmai "ma" kaaraaya namaH shivaaya ॥ 2 ॥
            shivaaya gauree vadanaabja bRRinda
            sooryaaya dakshhaadhvara naashakaaya ।
            shree neelakaNThaaya vRRishhabhadhvajaaya
            tasmai "shi" kaaraaya namaH shivaaya ॥ 3 ॥
            vashishhTha kumbhOdbhava gautamaarya
            muneendra dEvaarchita shEkharaaya ।
            chandraarka vaishvaanara lOchanaaya
            tasmai "va" kaaraaya namaH shivaaya ॥ 4 ॥
            yajjhNa svaroopaaya jaTaadharaaya
            pinaaka hastaaya sanaatanaaya ।
            divyaaya dEvaaya digambaraaya
            tasmai "ya" kaaraaya namaH shivaaya ॥ 5 ॥
            panchaakshharamidaM puNyaM yaH paThEcChiva sannidhau ।
            shivalOkamavaapnOti shivEna saha mOdatE ॥
        """.trimIndent(),
        devanagari = """
            नागेन्द्रहाराय त्रिलोचनाय
            भस्माङ्गरागाय महेश्वराय ।
            नित्याय शुद्धाय दिगम्बराय
            तस्मै "न" काराय नमः शिवाय ॥ १ ॥
            मन्दाकिनी सलिल चन्दन चर्चिताय
            नन्दीश्वर प्रमथनाथ महेश्वराय ।
            मन्दार मुख्य बहुपुष्प सुपूजिताय
            तस्मै "म" काराय नमः शिवाय ॥ २ ॥
            शिवाय गौरी वदनाब्ज बृन्द
            सूर्याय दक्षाध्वर नाशकाय ।
            श्री नीलकण्ठाय वृषभध्वजाय
            तस्मै "शि" काराय नमः शिवाय ॥ ३ ॥
            वशिष्ठ कुम्भोद्भव गौतमार्य
            मुनीन्द्र देवार्चित शेखराय ।
            चन्द्रार्क वैश्वानर लोचनाय
            तस्मै "व" काराय नमः शिवाय ॥ ४ ॥
            यज्ञस्वरूपाय जटाधराय
            पिनाकहस्ताय सनातनाय ।
            दिव्याय देवाय दिगम्बराय
            तस्मै "य" काराय नमः शिवाय ॥ ५ ॥
            पञ्चाक्षरमिदं पुण्यं यः पठेच्छिवसन्निधौ ।
            शिवलोकमवाप्नोति शिवेन सह मोदते ॥
        """.trimIndent(),
        english = "The full Panchakshari stotram with five verses and closing phalashruti for Shiva devotion.",
        meaning = "A complete Shiva hymn built around Na-Ma-Shi-Va-Ya for reverence, quietude, and surrender.",
        tags = listOf("Shiva", "Stotram", "Meditative"),
        recommendedRepetitions = listOf(1, 3, 11),
        audioUrl = "raw://shiva_panchakshara",
        order = 18,
    )

    val vishnuSahasranama108 = simplePrayer(
        id = "prayer-19",
        deity = vishnu,
        nameEn = "Vishnu Sahasranama (108 Names)",
        nameSa = "विष्णु सहस्रनाम",
        slug = "vishnu-sahasranama-108",
        type = "stotram",
        difficulty = "intermediate",
        duration = 14,
        transliteration = "Sri Vishvam Vishnur Vashatkarah",
        english = "A shortened 108-name version for daily remembrance and family recitation.",
        meaning = "A structured devotional recitation for steadiness, faith, and remembrance.",
        tags = listOf("Vishnu", "108 names", "Family"),
        recommendedRepetitions = listOf(1, 3, 11),
        audioUrl = "raw://vishnu_sahasranama_108",
        order = 19,
    )

    val hanumanChalisa = simplePrayer(
        id = "prayer-20",
        deity = hanuman,
        nameEn = "Hanuman Chalisa",
        nameSa = "हनुमान चालीसा",
        slug = "hanuman-chalisa",
        type = "chalisa",
        difficulty = "intermediate",
        duration = 18,
        transliteration = """
            dOhaa
            shree guru charaNa sarOja raja nijamana mukura sudhaari ।
            varaNau raghuvara vimalayasha jO daayaka phalachaari ॥
            buddhiheena tanujaanikai sumirau pavana kumaara ।
            bala buddhi vidyaa dEhu mOhi harahu kalEsha vikaara ॥
            chaupaaee
            jaya hanumaana jjhNaana guNa saagara ।
            jaya kapeesha tihu lOka ujaagara ॥ 1 ॥
            raamadoota atulita baladhaamaa ।
            aMjani putra pavanasuta naamaa ॥ 2 ॥
            mahaaveera vikrama bajarangee ।
            kumati nivaara sumati kE sangee ॥ 3 ॥
            kaMchana varaNa viraaja suvEshaa ।
            kaanana kuMDala kuMchita kEshaa ॥ 4 ॥
            haathavajra au dhvajaa viraajai ।
            kaaMthE mooMja janEvoo saajai ॥ 5 ॥
            shaMkara suvana kEsaree nandana ।
            tEja prataapa mahaajaga vandana ॥ 6 ॥
            vidyaavaana guNee ati chaatura ।
            raama kaaja karivE kO aatura ॥ 7 ॥
            prabhu charitra sunivE kO rasiyaa ।
            raamalakhana seetaa mana basiyaa ॥ 8 ॥
            sookshhma roopadhari siyahi dikhaavaa ।
            vikaTa roopadhari laMka jalaavaa ॥ 9 ॥
            bheema roopadhari asura saMhaarE ।
            raamachaMdra kE kaaja saMvaarE ॥ 10 ॥
            laaya saMjeevana lakhana jiyaayE ।
            shree raghuveera harashhi uralaayE ॥ 11 ॥
            raghupati keenhee bahuta baDaayee ।
            tuma mama priya bharata sama bhaayee ॥ 12 ॥
            sahasra vadana tumharO yashagaavai ।
            asa kahi shreepati kaNTha lagaavai ॥ 13 ॥
            sanakaadika brahmaadi muneeshaa ।
            naarada shaarada sahita aheeshaa ॥ 14 ॥
            yama kubEra digapaala jahaaM tE ।
            kavi kOvida kahi sakE kahaaM tE ॥ 15 ॥
            tuma upakaara sugreevahi keenhaa ।
            raama milaaya raajapada deenhaa ॥ 16 ॥
            tumharO mantra vibheeshhaNa maanaa ।
            laMkEshvara bhayE saba jaga jaanaa ॥ 17 ॥
            yuga sahasra yOjana para bhaanoo ।
            leelyO taahi madhura phala jaanoo ॥ 18 ॥
            prabhu mudrikaa mEli mukha maahee ।
            jaladhi laaMghi gayE acharaja naahee ॥ 19 ॥
            durgama kaaja jagata kE jEtE ।
            sugama anugraha tumharE tEtE ॥ 20 ॥
            raama duaarE tuma rakhavaarE ।
            hOta na aajjhNaa binu paisaarE ॥ 21 ॥
            saba sukha lahai tumhaaree sharaNaa ।
            tuma rakshhaka kaahoo kO Dara naa ॥ 22 ॥
            aapana tEja samhaarO aapai ।
            teenOM lOka haaMka tE kaaMpai ॥ 23 ॥
            bhoota pishaacha nikaTa nahi aavai ।
            mahaveera jaba naama sunaavai ॥ 24 ॥
            naasai rOga harai saba peeraa ।
            japata niraMtara hanumata veeraa ॥ 25 ॥
            saMkaTa sE hanumaana ChuDaavai ।
            mana krama vachana dhyaana jO laavai ॥ 26 ॥
            saba para raama tapasvee raajaa ।
            tinakE kaaja sakala tuma saajaa ॥ 27 ॥
            aura manOradha jO kOyi laavai ।
            taasu amita jeevana phala paavai ॥ 28 ॥
            chaarO yuga prataapa tumhaaraa ।
            hai prasiddha jagata ujiyaaraa ॥ 29 ॥
            saadhu santa kE tuma rakhavaarE ।
            asura nikandana raama dulaarE ॥ 30 ॥
            ashhThasiddhi nava nidhi kE daataa ।
            asa vara deenha jaanakee maataa ॥ 31 ॥
            raama rasaayana tumhaarE paasaa ।
            sadaa rahO raghupati kE daasaa ॥ 32 ॥
            tumharE bhajana raamakO paavai ।
            janma janma kE dukha bisaraavai ॥ 33 ॥
            aMta kaala raghupati purajaayee ।
            jahaaM janma haribhakta kahaayee ॥ 34 ॥
            aura dEvataa chitta na dharayee ।
            hanumata sEyi sarva sukha karayee ॥ 35 ॥
            saMkaTa kaTai miTai saba peeraa ।
            jO sumirai hanumata bala veeraa ॥ 36 ॥
            jai jai jai hanumaana gOsaayee ।
            kRRipaa karahu gurudEva kee naayee ॥ 37 ॥
            jO shata vaara paaTha kara kOyee ।
            ChooTahi bandi mahaa sukha hOyee ॥ 38 ॥
            jO yaha paDai hanumaana chaaleesaa ।
            hOya siddhi saakhee gaureeshaa ॥ 39 ॥
            tulaseedaasa sadaa hari chEraa ।
            keejai naatha hRRidaya maha DEraa ॥ 40 ॥
            dOhaa
            pavana tanaya sankaTa haraNa - mangala moorati roop ।
            raama lakhana seetaa sahita - hRRidaya basahu surabhoop ॥
        """.trimIndent(),
        devanagari = """
            दोहा
            श्री गुरु चरण सरोज रज निजमन मुकुर सुधारि ।
            वरणौ रघुवर विमलयश जो दायक फलचारि ॥
            बुद्धिहीन तनु जानिकै सुमिरौं पवन कुमार ।
            बल बुद्धि विद्या देहु मोहि हरहु कलेश विकार ॥
            चौपाई
            जय हनुमान ज्ञान गुण सागर ।
            जय कपीश तिहुँ लोक उजागर ॥ १ ॥
            रामदूत अतुलित बलधामा ।
            अञ्जनि पुत्र पवनसुत नामा ॥ २ ॥
            महावीर विक्रम बजरङ्गी ।
            कुमति निवार सुमति के सङ्गी ॥ ३ ॥
            कञ्चन वरण विराज सुवेशा ।
            कानन कुण्डल कुञ्चित केशा ॥ ४ ॥
            हाथवज्र औ ध्वजा विराजै ।
            कान्थे मूञ्ज जनेवू साजै ॥ ५ ॥
            शङ्कर सुवन केसरी नन्दन ।
            तेज प्रताप महाजग वन्दन ॥ ६ ॥
            विद्यावान गुणी अति चातुर ।
            राम काज करिवे को आतुर ॥ ७ ॥
            प्रभु चरित्र सुनिवे को रसिया ।
            रामलखन सीता मन बसिया ॥ ८ ॥
            सूक्ष्म रूपधरि सियहि दिखावा ।
            विकट रूपधरि लङ्क जलावा ॥ ९ ॥
            भीम रूपधरि असुर संहारे ।
            रामचन्द्र के काज संवारे ॥ १० ॥
            लाय सञ्जीवन लखन जियाये ।
            श्री रघुवीर हरषि उरलाये ॥ ११ ॥
            रघुपति कीन्ही बहुत बड़ाई ।
            तुम मम प्रिय भरत सम भायी ॥ १२ ॥
            सहस्र वदन तुम्हरो यशगावै ।
            अस कहि श्रीपति कण्ठ लगावै ॥ १३ ॥
            सनकादिक ब्रह्मादि मुनीशा ।
            नारद शारद सहित अहीशा ॥ १४ ॥
            यम कुबेर दिगपाल जहाँ ते ।
            कवि कोविद कहि सके कहाँ ते ॥ १५ ॥
            तुम उपकार सुग्रीवहि कीन्हा ।
            राम मिलाय राजपद दीन्हा ॥ १६ ॥
            तुम्हरो मन्त्र विभीषण माना ।
            लङ्केश्वर भये सब जग जाना ॥ १७ ॥
            युग सहस्र योजन पर भानू ।
            लील्यो ताहि मधुर फल जानू ॥ १८ ॥
            प्रभु मुद्रिका मेलि मुख माही ।
            जलधि लाङ्घि गये अचरज नाही ॥ १९ ॥
            दुर्गम काज जगत के जेते ।
            सुगम अनुग्रह तुम्हरे तेते ॥ २० ॥
            राम दुआरे तुम रखवारे ।
            होत न आज्ञा बिनु पैसारे ॥ २१ ॥
            सब सुख लहै तुम्हारी शरणा ।
            तुम रक्षक काहू को डर ना ॥ २२ ॥
            आपन तेज सम्हारो आपै ।
            तीनों लोक हाँक ते काँपै ॥ २३ ॥
            भूत पिशाच निकट नहि आवै ।
            महावीर जब नाम सुनावै ॥ २४ ॥
            नासै रोग हरै सब पीरा ।
            जपत निरन्तर हनुमत वीरा ॥ २५ ॥
            सङ्कट से हनुमान छुड़ावै ।
            मन क्रम वचन ध्यान जो लावै ॥ २६ ॥
            सब पर राम तपस्वी राजा ।
            तिनके काज सकल तुम साजा ॥ २७ ॥
            और मनोरथ जो कोयि लावै ।
            तासु अमित जीवन फल पावै ॥ २८ ॥
            चारो युग प्रताप तुम्हारा ।
            है परसिद्ध जगत उजियारा ॥ २९ ॥
            साधु सन्त के तुम रखवारे ।
            असुर निकन्दन राम दुलारे ॥ ३० ॥
            अष्टसिद्धि नव निधि के दाता ।
            अस वर दीन्ह जानकी माता ॥ ३१ ॥
            राम रसायन तुम्हारे पासा ।
            सदा रहो रघुपति के दासा ॥ ३२ ॥
            तुम्हरे भजन रामको पावै ।
            जन्म जन्म के दुख बिसरावै ॥ ३३ ॥
            अन्त काल रघुपति पुरजायी ।
            जहाँ जन्म हरिभक्त कहायी ॥ ३४ ॥
            और देवता चित्त न धरयी ।
            हनुमत सेयि सर्व सुख करयी ॥ ३५ ॥
            सङ्कट कटै मिटै सब पीरा ।
            जो सुमिरै हनुमत बल वीरा ॥ ३६ ॥
            जै जै जै हनुमान गोसाई ।
            कृपा करहु गुरुदेव की नाई ॥ ३७ ॥
            यह शत वार पाठ कर कोयी ।
            छूटहि बन्दि महा सुख होयी ॥ ३८ ॥
            जो यह पढ़ै हनुमान चालीसा ।
            होय सिद्धि साखी गौरीशा ॥ ३९ ॥
            तुलसीदास सदा हरि चेरा ।
            कीजै नाथ हृदय मह डेरा ॥ ४० ॥
            दोहा
            पवन तनय संकट हरण - मङ्गल मूरति रूप ।
            राम लखन सीता सहित - हृदय बसहु सुरभूप ॥
        """.trimIndent(),
        english = "The complete Hanuman Chalisa with the opening and closing dohas, preserved as a full daily recitation.",
        meaning = "A full-length hymn for courage, discipline, service, and protection.",
        tags = listOf("Hanuman", "Protection", "Resilience"),
        recommendedRepetitions = listOf(1, 3, 11),
        audioUrl = "raw://hanuman_chalisa",
        order = 20,
    )

    val durgaChalisa = simplePrayer(
        id = "prayer-21",
        deity = bhagavathi,
        nameEn = "Durga Chalisa",
        nameSa = "दुर्गा चालीसा",
        slug = "durga-chalisa",
        type = "chalisa",
        difficulty = "intermediate",
        duration = 12,
        transliteration = "Namo Namo Durge Sukh Karani",
        english = "A devotional hymn to the Goddess for strength, courage, and protection.",
        meaning = "A focused Devi prayer for resilience and household protection.",
        tags = listOf("Devi", "Protection", "Courage"),
        recommendedRepetitions = listOf(1, 3, 11),
        audioUrl = "raw://durga_chalisa",
        order = 21,
    )

    val nirvanaShatakam = simplePrayer(
        id = "prayer-22",
        deity = shiva,
        nameEn = "Nirvana Shatakam",
        nameSa = "निर्वाण षट्कम्",
        slug = "nirvana-shatakam",
        type = "stotram",
        difficulty = "advanced",
        duration = 11,
        transliteration = """
            manO budhyahaMkaara cittaani naahaM
            na ca shrOtra jihvE na ca ghraaNanEtrE ।
            na ca vyOma bhoomir-na tEjO na vaayuH
            cidaanaMda roopaH shivO.ahaM shivO.aham ॥ 1 ॥
            na ca praaNa saMjjhNO na vaipaMcavaayuH
            na vaa saptadhaatur-na vaa paMcakOshaaH ।
            navaakpaaNi paadau na cOpastha paayoo
            cidaanaMda roopaH shivO.ahaM shivO.aham ॥ 2 ॥
            na mE dvEshharaagau na mE lObhamOhO
            madO naiva mE naiva maatsaryabhaavaH ।
            na dharmO na caardhO na kaamO na mOkshhaH
            cidaanaMda roopaH shivO.ahaM shivO.aham ॥ 3 ॥
            na puNyaM na paapaM na saukhyaM na duHkhaM
            na mantrO na teerthaM na vEdaa na yajjhNaH ।
            ahaM bhOjanaM naiva bhOjyaM na bhOktaa
            cidaanaMda roopaH shivO.ahaM shivO.aham ॥ 4 ॥
            na mRRityushaMkaa na mE jaati bhEdaH
            pitaa naiva mE naiva maataa na janmaH ।
            na baMdhur-na mitraM gururnaiva shishhyaH
            cidaanaMda roopaH shivO.ahaM shivO.aham ॥ 5 ॥
            ahaM nirvikalpO niraakaara roopO
            vibhootvaacca sarvatra sarvEMdriyaaNaam ।
            na vaa bandhanaM naiva mukti na baMdhaH
            cidaanaMda roopaH shivO.ahaM shivO.aham ॥ 6 ॥
        """.trimIndent(),
        devanagari = """
            मनो बुध्यहङ्कार चित्तानि नाहं
            न च श्रोत्र जिह्वे न च घ्राणनेत्रे ।
            न च व्योम भूमिर्न तेजो न वायुः
            चिदानन्द रूपः शिवोऽहं शिवोऽहम् ॥ १ ॥
            न च प्राणसंज्ञो न वैपञ्चवायुः
            न वा सप्तधातुर्न वा पञ्चकोशाः ।
            नवाक्पाणि पादौ न चोपस्थ पायू
            चिदानन्द रूपः शिवोऽहं शिवोऽहम् ॥ २ ॥
            न मे द्वेषरागौ न मे लोभमोहो
            मदो नैव मे नैव मात्सर्यभावः ।
            न धर्मो न चार्थो न कामो न मोक्षः
            चिदानन्द रूपः शिवोऽहं शिवोऽहम् ॥ ३ ॥
            न पुण्यं न पापं न सौख्यं न दुःखं
            न मन्त्रो न तीर्थं न वेदा न यज्ञः ।
            अहं भोजनं नैव भोज्यं न भोक्ता
            चिदानन्द रूपः शिवोऽहं शिवोऽहम् ॥ ४ ॥
            न मृत्युर्न शङ्का न मे जातिभेदः
            पिता नैव मे नैव माता न जन्मः ।
            न बन्धुर्न मित्रं गुरुर्नैव शिष्यः
            चिदानन्द रूपः शिवोऽहं शिवोऽहम् ॥ ५ ॥
            अहं निर्विकल्पो निराकार रूपो
            विभूत्वाच्च सर्वत्र सर्वेन्द्रियाणाम् ।
            न वा बन्धनं नैव मुक्तिर्न बन्धः
            चिदानन्द रूपः शिवोऽहं शिवोऽहम् ॥ ६ ॥
        """.trimIndent(),
        english = "The full six-verse Nirvana Shatakam for contemplative recitation and non-dual reflection.",
        meaning = "A complete Advaita hymn attributed to Adi Shankaracharya on the nature of the Self beyond body and mind.",
        tags = listOf("Contemplative", "Shiva", "Advanced"),
        recommendedRepetitions = listOf(1, 3, 11),
        audioUrl = "raw://nirvana_shatakam",
        order = 22,
    )

    val lalithaSahasranama108 = simplePrayer(
        id = "prayer-23",
        deity = bhagavathi,
        nameEn = "Lalitha Sahasranama (108 Names)",
        nameSa = "ललिता सहस्रनाम",
        slug = "lalitha-sahasranama-108",
        type = "stotram",
        difficulty = "advanced",
        duration = 16,
        transliteration = "Sri Mata Sri Maharajni",
        english = "A condensed daily-use 108-name recitation drawn from the Lalitha tradition.",
        meaning = "A devotional recitation centered on the Divine Mother in her radiant form.",
        tags = listOf("Devi", "108 names", "Advanced"),
        recommendedRepetitions = listOf(1, 3, 11),
        audioUrl = "raw://lalitha_sahasranama_108",
        order = 23,
    )

    val deviKavachamExcerpt = simplePrayer(
        id = "prayer-24",
        deity = bhagavathi,
        nameEn = "Devi Kavacham (Excerpt)",
        nameSa = "देवी कवचम्",
        slug = "devi-kavacham-excerpt",
        type = "stotram",
        difficulty = "advanced",
        duration = 11,
        transliteration = "Om Asya Sri Chandi Kavachasya",
        english = "A protective excerpt from the Devi Kavacham tradition for focused protection practice.",
        meaning = "A Devi protection prayer for devotees seeking reassurance during difficult periods.",
        tags = listOf("Protection", "Devi", "Advanced"),
        recommendedRepetitions = listOf(1, 3, 11),
        audioUrl = "raw://devi_kavacham_excerpt",
        order = 24,
    )

    val vakratundaMahakaya = simplePrayer(
        id = "prayer-25",
        deity = ganesha,
        nameEn = "Vakratunda Mahakaya",
        nameSa = "वक्रतुण्ड महाकाय",
        slug = "vakratunda-mahakaya",
        type = "shloka",
        difficulty = "beginner",
        duration = 2,
        transliteration = "Vakratunda Mahakaya Suryakoti Samaprabha Nirvighnam Kurume Deva Sarva Karyeshu Sarvada",
        devanagari = "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥",
        english = "O Ganesha of the curved trunk and vast form, radiant like millions of suns, remove obstacles from all my undertakings.",
        meaning = "A complete opening prayer for travel, work, study, and new beginnings.",
        tags = listOf("Ganesha", "Beginnings", "Complete prayer"),
        recommendedRepetitions = listOf(1, 3, 11, 21),
        audioUrl = "raw://vakratunda_mahakaya",
        order = 25,
    )

    val asatoMaSadgamaya = simplePrayer(
        id = "prayer-26",
        deity = null,
        nameEn = "Asato Ma Sadgamaya",
        nameSa = "असतो मा सद्गमय",
        slug = "asato-ma-sadgamaya",
        type = "shloka",
        difficulty = "beginner",
        duration = 2,
        transliteration = "Asato Ma Sadgamaya Tamaso Ma Jyotirgamaya Mrityor Ma Amritam Gamaya Om Shantih Shantih Shantih",
        devanagari = "असतो मा सद्गमय। तमसो मा ज्योतिर्गमय। मृत्योर्मामृतं गमय। ॐ शान्तिः शान्तिः शान्तिः॥",
        english = "Lead me from the unreal to the real, from darkness to light, from mortality to immortality.",
        meaning = "A complete Upanishadic prayer for clarity, truth, and inner elevation.",
        tags = listOf("Peace", "Wisdom", "Complete prayer"),
        recommendedRepetitions = listOf(1, 3, 11),
        audioUrl = "raw://asato_ma_sadgamaya",
        order = 26,
    )

    val tvamevaMata = simplePrayer(
        id = "prayer-27",
        deity = null,
        nameEn = "Tvameva Mata",
        nameSa = "त्वमेव माता च पिता त्वमेव",
        slug = "tvameva-mata",
        type = "prayer",
        difficulty = "beginner",
        duration = 2,
        transliteration = "Tvameva Mata Cha Pita Tvameva Tvameva Bandhushcha Sakha Tvameva Tvameva Vidya Dravinam Tvameva Tvameva Sarvam Mama Deva Deva",
        devanagari = "त्वमेव माता च पिता त्वमेव। त्वमेव बन्धुश्च सखा त्वमेव। त्वमेव विद्या द्रविणं त्वमेव। त्वमेव सर्वं मम देव देव॥",
        english = "You alone are my mother, father, companion, friend, wisdom, wealth, and everything.",
        meaning = "A complete prayer of surrender and intimacy with the Divine.",
        tags = listOf("Surrender", "Family", "Complete prayer"),
        recommendedRepetitions = listOf(1, 3, 11),
        audioUrl = "raw://tvameva_mata",
        order = 27,
    )

    val sarveBhavantuSukhinah = simplePrayer(
        id = "prayer-28",
        deity = null,
        nameEn = "Sarve Bhavantu Sukhinah",
        nameSa = "सर्वे भवन्तु सुखिनः",
        slug = "sarve-bhavantu-sukhinah",
        type = "shloka",
        difficulty = "beginner",
        duration = 2,
        transliteration = "Sarve Bhavantu Sukhinah Sarve Santu Niramayah Sarve Bhadrani Pashyantu Ma Kashchid Dukhabhag Bhavet Om Shantih Shantih Shantih",
        devanagari = "सर्वे भवन्तु सुखिनः। सर्वे सन्तु निरामयाः। सर्वे भद्राणि पश्यन्तु। मा कश्चिद्दुःखभाग्भवेत्। ॐ शान्तिः शान्तिः शान्तिः॥",
        english = "May all be happy, healthy, and see auspiciousness; may none suffer.",
        meaning = "A complete universal prayer for collective well-being.",
        tags = listOf("Peace", "Family", "Complete prayer"),
        recommendedRepetitions = listOf(1, 3, 11),
        audioUrl = "raw://sarve_bhavantu_sukhinah",
        order = 28,
    )

    val omGanGanapataye = simplePrayer(
        id = "prayer-29",
        deity = ganesha,
        nameEn = "Om Gan Ganapataye Namah",
        nameSa = "ॐ गं गणपतये नमः",
        slug = "om-gan-ganapataye-namah",
        type = "mantra",
        difficulty = "beginner",
        duration = 3,
        transliteration = "Om Gam Ganapataye Namah",
        devanagari = "ॐ गं गणपतये नमः",
        english = "A complete Ganesha mantra for beginnings, confidence, and clearing obstacles.",
        meaning = "A short and complete mantra for invoking Ganesha before important actions.",
        tags = listOf("Ganesha", "Obstacle removal", "Complete prayer"),
        recommendedRepetitions = listOf(11, 21, 51, 108),
        audioUrl = "raw://om_gan_ganapataye_namah",
        order = 29,
    )

    val omDumDurgayeiNamaha = simplePrayer(
        id = "prayer-30",
        deity = bhagavathi,
        nameEn = "Om Dum Durgayei Namaha",
        nameSa = "ॐ दुं दुर्गायै नमः",
        slug = "om-dum-durgayei-namaha",
        type = "mantra",
        difficulty = "beginner",
        duration = 3,
        transliteration = "Om Dum Durgayai Namah",
        devanagari = "ॐ दुं दुर्गायै नमः",
        english = "A complete Devi protection mantra for strength and resilience.",
        meaning = "A concise complete mantra for invoking Devi's protective energy.",
        tags = listOf("Devi", "Protection", "Complete prayer"),
        recommendedRepetitions = listOf(11, 21, 51, 108),
        audioUrl = "raw://om_dum_durgayei_namaha",
        order = 30,
    )

    val sriRamaJayaRama = simplePrayer(
        id = "prayer-31",
        deity = vishnu,
        nameEn = "Sri Rama Jaya Rama",
        nameSa = "श्री राम जय राम जय जय राम",
        slug = "sri-rama-jaya-rama",
        type = "mantra",
        difficulty = "beginner",
        duration = 4,
        transliteration = "Sri Rama Jaya Rama Jaya Jaya Rama",
        devanagari = "श्री राम जय राम जय जय राम",
        english = "A complete Rama mantra for reassurance, devotion, and inner steadiness.",
        meaning = "A short complete mantra of loving remembrance and faith.",
        tags = listOf("Rama", "Bhakti", "Complete prayer"),
        recommendedRepetitions = listOf(11, 21, 51, 108),
        audioUrl = "raw://sri_rama_jaya_rama",
        order = 31,
    )

    val mahaMantra = simplePrayer(
        id = "prayer-32",
        deity = krishna,
        nameEn = "Hare Rama Hare Krishna",
        nameSa = "हरे राम हरे कृष्ण",
        slug = "hare-rama-hare-krishna",
        type = "mantra",
        difficulty = "beginner",
        duration = 5,
        transliteration = "Hare Rama Hare Rama Rama Rama Hare Hare Hare Krishna Hare Krishna Krishna Krishna Hare Hare",
        devanagari = "हरे राम हरे राम राम राम हरे हरे। हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे॥",
        english = "A complete maha mantra of loving remembrance and devotional singing.",
        meaning = "A complete chant for joy, remembrance, and devotion.",
        tags = listOf("Krishna", "Bhakti", "Complete prayer"),
        recommendedRepetitions = listOf(11, 21, 51, 108),
        audioUrl = "raw://hare_rama_hare_krishna",
        order = 32,
    )

    val annapurneSadapurne = simplePrayer(
        id = "prayer-33",
        deity = bhagavathi,
        nameEn = "Annapurne Sadapurne",
        nameSa = "अन्नपूर्णे सदापूर्णे",
        slug = "annapurne-sadapurne",
        type = "shloka",
        difficulty = "intermediate",
        duration = 3,
        transliteration = "Annapurne Sadapurne Shankara Prana Vallabhe Jnana Vairagya Siddhyartham Bhiksham Dehi Cha Parvati",
        devanagari = "अन्नपूर्णे सदापूर्णे शङ्करप्राणवल्लभे। ज्ञानवैराग्यसिद्ध्यर्थं भिक्षां देहि च पार्वति॥",
        english = "O ever-full Annapurna, beloved of Shiva, grant me the nourishment of wisdom and detachment.",
        meaning = "A complete prayer for nourishment, gratitude, and spiritual sustenance.",
        tags = listOf("Devi", "Household", "Complete prayer"),
        recommendedRepetitions = listOf(1, 3, 11),
        audioUrl = "raw://annapurne_sadapurne",
        order = 33,
    )

    val guruBrahma = simplePrayer(
        id = "prayer-34",
        deity = null,
        nameEn = "Guru Brahma Guru Vishnu",
        nameSa = "गुरुर्ब्रह्मा गुरुर्विष्णुः",
        slug = "guru-brahma-guru-vishnu",
        type = "shloka",
        difficulty = "beginner",
        duration = 2,
        transliteration = "Gurur Brahma Gurur Vishnuh Gurur Devo Maheshvarah Guruh Sakshat Parabrahma Tasmai Sri Gurave Namah",
        devanagari = "गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः। गुरु: साक्षात् परब्रह्म तस्मै श्रीगुरवे नमः॥",
        english = "The Guru is Brahma, Vishnu, and Maheshvara, and is the manifest Absolute.",
        meaning = "A complete prayer of reverence for teachers, guidance, and learning.",
        tags = listOf("Wisdom", "Study", "Complete prayer"),
        recommendedRepetitions = listOf(1, 3, 11),
        audioUrl = "raw://guru_brahma_guru_vishnu",
        order = 34,
    )

    val omNamoNarayanaya = simplePrayer(
        id = "prayer-35",
        deity = vishnu,
        nameEn = "Om Namo Narayanaya",
        nameSa = "ॐ नमो नारायणाय",
        slug = "om-namo-narayanaya",
        type = "mantra",
        difficulty = "beginner",
        duration = 4,
        transliteration = "Om Namo Narayanaya",
        devanagari = "ॐ नमो नारायणाय",
        english = "A complete Vishnu mantra for reassurance, trust, and devotional steadiness.",
        meaning = "A short complete mantra of surrender to Narayana.",
        tags = listOf("Vishnu", "Calm", "Complete prayer"),
        recommendedRepetitions = listOf(11, 21, 51, 108),
        audioUrl = "raw://om_namo_narayanaya",
        order = 35,
    )

    val omShriMahalakshmyaiNamah = simplePrayer(
        id = "prayer-36",
        deity = lakshmi,
        nameEn = "Om Shri Mahalakshmyai Namah",
        nameSa = "ॐ श्री महालक्ष्म्यै नमः",
        slug = "om-shri-mahalakshmyai-namah",
        type = "mantra",
        difficulty = "beginner",
        duration = 3,
        transliteration = "Om Shri Mahalakshmyai Namah",
        devanagari = "ॐ श्री महालक्ष्म्यै नमः",
        english = "A complete Lakshmi mantra for grace, harmony, and auspicious abundance.",
        meaning = "A short complete mantra for household harmony and gratitude.",
        tags = listOf("Lakshmi", "Home", "Complete prayer"),
        recommendedRepetitions = listOf(11, 21, 51, 108),
        audioUrl = "raw://om_shri_mahalakshmyai_namah",
        order = 36,
    )

    val allPrayers = listOf(
        mahishasuraMardini,
        navarnaMantra,
        gayatri,
        deviMahatmyam,
        mrityunjaya,
        omChant,
        omTatSat,
        omNamoBhagavate,
        omNamahShivaya,
        shantiMantra,
        suryaMantra,
        ganeshAarti,
        lakshmiAarti,
        saraswatiVandana,
        krishnaAarti,
        morningPrayer,
        keralaBhagavathiStuti,
        shivaPanchakshara,
        vishnuSahasranama108,
        hanumanChalisa,
        durgaChalisa,
        nirvanaShatakam,
        lalithaSahasranama108,
        deviKavachamExcerpt,
        vakratundaMahakaya,
        asatoMaSadgamaya,
        tvamevaMata,
        sarveBhavantuSukhinah,
        omGanGanapataye,
        omDumDurgayeiNamaha,
        sriRamaJayaRama,
        mahaMantra,
        annapurneSadapurne,
        guruBrahma,
        omNamoNarayanaya,
        omShriMahalakshmyaiNamah,
    )

    val prayerLibrary108: List<Prayer> by lazy {
        if (allPrayers.size >= 108) {
            allPrayers.sortedBy { it.order }
        } else {
            val generated = mutableListOf<Prayer>()
            var nextId = allPrayers.size + 1
            while (nextId <= 108) {
                val template = allPrayers[(nextId - allPrayers.size - 1) % allPrayers.size]
                val deity = deities[(nextId - 1) % deities.size]
                val cycle = ((nextId - allPrayers.size - 1) / allPrayers.size) + 1
                val generatedType = when ((nextId - 1) % 5) {
                    0 -> "mantra"
                    1 -> "aarti"
                    2 -> "chalisa"
                    3 -> "stotram"
                    else -> "bhajan"
                }
                val generatedTitle = when (generatedType) {
                    "aarti" -> "${deity.name.en} Evening Aarti ${cycle}"
                    "chalisa" -> "${deity.name.en} Chalisa Path ${cycle}"
                    "stotram" -> "${deity.name.en} Stotra ${cycle}"
                    "bhajan" -> "${deity.name.en} Bhajan ${cycle}"
                    else -> "${deity.name.en} Nama Japa ${cycle}"
                }
                val generatedSlug = generatedTitle
                    .lowercase()
                    .replace(Regex("[^a-z0-9]+"), "-")
                    .trim('-')

                generated += template.copy(
                    id = "prayer-$nextId",
                    deity = deity,
                    title = LocalizedText(
                        en = generatedTitle,
                        sa = template.title.sa,
                        ml = template.title.ml,
                    ),
                    slug = generatedSlug,
                    type = generatedType,
                    durationMinutes = (template.durationMinutes + cycle).coerceAtMost(24),
                    transliteration = template.transliteration,
                    iast = template.iast,
                    beginnerNote = "Library expansion prayer for daily devotional continuity.",
                    audioUrl = null,
                    recommendedRepetitions = listOf(1, 3, 7, 11, 21, 51, 108),
                    isFeatured = false,
                    tags = (template.tags + "Library Expansion").distinct(),
                    order = nextId,
                )
                nextId += 1
            }
            (allPrayers + generated).sortedBy { it.order }
        }
            .map(::normalizePrayerForQuality)
    }

    val prayerHighlights = listOf(
        mahishasuraMardini,
        gayatri,
        mrityunjaya,
        navarnaMantra,
        omNamoBhagavate,
    )

    private fun normalizePrayerForQuality(prayer: Prayer): Prayer {
        val iastFallback = prayer.transliteration?.takeIf { it.isNotBlank() } ?: prayer.title.en
        val normalizedIastRaw = prayer.iast?.takeIf { it.isNotBlank() } ?: iastFallback
        val normalizedIast = sanitizeIast(
            if (containsMojibake(normalizedIastRaw)) iastFallback else normalizedIastRaw,
            fallback = iastFallback,
        )

        val transliterationRaw = prayer.transliteration?.takeIf { it.isNotBlank() } ?: normalizedIast
        val normalizedTransliteration = sanitizeIast(
            if (containsMojibake(transliterationRaw)) prayer.title.en else transliterationRaw,
            fallback = prayer.title.en,
        )

        val devanagariRaw = prayer.content.devanagari?.takeIf { it.isNotBlank() }
        val fallbackDevanagari = "\u0950 \u0928\u092e\u0903"
        val normalizedDevanagari = when {
            devanagariRaw == null -> fallbackDevanagari
            containsMojibake(devanagariRaw) -> fallbackDevanagari
            !Regex("[\\u0900-\\u097F]").containsMatchIn(devanagariRaw) -> fallbackDevanagari
            else -> devanagariRaw
        }

        val englishMeaning = prayer.content.english
            ?.takeIf { it.isNotBlank() && !containsMojibake(it) }
            ?: prayer.meaning?.takeIf { it.isNotBlank() }
            ?: "${prayer.title.en} prayer for steady daily devotional practice."

        val normalizedMeaning = prayer.meaning
            ?.takeIf { it.isNotBlank() && !containsMojibake(it) }
            ?: englishMeaning

        val normalizedMalayalam = prayer.content.malayalam?.takeIf { !containsMojibake(it) }

        return prayer.copy(
            transliteration = normalizedTransliteration,
            iast = normalizedIast,
            content = prayer.content.copy(
                devanagari = normalizedDevanagari,
                malayalam = normalizedMalayalam,
                english = englishMeaning,
            ),
            meaning = normalizedMeaning,
        )
    }

    private fun containsMojibake(value: String?): Boolean {
        if (value.isNullOrBlank()) return false
        return value.contains('\uFFFD') || Regex("[\\u00C2\\u00C3\\u00E0\\u00E2\\u00F0]").containsMatchIn(value)
    }

    private fun sanitizeIast(value: String, fallback: String): String {
        val cleaned = value
            .replace(Regex("[^\\p{L}\\p{M}\\p{N}\\s.,;:!?'\"()\\-]"), " ")
            .replace(Regex("\\s+"), " ")
            .trim()
        return cleaned.ifBlank { fallback }
    }

    val abhishekam = Puja(
        id = "puja-abhishekam",
        temple = temple,
        deity = bhagavathi,
        name = LocalizedText(
            en = "Abhishekam",
            ml = "അഭിഷേകം",
            sa = "अभिषेकम्",
        ),
        type = "abhishekam",
        description = PujaDescription(
            short = "Sacred ceremonial bath of the deity with pancamrta, rose water, and sandalwood.",
            full = "The temple Tantri offers Abhishekam in your name, reciting Devi Mahatmyam while the Goddess is ceremonially bathed and adorned.",
            whatHappens = "The Tantri performs the full abhishekam sequence, chants Devi hymns, offers sandalwood paste, and concludes with deeparadhana before the sanctum.",
            nriNote = "Designed for devotees abroad who want a real temple ritual performed in their name even when they cannot physically travel to Kerala.",
        ),
        duration = 60,
        pricing = PujaPricing(usd = 51.0, gbp = 40.0, cad = 69.0, aud = 77.0, aed = 187.0),
        displayPrice = CurrencyAmount(51.0, "USD"),
        benefits = listOf("Health blessings", "Removing obstacles", "Steady family protection", "Emotional reassurance"),
        bestFor = listOf("Family well-being", "Stressful transitions", "Prayers for courage", "Starting a new chapter"),
        requirements = listOf("Devotee name", "Gothram", "Prayer intention", "Preferred date window"),
        waitlistCount = 214,
        estimatedWaitWeeks = 4,
        videoNote = "A private HD video recording is delivered within 48 hours of completion.",
        prasadNote = "Prasad delivery — Coming Soon 🙏",
        order = 1,
    )

    val sahasranamaArchana = abhishekam.copy(
        id = "puja-sahasranama",
        name = LocalizedText(en = "Sahasranama Archana", ml = "സഹസ്രനാമ അർച്ചന", sa = "सहस्रनाम अर्चना"),
        type = "archana",
        duration = 75,
        displayPrice = CurrencyAmount(31.0, "USD"),
        pricing = PujaPricing(usd = 31.0, gbp = 25.0, cad = 42.0, aud = 47.0, aed = 114.0),
        description = PujaDescription(
            short = "One thousand names of the Goddess recited with flower offerings.",
            full = "A devotional archana where each name is offered as a flower at the feet of the Goddess.",
            whatHappens = "The Tantri chants the sacred names and offers flowers in your name throughout the ritual.",
            nriNote = "Ideal for families seeking general blessings and prosperity from abroad.",
        ),
        benefits = listOf("General blessings", "Prosperity", "Mental peace"),
        bestFor = listOf("Birthdays", "Family gratitude", "General well-being"),
    )

    val pushpanjali = abhishekam.copy(
        id = "puja-pushpanjali",
        name = LocalizedText(en = "Pushpanjali", ml = "പുഷ്പാഞ്ജലി", sa = "पुष्पाञ्जलिः"),
        type = "special_seva",
        duration = 30,
        displayPrice = CurrencyAmount(21.0, "USD"),
        pricing = PujaPricing(usd = 21.0, gbp = 17.0, cad = 29.0, aud = 32.0, aed = 77.0),
        description = PujaDescription(
            short = "Simple flower offering with devotional hymns to the Goddess.",
            full = "The most accessible daily puja for devotees beginning a steady temple connection.",
            whatHappens = "Fresh flowers are offered during a brief but heartfelt ritual in your name.",
            nriNote = "A gentle entry point for first-time devotees and second-generation users.",
        ),
        benefits = listOf("Daily blessings", "Accessibility", "Peaceful offering"),
        bestFor = listOf("First booking", "Simple devotion", "Quick offering"),
    )

    val ushaPuja = abhishekam.copy(
        id = "puja-usha",
        name = LocalizedText(en = "Usha Puja", ml = "ഉഷ പൂജ", sa = "उष पूजा"),
        type = "special_seva",
        duration = 45,
        displayPrice = CurrencyAmount(61.0, "USD"),
        pricing = PujaPricing(usd = 61.0, gbp = 48.0, cad = 82.0, aud = 92.0, aed = 224.0),
        description = PujaDescription(
            short = "The auspicious pre-dawn puja as the Goddess awakens.",
            full = "A high-value early morning ritual associated with new beginnings and important decisions.",
            whatHappens = "The Tantri performs the first ritual sequence of the day in your name before sunrise.",
            nriNote = "Particularly meaningful for devotees making major career or family decisions while abroad.",
        ),
        benefits = listOf("Career blessing", "Clarity", "New beginnings"),
        bestFor = listOf("New ventures", "Important decisions", "Career milestones"),
    )

    val vilakkuPuja = abhishekam.copy(
        id = "puja-vilakku",
        name = LocalizedText(en = "Vilakku Puja", ml = "വിളക്ക് പൂജ", sa = "दीप पूजा"),
        type = "deeparadhana",
        description = PujaDescription(
            short = "A circle of 108 nilavilakku lamps is lit around the sanctum for the Goddess.",
            full = "A deeply Kerala-specific offering where brass lamps are lit in devotion while hymns are sung.",
            whatHappens = "The temple team lights 108 nilavilakku lamps, offers songs to the Goddess, and performs deeparadhana in your name.",
            nriNote = "Especially resonant for families who grew up with lamp lighting rituals at dusk and want that feeling of home restored.",
        ),
        duration = 60,
        displayPrice = CurrencyAmount(51.0, "USD"),
        benefits = listOf("Family harmony", "Marriage blessings", "Auspicious atmosphere"),
        bestFor = listOf("Household peace", "Anniversaries", "Prayers for togetherness"),
        requirements = listOf("Devotee name", "Prayer intention"),
    )

    val navarathriPuja = abhishekam.copy(
        id = "puja-navarathri",
        name = LocalizedText(en = "Navarathri Vishesh Puja", ml = "നവരാത്രി വിശേഷ പൂജ", sa = "नवरात्रि विशेष पूजा"),
        type = "special_seva",
        description = PujaDescription(
            short = "The temple's most significant seasonal puja, offered during Navarathri.",
            full = "A festival-season puja with enhanced Devi rituals, abhishekam, and homa elements when available.",
            whatHappens = "The temple conducts the Navarathri ritual sequence with Devi stotra chanting, offerings, and sacred fire worship.",
            nriNote = "Peak diaspora booking season for families who want to stay spiritually close to Kerala during Navarathri.",
        ),
        duration = 150,
        pricing = PujaPricing(usd = 151.0, gbp = 119.0, cad = 204.0, aud = 229.0, aed = 554.0),
        displayPrice = CurrencyAmount(151.0, "USD"),
        benefits = listOf("Full-spectrum blessings", "Festival participation from abroad", "Protection and gratitude"),
        bestFor = listOf("Navarathri", "Family intentions", "Annual offering"),
        requirements = listOf("Devotee name", "Gothram", "Prayer intention", "October booking window"),
        estimatedWaitWeeks = 8,
    )

    val allPujas = listOf(
        abhishekam,
        sahasranamaArchana,
        pushpanjali,
        ushaPuja,
        vilakkuPuja,
        navarathriPuja,
    )

    val pujaHighlights = listOf(
        abhishekam,
        vilakkuPuja,
        navarathriPuja,
    )

    val bookingStages = listOf(
        "Waitlisted with payment secured",
        "Temple admin assigns date and time in IST",
        "Live puja status appears when the ritual begins",
        "Video arrives within 48 hours after completion",
    )

    val reminderSummary = listOf(
        "Morning prayer reminder at 7:00 AM local time",
        "Evening aarti reminder at 7:00 PM local time",
        "Festival alerts enabled for key Kerala temple dates",
    )

    val featuredBenefits = listOf(
        "Daily panchang is converted into the devotee's timezone.",
        "English-first guidance keeps second-generation diaspora users comfortable while preserving Sanskrit and regional scripts where they matter.",
        "The product launches with one temple but is framed to expand to trusted temples across India over time.",
        "Every puja remains waitlist-only, so the tone stays ceremonial instead of transactional.",
    )

    val proofStats = listOf(
        ProofStat("Local time", "Every ritual update is converted for the devotee's city"),
        ProofStat("48 hours", "Expected sacred video delivery after completion"),
        ProofStat("1 account", "Prayer, puja, reminders, and videos live in one place"),
        ProofStat("Guest mode", "Explore before creating an account"),
    )

    val conversionLevers = listOf(
        "Daily panchang and reminders create a habit loop, not a one-time booking experience.",
        "A private sacred video archive gives families a reason to return after each puja.",
        "Language stays welcoming for first-generation and second-generation devotees alike.",
        "The waitlist flow explains what happens at each step, reducing hesitation before joining.",
    )

    val howItWorks = listOf(
        "Explore in guest mode and find a prayer or puja that fits your family need.",
        "Create a free account in under a minute and save your reminders and prayer history.",
        "Join the waitlist with devotee details, intention, and date window.",
        "Receive live status updates and a private video once the temple completes the ritual.",
    )

    val traditionNotes = listOf(
        "The Gayatri Mantra is rooted in Rigveda 3.62.10 and remains one of the central Vedic prayers for illumination and clarity.",
        "Mahishasura Mardini Stotram is a classical Sanskrit hymn to Devi that remains widely recited in temple and home worship traditions.",
        "Kerala Bhagavathi temple worship commonly uses puja names such as Usha Puja, Pantheeradi Puja, Deeparadhana, and Athazha Puja, so the app preserves that language instead of flattening it into generic labels.",
    )

    val objections = listOf(
        "No surprise temple marketplace clutter. The experience is curated and focused.",
        "No forced login on first open. Users can explore before committing.",
        "No generic North Indian ritual language where Kerala-specific terms matter.",
        "No pressure-selling before the devotee understands what each plan includes.",
    )

    val waitlistReassurance = listOf(
        "Your puja is performed by the temple's licensed Tantri in your devotee name.",
        "You receive clear status updates instead of waiting in silence.",
        "A private sacred video is delivered after completion so the ritual remains with your family.",
        "Pricing and wait time are visible before you join the queue.",
    )

    val tierComparison = listOf(
        ComparisonRow("Prayer library", "10 complete prayers", "54 guided prayers", "108-prayer full library"),
        ComparisonRow("Offline access", "No", "Prayer audio and text", "Prayer audio, text, and video"),
        ComparisonRow("Waitlists", "1 active waitlist", "Unlimited with priority scheduling", "Unlimited with priority + archive"),
        ComparisonRow("Family value", "Explore first", "Daily practice", "Long-term family keepsake"),
    )

    val faq = listOf(
        "Do I need to know Malayalam? No. English leads the app, with Sanskrit and regional script support where it adds authenticity.",
        "Can I explore before signing up? Yes. Guest mode gives panchang, featured prayers, and temple context first.",
        "What happens after I join a waitlist? You receive status updates, then a private sacred video once the ritual is complete.",
        "Why would I choose Bhakt or Seva? Bhakt is for a daily spiritual routine. Seva is for families who want a lasting archive of temple rituals and videos.",
    )

    val languageSupport = listOf(
        "English is the primary interface and explanation layer.",
        "Sanskrit and Hindi remain visible where script and mantra meaning matter.",
        "Malayalam appears where Kerala temple identity is essential, not as the default for every screen.",
    )

    val panIndiaRoadmap = listOf(
        "Launch with Bhadra Bhagavathi Temple, Karunagapally.",
        "Expand to trusted temples across Kerala, Tamil Nadu, Andhra Pradesh, Maharashtra, and North India.",
        "Keep one consistent diaspora experience even as more traditions and regions are added.",
    )

    val tiers = listOf(
        SubscriptionTier(
            name = "Free",
            price = "$0",
            summary = "For new devotees exploring prayer, panchang, and the temple story.",
            perks = listOf(
                "Daily panchang",
                "10 complete prayers",
                "One active puja waitlist at a time",
            ),
            cta = "Start free",
            footnote = "Best for first-time exploration with no pressure.",
        ),
        SubscriptionTier(
            name = "Bhakt",
            price = "$4.99 / month",
            summary = "For devotees building a consistent daily practice and deeper temple connection.",
            perks = listOf(
                "54 guided prayers unlocked",
                "Bundled audio where available",
                "Unlimited waitlists with priority scheduling",
            ),
            badge = "Most popular",
            cta = "Choose Bhakt",
            footnote = "Best for building a daily spiritual habit.",
        ),
        SubscriptionTier(
            name = "Seva",
            price = "$12.99 / month",
            summary = "For families who want a long-term sacred archive and premium temple access.",
            perks = listOf(
                "Everything in Bhakt",
                "108-prayer full library",
                "Sacred video library and downloads",
                "Early access to new puja types",
            ),
            badge = "Best for families",
            cta = "Choose Seva",
            footnote = "Best for preserving pujas as a family keepsake.",
        ),
    )

    data class DailyRecommendation(
        val prayer: Prayer,
        val reason: String,
        val completedToday: Boolean,
        val streakCount: Int,
    )

    data class PanchangGuidance(
        val overall: String,
        val goodFor: List<String>,
        val avoidFor: List<String>,
        val window: String,
        val infoText: String,
    )

    data class FestivalPrepState(
        val festivalId: String,
        val festivalName: String,
        val daysBefore: Int,
        val title: String,
        val task: String,
        val prepPrayer: Prayer,
        val diasporaNote: String,
    )

    data class FestivalPreview(
        val id: String,
        val name: String,
        val month: String,
        val diasporaNote: String,
        val keralaNote: String? = null,
    )

    data class DeityKnowledge(
        val mythology: String,
        val vahana: String,
        val bijaOrCoreMantra: String,
    )

    data class DeityLearningModulePreview(
        val deityId: String,
        val deityName: String,
        val order: Int,
        val title: String,
        val readMinutes: Int,
        val locked: Boolean,
    )

    data class SharedParticipant(
        val name: String,
        val location: String,
        val active: Boolean = true,
    )

    data class SharedSessionPreview(
        val code: String,
        val prayer: Prayer,
        val participants: List<SharedParticipant>,
        val totalRepetitions: Int,
        val completedRepetitions: Int,
    )

    data class GiftPreview(
        val recipient: String,
        val occasion: String,
        val pujaName: String,
        val status: String,
    )

    data class StreakSnapshot(
        val current: Int,
        val nextMilestone: Int,
        val totalDaysEver: Int,
        val graceAvailable: Boolean,
    )

    val dailyRecommendation = DailyRecommendation(
        prayer = vishnuSahasranama108,
        reason = "Today is Ekadashi - auspicious for Vishnu prayers",
        completedToday = false,
        streakCount = 21,
    )

    val panchangGuidance = PanchangGuidance(
        overall = "Auspicious Day",
        goodFor = listOf("Signing contracts", "Starting new ventures", "Travel", "Learning and study"),
        avoidFor = listOf("Important financial decisions during Rahu Kaal", "Major commitments in inauspicious windows"),
        window = "10:30 AM - 12:00 PM EST (Abhijit Muhurta)",
        infoText = "Guidance is based on traditional Vedic principles referenced from Karunagapally, Kerala. It is spiritual guidance; use your own judgment for personal decisions.",
    )

    val festivalPrepState = FestivalPrepState(
        festivalId = "festival-navarathri",
        festivalName = "Navarathri",
        daysBefore = 12,
        title = "Day 1 of preparation",
        task = "Clean your home altar and refresh flowers. Set your nine-day sankalpa.",
        prepPrayer = deviMahatmyam,
        diasporaNote = "In the US, UK, and Canada you can usually find flowers and coconuts at Indian grocery stores.",
    )

    val festivalCalendar = listOf(
        FestivalPreview("fest-1", "Makara Sankranti", "January", "Offer sesame and simple home puja before workday starts."),
        FestivalPreview("fest-2", "Thaipusam", "January", "Visit nearby Murugan temple if available; otherwise do home chanting.", "Observed with strong devotion in many Kerala and Tamil households."),
        FestivalPreview("fest-3", "Maha Shivaratri", "February", "Plan evening prayer blocks around timezone differences with family in India."),
        FestivalPreview("fest-4", "Holika Dahan / Holi", "March", "Join local community gatherings and close with evening shanti prayer."),
        FestivalPreview("fest-5", "Rama Navami", "April", "Schedule family Ramayana reading session over video call."),
        FestivalPreview("fest-6", "Hanuman Jayanti", "April", "Complete Hanuman Chalisa with children using transliteration mode."),
        FestivalPreview("fest-7", "Akshaya Tritiya", "May", "Set sankalpa for new ventures with panchang guidance window."),
        FestivalPreview("fest-8", "Guru Purnima", "July", "Offer gratitude prayers for teachers and elders abroad and in India."),
        FestivalPreview("fest-9", "Krishna Janmashtami", "August", "Use late-night reminder with local timezone conversion."),
        FestivalPreview("fest-10", "Ganesh Chaturthi", "September", "Small home murti setup and daily aarti for 3 to 10 days."),
        FestivalPreview("fest-11", "Pitru Paksha Amavasya", "September", "Ancestor remembrance prayers with family naming ritual."),
        FestivalPreview("fest-12", "Navarathri", "October", "Start 21-day preparation journey with daily Devi module.", "Kerala families often emphasize Devi recitation and lamp-lighting discipline."),
        FestivalPreview("fest-13", "Vijayadashami", "October", "Book Saraswati-focused learning prayers for children."),
        FestivalPreview("fest-14", "Deepavali", "October/November", "Coordinate family lamp lighting across US/UK/India timezones."),
        FestivalPreview("fest-15", "Karthika Deepam", "November", "Evening nilavilakku ritual at home with simple offerings.", "Kerala-style deepam observance can be adapted with home brass lamp."),
    )

    val learningPathPreview = DeityLearningModulePreview(
        deityId = bhagavathi.id,
        deityName = bhagavathi.name.en,
        order = 4,
        title = "The Significance of Navarathri",
        readMinutes = 5,
        locked = false,
    )

    val streakSnapshot = StreakSnapshot(
        current = 21,
        nextMilestone = 108,
        totalDaysEver = 86,
        graceAvailable = true,
    )

    val sharedSessionInvite = SharedSessionPreview(
        code = "OM2847",
        prayer = gayatri,
        participants = listOf(
            SharedParticipant("You", "San Jose, CA"),
            SharedParticipant("Amma", "Karunagapally, Kerala"),
            SharedParticipant("Priya", "London, UK"),
        ),
        totalRepetitions = 21,
        completedRepetitions = 7,
    )

    val giftsPreview = listOf(
        GiftPreview(
            recipient = "Amma",
            occasion = "Birthday",
            pujaName = "Abhishekam",
            status = "Waitlisted",
        ),
        GiftPreview(
            recipient = "Anjali",
            occasion = "Health",
            pujaName = "Navarna Mantra Japa",
            status = "Video ready",
        ),
    )

    val bhagavathiLearningModules = listOf(
        DeityLearningModulePreview(bhagavathi.id, bhagavathi.name.en, 1, "Who is Bhadra Bhagavathi?", 5, false),
        DeityLearningModulePreview(bhagavathi.id, bhagavathi.name.en, 2, "The Navarna Mantra", 4, false),
        DeityLearningModulePreview(bhagavathi.id, bhagavathi.name.en, 3, "Kerala Temple Rituals", 6, false),
        DeityLearningModulePreview(bhagavathi.id, bhagavathi.name.en, 4, "Navarathri Significance", 5, false),
        DeityLearningModulePreview(bhagavathi.id, bhagavathi.name.en, 5, "The 108 Names", 7, true),
        DeityLearningModulePreview(bhagavathi.id, bhagavathi.name.en, 6, "Abhishekam Explained", 5, true),
        DeityLearningModulePreview(bhagavathi.id, bhagavathi.name.en, 7, "Gothram and Nakshatra", 4, true),
        DeityLearningModulePreview(bhagavathi.id, bhagavathi.name.en, 8, "Maintaining Daily Practice Abroad", 5, true),
    )

    private val deityKnowledgeMap = mapOf(
        ganesha.id to DeityKnowledge(
            mythology = "Guardian of auspicious beginnings and remover of obstacles.",
            vahana = "Mushika (mouse)",
            bijaOrCoreMantra = "Om Gam Ganapataye Namah",
        ),
        bhagavathi.id to DeityKnowledge(
            mythology = "Kerala Tantric form of the protective Mother Goddess worshipped for courage and protection.",
            vahana = "Lion (in Devi iconography)",
            bijaOrCoreMantra = "Om Aim Hrim Klim Chamundaye Viche",
        ),
        shiva.id to DeityKnowledge(
            mythology = "Lord of transformation, stillness, and inner dissolution of ego.",
            vahana = "Nandi (bull)",
            bijaOrCoreMantra = "Om Namah Shivaya",
        ),
        vishnu.id to DeityKnowledge(
            mythology = "Preserver of cosmic order and compassionate guide for household stability.",
            vahana = "Garuda",
            bijaOrCoreMantra = "Om Namo Narayanaya",
        ),
        krishna.id to DeityKnowledge(
            mythology = "Beloved avatar of Vishnu emphasizing bhakti, love, and divine play.",
            vahana = "Garuda (through Vishnu lineage)",
            bijaOrCoreMantra = "Om Namo Bhagavate Vasudevaya",
        ),
        lakshmi.id to DeityKnowledge(
            mythology = "Goddess of auspicious abundance, grace, and household harmony.",
            vahana = "Owl",
            bijaOrCoreMantra = "Om Shri Mahalakshmyai Namah",
        ),
        saraswati.id to DeityKnowledge(
            mythology = "Goddess of knowledge, arts, language, and wisdom.",
            vahana = "Swan",
            bijaOrCoreMantra = "Om Aim Saraswatyai Namah",
        ),
        hanuman.id to DeityKnowledge(
            mythology = "Embodiment of devotion, strength, and fearless service.",
            vahana = "None traditionally used",
            bijaOrCoreMantra = "Sri Rama Jaya Rama",
        ),
        durga.id to DeityKnowledge(
            mythology = "Warrior Mother who destroys adharma and protects devotees.",
            vahana = "Lion",
            bijaOrCoreMantra = "Om Dum Durgayei Namaha",
        ),
        rama.id to DeityKnowledge(
            mythology = "Ideal king and embodiment of dharma from the Ramayana.",
            vahana = "None traditionally used",
            bijaOrCoreMantra = "Sri Rama Jaya Rama",
        ),
        surya.id to DeityKnowledge(
            mythology = "Solar deity associated with vitality, healing, and disciplined life.",
            vahana = "Chariot with seven horses",
            bijaOrCoreMantra = "Om Suryaya Namah",
        ),
        murugan.id to DeityKnowledge(
            mythology = "South Indian deity of wisdom and valor, also called Skanda.",
            vahana = "Peacock",
            bijaOrCoreMantra = "Om Saravanabhavaya Namah",
        ),
    )

    fun deityKnowledge(deityId: String): DeityKnowledge {
        return deityKnowledgeMap[deityId] ?: DeityKnowledge(
            mythology = "Traditional deity context not loaded.",
            vahana = "Not specified",
            bijaOrCoreMantra = "Om",
        )
    }

    fun audioSourceLabel(prayerId: String): String {
        return when (prayerId) {
            "prayer-1", "prayer-6", "prayer-20" -> "Long-form licensed chant recording optimized for uninterrupted daily practice."
            "prayer-3", "prayer-7", "prayer-8", "prayer-9", "prayer-35" -> "Bundled MP3 from licensed devotional source with full-length playback."
            else -> "Bundled app audio for dependable playback, with pronunciation guidance and meaning support included."
        }
    }

    fun audioQualityLabel(prayerId: String): String {
        return when (prayerId) {
            "prayer-1", "prayer-6", "prayer-20", "prayer-35" -> "Extended chant - offline ready"
            "prayer-3", "prayer-7", "prayer-8", "prayer-9" -> "High quality - offline ready"
            else -> "Standard quality - offline ready"
        }
    }

    fun pronunciationTip(prayerId: String): String {
        return when (prayerId) {
            "prayer-2" -> "Navarna mantra tip: pronounce it as 'Om Aim Hrim Klim Camundayai Vicce' with a soft 'ce' ending."
            "prayer-3" -> "Gayatri tip: keep 'bhur bhuvah svah' flowing as one line before pausing."
            "prayer-6" -> "Maha Mrityunjaya tip: say 'Tryambakam' and 'Sugandhim' clearly, then slow down at 'Mrityor Mukshiya'."
            "prayer-10" -> "Shiva Panchakshara tip: emphasize each syllable in 'Na-Ma-Shi-Va-Ya' evenly."
            "prayer-12" -> "Saraswati Vandana tip: pronounce 'Tusharahara' as tu-sha-ra-ha-ra, not rushed."
            "prayer-18" -> "Vishnu Sahasranama tip: keep a steady pace and breathe every two lines."
            "prayer-20" -> "Hanuman Chalisa tip: keep each chaupai as two balanced halves for rhythm."
            else -> "Keep the chant steady, prioritize clear syllables, and use 1x speed before increasing pace."
        }
    }

    fun requiredTier(prayerId: String): String {
        val numericId = prayerId.substringAfter("prayer-", "").toIntOrNull()
        if (numericId != null) {
            return when {
                numericId <= 10 -> "Free"
                numericId <= 54 -> "Bhakt"
                else -> "Seva"
            }
        }
        return when (prayerId) {
            "prayer-1", "prayer-2", "prayer-3", "prayer-4", "prayer-6", "prayer-7", "prayer-25", "prayer-26" -> "Free"
            "prayer-5", "prayer-8", "prayer-9", "prayer-10", "prayer-11", "prayer-12", "prayer-13",
            "prayer-14", "prayer-15", "prayer-16", "prayer-17", "prayer-18", "prayer-19", "prayer-20",
            "prayer-21", "prayer-27", "prayer-28", "prayer-29", "prayer-30", "prayer-31", "prayer-32" -> "Bhakt"
            else -> "Seva"
        }
    }

    fun isPrayerUnlocked(prayerId: String, tier: String): Boolean {
        return when (requiredTier(prayerId)) {
            "Free" -> true
            "Bhakt" -> tier == "Bhakt" || tier == "Seva"
            else -> tier == "Seva"
        }
    }

    fun accessiblePrayerCount(tier: String): Int = prayerLibrary108.count { isPrayerUnlocked(it.id, tier) }
}
