<?php
// Inclure le fichier de configuration
require_once "config.php";

// Récupérer les meilleurs scores
try {
    // Requête pour obtenir les 10 meilleurs scores, avec le nom d'utilisateur
    $sql = "SELECT users.username, users.score, MAX(users.last_login) as last_active
            FROM users
            WHERE users.score > 0
            GROUP BY users.id
            ORDER BY users.score DESC
            LIMIT 10";

    $stmt = $conn->prepare($sql);
    $stmt->execute();

    // Récupérer tous les résultats
    $ranking = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Définir la réponse
    $response = [
        'status' => 'success',
        'ranking' => $ranking
    ];

    // Ajouter si l'utilisateur connecté est dans le classement
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (isset($_SESSION['loggedin']) && $_SESSION['loggedin'] === true) {
        // Requête pour obtenir le rang de l'utilisateur connecté
        $user_id = $_SESSION['id'];
        $rank_sql = "SELECT COUNT(*) + 1 as rank
                    FROM users
                    WHERE score > (SELECT score FROM users WHERE id = :user_id)";

        $rank_stmt = $conn->prepare($rank_sql);
        $rank_stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $rank_stmt->execute();

        $user_rank = $rank_stmt->fetchColumn();

        // Récupérer le score de l'utilisateur
        $score_sql = "SELECT score FROM users WHERE id = :user_id";
        $score_stmt = $conn->prepare($score_sql);
        $score_stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $score_stmt->execute();

        $user_score = $score_stmt->fetchColumn();

        $response['user_rank'] = [
            'username' => $_SESSION['username'],
            'score' => $user_score,
            'rank' => $user_rank
        ];
    }

    // Renvoyer le résultat en JSON
    header('Content-Type: application/json');
    echo json_encode($response);
} catch (PDOException $e) {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error',
        'message' => 'Erreur de base de données: ' . $e->getMessage()
    ]);
}
