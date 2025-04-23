const conf = {
    appwriteUrl: import.meta.env.VITE_APP_URL,
    appwriteProjectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    appwriteDatabaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    appwriteCollectionId: import.meta.env.VITE_APPWRITE_COLLECTION_ID,
};

console.log("Appwrite URL:", conf.appwriteUrl);
console.log("Appwrite Project ID:", conf.appwriteProjectId);
console.log("Appwrite Database ID:", conf.appwriteDatabaseId);
console.log("Appwrite Collection ID:", conf.appwriteCollectionId);

export default conf;
