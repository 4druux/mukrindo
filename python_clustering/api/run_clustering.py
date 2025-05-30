from http.server import BaseHTTPRequestHandler
import sys
import os

# Tambahkan path ke modul-modul Anda
# Sesuaikan kedalaman path relatif terhadap lokasi file handler ini
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir) # Ini akan menunjuk ke python_clustering
sys.path.insert(0, project_root)

from main import run_recommendation_pipeline # Impor fungsi pipeline dari main.py

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            print("Menerima permintaan GET untuk menjalankan job clustering...")
            run_recommendation_pipeline() # Panggil fungsi utama Anda
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status": "Clustering job executed successfully"}')
            print("Job clustering berhasil dieksekusi melalui Serverless Function.")
        except Exception as e:
            print(f"Error saat menjalankan job clustering: {e}")
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(f'{{"status": "Error executing clustering job", "error": "{str(e)}"}}'.encode())
        return