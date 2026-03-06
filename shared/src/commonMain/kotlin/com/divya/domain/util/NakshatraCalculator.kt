package com.divya.domain.util

import com.divya.data.models.Nakshatra

object NakshatraCalculator {
    private val nakshatras = listOf(
        Nakshatra(1, "Ashwini", "अश्विनी", "Ashwini Kumaras"),
        Nakshatra(2, "Bharani", "भरणी", "Yama"),
        Nakshatra(3, "Krittika", "कृत्तिका", "Agni"),
        Nakshatra(4, "Rohini", "रोहिणी", "Brahma"),
        Nakshatra(5, "Mrigashira", "मृगशिरा", "Soma"),
        Nakshatra(6, "Ardra", "आर्द्रा", "Rudra"),
        Nakshatra(7, "Punarvasu", "पुनर्वसु", "Aditi"),
        Nakshatra(8, "Pushya", "पुष्य", "Brihaspati"),
        Nakshatra(9, "Ashlesha", "आश्लेषा", "Nagas"),
        Nakshatra(10, "Magha", "मघा", "Pitrs"),
        Nakshatra(11, "Purva Phalguni", "पूर्व फाल्गुनी", "Bhaga"),
        Nakshatra(12, "Uttara Phalguni", "उत्तर फाल्गुनी", "Aryaman"),
        Nakshatra(13, "Hasta", "हस्त", "Savitar"),
        Nakshatra(14, "Chitra", "चित्रा", "Tvashtar"),
        Nakshatra(15, "Swati", "स्वाति", "Vayu"),
        Nakshatra(16, "Vishakha", "विशाखा", "Indra-Agni"),
        Nakshatra(17, "Anuradha", "अनुराधा", "Mitra"),
        Nakshatra(18, "Jyeshtha", "ज्येष्ठा", "Indra"),
        Nakshatra(19, "Mula", "मूल", "Nirriti"),
        Nakshatra(20, "Purva Ashadha", "पूर्वाषाढा", "Apas"),
        Nakshatra(21, "Uttara Ashadha", "उत्तराषाढा", "Vishvedevas"),
        Nakshatra(22, "Shravana", "श्रवण", "Vishnu"),
        Nakshatra(23, "Dhanishtha", "धनिष्ठा", "Ashta Vasus"),
        Nakshatra(24, "Shatabhisha", "शतभिषा", "Varuna"),
        Nakshatra(25, "Purva Bhadrapada", "पूर्वभाद्रपद", "Aja Ekapada"),
        Nakshatra(26, "Uttara Bhadrapada", "उत्तरभाद्रपद", "Ahir Budhnya"),
        Nakshatra(27, "Revati", "रेवती", "Pushan"),
    )

    fun fromMoonLongitude(longitude: Double): Nakshatra {
        val normalized = ((longitude % 360.0) + 360.0) % 360.0
        val index = (normalized / 13.3333).toInt()
        return nakshatras[index % 27]
    }
}

