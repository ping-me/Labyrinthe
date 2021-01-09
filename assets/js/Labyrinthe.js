let Labyrinthe = (() => {
    // Le tableau contenant les cellules du labyrinthe
    let labyrinth = null;
    // Le div conteneur
    let gameField = null;
    // Largeur et hauteur, en cellules
    let cols = null;
    let rows = null;

    /**
     * Object représentant une cellule du labyrinthe.
     */
    class LabyCell extends HTMLElement {
        wasVisited;
        row;
        col;
        eastWall;
        southWall;
        unknownNeighbors;

        constructor() {
            super();
        }

        /**
         * Redimensionne une cellule selon la largeur donnée.
         * @param {int} cellWidth Largeur d'une cellule après calcul du ratio écran.
         */
        setSize(cellWidth) {
            this.style.position = 'absolute';
            this.style.width = cellWidth + 'px';
            this.style.height = cellWidth + 'px';
            this.style.top = (this.row * cellWidth) + 'px';
            this.style.left = (this.col * cellWidth) + 'px';
            this.drawWalls();
        }

        /**
         * Permet de définir la position de la cellule.
         * @param {int} col La colonne où se trouve la cellule.
         * @param {int} row La ligne où se trouve la cellule.
         */
        initCell(col, row) {
            this.wasVisited = false;
            this.col = col;
            this.row = row;
        }

        /**
         * Initialize les murs.
         * Génère aussi la liste des voisins, selon la position ou la présence de murs.
         * @param {boolean} eastWall Si true le mur Est est présent.
         * @param {boolean} southWall Si true le mur Sud est présent.
         */
        initWalls(eastWall, southWall) {
            this.eastWall = eastWall;
            this.southWall = southWall;
            // Création des voisins
            this.unknownNeighbors = {
                // Voisin du haut
                north: [this.col, this.row - 1],
                // Voisin de droite
                east: [this.col + 1, this.row],
                // Voisin du bas
                south: [this.col, this.row + 1],
                // Voisin de gauche
                west: [this.col - 1, this.row]
            }
            // Suppression des voisins inutiles pour les cellules périphériques
            if (this.row === 0) {
                delete this.unknownNeighbors['north'];
            }
            else if (this.southWall) {
                delete this.unknownNeighbors['south'];
            }
            if (this.col === 0) {
                delete this.unknownNeighbors['west'];
            }
            else if (this.eastWall) {
                delete this.unknownNeighbors['east'];
            }
        }

        /**
         * Dessine les murs de la cellule.
         */
        drawWalls() {
            this.style.borderRight = this.eastWall ? '1px solid #000' : '';
            this.style.borderBottom = this.southWall ? '1px solid #000': '';
            this.style.borderTop = this.row ? '' : '1px solid #000';
            this.style.borderLeft = this.col ? '' : '1px solid #000';
        }
    }

    // Enregistrement de l'élément personnalisé
    customElements.define('laby-cell', LabyCell);

    /**
     * Permet de rechercher un chemin dans le labyrinthe.
     * Se rappelle récursivement jusqu'à ce que le labyrinthe soit complété.
     * @param {int} currentCell La cellule à chercher.  Par défaut, la première à l'indice 0.
     */
    function search(currentCell = 0) {
        // On marque la case comme ayant été visitée
        labyrinth[currentCell].wasVisited = true;

        // Maintenant pour chaque côté, on va vérifier si la cellule a été visitée.
        // Si elle ne l'a pas été, on fait un appel recursif de search
        // sur la cellule non visitée.
        while(Object.keys(labyrinth[currentCell].unknownNeighbors).length) {
            // Sélection aléatoire d'une cellule voisine
            let cardinal = Object.keys(labyrinth[currentCell].unknownNeighbors)[Math.floor(Math.random() * Object.keys(labyrinth[currentCell].unknownNeighbors).length)];
            // Récupération des coordonnées de la cellule voisine
            let nextCellCoord = labyrinth[currentCell].unknownNeighbors[cardinal];
            let nextCell = nextCellCoord[0] + nextCellCoord[1] * cols;
            delete labyrinth[currentCell].unknownNeighbors[cardinal];
            // La case a-t-elle été visitée ?
            if (labyrinth[nextCell].wasVisited) {
                // Oui : on vérifie quel voisin c'est pour rajouter le bon mur
                if (cardinal === 'north') {
                    // Voisin du haut : on lui rajoute un mur au sud
                    labyrinth[nextCell].southWall = true;
                    labyrinth[nextCell].drawWalls();
                }
                else if (cardinal === 'east') {
                    // Voisin de droite : on rajoute un mur à droite à la cellule en cours
                    labyrinth[currentCell].eastWall = true;
                    labyrinth[currentCell].drawWalls();
                }
                else if (cardinal === 'south') {
                    // Voisin du bas : on rajoute un mur au sud à la cellule en cours
                    labyrinth[currentCell].southWall = true;
                    labyrinth[currentCell].drawWalls();
                }
                else if (cardinal === 'west') {
                    // Voisin de gauche : on lui rajoute un mur à droite
                    labyrinth[nextCell].eastWall = true;
                    labyrinth[nextCell].drawWalls();
                }
            }
            else {
                // Si non visité, on lui indique que la cellule courante est visitée
                if (cardinal === 'north') {
                    // Voisin du haut : on lui indique que la cellule du sud a été visité
                    if (labyrinth[nextCell].unknownNeighbors.hasOwnProperty('south')) {
                        delete labyrinth[nextCell].unknownNeighbors['south'];
                    }
                    labyrinth[nextCell].drawWalls();
                }
                else if (cardinal === 'east') {
                    // Voisin de droite : on lui indique que la cellule à l'ouest a été visité
                    if (labyrinth[nextCell].unknownNeighbors.hasOwnProperty('west')) {
                        delete labyrinth[nextCell].unknownNeighbors['west'];
                    }
                    labyrinth[nextCell].drawWalls();
                }
                else if (cardinal === 'south') {
                    // Voisin du bas : on lui indique que la cellule au nord a été visité
                    if (labyrinth[nextCell].unknownNeighbors.hasOwnProperty('north')) {
                        delete labyrinth[nextCell].unknownNeighbors['north'];
                    }
                    labyrinth[nextCell].drawWalls();
                }
                else if (cardinal === 'west') {
                    // Voisin de gauche : on lui indique que la cellule à l'est a été visité
                    if (labyrinth[nextCell].unknownNeighbors.hasOwnProperty('east')) {
                        delete labyrinth[nextCell].unknownNeighbors['east'];
                    }
                    labyrinth[nextCell].drawWalls();
                }
                // Et on la visite
                search(nextCell);
            }
        }
    }

    /**
     * Redimensionne les cellules du labyrinthe selon le ratio de la vue.
     */
    function resizeGamefield() {
        let cellWidth;
        // On calcule d'abord le ratio
        if (gameField.clientHeight < (gameField.clientWidth * rows / cols)) {
            // On tient en hauteur
            cellWidth = gameField.clientHeight / rows;
        }
        else {
            // On tient en largeur
            cellWidth = gameField.clientWidth / cols;
        }

        // On redimensionne chaque cellule
        for (let cell = 0; cell < rows * cols; cell++) {
            labyrinth[cell].setSize(cellWidth);
        }
    }

    /**
     * Permet de définir le div container du jeu, et optionellement définir la taille
     * du labyrinthe.  Par défaut le labyrinthe fait 35 colonnes par 20 lignes.
     * @param {HTMLElement} gameContainer Le div container du jeu.
     * @param {int} col Le nombre de colonnes du labyrinthe.
     * @param {int} row Le nombre de lignes du labyrinthe.
     */
    function setGamefield(gameContainer, col = 35, row = 20) {
        labyrinth = [];
        gameField = gameContainer;
        cols = col;
        rows = row;

        gameField.innerHTML = '';

        // On génère la grille de base
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                let cellToAdd = document.createElement('laby-cell');
                cellToAdd.initCell(x, y);
                cellToAdd.initWalls(x === (cols - 1), y === (rows - 1));
                labyrinth[x + y * cols] = cellToAdd;
                gameField.appendChild(labyrinth[x + y * cols]);
            }
        }

        // On redimensionne
        resizeGamefield();
        window.onresize = resizeGamefield;
    }

    /**
     * Démarre le jeu.
     */
    function startGame() {
        // On commence la génération
        search();
    }

    return {
        startGame:      startGame,
        setGamefield:   setGamefield
    }
})();
