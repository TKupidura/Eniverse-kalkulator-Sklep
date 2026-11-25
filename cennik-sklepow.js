/**
 * ENIVERSE — CENNIK SKLEPÓW INTERNETOWYCH
 * Wszystkie ceny netto w PLN. Edytuj wyłącznie wartości liczbowe.
 * Dla groszy używaj kropki, np. 99.90 (nie 99,90).
 * Kwoty bazowe "brak" i "podstawowy" oraz instrukcja PDF muszą wynosić 0.
 * SEO, kontakt i szkolenia: pełne wartości wariantów; kalkulator sam liczy
 * różnicę względem wariantu zawartego w pakiecie.
 * Po zapisaniu i publikacji odśwież stronę; w WordPress wyczyść cache.
 */
window.ENIVERSE_CENNIK_SKLEPY = {
    // 01. PAKIETY
    pakiety: {
        startEcommerce: 2290,
        standard: 2800,
        pro: 4500
    },

    // 02. ROZBUDOWA — cena za 1 sekcję, podstronę, język lub rundę
    rozbudowa: {
        dodatkowaSekcja: 90,
        dodatkowaPodstrona: 190,
        dodatkowyJezyk: 490,
        dodatkowaRundaPoprawek: 69
    },

    // 03. SEO — pełna wartość poziomu SEO
    seo: {
        brak: 0,
        techniczne: 149,
        podstawowe: 290,
        rozszerzone: 490
    },

    // 04. DODATKI I INTEGRACJE — cena za usługę
    dodatki: {
        mapyGoogle: 50,
        newsletter: 300,
        socialMedia: 50,
        googleAnalytics: 200,
        googleSearchConsole: 90,
        blogRealizacje: 249,
        logoAI: 190
    },

    // 05. MARKETING I TREŚCI — cena za usługę
    marketing: {
        optymalizacjaTresci: 290,
        tworzenieTresciSEO: 590,
        kampaniaGoogleAds: 490,
        pozycjonowanieSEO: 690
    },

    // 06. KONTAKT — pełna wartość wariantu
    kontakt: {
        podstawowy: 0,
        formularz: 90,
        formularzRozszerzony: 190
    },

    // 07. SZKOLENIA — pełna wartość wariantu
    szkolenia: {
        instrukcjaPDF: 0,
        szkolenie30min: 49,
        szkolenie1h: 90,
        szkolenie2h: 179
    },

    // 08. HOSTING I OPIEKA — ceny za 12 miesięcy
    uslugiRoczne: {
        hosting: 600,
        opiekaTechniczna: 348
    }
};
