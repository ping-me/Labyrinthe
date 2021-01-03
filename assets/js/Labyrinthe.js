let Labyrinthe = (() => {
    // Le tableau contenant les cellules du labyrinthe
    let labyrinth = null;
    // Le div conteneur
    let gameField = null;
    // Largeur et hauteur, en cellules
    let cols = null;
    let rows = null;

    /**
     * Object représentant un cellule du labyrinthe
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

        setSize(cellWidth) {
            this.style.position = 'absolute';
            this.style.width = cellWidth + 'px';
            this.style.height = cellWidth + 'px';
            this.style.top = (this.row * cellWidth) + 'px';
            this.style.left = (this.col * cellWidth) + 'px';
            this.drawWalls();
        }

        initCell(col, row) {
            this.wasVisited = false;
            this.col = col;
            this.row = row;
        }

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
            if (this.row == 0) {
                delete this.unknownNeighbors['north'];
            }
            else if (this.southWall) {
                delete this.unknownNeighbors['south'];
            }
            if (this.col == 0) {
                delete this.unknownNeighbors['west'];
            }
            else if (this.eastWall) {
                delete this.unknownNeighbors['east'];
            }
        }

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
     * @param {int} x La colonne de la cellule à cherhcer
     * @param {int} y La ligne de la cellule à chercher
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

        // Maintenant pour chaque côté, on va vérifier si la case a été visitée
        // Si elle ne l'a pas été, on fait un appel recursif de search sur la case non visitée
        while(Object.keys(labyrinth[x + y * cols].unknownNeighbors).length) {
            // Liste des clé des voisins restant
            neighbors = Object.keys(labyrinth[x + y * cols].unknownNeighbors);
            nextNeighbor = Math.floor(Math.random() * neighbors.length);
            nextNeighborCoord = labyrinth[x + y * cols].unknownNeighbors[neighbors[nextNeighbor]];
            nextNeighborI = nextNeighborCoord[0] + nextNeighborCoord[1] * cols;
            delete labyrinth[x + y * cols].unknownNeighbors[neighbors[nextNeighbor]];
            // La case a-t-elle été visitée ?
            if (labyrinth[nextNeighborI].wasVisited) {
                // Oui : on vérifie quel voisin c'est pour rajouter le bon mur
                if (neighbors[nextNeighbor] === 'north') {
                    // Voisin du haut : on lui rajoute un mur au sud
                    labyrinth[nextNeighborI].southWall = true;
                    labyrinth[nextNeighborI].drawWalls();
                }
                else if (neighbors[nextNeighbor] == 'east') {
                    // Voisin de droite : on rajoute un mur à droite à la cellule en cours
                    labyrinth[x + y * cols].eastWall = true;
                    labyrinth[x + y * cols].drawWalls();
                }
                else if (neighbors[nextNeighbor] == 'south') {
                    // Voisin du bas : on rajoute un mur au sud à la cellule en cours
                    labyrinth[x + y * cols].southWall = true;
                    labyrinth[x + y * cols].drawWalls();
                }
                else if (neighbors[nextNeighbor] == 'west') {
                    // Voisin de droite : on lui rajoute un mur à gauche
                    labyrinth[nextNeighborI].eastWall = true;
                    labyrinth[nextNeighborI].drawWalls();
                }
            }
            else {
                // Si non visité, on lui indique que la case courante est visitée
                if (neighbors[nextNeighbor] === 'north') {
                    // Voisin du haut : on lui indique que le voisin du sud a été visité
                    if (labyrinth[nextNeighborI].unknownNeighbors.hasOwnProperty('south')) {
                        delete labyrinth[nextNeighborI].unknownNeighbors['south'];
                    }
                    labyrinth[nextNeighborI].drawWalls();
                }
                else if (neighbors[nextNeighbor] == 'east') {
                    // Voisin de droite : on lui indique que le voisin à l'ouest a été visité
                    if (labyrinth[nextNeighborI].unknownNeighbors.hasOwnProperty('west')) {
                        delete labyrinth[nextNeighborI].unknownNeighbors['west'];
                    }
                    labyrinth[nextNeighborI].drawWalls();
                }
                else if (neighbors[nextNeighbor] == 'south') {
                    // Voisin du bas : on lui indique que le voisin au nord a été visité
                    if (labyrinth[nextNeighborI].unknownNeighbors.hasOwnProperty('north')) {
                        delete labyrinth[nextNeighborI].unknownNeighbors['north'];
                    }
                    labyrinth[nextNeighborI].drawWalls();
                }
                else if (neighbors[nextNeighbor] == 'west') {
                    // Voisin de droite : on lui indique que le voisin à l'est a été visité
                    if (labyrinth[nextNeighborI].unknownNeighbors.hasOwnProperty('east')) {
                        delete labyrinth[nextNeighborI].unknownNeighbors['east'];
                    }
                    labyrinth[nextNeighborI].drawWalls();
                }
                // Et on la visite
                search(nextNeighborCoord[0], nextNeighborCoord[1]);
            }
        }
    }

    /**
     * Redimensionne les cellules du labyrinthe selon le ratio de la vue
     */
    function resizeGamefield() {
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
     * du labyrinthe.  Par défaut le labyrinthe fait 20 lignes par 40 colonnes.
     * @param {HTMLDivElement} gameContainer Le div container du jeu
     * @param {int} row Le nombre de ligne du labyrinthe
     * @param {int} col Le nombre de colonnes du labyrinthe
     */
    function setGamefield(gameContainer, row = 20, col = 40) {
        labyrinth = [];
        gameField = gameContainer;
        rows = row;
        cols = col;

        // On génère la grille de base
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                let hasEastWall = false;
                let hasSouthWall = false;
                if (y == (rows - 1)) {
                    hasSouthWall = true;
                }
                if (x == (cols - 1)) {
                    hasEastWall = true;
                }
                cellToAdd = document.createElement('laby-cell');
                cellToAdd.initCell(x, y);
                cellToAdd.backgroundColor = '#888';
                cellToAdd.initWalls(hasEastWall, hasSouthWall);
                labyrinth[x + y * cols] = cellToAdd;
                gameField.appendChild(labyrinth[x + y * cols]);
            }
        }

        // On redimesionne
        resizeGamefield();
        window.onresize = resizeGamefield;
    }

    /**
     * Démarre le jeu
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
