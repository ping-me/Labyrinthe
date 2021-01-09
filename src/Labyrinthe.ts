/**
 * Classe représentant les voisins
 */

class Neighbors {
    public north?: [number, number];
    public east?: [number, number];
    public south?: [number, number];
    public west?: [number, number];
}

/**
 * Object représentant une cellule du labyrinthe.
 */
class LabyCell extends HTMLElement {
    public row: number;
    public col: number;
    public wasVisited?: boolean;
    public eastWall?: boolean;
    public southWall?: boolean;
    public neighbors?: Neighbors;

    public constructor() {
        super();
        this.row = 0;
        this.col = 0;
    }

    /**
     * Redimensionne une cellule selon la largeur donnée.
     * @param {int} cellWidth Largeur d'une cellule après calcul du ratio écran.
     */
    public setSize(cellWidth: number) {
        this.style.position = 'absolute';
        this.style.width = cellWidth.toString() + 'px';
        this.style.height = cellWidth.toString() + 'px';
        this.style.top = (this.row * cellWidth).toString() + 'px';
        this.style.left = (this.col * cellWidth).toString() + 'px';
        this.drawWalls();
    }

    /**
     * Permet de définir la position de la cellule.
     * @param {int} col La colonne où se trouve la cellule.
     * @param {int} row La ligne où se trouve la cellule.
     */
    public initCell(col: number, row: number) {
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
    public initWalls(eastWall: boolean, southWall: boolean) {
        this.eastWall = eastWall;
        this.southWall = southWall;
        // Création des voisins
        this.neighbors = {
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
            delete this.neighbors.north;
        }
        else if (this.southWall) {
            delete this.neighbors.south;
        }
        if (this.col === 0) {
            delete this.neighbors.west;
        }
        else if (this.eastWall) {
            delete this.neighbors.east;
        }
    }

    /**
     * Dessine les murs de la cellule.
     */
    public drawWalls() {
        this.style.borderRight = this.eastWall ? '1px solid #000' : '';
        this.style.borderBottom = this.southWall ? '1px solid #000': '';
        this.style.borderTop = this.row ? '' : '1px solid #000';
        this.style.borderLeft = this.col ? '' : '1px solid #000';
    }
}

// Enregistrement de l'élément personnalisé
customElements.define('laby-cell', LabyCell);

/**
 * Classe exportée du module
 */
class Labyrinthe {
    // Le tableau contenant les cellules du labyrinthe
    private readonly labyrinth: LabyCell[];
    // Largeur et hauteur, en cellules
    private readonly cols: number;
    private readonly rows: number;
    // Le div conteneur
    private gameField: HTMLElement;

    /**
     * Permet de définir le div container du jeu, et optionellement définir la taille
     * du labyrinthe.  Par défaut le labyrinthe fait 35 colonnes par 20 lignes.
     * @param {HTMLElement} gameContainer Le div container du jeu.
     * @param {int} col Le nombre de colonnes du labyrinthe.
     * @param {int} row Le nombre de lignes du labyrinthe.
     */
    public constructor(gameContainer: HTMLElement, col: number = 35, row: number = 20) {
        this.labyrinth = [];
        this.gameField = gameContainer;
        this.cols = col;
        this.rows = row;

        this.gameField.innerHTML = '';

        // On génère la grille de base
        for (let y: number = 0; y < this.rows; y++) {
            for (let x: number = 0; x < this.cols; x++) {
                let cellToAdd: LabyCell = <LabyCell>document.createElement('laby-cell');
                cellToAdd.initCell(x, y);
                cellToAdd.initWalls(x === (this.cols - 1), y === (this.rows - 1));
                this.labyrinth[x + y * this.cols] = cellToAdd;
                this.gameField.appendChild(this.labyrinth[x + y * this.cols]);
            }
        }

        // On redimensionne
        this.resizeGamefield();
        window.onresize = this.resizeGamefield;
    }

    /**
     * Démarre le jeu.
     */
    public start() {
        this.search();
    }

    /**
     * Redimensionne les cellules du labyrinthe selon le ratio de la vue.
     */
    private resizeGamefield() {
        let cellWidth: number;
        // On calcule d'abord le ratio
        if (this.gameField.clientHeight < (this.gameField.clientWidth * this.rows / this.cols)) {
            // On tient en hauteur
            cellWidth = this.gameField.clientHeight / this.rows;
        }
        else {
            // On tient en largeur
            cellWidth = this.gameField.clientWidth / this.cols;
        }

        // On redimensionne chaque cellule
        for (let cell: number = 0; cell < this.rows * this.cols; cell++) {
            this.labyrinth[cell].setSize(cellWidth);
        }
    }

    /**
     * Permet de rechercher un chemin dans le labyrinthe.
     * Se rappelle récursivement jusqu'à ce que le labyrinthe soit complété.
     * @param {int} currentCell La cellule à chercher.  Par défaut, la première à l'indice 0.
     */
    private search(currentCell: number = 0) {
        // On marque la case comme ayant été visitée
        this.labyrinth[currentCell].wasVisited = true;

        // Maintenant pour chaque côté, on va vérifier si la cellule a été visitée.
        // Si elle ne l'a pas été, on fait un appel recursif de search
        // sur la cellule non visitée.
        while(Object.keys(<object>this.labyrinth[currentCell].neighbors).length) {
            // Sélection aléatoire d'une cellule voisine
            let cardinal: string = Object.keys(<object>this.labyrinth[currentCell].neighbors)[Math.floor(Math.random() * Object.keys(<object>this.labyrinth[currentCell].neighbors).length)];
            // Récupération des coordonnées de la cellule voisine
            // @ts-ignore
            let nextCellCoord: [number, number] = this.labyrinth[currentCell].neighbors[cardinal];
            let nextCell: number = nextCellCoord[0] + nextCellCoord[1] * this.cols;
            // @ts-ignore
            delete this.labyrinth[currentCell].neighbors[cardinal];
            // La case a-t-elle été visitée ?
            if (this.labyrinth[nextCell].wasVisited) {
                // Oui : on vérifie quel voisin c'est pour rajouter le bon mur
                if (cardinal === 'north') {
                    // Voisin du haut : on lui rajoute un mur au sud
                    this.labyrinth[nextCell].southWall = true;
                    this.labyrinth[nextCell].drawWalls();
                }
                else if (cardinal === 'east') {
                    // Voisin de droite : on rajoute un mur à droite à la cellule en cours
                    this.labyrinth[currentCell].eastWall = true;
                    this.labyrinth[currentCell].drawWalls();
                }
                else if (cardinal === 'south') {
                    // Voisin du bas : on rajoute un mur au sud à la cellule en cours
                    this.labyrinth[currentCell].southWall = true;
                    this.labyrinth[currentCell].drawWalls();
                }
                else if (cardinal === 'west') {
                    // Voisin de gauche : on lui rajoute un mur à droite
                    this.labyrinth[nextCell].eastWall = true;
                    this.labyrinth[nextCell].drawWalls();
                }
            }
            else {
                // Si non visité, on lui indique que la cellule courante est visitée
                if (cardinal === 'north') {
                    // Voisin du haut : on lui indique que la cellule du sud a été visité
                    // @ts-ignore
                    if (this.labyrinth[nextCell].neighbors.hasOwnProperty('south')) {
                        // @ts-ignore
                        delete this.labyrinth[nextCell].neighbors['south'];
                    }
                    this.labyrinth[nextCell].drawWalls();
                }
                else if (cardinal === 'east') {
                    // Voisin de droite : on lui indique que la cellule à l'ouest a été visité
                    // @ts-ignore
                    if (this.labyrinth[nextCell].neighbors.hasOwnProperty('west')) {
                        // @ts-ignore
                        delete this.labyrinth[nextCell].neighbors['west'];
                    }
                    this.labyrinth[nextCell].drawWalls();
                }
                else if (cardinal === 'south') {
                    // Voisin du bas : on lui indique que la cellule au nord a été visité
                    // @ts-ignore
                    if (this.labyrinth[nextCell].neighbors.hasOwnProperty('north')) {
                        // @ts-ignore
                        delete this.labyrinth[nextCell].neighbors['north'];
                    }
                    this.labyrinth[nextCell].drawWalls();
                }
                else if (cardinal === 'west') {
                    // Voisin de gauche : on lui indique que la cellule à l'est a été visité
                    // @ts-ignore
                    if (this.labyrinth[nextCell].neighbors.hasOwnProperty('east')) {
                        // @ts-ignore
                        delete this.labyrinth[nextCell].neighbors['east'];
                    }
                    this.labyrinth[nextCell].drawWalls();
                }
                // Et on la visite
                this.search(nextCell);
            }
        }
    }
}

export { Labyrinthe };