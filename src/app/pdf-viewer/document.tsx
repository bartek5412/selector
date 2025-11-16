import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";

// --- Rejestracja czcionki (Old Style) ---
// Używamy Merriweather jako klasycznej czcionki szeryfowej
// UWAGA: W Next.js to powinno być w globalnym komponencie klienta (np. FontRegistry),
// ale dla celów demonstracyjnych umieszczam to tutaj.

// --- Style ---
const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 11,
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 45,
    backgroundColor: "#ffffff",
    color: "#333333",
  },
  // 1. Nagłówek (listu)
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    paddingBottom: 10,
  },
  companyName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
  },
  headerInfo: {
    fontSize: 10,
    textAlign: "right",
    color: "#555555",
  },
  // 2. Tytuł i dane klienta
  titleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  clientInfo: {
    fontSize: 10,
    textAlign: "right",
  },
  // 3. Podgląd napisu (Placeholder)
  imagePlaceholder: {
    width: "100%",
    height: 180,
    backgroundColor: "#f0f0f0",
    border: "1px dashed #aaaaaa",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  imagePlaceholderText: {
    color: "#888888",
    fontSize: 12,
  },
  // 4. Tabela ze specyfikacją
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#555555",
    paddingBottom: 3,
    marginBottom: 15,
    marginTop: 10,
  },
  table: {
    width: "100%",
    border: "1px solid #e0e0e0",
  },
  tableHeader: {
    // color: "white",
    flexDirection: "row",
    backgroundColor: "#00e39b",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tableColHeader: {
    padding: 6,
    fontWeight: "bold",
    fontSize: 10,
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
  },
  tableCol: {
    padding: 6,
    fontSize: 10,
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
  },
  colDesc: { flex: 3 },
  colQty: { flex: 1, textAlign: "center" },
  colPrice: { flex: 1.5, textAlign: "right" },
  colTotal: { flex: 1.5, textAlign: "right" },

  // 5. Podsumowanie ceny
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  summaryBox: {
    width: "45%",
    border: "1px solid #e0e0e0",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  summaryLabel: {
    fontSize: 10,
  },
  summaryValue: {
    fontSize: 10,
    textAlign: "right",
  },
  summaryTotal: {
    fontWeight: "bold",
    fontSize: 12,
    backgroundColor: "#00e39b",
  },
  // 6. Stopka
  footer: {
    position: "absolute",
    bottom: 30,
    left: 45,
    right: 45,
    textAlign: "center",
    fontSize: 9,
    color: "#888888",
    borderTopWidth: 1,
    borderTopColor: "#cccccc",
    paddingTop: 8,
  },
});

// --- Przykładowe dane ---
// (Tutaj w przyszłości przekażesz propsy)
const today = new Date();
const year = today.getFullYear();

// Poprawka 1: getMonth() jest 0-11, więc dodajemy +1
// Używamy padStart, aby dodać "0" dla miesięcy 1-9 (np. "09")
const month = String(today.getMonth() + 1).padStart(2, "0");

// Poprawka 2: Użyj getDate() aby pobrać dzień miesiąca (1-31)
// Również dodajemy padStart dla dni 1-9
const day = String(today.getDate()).padStart(2, "0");

// (Zauważ też literówkę: "mounth" -> "month")
const fullDate = `OF/${year}/${month}/${day}`;
const daneOferty = {
  numer: fullDate,
  dataWystawienia: new Date().toLocaleDateString("pl-PL"),
  napis: "FRAKTO",
  // Zamiast `imagePlaceholder` możesz tu wstawić komponent <Image src={props.urlObrazka} />
  obrazek: null,
  vat: 23,
  komponenty: [
    {
      id: 1,
      opis: "Litera 3D, Lico Plexi (Kolor: Biały Połysk)",
      ilosc: 6,
      cenaJedn: 150.0,
    },
    { id: 2, opis: "Tył litery: PCV 10mm (Twarde)", ilosc: 6, cenaJedn: 45.0 },
    {
      id: 3,
      opis: "Podświetlenie: Moduły LED (Barwa: Zimna Biel)",
      ilosc: 6,
      cenaJedn: 80.0,
    },
    { id: 4, opis: "Zasilacz hermetyczny 150W", ilosc: 1, cenaJedn: 120.0 },
    { id: 5, opis: "Montaż na dystansach", ilosc: 1, cenaJedn: 250.0 },
  ],
};

const obliczSume = (items) =>
  items.reduce((acc, item) => acc + item.ilosc * item.cenaJedn, 0);

const formatWaluty = (wartosc) => `${wartosc.toFixed(2).replace(".", ",")} PLN`;

// --- Komponent Dokumentu ---
export const MojDokumentPDF = ({offerData}) => {
  const sumaNetto = obliczSume(daneOferty.komponenty);
  const podatekVat = sumaNetto * 0.23;
  const sumaBrutto = sumaNetto + podatekVat;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* === 1. NAGŁÓWEK (Twoja firma) === */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>TWOJA FIRMA</Text>
            <Text style={{ fontSize: 10, color: "#555" }}>Description</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text>ul. Twoja 123</Text>
            <Text>00-000 Miasto</Text>
            <Text>email: biuro@twojafirma.pl</Text>
            <Text>tel: 123 456 789</Text>
          </View>
        </View>

        {/* === 2. TYTUŁ I KLIENT === */}
        <View style={styles.titleSection}>
          <View>
            <Text style={styles.title}>Oferta Handlowa</Text>
            <Text style={{ fontSize: 11, marginBottom: 5 }}>
              Numer: {daneOferty.numer}
            </Text>
            <Text style={{ fontSize: 11 }}>
              Data: {daneOferty.dataWystawienia}
            </Text>
          </View>
          {/* <View style={styles.clientInfo}>
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Dla:</Text>
            <Text>{daneOferty.klient.nazwa}</Text>
            <Text>{daneOferty.klient.adres}</Text>
            <Text>{daneOferty.klient.email}</Text>
          </View> */}
        </View>

        {/* === 3. PODGLĄD NAPISU (obrazek) === */}
        <Text style={styles.sectionTitle}>Podgląd projektu</Text>
        {daneOferty.obrazek ? (
          <Image src={daneOferty.obrazek} style={styles.imagePlaceholder} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>
              [ Tu pojawi się obrazek z podglądem napisu "{daneOferty.napis}" ]
            </Text>
          </View>
        )}

        {/* === 4. SPECYFIKACJA (Tabela) === */}
        <Text style={styles.sectionTitle}>Szczegółowa specyfikacja</Text>
        <View style={styles.table}>
          {/* Nagłówek tabeli */}
          <View style={styles.tableHeader}>
            <Text style={{ ...styles.tableColHeader, ...styles.colDesc }}>
              Komponent / Opis
            </Text>
            <Text style={{ ...styles.tableColHeader, ...styles.colQty }}>
              {/* Ilość */}
              {offerData.tapeType}
            </Text>
          </View>
          {/* Wiersze tabeli */}
          {daneOferty.komponenty.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={{ ...styles.tableCol, ...styles.colDesc }}>
                {item.opis}
              </Text>
              <Text style={{ ...styles.tableCol, ...styles.colQty }}>
                {item.ilosc}
              </Text>
            </View>
          ))}
        </View>

        {/* === 5. PODSUMOWANIE CENY === */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Suma netto:</Text>
              <Text style={styles.summaryValue}>{formatWaluty(sumaNetto)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Podatek VAT ({daneOferty.vat}%):
              </Text>
              <Text style={styles.summaryValue}>
                {formatWaluty(podatekVat)}
              </Text>
            </View>
            <View
              style={{
                ...styles.summaryRow,
                ...styles.summaryTotal,
                borderBottomWidth: 0,
              }}
            >
              <Text style={styles.summaryLabel}>DO ZAPŁATY (BRUTTO):</Text>
              <Text style={styles.summaryValue}>
                {formatWaluty(sumaBrutto)}
              </Text>
            </View>
          </View>
        </View>

        {/* === 6. STOPKA (Notka) === */}
        <Text style={styles.footer}>
          Oferta jest ważna przez 30 dni od daty wystawienia. Podane ceny są
          cenami netto, do których należy doliczyć podatek VAT ({daneOferty.vat}
          %). Czas realizacji: 14 dni roboczych od momentu akceptacji oferty.
        </Text>
      </Page>
    </Document>
  );
};
