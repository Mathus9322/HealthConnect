# Documentation Complète – HealthConnect

## 1. Architecture du projet

Le projet **HealthConnect** est composé de **3 parties principales** :

```
HealthConnect
│
├── backend (Laravel API)       # Logique métier et API REST
├── frontend (React)           # Interface utilisateur
└── database (MySQL)           # Stockage des données
```

**Rôle de chaque partie :**

* **Backend (Laravel)** : gère l’authentification, les rendez-vous, les messages et les prescriptions.
* **Frontend (React)** : permet à l’utilisateur d’interagir avec le système (patients et médecins).
* **Database (MySQL)** : stocke les utilisateurs, rendez-vous, messages et autres données médicales.

---

## 2. Installer les outils nécessaires

Assure-toi d’avoir les outils suivants installés :

* **PHP 8+** (pour Laravel)
* **Composer** (gestionnaire de dépendances PHP)
* **Node.js & npm** (pour React et Tailwind)
* **MySQL** (base de données)
* **Laravel** (framework backend)

Vérification des versions :

```bash
php -v
composer -v
node -v
npm -v
mysql --version
```

---

## 3. Créer le Backend (Laravel)

Créer le projet Laravel :

```bash
composer create-project laravel/laravel healthconnect-backend-laravel
```

Accéder au dossier du projet :

```bash
cd healthconnect-backend-laravel
```

Lancer le serveur local Laravel :

```bash
php artisan serve
```

URL d’accès :

```
http://127.0.0.1:8000
```

---

## 4. Configurer la base de données

Créer une base de données MySQL nommée :

```
mediconnect_db
```

Configurer le fichier **.env** :

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=healthconnect_db
DB_USERNAME=root
DB_PASSWORD=
```

Migrer les tables par défaut de Laravel :

```bash
php artisan migrate
```

---

## 5. Créer les modèles principaux

Les modèles représentent les entités principales du système. Exemple :

```bash
php artisan make:model Doctor -m
php artisan make:model Appointment -m
php artisan make:model Message -m
php artisan make:model Prescription -m
```

> Le `-m` crée automatiquement une migration associée.

---

## 6. Exemple de migration pour **Appointment**

Dans le fichier de migration généré :

```php
Schema::create('appointments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('patient_id')->constrained('users')->onDelete('cascade');
    $table->foreignId('doctor_id')->constrained('doctors')->onDelete('cascade');
    $table->dateTime('date');
    $table->string('status')->default('pending'); // pending, accepted, completed
    $table->timestamps();
});
```

Lancer la migration :

```bash
php artisan migrate
```

---

## 7. Créer les contrôleurs

Pour gérer la logique des différentes entités :

```bash
php artisan make:controller AuthController
php artisan make:controller DoctorController
php artisan make:controller AppointmentController
php artisan make:controller MessageController
php artisan make:controller PrescriptionController
```

---

## 8. Exemple de routes API

Dans `routes/api.php` :

```php
// Authentification
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Médecins
Route::get('/doctors', [DoctorController::class, 'index']);

// Rendez-vous
Route::post('/appointments', [AppointmentController::class, 'store']);
Route::get('/appointments', [AppointmentController::class, 'index']);

// Messagerie
Route::post('/messages', [MessageController::class, 'send']);
```

---

## 9. Créer le Frontend (React)

Créer le projet React :

```bash
npx create-react-app healthconnect-frontend
```

Accéder au projet :

```bash
cd healthconnect-frontend
```

Installer TailwindCSS :

```bash
npm install -D tailwindcss
npx tailwindcss init
```

Lancer le serveur React :

```bash
npm start
```

---

## 10. Structure React

```
src
│
├── pages
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Doctors.jsx
│   ├── Appointment.jsx
│   └── Dashboard.jsx
│
├── components
│   ├── Navbar.jsx
│   ├── DoctorCard.jsx
│   └── AppointmentCard.jsx
│
└── services

---

## 11. Docker

Le projet peut être démarré avec Docker Compose pour lancer le backend Laravel et le frontend React ensemble.

### Prérequis

* Docker
* Docker Compose

### Lancer les services

Depuis la racine du dépôt :

```bash
docker compose up --build
```

### URLs accessibles

* Backend Laravel : `http://localhost:8000`
* Frontend React : `http://localhost:3000`

### Détails

* Le backend utilise SQLite pour la base de données (`healthconnect-backend-laravel/database/database.sqlite`).
* Le frontend se connecte au backend via `REACT_APP_API_BASE_URL=http://127.0.0.1:8000/api`.

    └── api.js          # Gestion des appels API
```

---

## 11. Exemple d’appel API depuis React

```javascript
// services/api.js
export const getDoctors = async () => {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/doctors");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des médecins :", error);
    return [];
  }
};
```

---

## 12. Pages principales à créer

1. **Accueil** : Présentation + liste des médecins
2. **Inscription** : Patient / Médecin
3. **Connexion** : Login pour patient / médecin
4. **Liste des médecins** : Affichage des cartes médecins
5. **Rendez-vous** : Prise et gestion des rendez-vous
6. **Messagerie** : Communication patient ↔ médecin
7. **Dashboard Admin** : Gestion globale des utilisateurs et rendez-vous

---

## 13. Fonctionnalités minimum (pour terminer en 5 jours)

* ✅ Inscription / connexion
* ✅ Liste des médecins
* ✅ Prise de rendez-vous
* ✅ Dashboard patient
* ✅ Dashboard médecin
* ✅ Messagerie simple


---

## 14. Nom et slogan du projet

**Projet :** HealthConnect
**Slogan :**

```
Votre santé, à distance
```

---
MediConnect
MediConnect
## 15. Structure finale

```
HealthConnect
│
├── backend (Laravel API)
│
├── frontend (React)
│
└── database (MySQL)
```