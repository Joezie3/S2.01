import {imageCollections} from './ImageCollection.js';
import {ApiService} from './ApiService.js';

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
  #setname;
  #images;
  #difficulty
  #pairesrestantes
  #state

  Fin(reason){
    return new FinPartie(reason);
  }
  async endGame() {
    // Todo À compléter
    if (this.state !== "ended") {
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

  /**
   * Start a new game.
   * @param {number} id - The game ID.
   */
  startGame(id) {
    this.#id = id;
    this.#state = "started"

  }
  setImage(setName,difficulty){
    this.#setname  = setName;
    this.#difficulty = difficulty;
    this.#images = imageCollections[this.#setname].splice(this.#difficulty)
    this.#pairesrestantes = this.#difficulty;
  }
  getImage(){
    return this.#images
  }
  get state(){
    return this.#state;
  }
  paireDecouverte(event){
    console.log(event.detail)
    this.#pairesrestantes-=1;
    if (this.#pairesrestantes===0){
        document.dispatchEvent(new FinPartie("regular"))
    }
  }

}
