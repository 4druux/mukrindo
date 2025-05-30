# mukrindo/python_clustering/main.py
import pandas as pd
from data_processing.preparer import fetch_product_data, preprocess_data
from clustering.model import perform_clustering
from database.updater import update_product_clusters, generate_and_store_recommendations
import time
import traceback # Untuk logging error yang lebih detail

def run_recommendation_pipeline():
    start_time = time.time()
    print(f"Memulai pipeline sistem rekomendasi pada {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(start_time))}...")

    try:
        # 1. Ambil Data
        print("\n--- Tahap 1: Mengambil Data Produk ---")
        df_products_raw = fetch_product_data()
        if df_products_raw.empty:
            print("Tidak ada data produk tersedia dari database. Pipeline dihentikan.")
            return
        print(f"Berhasil mengambil {len(df_products_raw)} produk dari database.")

        # 2. Preprocessing Data
        print("\n--- Tahap 2: Preprocessing Data ---")
        processed_features, product_ids_original_str, display_info_df = preprocess_data(df_products_raw)
        
        if processed_features is None or processed_features.shape[0] == 0 :
            print("Preprocessing tidak menghasilkan fitur. Pipeline dihentikan.")
            return
        if not product_ids_original_str:
            print("Tidak ada ID produk yang valid setelah preprocessing. Pipeline dihentikan.")
            return
            
        print(f"Preprocessing selesai. Bentuk matriks fitur: {processed_features.shape}. Jumlah ID produk: {len(product_ids_original_str)}")

        # 3. Clustering
        print("\n--- Tahap 3: Melakukan Hierarchical Clustering ---")
        cluster_labels = perform_clustering(processed_features)
        
        if cluster_labels is None or len(cluster_labels) == 0:
            print("Clustering tidak menghasilkan label yang valid. Pipeline dihentikan.")
            return
        if len(product_ids_original_str) != len(cluster_labels):
            print(f"Error Kritis: Jumlah ID produk ({len(product_ids_original_str)}) tidak cocok dengan jumlah label cluster ({len(cluster_labels)}). Pipeline dihentikan.")
            return
            
        num_unique_clusters = len(set(cluster_labels))
        print(f"Clustering selesai. {num_unique_clusters} cluster unik terbentuk untuk {len(cluster_labels)} produk.")

        # Gabungkan hasil untuk penyimpanan dan logging
        results_df = display_info_df.copy()
        results_df['product_id'] = product_ids_original_str 
        results_df['cluster_id'] = cluster_labels
        
        print("\nContoh hasil clustering (5 baris pertama):")
        print(results_df.head())

        # 4. Update Database
        print("\n--- Tahap 4: Memperbarui Database ---")
        print("Memperbarui cluster ID di koleksi produk utama...")
        update_product_clusters(product_ids_original_str, cluster_labels)
        
        print("Menghasilkan dan menyimpan rekomendasi produk ke koleksi terpisah...")
        generate_and_store_recommendations(results_df)

        end_time = time.time()
        print(f"\nPipeline sistem rekomendasi berhasil diselesaikan pada {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(end_time))}.")
        print(f"Total waktu eksekusi: {end_time - start_time:.2f} detik.")

    except Exception as e:
        print("\n--- ERROR DALAM PIPELINE ---")
        print(f"Terjadi error pada pipeline sistem rekomendasi: {e}")
        print("Traceback:")
        print(traceback.format_exc())
        print("Pipeline dihentikan karena error.")

if __name__ == '__main__':
    run_recommendation_pipeline()