// Események hozzárendelése
document.addEventListener('contextmenu', disableDevToolsAndRightClick); // Jobb kattintás letiltása
document.addEventListener('keydown', disableDevToolsAndRightClick); // Billentyűk letiltása
document.getElementById('login').addEventListener('click', login);
document.getElementById('pass').addEventListener('keydown', function(event) {
    if (event.key === "Enter") {
        login();
    }
});

window.onload = function() {
    document.getElementById('pass').focus(); // focus on pass input field
}

// Nyelvi beállítások
const messages = {
    hu: {
        emptyPassword: "Kérlek, add meg a jelszót!",
        incorrectPassword: "Hibás jelszó. Próbáld újra!",
        success: "Sikeres bejelentkezés!",
        noPasswordSet: "Nincs beállítva jelszó. Kérlek, állítsd be először a jelszót!"
    },
    en: {
        emptyPassword: "Please enter your password!",
        incorrectPassword: "Incorrect password. Try again!",
        success: "Login successful!",
        noPasswordSet: "No password is set. Please set a password first!"
    },
    da: {
        emptyPassword: "Indtast venligst din adgangskode!",
        incorrectPassword: "Forkert adgangskode. Prøv igen!",
        success: "Login succesfuld!",
        noPasswordSet: "Ingen adgangskode er indstillet. Indstil venligst først en adgangskode!"
    },
    es: {
        emptyPassword: "¡Por favor, ingresa tu contraseña!",
        incorrectPassword: "Contraseña incorrecta. ¡Intenta de nuevo!",
        success: "¡Inicio de sesión exitoso!",
        noPasswordSet: "¡No se ha configurado una contraseña! ¡Por favor, configura una primero!"
    },
    fr: {
        emptyPassword: "Veuillez entrer votre mot de passe!",
        incorrectPassword: "Mot de passe incorrect. Essayez à nouveau!",
        success: "Connexion réussie!",
        noPasswordSet: "Aucun mot de passe n'est défini. Veuillez d'abord définir un mot de passe!"
    }
};

// Nyelv detektálása (alapértelmezett angol)
const userLanguage = navigator.language.startsWith('hu') ? 'hu' :
                     navigator.language.startsWith('da') ? 'da' :
                     navigator.language.startsWith('es') ? 'es' :
                     navigator.language.startsWith('fr') ? 'fr' : 'en';
const lang = messages[userLanguage] || messages['en'];

/* Diable dev events */
function disableDevToolsAndRightClick(event) {
    // Jobb kattintás letiltása
    if (event.button === 2) {
        event.preventDefault(); // Leállítja a jobb klikket
        return false;
    }

    // F12 letiltása
    if (event.key === "F12") {
        event.preventDefault(); // Leállítja a F12 billentyűt
        return false;
    }

    // Ctrl+Shift+I vagy Ctrl+Shift+J letiltása
    if ((event.ctrlKey && event.shiftKey && (event.key === "I" || event.key === "J")) || 
        (event.ctrlKey && event.key === "U")) {
        event.preventDefault();
        return false;
    }
}


/* Login function */
function login() {
    const enteredPassword = document.getElementById('pass').value;
    const errorMessage = document.getElementById('error-message');

    // Hibaüzenet törlése, ha volt
    errorMessage.style.display = 'none';

    // Ellenőrizzük, hogy a mező nincs üresen
    if (!enteredPassword) {
        errorMessage.textContent = lang.emptyPassword;
        errorMessage.style.display = 'block';
        return;
    }

    // Jelszó ellenőrzése a tárolt érték alapján
    chrome.storage.local.get(['key'], (result) => {
        const actualPassword = result.key;

        if (actualPassword === undefined) {
            errorMessage.textContent = lang.noPasswordSet;
            errorMessage.style.display = 'block';
            return;
        }

        if (enteredPassword === actualPassword) {
            // Ha a jelszó helyes, értesítjük a background.js-t
            chrome.runtime.sendMessage({ action: "removeListener" }, (response) => {
                // Ellenőrizd, hogy van válasz, és van benne success kulcs
                if (response && response.success) {
                    errorMessage.textContent = lang.success;
                    errorMessage.style.display = 'block';
                    
                    window.close(); // Login tab bezárása

                } else {
                    // Ha nem sikerült, akkor hibaüzenet
                    errorMessage.textContent = "Hiba történt a bejelentkezés során.";
                    errorMessage.style.display = 'block';
                }
            });
        } else {
            // Hibás jelszó esetén
            errorMessage.textContent = lang.incorrectPassword;
            errorMessage.style.display = 'block';
        }
    });
}

