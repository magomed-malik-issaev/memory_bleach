<?php
// Initialiser la session
session_start();

// Détruire toutes les variables de session
$_SESSION = array();

// Détruire la session
session_destroy();

// Selon le type de requête, renvoyer une réponse JSON ou rediriger
if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
    // Requête AJAX
    header('Content-Type: application/json');
    echo json_encode(['status' => 'success', 'message' => 'Déconnexion réussie !']);
} else {
    // Requête navigateur normale, rediriger vers l'accueil
    header("location: index.php");
}
exit;
