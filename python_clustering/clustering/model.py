from sklearn.cluster import AgglomerativeClustering

class Clusterer:
    def __init__(self, data):
        self.data = data.copy()
        # Menggunakan Agglomerative Clustering
        self.model = AgglomerativeClustering(n_clusters=None, distance_threshold=2.0, linkage='ward')

    def perform_clustering(self):
        print("Melakukan clustering pada produk...")
        # Pisahkan _id sebelum clustering
        ids = self.data['_id']
        features = self.data.drop('_id', axis=1)
        
        # Lakukan clustering
        self.data['clusterId'] = self.model.fit_predict(features)
        
        # Tambahkan kembali _id
        self.data['_id'] = ids
        
        print(f"Clustering selesai. Ditemukan {self.data['clusterId'].nunique()} cluster.")
        return self.data[['_id', 'clusterId']]