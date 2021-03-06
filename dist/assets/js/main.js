import { Labyrinthe } from './Labyrinthe.js';

let gameDiv = document.getElementById('game-container');
let rowSel = document.getElementById('row-selector');
let colSel = document.getElementById('col-selector');
let genButton = document.getElementById('genButton');

genButton.addEventListener('click', start);

start();

function start() {
    let game = new Labyrinthe(gameDiv, colSel.value, rowSel.value);
    game.start();
}