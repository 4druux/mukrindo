# python_clustering/main.py

import os
import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv
from bson import ObjectId
from collections import defaultdict
import traceback # Import untuk error handling yang lebih baik

# --- Bagian yang sudah ada (pastikan file-file ini ada) ---
# Jika file-file ini belum ada, kita akan buat versi sederhananya
try:
    from data_processing.preparer import DataPreparer
    from clustering.model import Clusterer
    from database.updater import DatabaseUpdater
except ImportError:
    print("Peringatan: Beberapa modul lokal (preparer, clusterer, updater) tidak ditemukan. Fungsi clustering tidak akan berjalan.")
    # Sediakan class placeholder jika file tidak ada, agar tidak terjadi error saat import
    class DataPreparer: pass
    class Clusterer: pass
    class DatabaseUpdater: pass

# --- Fungsi Koneksi ke Database ---
def connect_to_db():
    """Membuat koneksi ke database MongoDB."""
    try:
        load_dotenv()
        mongo_uri = os.getenv("MONGO_URI")
        if not mongo_uri:
            print("Error: MONGO_URI tidak ditemukan di file .env")
            return None
        client = MongoClient(mongo_uri)
        # Verifikasi koneksi dengan mencoba mendapatkan nama database
        db = client.get_database() 
        print(f"Berhasil terhubung ke database: {db.name}")
        return db
    except Exception as e:
        print(f"Gagal terhubung ke MongoDB: {e}")
        traceback.print_exc()
        return None

# --- Fungsi untuk Pipeline Clustering (Sistem Lama/Fallback) ---
def fetch_products(db):
    """Mengambil data produk dari MongoDB untuk clustering."""
    try:
        print("Mengambil data produk untuk clustering...")
        products_cursor = db.products.find({}, {"name": 1, "price": 1, "year": 1, "cc": 1, "type": 1})
        products_df = pd.DataFrame(list(products_cursor))
        if products_df.empty:
            print("Tidak ada data produk yang ditemukan untuk clustering.")
            return None
        print(f"Berhasil mengambil {len(products_df)} data produk.")
        return products_df
    except Exception as e:
        print(f"Error saat mengambil data produk: {e}")
        return None

# --- Fungsi untuk Pipeline Rekomendasi Personal (Sistem Baru) ---

def fetch_user_interactions(db):
    """Mengambil data interaksi 'view' dari koleksi userinteractions."""
    try:
        print("Mengambil data interaksi pengguna...")
        query = {"interactionType": "view"}
        
        interactions_cursor = db.userinteractions.find(query, {"_id": 0, "userId": 1, "productId": 1})
        interactions_df = pd.DataFrame(list(interactions_cursor))

        if interactions_df.empty:
            print("Tidak ada data interaksi 'view' yang ditemukan.")
            return None

        interactions_df.drop_duplicates(inplace=True)
        print(f"Berhasil mengambil {len(interactions_df)} data interaksi unik.")
        return interactions_df
    except Exception as e:
        print(f"Error saat mengambil data interaksi: {e}")
        return None


def generate_item_based_recommendations(interactions_df):
    """
    Menghasilkan rekomendasi berdasarkan kemiripan item (mobil).
    """
    if interactions_df is None or interactions_df.empty:
        return {}

    print("Memulai pembuatan rekomendasi item-based...")
    
    interactions_df['userId'] = interactions_df['userId'].astype(str)
    interactions_df['productId'] = interactions_df['productId'].astype(str)

    user_to_items_map = interactions_df.groupby('userId')['productId'].apply(list).to_dict()

    co_occurrence_matrix = defaultdict(int)
    
    for user, items in user_to_items_map.items():
        for i in range(len(items)):
            for j in range(i + 1, len(items)):
                item1, item2 = sorted([items[i], items[j]])
                co_occurrence_matrix[(item1, item2)] += 1

    print(f"Menemukan {len(co_occurrence_matrix)} pasangan produk yang dilihat bersamaan.")

    recommendations = defaultdict(list)
    for (item1, item2), score in co_occurrence_matrix.items():
        if score > 0:
            recommendations[item1].append((item2, score))
            recommendations[item2].append((item1, score))

    sorted_recommendations = {}
    for item, recs in recommendations.items():
        recs.sort(key=lambda x: x[1], reverse=True)
        sorted_recommendations[item] = recs
    
    print("Pembuatan peta rekomendasi selesai.")
    return sorted_recommendations


def update_recommendations_in_db(db, recommendations_map):
    """Menghapus rekomendasi lama dan menyimpan yang baru ke koleksi 'productrecommendations'."""
    if not recommendations_map:
        print("Tidak ada peta rekomendasi untuk disimpan.")
        return
    
    print("Menyimpan/memperbarui rekomendasi di database...")
    collection = db.productrecommendations
    
    try:
        collection.drop()
        print("Koleksi 'productrecommendations' lama berhasil dihapus.")

        docs_to_insert = []
        for product_id_str, recs in recommendations_map.items():
            recommended_ids = [ObjectId(rec[0]) for rec in recs[:10]]
            
            doc = {
                "productId": ObjectId(product_id_str),
                "recommendations": recommended_ids,
                "type": "item-based",
                "lastUpdated": pd.Timestamp.now()
            }
            docs_to_insert.append(doc)
        
        if docs_to_insert:
            collection.insert_many(docs_to_insert)
            print(f"Berhasil menyimpan {len(docs_to_insert)} dokumen rekomendasi baru.")
        else:
            print("Tidak ada dokumen rekomendasi yang perlu disimpan.")

    except Exception as e:
        print(f"Error saat memperbarui rekomendasi di DB: {e}")
        traceback.print_exc()

# --- Fungsi Utama untuk Menjalankan Semua Proses ---
def run_recommendation_pipeline():
    """Menjalankan seluruh pipeline, dari data fetching hingga update database."""
    print("="*50)
    print("Memulai pipeline rekomendasi...")
    print("="*50)
    
    db = connect_to_db()
    # ==================== PERBAIKAN DI SINI ====================
    if db is None:
    # =========================================================
        print("Pipeline dihentikan karena koneksi database gagal.")
        return

    # --- Bagian 1: Clustering (Sistem Fallback) ---
    print("\n--- Tahap 1: Clustering Produk (Fallback System) ---")
    try:
        products_df = fetch_products(db)
        # Memeriksa apakah modul clustering ada sebelum mencoba menggunakannya
        if products_df is not None and not products_df.empty and 'DataPreparer' in globals() and 'Clusterer' in globals() and 'DatabaseUpdater' in globals():
            preparer = DataPreparer(products_df)
            prepared_data = preparer.prepare_data()
            
            clusterer = Clusterer(prepared_data)
            clustered_data = clusterer.perform_clustering()
            
            updater = DatabaseUpdater(db)
            updater.update_products(clustered_data)
        else:
            print("Melewatkan tahap clustering.")
    except Exception as e:
        print(f"Terjadi error pada tahap clustering: {e}")


    # --- Bagian 2: Rekomendasi Personal (Sistem Utama) ---
    print("\n--- Tahap 2: Rekomendasi Personal (Item-Based) ---")
    try:
        interactions_df = fetch_user_interactions(db)
        if interactions_df is not None:
            recommendations_map = generate_item_based_recommendations(interactions_df)
            update_recommendations_in_db(db, recommendations_map)
        else:
            print("Melewatkan tahap rekomendasi personal karena tidak ada data interaksi.")
    except Exception as e:
        print(f"Terjadi error pada tahap rekomendasi personal: {e}")
        traceback.print_exc()


    print("\n" + "="*50)
    print("Pipeline rekomendasi selesai.")
    print("="*50)


if __name__ == "__main__":
    run_recommendation_pipeline()