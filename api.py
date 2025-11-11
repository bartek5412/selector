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

        # 2. Wyodrębnij ścieżki i przekonwertuj je do formatu JSON
        raw_paths = page.get_drawings()
        json_paths = []
        # Zmienne do obliczenia zbiorczego prostokąta otaczającego cały napis
        min_x, min_y = float('inf'), float('inf')
        max_x, max_y = float('-inf'), float('-inf')
        for path in raw_paths:
            items = []
            for item in path.get("items", []):
                cmd = item[0]
                points_data = []
                for p in item[1:]:
                    if isinstance(p, fitz.Point):
                        points_data.append({'type': 'point', 'x': p.x, 'y': p.y})
                        # Aktualizuj granice prostokąta
                        if p.x < min_x: min_x = p.x
                        if p.y < min_y: min_y = p.y
                        if p.x > max_x: max_x = p.x
                        if p.y > max_y: max_y = p.y
                    elif isinstance(p, fitz.Rect):
                        points_data.append({'type': 'rect', 'x0': p.x0, 'y0': p.y0, 'x1': p.x1, 'y1': p.y1})
                        # Aktualizuj granice prostokąta dla prostokąta PDF
                        if p.x0 < min_x: min_x = p.x0
                        if p.y0 < min_y: min_y = p.y0
                        if p.x1 > max_x: max_x = p.x1
                        if p.y1 > max_y: max_y = p.y1
                items.append([cmd, *points_data])
            json_paths.append({'items': items})

        # 3. Oblicz prostokąt otaczający i jego wymiary/pole
        has_bbox = (min_x != float('inf') and min_y != float('inf') and max_x != float('-inf') and max_y != float('-inf'))
        bbox = None
        if has_bbox:
            width_pt = max(0.0, max_x - min_x)
            height_pt = max(0.0, max_y - min_y)
            area_pt2 = width_pt * height_pt
            width_mm = width_pt * PT_TO_MM
            height_mm = height_pt * PT_TO_MM
            area_mm2 = area_pt2 * (PT_TO_MM ** 2)
            bbox = {
                "x0": min_x,
                "y0": min_y,
                "x1": max_x,
                "y1": max_y,
                "width_pt": width_pt,
                "height_pt": height_pt,
                "area_pt2": area_pt2,
                "width_mm": width_mm,
                "height_mm": height_mm,
                "area_mm2": area_mm2
            }

        # 4. Zwróć dane do frontendu
        return jsonify({
            "pageImage": img_data_url,
            "paths": json_paths,
            "pageDimensions": {"width": page.rect.width, "height": page.rect.height},
            "textBoundingBox": bbox

        })
        

    except Exception as e:
        # Zwróć błąd serwera z informacją diagnostyczną
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


# =============================================================================
# ENDPOINT 2: OBLICZANIE DŁUGOŚCI NA PODSTAWIE KLIKNIĘCIA
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

        return jsonify({
            "closestPathIndex": closest_path_idx,
            "length_mm": length_mm
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