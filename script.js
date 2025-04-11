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

    // Vérifier l'état de connexion au chargement
    checkLoginStatus();

    // Gestion de l'authentification et modales
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const loginModal = document.getElementById("loginModal");
    const registerModal = document.getElementById("registerModal");
    const closeButtons = document.querySelectorAll(".close-modal");
    const navbarAuth = document.querySelector(".navbar-auth");

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
                updateNavbar(data.loggedin, data.username);
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

    // Créer des paires et mélanger
    let cards = [...characters, ...characters];
    let flippedCards = [];
    let matchedPairs = 0;
    let canFlip = true; // Verrou pour éviter les clics trop rapides

    // Fonction pour mélanger
    function shuffleArray(array) {
        return array.sort(() => Math.random() - 0.5);
    }

    // Créer le plateau de jeu
    function createBoard() {
        gameBoard.innerHTML = ""; // Nettoyer le plateau
        shuffleArray(cards).forEach((character) => {
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
            fetch('check_session.php')
                .then(response => response.json())
                .then(data => {
                    if (data.loggedin) {
                        // Enregistrer le score (à implémenter)
                        showNotification('Score enregistré !', 'success');
                    }
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
    `;
    document.head.appendChild(style);

    function preloadImages() {
        characters.forEach(char => {
            new Image().src = char.img;
        });
        new Image().src = 'image/back.jpg';
    }
    preloadImages();

    // Démarrer le jeu
    createBoard();
});