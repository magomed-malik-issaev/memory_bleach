<?php
// Inclure le fichier de configuration
require_once "config.php";

// Script pour créer la table des utilisateurs
try {
    // Table utilisateurs
    $sql_users = "CREATE TABLE IF NOT EXISTS users (
        id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        score INT DEFAULT 0
    )";
    $conn->exec($sql_users);
    echo "La table des utilisateurs a été créée avec succès.<br>";

    // Table historique des scores
    $sql_history = "CREATE TABLE IF NOT EXISTS score_history (
        id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        score INT NOT NULL,
        time_taken INT NULL,
        date_achieved TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )";
    $conn->exec($sql_history);
    echo "La table d'historique des scores a été créée avec succès.<br>";

    echo "<br>Configuration de la base de données terminée !";
} catch (PDOException $e) {
    die("ERREUR : Impossible de créer les tables. " . $e->getMessage());
}

// Fermer la connexion
$conn = null;
