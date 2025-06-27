# python_clustering/main.py

import os
import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv
from bson import ObjectId
from collections import defaultdict
import traceback

# Impor modul lokal dengan penanganan error jika tidak ada
try:
    from data_processing.preparer import DataPreparer
    from clustering.model import Clusterer
    from database.updater import DatabaseUpdater
    CLUSTERING_MODULES_AVAILABLE = True
except ImportError:
    print("Peringatan: Modul clustering tidak ditemukan. Fitur fallback tidak akan berjalan.")
    CLUSTERING_MODULES_AVAILABLE = False


def connect_to_db():
    """Membuat koneksi ke database MongoDB."""
    load_dotenv()
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        print("Error: MONGO_URI tidak ditemukan di file .env")
        return None
        
    try:
        client = MongoClient(mongo_uri)
        db = client.get_database() 
        print(f"Berhasil terhubung ke database: {db.name}")
        return db
    except Exception as e:
        print(f"Gagal terhubung ke MongoDB: {e}")
        traceback.print_exc()
        return None

def get_products_from_db(db):
    """Mengambil semua data produk dari MongoDB."""
    try:
        products_cursor = db.products.find({})
        products_df = pd.DataFrame(list(products_cursor))
        
        if products_df.empty:
            print("Tidak ada data produk yang ditemukan.")
            return None
        
        print(f"Berhasil mengambil {len(products_df)} data produk.")
        return products_df
    except Exception as e:
        print(f"Error saat mengambil data produk: {e}")
        return None

def get_user_interactions(db):
    """Mengambil data interaksi 'view' untuk rekomendasi item-based."""
    try:
        query = {"interactionType": "view"}
        projection = {"_id": 0, "userId": 1, "productId": 1}
        interactions_cursor = db.userinteractions.find(query, projection)
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

def run_clustering_pipeline(db):
    """Menjalankan pipeline clustering sebagai sistem fallback."""
    if not CLUSTERING_MODULES_AVAILABLE:
        print("Melewatkan tahap clustering karena modul tidak tersedia.")
        return

    try:
        products_df = get_products_from_db(db)
        if products_df is None or products_df.empty:
            return

        preparer = DataPreparer(products_df)
        prepared_data = preparer.process()

        if prepared_data.empty:
            print("Data yang dipersiapkan kosong, clustering dihentikan.")
            return

        clusterer = Clusterer(prepared_data)
        clustered_data = clusterer.perform_clustering()
        
        updater = DatabaseUpdater(db)
        # **PERBAIKAN UTAMA ADA DI SINI**
        # Ganti nama metode menjadi 'update_products'
        updater.update_products(clustered_data)

    except Exception as e:
        print(f"Terjadi error pada tahap clustering: {e}")
        traceback.print_exc()


def run_item_based_recommendations(db):
    """Menjalankan pipeline rekomendasi personal (item-based)."""
    try:
        interactions_df = get_user_interactions(db)
        if interactions_df is None:
            print("Melewatkan rekomendasi personal karena tidak ada data interaksi.")
            return

        user_to_items_map = interactions_df.groupby('userId')['productId'].apply(list)
        
        co_occurrence_matrix = defaultdict(int)
        for items in user_to_items_map:
            for i in range(len(items)):
                for j in range(i + 1, len(items)):
                    item1, item2 = sorted([str(items[i]), str(items[j])])
                    co_occurrence_matrix[(item1, item2)] += 1
        
        print(f"Menemukan {len(co_occurrence_matrix)} pasangan produk yang dilihat bersamaan.")

        recommendations_map = defaultdict(list)
        for (item1, item2), score in co_occurrence_matrix.items():
            if score > 0:
                recommendations_map[item1].append((item2, score))
                recommendations_map[item2].append((item1, score))

        # Sort recommendations by score
        for item in recommendations_map:
            recommendations_map[item].sort(key=lambda x: x[1], reverse=True)
        
        print("Pembuatan peta rekomendasi selesai.")
        update_recommendations_in_db(db, recommendations_map)

    except Exception as e:
        print(f"Terjadi error pada tahap rekomendasi personal: {e}")
        traceback.print_exc()

def update_recommendations_in_db(db, recommendations_map):
    """Menghapus rekomendasi lama dan menyimpan yang baru."""
    if not recommendations_map:
        print("Tidak ada peta rekomendasi untuk disimpan.")
        return
    
    print("Menyimpan/memperbarui rekomendasi di database...")
    collection = db.productrecommendations
    
    try:
        collection.drop()
        print("Koleksi 'productrecommendations' lama berhasil dihapus.")

        docs_to_insert = [
            {
                "productId": ObjectId(product_id),
                "recommendations": [ObjectId(rec[0]) for rec in recs],
                "type": "item-based",
                "lastUpdated": pd.Timestamp.now()
            }
            for product_id, recs in recommendations_map.items()
        ]
        
        if docs_to_insert:
            collection.insert_many(docs_to_insert)
            print(f"Berhasil menyimpan {len(docs_to_insert)} dokumen rekomendasi baru.")
        else:
            print("Tidak ada dokumen rekomendasi yang perlu disimpan.")

    except Exception as e:
        print(f"Error saat memperbarui rekomendasi di DB: {e}")
        traceback.print_exc()

def main_pipeline():
    """Menjalankan seluruh pipeline rekomendasi."""
    print("="*50)
    print("Memulai pipeline rekomendasi...")
    print("="*50)
    
    db = connect_to_db()
    if db is None:
        print("Pipeline dihentikan karena koneksi database gagal.")
        return

    print("\n--- Tahap 1: Clustering Produk (Fallback System) ---")
    run_clustering_pipeline(db)
    
    print("\n--- Tahap 2: Rekomendasi Personal (Item-Based) ---")
    run_item_based_recommendations(db)

    print("\n" + "="*50)
    print("Pipeline rekomendasi selesai.")
    print("="*50)

if __name__ == "__main__":
    main_pipeline()