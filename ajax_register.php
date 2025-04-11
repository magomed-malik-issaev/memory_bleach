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
if (!isset($data['username']) || !isset($data['email']) || !isset($data['password']) || !isset($data['confirm_password'])) {
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Données manquantes']);
    exit;
}

// Définir les variables
$username = trim($data['username']);
$email = trim($data['email']);
$password = trim($data['password']);
$confirm_password = trim($data['confirm_password']);
$errors = [];

// Valider le nom d'utilisateur
if (empty($username)) {
    $errors['username'] = "Veuillez entrer un nom d'utilisateur.";
} elseif (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
    $errors['username'] = "Le nom d'utilisateur ne peut contenir que des lettres, des chiffres et des underscores.";
} else {
    // Vérifier si le nom d'utilisateur existe déjà
    $sql = "SELECT id FROM users WHERE username = :username";
    if ($stmt = $conn->prepare($sql)) {
        $stmt->bindParam(":username", $username, PDO::PARAM_STR);
        $stmt->execute();
        if ($stmt->rowCount() > 0) {
            $errors['username'] = "Ce nom d'utilisateur est déjà pris.";
        }
    }
}

// Valider l'email
if (empty($email)) {
    $errors['email'] = "Veuillez entrer un email.";
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = "Format d'email invalide.";
} else {
    // Vérifier si l'email existe déjà
    $sql = "SELECT id FROM users WHERE email = :email";
    if ($stmt = $conn->prepare($sql)) {
        $stmt->bindParam(":email", $email, PDO::PARAM_STR);
        $stmt->execute();
        if ($stmt->rowCount() > 0) {
            $errors['email'] = "Cet email est déjà utilisé.";
        }
    }
}

// Valider le mot de passe
if (empty($password)) {
    $errors['password'] = "Veuillez entrer un mot de passe.";
} elseif (strlen($password) < 6) {
    $errors['password'] = "Le mot de passe doit comporter au moins 6 caractères.";
}

// Valider la confirmation du mot de passe
if (empty($confirm_password)) {
    $errors['confirm_password'] = "Veuillez confirmer le mot de passe.";
} elseif ($password != $confirm_password) {
    $errors['confirm_password'] = "Les mots de passe ne correspondent pas.";
}

// S'il y a des erreurs, les renvoyer en JSON
if (!empty($errors)) {
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'errors' => $errors]);
    exit;
}

// Si tout est bon, insérer l'utilisateur dans la base de données
try {
    $sql = "INSERT INTO users (username, email, password) VALUES (:username, :email, :password)";
    $stmt = $conn->prepare($sql);

    // Hacher le mot de passe avant de l'enregistrer
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    $stmt->bindParam(":username", $username, PDO::PARAM_STR);
    $stmt->bindParam(":email", $email, PDO::PARAM_STR);
    $stmt->bindParam(":password", $hashed_password, PDO::PARAM_STR);

    if ($stmt->execute()) {
        // Inscription réussie
        $_SESSION['registration_success'] = true;

        // Connecter automatiquement l'utilisateur
        $_SESSION['loggedin'] = true;
        $_SESSION['id'] = $conn->lastInsertId();
        $_SESSION['username'] = $username;

        header('Content-Type: application/json');
        echo json_encode(['status' => 'success', 'message' => 'Inscription réussie !']);
    } else {
        header('Content-Type: application/json');
        echo json_encode(['status' => 'error', 'message' => 'Une erreur est survenue lors de l\'inscription.']);
    }
} catch (PDOException $e) {
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Erreur de base de données: ' . $e->getMessage()]);
}
