# Eniverse — kalkulator wyceny sklepów internetowych

Osobny projekt kalkulatora WooCommerce agencji Eniverse.

## Podgląd

**[Otwórz interaktywny kalkulator sklepów](https://tkupidura.github.io/Eniverse-kalkulator-Sklep/)**

Podgląd jest automatycznie publikowany w GitHub Pages po każdej zmianie w `main`.

## Pakiety — wersja robocza v2

| Pakiet | Cena netto | Zakres |
|---|---:|---|
| Start e-Commerce | 2 290 zł | 5 produktów prostych, 1 h szkolenia, gotowy motyw z Envato Market / TemplateMonster itp.; licencja osobno |
| Standard | 2 800 zł | 10 produktów prostych, 2 h szkolenia, standardowe podstrony sklepu |
| PRO (wyróżniony) | 4 500 zł | 20 produktów, blog, InPost, rozszerzona personalizacja, GA4 + GSC |
| Business | Wycena indywidualna | Integracje, systemy firmy, B2B, automatyzacje i projekty niestandardowe |

Każdy pakiet zawiera typowy zestaw podstron i widoków sklepu (strona główna, katalog, kategorie, karty produktów, koszyk, zamówienie, konto, strony informacyjne). Nie stosujemy sztucznego limitu 2/4 standardowych podstron. Dodatkowe nietypowe podstrony to osobna usługa.

## Konfigurator

Dla pakietów Start e-Commerce, Standard i PRO:

1. Zakres pakietu
2. Produkty i treści
3. Płatności i dostawa (w tym Stripe, PayPal, Klarna, fulfillment)
4. Integracje (iFirma, Fakturownia, Allegro, Base — dawniej BaseLinker, Sellasist, Subiekt GT, Comarch ERP Optima, logowanie FB)
5. SEO i marketing (Google Analytics 4, GSC, sklep na Facebooku/Instagramie, porzucone koszyki)
6. Dodatkowe języki, poprawki, hosting i opieka
7. Podsumowanie i formularz

Business ma krótszą ścieżkę opisu potrzeb i formularza.

Główny operator płatności wybierany jest w cenie pakietu. Jeżeli jako główny wybrano Stripe/PayPal/Klarna, nie naliczamy ponownie opłaty za tę samą integrację.

Dodatki bez ustalonego cennika są oznaczone jako **Do wyceny**. Koszty licencji, abonamentów platform i opłat operatorów są osobne.

## Pliki

- `index.html` — niezależny podgląd;
- `styles.css` — responsywny wygląd w przestrzeni nazw `#enishop`;
- `app.js` — pakiety, konfigurator, ceny i zapytanie;
- `test/smoke.cjs` — testy scenariuszy cenowych i formularza;
- `.github/workflows/pages.yml` — weryfikacja i wdrożenie do GitHub Pages.

**Ważne:** formularz to makieta — nie wysyła wiadomości. Ceny dodatków są robocze; przed użyciem produkcyjnym wymagają zatwierdzenia. Cena hostingu na pierwszy rok i promocje także wymagają potwierdzenia.

## Oddzielny projekt

[Kalkulator stron WWW](https://github.com/TKupidura/Eniverse-kalkulator) pozostaje niezależny. Inne platformy sklepowe planowane są na kolejne etapy.
