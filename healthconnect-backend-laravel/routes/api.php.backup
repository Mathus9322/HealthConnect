<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\{
    AuthController,
    DoctorController,
    PatientController,
    AppointmentController,
    MessageController,
    PrescriptionController,
    ProfileController
};

/*
|--------------------------------------------------------------------------
| 🔓 PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Doctors
Route::get('/doctors', [DoctorController::class, 'index']);
Route::get('/doctors/{id}', [DoctorController::class, 'show']);

// Patients
Route::get('/patients', [PatientController::class, 'index']);
Route::get('/patient/{user_id}', [PatientController::class, 'show']);

/*
|--------------------------------------------------------------------------
| 🔒 PROTECTED ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |-------------------------------
    | 👤 PROFILE
    |-------------------------------
    */
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile/{id}', [ProfileController::class, 'update']);

    /*
    |-------------------------------
    | 🧑‍⚕️ DOCTOR AVAILABILITY
    |-------------------------------
    */
    Route::get('/doctor/availability', [DoctorController::class, 'getAvailability']);
    Route::put('/doctor/availability', [DoctorController::class, 'updateAvailability']);

    /*
    |-------------------------------
    | 📅 APPOINTMENTS
    |-------------------------------
    */
    Route::post('/appointments', [AppointmentController::class, 'store']);

    // 🔥 patient
    Route::get('/appointments', [AppointmentController::class, 'patientAppointments']);

    // 🔥 doctor
    Route::get('/doctor/appointments', [AppointmentController::class, 'doctorAppointments']);

    // update status
    Route::put('/appointments/{id}', [AppointmentController::class, 'updateStatus']);

    /*
    |-------------------------------
    | 💬 MESSAGES
    |-------------------------------
    */
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/messages', [MessageController::class, 'send']);
        Route::get('/messages/{user1}/{user2}', [MessageController::class, 'getMessages']);
        Route::get('/conversations', [MessageController::class, 'getConversations']);
    });

    /*
    |-------------------------------
    | 💊 PRESCRIPTIONS
    |-------------------------------
    */
    Route::post('/prescriptions', [PrescriptionController::class, 'store']);
    Route::get('/prescriptions', [PrescriptionController::class, 'index']);
});

/*
|--------------------------------------------------------------------------
| 📌 PUBLIC UTILITY
|--------------------------------------------------------------------------
*/

// créneaux réservés
Route::get('/booked-slots/{doctorId}/{date}', [AppointmentController::class, 'bookedSlots']);
