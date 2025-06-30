# python_clustering/data_processing/preparer.py

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
import sys
import os

# Menambahkan path ke root direktori proyek agar bisa impor modul config
# Sesuaikan jika struktur direktori Anda berbeda
try:
    from config.feature_config import FEATURE_CONFIG
except ImportError:
    # Fallback path jika dijalankan dari direktori lain
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(current_dir))
    sys.path.insert(0, project_root)
    from config.feature_config import FEATURE_CONFIG

# Ekstrak nama fitur dan bobot dari konfigurasi
NUMERIC_FEATURES = [f['name'] for f in FEATURE_CONFIG['numerical']]
CATEGORICAL_FEATURES = [f['name'] for f in FEATURE_CONFIG['categorical']]
FEATURE_WEIGHTS = {f['name']: f['weight'] for f_list in FEATURE_CONFIG.values() for f in f_list}

class DataPreparer:
    """
    Kelas untuk membersihkan, memproses, dan mengubah data mentah produk
    menjadi format numerik yang siap untuk di-cluster dengan pembobotan.
    """
    def __init__(self, data: pd.DataFrame):
        """Inisialisasi dengan data produk mentah (DataFrame)."""
        self.raw_data = data.copy()

    def _clean_data(self) -> pd.DataFrame:
        """
        Membersihkan data dengan menangani nilai yang hilang (missing values).
        """
        cleaned_data = self.raw_data.copy()
        
        for col in NUMERIC_FEATURES:
            if col in cleaned_data.columns:
                cleaned_data[col] = pd.to_numeric(cleaned_data[col], errors='coerce')
                median_value = cleaned_data[col].median()
                cleaned_data[col] = cleaned_data[col].fillna(median_value)

        for col in CATEGORICAL_FEATURES:
            if col in cleaned_data.columns:
                cleaned_data[col] = cleaned_data[col].fillna('Unknown').astype(str)

        return cleaned_data

    def _apply_log_transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Menerapkan transformasi logaritmik pada fitur yang memerlukannya."""
        log_transformed_data = data.copy()
        # HAPUS 'price' DARI DAFTAR INI. Biarkan harga dalam nilai aslinya.
        log_features = ['travelDistance'] 
        for col in log_features:
            if col in log_transformed_data.columns:
                # Tambah 1 untuk menghindari log(0)
                log_transformed_data[col] = np.log1p(log_transformed_data[col])
        return log_transformed_data

    def process(self) -> pd.DataFrame:
        """
        Menjalankan pipeline pra-pemrosesan lengkap termasuk pembobotan.
        """
        print("Mempersiapkan data untuk clustering...")
        
        cleaned_data = self._clean_data()
        log_transformed_data = self._apply_log_transform(cleaned_data)

        numeric_features_present = [f for f in NUMERIC_FEATURES if f in log_transformed_data.columns]
        categorical_features_present = [f for f in CATEGORICAL_FEATURES if f in log_transformed_data.columns]

        if not numeric_features_present or not categorical_features_present:
            print("Peringatan: Fitur numerik atau kategorikal tidak ditemukan.")
            return pd.DataFrame()

        print(f"Memproses {len(numeric_features_present)} fitur numerik dan {len(categorical_features_present)} fitur kategorikal.")

        numeric_transformer = StandardScaler()
        categorical_transformer = OneHotEncoder(handle_unknown='ignore')

        preprocessor = ColumnTransformer(
            transformers=[
                ('num', numeric_transformer, numeric_features_present),
                ('cat', categorical_transformer, categorical_features_present)
            ],
            remainder='drop'
        )

        processed_data = preprocessor.fit_transform(log_transformed_data)
        
        # Ambil nama fitur setelah preprocessing
        processed_feature_names = preprocessor.get_feature_names_out()

        processed_df = pd.DataFrame(
            processed_data.toarray() if hasattr(processed_data, "toarray") else processed_data,
            columns=processed_feature_names,
            index=log_transformed_data.index
        )
        
        # **PROSES PEMBOBOTAN FITUR**
        print("Menerapkan pembobotan pada fitur...")
        for feature_name in processed_feature_names:
            # Cari bobot asli dari nama fitur yang sudah di-encode
            # Contoh: 'cat__type_suv' akan menggunakan bobot dari 'type'
            original_feature = feature_name.split('__')[1].split('_')[0]
            if original_feature in FEATURE_WEIGHTS:
                weight = FEATURE_WEIGHTS[original_feature]
                processed_df[feature_name] *= weight

        if '_id' in log_transformed_data:
            processed_df['_id'] = log_transformed_data['_id'].values

        print("Data berhasil dipersiapkan dengan pembobotan.")
        return processed_df