const firebaseConfig = {
  apiKey: "AIzaSyCEDyWLam4JwXnZeu-ZWRuqa6n-TSHV9OM",
  authDomain: "cargoxpresscorp.firebaseapp.com",
  databaseURL: "https://cargoxpresscorp-default-rtdb.firebaseio.com",
  projectId: "cargoxpresscorp",
  storageBucket: "cargoxpresscorp.firebasestorage.app",
  messagingSenderId: "628613386852",
  appId: "1:628613386852:web:701a474f1773ae35118571",
  measurementId: "G-V2QKXDYKNG"
};

function isFirebaseConfigured(config = firebaseConfig) {
    return Object.values(config).every(function (value) {
        return typeof value === "string" && value.length > 0 && value.indexOf("TU_") === -1;
    });
}

export { firebaseConfig, isFirebaseConfigured };
