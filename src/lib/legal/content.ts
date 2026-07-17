// Legal copy for the Regulamin (terms) and Polityka prywatności (privacy) pages.
// Written for a RESERVATION-ONLY service (no online payment; the rental contract
// and any deposit are settled at vehicle handover). This is a solid template —
// the operator must complete the bracketed registration data and have it reviewed
// by a lawyer before relying on it in production.

export type LegalSection = { h: string; p: string[] };
export type LegalDoc = {
  title: string;
  updatedLabel: string;
  intro: string;
  note: string;
  sections: LegalSection[];
};

export type LegalKind = "terms" | "privacy";

const UPDATED = "17.07.2026";
const COMPANY = "A&A Corporation";
const EMAIL = "kontakt@aacorporation.pl";
const PHONE = "+48 884 762 950";

const pl: Record<LegalKind, LegalDoc> = {
  terms: {
    title: "Regulamin wynajmu",
    updatedLabel: `Ostatnia aktualizacja: ${UPDATED}`,
    intro:
      `Niniejszy regulamin określa zasady korzystania z serwisu ${COMPANY} oraz warunki ` +
      "rezerwacji i najmu pojazdów. Złożenie rezerwacji oznacza akceptację regulaminu.",
    note:
      "Dokument jest wzorem i wymaga uzupełnienia danych rejestrowych firmy (NIP, REGON, " +
      "adres siedziby) oraz weryfikacji prawnej przed publikacją produkcyjną.",
    sections: [
      {
        h: "§1. Postanowienia ogólne",
        p: [
          `Wynajmującym jest ${COMPANY} z siedzibą w Warszawie [adres siedziby, NIP, REGON — do uzupełnienia], ` +
            `kontakt: ${EMAIL}, tel. ${PHONE}.`,
          "Regulamin dotyczy rezerwacji składanych za pośrednictwem serwisu internetowego Wynajmującego oraz najmu pojazdów oferowanych w serwisie.",
        ],
      },
      {
        h: "§2. Definicje",
        p: [
          "Wynajmujący — podmiot wskazany w §1, oddający pojazd w najem.",
          "Najemca — pełnoletnia osoba fizyczna lub przedsiębiorca, która składa rezerwację i zawiera umowę najmu.",
          "Rezerwacja — zgłoszenie chęci najmu pojazdu w wybranym terminie, złożone przez serwis.",
          "Umowa najmu — odrębna umowa zawierana przy wydaniu pojazdu, określająca szczegółowe warunki najmu.",
        ],
      },
      {
        h: "§3. Rezerwacja",
        p: [
          "Rezerwacja składana w serwisie ma charakter zapytania i nie stanowi zawarcia umowy najmu.",
          "Serwis nie pobiera płatności online. Wynajmujący potwierdza dostępność pojazdu i szczegóły rezerwacji drogą telefoniczną lub e-mailową.",
          "Do zawarcia umowy najmu dochodzi z chwilą podpisania umowy i wydania pojazdu w umówionym miejscu i terminie.",
          "Wynajmujący zastrzega prawo odmowy potwierdzenia rezerwacji, w szczególności w razie niedostępności pojazdu lub niespełnienia warunków najmu.",
        ],
      },
      {
        h: "§4. Warunki najmu",
        p: [
          "Najemca powinien posiadać ważne prawo jazdy odpowiedniej kategorii oraz dokument tożsamości.",
          "Minimalny wiek Najemcy oraz minimalny okres posiadania prawa jazdy określa Wynajmujący dla poszczególnych kategorii pojazdów.",
          "Wynajmujący może uzależnić wydanie pojazdu od okazania wymaganych dokumentów oraz wniesienia kaucji.",
        ],
      },
      {
        h: "§5. Płatności i kaucja",
        p: [
          "Rozliczenie następuje przy wydaniu pojazdu, zgodnie z cennikiem obowiązującym w chwili potwierdzenia rezerwacji.",
          "Wynajmujący może pobrać zwrotną kaucję. Dostępny może być wariant bez kaucji za dodatkową opłatą wskazaną w kalkulatorze.",
          "Kaucja jest zwracana po zwrocie pojazdu bez uszkodzeń i rozliczeniu ewentualnych opłat dodatkowych.",
        ],
      },
      {
        h: "§6. Odbiór i zwrot pojazdu",
        p: [
          "Pojazd wydawany jest czysty, sprawny i z określonym poziomem paliwa, co potwierdza protokół wydania.",
          "Najemca zwraca pojazd w stanie niepogorszonym, w umówionym terminie i miejscu, z tym samym poziomem paliwa.",
          "Przekroczenie limitu kilometrów lub czasu najmu może wiązać się z opłatami dodatkowymi określonymi w umowie najmu.",
        ],
      },
      {
        h: "§7. Obowiązki Najemcy",
        p: [
          "Najemca korzysta z pojazdu zgodnie z jego przeznaczeniem oraz przepisami ruchu drogowego.",
          "Zakazane jest oddawanie pojazdu w podnajem, uczestnictwo w wyścigach oraz prowadzenie pojazdu pod wpływem alkoholu lub środków odurzających.",
          "Wyjazd pojazdem poza granice Polski wymaga uprzedniej zgody Wynajmującego.",
        ],
      },
      {
        h: "§8. Odpowiedzialność",
        p: [
          "Najemca ponosi odpowiedzialność za szkody powstałe z jego winy w zakresie nieobjętym ubezpieczeniem lub pakietem ochronnym.",
          "Zakres ochrony ubezpieczeniowej oraz udział własny określa umowa najmu.",
        ],
      },
      {
        h: "§9. Anulowanie i zmiana rezerwacji",
        p: [
          "Rezerwację można anulować lub zmienić przed wydaniem pojazdu, kontaktując się z Wynajmującym.",
          "Ponieważ serwis nie pobiera płatności online, anulowanie niepotwierdzonej rezerwacji jest bezpłatne.",
        ],
      },
      {
        h: "§10. Reklamacje",
        p: [
          `Reklamacje można składać na adres ${EMAIL}. Wynajmujący rozpatruje reklamację w terminie do 14 dni.`,
        ],
      },
      {
        h: "§11. Dane osobowe",
        p: [
          "Zasady przetwarzania danych osobowych określa Polityka prywatności dostępna w serwisie.",
        ],
      },
      {
        h: "§12. Postanowienia końcowe",
        p: [
          "W sprawach nieuregulowanych stosuje się przepisy prawa polskiego, w szczególności Kodeksu cywilnego.",
          "Wynajmujący może zmienić regulamin; do rezerwacji stosuje się regulamin obowiązujący w chwili jej złożenia.",
        ],
      },
    ],
  },
  privacy: {
    title: "Polityka prywatności",
    updatedLabel: `Ostatnia aktualizacja: ${UPDATED}`,
    intro:
      "Niniejsza polityka opisuje, w jaki sposób przetwarzamy dane osobowe użytkowników serwisu " +
      "zgodnie z RODO (rozporządzenie 2016/679).",
    note:
      "Dokument jest wzorem i wymaga uzupełnienia danych administratora oraz weryfikacji prawnej " +
      "przed publikacją produkcyjną.",
    sections: [
      {
        h: "1. Administrator danych",
        p: [
          `Administratorem danych osobowych jest ${COMPANY} z siedzibą w Warszawie ` +
            `[adres, NIP, REGON — do uzupełnienia]. Kontakt: ${EMAIL}, tel. ${PHONE}.`,
        ],
      },
      {
        h: "2. Cele i podstawy przetwarzania",
        p: [
          "Obsługa rezerwacji i zawarcie oraz wykonanie umowy najmu — art. 6 ust. 1 lit. b RODO.",
          "Wypełnienie obowiązków prawnych (m.in. podatkowych i rachunkowych) — art. 6 ust. 1 lit. c RODO.",
          "Prawnie uzasadniony interes administratora (kontakt, dochodzenie roszczeń, bezpieczeństwo) — art. 6 ust. 1 lit. f RODO.",
        ],
      },
      {
        h: "3. Zakres danych",
        p: [
          "Przetwarzamy dane niezbędne do obsługi rezerwacji i najmu: imię i nazwisko, dane kontaktowe (e-mail, telefon), a na etapie zawarcia umowy również dane wskazane w umowie najmu (m.in. adres, dane dokumentu tożsamości i prawa jazdy).",
          "Podanie danych jest dobrowolne, lecz niezbędne do realizacji rezerwacji i zawarcia umowy.",
        ],
      },
      {
        h: "4. Okres przechowywania",
        p: [
          "Dane przechowujemy przez czas niezbędny do realizacji celów, a następnie przez okres wynikający z przepisów prawa (m.in. przedawnienie roszczeń, obowiązki podatkowe).",
        ],
      },
      {
        h: "5. Odbiorcy danych",
        p: [
          "Dane mogą być powierzane podmiotom wspierającym działalność (m.in. dostawcom usług IT, hostingu, ubezpieczycielom) wyłącznie w niezbędnym zakresie i na podstawie umów powierzenia.",
        ],
      },
      {
        h: "6. Prawa osób, których dane dotyczą",
        p: [
          "Przysługuje Państwu prawo dostępu do danych, ich sprostowania, usunięcia lub ograniczenia przetwarzania, prawo do przenoszenia danych oraz wniesienia sprzeciwu.",
          "Mają Państwo prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (PUODO).",
        ],
      },
      {
        h: "7. Pliki cookie",
        p: [
          "Serwis używa niezbędnych plików cookie zapewniających jego działanie. Pozostałe kategorie plików cookie stosujemy wyłącznie po wyrażeniu zgody, którą można w każdej chwili zmienić w ustawieniach cookie.",
        ],
      },
      {
        h: "8. Bezpieczeństwo",
        p: [
          "Stosujemy odpowiednie środki techniczne i organizacyjne chroniące dane przed nieuprawnionym dostępem, utratą lub zmianą.",
        ],
      },
      {
        h: "9. Kontakt",
        p: [`W sprawach dotyczących danych osobowych prosimy o kontakt: ${EMAIL}.`],
      },
    ],
  },
};

const en: Record<LegalKind, LegalDoc> = {
  terms: {
    title: "Rental Terms",
    updatedLabel: `Last updated: ${UPDATED}`,
    intro:
      `These terms govern the use of the ${COMPANY} website and the conditions of vehicle ` +
      "reservation and rental. Placing a reservation constitutes acceptance of these terms.",
    note:
      "This document is a template and must be completed with the company's registration data " +
      "and reviewed by a lawyer before production use.",
    sections: [
      {
        h: "1. General provisions",
        p: [
          `The lessor is ${COMPANY}, seated in Warsaw [registered address, tax ID — to be completed], ` +
            `contact: ${EMAIL}, phone ${PHONE}.`,
          "These terms apply to reservations placed via the lessor's website and to the rental of the vehicles offered.",
        ],
      },
      {
        h: "2. Definitions",
        p: [
          "Lessor — the entity named in section 1, providing the vehicle for rental.",
          "Renter — an adult individual or business placing a reservation and entering into the rental agreement.",
          "Reservation — a request to rent a vehicle for a selected period, placed via the website.",
          "Rental agreement — a separate agreement concluded at vehicle handover, setting out the detailed rental terms.",
        ],
      },
      {
        h: "3. Reservation",
        p: [
          "A reservation placed on the website is a request and does not constitute a rental agreement.",
          "The website takes no online payment. The lessor confirms availability and reservation details by phone or e-mail.",
          "The rental agreement is concluded upon signing and handover of the vehicle at the agreed place and time.",
          "The lessor reserves the right to decline a reservation, in particular where the vehicle is unavailable or rental conditions are not met.",
        ],
      },
      {
        h: "4. Rental conditions",
        p: [
          "The renter must hold a valid driving licence of the appropriate category and an identity document.",
          "The minimum age and minimum licence-holding period are set by the lessor per vehicle category.",
          "Handover may be conditional on presenting the required documents and paying a deposit.",
        ],
      },
      {
        h: "5. Payments and deposit",
        p: [
          "Settlement takes place at handover, according to the price list in force when the reservation was confirmed.",
          "The lessor may take a refundable deposit. A no-deposit variant may be available for the additional fee shown in the calculator.",
          "The deposit is returned after the vehicle is returned undamaged and any additional fees are settled.",
        ],
      },
      {
        h: "6. Handover and return",
        p: [
          "The vehicle is handed over clean, roadworthy and with a stated fuel level, recorded in a handover protocol.",
          "The renter returns the vehicle in no worse condition, at the agreed time and place, with the same fuel level.",
          "Exceeding the mileage limit or rental period may incur additional fees set out in the rental agreement.",
        ],
      },
      {
        h: "7. Renter's obligations",
        p: [
          "The renter uses the vehicle as intended and in accordance with traffic regulations.",
          "Subletting, racing and driving under the influence of alcohol or drugs are prohibited.",
          "Taking the vehicle outside Poland requires the lessor's prior consent.",
        ],
      },
      {
        h: "8. Liability",
        p: [
          "The renter is liable for damage caused through their fault to the extent not covered by insurance or the protection package.",
          "The scope of insurance cover and the excess are set out in the rental agreement.",
        ],
      },
      {
        h: "9. Cancellation and changes",
        p: [
          "A reservation may be cancelled or changed before handover by contacting the lessor.",
          "As the website takes no online payment, cancelling an unconfirmed reservation is free of charge.",
        ],
      },
      {
        h: "10. Complaints",
        p: [
          `Complaints may be submitted to ${EMAIL}. The lessor handles complaints within 14 days.`,
        ],
      },
      {
        h: "11. Personal data",
        p: [
          "The processing of personal data is described in the Privacy Policy available on the website.",
        ],
      },
      {
        h: "12. Final provisions",
        p: [
          "Matters not regulated herein are governed by Polish law, in particular the Civil Code.",
          "The lessor may amend these terms; the version in force when a reservation is placed applies to that reservation.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    updatedLabel: `Last updated: ${UPDATED}`,
    intro:
      "This policy describes how we process website users' personal data in accordance with the GDPR " +
      "(Regulation 2016/679).",
    note:
      "This document is a template and must be completed with the controller's data and reviewed by a " +
      "lawyer before production use.",
    sections: [
      {
        h: "1. Data controller",
        p: [
          `The controller of personal data is ${COMPANY}, seated in Warsaw [address, tax ID — to be completed]. ` +
            `Contact: ${EMAIL}, phone ${PHONE}.`,
        ],
      },
      {
        h: "2. Purposes and legal bases",
        p: [
          "Handling reservations and concluding and performing the rental agreement — Art. 6(1)(b) GDPR.",
          "Compliance with legal obligations (incl. tax and accounting) — Art. 6(1)(c) GDPR.",
          "The controller's legitimate interest (contact, pursuing claims, security) — Art. 6(1)(f) GDPR.",
        ],
      },
      {
        h: "3. Scope of data",
        p: [
          "We process data necessary to handle a reservation and rental: name, contact details (e-mail, phone), and — at the agreement stage — the data stated in the rental agreement (incl. address, ID and driving-licence details).",
          "Providing data is voluntary but necessary to complete a reservation and conclude an agreement.",
        ],
      },
      {
        h: "4. Retention period",
        p: [
          "We keep data for as long as necessary to achieve the purposes, then for the period required by law (incl. limitation of claims and tax obligations).",
        ],
      },
      {
        h: "5. Data recipients",
        p: [
          "Data may be entrusted to entities supporting our operations (incl. IT and hosting providers, insurers) only to the necessary extent and under processing agreements.",
        ],
      },
      {
        h: "6. Your rights",
        p: [
          "You have the right to access, rectify, erase or restrict the processing of your data, the right to data portability and the right to object.",
          "You have the right to lodge a complaint with the President of the Personal Data Protection Office (PUODO).",
        ],
      },
      {
        h: "7. Cookies",
        p: [
          "The website uses essential cookies required for it to function. Other cookie categories are used only after consent, which you can change at any time in the cookie settings.",
        ],
      },
      {
        h: "8. Security",
        p: [
          "We apply appropriate technical and organisational measures to protect data against unauthorised access, loss or alteration.",
        ],
      },
      {
        h: "9. Contact",
        p: [`For matters concerning personal data, please contact: ${EMAIL}.`],
      },
    ],
  },
};

export function getLegalDoc(kind: LegalKind, locale: string): LegalDoc {
  return (locale === "en" ? en : pl)[kind];
}
