# python_clustering/data_processing/preparer.py

import pandas as pd
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

# === DAFTAR FITUR FINAL YANG SANGAT CERDAS ===
NUMERIC_FEATURES = ['price', 'yearOfAssembly', 'cc', 'travelDistance', 'numberOfSeats'] # <-- DITAMBAHKAN DI SINI
CATEGORICAL_FEATURES = ['type', 'brand', 'transmission', 'fuelType']
# ============================================

class DataPreparer:
    def __init__(self, data):
        """
        Inisialisasi dengan data produk mentah dari MongoDB.
        """
        self.data = data.copy()
        
        # Saring fitur yang benar-benar ada di dataframe untuk menghindari error
        self.numeric_features = [f for f in NUMERIC_FEATURES if f in self.data.columns]
        self.categorical_features = [f for f in CATEGORICAL_FEATURES if f in self.data.columns]

    def prepare_data(self):
        """
        Membersihkan, memproses, dan mengubah data menjadi format numerik 
        yang siap untuk clustering.
        """
        print("Mempersiapkan data dengan fitur yang lebih lengkap...")
        
        # --- Langkah 1: Membersihkan Data ---
        # Untuk fitur numerik, isi nilai yang hilang dengan nilai tengah (median)
        for col in self.numeric_features:
            self.data[col] = pd.to_numeric(self.data[col], errors='coerce').fillna(self.data[col].median())
        
        # Untuk fitur kategorikal, isi nilai yang hilang dengan 'Unknown'
        for col in self.categorical_features:
            self.data[col] = self.data[col].fillna('Unknown').astype(str)

        # Pastikan tidak ada kolom yang hilang setelah pembersihan
        if not self.numeric_features or not self.categorical_features:
            print("Peringatan: Fitur numerik atau kategorikal tidak ditemukan. Proses tidak dapat dilanjutkan.")
            return pd.DataFrame()

        # --- Langkah 2: Membuat Pipeline Preprocessing ---
        # Pipeline untuk fitur numerik: Scaling
        numeric_transformer = StandardScaler()

        # Pipeline untuk fitur kategorikal: One-Hot Encoding
        categorical_transformer = OneHotEncoder(handle_unknown='ignore')

        # Gabungkan kedua pipeline menggunakan ColumnTransformer
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', numeric_transformer, self.numeric_features),
                ('cat', categorical_transformer, self.categorical_features)
            ],
            remainder='passthrough'
        )

        # --- Langkah 3: Terapkan Pipeline ke Data ---
        print(f"Memproses {len(self.numeric_features)} fitur numerik dan {len(self.categorical_features)} fitur kategorikal.")
        processed_data = preprocessor.fit_transform(self.data)
        
        if hasattr(processed_data, "toarray"):
            processed_data = processed_data.toarray()

        # Buat dataframe dari data yang sudah diproses
        cat_feature_names = preprocessor.named_transformers_['cat'].get_feature_names_out(self.categorical_features)
        all_feature_names = self.numeric_features + list(cat_feature_names)
        
        processed_df = pd.DataFrame(processed_data, columns=all_feature_names, index=self.data.index)

        # Tambahkan kembali kolom _id untuk referensi saat update database
        processed_df['_id'] = self.data['_id']
        
        print("Data berhasil dipersiapkan untuk clustering cerdas.")
        return processed_df