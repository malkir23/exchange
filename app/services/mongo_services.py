def from_mongo_to_doc(document):
    document["_id"] = str(document["_id"])
    return document
