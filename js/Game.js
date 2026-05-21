import {imageCollections} from './ImageCollection.js';
import {ApiService} from './ApiService.js';
import {genererGraphe} from "./Graphe.js";
import {Chronometer, Aleatoire} from "./Utils.js";

/**
 * @event Game.FinPartie
 * @property {{reason:string,showModal:boolean}} detail
 */
class FinPartie extends CustomEvent{
  constructor(reason,showModal=true) {
    super("gameEnd",{detail:{
      reason:reason,
        showModal:showModal
      }});
  }
}

/**
 * @class Game
 * @property {number} #id L'identifiant de la partie
 * @property {settings} #settings Les paramètres de la partie
 * @property {Image[]} #images Un tableau d'{@link Image images}
 * @property {number} #pairesrestantes Le nombre de paires à découvrir
 * @property {string} #state L'état de la partie ("started" ou "ended")
 * @property {number} #remainingAttemps Le nombre de tentatives restantes avec la défaite en mode difficile
 * @property {Graphe} #grapheDiscovered Un graphe qui permet de connaître les arêtes découvertes
 * @property {Graphe} graphe Le graphe initial
 * @property {number} #attempts Le nombre de tentatives totales
 * @property {element|null} #selectedElement L'élément précédemment sélectionné
 */
export class Game {
  /**
   * @type {number}
   */
  #id;
  #settings
  get settings(){
    return Object.freeze(this.#settings);
  }
  /**
   * @type {Image[]}
   */
  #images;
  /**
   * @type {number}
   */
  #pairesrestantes
  /**
   * @type {string}
   */
  #state
  /**
   * @type {number}
   */
  #remainingAttempts
  /**
   * @type {null|element}
   */
  #selectedElement = null;
  /**
   * @type {Graphe}
   */
  #grapheDiscovered = new Map();
  /**
   * @type {number}
   */
  #attemps;
   get attemps(){
    return this.#attemps
  }
  newAttempts(){
     this.#attemps ++;
  }
  /**
   * @type {Graphe}
   */
  graphe;
  /**
   * @type {Chronometer}
   */
  chrono;

  constructor() {
    this.chrono = new Chronometer();
  }

  /**
   * @param {string}reason
   * @param {boolean}[showModal=true] Affiche une fenetre modale ou non à la fin.
   * @return {Game.FinPartie}
   * @constructor
   */
  Fin(reason,showModal=true){
    return new FinPartie(reason,showModal);
  }

  /**
   * @returns {Promise<any>}
   */
  async endGame() {
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
  /**
   * Start a new game.
   * @param {number} id - The game ID.
   * @param {settings} settings Les paramètres de la partie (mode de jeu, difficulté, etc...)
   */
  startGame(id,settings) {
    this.#id = id;
    this.#state = "started"
    this.#settings = settings;
    this.#remainingAttempts=this.#settings.difficulty-1;
    this.#attemps = 0;
    this.#pairesrestantes = this.#settings.difficulty;
    this.#selectedElement = null;
    if (this.#settings.gamemode==="graphe"){
      this.graphe = genererGraphe(Aleatoire.entierAleatoireEntre(4,this.#settings.difficulty),this.#settings.difficulty)
      this.#grapheDiscovered = new Map()
      for (let sommet of this.graphe.keys()){
        this.#grapheDiscovered.set(sommet,[]);
      }
    }
    else{
      this.#images = imageCollections[this.#settings.imageset].toSpliced(this.#settings.difficulty);
    }

  }

  /**
   * Renvoie un tableau d'élément de type Image (chaque élément est un objet qui a pour champs l'id, l'url, et le nom de l'image)
   * @return {Image[]}
   */
  getImages(){
    return this.#images
  }
  get state(){
    return this.#state;
  }

  /**
   * Ajoute une nouvelle tentative au compteur, et décrémente le nombre de tentatives restantes. Termine la partie si le jeu est en hardcore et qu'il reste 0 tentatives
   * @fires Game.FinPartie
   */
  failedAttempt(){
    this.newAttempts();
    this.#remainingAttempts-=1;
    if (this.#remainingAttempts===0 && this.#settings.hardcore){
      document.dispatchEvent(new FinPartie("no-remaining-attempts"))
    }
  }

  /**
   * Indique si un nœud est entièrement découvert, c'est-à-dire si on a découvert toutes ses arêtes.
   * @param {string} node Le nom du nœud dont on veut savoir l'état
   * @return {boolean} Nœud découvert
   */
  isDiscovered(node){
    for (let s_node of this.graphe.get(node)) {
      if (!this.#grapheDiscovered.get(node).includes(s_node)) {
        return false
      }
    }
    return true
  }
  /**
   * Indique si la paire d'éléments est correcte.
   * @param {element} first
   * @param {element} second
   * @return {boolean}
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
   * @returns {interactionResult}
   * @fires Game.FinPartie
   */
  correctPair(){
    this.newAttempts();
    this.#pairesrestantes--;
    if (this.#pairesrestantes===0){
      document.dispatchEvent(this.Fin("regular"))
    }
  }
  /**
   * Selection d'un élément (nœud ou carte), et met en place la logique du jeu pour savoir les actions à entreprendre suivant le statut : Si aucun autre élément n'était sélectionné, on le sélectionne, et on indique au DOM de mettre l'affichage correspondant. Si on a cliqué deux fois sur le même élément, on ignore l'interaction. Si c'est le deuxième élément sélectionné, on les compare, et on agit en conséquences (paire correcte ou erronée)
   * @param {element} element Elément sélectionné.
   * @return {interactionResult} Un résultat, indiquant au DOMManager les modifications à effectuer en fonction du type de résultat (first-element, wrong-pair, correct-pair etc...)
   * @fires Game.FinPartie
   */
  selectElement(element){
    this.chrono.start(); // On lance le chronomètre lors de la première interaction. Le chronomètre vérifie qu'il n'est pas déjà lancé, et les relance n'ont pas d'effet tant que le chrono n'est pas arreté.
    if (this.#selectedElement===null){ // Si aucun élément n'était selectionné, c'est donc le premier
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
    if (same){ //si c'est le cas, on ne le compte pas comme une tentative et on fait comme s'il n'avait pas recliqué
      this.#selectedElement = first;
      return {type:"invalid"}
    }
    if (!this.isCorrectPair(first,second)){ // Si la paire est incorrecte, on indique une tentative infructueuse
      this.failedAttempt();
      return {
        type:"wrong-pair", first, second
      }
    }
    if (this.#settings.gamemode==="graphe"){ // Si le mode de jeu est graphe, on vérifie qu'on a pas déjà découvert cette arête, et si c'est le cas, on n'en tient pas compte.
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
    if (this.#settings.gamemode==="graphe"){ // Si on est en mode graphe, on rajoute aussi des booléens pour indiquer s'il faut marquer les sommets comme entièrement découverts
      return {
        ...result,
        first_discovered:this.isDiscovered(first),
        second_discovered:this.isDiscovered(second)}
    }
    return result;
  }
}
