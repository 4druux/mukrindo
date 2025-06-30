# python_clustering_demo/clustering/model.py

from sklearn.cluster import AgglomerativeClustering

class Clusterer:
    def __init__(self, data):
        self.data = data.copy()
        self.model = AgglomerativeClustering(
            n_clusters=None,
            distance_threshold=4.5, 
            linkage='ward'
        ) 

    def perform_clustering(self):
        print("Melakukan clustering pada produk...")
        ids = self.data['_id']
        features = self.data.drop('_id', axis=1)
        
        self.data['clusterId'] = self.model.fit_predict(features)
        
        self.data['_id'] = ids
        
        print(f"Clustering selesai. Ditemukan {self.data['clusterId'].nunique()} cluster.")
        return self.data[['_id', 'clusterId']]