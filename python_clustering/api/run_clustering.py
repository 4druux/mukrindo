# -*- coding: utf-8 -*-
import os
import sys
import time
import schedule
import requests
from dotenv import load_dotenv


load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
BACKEND_URL = os.getenv("VERCEL_BACKEND_URL")
API_KEY = os.getenv("BACKEND_API_KEY")

if not MONGO_URI or not API_KEY or not BACKEND_URL:
    print("FATAL ERROR: MONGO_URI, BACKEND_URL, atau API_KEY tidak ditemukan di .env.")
    sys.exit(1)

if "<" in MONGO_URI or ">" in MONGO_URI:
    print(f"FATAL ERROR: MONGO_URI sepertinya masih placeholder: {MONGO_URI}")
    sys.exit(1)

try:
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    sys.path.insert(0, project_root)
    from main import main_pipeline
except ImportError as e:
    print(f"FATAL ERROR: Gagal mengimpor 'main_pipeline' dari main.py: {e}")
    sys.exit(1)


def kirim_notifikasi_log(status, pesan, detail=None):
    """Mengirimkan log status (sukses/gagal) ke endpoint di backend."""
    log_endpoint = f"{BACKEND_URL}/api/logs/clustering"
    
    headers = {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
    }
    
    payload = {
        "source": "vps_clustering_worker",
        "status": status,
        "message": pesan,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime()),
        "details": detail or {}
    }
    
    try:
        print(f"INFO: Mengirim notifikasi '{status}' ke backend...")
        response = requests.post(log_endpoint, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        print("INFO: Notifikasi log berhasil dikirim.")
    except requests.exceptions.RequestException as e:
        print(f"ERROR: Gagal mengirim notifikasi log ke backend: {e}")


def jalankan_job_clustering():
    """Fungsi pembungkus yang dieksekusi oleh scheduler."""
    timestamp_mulai = time.time()
    print(f"[{time.ctime()}] ====== MEMULAI JOB CLUSTERING ======")
    
    try:
        hasil = main_pipeline()
        
        durasi = time.time() - timestamp_mulai
        pesan_sukses = f"Job clustering selesai dalam {durasi:.2f} detik."
        print(f"[{time.ctime()}] {pesan_sukses}")
        
        kirim_notifikasi_log(
            status="sukses", 
            pesan=pesan_sukses,
            detail=hasil
        )

    except Exception as e:
        durasi = time.time() - timestamp_mulai
        pesan_gagal = f"Job clustering GAGAL setelah {durasi:.2f} detik."
        print(f"[{time.ctime()}] ERROR: {pesan_gagal}")
        print(f"[{time.ctime()}] Detail Galat: {e}", file=sys.stderr)
        
        kirim_notifikasi_log(
            status="gagal", 
            pesan=str(e)
        )
    finally:
        print(f"[{time.ctime()}] ====== JOB CLUSTERING SELESAI ======\n")



if __name__ == "__main__":
    print("===================================================")
    print("      Clustering Worker Scheduler Dimulai")
    print(f"      Waktu Saat Ini: {time.ctime()}")
    print("===================================================")
    
    schedule.every(1).hour.do(jalankan_job_clustering)
    print("INFO: Pekerjaan dijadwalkan untuk berjalan setiap 1 jam.")
    
    print("INFO: Menjalankan job pertama kali saat startup...")
    jalankan_job_clustering()
    
    while True:
        try:
            schedule.run_pending()
            time.sleep(60)
        except KeyboardInterrupt:
            print("\nINFO: Proses dihentikan oleh pengguna (Ctrl+C). Selamat tinggal!")
            sys.exit(0)