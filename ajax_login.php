<?php
// Initialiser la session
session_start();

// Vérifier si la requête est de type POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    // Renvoyer une erreur en JSON
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

// Vérifier que toutes les données nécessaires sont présentes
if (!isset($data['email']) || !isset($data['password'])) {
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Données manquantes']);
    exit;
}

// Définir les variables
$email = trim($data['email']);
$password = trim($data['password']);
$errors = [];

// Valider l'email
if (empty($email)) {
    $errors['email'] = "Veuillez entrer votre email.";
}

// Valider le mot de passe
if (empty($password)) {
    $errors['password'] = "Veuillez entrer votre mot de passe.";
}

// S'il y a des erreurs, les renvoyer en JSON
if (!empty($errors)) {
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'errors' => $errors]);
    exit;
}

// Si tout est bon, vérifier les identifiants dans la base de données
try {
    $sql = "SELECT id, username, email, password FROM users WHERE email = :email";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(":email", $email, PDO::PARAM_STR);

    if ($stmt->execute()) {
        // Vérifier si l'email existe
        if ($stmt->rowCount() == 1) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            // Vérifier le mot de passe
            if (password_verify($password, $row['password'])) {
                // Mot de passe correct

                // Stocker les informations de session
                $_SESSION['loggedin'] = true;
                $_SESSION['id'] = $row['id'];
                $_SESSION['username'] = $row['username'];

                // Mettre à jour la date de dernière connexion
                $update_sql = "UPDATE users SET last_login = NOW() WHERE id = :id";
                $update_stmt = $conn->prepare($update_sql);
                $update_stmt->bindParam(":id", $row['id'], PDO::PARAM_INT);
                $update_stmt->execute();

                header('Content-Type: application/json');
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Connexion réussie !',
                    'username' => $row['username']
                ]);
            } else {
                // Mot de passe incorrect
                header('Content-Type: application/json');
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Email ou mot de passe incorrect.'
                ]);
            }
        } else {
            // Email non trouvé
            header('Content-Type: application/json');
            echo json_encode([
                'status' => 'error',
                'message' => 'Email ou mot de passe incorrect.'
            ]);
        }
    } else {
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'error',
            'message' => 'Une erreur est survenue lors de la connexion.'
        ]);
    }
} catch (PDOException $e) {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error',
        'message' => 'Erreur de base de données: ' . $e->getMessage()
    ]);
}
