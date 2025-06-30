from pymongo import UpdateOne

class DatabaseUpdater:
    def __init__(self, db):
        self.db = db
        self.products_collection = self.db.products

    def update_products(self, clustered_data):
        print("Memperbarui clusterId di database...")
        if clustered_data.empty:
            print("Tidak ada data untuk diperbarui.")
            return

        updates = []
        for index, row in clustered_data.iterrows():
            updates.append(UpdateOne(
                {'_id': row['_id']},
                {'$set': {'clusterId': int(row['clusterId'])}}
            ))
        
        if updates:
            result = self.products_collection.bulk_write(updates)
            print(f"Database berhasil diperbarui. {result.modified_count} produk diubah.")
        else:
            print("Tidak ada pembaruan yang dilakukan.")