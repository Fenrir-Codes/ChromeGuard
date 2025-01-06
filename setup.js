// Események hozzárendelése
document.addEventListener('contextmenu', disableDevToolsAndRightClick); // Jobb kattintás letiltása
document.addEventListener('keydown', disableDevToolsAndRightClick); // Billentyűk letiltása
document.getElementById('save').addEventListener('click', savePassword);
document.getElementById('confpass').addEventListener('keydown', function(event) {
    if (event.key === "Enter") {
        savePassword();
    }
});

// Nyelvi beállítások
const messages = {
  hu: {
      emptyFields: "Kérlek, töltsd ki az összes mezőt!",
      passwordMismatch: "A két jelszó nem egyezik!",
      saved: "Jelszó mentve!",
  },
  en: {
      emptyFields: "Please fill out all fields!",
      passwordMismatch: "Passwords do not match!",
      saved: "Password saved!",
  },
  de: {
      emptyFields: "Bitte füllen Sie alle Felder aus!",
      passwordMismatch: "Die Passwörter stimmen nicht überein!",
      saved: "Passwort gespeichert!",
  },
  es: {
      emptyFields: "¡Por favor, completa todos los campos!",
      passwordMismatch: "¡Las contraseñas no coinciden!",
      saved: "¡Contraseña guardada!",
  },
  fr: {
      emptyFields: "Veuillez remplir tous les champs!",
      passwordMismatch: "Les mots de passe ne correspondent pas!",
      saved: "Mot de passe enregistré!",
  },
  da: {
      emptyFields: "Udfyld venligst alle felter!",
      passwordMismatch: "Adgangskoderne stemmer ikke overens!",
      saved: "Adgangskode gemt!",
  },
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


/* Save password function */
function savePassword() {
  const passwordInput = document.getElementById('pass').value;
  const confirmPassword = document.getElementById('confpass').value;
  const errorMessage = document.getElementById('error-message'); // Error message meghívása

  // Ellenőrizzük, hogy minden mező ki van-e töltve
  if (!passwordInput || !confirmPassword) {
      errorMessage.textContent = lang.emptyFields;
      errorMessage.style.display = 'block';
      return;
  }

  // Ellenőrizzük, hogy a két jelszó egyezik-e
  if (passwordInput !== confirmPassword) {
      errorMessage.textContent = lang.passwordMismatch;
      errorMessage.style.display = 'block';
      return;
  }

  // Ha minden rendben van, mentsük el a jelszót
  chrome.storage.local.set({ key: confirmPassword }, () => {
      // A hibaüzenetet eltüntetjük, és megjelenítjük a sikerüzenetet
      errorMessage.textContent = lang.saved;
      errorMessage.style.display = 'block';
      
      // Átirányítjuk a login oldalra
      setTimeout(() => {
          window.location.href = chrome.runtime.getURL("unlock.html");
      }, 1000); // Várjunk egy kicsit, hogy a sikerüzenet megjelenhessen
  });
}
