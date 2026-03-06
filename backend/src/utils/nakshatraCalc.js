import { julian, moonposition } from "astronomia";

export const NAKSHATRAS = [
  { number: 1, name: "Ashwini", nameHi: "अश्विनी", deity: "Ashwini Kumaras", startDeg: 0.0 },
  { number: 2, name: "Bharani", nameHi: "भरणी", deity: "Yama", startDeg: 13.333 },
  { number: 3, name: "Krittika", nameHi: "कृत्तिका", deity: "Agni", startDeg: 26.667 },
  { number: 4, name: "Rohini", nameHi: "रोहिणी", deity: "Brahma", startDeg: 40.0 },
  { number: 5, name: "Mrigashira", nameHi: "मृगशिरा", deity: "Soma", startDeg: 53.333 },
  { number: 6, name: "Ardra", nameHi: "आर्द्रा", deity: "Rudra", startDeg: 66.667 },
  { number: 7, name: "Punarvasu", nameHi: "पुनर्वसु", deity: "Aditi", startDeg: 80.0 },
  { number: 8, name: "Pushya", nameHi: "पुष्य", deity: "Brihaspati", startDeg: 93.333 },
  { number: 9, name: "Ashlesha", nameHi: "आश्लेषा", deity: "Nagas", startDeg: 106.667 },
  { number: 10, name: "Magha", nameHi: "मघा", deity: "Pitrs", startDeg: 120.0 },
  { number: 11, name: "Purva Phalguni", nameHi: "पूर्व फाल्गुनी", deity: "Bhaga", startDeg: 133.333 },
  { number: 12, name: "Uttara Phalguni", nameHi: "उत्तर फाल्गुनी", deity: "Aryaman", startDeg: 146.667 },
  { number: 13, name: "Hasta", nameHi: "हस्त", deity: "Savitar", startDeg: 160.0 },
  { number: 14, name: "Chitra", nameHi: "चित्रा", deity: "Tvashtar", startDeg: 173.333 },
  { number: 15, name: "Swati", nameHi: "स्वाति", deity: "Vayu", startDeg: 186.667 },
  { number: 16, name: "Vishakha", nameHi: "विशाखा", deity: "Indra-Agni", startDeg: 200.0 },
  { number: 17, name: "Anuradha", nameHi: "अनुराधा", deity: "Mitra", startDeg: 213.333 },
  { number: 18, name: "Jyeshtha", nameHi: "ज्येष्ठा", deity: "Indra", startDeg: 226.667 },
  { number: 19, name: "Mula", nameHi: "मूल", deity: "Nirriti", startDeg: 240.0 },
  { number: 20, name: "Purva Ashadha", nameHi: "पूर्वाषाढा", deity: "Apas", startDeg: 253.333 },
  { number: 21, name: "Uttara Ashadha", nameHi: "उत्तराषाढा", deity: "Vishvedevas", startDeg: 266.667 },
  { number: 22, name: "Shravana", nameHi: "श्रवण", deity: "Vishnu", startDeg: 280.0 },
  { number: 23, name: "Dhanishtha", nameHi: "धनिष्ठा", deity: "Ashta Vasus", startDeg: 293.333 },
  { number: 24, name: "Shatabhisha", nameHi: "शतभिषा", deity: "Varuna", startDeg: 306.667 },
  { number: 25, name: "Purva Bhadrapada", nameHi: "पूर्वभाद्रपद", deity: "Aja Ekapada", startDeg: 320.0 },
  { number: 26, name: "Uttara Bhadrapada", nameHi: "उत्तरभाद्रपद", deity: "Ahir Budhnya", startDeg: 333.333 },
  { number: 27, name: "Revati", nameHi: "रेवती", deity: "Pushan", startDeg: 346.667 }
];

export function getNakshatraFromMoonLongitude(moonLonSidereal) {
  const normalized = ((moonLonSidereal % 360) + 360) % 360;
  const index = Math.floor(normalized / 13.3333);
  return NAKSHATRAS[index % 27];
}

export function calculateNakshatraFromBirthDate(birthDate) {
  const jde = julian.DateToJDE(new Date(birthDate));
  const moonLon = moonposition.position(jde).lon;
  const ayanamsa = 23.85;
  const siderealMoon = ((moonLon - ayanamsa) + 360) % 360;
  return getNakshatraFromMoonLongitude(siderealMoon);
}

