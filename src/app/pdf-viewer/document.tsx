import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Svg,
  Path,
  Rect,
} from "@react-pdf/renderer";
import type { PathData, PathPoint } from "@/types/path";

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
  // Podgląd ścieżki 2D
  pathPreview: {
    width: "100%",
    height: 180,
    backgroundColor: "#ffffff",
    border: "1px solid #e0e0e0",
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
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

// Funkcja formatująca walutę
const formatWaluty = (wartosc: number) => 
  `${wartosc.toFixed(2).replace(".", ",")} PLN`;

// Funkcja konwertująca pathData na komponenty SVG dla react-pdf
const renderPathPreview = (pathData: PathData | null) => {
  if (!pathData?.path?.items) return null;
  
  // Oblicz bbox dla skalowania
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  pathData.path.items.forEach((item) => {
    const points = item.slice(1);
    points.forEach((p: PathPoint) => {
      if (p?.type === "point") {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      } else if (p?.type === "rect") {
        if (p.x0 < minX) minX = p.x0;
        if (p.y0 < minY) minY = p.y0;
        if (p.x1 > maxX) maxX = p.x1;
        if (p.y1 > maxY) maxY = p.y1;
      }
    });
  });

  if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
    return null;
  }

  const widthPt = Math.max(0, maxX - minX);
  const heightPt = Math.max(0, maxY - minY);
  
  // Skalowanie do rozmiaru podglądu (180px wysokości, zachowując proporcje)
  const previewWidth = 500; // szerokość w punktach PDF
  const previewHeight = 150; // wysokość w punktach PDF
  const scaleX = previewWidth / widthPt;
  const scaleY = previewHeight / heightPt;
  const scale = Math.min(scaleX, scaleY) * 0.9; // 0.9 dla marginesu
  
  const offsetX = (previewWidth - widthPt * scale) / 2 - minX * scale;
  const offsetY = (previewHeight - heightPt * scale) / 2 - minY * scale;

  return (
    <Svg width={previewWidth} height={previewHeight} viewBox={`0 0 ${previewWidth} ${previewHeight}`}>
      {pathData.path.items.map((item, index: number) => {
        const [cmd, ...points] = item;
        
        if (cmd === "l") {
          // Linia
          const [p1, p2] = points;
          if (p1?.type === "point" && p2?.type === "point") {
            return (
              <Path
                key={index}
                d={`M ${p1.x * scale + offsetX} ${p1.y * scale + offsetY} L ${p2.x * scale + offsetX} ${p2.y * scale + offsetY}`}
                stroke="#000000"
                strokeWidth={1}
                fill="none"
              />
            );
          }
        } else if (cmd === "re") {
          // Prostokąt
          const [rect] = points;
          if (rect?.type === "rect") {
            return (
              <Rect
                key={index}
                x={rect.x0 * scale + offsetX}
                y={rect.y0 * scale + offsetY}
                width={(rect.x1 - rect.x0) * scale}
                height={(rect.y1 - rect.y0) * scale}
                stroke="#000000"
                strokeWidth={1}
                fill="none"
              />
            );
          }
        } else if (cmd === "c") {
          // Krzywa Beziera
          const [p0, p1, p2, p3] = points;
          if (p0?.type === "point" && p1?.type === "point" && p2?.type === "point" && p3?.type === "point") {
            return (
              <Path
                key={index}
                d={`M ${p0.x * scale + offsetX} ${p0.y * scale + offsetY} C ${p1.x * scale + offsetX} ${p1.y * scale + offsetY}, ${p2.x * scale + offsetX} ${p2.y * scale + offsetY}, ${p3.x * scale + offsetX} ${p3.y * scale + offsetY}`}
                stroke="#000000"
                strokeWidth={1}
                fill="none"
              />
            );
          }
        }
        return null;
      })}
    </Svg>
  );
};

// --- Komponent Dokumentu ---
// Definiujemy typ propsów dla pewności (opcjonalne, jeśli używasz JS, pomiń interface)
interface OfferProps {
  offerData: {
    components: Array<{ category: string; name: string; price: number }>;
    totalLength: number; // w mm
    text: string;
    finalPrice: number;
    creationDate: string;
    dimensions: string;
    pathData?: PathData; // Dodajemy opcjonalne pathData
  };
}

export const MojDokumentPDF = ({ offerData }: OfferProps) => {
  // Obliczenia
  // UWAGA: Logika ceny zależy od Twojego biznesu. 
  // W page.tsx liczysz: (suma opcji * długość) / 1000.
  // Tutaj wyświetlimy ceny jednostkowe opcji, a na dole sumę wyliczoną w page.tsx.
  
  const sumaNetto = offerData.finalPrice;
  const podatekVat = sumaNetto * 0.23;
  const sumaBrutto = sumaNetto + podatekVat;
  const dlugoscMetry = offerData.totalLength / 1000;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* === 1. NAGŁÓWEK === */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>TWOJA FIRMA</Text>
            <Text style={{ fontSize: 10, color: "#555" }}>Producent Reklam 3D</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text>Data: {offerData.creationDate}</Text>
            <Text>Projekt: {offerData.text}</Text>
          </View>
        </View>

        {/* === 2. TYTUŁ === */}
        <View style={styles.titleSection}>
          <View>
            <Text style={styles.title}>Specyfikacja zamówienia</Text>
            <Text style={{ fontSize: 11 }}>Wymiary całkowite: {offerData.dimensions}</Text>
            <Text style={{ fontSize: 11 }}>Długość obrysu (do wyceny): {offerData.totalLength.toFixed(0)} mm</Text>
          </View>
        </View>

        {/* === 3. PODGLĄD ŚCIEŻKI 2D === */}
        {offerData.pathData ? (
          <View style={styles.pathPreview}>
            {renderPathPreview(offerData.pathData)}
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>
              Brak podglądu ścieżki
            </Text>
          </View>
        )}

        {/* === 4. SPECYFIKACJA (Tabela dynamiczna) === */}
        <Text style={styles.sectionTitle}>Wybrane komponenty</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={{ ...styles.tableColHeader, ...styles.colDesc }}>
              Kategoria / Opcja
            </Text>
            <Text style={{ ...styles.tableColHeader, ...styles.colQty }}>
              Ilość
            </Text>
            <Text style={{ ...styles.tableColHeader, ...styles.colPrice }}>
              Cena bazowa
            </Text>
          </View>
          
          {/* Mapujemy po przekazanych komponentach */}
          {offerData.components.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={{ ...styles.tableCol, ...styles.colDesc }}>
                {item.category}: {item.name}
              </Text>
              <Text style={{ ...styles.tableCol, ...styles.colQty }}>
                1
              </Text>
              <Text style={{ ...styles.tableCol, ...styles.colPrice }}>
                {formatWaluty(item.price)}
              </Text>
            </View>
          ))}
           {/* Wiersz z mnożnikiem długości */}
           <View style={styles.tableRow}>
              <Text style={{ ...styles.tableCol, ...styles.colDesc}}>
                Mnożnik długości obrysu (metry)
              </Text>
              <Text style={{ ...styles.tableCol, ...styles.colQty }}>
                {dlugoscMetry.toFixed(3)} m
              </Text>
              <Text style={{ ...styles.tableCol, ...styles.colPrice }}>
                -
              </Text>
            </View>
        </View>

        {/* === 5. PODSUMOWANIE CENY === */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Suma netto:</Text>
              <Text style={styles.summaryValue}>{formatWaluty(sumaNetto)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Podatek VAT (23%):</Text>
              <Text style={styles.summaryValue}>{formatWaluty(podatekVat)}</Text>
            </View>
            <View
              style={{
                ...styles.summaryRow,
                ...styles.summaryTotal,
                borderBottomWidth: 0,
              }}
            >
              <Text style={styles.summaryLabel}>RAZEM BRUTTO:</Text>
              <Text style={styles.summaryValue}>{formatWaluty(sumaBrutto)}</Text>
            </View>
          </View>
        </View>

        {/* === 6. STOPKA === */}
        <Text style={styles.footer}>
          Wygenerowano automatycznie dla projektu &quot;{offerData.text}&quot;.
        </Text>
      </Page>
    </Document>
  );
};