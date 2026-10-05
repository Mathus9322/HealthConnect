<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    AuthController, DoctorController, PatientController,
    AppointmentController, MessageController,
    PrescriptionController, ProfileController, NotificationController
};
use App\Http\Controllers\Admin\{
    AdminStatsController, AdminUserController,
    AdminAppointmentController, AdminMessageController,
    AdminPrescriptionController
};

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::get('/doctors',      [DoctorController::class, 'index']);
Route::get('/doctors/{id}', [DoctorController::class, 'show']);

Route::get('/patients',          [PatientController::class, 'index']);
Route::get('/patient/{user_id}', [PatientController::class, 'show']);

Route::get('/booked-slots/{doctorId}/{date}', [AppointmentController::class, 'bookedSlots']);

/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // Profil
    Route::get('/profile',      [ProfileController::class, 'show']);
    Route::put('/profile/{id}', [ProfileController::class, 'update']);

    // Rendez-vous
    Route::post('/appointments',        [AppointmentController::class, 'store']);
    Route::get('/appointments',         [AppointmentController::class, 'patientAppointments']);
    Route::delete('/appointments/{id}', [AppointmentController::class, 'destroy']);

    // ‍Médecin
    Route::get('/doctor/appointments',  [AppointmentController::class, 'doctorAppointments']);
    Route::put('/appointments/{id}',    [AppointmentController::class, 'updateStatus']);

    Route::get('/doctor/availability',  [DoctorController::class, 'getAvailability']);
    Route::put('/doctor/availability',  [DoctorController::class, 'updateAvailability']);

    Route::get('/doctor/patients',                            [DoctorController::class, 'myPatients']);
    Route::get('/doctor/patients/{patientId}/prescriptions',  [DoctorController::class, 'patientPrescriptions']);

    // Messages
    Route::get('/conversations',          [MessageController::class, 'getConversations']);
    Route::get('/messages/contacts',      [MessageController::class, 'contacts']);
    Route::get('/messages/unread-count',  [MessageController::class, 'unreadCount']);
    Route::get('/messages/{userId}',      [MessageController::class, 'getMessages'])->whereNumber('userId');
    Route::post('/messages',              [MessageController::class, 'send']);
    Route::get('/messages/{id}/attachment', [MessageController::class, 'attachment'])->whereNumber('id');

    // Notifications
    Route::get('/notifications',              [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/read-all',    [NotificationController::class, 'markAllAsRead']);
    Route::post('/notifications/{id}/read',   [NotificationController::class, 'markAsRead']);
    Route::delete('/notifications/{id}',      [NotificationController::class, 'destroy']);

    // Prescriptions
    Route::get('/prescriptions',        [PrescriptionController::class, 'index']);
    Route::post('/prescriptions',       [PrescriptionController::class, 'store']);
    Route::delete('/prescriptions/{id}',[PrescriptionController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | ADMIN
    |--------------------------------------------------------------------------
    */
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/stats',                   [AdminStatsController::class, 'index']);
        Route::get('/users',                   [AdminUserController::class, 'index']);
        Route::put('/users/{id}',              [AdminUserController::class, 'update']);
        Route::delete('/users/{id}',           [AdminUserController::class, 'destroy']);
        Route::get('/appointments',            [AdminAppointmentController::class, 'index']);
        Route::put('/appointments/{id}',       [AdminAppointmentController::class, 'update']);
        Route::delete('/appointments/{id}',    [AdminAppointmentController::class, 'destroy']);
        Route::get('/messages',                [AdminMessageController::class, 'index']);
        Route::delete('/messages/{id}',        [AdminMessageController::class, 'destroy']);
        Route::get('/prescriptions',           [AdminPrescriptionController::class, 'index']);
        Route::delete('/prescriptions/{id}',   [AdminPrescriptionController::class, 'destroy']);
    });
});
