document.addEventListener("DOMContentLoaded", () => {
    const gameBoard = document.getElementById("gameBoard");
    const characters = [
        { name: "aizen", img: "image/aizen.jpg" },
        { name: "ichigo", img: "image/background.jpg" },
        { name: "yamamoto", img: "image/yamamoto.jpg" },
        { name: "getsugaultime", img: "image/getsugaultime.jpg" },
        { name: "unohana", img: "image/unohana.jpg" },
        { name: "zaraki", img: "image/zaraki.jpg" }
    ];

    // État du jeu
    let isLoggedIn = false;
    let gameInitialized = false;
    let gameLaunched = false; // Nouvel état pour savoir si le jeu a été lancé
    let currentDifficulty = null; // Aucun niveau par défaut

    // Durées de mémorisation en millisecondes pour chaque niveau de difficulté
    const difficultySettings = {
        easy: 5000,    // 5 secondes
        medium: 2000,  // 2 secondes
        hard: 500      // 0,5 seconde
    };

    // Vérifier l'état de connexion au chargement
    checkLoginStatus();

    // Gestion de l'authentification et modales
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const loginModal = document.getElementById("loginModal");
    const registerModal = document.getElementById("registerModal");
    const closeButtons = document.querySelectorAll(".close-modal");
    const navbarAuth = document.querySelector(".navbar-auth");

    // Gérer les changements de difficulté
    document.addEventListener('click', function (e) {
        if (e.target.closest('.difficulty-btn')) {
            const difficultyBtn = e.target.closest('.difficulty-btn');

            // Récupérer le niveau de difficulté
            const difficulty = difficultyBtn.dataset.difficulty;

            // Mettre à jour la difficulté actuelle
            currentDifficulty = difficulty;

            // Mettre à jour l'interface (enlever active de tous et ajouter à celui sélectionné)
            document.querySelectorAll('.difficulty-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            difficultyBtn.classList.add('active');

            // Lancer le jeu avec ce niveau de difficulté si l'utilisateur est connecté
            if (isLoggedIn) {
                if (!gameLaunched) {
                    // Première fois qu'on choisit un niveau
                    initializeGame();
                    gameLaunched = true;
                } else {
                    // Changer de niveau en cours de jeu
                    resetGame();
                }
            }
        }
    });

    // Ouvrir la modale de connexion
    loginBtn.addEventListener("click", () => {
        loginModal.style.display = "block";
    });

    // Ouvrir la modale d'inscription
    registerBtn.addEventListener("click", () => {
        registerModal.style.display = "block";
    });

    // Fermer les modales avec le bouton X
    closeButtons.forEach(button => {
        button.addEventListener("click", function () {
            this.closest(".auth-modal").style.display = "none";

            // Réinitialiser les formulaires et messages d'erreur
            this.closest(".auth-modal").querySelectorAll('.form-error').forEach(el => el.remove());
            this.closest(".auth-modal").querySelector('form').reset();
        });
    });

    // Fermer les modales en cliquant en dehors
    window.addEventListener("click", (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = "none";
            loginModal.querySelectorAll('.form-error').forEach(el => el.remove());
            loginModal.querySelector('form').reset();
        }
        if (e.target === registerModal) {
            registerModal.style.display = "none";
            registerModal.querySelectorAll('.form-error').forEach(el => el.remove());
            registerModal.querySelector('form').reset();
        }
    });

    // Empêcher la fermeture en cliquant sur le contenu des modales
    document.querySelectorAll(".auth-modal-content").forEach(content => {
        content.addEventListener("click", (e) => {
            e.stopPropagation();
        });
    });

    // Gestion du formulaire d'inscription
    const registerForm = document.querySelector("#registerModal form");
    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();

            // Récupérer les données du formulaire
            const formData = {
                username: e.target.querySelector("#registerUsername").value,
                email: e.target.querySelector("#registerEmail").value,
                password: e.target.querySelector("#registerPassword").value,
                confirm_password: e.target.querySelector("#confirmPassword").value
            };

            // Supprimer les messages d'erreur précédents
            e.target.querySelectorAll('.form-error').forEach(el => el.remove());

            // Envoyer les données via AJAX
            fetch('ajax_register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        // Inscription réussie
                        registerModal.style.display = "none";
                        showNotification(data.message, 'success');

                        // Mettre à jour l'interface pour l'utilisateur connecté
                        setTimeout(() => {
                            checkLoginStatus();
                        }, 500);

                    } else if (data.status === 'error') {
                        // Afficher les erreurs
                        if (data.errors) {
                            Object.keys(data.errors).forEach(field => {
                                const input = e.target.querySelector(`#register${field.charAt(0).toUpperCase() + field.slice(1)}`);
                                const errorMsg = document.createElement('span');
                                errorMsg.className = 'form-error';
                                errorMsg.textContent = data.errors[field];
                                errorMsg.style.color = '#ff5252';
                                errorMsg.style.fontSize = '0.8rem';
                                errorMsg.style.display = 'block';
                                errorMsg.style.marginTop = '5px';
                                input.parentNode.appendChild(errorMsg);
                            });
                        } else if (data.message) {
                            showNotification(data.message, 'error');
                        }
                    }
                })
                .catch(error => {
                    console.error('Erreur:', error);
                    showNotification('Une erreur est survenue lors de l\'inscription.', 'error');
                });
        });
    }

    // Gestion du formulaire de connexion
    const loginForm = document.querySelector("#loginModal form");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();

            // Récupérer les données du formulaire
            const formData = {
                email: e.target.querySelector("#loginEmail").value,
                password: e.target.querySelector("#loginPassword").value
            };

            // Supprimer les messages d'erreur précédents
            e.target.querySelectorAll('.form-error').forEach(el => el.remove());

            // Envoyer les données via AJAX
            fetch('ajax_login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        // Connexion réussie
                        loginModal.style.display = "none";
                        showNotification(data.message, 'success');

                        // Mettre à jour l'interface pour l'utilisateur connecté
                        setTimeout(() => {
                            checkLoginStatus();
                        }, 500);

                    } else if (data.status === 'error') {
                        // Afficher les erreurs
                        if (data.errors) {
                            Object.keys(data.errors).forEach(field => {
                                const input = e.target.querySelector(`#login${field.charAt(0).toUpperCase() + field.slice(1)}`);
                                const errorMsg = document.createElement('span');
                                errorMsg.className = 'form-error';
                                errorMsg.textContent = data.errors[field];
                                errorMsg.style.color = '#ff5252';
                                errorMsg.style.fontSize = '0.8rem';
                                errorMsg.style.display = 'block';
                                errorMsg.style.marginTop = '5px';
                                input.parentNode.appendChild(errorMsg);
                            });
                        } else if (data.message) {
                            const errorMsg = document.createElement('div');
                            errorMsg.className = 'form-error';
                            errorMsg.textContent = data.message;
                            errorMsg.style.color = '#ff5252';
                            errorMsg.style.fontSize = '0.9rem';
                            errorMsg.style.textAlign = 'center';
                            errorMsg.style.marginBottom = '15px';
                            e.target.prepend(errorMsg);
                        }
                    }
                })
                .catch(error => {
                    console.error('Erreur:', error);
                    showNotification('Une erreur est survenue lors de la connexion.', 'error');
                });
        });
    }

    // Fonction pour vérifier l'état de connexion
    function checkLoginStatus() {
        fetch('check_session.php')
            .then(response => response.json())
            .then(data => {
                isLoggedIn = data.loggedin;
                updateNavbar(data.loggedin, data.username);

                // Mettre à jour l'état du jeu en fonction de la connexion
                updateGameState(data.loggedin);
            })
            .catch(error => {
                console.error('Erreur:', error);
            });
    }

    // Fonction pour mettre à jour la navbar selon l'état de connexion
    function updateNavbar(isLoggedIn, username) {
        if (isLoggedIn && username) {
            // Utilisateur connecté
            navbarAuth.innerHTML = `
                <div class="user-info">
                    <span class="welcome-msg">Bienvenue, <strong>${username}</strong></span>
                    <button class="auth-btn logout-btn" id="logoutBtn">
                        <i class="fas fa-sign-out-alt"></i> Déconnexion
                    </button>
                </div>
            `;

            // Ajouter l'événement de déconnexion
            document.getElementById('logoutBtn').addEventListener('click', handleLogout);

        } else {
            // Utilisateur non connecté
            navbarAuth.innerHTML = `
                <button class="auth-btn login-btn" id="loginBtn">
                    <i class="fas fa-sign-in-alt"></i> Connexion
                </button>
                <button class="auth-btn register-btn" id="registerBtn">
                    <i class="fas fa-user-plus"></i> Inscription
                </button>
            `;

            // Réattacher les événements
            document.getElementById('loginBtn').addEventListener('click', () => {
                loginModal.style.display = "block";
            });

            document.getElementById('registerBtn').addEventListener('click', () => {
                registerModal.style.display = "block";
            });
        }
    }

    // Fonction pour gérer la déconnexion
    function handleLogout() {
        fetch('logout.php', {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    showNotification(data.message, 'success');

                    // Réinitialiser l'état du jeu
                    gameLaunched = false;

                    // Mettre à jour l'interface pour l'utilisateur déconnecté
                    setTimeout(() => {
                        checkLoginStatus();
                    }, 500);
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                showNotification('Une erreur est survenue lors de la déconnexion.', 'error');
            });
    }

    // Fonction pour mettre à jour l'état du jeu en fonction de l'authentification
    function updateGameState(isUserLoggedIn) {
        // Récupérer le sélecteur de difficulté
        const difficultySelector = document.querySelector('.difficulty-selector');

        if (isUserLoggedIn) {
            // L'utilisateur est connecté
            gameBoard.classList.remove('disabled-game');
            if (document.getElementById('login-required-overlay')) {
                document.getElementById('login-required-overlay').remove();
            }

            // Afficher le sélecteur de difficulté
            if (difficultySelector) {
                difficultySelector.style.display = 'block';
            }

            // Si le jeu n'est pas lancé, afficher un message pour choisir la difficulté
            if (!gameLaunched) {
                gameBoard.innerHTML = '';
                const chooseDiffMessage = document.createElement('div');
                chooseDiffMessage.className = 'choose-difficulty-message';
                chooseDiffMessage.innerHTML = `
                    <i class="fas fa-gamepad fa-3x"></i>
                    <h3>Choisissez un niveau de difficulté</h3>
                    <p>Cliquez sur un des boutons ci-dessus pour commencer à jouer.</p>
                `;
                gameBoard.appendChild(chooseDiffMessage);
            }
        } else {
            // L'utilisateur n'est pas connecté, désactiver le jeu
            gameBoard.innerHTML = '';
            gameBoard.classList.add('disabled-game');

            // Masquer le sélecteur de difficulté
            if (difficultySelector) {
                difficultySelector.style.display = 'none';
            }

            // Créer l'overlay avec message demandant la connexion
            if (!document.getElementById('login-required-overlay')) {
                const overlay = document.createElement('div');
                overlay.id = 'login-required-overlay';
                overlay.className = 'login-required-overlay';

                const message = document.createElement('div');
                message.className = 'login-message';
                message.innerHTML = `
                    <i class="fas fa-lock fa-3x"></i>
                    <h3>Connexion requise</h3>
                    <p>Veuillez vous connecter ou vous inscrire pour jouer au Memory Bleach.</p>
                    <div class="overlay-buttons">
                        <button class="overlay-btn login-overlay-btn">Se connecter</button>
                        <button class="overlay-btn register-overlay-btn">S'inscrire</button>
                    </div>
                `;

                overlay.appendChild(message);
                gameBoard.appendChild(overlay);

                // Ajouter les événements aux boutons de l'overlay
                document.querySelector('.login-overlay-btn').addEventListener('click', () => {
                    loginModal.style.display = 'block';
                });

                document.querySelector('.register-overlay-btn').addEventListener('click', () => {
                    registerModal.style.display = 'block';
                });
            }

            gameInitialized = false;
            gameLaunched = false; // Réinitialiser l'état du lancement
        }
    }

    // Fonction pour afficher des notifications
    function showNotification(message, type = "info") {
        const notif = document.createElement("div");
        notif.className = `notification ${type}`;
        notif.innerHTML = message;
        document.body.appendChild(notif);

        // Animation d'entrée
        setTimeout(() => {
            notif.style.transform = "translateX(0)";
            notif.style.opacity = "1";
        }, 10);

        // Disparition après 3 secondes
        setTimeout(() => {
            notif.style.transform = "translateX(100%)";
            notif.style.opacity = "0";
            setTimeout(() => {
                document.body.removeChild(notif);
            }, 300);
        }, 3000);
    }

    // Initialiser le jeu complet
    function initializeGame() {
        // Créer des paires et mélanger
        let cards = [...characters, ...characters];
        let flippedCards = [];
        let matchedPairs = 0;
        let canFlip = false; // Désactiver les clics jusqu'à la fin de la phase de mémorisation

        // Fonction pour mélanger
        function shuffleArray(array) {
            return array.sort(() => Math.random() - 0.5);
        }

        // Créer le plateau de jeu
        function createBoard() {
            gameBoard.innerHTML = ""; // Nettoyer le plateau

            // Mélanger les cartes
            const shuffledCards = shuffleArray([...cards]);

            // Créer les éléments de carte
            shuffledCards.forEach((character) => {
                const card = document.createElement("div");
                card.className = "card";
                card.dataset.name = character.name;

                const img = document.createElement("img");
                img.src = character.img;
                img.alt = character.name;

                // S'assurer que l'image est chargée correctement
                img.onload = () => {
                    img.style.visibility = "visible";
                };
                img.style.visibility = "hidden"; // Cacher l'image jusqu'à ce qu'elle soit chargée

                card.appendChild(img);
                card.addEventListener("click", flipCard);
                gameBoard.appendChild(card);

                // Animation d'entrée légère
                setTimeout(() => {
                    card.style.opacity = "1";
                    card.style.transform = "translateY(0)";
                }, Math.random() * 500);
            });

            // Montrer les cartes pendant un moment pour mémorisation
            setTimeout(() => {
                // Obtenir le temps de mémorisation basé sur la difficulté actuelle
                const memorizationTime = difficultySettings[currentDifficulty];

                // Calculer les secondes pour l'affichage du décompte
                const secondsToShow = Math.ceil(memorizationTime / 1000);

                // Ajouter un overlay avec un décompte
                const overlay = document.createElement('div');
                overlay.className = 'memorize-overlay';

                const countdown = document.createElement('div');
                countdown.className = 'countdown';
                countdown.textContent = secondsToShow.toString();

                overlay.appendChild(countdown);
                document.body.appendChild(overlay);

                // Montrer toutes les cartes
                document.querySelectorAll('.card').forEach(card => {
                    card.classList.add('flipped');
                });

                // Décompte
                let count = secondsToShow;
                let stepTime = 1000; // 1 seconde par défaut

                // Ajuster l'intervalle pour le niveau difficile
                if (currentDifficulty === 'hard') {
                    stepTime = 500; // 0,5 seconde pour le niveau difficile
                }

                const countdownInterval = setInterval(() => {
                    count--;
                    if (count <= 0) {
                        countdown.textContent = "0";
                    } else {
                        countdown.textContent = count.toString();
                    }

                    // Animation de pulse sur le décompte
                    countdown.classList.add('pulse');
                    setTimeout(() => countdown.classList.remove('pulse'), 300);

                    if (count <= 0) {
                        clearInterval(countdownInterval);

                        // Retourner toutes les cartes
                        document.querySelectorAll('.card').forEach(card => {
                            card.classList.remove('flipped');
                        });

                        // Retirer l'overlay
                        document.body.removeChild(overlay);

                        // Activer le jeu
                        canFlip = true;
                    }
                }, stepTime);
            },); // Attendre 1 seconde avant de montrer les cartes
        }

        // Retourner une carte
        function flipCard() {
            // Empêcher de cliquer sur une carte déjà retournée ou trouvée
            if (!canFlip || flippedCards.length >= 2 || this.classList.contains("flipped") || this.classList.contains("matched")) {
                return;
            }

            this.classList.add("flipped");
            flippedCards.push(this);

            if (flippedCards.length === 2) {
                canFlip = false; // Verrou pendant la vérification
                setTimeout(checkForMatch, 800);
            }
        }

        // Vérifier les paires
        function checkForMatch() {
            const [card1, card2] = flippedCards;

            if (card1.dataset.name === card2.dataset.name) {
                // Match trouvé
                card1.classList.add("matched");
                card2.classList.add("matched");
                matchedPairs++;

                if (matchedPairs === characters.length) {
                    // Victoire !
                    setTimeout(celebrateVictory, 500);
                }
            } else {
                // Pas de match
                setTimeout(() => {
                    card1.classList.remove("flipped");
                    card2.classList.remove("flipped");
                }, 400);
            }

            flippedCards = [];
            setTimeout(() => { canFlip = true; }, 400); // Réactiver les clics après l'animation
        }

        // Célébration de la victoire
        function celebrateVictory() {
            // Ajouter classe de victoire au plateau
            gameBoard.classList.add("victory");

            // Animation sur toutes les cartes
            document.querySelectorAll('.card').forEach((card, index) => {
                setTimeout(() => {
                    card.style.animation = "victoryPulse 2s infinite " + (index * 0.1) + "s";
                }, index * 150);
            });

            // Message de victoire stylisé
            setTimeout(() => {
                const victoryMsg = document.createElement("div");
                victoryMsg.className = "victory-message";
                victoryMsg.innerHTML = "<h2>Bankai ! Tu as gagné ! 🏆</h2>";

                // Bouton pour rejouer
                const replayBtn = document.createElement("button");
                replayBtn.textContent = "Rejouer";

                replayBtn.addEventListener("click", () => {
                    victoryMsg.remove();
                    resetGame();
                });

                victoryMsg.appendChild(replayBtn);
                document.querySelector('.content-wrapper').appendChild(victoryMsg);

                // Effet spécial de victoire sur l'arrière-plan
                document.body.classList.add('victory-bg');
                setTimeout(() => {
                    document.body.classList.remove('victory-bg');
                }, 5000);

                // Si l'utilisateur est connecté, enregistrer le score
                fetch('save_score.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        score: matchedPairs * 100, // Score basé sur le nombre de paires trouvées
                        time: 0 // À implémenter: temps mis pour terminer
                    })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'success') {
                            showNotification(data.message, 'success');
                        } else {
                            console.error('Erreur lors de l\'enregistrement du score:', data.message);
                        }
                    })
                    .catch(error => {
                        console.error('Erreur:', error);
                    });
            }, 1000);
        }

        // Réinitialiser le jeu
        function resetGame() {
            matchedPairs = 0;
            flippedCards = [];
            gameBoard.classList.remove("victory");
            createBoard();
        }

        // Démarrer le jeu
        createBoard();
        gameInitialized = true;
    }

    // Ajouter des styles dynamiques
    const style = document.createElement('style');
    style.innerHTML = `
        .card {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .victory-message h2 {
            color: #e0a800;
            text-align: center;
            margin: 0;
        }
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 15px 25px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border-radius: 5px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            z-index: 1200;
            transform: translateX(100%);
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
        }
        .notification.success {
            border-left: 4px solid #00e676;
        }
        .notification.error {
            border-left: 4px solid #ff5252;
        }
        .notification.info {
            border-left: 4px solid #2196f3;
        }
        .user-info {
            display: flex;
            align-items: center;
        }
        .welcome-msg {
            color: #fff;
            margin-right: 15px;
        }
        .logout-btn {
            background: rgba(255, 82, 82, 0.2);
            border-color: #ff5252;
        }
        .logout-btn:hover {
            background: rgba(255, 82, 82, 0.4);
            box-shadow: 0 0 10px rgba(255, 82, 82, 0.4);
        }
        .disabled-game {
            position: relative;
            min-height: 300px;
            display: flex;
            justify-content: center;
            align-items: center;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
        }
        .login-required-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 100;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
            border-radius: 10px;
        }
        .login-message {
            text-align: center;
            padding: 30px;
            color: white;
        }
        .login-message h3 {
            color: #e0a800;
            margin: 15px 0;
            font-size: 24px;
        }
        .login-message p {
            margin-bottom: 20px;
            display: flex;

        }
        .login-message .fas {
            color: #e0a800;
            margin-bottom: 15px;
        }
        .overlay-buttons {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 20px;
        }
        .overlay-btn {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .login-overlay-btn {
            background: #e0a800;
            color: #000;
        }
        .register-overlay-btn {
            background: transparent;
            color: #fff;
            border: 1px solid #e0a800;
        }
        .overlay-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
        .login-overlay-btn:hover {
            background: #f1b800;
        }
        .register-overlay-btn:hover {
            background: rgba(224, 168, 0, 0.2);
        }
    `;
    document.head.appendChild(style);

    function preloadImages() {
        characters.forEach(char => {
            new Image().src = char.img;
        });
        new Image().src = 'image/back.jpg';
    }
    preloadImages();

    // L'initialisation du jeu est maintenant conditionnelle et contrôlée par updateGameState
});