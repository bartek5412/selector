import fitz  # PyMuPDF
import math
import base64
import io
from flask import Flask, request, jsonify
from flask_cors import CORS

# =============================================================================
# KONFIGURACJA I STAŁE
# =============================================================================

# Inicjalizacja aplikacji Flask
app = Flask(__name__)
# Umożliwia komunikację z frontendem (np. Next.js) działającym na innym porcie
CORS(app)

# Stała konwersji punktów (1/72 cala) na milimetry (1 cal = 25.4 mm)
PT_TO_MM = 25.4 / 72.0

# Współczynniki do precyzyjnego obliczania długości krzywej Béziera
GAUSS_LEGENDRE_COEFFS = {
    5: {
        'x': [-0.9061798459, -0.5384693101, 0.0, 0.5384693101, 0.9061798459],
        'w': [0.2369268850, 0.4786286705, 0.5688888889, 0.4786286705, 0.2369268850]
    }
}
# Domyślne DPI do renderowania obrazu strony
IMAGE_DPI = 150


# =============================================================================
# FUNKCJE GEOMETRYCZNE I OBLICZENIOWE (przeniesione z logiki Tkinter)
# =============================================================================

def distance_point_to_segment(p, v, w):
    """Oblicza najkrótszą odległość od punktu p do segmentu linii vw."""
    vw_x = w.x - v.x
    vw_y = w.y - v.y
    l2 = vw_x**2 + vw_y**2
    if l2 == 0.0:
        return p.distance_to(v)
    t = max(0, min(1, ((p.x - v.x) * vw_x + (p.y - v.y) * vw_y) / l2))
    projection = fitz.Point(v.x + t * vw_x, v.y + t * vw_y)
    return p.distance_to(projection)

def flatten_bezier_for_distance(p0, p1, p2, p3, num_segments=20):
    """Generuje punkty na krzywej Béziera w układzie PDF."""
    points = []
    for i in range(num_segments + 1):
        t = i / num_segments
        omt = 1 - t
        x = (omt**3 * p0.x) + (3 * omt**2 * t * p1.x) + (3 * omt * t**2 * p2.x) + (t**3 * p3.x)
        y = (omt**3 * p0.y) + (3 * omt**2 * t * p1.y) + (3 * omt * t**2 * p2.y) + (t**3 * p3.y)
        points.append(fitz.Point(x, y))
    return points

def bezier_arc_length(p0, p1, p2, p3, n=5):
    """Oblicza długość łuku sześciennej krzywej Béziera."""
    coeffs = GAUSS_LEGENDRE_COEFFS[n]
    x_coords, weights = coeffs['x'], coeffs['w']
    
    A_x = p3.x - 3 * p2.x + 3 * p1.x - p0.x
    B_x = 3 * (p2.x - 2 * p1.x + p0.x)
    C_x = 3 * (p1.x - p0.x)
    A_y = p3.y - 3 * p2.y + 3 * p1.y - p0.y
    B_y = 3 * (p2.y - 2 * p1.y + p0.y)
    C_y = 3 * (p1.y - p0.y)

    length = 0.0
    for i in range(n):
        t = 0.5 * (1.0 + x_coords[i])
        dx_dt = (A_x * t + B_x) * t + C_x # Powinno być 3*A*t^2 + 2*B*t + C
        dy_dt = (A_y * t + B_y) * t + C_y # ale to jest pochodna wielomianu, a nie wielomianu Béziera
        # Użyjemy poprawnego wzoru na pochodną
        dx_dt = 3 * A_x * t**2 + 2 * B_x * t + C_x
        dy_dt = 3 * A_y * t**2 + 2 * B_y * t + C_y
        length += weights[i] * math.sqrt(dx_dt**2 + dy_dt**2)
        
    return 0.5 * length

def calculate_path_length(path_data):
    """Oblicza całkowitą długość geometryczną ścieżki (w punktach PDF)."""
    total_length = 0.0
    for item in path_data.get("items", []):
        cmd = item[0]
        points = item[1:]
        
        if cmd == "l":
            p1, p2 = points
            total_length += p1.distance_to(p2)
        elif cmd == "re":
            rect = points[0]
            total_length += 2 * (rect.width + rect.height)
        elif cmd == "c":
            p0, p1, p2, p3 = points
            total_length += bezier_arc_length(p0, p1, p2, p3)
    return total_length


# =============================================================================
# ENDPOINT 1: PRZETWARZANIE PLIKU PDF
# =============================================================================

@app.route("/api/process-pdf", methods=["POST"])
def process_pdf():
    """
    Przyjmuje plik PDF, zwraca obraz pierwszej strony (Base64)
    i dane o ścieżkach w formacie JSON.
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        pdf_bytes = file.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        if doc.page_count == 0:
             return jsonify({"error": "PDF is empty"}), 400
        
        page = doc[0]

        # 1. Renderuj stronę do obrazu PNG i zakoduj go w Base64
        pix = page.get_pixmap(dpi=IMAGE_DPI)
        img_buffer = io.BytesIO(pix.tobytes("png"))
        base64_img = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
        img_data_url = f"data:image/png;base64,{base64_img}"

        # 2. Wyodrębnij ścieżki i przekonwertuj je do formatu JSON z lepszą obsługą dziur
        raw_paths = page.get_drawings()
        json_paths = []
        
        for path in raw_paths:
            items = []
            # Konwertuj rect na słownik jeśli istnieje
            rect_data = None
            if path.get('rect'):
                rect = path.get('rect')
                rect_data = {
                    'x0': rect.x0,
                    'y0': rect.y0,
                    'x1': rect.x1,
                    'y1': rect.y1
                }
            
            path_info = {
                'items': items,
                'fill': path.get('fill', True),  # Informacja o wypełnieniu
                'stroke': path.get('stroke', False),  # Informacja o obrysie
                'evenodd': path.get('evenodd', False),  # Reguła wypełnienia evenodd
                'closePath': path.get('closePath', False),  # Czy ścieżka jest domknięta
                'rect': rect_data,  # Prostokąt ograniczający ścieżkę
            }
            
            
            for item in path.get("items", []):
                try:
                    cmd = item[0]
                    points_data = []
                    for p in item[1:]:
                        if isinstance(p, fitz.Point):
                            points_data.append({'type': 'point', 'x': p.x, 'y': p.y})
                        elif isinstance(p, fitz.Rect):
                            points_data.append({'type': 'rect', 'x0': p.x0, 'y0': p.y0, 'x1': p.x1, 'y1': p.y1})
                        else:
                            # Obsługa innych typów punktów - pomiń nieznane typy
                            continue
                    items.append([cmd, *points_data])
                except Exception as e:
                    print(f"Błąd podczas przetwarzania elementu ścieżki: {e}")
                    print(f"Problemowy element: {item}")
                    continue
            
            # Dodaj informację o domknięciu ścieżki jeśli nie jest domknięta
            if items and not path_info['closePath']:
                try:
                    # Sprawdź czy ostatni punkt jest taki sam jak pierwszy
                    if len(items) > 0:
                        first_item = items[0]
                        last_item = items[-1]
                        
                        # Jeśli pierwszy element to "m" (moveTo), sprawdź czy ostatni element kończy się w tym samym miejscu
                        if first_item[0] == "m" and len(first_item) > 1 and len(last_item) > 1:
                            first_point = first_item[1]
                            last_point = last_item[-1] if last_item[0] in ["l", "c", "v", "y"] else last_item[1]
                            
                            if (first_point['type'] == 'point' and last_point['type'] == 'point' and
                                abs(first_point['x'] - last_point['x']) < 0.1 and
                                abs(first_point['y'] - last_point['y']) < 0.1):
                                path_info['closePath'] = True
                except Exception as e:
                    print(f"Błąd podczas sprawdzania domknięcia ścieżki: {e}")
                    # Kontynuuj bez sprawdzania domknięcia
            
            json_paths.append(path_info)

        # 3. Zwróć dane do frontendu
        return jsonify({
            "pageImage": img_data_url,
            "paths": json_paths,
            "pageDimensions": {"width": page.rect.width, "height": page.rect.height}
        })

    except Exception as e:
        # Zwróć błąd serwera z informacją diagnostyczną
        import traceback
        print(f"Błąd podczas przetwarzania PDF: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


# =============================================================================
# ENDPOINT 2: PRZETWARZANIE ŚCIEŻKI Z OBSŁUGĄ DZIUR
# =============================================================================

@app.route("/api/process-path", methods=["POST"])
def process_path():
    """
    Przyjmuje dane ścieżki i zwraca przetworzoną ścieżkę z obsługą dziur
    i lepszą geometrią dla modelowania 3D.
    """
    data = request.get_json()
    path_data = data.get('path')
    
    if not path_data:
        return jsonify({"error": "Missing path data"}), 400
    
    try:
        # Przetwórz ścieżkę z obsługą dziur i złożonych kształtów
        processed_path = process_path_with_holes(path_data)
        
        return jsonify({
            "processedPath": processed_path,
            "hasHoles": processed_path.get('hasHoles', False),
            "isClosed": processed_path.get('isClosed', False),
            "complexity": processed_path.get('complexity', 'simple')
        })
        
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

def process_path_with_holes(path_data):
    """
    Przetwarza ścieżkę z obsługą dziur i złożonych kształtów.
    """
    items = path_data.get('items', [])
    fill = path_data.get('fill', True)
    evenodd = path_data.get('evenodd', False)
    
    # Analizuj ścieżkę aby wykryć dziury
    has_holes = detect_holes(items, evenodd)
    
    # Sprawdź czy ścieżka jest domknięta
    is_closed = check_path_closure(items)
    
    # Określ złożoność ścieżki
    complexity = determine_complexity(items, has_holes)
    
    # Przetwórz elementy ścieżki
    processed_items = []
    for item in items:
        cmd = item[0]
        points = item[1:]
        
        if cmd == "l":  # Linia
            processed_items.append(process_line(points))
        elif cmd == "c":  # Krzywa Béziera
            processed_items.append(process_bezier(points))
        elif cmd == "re":  # Prostokąt
            processed_items.append(process_rectangle(points))
        elif cmd == "m":  # MoveTo
            processed_items.append(process_moveto(points))
        else:
            processed_items.append(item)
    
    return {
        'items': processed_items,
        'hasHoles': has_holes,
        'isClosed': is_closed,
        'complexity': complexity,
        'fill': fill,
        'evenodd': evenodd
    }

def detect_holes(items, evenodd):
    """
    Wykrywa czy ścieżka ma dziury na podstawie analizy geometrii.
    """
    if not items:
        return False
    
    # Prosta heurystyka - jeśli mamy wiele niezależnych konturów,
    # prawdopodobnie są to dziury
    contour_count = 0
    for item in items:
        if item[0] == "m":  # MoveTo oznacza nowy kontur
            contour_count += 1
    
    return contour_count > 1 or evenodd

def check_path_closure(items):
    """
    Sprawdza czy ścieżka jest domknięta.
    """
    if len(items) < 2:
        return False
    
    first_item = items[0]
    last_item = items[-1]
    
    if first_item[0] == "m" and len(first_item) > 1:
        first_point = first_item[1]
        
        # Znajdź ostatni punkt w ostatnim elemencie
        last_point = None
        if last_item[0] in ["l", "c", "v", "y"] and len(last_item) > 1:
            last_point = last_item[-1]
        elif len(last_item) > 1:
            last_point = last_item[1]
        
        if last_point and first_point['type'] == 'point' and last_point['type'] == 'point':
            # Sprawdź czy punkty są blisko siebie
            distance = math.sqrt(
                (first_point['x'] - last_point['x'])**2 + 
                (first_point['y'] - last_point['y'])**2
            )
            return distance < 1.0  # Tolerancja 1 punkt
    
    return False

def determine_complexity(items, has_holes):
    """
    Określa złożoność ścieżki.
    """
    if has_holes:
        return "complex"
    
    bezier_count = sum(1 for item in items if item[0] == "c")
    if bezier_count > 5:
        return "complex"
    elif bezier_count > 0:
        return "moderate"
    else:
        return "simple"

def process_line(points):
    """
    Przetwarza element linii.
    """
    if len(points) >= 2:
        p1, p2 = points[0], points[1]
        return ["l", p1, p2]
    return ["l", *points]

def process_bezier(points):
    """
    Przetwarza element krzywej Béziera.
    """
    if len(points) >= 4:
        return ["c", *points[:4]]
    return ["c", *points]

def process_rectangle(points):
    """
    Przetwarza element prostokąta.
    """
    if len(points) >= 1:
        return ["re", points[0]]
    return ["re", *points]

def process_moveto(points):
    """
    Przetwarza element MoveTo.
    """
    if len(points) >= 1:
        return ["m", points[0]]
    return ["m", *points]

def validate_path(path_data):
    """
    Waliduje ścieżkę i zwraca informacje o problemach.
    """
    issues = []
    warnings = []
    
    items = path_data.get('items', [])
    
    if not items:
        issues.append("Ścieżka nie zawiera żadnych elementów")
        return {"valid": False, "issues": issues, "warnings": warnings}
    
    # Sprawdź czy ścieżka ma elementy MoveTo
    has_moveto = any(item[0] == "m" for item in items)
    if not has_moveto:
        warnings.append("Ścieżka nie zaczyna się od MoveTo - może być problem z pozycjonowaniem")
    
    # Sprawdź czy ścieżka jest domknięta
    is_closed = check_path_closure(items)
    if not is_closed:
        warnings.append("Ścieżka nie jest domknięta - może powodować problemy w renderowaniu 3D")
    
    # Sprawdź czy ścieżka ma dziury
    has_holes = detect_holes(items, path_data.get('evenodd', False))
    if has_holes:
        warnings.append("Ścieżka ma dziury - wymaga specjalnej obsługi w modelowaniu 3D")
    
    # Sprawdź czy ścieżka ma wystarczającą liczbę punktów
    total_points = sum(len(item) - 1 for item in items if len(item) > 1)
    if total_points < 3:
        issues.append("Ścieżka ma za mało punktów do poprawnego renderowania")
    
    # Sprawdź czy ścieżka ma krzywe Béziera
    bezier_count = sum(1 for item in items if item[0] == "c")
    if bezier_count > 10:
        warnings.append("Ścieżka ma wiele krzywych Béziera - może być trudna do renderowania")
    
    return {
        "valid": len(issues) == 0,
        "issues": issues,
        "warnings": warnings,
        "is_closed": is_closed,
        "has_holes": has_holes,
        "complexity": determine_complexity(items, has_holes)
    }

# =============================================================================
# ENDPOINT 3: WALIDACJA ŚCIEŻEK
# =============================================================================

@app.route("/api/validate-path", methods=["POST"])
def validate_path_endpoint():
    """
    Waliduje ścieżkę i zwraca informacje o problemach.
    """
    data = request.get_json()
    path_data = data.get('path')
    
    if not path_data:
        return jsonify({"error": "Missing path data"}), 400
    
    try:
        validation_result = validate_path(path_data)
        return jsonify(validation_result)
        
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

# =============================================================================
# ENDPOINT 4: OBLICZANIE DŁUGOŚCI NA PODSTAWIE KLIKNIĘCIA
# =============================================================================

@app.route("/api/get-length", methods=["POST"])
def get_length():
    """
    Przyjmuje dane o ścieżkach i współrzędne kliknięcia.
    Znajduje najbliższą ścieżkę i zwraca jej długość.
    """
    data = request.get_json()
    paths_json = data.get('paths')
    click_json = data.get('click')
    
    if not paths_json or not click_json:
        return jsonify({"error": "Missing paths or click data"}), 400

    click_point_pdf = fitz.Point(click_json['x'], click_json['y'])
    
    # Próg odległości (w punktach PDF)
    distance_threshold = 10.0
    min_dist = float('inf')
    closest_path_idx = -1

    # Odtwarzamy obiekty fitz z danych JSON, aby użyć funkcji geometrycznych
    for i, path_json in enumerate(paths_json):
        if not path_json.get("items"):
            continue

        # Sprawdź czy ścieżka ma dziury - jeśli tak, może być bardziej skomplikowana
        has_holes = path_json.get("hasHoles", False)
        is_closed = path_json.get("isClosed", False)
        
        for item_json in path_json["items"]:
            cmd = item_json[0]
            points_json = item_json[1:]
            
            dist = float('inf')
            try:
                if cmd == "l":
                    p1 = fitz.Point(points_json[0]['x'], points_json[0]['y'])
                    p2 = fitz.Point(points_json[1]['x'], points_json[1]['y'])
                    dist = distance_point_to_segment(click_point_pdf, p1, p2)
                elif cmd == "re":
                    rect = fitz.Rect(points_json[0]['x0'], points_json[0]['y0'], points_json[0]['x1'], points_json[0]['y1'])
                    d1 = distance_point_to_segment(click_point_pdf, rect.tl, rect.tr)
                    d2 = distance_point_to_segment(click_point_pdf, rect.tr, rect.br)
                    d3 = distance_point_to_segment(click_point_pdf, rect.br, rect.bl)
                    d4 = distance_point_to_segment(click_point_pdf, rect.bl, rect.tl)
                    dist = min(d1, d2, d3, d4)
                elif cmd == "c":
                    p0 = fitz.Point(points_json[0]['x'], points_json[0]['y'])
                    p1 = fitz.Point(points_json[1]['x'], points_json[1]['y'])
                    p2 = fitz.Point(points_json[2]['x'], points_json[2]['y'])
                    p3 = fitz.Point(points_json[3]['x'], points_json[3]['y'])
                    points_on_bezier = flatten_bezier_for_distance(p0, p1, p2, p3)
                    min_dist_on_bezier = float('inf')
                    for j in range(len(points_on_bezier) - 1):
                        d_seg = distance_point_to_segment(click_point_pdf, points_on_bezier[j], points_on_bezier[j+1])
                        if d_seg < min_dist_on_bezier:
                            min_dist_on_bezier = d_seg
                    dist = min_dist_on_bezier
            except Exception:
                continue

            if dist < min_dist:
                min_dist = dist
                closest_path_idx = i

    if closest_path_idx != -1 and min_dist < distance_threshold:
        # Oblicz długość znalezionej ścieżki
        path_to_calc_json = paths_json[closest_path_idx]
        
        # Odtwórz obiekty fitz dla tej jednej ścieżki
        path_data_fitz = {'items': []}
        for item_json in path_to_calc_json.get("items", []):
            cmd = item_json[0]
            points_json = item_json[1:]
            points_fitz = []
            for p_json in points_json:
                if p_json['type'] == 'point':
                    points_fitz.append(fitz.Point(p_json['x'], p_json['y']))
                elif p_json['type'] == 'rect':
                    points_fitz.append(fitz.Rect(p_json['x0'], p_json['y0'], p_json['x1'], p_json['y1']))
            path_data_fitz['items'].append(tuple([cmd, *points_fitz]))
            
        length_pt = calculate_path_length(path_data_fitz)
        length_mm = length_pt * PT_TO_MM

        # Dodaj informacje o ścieżce i walidację
        selected_path = paths_json[closest_path_idx]
        validation_result = validate_path(selected_path)
        
        return jsonify({
            "closestPathIndex": closest_path_idx,
            "length_mm": length_mm,
            "hasHoles": selected_path.get("hasHoles", False),
            "isClosed": selected_path.get("isClosed", False),
            "complexity": selected_path.get("complexity", "simple"),
            "validation": validation_result
        })
    else:
        # Nie znaleziono ścieżki wystarczająco blisko
        return jsonify({
            "closestPathIndex": -1,
            "length_mm": None
        })

# =============================================================================
# URUCHOMIENIE SERWERA
# =============================================================================

if __name__ == "__main__":
    # Uruchom serwer na porcie 5001 w trybie debugowania
    app.run(debug=True, port=5001)