import fitz  # PyMuPDF
import math
import base64
import io
from flask import Flask, request, jsonify
from flask_cors import CORS

# Inicjalizacja aplikacji Flask
app = Flask(__name__)
CORS(app)

# Stała konwersji punktów (1/72 cala) na milimetry (1 cal = 25.4 mm)
PT_TO_MM = 25.4 / 72.0

# Domyślne DPI do renderowania obrazu strony
IMAGE_DPI = 150


@app.route("/", methods=["POST"])
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
