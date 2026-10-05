<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['http://localhost:3000', 'http://localhost:3001'], // React dev server

    // Accès depuis un autre appareil du réseau local (ex : téléphone sur le même Wi-Fi)
    'allowed_origins_patterns' => [
        '#^http://(192\.168|10|172\.(1[6-9]|2[0-9]|3[01]))(\.\d{1,3}){2,3}:300[01]$#',
    ],

    'allowed_headers' => ['*'],

    'supports_credentials' => true,

];
