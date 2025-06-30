# python_clustering_demo/main.py

import os
import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv
from bson import ObjectId
from collections import defaultdict
import traceback
import random

try:
    from data_processing.preparer import DataPreparer
    from clustering.model import Clusterer
    from database.updater import DatabaseUpdater
    CLUSTERING_MODULES_AVAILABLE = True
except ImportError as e:
    print(f"Peringatan: Salah satu modul clustering tidak ditemukan: {e}. Fitur clustering akan dilewati.")
    CLUSTERING_MODULES_AVAILABLE = False

from config.feature_config import ALL_FEATURE_NAMES

load_dotenv()

def connect_to_db():
    """Membuat koneksi ke database MongoDB."""
    try:
        uri = os.getenv("MONGO_URI")
        client = MongoClient(uri)
        db = client.get_database() 
        print("Koneksi ke MongoDB berhasil.")
        return db
    except Exception as e:
        print(f"Koneksi ke MongoDB gagal: {e}")
        return None

def get_products_from_db(db):
    """Mengambil data produk dari database, termasuk harga untuk pengurutan."""
    try:
        collection = db.products
        query_fields = {feat: 1 for feat in ALL_FEATURE_NAMES}
        query_fields['_id'] = 1
        query_fields['price'] = 1
        
        cursor = collection.find({}, query_fields)
        products_list = list(cursor)
        
        if not products_list:
            print("Tidak ada produk yang ditemukan di database.")
            return None
            
        df = pd.DataFrame(products_list)
        df['price'] = pd.to_numeric(df['price'])
        print(f"Berhasil mengambil {len(df)} produk dari database.")
        return df
    except Exception as e:
        print(f"Error saat mengambil produk dari DB: {e}")
        return None

def update_recommendations_in_db(db, recommendations_map):
    """Menyimpan rekomendasi berbasis clustering yang sudah terurut ke database."""
    if not recommendations_map:
        print("Tidak ada peta rekomendasi untuk disimpan.")
        return
    
    rec_type = "clustering-based"
    print(f"Menyimpan/memperbarui rekomendasi tipe '{rec_type}' di database...")
    collection = db.productrecommendations
    
    try:
        collection.delete_many({"type": rec_type})
        print(f"Rekomendasi lama dengan tipe '{rec_type}' berhasil dihapus.")

        docs_to_insert = []
        for product_id_str, rec_ids in recommendations_map.items():
            if not rec_ids:
                continue

            docs_to_insert.append({
                "productId": ObjectId(product_id_str),
                "recommendations": rec_ids,
                "type": rec_type,
                "lastUpdated": pd.Timestamp.now()
            })
        
        if docs_to_insert:
            collection.insert_many(docs_to_insert)
            print(f"Berhasil menyimpan {len(docs_to_insert)} dokumen rekomendasi tipe '{rec_type}' baru.")

    except Exception as e:
        print(f"Error saat memperbarui rekomendasi di DB: {e}")
        traceback.print_exc()

def main_pipeline():
    """Menjalankan pipeline rekomendasi clustering dengan pengurutan berdasarkan harga."""
    print("="*50)
    print("Memulai pipeline rekomendasi (Clustering + Pengurutan Harga)...")
    print("="*50)
    
    db = connect_to_db()
    if db is None: return

    products_df = get_products_from_db(db)
    if products_df is None or products_df.empty:
        print("Pipeline berhenti karena tidak ada data produk.")
        return

    # TAHAP 1: Menjalankan Clustering
    print("\n--- Tahap 1: Menjalankan Clustering Produk ---")
    clustered_data = None
    if CLUSTERING_MODULES_AVAILABLE:
        preparer = DataPreparer(products_df)
        prepared_data = preparer.process()

        if not prepared_data.empty:
            clusterer = Clusterer(prepared_data)
            clustered_data = clusterer.perform_clustering()
            
            updater = DatabaseUpdater(db)
            updater.update_products(clustered_data)
    else:
        print("Modul-modul untuk clustering tidak tersedia. Melewatkan.")

    # TAHAP 2: Membuat Rekomendasi dan Mengurutkan Berdasarkan Harga
    print("\n--- Tahap 2: Membuat dan Mengurutkan Rekomendasi dari Cluster ---")
    if clustered_data is not None and not clustered_data.empty:
        max_recs = int(os.getenv("MAX_RECOMMENDATIONS_PER_PRODUCT", 8))
        
        # Gabungkan hasil cluster dengan data produk asli untuk mendapatkan harga
        full_data = pd.merge(clustered_data, products_df[['_id', 'price']], on='_id')
        price_lookup = full_data.set_index('_id')['price'].to_dict()
        cluster_map = full_data.groupby('clusterId')['_id'].apply(list)
        
        recommendations_map = defaultdict(list)
        
        for _, product_ids in cluster_map.items():
            if len(product_ids) < 2:
                continue

            for source_id in product_ids:
                source_price = price_lookup.get(source_id)
                if source_price is None: continue

                # Ambil semua mobil lain dalam cluster
                potential_recs = [rec_id for rec_id in product_ids if rec_id != source_id]
                
                # Urutkan berdasarkan selisih harga absolut
                sorted_recs = sorted(potential_recs, 
                                     key=lambda rec_id: abs(price_lookup.get(rec_id, float('inf')) - source_price))
                
                recommendations_map[str(source_id)] = sorted_recs[:max_recs]
        
        print(f"Berhasil membuat & mengurutkan {len(recommendations_map)} peta rekomendasi.")
        update_recommendations_in_db(db, recommendations_map)
    else:
        print("Tidak ada data hasil clustering untuk dibuatkan rekomendasi.")

    print("\n" + "="*50)
    print("Pipeline rekomendasi cerdas selesai.")
    print("="*50)

if __name__ == '__main__':
    main_pipeline()