import pandas as pd
from pymongo import MongoClient
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
import numpy as np
from config.app_config import MONGO_URI, DATABASE_NAME, PRODUCTS_COLLECTION
from config.feature_config import FEATURE_CONFIG, ALL_FEATURE_NAMES

def fetch_product_data():
    """Mengambil data produk dari MongoDB."""
    print(f"Mencoba menghubungkan ke MongoDB dengan URI: {MONGO_URI}")
    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    products_collection = db[PRODUCTS_COLLECTION]
    
    projection_fields = {
        "_id": 1, "carName": 1, "brand": 1, "model": 1, "variant": 1, "status": 1
    }
    for feature_name in ALL_FEATURE_NAMES:
        projection_fields[feature_name] = 1
            
    print(f"Mengambil produk (semua status untuk clustering awal) dengan proyeksi: {list(projection_fields.keys())}")
    # Ambil semua produk untuk clustering awal, status bisa difilter saat menampilkan rekomendasi
    products_cursor = products_collection.find({}, projection_fields)
    products_list = list(products_cursor)
    print(f"Jumlah produk yang ditemukan: {len(products_list)}")
    if len(products_list) > 0:
        print("Contoh produk pertama (mentah):", products_list[0])
        
    client.close()
    return pd.DataFrame(products_list)

def preprocess_data(df_input):
    """Melakukan preprocessing pada DataFrame produk."""
    if df_input.empty:
        print("DataFrame input kosong, tidak ada data untuk diproses.")
        return pd.DataFrame(), None, None

    df = df_input.copy() # Bekerja dengan salinan

    numerical_features = [f['name'] for f in FEATURE_CONFIG.get('numerical', []) if f['name'] in df.columns]
    categorical_features = [f['name'] for f in FEATURE_CONFIG.get('categorical', []) if f['name'] in df.columns]
    
    missing_numerical = [f for f in numerical_features if f not in df.columns]
    missing_categorical = [f for f in categorical_features if f not in df.columns]
    if missing_numerical:
        print(f"Peringatan: Fitur numerik berikut tidak ditemukan di DataFrame: {missing_numerical}")
    if missing_categorical:
        print(f"Peringatan: Fitur kategorikal berikut tidak ditemukan di DataFrame: {missing_categorical}")

    if not numerical_features and not categorical_features:
        print("Tidak ada fitur numerik atau kategorikal yang valid untuk diproses.")
        return pd.DataFrame(), df['_id'].astype(str).tolist(), df[['carName', 'brand', 'model', 'variant']].copy()


    product_ids_str = df['_id'].astype(str).tolist()
    display_info = df[['carName', 'brand', 'model', 'variant']].copy()
    
    df_features_for_processing = df[numerical_features + categorical_features].copy()

    transformers = []
    if numerical_features:
        numerical_pipeline = Pipeline([
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler())
        ])
        transformers.append(('num', numerical_pipeline, numerical_features))
    
    if categorical_features:
        categorical_pipeline = Pipeline([
            ('imputer', SimpleImputer(strategy='constant', fill_value='_MISSING_')), # Nilai placeholder yang lebih jelas
            ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
        ])
        transformers.append(('cat', categorical_pipeline, categorical_features))

    if not transformers:
         print("Tidak ada transformer yang dibuat (tidak ada fitur numerik atau kategorikal).")
         return pd.DataFrame(), product_ids_str, display_info

    preprocessor = ColumnTransformer(transformers=transformers, remainder='drop')

    try:
         df_processed_unweighted = preprocessor.fit_transform(df_features_for_processing)
    except ValueError as e:
        print(f"Error selama fit_transform: {e}")
        print("DataFrame yang menyebabkan error:")
        print(df_features_for_processing.info())
        print(df_features_for_processing.head())
        return pd.DataFrame(), product_ids_str, display_info


    feature_names_out = preprocessor.get_feature_names_out()
    weighted_df_processed = np.array(df_processed_unweighted, dtype=float).copy()


    # Terapkan pembobotan
    current_col_idx = 0
    if numerical_features:
         num_weights = [f['weight'] for f in FEATURE_CONFIG.get('numerical', []) if f['name'] in numerical_features]
         for i in range(len(numerical_features)): # Menggunakan panjang dari numerical_features yang ada
             weighted_df_processed[:, current_col_idx + i] *= num_weights[i]
         current_col_idx += len(numerical_features)
    
    if categorical_features:
         cat_config_map = {f['name']: f['weight'] for f in FEATURE_CONFIG.get('categorical', [])}
         for i, feature_name_out in enumerate(feature_names_out):
             if feature_name_out.startswith('cat__'): # Cek apakah ini kolom hasil one-hot
                 original_cat_feature = feature_name_out.split('__')[1].split('_')[0]
                 if original_cat_feature in cat_config_map:
                     # Terapkan bobot hanya jika kolom one-hot ini milik fitur kategorikal yang ada di config
                      if current_col_idx + i < weighted_df_processed.shape[1]: # Penyesuaian indeks
                         target_col_index = -1
                         # Cari indeks yang benar dari feature_names_out yang sesuai
                         for k_idx, k_name in enumerate(feature_names_out):
                             if k_name == feature_name_out:
                                 target_col_index = k_idx
                                 break
                         if target_col_index != -1:
                             weighted_df_processed[:, target_col_index] *= cat_config_map[original_cat_feature]
    
    return weighted_df_processed, product_ids_str, display_info