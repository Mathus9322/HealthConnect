<?php


use Illuminate\Support\Facades\Route;



use App\Http\Controllers\{
    AuthController,
    DoctorController,
    PatientController,
    AppointmentController,
    MessageController,
    PrescriptionController
};



Route::get('/test', function () {
    return "API OK";
});

// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Doctors
Route::get('/doctors', [DoctorController::class, 'index']);
Route::get('/doctors/{id}', [DoctorController::class, 'show']);
Route::get('/patients/', [PatientController::class, 'index']);

// Patient
Route::get('/patient/{user_id}', [PatientController::class, 'show']);
Route::put('/patient/{user_id}', [PatientController::class, 'update']);


// Appointments
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/appointments', [AppointmentController::class, 'store']); // Créer un RDV
    Route::get('/appointments', [AppointmentController::class, 'patientAppointments']); // RDV du patient connecté
    Route::put('/appointments/{id}', [AppointmentController::class, 'updateStatus']); // Changer statut
});
// Messages
Route::post('/messages', [MessageController::class, 'send']);
Route::get('/messages/{user1}/{user2}', [MessageController::class, 'getMessages']);

// Prescriptions
Route::post('/prescriptions', [PrescriptionController::class, 'store']);
Route::get('/prescriptions', [PrescriptionController::class, 'index']);
