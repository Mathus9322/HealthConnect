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
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::get('/appointments', [AppointmentController::class, 'patientAppointments']);
    Route::put('/appointments/{id}', [AppointmentController::class, 'updateStatus']);
    Route::get('/doctor/appointments', [AppointmentController::class, 'doctorAppointments']);

    });



// 🔥 AJOUT ICI
Route::get('/booked-slots/{doctor_id}/{date}', [AppointmentController::class, 'bookedSlots']);
// Route::get('/booked-slots/{doctor_id}/{date}', [AppointmentController::class, 'bookedSlots']);
// Messages
Route::post('/messages', [MessageController::class, 'send']);
Route::get('/messages/{user1}/{user2}', [MessageController::class, 'getMessages']);

// Prescriptions
Route::post('/prescriptions', [PrescriptionController::class, 'store']);
Route::get('/prescriptions', [PrescriptionController::class, 'index']);
