import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { Deity } from "../models/Deity.js";
import { DeityLearningPath } from "../models/DeityLearningPath.js";
import { Festival } from "../models/Festival.js";
import { Prayer } from "../models/Prayer.js";
import { PrayerSession } from "../models/PrayerSession.js";
import { Puja } from "../models/Puja.js";
import { Temple } from "../models/Temple.js";
import { User } from "../models/User.js";
import { UserProgress } from "../models/UserProgress.js";
import { Panchang } from "../models/Panchang.js";
import { PujaBooking } from "../models/PujaBooking.js";

function priceVariants(usd) {
  return {
    usd,
    gbp: Number((usd * 0.79).toFixed(2)),
    cad: Number((usd * 1.35).toFixed(2)),
    aud: Number((usd * 1.52).toFixed(2)),
    aed: Number((usd * 3.67).toFixed(2))
  };
}

function prayer(titleEn, slug, deity, overrides = {}) {
  return {
    deity,
    title: {
      en: titleEn,
      ml: overrides.titleMl || titleEn,
      sa: overrides.titleSa || titleEn
    },
    slug,
    type: overrides.type || "prayer",
    difficulty: overrides.difficulty || "beginner",
    durationMinutes: overrides.durationMinutes || 5,
    transliteration: overrides.transliteration,
    content: {
      devanagari: overrides.devanagari,
      malayalam: overrides.malayalam,
      english: overrides.english
    },
    iast: overrides.iast,
    beginnerNote: overrides.beginnerNote,
    meaning: overrides.meaning,
    audioUrl: overrides.audioUrl || null,
    recommendedRepetitions: overrides.recommendedRepetitions || [1, 3, 11, 21, 108],
    isPremium: overrides.isPremium || false,
    isFeatured: overrides.isFeatured || false,
    tags: overrides.tags || [],
    order: overrides.order || 0
  };
}

function puja(nameEn, nameMl, type, usd, deity, temple, order, overrides = {}) {
  return {
    temple,
    deity,
    name: {
      en: nameEn,
      ml: nameMl,
      sa: overrides.nameSa || nameEn
    },
    type,
    description: {
      short: overrides.short,
      full: overrides.full,
      whatHappens: overrides.whatHappens,
      nriNote: overrides.nriNote
    },
    duration: overrides.duration,
    pricing: priceVariants(usd),
    benefits: overrides.benefits,
    bestFor: overrides.bestFor,
    requirements: overrides.requirements,
    isWaitlistOnly: true,
    estimatedWaitWeeks: overrides.estimatedWaitWeeks || 4,
    videoDelivered: true,
    videoNote: overrides.videoNote,
    prasadAvailable: false,
    prasadNote: "Prasad delivery - Coming Soon 🙏",
    order,
    isActive: true
  };
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);

  await Promise.all([
    User.deleteMany({}),
    Deity.deleteMany({}),
    Prayer.deleteMany({}),
    Festival.deleteMany({}),
    Temple.deleteMany({}),
    Puja.deleteMany({}),
    DeityLearningPath.deleteMany({}),
    PrayerSession.deleteMany({}),
    UserProgress.deleteMany({}),
    Panchang.deleteMany({}),
    PujaBooking.deleteMany({})
  ]);

  const deities = await Deity.insertMany([
    {
      slug: "ganesha",
      name: { en: "Ganesha", ml: "ഗണേശൻ", sa: "गणेश" },
      shortDescription: "The remover of obstacles and the first deity invoked in Hindu worship.",
      fullDescription: "Lord Ganesha is always invoked first, offering clarity, auspicious beginnings, and grounded wisdom before every sacred act.",
      pronunciationGuide: "Guh-NAY-sha",
      tradition: "Smarta",
      isFeatured: true,
      order: 1
    },
    {
      slug: "bhadra-bhagavathi",
      name: { en: "Bhadra Bhagavathi", ml: "ഭദ്ര ഭഗവതി", sa: "भद्र भगवती" },
      shortDescription: "A fierce, protective Kerala Tantric form of Devi worshipped as divine mother and guardian.",
      fullDescription: "Bhadra Bhagavathi is worshipped in Kerala's Tantric tradition as the fierce and compassionate mother who protects devotees, grants courage, and receives vows offered with sincerity.",
      pronunciationGuide: "BHUD-ra Bha-ga-va-thee",
      tradition: "Shakta",
      isFeatured: true,
      order: 2
    },
    {
      slug: "shiva",
      name: { en: "Shiva", ml: "ശിവൻ", sa: "शिव" },
      shortDescription: "The still center of transformation, tapas, and liberation.",
      fullDescription: "Lord Shiva is worshipped as the ascetic, the dancer, and the compassionate destroyer of ignorance.",
      pronunciationGuide: "SHEE-va",
      tradition: "Shaiva",
      order: 3
    },
    {
      slug: "lakshmi",
      name: { en: "Lakshmi", ml: "ലക്ഷ്മി", sa: "लक्ष्मी" },
      shortDescription: "The goddess of abundance, beauty, grace, and auspicious prosperity.",
      fullDescription: "Goddess Lakshmi embodies gentle prosperity, harmony in the home, and well-being in material and spiritual life.",
      pronunciationGuide: "LUKSH-mee",
      tradition: "Vaishnava",
      order: 4
    },
    {
      slug: "saraswati",
      name: { en: "Saraswati", ml: "സരസ്വതി", sa: "सरस्वती" },
      shortDescription: "The goddess of learning, speech, music, and clear thought.",
      fullDescription: "Goddess Saraswati blesses study, memory, music, and refined expression, especially for children growing up away from India.",
      pronunciationGuide: "Suh-russ-wa-thee",
      tradition: "Smarta",
      order: 5
    },
    {
      slug: "krishna",
      name: { en: "Krishna", ml: "കൃഷ്ണൻ", sa: "कृष्ण" },
      shortDescription: "The beloved deity of compassion, joy, and intimate devotion.",
      fullDescription: "Lord Krishna is adored for divine playfulness, loving guidance, and the path of bhakti rooted in remembrance.",
      pronunciationGuide: "KRISH-na",
      tradition: "Vaishnava",
      order: 6
    },
    {
      slug: "hanuman",
      name: { en: "Hanuman", ml: "ഹനുമാൻ", sa: "हनुमान" },
      shortDescription: "The embodiment of strength, humility, courage, and unwavering devotion.",
      fullDescription: "Lord Hanuman is invoked for protection, disciplined effort, fearless service, and steadiness in times of strain.",
      pronunciationGuide: "HUH-noo-maan",
      tradition: "Bhakti",
      order: 7
    }
  ]);

  const bySlug = Object.fromEntries(deities.map((item) => [item.slug, item]));

  const bhagavathiTemple = await Temple.create({
    name: {
      en: "Bhadra Bhagavathi Temple, Karunagapally",
      ml: "ഭദ്ര ഭഗവതി ക്ഷേത്രം, കരുനാഗപ്പള്ളി",
      sa: "भद्र भगवती मंदिर, करुनागपल्ली"
    },
    deity: bySlug["bhadra-bhagavathi"]._id,
    shortDescription: "A sacred Kerala Tantric temple where devotees across the diaspora offer prayers to Goddess Bhadra Bhagavathi.",
    fullDescription: "Bhadra Bhagavathi Temple in Karunagapally is a spiritual anchor for Kerala families living abroad. Through Divya, devotees in New York, London, Toronto, Dubai, and Sydney can remain connected to the temple's daily rhythm, pujas, and blessings.",
    significance: "Bhadra Bhagavathi is revered as the fierce and protective mother who removes fear, shields devotees from negativity, and receives vows offered with faith.",
    heroImage: null,
    images: [],
    timings: {
      pujas: [
        { name: "Usha Puja", nameML: "ഉഷ പൂജ", timeIST: "4:30 AM - 5:30 AM IST", description: "Pre-dawn awakening ritual." },
        { name: "Ethrittu Puja", nameML: "എത്രിട്ട് പൂജ", timeIST: "7:00 AM - 9:00 AM IST", description: "Morning worship after temple opening." },
        { name: "Pantheeradi Puja", nameML: "പന്ത്രണ്ടടി പൂജ", timeIST: "12:00 PM - 1:00 PM IST", description: "Midday offering in the sanctum." },
        { name: "Athazha Puja", nameML: "അത്താഴ പൂജ", timeIST: "5:30 PM - 7:00 PM IST", description: "Evening puja with lamp offerings." },
        { name: "Athazha Sheeveli", nameML: "അത്താഴ ശ്രീ വേലി", timeIST: "7:30 PM - 8:30 PM IST", description: "Night sheeveli around the temple precincts." }
      ]
    },
    nriNote: "Pujas are performed by the temple's licensed Tantri at the sacred Bhadra Bhagavathi Temple in Karunagapally, Kerala. Our team coordinates directly with the temple to schedule your puja, perform the ritual in your name, and deliver a full HD video recording within 48 hours of completion."
  });

  const prayers = await Prayer.insertMany([
    prayer("Mahishasura Mardini Stotram", "mahishasura-mardini", bySlug["bhadra-bhagavathi"]._id, {
      type: "stotram",
      difficulty: "intermediate",
      durationMinutes: 9,
      transliteration: "Ayi giri nandini nandita medini vishva vinodini nandanuthe...",
      devanagari: "अयि गिरिनन्दिनि नन्दितमेदिनि विश्वविनोदिनि नन्दिनुते...",
      malayalam: "അയി ഗിരിനന്ദിനി നന്ദിതമേദിനി വിശ്വവിനോദിനി നന്ദിനുതേ...",
      english: "O daughter of the mountain, delight of the universe, praised by all beings...",
      iast: "Ayi giri nandini nandita medini viśva vinodini nandinute",
      beginnerNote: "This is the most beloved hymn to the Goddess - listen to the audio first, then follow along with the transliteration.",
      meaning: "A triumph hymn to Devi as the destroyer of inner and outer darkness.",
      recommendedRepetitions: [1, 3, 11],
      isFeatured: true,
      tags: ["devi", "kerala"],
      order: 1
    }),
    prayer("Navarna Mantra", "navarna-mantra", bySlug["bhadra-bhagavathi"]._id, {
      type: "mantra",
      durationMinutes: 5,
      transliteration: "Om Aim Hrim Klim Chamundaye Viche",
      devanagari: "ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे",
      malayalam: "ഓം ഐം ഹ്രീം ക്ലീം ചാമുണ്ഡായൈ വിച്ചേ",
      english: "A sacred bija mantra invoking the protective and transformative power of the Goddess.",
      iast: "Om Aim Hrīm Klīm Cāmuṇḍāyai Vicce",
      meaning: "A compact mantra of protection, inner strength, and Devi consciousness.",
      recommendedRepetitions: [11, 21, 51, 108],
      tags: ["devi", "mantra"],
      order: 2
    }),
    prayer("Devi Mahatmyam Shloka", "ya-devi-sarvabhuteshu", bySlug["bhadra-bhagavathi"]._id, {
      type: "stotram",
      durationMinutes: 4,
      transliteration: "Ya devi sarvabhuteshu shaktirupena samsthita...",
      devanagari: "या देवी सर्वभूतेषु शक्तिरूपेण संस्थिता...",
      malayalam: "യാ ദേവി സർവഭൂതേഷു ശക്തിരൂപേണ സംസ്ഥിതാ...",
      english: "Salutations again and again to the Goddess who abides in all beings as power.",
      iast: "Yā Devī Sarvabhūteṣu Śaktirūpeṇa Saṃsthitā",
      tags: ["devi"],
      order: 3
    }),
    prayer("Kerala Bhagavathi Stuti", "kerala-bhagavathi-stuti", bySlug["bhadra-bhagavathi"]._id, {
      titleMl: "കേരള ഭഗവതി സ്തുതി",
      type: "prayer",
      durationMinutes: 6,
      malayalam: "അമ്മേ നാരായണ, ദേവി നാരായണ, ലക്ഷ്മി നാരായണ, ഭദ്രേ നാരായണ...",
      english: "A Malayalam devotional song invoking the Mother as Bhagavathi of Kerala homes and temples.",
      beginnerNote: "Especially welcoming for devotees who grew up hearing Malayalam at home but pray mostly in English now.",
      tags: ["devi", "kerala", "malayalam"],
      order: 4
    }),
    prayer("Lalitha Sahasranama (108 Names)", "lalitha-sahasranama-108", bySlug["bhadra-bhagavathi"]._id, {
      type: "stotram",
      difficulty: "advanced",
      durationMinutes: 18,
      english: "A daily-use 108-name recitation inspired by the Lalitha Sahasranama tradition.",
      beginnerNote: "Use this shortened daily recitation to build familiarity before full sahasranama practice.",
      isPremium: true,
      tags: ["devi"],
      order: 5
    }),
    prayer("Gayatri Mantra", "gayatri-mantra", bySlug["saraswati"]._id, {
      type: "mantra",
      durationMinutes: 3,
      audioUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Gayatri%20mantra.ogg",
      transliteration: "Om bhur bhuvah svah, tat savitur varenyam...",
      devanagari: "ॐ भूर्भुवः स्वः । तत्सवितुर्वरेण्यं...",
      english: "We meditate on the adorable brilliance of Savitr; may that radiance inspire our minds.",
      iast: "Om bhūr bhuvaḥ svaḥ, tat savitur vareṇyaṃ",
      isFeatured: true,
      order: 6
    }),
    prayer("Ganesh Aarti", "ganesh-aarti", bySlug["ganesha"]._id, {
      type: "aarti",
      durationMinutes: 5,
      english: "Aarti honoring Ganesha, the remover of obstacles and guardian of auspicious beginnings.",
      tags: ["ganesha"],
      order: 7
    }),
    prayer("Hanuman Chalisa", "hanuman-chalisa", bySlug["hanuman"]._id, {
      type: "chalisa",
      difficulty: "intermediate",
      durationMinutes: 12,
      english: "A devotional 40-verse hymn praising Hanuman's strength, humility, and service.",
      isPremium: true,
      order: 8
    }),
    prayer("Maha Mrityunjaya Mantra", "maha-mrityunjaya", bySlug["shiva"]._id, {
      type: "mantra",
      durationMinutes: 4,
      audioUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Mrityunjaya.ogg",
      transliteration: "Om tryambakam yajamahe sugandhim pushtivardhanam...",
      devanagari: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्...",
      english: "We worship the three-eyed Lord, fragrant and nourishing, who liberates us from bondage.",
      iast: "Om Tryambakaṃ Yajāmahe Sugandhiṃ Puṣṭivardhanam",
      order: 9
    }),
    prayer("Lakshmi Aarti", "lakshmi-aarti", bySlug["lakshmi"]._id, {
      type: "aarti",
      durationMinutes: 5,
      english: "Evening lamp prayer to invite harmony, gratitude, and auspicious abundance into the home.",
      order: 10
    }),
    prayer("Saraswati Vandana", "saraswati-vandana", bySlug["saraswati"]._id, {
      type: "vandana",
      durationMinutes: 4,
      english: "A prayer for clarity of speech, study, and artistic grace.",
      order: 11
    }),
    prayer("Shiva Panchakshara", "shiva-panchakshara", bySlug["shiva"]._id, {
      type: "mantra",
      durationMinutes: 4,
      transliteration: "Om Namah Shivaya",
      devanagari: "ॐ नमः शिवाय",
      english: "The five-syllable mantra of surrender to Lord Shiva.",
      iast: "Om Namaḥ Śivāya",
      order: 12
    }),
    prayer("Om Namah Shivaya", "om-namah-shivaya", bySlug["shiva"]._id, {
      type: "mantra",
      durationMinutes: 3,
      english: "A simple and steady japa for inner stillness and purification.",
      order: 13
    }),
    prayer("Durga Chalisa", "durga-chalisa", bySlug["bhadra-bhagavathi"]._id, {
      type: "chalisa",
      difficulty: "intermediate",
      durationMinutes: 10,
      english: "A devotional hymn invoking Mother Durga's protection and courage.",
      tags: ["devi"],
      order: 14
    }),
    prayer("Krishna Aarti", "krishna-aarti", bySlug["krishna"]._id, {
      type: "aarti",
      durationMinutes: 5,
      english: "Aarti in praise of Krishna's sweetness, compassion, and playful presence.",
      order: 15
    }),
    prayer("Surya Mantra", "surya-mantra", bySlug["saraswati"]._id, {
      type: "mantra",
      durationMinutes: 3,
      english: "A morning mantra to greet light, vitality, and disciplined effort.",
      order: 16
    }),
    prayer("Shanti Mantra", "shanti-mantra", bySlug["saraswati"]._id, {
      type: "mantra",
      durationMinutes: 3,
      transliteration: "Om sarve bhavantu sukhinah...",
      devanagari: "ॐ सर्वे भवन्तु सुखिनः...",
      english: "May all beings be happy; may all be free from suffering.",
      order: 17
    }),
    prayer("Vishnu Sahasranama (108 Names)", "vishnu-sahasranama-108", bySlug["krishna"]._id, {
      type: "stotram",
      difficulty: "advanced",
      durationMinutes: 18,
      english: "A focused daily 108-name offering from the Vishnu Sahasranama tradition.",
      isPremium: true,
      order: 18
    }),
    prayer("Morning Prayer (Pratah Smaranam)", "pratah-smaranam", bySlug["ganesha"]._id, {
      type: "prayer",
      durationMinutes: 4,
      english: "A gentle way to begin the day with remembrance, gratitude, and clarity.",
      order: 19
    }),
    prayer("Nirvana Shatakam", "nirvana-shatakam", bySlug["shiva"]._id, {
      type: "stotram",
      difficulty: "advanced",
      durationMinutes: 8,
      english: "Adi Shankaracharya's meditation on the Self beyond body, mind, and identity.",
      isPremium: true,
      order: 20
    })
  ]);

  const prayerBySlug = Object.fromEntries(prayers.map((item) => [item.slug, item]));

  await Festival.insertMany([
    {
      slug: "navarathri",
      name: { en: "Navarathri", ml: "നവരാത്രി", sa: "नवरात्रि" },
      description: "Nine sacred nights of Devi worship, prayer, and renewal.",
      significance: "Navarathri is the most important annual festival season for Devi devotees, with heightened puja demand and extended recitation traditions.",
      keralaNote: "In Kerala homes, lamps, books, and instruments are especially honored during the final days of Navarathri.",
      monthHint: "October",
      featuredPrayer: prayerBySlug["mahishasura-mardini"]._id,
      deity: bySlug["bhadra-bhagavathi"]._id
    },
    {
      slug: "vijayadashami",
      name: { en: "Vijayadashami", ml: "വിജയദശമി", sa: "विजयदशमी" },
      description: "A day of victory, fresh beginnings, and learning.",
      significance: "Families begin studies, music lessons, and sacred disciplines on this auspicious day.",
      keralaNote: "Vidyarambham is especially meaningful for diaspora families introducing children to Indian languages and prayers.",
      monthHint: "October",
      featuredPrayer: prayerBySlug["saraswati-vandana"]._id,
      deity: bySlug["saraswati"]._id
    }
  ]);

  await Festival.deleteMany({});
  await Festival.insertMany([
    {
      slug: "navarathri",
      name: { en: "Navarathri", ml: "നവരാത്രി", sa: "नवरात्रि" },
      description: "Nine sacred nights of Devi worship, prayer, and renewal.",
      significance: "Navarathri is the most important annual festival season for Devi devotees, with heightened puja demand and extended recitation traditions.",
      keralaNote: "In Kerala homes, lamps, books, and instruments are especially honored during the final days of Navarathri.",
      monthHint: "October",
      startDate: new Date("2026-10-11T00:00:00.000Z"),
      preparationDays: 21,
      prepJourney: [
        {
          daysBefore: 21,
          title: "Three weeks before Navarathri",
          content: "Set a daily prayer time and clean your home altar. Keep a dedicated lamp ready for all nine days.",
          prayers: [prayerBySlug["navarna-mantra"]._id],
          diasporaNote: "In most diaspora cities, fresh flowers and coconuts are available in Indian grocery stores."
        },
        {
          daysBefore: 14,
          title: "Two weeks before Navarathri",
          content: "Gather kumkum, turmeric, incense, and your daily prayer list.",
          prayers: [prayerBySlug["ya-devi-sarvabhuteshu"]._id],
          diasporaNote: "Use local flowers when traditional varieties are unavailable."
        },
        {
          daysBefore: 7,
          title: "One week before Navarathri",
          content: "Begin daily Devi stotram recitation and set your family sankalpa.",
          prayers: [prayerBySlug["mahishasura-mardini"]._id],
          diasporaNote: "Coordinate a daily family prayer on WhatsApp or video call if relatives are in different countries."
        },
        {
          daysBefore: 3,
          title: "Three days remaining",
          content: "Finalize offerings and prepare your prayer corner for the full nine-day observance.",
          prayers: [prayerBySlug["lalitha-sahasranama-108"]._id],
          diasporaNote: "A compact home altar is enough; consistency matters more than scale."
        },
        {
          daysBefore: 1,
          title: "Navarathri begins tomorrow",
          content: "Sleep early, prepare the first-day offering, and begin with gratitude.",
          prayers: [prayerBySlug["navarna-mantra"]._id],
          diasporaNote: "Use Om 2 reminders to stay on schedule around work and school."
        },
        {
          daysBefore: 0,
          title: "Navarathri Day 1",
          content: "Offer flowers, light the lamp, and begin Devi recitation with focus.",
          prayers: [prayerBySlug["mahishasura-mardini"]._id],
          diasporaNote: "Invite children to chant one verse each day to build continuity."
        }
      ],
      dayOfRituals: [
        { time: "Morning", ritual: "Light lamp and chant Navarna mantra", prayer: prayerBySlug["navarna-mantra"]._id, duration: 20 },
        { time: "Evening", ritual: "Devi stotram with flower offering", prayer: prayerBySlug["mahishasura-mardini"]._id, duration: 30 },
        { time: "Night", ritual: "Closing peace prayer", prayer: prayerBySlug["ya-devi-sarvabhuteshu"]._id, duration: 10 }
      ],
      communityNote: "Search for '[Your City] Navarathri temple events 2026' for local celebrations.",
      featuredPrayer: prayerBySlug["mahishasura-mardini"]._id,
      deity: bySlug["bhadra-bhagavathi"]._id
    },
    {
      slug: "vijayadashami",
      name: { en: "Vijayadashami", ml: "വിജയദശമി", sa: "विजयदशमी" },
      description: "A day of victory, fresh beginnings, and learning.",
      significance: "Families begin studies, music lessons, and sacred disciplines on this auspicious day.",
      keralaNote: "Vidyarambham is especially meaningful for diaspora families introducing children to Indian languages and prayers.",
      monthHint: "October",
      startDate: new Date("2026-10-20T00:00:00.000Z"),
      preparationDays: 3,
      prepJourney: [
        {
          daysBefore: 3,
          title: "Three days before Vijayadashami",
          content: "Set aside books or instruments for blessing and begin Saraswati prayer daily.",
          prayers: [prayerBySlug["saraswati-vandana"]._id],
          diasporaNote: "Children can place school books or laptops near the altar for symbolic blessing."
        },
        {
          daysBefore: 1,
          title: "One day before Vijayadashami",
          content: "Prepare a simple offering and involve the full family in evening prayer.",
          prayers: [prayerBySlug["gayatri-mantra"]._id],
          diasporaNote: "A short prayer is enough if weekday schedules are tight."
        },
        {
          daysBefore: 0,
          title: "Vijayadashami",
          content: "Begin learning with prayerful intention and gratitude.",
          prayers: [prayerBySlug["saraswati-vandana"]._id],
          diasporaNote: "Marking the day with even 10 minutes of prayer is meaningful."
        }
      ],
      dayOfRituals: [
        { time: "Morning", ritual: "Learning blessing prayer", prayer: prayerBySlug["saraswati-vandana"]._id, duration: 15 },
        { time: "Evening", ritual: "Family peace prayer", prayer: prayerBySlug["shanti-mantra"]._id, duration: 10 }
      ],
      communityNote: "Many diaspora temples host Vijayadashami learning ceremonies for children.",
      featuredPrayer: prayerBySlug["saraswati-vandana"]._id,
      deity: bySlug["saraswati"]._id
    },
    {
      slug: "diwali",
      name: { en: "Diwali", ml: "ദീപാവലി", sa: "दीपावली" },
      description: "Festival of lights honoring gratitude, clarity, and auspicious abundance.",
      significance: "Families pray for harmony and prosperity while lighting lamps together.",
      keralaNote: "Kerala observance differs regionally, but lamp lighting and Lakshmi prayer remain central for many families.",
      monthHint: "October/November",
      startDate: new Date("2026-11-08T00:00:00.000Z"),
      preparationDays: 14,
      prepJourney: [
        {
          daysBefore: 14,
          title: "Two weeks before Diwali",
          content: "Declutter your home prayer area and plan your family prayer evening.",
          prayers: [prayerBySlug["lakshmi-aarti"]._id],
          diasporaNote: "Simple tea lights are acceptable when traditional lamps are unavailable."
        },
        {
          daysBefore: 7,
          title: "One week before Diwali",
          content: "Prepare offerings and choose your Diwali prayers for the week.",
          prayers: [prayerBySlug["lakshmi-aarti"]._id],
          diasporaNote: "Coordinate one shared family prayer if relatives are in different countries."
        },
        {
          daysBefore: 0,
          title: "Diwali Day",
          content: "Light lamps at dusk and offer Lakshmi prayer with gratitude.",
          prayers: [prayerBySlug["lakshmi-aarti"]._id],
          diasporaNote: "A short evening prayer after work still preserves the day's spiritual intention."
        }
      ],
      dayOfRituals: [
        { time: "Evening", ritual: "Lamp lighting and Lakshmi Aarti", prayer: prayerBySlug["lakshmi-aarti"]._id, duration: 20 }
      ],
      communityNote: "Search for local Diwali celebrations and temple events in your city.",
      featuredPrayer: prayerBySlug["lakshmi-aarti"]._id,
      deity: bySlug["lakshmi"]._id
    }
  ]);

  await Puja.insertMany([
    puja("Abhishekam", "അഭിഷേകം", "abhishekam", 51, bySlug["bhadra-bhagavathi"]._id, bhagavathiTemple._id, 1, {
      duration: 60,
      short: "Sacred ceremonial bath of the deity with panchamrita, rose water, and sandalwood.",
      full: "A Kerala Tantric abhishekam in which the deity is bathed with panchamrita, fragrant waters, and sandal paste while Devi hymns are chanted.",
      whatHappens: "The Tantri will perform the ceremonial bathing, chant Devi Mahatmyam verses, and offer the puja in the devotee's name.",
      nriNote: "Ideal for devotees living abroad who want a powerful, personal offering at the temple when they cannot be physically present.",
      benefits: ["Health blessings", "Obstacle removal", "Mental steadiness", "Grace in transitions"],
      bestFor: ["Health concerns", "Family well-being", "Starting a new chapter"],
      requirements: ["Devotee name", "Gothram", "Prayer intention"],
      videoNote: "Your HD video will show the main abhishekam sequence and final deeparadhana."
    }),
    puja("Sahasranama Archana", "സഹസ്രനാമ അർച്ചന", "archana", 31, bySlug["bhadra-bhagavathi"]._id, bhagavathiTemple._id, 2, {
      duration: 75,
      short: "1,000 sacred names of the Goddess offered with flowers.",
      full: "Fresh flowers are offered at the Goddess's feet while the Tantri recites the Sahasranama with devotion and care.",
      whatHappens: "The Tantri will recite the names and make flower offerings on behalf of the devotee.",
      nriNote: "A deeply personal puja for diaspora families praying for prosperity, peace, and divine remembrance.",
      benefits: ["General blessings", "Prosperity", "Household harmony", "Devotional focus"],
      bestFor: ["Birthdays", "Anniversaries", "Family thanksgiving"],
      requirements: ["Devotee name", "Nakshatra if known"],
      videoNote: "Your video will highlight the flower offerings and concluding lamp darshan."
    }),
    puja("Kalasha Puja", "കലശ പൂജ", "kalasha_puja", 45, bySlug["bhadra-bhagavathi"]._id, bhagavathiTemple._id, 3, {
      duration: 60,
      short: "A consecrated kalasha becomes the living presence of the Goddess.",
      full: "A kalasha filled with sanctified water, mango leaves, and coconut is invoked as the temporary seat of Devi.",
      whatHappens: "The Tantri will consecrate the kalasha, invoke the Goddess, and complete the offering in your name.",
      nriNote: "Well suited to diaspora devotees marking housewarmings, relocations, and new ventures abroad.",
      benefits: ["New beginnings", "Home blessing", "Business auspiciousness", "Emotional steadiness"],
      bestFor: ["House warming", "Moving abroad", "New business"],
      requirements: ["Devotee name", "Prayer intention"],
      videoNote: "Video includes the kalasha invocation and final blessing segment."
    }),
    puja("Devi Mahatmyam Parayanam", "ദേവീ മഹാത്മ്യം പാരായണം", "special_seva", 75, bySlug["bhadra-bhagavathi"]._id, bhagavathiTemple._id, 4, {
      duration: 120,
      short: "Recitation of the Devi Mahatmyam scripture describing the Goddess's victories over evil.",
      full: "A sacred reading from the Devi Mahatmyam tradition, offered with discipline and reverence in the temple context.",
      whatHappens: "The Tantri and temple team will complete the full recitation as a dedicated seva in the devotee's name.",
      nriNote: "Especially meaningful during periods of fear, uncertainty, or when seeking Devi's protection from afar.",
      benefits: ["Protection", "Courage", "Inner resilience", "Navarathri observance"],
      bestFor: ["Overcoming fear", "Family protection", "Navarathri vows"],
      requirements: ["Devotee name", "Prayer intention", "Preferred date range"],
      videoNote: "Due to length, the video is an edited sacred keepsake capturing the main recitation moments."
    }),
    puja("Pushpanjali", "പുഷ്പാഞ്ജലി", "archana", 21, bySlug["bhadra-bhagavathi"]._id, bhagavathiTemple._id, 5, {
      duration: 30,
      short: "Simple flower offering at the feet of the Goddess.",
      full: "A gentle devotional puja using hibiscus, lotus, or jasmine depending on temple availability.",
      whatHappens: "The Tantri will offer flowers and chant a concise set of hymns in the devotee's name.",
      nriNote: "The most accessible starting puja for first-time devotees and second-generation families.",
      benefits: ["Daily blessings", "Ease of mind", "First devotional step"],
      bestFor: ["First-time devotees", "Children's prayers", "Simple gratitude"],
      requirements: ["Devotee name"],
      videoNote: "A short but intimate video of the floral offering and lamp blessing."
    }),
    puja("Usha Puja (Dawn Puja)", "ഉഷ പൂജ", "special_seva", 61, bySlug["bhadra-bhagavathi"]._id, bhagavathiTemple._id, 6, {
      duration: 45,
      short: "The pre-dawn puja performed as the Goddess awakens.",
      full: "A highly auspicious early-morning Kerala temple ritual aligned with the first sacred hours of the day.",
      whatHappens: "The Tantri will perform the dawn rites and offer your name during the first puja slot of the day.",
      nriNote: "A meaningful way for overseas devotees to align major life decisions with the temple's most auspicious hour.",
      benefits: ["Career blessings", "Decision clarity", "Fresh beginnings", "Courage"],
      bestFor: ["Important decisions", "Job changes", "New ventures"],
      requirements: ["Devotee name", "Prayer intention"],
      videoNote: "Video includes the temple's pre-dawn ambiance and the concluding darshan."
    }),
    puja("Vilakku Puja", "വിളക്ക് പൂജ", "deeparadhana", 51, bySlug["bhadra-bhagavathi"]._id, bhagavathiTemple._id, 7, {
      duration: 60,
      short: "108 Kerala brass lamps are lit around the sanctum.",
      full: "A lamp-centered Kerala offering using nilavilakku tradition, sacred song, and luminous devotional atmosphere.",
      whatHappens: "The temple lights the lamps while prayers are offered for the devotee and family.",
      nriNote: "Especially resonant for devotees missing the glow of evening lamp prayer in Kerala homes.",
      benefits: ["Marriage blessings", "Family harmony", "Light in difficult periods"],
      bestFor: ["Marriage prayers", "Family peace", "Home energy"],
      requirements: ["Devotee name", "Family names optional"],
      videoNote: "Your video focuses on the 108-lamp illumination and deeparadhana."
    }),
    puja("Navarna Mantra Japa", "നവാർണ മന്ത്ര ജപം", "special_seva", 99, bySlug["bhadra-bhagavathi"]._id, bhagavathiTemple._id, 8, {
      duration: 90,
      short: "10,000 repetitions of the Navarna mantra on behalf of the devotee.",
      full: "An intensive mantra seva using the Goddess's nine-syllable mantra in disciplined japa.",
      whatHappens: "The Tantri will complete the designated mantra count using a sacred mala for the devotee's sankalpa.",
      nriNote: "Chosen by devotees seeking strong protection and deeper spiritual grounding while living abroad.",
      benefits: ["Spiritual growth", "Protection from negativity", "Focused intention", "Inner discipline"],
      bestFor: ["Major transitions", "Protective prayer", "Sadhana support"],
      requirements: ["Devotee name", "Gothram", "Prayer intention"],
      videoNote: "Video captures the sankalpa, japa environment, and concluding offering."
    }),
    puja("Navarathri Vishesh Puja", "നവരാത്രി വിശേഷ പൂജ", "special_seva", 151, bySlug["bhadra-bhagavathi"]._id, bhagavathiTemple._id, 9, {
      duration: 150,
      short: "The most significant Devi puja during Navarathri.",
      full: "A special seasonal seva including Devi invocation, abhishekam, and fire ritual elements during Navarathri.",
      whatHappens: "The temple performs the extended Navarathri rites and offers the puja in the devotee's name during the festival period.",
      nriNote: "The highest-demand annual offering for diaspora families who want to stay spiritually present during Navarathri in Kerala.",
      benefits: ["All-round blessings", "Festival merit", "Protection", "Family grace"],
      bestFor: ["Navarathri vows", "Annual family offering", "Major prayer intentions"],
      requirements: ["Devotee name", "Prayer intention", "Flexible date range in October"],
      estimatedWaitWeeks: 10,
      videoNote: "The HD video is an edited keepsake because of the extended festival-format ritual."
    }),
    puja("Homa (Yajna)", "ഹോമം", "homa", 108, bySlug["bhadra-bhagavathi"]._id, bhagavathiTemple._id, 10, {
      duration: 90,
      short: "Sacred fire ritual with ghee, herbs, and grain offerings.",
      full: "A consecrated fire ritual in which offerings are made into Agni while Vedic mantras are recited.",
      whatHappens: "The Tantri will invoke the sacred fire and complete the homa in the devotee's name.",
      nriNote: "A major life-event puja for devotees who want the depth of a traditional temple homa without traveling to India.",
      benefits: ["Purification", "Karmic clearing", "Blessings for major events", "Focused prayer"],
      bestFor: ["Major life events", "Purification", "Family rites"],
      requirements: ["Devotee name", "Gothram", "Prayer intention"],
      videoNote: "Video captures the fire offering sequence and final blessings."
    })
  ]);

  await DeityLearningPath.insertMany([
    {
      deity: bySlug["bhadra-bhagavathi"]._id,
      completionBadge: "Scholar of Bhadra Bhagavathi",
      totalModules: 8,
      modules: [
        {
          order: 1,
          title: "Who is Bhadra Bhagavathi?",
          type: "story",
          content: "Bhadra Bhagavathi is worshipped in Kerala's Tantric temple tradition as a fierce and compassionate form of Devi. In this lineage, ritual precision, lamp worship, and mantra discipline are central. The emphasis is not spectacle; it is sanctity, continuity, and protection. For diaspora families, this form of worship creates emotional rootedness and spiritual confidence.",
          keyTakeaway: "Bhadra Bhagavathi in Kerala tradition is a distinct Tantric Devi form centered on disciplined ritual and protection.",
          linkedPrayer: prayerBySlug["mahishasura-mardini"]._id,
          readTime: 5,
          isLocked: false
        },
        {
          order: 2,
          title: "The Navarna Mantra — 9 Syllables, Infinite Power",
          type: "mantra_deep_dive",
          content: "Om Aim Hrim Klim Chamundaye Viche is recited for protection, inner strength, and focused devotion. The mantra's bija sounds are treated as spiritual seed syllables. Recitation with breath and repetition discipline builds steadiness over time.",
          keyTakeaway: "Navarna is practiced as a disciplined protective mantra, not just a chant to repeat casually.",
          linkedPrayer: prayerBySlug["navarna-mantra"]._id,
          readTime: 4,
          isLocked: false
        },
        {
          order: 3,
          title: "Kerala Temple Rituals vs North Indian Temples",
          type: "ritual_explanation",
          content: "Kerala temple worship often uses terms like Tantri, Sheeveli, and nilavilakku. Ritual sequencing, sanctum protocol, and offering styles differ from many North Indian temple patterns. Understanding this prevents cultural flattening and gives diaspora users a precise ritual vocabulary.",
          keyTakeaway: "Kerala Tantric worship has distinct ritual language and structure that should be preserved accurately.",
          linkedPrayer: prayerBySlug["kerala-bhagavathi-stuti"]._id,
          readTime: 6,
          isLocked: false
        },
        {
          order: 4,
          title: "The Significance of Navarathri in Shakta Tradition",
          type: "symbolism",
          content: "Navarathri is a nine-day spiritual progression of discipline, devotion, and inner renewal. Each day can be approached as one deliberate step toward clarity and courage.",
          keyTakeaway: "Navarathri is best practiced as a daily journey, not a one-day event.",
          linkedPrayer: prayerBySlug["ya-devi-sarvabhuteshu"]._id,
          readTime: 5,
          isLocked: true
        },
        {
          order: 5,
          title: "The 108 Names of Bhadra Bhagavathi",
          type: "mantra_deep_dive",
          content: "Name-recitation trains attention and devotion. Each name highlights one divine quality: protection, compassion, courage, or purification.",
          keyTakeaway: "Name-recitation builds devotional memory and emotional steadiness.",
          linkedPrayer: prayerBySlug["lalitha-sahasranama-108"]._id,
          readTime: 7,
          isLocked: true
        },
        {
          order: 6,
          title: "Abhishekam — What Happens During the Sacred Bath",
          type: "ritual_explanation",
          content: "Abhishekam in Kerala Tantric settings combines sacred bathing, mantra, and consecrated offering in a tightly sequenced ritual.",
          keyTakeaway: "Abhishekam is a structured temple rite where sequence and mantra alignment matter.",
          linkedPrayer: prayerBySlug["mahishasura-mardini"]._id,
          readTime: 5,
          isLocked: true
        },
        {
          order: 7,
          title: "Understanding Gothram and Nakshatra",
          type: "story",
          content: "Gothram and nakshatra identify lineage and lunar star context used in ritual sankalpa. Even if unknown, devotees can still pray sincerely.",
          keyTakeaway: "Gothram/nakshatra support ritual precision but intention remains central.",
          linkedPrayer: prayerBySlug["navarna-mantra"]._id,
          readTime: 4,
          isLocked: true
        },
        {
          order: 8,
          title: "Maintaining Daily Practice Abroad",
          type: "symbolism",
          content: "A small daily ritual, even five minutes, can preserve continuity across timezones and fast schedules. Consistency builds identity across generations.",
          keyTakeaway: "Short daily practice is more sustainable than occasional long practice.",
          linkedPrayer: prayerBySlug["pratah-smaranam"]._id,
          readTime: 5,
          isLocked: true
        }
      ]
    },
    {
      deity: bySlug["ganesha"]._id,
      completionBadge: "Student of Ganesha",
      totalModules: 5,
      modules: [
        { order: 1, title: "Why Ganesha is Invoked First", type: "story", content: "Ganesha invocation marks intentional beginnings.", keyTakeaway: "Start with Ganesha for clarity.", linkedPrayer: prayerBySlug["ganesh-aarti"]._id, readTime: 4, isLocked: false },
        { order: 2, title: "Vakratunda Symbolism", type: "symbolism", content: "The curved trunk symbolizes adaptive intelligence.", keyTakeaway: "Flexibility is spiritual strength.", linkedPrayer: prayerBySlug["ganesh-aarti"]._id, readTime: 4, isLocked: false },
        { order: 3, title: "Ganesha and Study Discipline", type: "ritual_explanation", content: "Students traditionally begin study with Ganesha remembrance.", keyTakeaway: "Ritual beginnings support focus.", linkedPrayer: prayerBySlug["gayatri-mantra"]._id, readTime: 4, isLocked: false },
        { order: 4, title: "Chaturthi Practice at Home", type: "story", content: "A simple monthly Chaturthi routine keeps continuity alive abroad.", keyTakeaway: "Small monthly rituals build identity.", linkedPrayer: prayerBySlug["ganesh-aarti"]._id, readTime: 5, isLocked: true },
        { order: 5, title: "Family Prayer with Children", type: "symbolism", content: "Short chants help second-generation children connect naturally.", keyTakeaway: "Keep rituals short and repeatable.", linkedPrayer: prayerBySlug["pratah-smaranam"]._id, readTime: 5, isLocked: true }
      ]
    },
    {
      deity: bySlug["shiva"]._id,
      completionBadge: "Seeker of Shiva",
      totalModules: 6,
      modules: [
        { order: 1, title: "Shiva as Stillness", type: "story", content: "Shiva worship emphasizes silence and surrender.", keyTakeaway: "Stillness is an active practice.", linkedPrayer: prayerBySlug["om-namah-shivaya"]._id, readTime: 4, isLocked: false },
        { order: 2, title: "Panchakshara Mantra", type: "mantra_deep_dive", content: "Om Namah Shivaya is a foundational Shaiva mantra.", keyTakeaway: "Simple mantra, deep effect.", linkedPrayer: prayerBySlug["shiva-panchakshara"]._id, readTime: 4, isLocked: false },
        { order: 3, title: "Pradosh Significance", type: "ritual_explanation", content: "Pradosh periods are considered especially suitable for Shiva prayer.", keyTakeaway: "Time windows can deepen practice.", linkedPrayer: prayerBySlug["maha-mrityunjaya"]._id, readTime: 5, isLocked: false },
        { order: 4, title: "Nirvana Shatakam Context", type: "symbolism", content: "This text points to identity beyond mind-body labels.", keyTakeaway: "Prayer can become inquiry.", linkedPrayer: prayerBySlug["nirvana-shatakam"]._id, readTime: 6, isLocked: true },
        { order: 5, title: "Mrityunjaya for Healing", type: "ritual_explanation", content: "The mantra is often used in healing and recovery prayers.", keyTakeaway: "Use with focused intention.", linkedPrayer: prayerBySlug["maha-mrityunjaya"]._id, readTime: 5, isLocked: true },
        { order: 6, title: "Diaspora Shaiva Routine", type: "story", content: "A practical weekday Shaiva prayer routine can be sustained in 10 minutes.", keyTakeaway: "Consistency beats complexity.", linkedPrayer: prayerBySlug["om-namah-shivaya"]._id, readTime: 4, isLocked: true }
      ]
    },
    {
      deity: bySlug["krishna"]._id,
      completionBadge: "Student of Vishnu Bhakti",
      totalModules: 6,
      modules: [
        { order: 1, title: "Vishnu as Preserver", type: "story", content: "Vishnu devotion emphasizes steadiness and trust.", keyTakeaway: "Steadiness is devotional power.", linkedPrayer: prayerBySlug["vishnu-sahasranama-108"]._id, readTime: 4, isLocked: false },
        { order: 2, title: "Ekadashi and Vishnu", type: "ritual_explanation", content: "Ekadashi is traditionally associated with Vishnu observance.", keyTakeaway: "Calendar-aware prayer builds rhythm.", linkedPrayer: prayerBySlug["vishnu-sahasranama-108"]._id, readTime: 4, isLocked: false },
        { order: 3, title: "Krishna Aarti Meaning", type: "symbolism", content: "Krishna aarti emphasizes loving remembrance.", keyTakeaway: "Emotion and devotion can coexist.", linkedPrayer: prayerBySlug["krishna-aarti"]._id, readTime: 4, isLocked: false },
        { order: 4, title: "Name Recitation in Bhakti", type: "mantra_deep_dive", content: "Name chanting aligns memory and affection in devotion.", keyTakeaway: "Repetition deepens relationship.", linkedPrayer: prayerBySlug["vishnu-sahasranama-108"]._id, readTime: 5, isLocked: true },
        { order: 5, title: "Family Bhakti Practice", type: "story", content: "Simple shared evening prayers keep bhakti alive across generations.", keyTakeaway: "Keep it family-friendly and regular.", linkedPrayer: prayerBySlug["krishna-aarti"]._id, readTime: 5, isLocked: true },
        { order: 6, title: "Diaspora Festival Rhythm", type: "ritual_explanation", content: "Festival prep creates recurring devotional anchors in busy lives.", keyTakeaway: "Use festival journeys as habit scaffolding.", linkedPrayer: prayerBySlug["shanti-mantra"]._id, readTime: 5, isLocked: true }
      ]
    },
    {
      deity: bySlug["lakshmi"]._id,
      completionBadge: "Lakshmi Sadhana Path",
      totalModules: 4,
      modules: [
        { order: 1, title: "Lakshmi Beyond Wealth", type: "story", content: "Lakshmi also represents harmony, grace, and gratitude.", keyTakeaway: "Prosperity includes emotional and spiritual balance.", linkedPrayer: prayerBySlug["lakshmi-aarti"]._id, readTime: 4, isLocked: false },
        { order: 2, title: "Friday Prayer Rhythm", type: "ritual_explanation", content: "Friday is often used for Devi and Lakshmi worship.", keyTakeaway: "Weekly rhythm supports consistency.", linkedPrayer: prayerBySlug["lakshmi-aarti"]._id, readTime: 4, isLocked: false },
        { order: 3, title: "Home Altar Simplicity", type: "symbolism", content: "A small clean prayer corner is enough for a strong household routine.", keyTakeaway: "Simplicity enables consistency.", linkedPrayer: prayerBySlug["shanti-mantra"]._id, readTime: 4, isLocked: true },
        { order: 4, title: "Gratitude as Practice", type: "story", content: "Daily gratitude prayers reinforce abundance mindsets grounded in dharma.", keyTakeaway: "Gratitude is devotional action.", linkedPrayer: prayerBySlug["pratah-smaranam"]._id, readTime: 4, isLocked: true }
      ]
    },
    {
      deity: bySlug["saraswati"]._id,
      completionBadge: "Saraswati Learning Circle",
      totalModules: 4,
      modules: [
        { order: 1, title: "Saraswati and Learning", type: "story", content: "Saraswati worship supports knowledge, speech, and refined expression.", keyTakeaway: "Learning can be devotional.", linkedPrayer: prayerBySlug["saraswati-vandana"]._id, readTime: 4, isLocked: false },
        { order: 2, title: "Gayatri Practice Basics", type: "mantra_deep_dive", content: "Gayatri can be used as a daily clarity mantra.", keyTakeaway: "Short daily recitation works best.", linkedPrayer: prayerBySlug["gayatri-mantra"]._id, readTime: 4, isLocked: false },
        { order: 3, title: "Vijayadashami Vidyarambham", type: "ritual_explanation", content: "The festival marks new learning cycles and fresh intention.", keyTakeaway: "Use festivals to reset learning habits.", linkedPrayer: prayerBySlug["saraswati-vandana"]._id, readTime: 4, isLocked: true },
        { order: 4, title: "Second-Generation Continuity", type: "symbolism", content: "Bilingual prayer and short routines help children sustain cultural continuity.", keyTakeaway: "Consistency beats complexity for youth learning.", linkedPrayer: prayerBySlug["shanti-mantra"]._id, readTime: 5, isLocked: true }
      ]
    }
  ]);

  const adminPassword = await bcrypt.hash("Admin@12345", 10);
  await User.create({
    name: "Divya Admin",
    email: "admin@divya.app",
    password: adminPassword,
    role: "admin",
    country: "US",
    timezone: "America/New_York",
    currency: "USD"
  });

  console.log("Seed complete");
  console.log(`Temple: ${bhagavathiTemple.name.en}`);
  console.log("Admin login: admin@divya.app / Admin@12345");
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
