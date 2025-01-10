// Language settings
const messages = {
    hu: {
        emptyPassword: "Kérlek, add meg a jelszót!",
        incorrectPassword: "Hibás jelszó. Próbáld újra!",
        success: "Sikeres bejelentkezés!",
        noPasswordSet: "Nincs beállítva jelszó. Kérlek, állítsd be először a jelszót!",
        errorWhileLogin: "Hiba történt a bejelentkezés során!",
        unlockButton: "Feloldás",
        placeholder: "Írd be a jelszót"
    },
    en: {
        emptyPassword: "Please enter your password!",
        incorrectPassword: "Incorrect password. Try again!",
        success: "Login successful!",
        noPasswordSet: "No password is set. Please set a password first!",
        errorWhileLogin: "An error occurred!",
        unlockButton: "Unlock",
        placeholder: "Enter password"
    },
    de: {
        emptyPassword: "Bitte geben Sie das Passwort ein!",
        incorrectPassword: "Falsches Passwort. Versuchen Sie es erneut!",
        success: "Erfolgreiche Anmeldung!",
        noPasswordSet: "Kein Passwort festgelegt. Bitte zuerst ein Passwort festlegen!",
        errorWhileLogin: "Beim Anmelden ist ein Fehler aufgetreten!",
        unlockButton: "Entsperren",
        placeholder: "Passwort eingeben"
    },
    da: {
        emptyPassword: "Indtast venligst din adgangskode!",
        incorrectPassword: "Forkert adgangskode. Prøv igen!",
        success: "Login succesfuld!",
        noPasswordSet: "Ingen adgangskode er indstillet. Indstil venligst først en adgangskode!",
        errorWhileLogin: "Der er opstået en fejl!",
        unlockButton: "Lås op",
        placeholder: "Indtast adgangskode"
    },
    es: {
        emptyPassword: "¡Por favor, ingresa tu contraseña!",
        incorrectPassword: "Contraseña incorrecta. ¡Intenta de nuevo!",
        success: "¡Inicio de sesión exitoso!",
        noPasswordSet: "¡No se ha configurado una contraseña! ¡Por favor, configura una primero!",
        errorWhileLogin: "¡Se ha producido un error!",
        unlockButton: "Desbloquear",
        placeholder: "Introducir contraseña"
    },
    fr: {
        emptyPassword: "Veuillez entrer votre mot de passe!",
        incorrectPassword: "Mot de passe incorrect. Essayez à nouveau!",
        success: "Connexion réussie!",
        noPasswordSet: "Aucun mot de passe n'est défini. Veuillez d'abord définir un mot de passe!",
        errorWhileLogin: "Une erreur s'est produite!",
        unlockButton: "Déverrouiller",
        placeholder: "Entrez le mot de passe"
    }
};


// Detecting language (Default English)
const userLanguage = navigator.language.startsWith('hu') ? 'hu' :
                     navigator.language.startsWith('da') ? 'da' :
                     navigator.language.startsWith('es') ? 'es' :
                     navigator.language.startsWith('fr') ? 'fr' : 'en';
const lang = messages[userLanguage] || messages['en'];

/* Diable dev events */
function disableDevToolsAndRightClick(event) {
    // Jobb kattintás letiltása
    if (event.button === 2) {
        event.preventDefault(); // Disablie mouse right click
        return false;
    }

    // F12 letiltása
    if (event.key === "F12") {
        event.preventDefault(); // Disable F12
        return false;
    }

    // Disable Ctrl+Shift+I vagy Ctrl+Shift+J
    if ((event.ctrlKey && event.shiftKey && (event.key === "I" || event.key === "J")) || 
        (event.ctrlKey && event.key === "U")) {
        event.preventDefault();
        return false;
    }
}

// Események hozzárendelése
document.addEventListener('contextmenu', disableDevToolsAndRightClick); // Disable right click
document.addEventListener('keydown', disableDevToolsAndRightClick); // Disable keys
document.getElementById('login').addEventListener('click', async () => {
    await login(); // Várjuk meg, hogy a login befejeződjön
});

document.getElementById('pass').addEventListener('keydown', async function(event) {
    if (event.key === "Enter") {
        await login(); // Várjuk meg, hogy a login befejeződjön
    }
});

window.onload = function() {
    document.getElementById('pass').focus(); // focus on pass input field
    document.getElementById('pass').placeholder = lang.placeholder;

    // Setting the button language according to browsers language
    const loginButton = document.getElementById('login');
    loginButton.textContent = lang.unlockButton || 'Unlock'; // Default to English if no language found

};


/* Login function */
async function login() {
    const enteredPassword = document.getElementById('pass').value;
    const errorMessage = document.getElementById('error-message');

    // Check if the field is empty
    errorMessage.style.display = 'none';

    // Check the field is not empty
    if (!enteredPassword) {
        errorMessage.textContent = lang.emptyPassword;
        errorMessage.style.display = 'block';
        return;
    }

    // Verify password based on stored value
    chrome.storage.local.get(['key'], async (result) => {
        const storedHashedPassword = result.key;

        if (storedHashedPassword === undefined) {
            errorMessage.textContent = lang.noPasswordSet;
            errorMessage.style.display = 'block';
            return;
        }

        // Hasheljük az input jelszót
        const hashedEnteredPassword = await hashPassword(enteredPassword);

        // Összehasonlítjuk a hashelt input jelszót a tárolt hashelt jelszóval
        if (hashedEnteredPassword === storedHashedPassword) {
            // If the password is correct, we notify background.js
            chrome.runtime.sendMessage({ action: "removeListener" }, (response) => {
                if (response && response.success) {
                    errorMessage.textContent = lang.success;
                    errorMessage.style.display = 'block';
                    window.close(); // Close login tab
                } else {
                    errorMessage.textContent = lang.errorWhileLogin;
                    errorMessage.style.display = 'block';
                }
            });
        } else {
            // In case of incorrect password
            errorMessage.textContent = lang.incorrectPassword;
            errorMessage.style.display = 'block';
        }
    });
}

// Jelszó hashelése SHA-256-al
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data); // SHA-256 hash
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // byte tömb
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex; // hexadecimális string
}
