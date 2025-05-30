# Konfigurasi fitur dan bobotnya untuk clustering
# Sesuaikan bobot (weight) untuk mengontrol pengaruh masing-masing fitur
FEATURE_CONFIG = {
    'numerical': [
        {'name': 'price', 'weight': 0.35},
        {'name': 'yearOfAssembly', 'weight': 0.25},
        {'name': 'cc', 'weight': 0.15},
        {'name': 'travelDistance', 'weight': 0.1}, # Bobot lebih kecil jika kurang relevan untuk "sekelas"
        {'name': 'numberOfSeats', 'weight': 0.15}
    ],
    'categorical': [
        # Urutan penting untuk pipeline, pastikan ada di data produk Anda
        {'name': 'type', 'weight': 0.3},
        {'name': 'transmission', 'weight': 0.1},
        {'name': 'fuelType', 'weight': 0.1},
        {'name': 'driveSystem', 'weight': 0.1},
        # 'carColor' bisa ditambahkan jika dirasa penting untuk kesamaan kelas
    ]
}

# Daftar semua nama fitur yang akan diambil dari database berdasarkan FEATURE_CONFIG
ALL_FEATURE_NAMES = [feat['name'] for feat_list in FEATURE_CONFIG.values() for feat in feat_list]

if __name__ == '__main__':
    print("Feature Configuration:")
    print(FEATURE_CONFIG)
    print("\nAll feature names to fetch:")
    print(ALL_FEATURE_NAMES)