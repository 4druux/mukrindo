from dotenv import load_dotenv
import os

# Muat variabel dari .env di direktori root python_clustering
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env') 
load_dotenv(dotenv_path)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DATABASE_NAME = os.getenv("DATABASE_NAME", "demo-showroom") 
PRODUCTS_COLLECTION = os.getenv("PRODUCTS_COLLECTION", "products")
RECOMMENDATIONS_COLLECTION = os.getenv("RECOMMENDATIONS_COLLECTION", "product_recommendations")

# Parameter Hierarchical Clustering dari .env atau default
LINKAGE_METHOD = os.getenv('LINKAGE_METHOD', 'ward')
DISTANCE_METRIC = os.getenv('DISTANCE_METRIC', 'euclidean')
CLUSTER_CRITERION = os.getenv('CLUSTER_CRITERION', 'maxclust')
NUM_CLUSTERS = int(os.getenv("NUM_CLUSTERS", 10)) # Default 10 jika tidak diset
MAX_RECOMMENDATIONS_PER_PRODUCT = int(os.getenv("MAX_RECOMMENDATIONS_PER_PRODUCT", 5))

# Untuk debugging, pastikan variabel terbaca dengan benar
if __name__ == '__main__':
    print(f"MONGO_URI: {MONGO_URI}")
    print(f"DATABASE_NAME: {DATABASE_NAME}")
    print(f"PRODUCTS_COLLECTION: {PRODUCTS_COLLECTION}")
    print(f"NUM_CLUSTERS: {NUM_CLUSTERS}")