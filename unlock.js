// Language settings
const messages = {
    hu: {
        emptyPassword: "Kérlek, add meg a jelszót!",
        incorrectPassword: "Hibás jelszó. Próbáld újra!",
        success: "Sikeres bejelentkezés!",
        noPasswordSet: "Nincs beállítva jelszó. Kérlek, állítsd be először a jelszót!",
        errorWhileLogin: "Hiba történt a bejelentkezés során!",
        unlockButton: "Feloldás"
    },
    en: {
        emptyPassword: "Please enter your password!",
        incorrectPassword: "Incorrect password. Try again!",
        success: "Login successful!",
        noPasswordSet: "No password is set. Please set a password first!",
        errorWhileLogin: "An error occurred!",
        unlockButton: "Unlock"
    },
    de: {
        emptyPassword: "Bitte geben Sie das Passwort ein!",
        incorrectPassword: "Falsches Passwort. Versuchen Sie es erneut!",
        success: "Erfolgreiche Anmeldung!",
        noPasswordSet: "Kein Passwort festgelegt. Bitte zuerst ein Passwort festlegen!",
        errorWhileLogin: "Beim Anmelden ist ein Fehler aufgetreten!",
        unlockButton: "Entsperren"
    },
    da: {
        emptyPassword: "Indtast venligst din adgangskode!",
        incorrectPassword: "Forkert adgangskode. Prøv igen!",
        success: "Login succesfuld!",
        noPasswordSet: "Ingen adgangskode er indstillet. Indstil venligst først en adgangskode!",
        errorWhileLogin: "Der er opstået en fejl!",
        unlockButton: "Lås op"
    },
    es: {
        emptyPassword: "¡Por favor, ingresa tu contraseña!",
        incorrectPassword: "Contraseña incorrecta. ¡Intenta de nuevo!",
        success: "¡Inicio de sesión exitoso!",
        noPasswordSet: "¡No se ha configurado una contraseña! ¡Por favor, configura una primero!",
        errorWhileLogin: "¡Se ha producido un error!",
        unlockButton: "Desbloquear"
    },
    fr: {
        emptyPassword: "Veuillez entrer votre mot de passe!",
        incorrectPassword: "Mot de passe incorrect. Essayez à nouveau!",
        success: "Connexion réussie!",
        noPasswordSet: "Aucun mot de passe n'est défini. Veuillez d'abord définir un mot de passe!",
        errorWhileLogin: "Une erreur s'est produite!",
        unlockButton: "Déverrouiller"
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
document.getElementById('login').addEventListener('click', login);
document.getElementById('pass').addEventListener('keydown', function(event) {
    if (event.key === "Enter") {
        login();
    }
});

window.onload = function() {
    document.getElementById('pass').focus(); // focus on pass input field

    // Setting the button language according to browsers language
    const loginButton = document.getElementById('login');
    loginButton.textContent = lang.unlockButton || 'Unlock'; // Default to English if no language found
};


/* Login function */
function login() {
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

    // JVerify password based on stored value
    chrome.storage.local.get(['key'], (result) => {
        const actualPassword = result.key;

        if (actualPassword === undefined) {
            errorMessage.textContent = lang.noPasswordSet;
            errorMessage.style.display = 'block';
            return;
        }

        if (enteredPassword === actualPassword) {
            // If the password is correct, we notify background.js
            chrome.runtime.sendMessage({ action: "removeListener" }, (response) => {
                // Check that there is an answer and that it contains a success key
                if (response && response.success) {
                    errorMessage.textContent = lang.success;
                    errorMessage.style.display = 'block';

                    window.close(); // Close login tab

                } else {
                    // If it fails, an error message appears
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

