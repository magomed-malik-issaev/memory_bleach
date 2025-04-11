<?php
// Initialiser la session
session_start();

// Vérifier si l'utilisateur est connecté
if (!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true) {
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Utilisateur non connecté']);
    exit;
}

// Vérifier si la requête est de type POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Méthode non autorisée']);
    exit;
}

// Inclure le fichier de configuration
require_once "config.php";

// Récupérer les données envoyées
$data = json_decode(file_get_contents('php://input'), true);

// Si les données ne sont pas formatées en JSON, utiliser $_POST
if (!$data) {
    $data = $_POST;
}

// Vérifier que le score est présent
if (!isset($data['score']) || !is_numeric($data['score'])) {
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Score invalide']);
    exit;
}

$user_id = $_SESSION['id'];
$score = (int)$data['score'];
$time = isset($data['time']) ? (int)$data['time'] : null;

try {
    // Récupérer le meilleur score actuel de l'utilisateur
    $stmt = $conn->prepare("SELECT score FROM users WHERE id = :id");
    $stmt->bindParam(":id", $user_id, PDO::PARAM_INT);
    $stmt->execute();
    $current_score = $stmt->fetchColumn();

    // Mettre à jour le score si le nouveau est meilleur
    if ($score > $current_score) {
        $update_stmt = $conn->prepare("UPDATE users SET score = :score WHERE id = :id");
        $update_stmt->bindParam(":score", $score, PDO::PARAM_INT);
        $update_stmt->bindParam(":id", $user_id, PDO::PARAM_INT);
        $update_stmt->execute();

        // Enregistrer également dans l'historique des scores
        $history_stmt = $conn->prepare("INSERT INTO score_history (user_id, score, time_taken, date_achieved) VALUES (:user_id, :score, :time, NOW())");
        $history_stmt->bindParam(":user_id", $user_id, PDO::PARAM_INT);
        $history_stmt->bindParam(":score", $score, PDO::PARAM_INT);
        $history_stmt->bindParam(":time", $time, PDO::PARAM_INT);
        $history_stmt->execute();

        header('Content-Type: application/json');
        echo json_encode(['status' => 'success', 'message' => 'Nouveau record personnel !']);
    } else {
        // Enregistrer dans l'historique même si ce n'est pas un record
        $history_stmt = $conn->prepare("INSERT INTO score_history (user_id, score, time_taken, date_achieved) VALUES (:user_id, :score, :time, NOW())");
        $history_stmt->bindParam(":user_id", $user_id, PDO::PARAM_INT);
        $history_stmt->bindParam(":score", $score, PDO::PARAM_INT);
        $history_stmt->bindParam(":time", $time, PDO::PARAM_INT);
        $history_stmt->execute();

        header('Content-Type: application/json');
        echo json_encode(['status' => 'success', 'message' => 'Score enregistré !']);
    }
} catch (PDOException $e) {
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Erreur de base de données: ' . $e->getMessage()]);
}
