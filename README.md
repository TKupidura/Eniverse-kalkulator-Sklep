# Eniverse — kalkulator sklepów internetowych

Aktualizacja 26.11.2026 na podstawie załączonego ZIP-a Eniverse-kalkulator.zip, z zachowaniem pakietów Start e-Commerce 2290 zł, Standard 2800 zł, PRO 4500 zł, Business — indywidualnie.

## Edycja
- Boxy, opisy, kolejność, zakres i wyróżnienie: index.html (demo) i index-sklepow.html (Elementor). Zmiany boxów należy przenosić do obu plików.
- Ceny, dostępność usług, warianty, revisions, zaliczka: cennik-sklepow.js. Wpis z ID i box HTML muszą istnieć razem. Business ma cena:null i wycenaIndywidualna:true. Nie wylicza ceny ani zaliczki.
- Nowy dodatek: obiekt w dodatki. wPakietach — zawarty w cenie, dostepneWPakietach — dostępny. Brak obu — płatny we wszystkich. Warianty SEO/kontaktu/szkoleń w kolejności rosnących cen.
- Style boxów osadzone w HTML zgodnie z nową wersją źródłową. kalkulator-sklepow.css zawiera style konfiguratora. Nie potrzeba pakiety-sklepow.css.
- InPost tylko w PRO w cenie; stawka dodatkowa do uzgodnienia. Inne ceny i opcje robocze, do dalszego dopasowania. Abonament i biblioteka WWW nieaktywne.

## Wdrożenie
Podgląd: index.html na serwerze statycznym. Produkcja: trzy pliki CSS/JS w /wp-content/eniverse-kalkulator/Sklepy internetowe/, cały index-sklepow.html w widżecie HTML Elementora. Osobny CF7 wg plików CF7-sklepy-*.txt; CSS ID widżetu shortcode eniverse-shop-quote-form. Ustaw nadawcę, odbiorcę, Reply-To i przetestuj wysyłkę na WordPress. Demo nie wysyła e-maili. Przy aktualizacji zmień wersję adresów zasobów i wyczyść cache. Nie instalować jako wtyczki. Przed publikacją sprawdzić karty, wszystkie kroki i wycenę, mobile i CF7.

## Spójność wizualna z kalkulatorem stron
Style w HTML są przeniesione z referencji ZIP z 26.11.2026 (kontener 1200 px, DM Sans 400–700, akcent katalogu #dd0429, kolory i gradient, siatka 4/2/1, przyciski i podpowiedzi). Zewnętrzny kalkulator-sklepow.css jest identyczny ze źródłowym kalkulator.css po zmianie przestrzeni nazw. Wyjątki: łamanie tekstu „Wycena indywidualna” w Business i styl pola opisu potrzeb. Wartość 1200 px to maksymalna szerokość sekcji oferty, a nie całej aplikacji ani modalu. Przy kolejnej synchronizacji zachować wyłącznie wyjątki związane z elementami specyficznymi dla sklepu.
