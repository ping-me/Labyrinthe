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
            };
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
     * @param {int} x La colonne de la cellule à cherhcer.
     * @param {int} y La ligne de la cellule à chercher.
     */
    function search(x, y) {
        // On marque la case comme ayant été visitée
        labyrinth[x + y * cols].wasVisited = true;
        if (labyrinth[x + y * cols].wasVisited) {
            labyrinth[x + y * cols].style.backgroundColor = '#fff';
        }
        else {
            labyrinth[x + y * cols].style.backgroundColor = '#888';
        }

        // Maintenant pour chaque côté, on va vérifier si la cellule a été visitée.
        // Si elle ne l'a pas été, on fait un appel recursif de search
        // sur la cellule non visitée.
        while(Object.keys(labyrinth[x + y * cols].unknownNeighbors).length) {
            // Liste des clés des cellules voisines restantes
            let neighbors = Object.keys(labyrinth[x + y * cols].unknownNeighbors);
            // Sélection aléatoire d'une cellule voisine
            let nextNeighbor = Math.floor(Math.random() * neighbors.length);
            // Récupération des coordonnées de la cellule voisine
            let nextNeighborCoord = labyrinth[x + y * cols].unknownNeighbors[neighbors[nextNeighbor]];
            let nextNeighborIndex = nextNeighborCoord[0] + nextNeighborCoord[1] * cols;
            delete labyrinth[x + y * cols].unknownNeighbors[neighbors[nextNeighbor]];
            // La case a-t-elle été visitée ?
            if (labyrinth[nextNeighborIndex].wasVisited) {
                // Oui : on vérifie quel voisin c'est pour rajouter le bon mur
                if (neighbors[nextNeighbor] === 'north') {
                    // Voisin du haut : on lui rajoute un mur au sud
                    labyrinth[nextNeighborIndex].southWall = true;
                    labyrinth[nextNeighborIndex].drawWalls();
                }
                else if (neighbors[nextNeighbor] === 'east') {
                    // Voisin de droite : on rajoute un mur à droite à la cellule en cours
                    labyrinth[x + y * cols].eastWall = true;
                    labyrinth[x + y * cols].drawWalls();
                }
                else if (neighbors[nextNeighbor] === 'south') {
                    // Voisin du bas : on rajoute un mur au sud à la cellule en cours
                    labyrinth[x + y * cols].southWall = true;
                    labyrinth[x + y * cols].drawWalls();
                }
                else if (neighbors[nextNeighbor] === 'west') {
                    // Voisin de droite : on lui rajoute un mur à gauche
                    labyrinth[nextNeighborIndex].eastWall = true;
                    labyrinth[nextNeighborIndex].drawWalls();
                }
            }
            else {
                // Si non visité, on lui indique que la cellule courante est visitée
                if (neighbors[nextNeighbor] === 'north') {
                    // Voisin du haut : on lui indique que la cellule du sud a été visité
                    if (labyrinth[nextNeighborIndex].unknownNeighbors.hasOwnProperty('south')) {
                        delete labyrinth[nextNeighborIndex].unknownNeighbors['south'];
                    }
                    labyrinth[nextNeighborIndex].drawWalls();
                }
                else if (neighbors[nextNeighbor] === 'east') {
                    // Voisin de droite : on lui indique que la cellule à l'ouest a été visité
                    if (labyrinth[nextNeighborIndex].unknownNeighbors.hasOwnProperty('west')) {
                        delete labyrinth[nextNeighborIndex].unknownNeighbors['west'];
                    }
                    labyrinth[nextNeighborIndex].drawWalls();
                }
                else if (neighbors[nextNeighbor] === 'south') {
                    // Voisin du bas : on lui indique que la cellule au nord a été visité
                    if (labyrinth[nextNeighborIndex].unknownNeighbors.hasOwnProperty('north')) {
                        delete labyrinth[nextNeighborIndex].unknownNeighbors['north'];
                    }
                    labyrinth[nextNeighborIndex].drawWalls();
                }
                else if (neighbors[nextNeighbor] === 'west') {
                    // Voisin de droite : on lui indique que la cellule à l'est a été visité
                    if (labyrinth[nextNeighborIndex].unknownNeighbors.hasOwnProperty('east')) {
                        delete labyrinth[nextNeighborIndex].unknownNeighbors['east'];
                    }
                    labyrinth[nextNeighborIndex].drawWalls();
                }
                // Et on la visite
                search(nextNeighborCoord[0], nextNeighborCoord[1]);
            }
        }
    }

    /**
     * Redimensionne les cellules du labyrinthe selon le ratio de la vue.
     */
    function resizeGamefield() {
        let cellWidth;
        // On calcule d'abord le ratio
        if (gameField.clientHeight > (gameField.clientHeight * cols / rows)) {
            // On tient en hauteur
            cellWidth = gameField.clientHeight / rows;
        }
        else {
            // On tient en largeur
            cellWidth = gameField.clientWidth / cols;
        }

        // On redimensionne chaque cellule
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                labyrinth[x + y * cols].setSize(cellWidth);
            }
        }
    }

    /**
     * Permet de définir le div container du jeu, et optionellement définir la taille
     * du labyrinthe.  Par défaut le labyrinthe fait 35 colonnes par 20 lignes.
     * @param {HTMLDivElement} gameContainer Le div container du jeu.
     * @param {int} col Le nombre de colonnes du labyrinthe.
     * @param {int} row Le nombre de ligne du labyrinthe.
     */
    function setGamefield(gameContainer, col = 35, row = 20) {
        labyrinth = [];
        gameField = gameContainer;
        cols = col;
        rows = row;

        // On génère la grille de base
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                let hasEastWall = false;
                let hasSouthWall = false;
                if (y === (rows - 1)) {
                    hasSouthWall = true;
                }
                if (x === (cols - 1)) {
                    hasEastWall = true;
                }
                let cellToAdd = document.createElement('laby-cell');
                cellToAdd.initCell(x, y);
                cellToAdd.backgroundColor = '#888';
                cellToAdd.initWalls(hasEastWall, hasSouthWall);
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
        // On commence la génération par la case x = 0 et y = 0, en haut à gauche
        search(0, 0);
    }

    return {
        startGame:      startGame,
        setGamefield:   setGamefield
    }
})();
