/**
 * ============================================================
 * ENIVERSE — CENTRUM ZARZĄDZANIA CENNIKIEM SKLEPÓW INTERNETOWYCH
 * ============================================================
 *
 * ZASADY OGÓLNE
 * ------------------------------------------------------------
 * Wszystkie ceny podawane są w PLN netto.
 * Kwoty dziesiętne zapisujemy z kropką, np. 149.90.
 * Nie zmieniaj istniejących ID bez potrzeby.
 * Nazwy i wygląd boxów pakietów edytuj w HTML.
 *
 * IDENTYFIKATORY PAKIETÓW
 * ------------------------------------------------------------
 * start - Start e-Commerce
 * one   - Standard
 * wiz   - PRO
 * firm  - Business
 *
 * ZARZĄDZANIE PAKIETAMI
 * ------------------------------------------------------------
 * cena - cena bazowa pakietu; Business: null oraz wycenaIndywidualna: true.
 * revisions - liczba rund poprawek zawartych w cenie pakietu.
 * Przykład: "revisions": 3 oznacza 3 rundy poprawek w cenie.
 * Wartość 0 oznacza brak rund poprawek w cenie.
 *
 * Dodanie nowego pakietu wymaga utworzenia boxa w HTML
 * oraz wpisu z takim samym ID w cennik-sklepow.js.
 * Usunięcie pakietu z cennika ukrywa odpowiadający mu box.
 *
 * DOSTĘPNOŚĆ DODATKÓW
 * ------------------------------------------------------------
 * wPakietach:
 * Określa, w których pakietach dodatek jest już w cenie.
 *
 * Przykład:
 * "wPakietach": ["wiz", "firm"]
 *
 * dostepneWPakietach:
 * Określa, w których pakietach dodatek jest dostępny.
 * W pozostałych pakietach nie będzie widoczny.
 *
 * Przykład:
 * "dostepneWPakietach": ["one", "wiz", "firm"]
 *
 * Jeżeli nie podasz żadnego z powyższych parametrów,
 * zwykły dodatek będzie dostępny odpłatnie we wszystkich pakietach.
 *
 * Można również łączyć oba parametry:
 * "dostepneWPakietach": ["one", "wiz", "firm"],
 * "wPakietach": ["firm"]
 *
 * W takim przypadku dodatek jest płatny w Standard
 * i PRO, a w Business jest już w cenie.
 * Każde ID z wPakietach musi należeć do dostepneWPakietach,
 * jeśli podano obie listy.
 *
 * Reguły dotyczą sekcji dodatki, marketing i uslugiRoczne.
 * Hosting i opieka techniczna zachowują specjalne reguły bazowe.
 * Dodaj, usuń lub zmień cały obiekt, aby zarządzać usługą.
 *
 * ZARZĄDZANIE FORMULARZAMI KONTAKTOWYMI
 * ------------------------------------------------------------
 * Dostępne warianty:
 * podstawowy           - kontakt telefoniczny i e-mail
 * formularz            - standardowy formularz kontaktowy
 * formularzRozszerzony - rozszerzony formularz kontaktowy
 *
 * Aby zmienić formularz zawarty w cenie pakietu,
 * zmień parametr "kontakt" w wybranym pakiecie.
 *
 * Przed: "kontakt": "podstawowy"
 * Po:    "kontakt": "formularz"
 *
 * Nie zmieniaj ceny formularza na 0 zł tylko po to,
 * by uwzględnić go w wybranym pakiecie.
 * Przypisanie jego ID do pakietu oznacza, że jest w cenie.
 * Klient dopłaca jedynie różnicę za wyższy wariant.
 *
 * ZARZĄDZANIE SZKOLENIAMI
 * ------------------------------------------------------------
 * Dostępne warianty:
 * instrukcjaPDF  - instrukcja PDF
 * szkolenie30min - szkolenie 30 minut
 * szkolenie1h    - szkolenie 1 godzina
 * szkolenie2h    - szkolenie 2 godziny
 *
 * Aby zmienić szkolenie zawarte w cenie pakietu,
 * zmień parametr "szkolenie" w wybranym pakiecie.
 *
 * Przykład:
 * "szkolenie": "szkolenie1h"
 *
 * Aby dodać nowe szkolenie, utwórz nowy obiekt
 * w sekcji szkolenia, podając unikalne ID, nazwę i cenę.
 *
 * Przykład:
 * {
 *     "id": "szkolenie3h",
 *     "nazwa": "Szkolenie 3 h",
 *     "cena": 249
 * }
 *
 * Następnie możesz przypisać je do wybranego pakietu:
 * "szkolenie": "szkolenie3h"
 *
 * Warianty SEO, kontaktu i szkoleń zawsze porządkuj
 * według ceny rosnąco, od najtańszego do najdroższego.
 *
 * ============================================================
 */
window.ENIVERSE_CENNIK_SKLEPY = {
  // 01. Ceny pakietów i przypisania usług
  pakiety: [
  {
    "id": "start",
    "cena": 2290,
    "revisions": 1,
    "seo": "brak",
    "kontakt": "podstawowy",
    "szkolenie": "szkolenie1h",
    "hosting": "optional"
  },
  {
    "id": "one",
    "cena": 2800,
    "revisions": 1,
    "seo": "brak",
    "kontakt": "podstawowy",
    "szkolenie": "szkolenie2h",
    "hosting": "optional"
  },
  {
    "id": "wiz",
    "cena": 4500,
    "revisions": 2,
    "seo": "brak",
    "kontakt": "podstawowy",
    "szkolenie": "szkolenie2h",
    "hosting": "optional"
  },
  {
    "id": "firm",
    "cena": null,
    "wycenaIndywidualna": true,
    "revisions": 0,
    "seo": "brak",
    "kontakt": "podstawowy",
    "szkolenie": "instrukcjaPDF",
    "hosting": "optional"
  }
],

  // ============================================================
  // 02. ROZBUDOWA SKLEPU
  // ============================================================
  //
  // UWAGA!
  // Nie dodawaj tutaj nowych, dowolnych identyfikatorów.
  // Ta sekcja obsługuje cztery konkretne mechanizmy.
  //
  // Możesz zmieniać ich nazwy i ceny lub usuwać całe obiekty.
  //
  // Nowe standardowe usługi dodawaj w sekcji "dodatki".
  // ============================================================
  rozbudowa: {
    "dodatkowaSekcja": {
      "nazwa": "Dodatkowe sekcje",
      "cena": 90
    },
    "dodatkowaPodstrona": {
      "nazwa": "Dodatkowe podstrony",
      "cena": 190
    },
    "dodatkowyJezyk": {
      "nazwa": "Dodaj język",
      "cena": 490
    },
    "dodatkowaRundaPoprawek": {
      "nazwa": "Sesje poprawek",
      "cena": 69
    }
  },

  // ============================================================
  // 03. DODATKI DO PROJEKTU
  // ============================================================
  //
  // id                  - unikalny identyfikator dodatku
  // nazwa               - nazwa widoczna w kalkulatorze
  // cena                - cena netto dodatku
  // wPakietach          - pakiety, które mają dodatek w cenie
  // dostepneWPakietach  - pakiety, w których dodatek jest dostępny
  //
  // Brak wPakietach i dostepneWPakietach oznacza, że dodatek
  // jest dostępny odpłatnie we wszystkich pakietach.
  //
  // Dodaj cały obiekt, aby utworzyć nową usługę.
  // Usuń cały obiekt, aby usunąć usługę z kalkulatora.
  // ============================================================
  dodatki: [
    { "id": "inpost", "nazwa": "Integracja InPost", "cena": 0, "wPakietach": ["wiz"], "dostepneWPakietach": ["wiz"] }, // Cena poza PRO do ustalenia.

    {
      "id": "maps",
      "nazwa": "Mapy Google",
      "cena": 50
    },
    {
      "id": "newsletter",
      "nazwa": "Newsletter",
      "cena": 300
    },
    {
      "id": "social",
      "nazwa": "Integracja z social media",
      "cena": 50
    },
    {
      "id": "analytics",
      "nazwa": "Google Analytics",
      "cena": 200,
      "wPakietach": ["one", "wiz"]
    },
    {
      "id": "gsc",
      "nazwa": "Google Search Console",
      "cena": 90,
      "wPakietach": ["wiz"]
    },
    {
      "id": "blog",
      "nazwa": "Blog",
      "cena": 249,
      "wPakietach": ["wiz"]
    },
    {
      "id": "logoAi",
      "nazwa": "Logo stworzone przy pomocy AI",
      "cena": 190
    }
  ],

  // 04. SEO
  seo: [
    {
      "id": "brak",
      "nazwa": "Bez dodatkowego SEO",
      "opis": "Brak SEO na start w bazie pakietu",
      "cena": 0
    },
    {
      "id": "techniczne",
      "nazwa": "SEO techniczne na start",
      "opis": "Zakres do doprecyzowania w warunkach SEO",
      "cena": 149
    },
    {
      "id": "podstawowe",
      "nazwa": "Podstawowe SEO na start",
      "opis": "Według warunków SEO; dalsze usługi wyceniane osobno",
      "cena": 290
    },
    {
      "id": "rozszerzone",
      "nazwa": "Rozszerzone SEO",
      "opis": "Według warunków SEO; dalsze usługi wyceniane osobno",
      "cena": 490
    }
  ],

  // 05. Marketing i dodatkowe SEO
  marketing: [
    {
      "id": "contentEdit",
      "nazwa": "Redakcja i optymalizacja treści",
      "cena": 290,
      "opis": "Optymalizacja istniejących tekstów"
    },
    {
      "id": "contentSeo",
      "nazwa": "Stworzenie i optymalizacja treści pod SEO",
      "cena": 590,
      "opis": "Przygotowanie nowych tekstów pod SEO"
    },
    {
      "id": "googleAds",
      "nazwa": "Kampania Google Ads",
      "cena": 490,
      "opis": "Uruchomienie kampanii · bez budżetu reklamowego"
    },
    {
      "id": "seoPosition",
      "nazwa": "Pozycjonowanie SEO",
      "cena": 690,
      "opis": "Pakiet startowy · dalsza obsługa osobno"
    }
  ],

  // ============================================================
  // 06. KONTAKT
  // ============================================================
  //
  // Aby zmienić formularz zawarty w cenie pakietu,
  // zmień wartość parametru "kontakt" w sekcji pakiety.
  //
  // Nie ustawiaj ceny formularza na 0 zł tylko w celu
  // uwzględnienia go w wybranym pakiecie.
  // Przypisanie ID do pakietu oznacza, że jest w cenie.
  //
  // Dopłata za wyższy wariant = różnica cen wariantów.
  // Warianty muszą być uporządkowane według ceny rosnąco.
  // ============================================================
  kontakt: [
    {
      "id": "podstawowy",
      "nazwa": "Kontakt podstawowy",
      "opis": "Przyciski kontaktowe: telefon i e-mail",
      "cena": 0
    },
    {
      "id": "formularz",
      "nazwa": "Formularz kontaktowy",
      "opis": "Standardowy formularz kontaktowy",
      "cena": 90
    },
    {
      "id": "formularzRozszerzony",
      "nazwa": "Formularz kontaktowy rozszerzony",
      "opis": "Rozbudowane pola i opcje formularza",
      "cena": 190
    }
  ],

  // ============================================================
  // 07. SZKOLENIA
  // ============================================================
  //
  // Aby dodać szkolenie, utwórz nowy obiekt z unikalnym ID,
  // nazwą oraz ceną netto.
  //
  // Aby przypisać szkolenie do pakietu, zmień parametr
  // "szkolenie" w sekcji pakiety, podając ID szkolenia.
  //
  // Dopłata za wyższy wariant = różnica cen wariantów.
  // Warianty muszą być uporządkowane według ceny rosnąco.
  // ============================================================
  szkolenia: [
    {
      "id": "instrukcjaPDF",
      "nazwa": "Instrukcja PDF",
      "cena": 0
    },
    {
      "id": "szkolenie30min",
      "nazwa": "Szkolenie 30 min",
      "cena": 49
    },
    {
      "id": "szkolenie1h",
      "nazwa": "Szkolenie 1 h",
      "cena": 90
    },
    {
      "id": "szkolenie2h",
      "nazwa": "Szkolenie 2 h",
      "cena": 179
    }
  ],

  // 08. Usługi roczne
  uslugiRoczne: [
    {
      "id": "hosting",
      "nazwa": "Hosting sklepu",
      "cena": 600
    },
    {
      "id": "care",
      "nazwa": "Opieka techniczna",
      "cena": 348
    }
  ],

  // 09. Ustawienia rozliczeń
  ustawienia: {
    okresAbonamentu: 12,
    zaliczkaProcent: 50,
    zaokraglanieRat: true,
    progZaokraglania: 0.50
  }
};
