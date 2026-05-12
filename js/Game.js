import {imageCollections} from './ImageCollection.js';
import {ApiService} from './ApiService.js';
import {genererGraphe} from "./Graphe.js";
import {entierAleatoire} from "./Utils.js";

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
  /**
   * @type {Image}
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
  graphe;
  Fin(reason){
    return new FinPartie(reason);
  }
  async endGame() {
    // Todo À compléter
    if (this.#state !== "ended") {
      this.#state = "ended"
      try {
        const result = await ApiService.updateGameResult(this.#id, this.#pairesrestantes);
        console.log('Fin de partie:', result);
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
   * @param {{playername:string,difficulty:number,gamemode:string,imageset:string,hardcore:boolean}} settings
   */
  startGame(id,settings) {
    this.#id = id;
    this.#state = "started"
    this.#settings = settings;
    this.#remainingAttempts=3;

    if (this.#settings.gamemode==="graphe"){
      this.graphe = genererGraphe(entierAleatoire(this.#settings.difficulty-4)+4,this.#settings.difficulty)
      this.#pairesrestantes = this.#settings.difficulty;
      for (let sommet of this.graphe.keys()){
        this.#grapheDiscovered.set(sommet,[]);
      }
    }
    else{
      this.#images = imageCollections[this.#settings.imageset].splice(0,this.#settings.difficulty);
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
    this.#pairesrestantes--;
    if (this.#pairesrestantes===0){
      document.dispatchEvent(this.Fin("regular"))
    }
  }
  selectElement(element){
    if (this.#selectedElement===null){
      this.#selectedElement = element;
      return{
        type:"first-selection",
        element
      }
    }
    const first = this.#selectedElement;
    const second = element;
    this.#selectedElement = null;
    let same = false;
    switch (this.#settings.gamemode){
      case ("regular"):{
        same = first.index === second.index;
        break
      }
      case ("graphe"):{
        same = first === second;
        break;
      }
    }
    if (same){
      this.#selectedElement = first;
      return {type:"invalid"}
    }
    let correct;
    switch(this.#settings.gamemode){
      case ("regular"):{
        correct = first.id === second.id;
        break;
      }
      case ("graphe"):{
        correct = this.graphe.get(first).includes(second);
        break;
      }
    }
    if (!this.isCorrectPair(first,second)){
      this.failedAttempt();
      return {
        type:"wrong-pair",
        first,
        second
      }
    }
    if (this.#settings.gamemode==="graphe"){
      if(this.#grapheDiscovered.get(first).includes(second)){
        return {
          type: "already-found",
          first
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
      return {...result,first_discovered:this.isDiscovered(first),
        second_discovered:this.isDiscovered(second)}
    }
    return result;
  }
}
