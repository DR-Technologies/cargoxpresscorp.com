import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import { getAdminFlag, getFirebaseServices } from "./admin-data.js";

function loginWithEmailPassword(email, password) {
    const services = getFirebaseServices();
    return signInWithEmailAndPassword(services.auth, email, password);
}

function logoutCurrentUser() {
    const services = getFirebaseServices();
    return signOut(services.auth);
}

function observeAdminSession(handlers) {
    const services = getFirebaseServices();
    return onAuthStateChanged(services.auth, async function (user) {
        if (!user) {
            handlers.onSignedOut();
            return;
        }

        try {
            const isAdmin = await getAdminFlag(user.uid);
            if (isAdmin) {
                handlers.onAuthorized(user);
                return;
            }

            handlers.onDenied(user);
        } catch (error) {
            handlers.onError(error);
        }
    });
}

export { loginWithEmailPassword, logoutCurrentUser, observeAdminSession };
