# Eniverse — kalkulator wyceny sklepów internetowych

Oddzielne repozytorium kalkulatora sklepów WooCommerce agencji Eniverse.

## Podgląd online

**[Otwórz kalkulator sklepów](https://tkupidura.github.io/Eniverse-kalkulator-Sklep/)**

Podgląd jest publikowany automatycznie przez GitHub Pages po zatwierdzeniu zmian w gałęzi `main`.

## Wersja v1 (demonstracyjna)

Pakiety:
- **Standard — 2 800 zł netto**
- **PRO — 4 500 zł netto** (pakiet wyróżniony)
- **Business — wycena indywidualna** (bez publicznej ceny minimalnej)

Zaimplementowano:
- trzy responsywne karty pakietów i rozwijane pełne zakresy,
- „Wybieram pakiet” → podsumowanie bez przechodzenia przez konfigurator,
- „Skonfiguruj pakiet” → 5 kroków z wyceną dodatków,
- osobny formularz rozpoznania potrzeb dla Business,
- rozbicie wyceny na koszty jednorazowe i roczne,
- walidację formularza i generowanie tekstowego podglądu zapytania,
- obsługę klawiatury, zamykanie modalu Escape i przywracanie fokusu.

**Uwaga:** formularz jest demonstracyjny. Nie wysyła wiadomości i nie zapisuje danych. Wartości niezatwierdzonych dodatków są robocze.

## Pliki

- `index.html` — widok strony i szkielet konfiguratora;
- `styles.css` — responsywne style, izolowane selektorami `#enishop`;
- `app.js` — zakresy pakietów, ceny, konfiguracja i podsumowanie;
- `test/smoke.cjs` — podstawowe testy kalkulacji i formularza;
- `.github/workflows/pages.yml` — testy i automatyczna publikacja podglądu.

## Ograniczenia pierwszej wersji

- Nie jest podłączony docelowy WordPress/Elementor ani system wysyłania zapytań.
- Zakresy, ceny dodatków i promocja hostingu wymagają zatwierdzenia przed publikacją produkcyjną.
- Kolejne platformy (Shoper, Shopify, Wix, PrestaShop, Magento) są planowane na przyszłość; v1 dotyczy WooCommerce.

## Oddzielny kalkulator stron WWW

[Repozytorium kalkulatora stron](https://github.com/TKupidura/Eniverse-kalkulator) jest niezależne i nie zostało zmienione w ramach tego projektu.
