# python_clustering/data_processing/preparer.py

import pandas as pd
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer

# Konstanta untuk nama fitur, memudahkan pengelolaan
NUMERIC_FEATURES = ['price', 'yearOfAssembly', 'cc', 'travelDistance', 'numberOfSeats'] 
CATEGORICAL_FEATURES = ['model', 'type', 'brand', 'transmission', 'fuelType']

class DataPreparer:
    """
    Kelas untuk membersihkan, memproses, dan mengubah data mentah produk
    menjadi format numerik yang siap untuk di-cluster.
    """
    def __init__(self, data: pd.DataFrame):
        """Inisialisasi dengan data produk mentah (DataFrame)."""
        self.raw_data = data.copy()

    def _clean_data(self) -> pd.DataFrame:
        """
        Membersihkan data dengan menangani nilai yang hilang (missing values).
        """
        cleaned_data = self.raw_data.copy()
        
        # Validasi dan pembersihan fitur numerik
        for col in NUMERIC_FEATURES:
            if col in cleaned_data.columns:
                # Ubah ke numerik, ganti error dengan NaN, lalu isi NaN dengan median
                cleaned_data[col] = pd.to_numeric(cleaned_data[col], errors='coerce')
                median_value = cleaned_data[col].median()
                cleaned_data[col] = cleaned_data[col].fillna(median_value)

        # Validasi dan pembersihan fitur kategorikal
        for col in CATEGORICAL_FEATURES:
            if col in cleaned_data.columns:
                # Isi nilai yang hilang dengan 'Unknown'
                cleaned_data[col] = cleaned_data[col].fillna('Unknown').astype(str)

        return cleaned_data

    def process(self) -> pd.DataFrame:
        """
        Menjalankan pipeline pra-pemrosesan lengkap.
        
        Returns:
            pd.DataFrame: DataFrame yang telah diproses dan siap untuk clustering,
                          lengkap dengan kolom '_id' untuk referensi.
        """
        print("Mempersiapkan data untuk clustering...")
        
        data_to_process = self._clean_data()

        # Tentukan fitur yang benar-benar ada di data setelah pembersihan
        numeric_features_present = [f for f in NUMERIC_FEATURES if f in data_to_process.columns]
        categorical_features_present = [f for f in CATEGORICAL_FEATURES if f in data_to_process.columns]

        if not numeric_features_present or not categorical_features_present:
            print("Peringatan: Fitur numerik atau kategorikal tidak ditemukan. Proses tidak dapat dilanjutkan.")
            return pd.DataFrame()

        print(f"Memproses {len(numeric_features_present)} fitur numerik dan {len(categorical_features_present)} fitur kategorikal.")

        # Buat pipeline preprocessing
        numeric_transformer = StandardScaler()
        categorical_transformer = OneHotEncoder(handle_unknown='ignore')

        preprocessor = ColumnTransformer(
            transformers=[
                ('num', numeric_transformer, numeric_features_present),
                ('cat', categorical_transformer, categorical_features_present)
            ],
            remainder='drop' # 'drop' lebih aman daripada 'passthrough'
        )

        # Latih dan transformasikan data
        processed_data = preprocessor.fit_transform(data_to_process)

        # **PERBAIKAN BUG UTAMA ADA DI SINI**
        # Ambil nama kolom secara dinamis dari preprocessor setelah dilatih
        all_feature_names = preprocessor.get_feature_names_out()
        
        processed_df = pd.DataFrame(
            processed_data.toarray() if hasattr(processed_data, "toarray") else processed_data,
            columns=all_feature_names,
            index=data_to_process.index
        )
        
        # Tambahkan kembali kolom _id untuk referensi
        if '_id' in data_to_process:
            processed_df['_id'] = data_to_process['_id'].values

        print("Data berhasil dipersiapkan.")
        return processed_df