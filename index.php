<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <title>Memory Bleach</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
</head>

<body>
    <div class="content-wrapper">
        <nav class="navbar">
            <div class="navbar-logo">
                <img src="image/back.jpg" alt="Logo Bleach" class="nav-logo">
                <span>MEMORY BLEACH</span>
            </div>
            <div class="navbar-links">
                <a href="#" class="nav-link active">Accueil</a>
                <a href="#" class="nav-link">Classement</a>
                <a href="#" class="nav-link">À propos</a>
            </div>
            <div class="navbar-auth">
                <button class="auth-btn login-btn" id="loginBtn">
                    <i class="fas fa-sign-in-alt"></i> Connexion
                </button>
                <button class="auth-btn register-btn" id="registerBtn">
                    <i class="fas fa-user-plus"></i> Inscription
                </button>
            </div>
        </nav>

        <div class="auth-modal" id="loginModal">
            <div class="auth-modal-content">
                <span class="close-modal">&times;</span>
                <h2>Connexion</h2>
                <form>
                    <div class="form-group">
                        <label for="loginEmail">Email</label>
                        <input type="email" id="loginEmail" placeholder="Votre email">
                    </div>
                    <div class="form-group">
                        <label for="loginPassword">Mot de passe</label>
                        <input type="password" id="loginPassword" placeholder="Votre mot de passe">
                    </div>
                    <button type="submit" class="auth-submit-btn">Se connecter</button>
                </form>
            </div>
        </div>

        <div class="auth-modal" id="registerModal">
            <div class="auth-modal-content">
                <span class="close-modal">&times;</span>
                <h2>Inscription</h2>
                <form>
                    <div class="form-group">
                        <label for="registerUsername">Nom d'utilisateur</label>
                        <input type="text" id="registerUsername" placeholder="Choisissez un nom d'utilisateur">
                    </div>
                    <div class="form-group">
                        <label for="registerEmail">Email</label>
                        <input type="email" id="registerEmail" placeholder="Votre email">
                    </div>
                    <div class="form-group">
                        <label for="registerPassword">Mot de passe</label>
                        <input type="password" id="registerPassword" placeholder="Choisissez un mot de passe">
                    </div>
                    <div class="form-group">
                        <label for="confirmPassword">Confirmer le mot de passe</label>
                        <input type="password" id="confirmPassword" placeholder="Confirmez votre mot de passe">
                    </div>
                    <button type="submit" class="auth-submit-btn">S'inscrire</button>
                </form>
            </div>
        </div>

        <h1>Memory Bleach</h1>

        <div class="difficulty-selector">
            <h3>Niveau de difficulté</h3>
            <div class="difficulty-buttons">
                <button class="difficulty-btn" data-difficulty="easy">
                    <i class="fas fa-child"></i> Facile
                    <span class="difficulty-info">5 secondes</span>
                </button>
                <button class="difficulty-btn" data-difficulty="medium">
                    <i class="fas fa-user"></i> Moyen
                    <span class="difficulty-info">2 secondes</span>
                </button>
                <button class="difficulty-btn" data-difficulty="hard">
                    <i class="fas fa-dragon"></i> Difficile
                    <span class="difficulty-info">0,5 seconde</span>
                </button>
            </div>
        </div>

        <div class="game-board" id="gameBoard"></div>
    </div>
    <script src="script.js"></script>
</body>

</html>