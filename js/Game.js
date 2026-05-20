import {imageCollections} from './ImageCollection.js';
import {ApiService} from './ApiService.js';
import {genererGraphe} from "./Graphe.js";
import {Chronometer, Aleatoire, entierAleatoire} from "./Utils.js";

class FinPartie extends CustomEvent{
  constructor(reason) {
    super("gameEnd",{detail:{
      reason:reason
      }});
  }
}
export class Game {
  /**
   * @type {number} id identifiant de la partie en cours
   */
  #id;
  /**
   * @type {settings}
   */
  #settings
  get settings(){
    return Object.freeze(this.#settings);
  }
  /**
   * @type {Image[]}
   */
  #images;
  #pairesrestantes
  #state
  #remainingAttempts
  /**
   * @type {null|element}
   */
  #selectedElement = null;
  /**
   *
   * @type {Map<string, string[]>}
   */
  #grapheDiscovered = new Map();
  #attemps;
   get attemps(){
    return this.#attemps
  }
  newAttempts(){
     this.#attemps ++;
  }
  graphe;
  /**
   * @type {Chronometer}
   */
  chrono;
  constructor() {
    this.chrono = new Chronometer();
  }
  Fin(reason){
    return new FinPartie(reason);
  }
  async endGame() {
    // Todo À compléter
    if (this.#state !== "ended") {
      this.chrono.stop();
      this.#state = "ended"
      try {
        const result = await ApiService.updateGameResult(this.#id, this.#pairesrestantes);
        console.log('Fin de partie:', result);
        return result
      } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Erreur lors de la fin de la partie');
      }

    }
  }
  // /**
  //  * Start a new game.
  //  * @param {number} id - The game ID.
  //  * @param {string} gamemode
  //  * @param {number} difficulty
  //  * @param {boolean} hardcore
  //  */
  /**
   * Start a new game.
   * @param {number} id - The game ID.
   * @param {settings} settings Les paramètres de la partie (mode de jeu, difficulté, etc...)
   */
  startGame(id,settings) {
    this.#id = id;
    this.#state = "started"
    this.#settings = settings;
    this.#remainingAttempts=3;
    this.#attemps = 0;
    if (this.#settings.gamemode==="graphe"){
      this.graphe = genererGraphe(Aleatoire.entierAleatoireEntre(4,this.#settings.difficulty),this.#settings.difficulty)
      this.#pairesrestantes = this.#settings.difficulty;
      this.#grapheDiscovered = new Map()
      for (let sommet of this.graphe.keys()){
        this.#grapheDiscovered.set(sommet,[]);
      }
    }
    else{
      this.#images = imageCollections[this.#settings.imageset].toSpliced(this.#settings.difficulty);
      this.#pairesrestantes = this.#settings.difficulty;
    }

  }
  getImages(){
    return this.#images
  }
  get state(){
    return this.#state;
  }
  failedAttempt(){
    this.newAttempts();
    this.#remainingAttempts-=1;
    if (this.#remainingAttempts===0 && this.#settings.hardcore){
      console.log("FIN DE LA PARTIE HARDCORE")
      document.dispatchEvent(new FinPartie("no-remaining-attempts"))
    }
  }

  isDiscovered(node){
    for (let s_node of this.graphe.get(node)) {
      if (!this.#grapheDiscovered.get(node).includes(s_node)) {
        return false
      }
    }
    return true
  }

  /**
   * Indique si la paire d'éléments est correct.
   * @param {element} first
   * @param {element} second
   * @return boolean
   */
  isCorrectPair(first,second){
    switch (this.#settings.gamemode){
      case ("regular"):{
        return first.id === second.id;
      }
      case ("graphe"):{
        return this.graphe.get(first).includes(second)
      }
    }
  }
  /**
   *
   * @param {element} element
   * @returns {{type: string, first: null, second: *}|{type: string}|{type: string, first: null, second: *}|{type: string, first: null}|{type: string, element: *}|{type: string, first: null, second: *, first_discovered: boolean, second_discovered: boolean}}
   */
  correctPair(){
    this.newAttempts();
    this.#pairesrestantes--;
    if (this.#pairesrestantes===0){
      document.dispatchEvent(this.Fin("regular"))
    }
  }
  selectElement(element){
    this.chrono.start();
    if (this.#selectedElement===null){
      this.#selectedElement = element;
      return{
        type:"first-selection", element
      }
    }
    const first = this.#selectedElement;
    const second = element;
    this.#selectedElement = null;
    let same = false;
    switch (this.#settings.gamemode){ // Est-ce que le joueur a cliqué deux fois sur le même élément
      case ("regular"):{
        same = first.index === second.index; // Pour le memory classique, les éléments cartes ont des index, si l'index est le même, il a cliqué deux fois sur le même élément
        break
      }
      case ("graphe"):{
        same = first === second; // Pour le graphe, si les deux sommets ont le même nom, il a cliqué sur le même sommet
        break;
      }
    }
    if (same){ //si c'est le cas, on ne le compte pas comme une tentative et on fait comme si il n'avait pas recliqué
      this.#selectedElement = first;
      return {type:"invalid"}
    }
    if (!this.isCorrectPair(first,second)){
      this.failedAttempt();
      return {
        type:"wrong-pair", first, second
      }
    }
    if (this.#settings.gamemode==="graphe"){
      if(this.#grapheDiscovered.get(first).includes(second)){
        return {
          type: "already-found", first
        }
      }
      else{
        this.#grapheDiscovered.get(first).push(second);
        this.#grapheDiscovered.get(second).push(first)
      }
    }
    let result = {type:"correct-pair",first,second};
    this.correctPair();
    if (this.#pairesrestantes === 0){
      document.dispatchEvent(this.Fin("regular"));
    }
    if (this.#settings.gamemode==="graphe"){
      return {
        ...result,
        first_discovered:this.isDiscovered(first),
        second_discovered:this.isDiscovered(second)}
    }
    return result;
  }
}
