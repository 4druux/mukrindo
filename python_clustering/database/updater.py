# mukrindo/python_clustering/database/updater.py
from pymongo import MongoClient, UpdateOne
from bson import ObjectId
import pandas as pd 
from config.app_config import (
    MONGO_URI, 
    DATABASE_NAME, 
    PRODUCTS_COLLECTION, 
    RECOMMENDATIONS_COLLECTION, 
    MAX_RECOMMENDATIONS_PER_PRODUCT
)

def update_product_clusters(product_ids_str_list, cluster_labels):
    """
    Memperbarui field clusterId di koleksi produk MongoDB.
    """
    if not product_ids_str_list or len(product_ids_str_list) != len(cluster_labels):
        print("Error: Daftar ID produk dan label cluster tidak cocok jumlahnya atau kosong.")
        return

    client = None
    try:
        client = MongoClient(MONGO_URI)
        db = client[DATABASE_NAME]
        products_collection = db[PRODUCTS_COLLECTION]

        operations = []
        for i, product_id_str in enumerate(product_ids_str_list):
            try:
                mongo_id = ObjectId(product_id_str) 
                operations.append(
                    UpdateOne({'_id': mongo_id}, {'$set': {'clusterId': int(cluster_labels[i])}})
                )
            except Exception as e:
                print(f"Error: ID produk '{product_id_str}' tidak valid atau gagal membuat operasi update: {e}")
                continue

        if operations:
            print(f"Akan menjalankan {len(operations)} operasi update clusterId...")
            result = products_collection.bulk_write(operations)
            print(f"Update clusterId selesai. {result.matched_count} produk dicocokkan, {result.modified_count} produk diperbarui.")
        else:
            print("Tidak ada operasi update clusterId yang valid untuk dilakukan.")
            
    except Exception as e:
        print(f"Error koneksi atau operasi database saat update clusterId: {e}")
    finally:
        if client:
            client.close()
            print("Koneksi MongoDB (update_product_clusters) ditutup.")


def generate_and_store_recommendations(df_with_clusters):
    """
    Menghasilkan rekomendasi berdasarkan cluster dan menyimpannya ke koleksi terpisah.
    DataFrame input harus memiliki kolom 'product_id' (string) dan 'cluster_id' (int).
    """
    if df_with_clusters.empty or 'product_id' not in df_with_clusters.columns or 'cluster_id' not in df_with_clusters.columns:
        print("DataFrame untuk rekomendasi kosong atau tidak memiliki kolom 'product_id'/'cluster_id'.")
        return

    client = None
    try:
        client = MongoClient(MONGO_URI)
        db = client[DATABASE_NAME]
        recs_collection = db[RECOMMENDATIONS_COLLECTION]
        
        print(f"Menghapus rekomendasi lama dari koleksi '{RECOMMENDATIONS_COLLECTION}'...")
        delete_result = recs_collection.delete_many({})
        print(f"{delete_result.deleted_count} dokumen rekomendasi lama dihapus.")

        recommendations_to_insert = []
        df_with_clusters['product_id'] = df_with_clusters['product_id'].astype(str)

        for cluster_id_val in df_with_clusters['cluster_id'].unique():
            current_cluster_products_df = df_with_clusters[df_with_clusters['cluster_id'] == cluster_id_val]
            
            for _, product_row in current_cluster_products_df.iterrows():
                product_id_str = product_row['product_id']
                
                similar_products_df = current_cluster_products_df[current_cluster_products_df['product_id'] != product_id_str]
                
                recommended_ids_str_list = similar_products_df['product_id'].head(MAX_RECOMMENDATIONS_PER_PRODUCT).tolist()
                
                recommendations_to_insert.append({
                    'productId': product_id_str, 
                    'recommendedProductIds': recommended_ids_str_list, 
                    'clusterId': int(cluster_id_val),
                    'updatedAt': pd.Timestamp.now() # <-- PENGGUNAAN pd
                })

        if recommendations_to_insert:
            try:
                insert_result = recs_collection.insert_many(recommendations_to_insert)
                print(f"{len(insert_result.inserted_ids)} dokumen rekomendasi disimpan ke '{RECOMMENDATIONS_COLLECTION}'.")
            except Exception as e:
                print(f"Error selama insert_many untuk rekomendasi: {e}")
        else:
            print("Tidak ada rekomendasi yang dihasilkan untuk disimpan.")
            
    except Exception as e:
        print(f"Error koneksi atau operasi database saat generate/store rekomendasi: {e}")
    finally:
        if client:
            client.close()
            print("Koneksi MongoDB (generate_and_store_recommendations) ditutup.")

if __name__ == '__main__':
    print("Script ini dimaksudkan untuk diimpor sebagai modul.")