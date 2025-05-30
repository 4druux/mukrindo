from scipy.cluster.hierarchy import linkage, fcluster
import numpy as np
from config.app_config import LINKAGE_METHOD, DISTANCE_METRIC, CLUSTER_CRITERION, NUM_CLUSTERS

def perform_clustering(feature_matrix):
    """Melakukan hierarchical clustering."""
    if feature_matrix is None or feature_matrix.shape[0] < 2:
        print("Data tidak cukup untuk clustering (diperlukan minimal 2 sampel).")
        return np.array([i + 1 for i in range(feature_matrix.shape[0])]) if feature_matrix is not None and feature_matrix.shape[0] > 0 else np.array([])

    print(f"Melakukan linkage dengan metode: {LINKAGE_METHOD}, metrik: {DISTANCE_METRIC}")
    linked_matrix = linkage(feature_matrix, method=LINKAGE_METHOD, metric=DISTANCE_METRIC)
    
    cluster_labels = None
    if CLUSTER_CRITERION == 'maxclust':
        actual_num_clusters = min(NUM_CLUSTERS, feature_matrix.shape[0])
        if feature_matrix.shape[0] == 1: # Kasus khusus jika hanya 1 sampel
            actual_num_clusters = 1
        elif feature_matrix.shape[0] > 1 and actual_num_clusters >= feature_matrix.shape[0] :
             # fcluster dengan k >= n sampel akan error, jadi batasi k < n
             actual_num_clusters = feature_matrix.shape[0] -1 if feature_matrix.shape[0] > 1 else 1

        if actual_num_clusters < 1: actual_num_clusters = 1
        print(f"Menentukan cluster berdasarkan 'maxclust' dengan target {NUM_CLUSTERS} cluster (aktual: {actual_num_clusters}).")
        cluster_labels = fcluster(linked_matrix, actual_num_clusters, criterion='maxclust')
    # elif CLUSTER_CRITERION == 'distance':
    #     print(f"Menentukan cluster berdasarkan 'distance' dengan threshold {DISTANCE_THRESHOLD}.")
    #     cluster_labels = fcluster(linked_matrix, DISTANCE_THRESHOLD, criterion='distance')
    else:
        raise ValueError(f"Kriteria cluster tidak dikenal: {CLUSTER_CRITERION}")
        
    return cluster_labels