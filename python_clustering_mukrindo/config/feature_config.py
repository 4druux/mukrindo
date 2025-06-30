# python_clustering_demo/config/feature_config.py

FEATURE_CONFIG = {
    'numerical': [
        # Bobot harga dinaikkan secara drastis untuk menekankan perbedaan kelas
        {'name': 'price', 'weight': 1.0},
        # Tahun perakitan sangat penting, pertahankan bobot tinggi
        {'name': 'yearOfAssembly', 'weight': 0.8},
        # Bobot CC juga penting untuk performa
        {'name': 'cc', 'weight': 0.6},
        # Jumlah kursi penting, tapi tidak sepenting harga/tahun
        {'name': 'numberOfSeats', 'weight': 0.5},
        # Jarak tempuh bobotnya lebih rendah
        {'name': 'travelDistance', 'weight': 0.3},
    ],
    'categorical': [
        # Tipe mobil (SUV, Sedan) adalah pembeda utama
        {'name': 'type', 'weight': 1.0},
        # TAMBAHKAN 'brand'. Merek sangat krusial.
        {'name': 'brand', 'weight': 0.9},
        {'name': 'driveSystem', 'weight': 0.4},
        {'name': 'transmission', 'weight': 0.2},
        {'name': 'fuelType', 'weight': 0.2},
    ]
}

# Daftar semua nama fitur yang akan diambil dari database berdasarkan FEATURE_CONFIG
ALL_FEATURE_NAMES = [feat['name'] for feat_list in FEATURE_CONFIG.values() for feat in feat_list]

if __name__ == '__main__':
    print("Feature Configuration:")
    print(FEATURE_CONFIG)
    print("\nAll feature names to fetch:")
    print(ALL_FEATURE_NAMES)