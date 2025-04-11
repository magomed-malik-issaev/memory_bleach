<?php
// Initialiser la session
session_start();

// Vérifier si l'utilisateur est connecté
$response = [
    'loggedin' => isset($_SESSION['loggedin']) && $_SESSION['loggedin'] === true,
    'username' => isset($_SESSION['username']) ? $_SESSION['username'] : null
];

// Renvoyer le résultat en JSON
header('Content-Type: application/json');
echo json_encode($response);
