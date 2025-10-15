// Wybór czcionki
export const fontTypeOptions = [
  { id: 1, value: "text", label: "Tekst" },
  { id: 2, value: "svg", label: "SVG" },
];

// Front litery
export const frontLetterOptions = [
  { id: 1, value: "standard", label: "Standardowy" },
  { id: 2, value: "bold", label: "Pogrubiony" },
  { id: 3, value: "light", label: "Cienki" },
  { id: 4, value: "italic", label: "Kursywa" },
];

// Tył litery
export const backLetterOptions = [
  { id: 1, value: "flat", label: "Płaski" },
  { id: 2, value: "rounded", label: "Zaokrąglony" },
  { id: 3, value: "beveled", label: "Skosowany" },
  { id: 4, value: "chamfered", label: "Fazowany" },
];
// Dodatki do lica
export const frontLetterAdditionalOptions = [
  { id: 1, value: "standard", label: "Standardowy" },
  { id: 2, value: "bold", label: "Pogrubiony" },
  { id: 3, value: "light", label: "Cienki" },
  { id: 4, value: "italic", label: "Kursywa" },
];

// Głębokość taśmy
export const tapeDepthOptions = [
  { id: 1, value: "thin", label: "Cienka (0.5mm)" },
  { id: 2, value: "medium", label: "Średnia (1mm)" },
  { id: 3, value: "thick", label: "Gruba (1.5mm)" },
  { id: 4, value: "extra-thick", label: "Bardzo gruba (2mm)" },
];

// Model taśmy
export const tapeModelOptions = [
  { id: 1, value: "led-strip", label: "Taśma LED" },
  { id: 2, value: "neon", label: "Neon" },
  { id: 3, value: "fiber-optic", label: "Światłowód" },
  { id: 4, value: "halogen", label: "Halogen" },
];

// Kolor taśmy
export const tapeColorOptions = [
  { id: 1, value: "white", label: "Biały" },
  { id: 2, value: "warm-white", label: "Ciepły biały" },
  { id: 3, value: "cool-white", label: "Chłodny biały" },
  { id: 4, value: "red", label: "Czerwony" },
  { id: 5, value: "blue", label: "Niebieski" },
  { id: 6, value: "green", label: "Zielony" },
  { id: 7, value: "yellow", label: "Żółty" },
  { id: 8, value: "purple", label: "Fioletowy" },
  { id: 9, value: "orange", label: "Pomarańczowy" },
  { id: 10, value: "pink", label: "Różowy" },
  { id: 11, value: "cyan", label: "Cyjan" },
  { id: 12, value: "magenta", label: "Magenta" },
];

// Oświetlenie
export const lightingOptions = [
  { id: 1, value: "static", label: "Statyczne" },
  { id: 2, value: "blinking", label: "Migające" },
  { id: 3, value: "fading", label: "Pulsujące" },
  { id: 4, value: "chasing", label: "Biegające" },
  { id: 5, value: "rainbow", label: "Tęczowe" },
  { id: 6, value: "off", label: "Wyłączone" },
];

// Mocowanie do podkonstrukcji
export const mountingOptions = [
  { id: 1, value: "screws", label: "Śruby" },
  { id: 2, value: "magnets", label: "Magnesy" },
  { id: 3, value: "adhesive", label: "Klej" },
  { id: 4, value: "clips", label: "Zaciski" },
  { id: 5, value: "brackets", label: "Wsporniki" },
];

// Podkonstrukcja
export const substructureOptions = [
  { id: 1, value: "aluminum", label: "Aluminium" },
  { id: 2, value: "steel", label: "Stal" },
  { id: 3, value: "wood", label: "Drewno" },
  { id: 4, value: "plastic", label: "Plastik" },
  { id: 5, value: "composite", label: "Kompozyt" },
];

// Ściemniacz
export const dimmerOptions = [
  { id: 1, value: "none", label: "Brak" },
  { id: 2, value: "manual", label: "Ręczny" },
  { id: 3, value: "automatic", label: "Automatyczny" },
  { id: 4, value: "timer", label: "Zegarowy" },
  { id: 5, value: "motion", label: "Czujnik ruchu" },
];

// Szablon do modelu
export const templateOptions = [
  { id: 1, value: "basic", label: "Podstawowy" },
  { id: 2, value: "premium", label: "Premium" },
  { id: 3, value: "custom", label: "Niestandardowy" },
  { id: 4, value: "minimalist", label: "Minimalistyczny" },
  { id: 5, value: "decorative", label: "Dekoracyjny" },
];

// Wymiar podkonstrukcji
export const substructureSizeOptions = [
  { id: 1, value: "small", label: "Mały (do 50cm)" },
  { id: 2, value: "medium", label: "Średni (50-100cm)" },
  { id: 3, value: "large", label: "Duży (100-200cm)" },
  { id: 4, value: "extra-large", label: "Bardzo duży (200cm+)" },
  { id: 5, value: "custom", label: "Niestandardowy" },
];

// Wszystkie opcje w jednym obiekcie dla łatwego importu
export const letterConst = {
  fontType: fontTypeOptions,
  frontLetter: frontLetterOptions,
  backLetter: backLetterOptions,
  tapeDepth: tapeDepthOptions,
  tapeModel: tapeModelOptions,
  tapeColor: tapeColorOptions,
  lighting: lightingOptions,
  mounting: mountingOptions,
  substructure: substructureOptions,
  dimmer: dimmerOptions,
  template: templateOptions,
  substructureSize: substructureSizeOptions,
};
