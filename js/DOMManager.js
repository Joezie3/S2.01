import {Game} from "./Game.js";
import {shuffle,Subject} from "./Utils.js";

export class DOMManager {
  enabled = false;
  graphe;
  /**
   *@type {Game} game
   */
  game;
  constructor(game) {
    this.game = game;
  }
  /**
   * Active les interactions avec le jeu (plus précisement les éléments du plateau, des cartes ou des sommets)
   */
  enableInteraction(){
    this.enabled = true;
  }
  /**
   * Désactive les interactions avec le jeu (plus précisement les éléments du plateau, des cartes ou des sommets)
   */
  disableInteraction(){
    this.enabled = false;
  }
  getCard(index){
    return document.querySelector(`.card[data-index="${index}"]`)
  }
  /**
   * Retourne une carte ou plusieurs cartes.
   * @param {...HTMLDivElement} cards Elements div de class card à retourner.
   */
  flipCards(...cards){
    for (let card of cards){
      card.classList.toggle("flip")
    }
  }
  /**
   * Fais pulser une carte du memory, vert si la paire est correcte, rouge dans l'autre cas.
   * @param {HTMLElement} card Element div de type card
   * @param {boolean} [correct=false] Validité de la paire. Assumé erronée par défaut.
   */
  pulse(card,correct=false){
    card.classList.toggle("pulsing");
    let color = correct?"right":"wrong";
    card.classList.toggle(color);
    setTimeout(()=>{card.classList.toggle(color);card.classList.toggle("pulsing")},1000)
  }

  /**
   * Supprime tous les enfants de l'élément du DOM, de manière non recursive.
   * @param {HTMLElement} element Element dont on souhaite supprimer les éléments enfants.
   */
  removeChildren(element){
    const children = [...element.children]
    for (let child of children){
      child.remove();
    }
  }
  /**
   * Réinitialise l'état du jeu. Supprime le plateau du memory ou memory graphe (selon le mode de jeu), ferme la fenetre modale de résultat, affiche de nouveau le formulaire de séléction du jeu.
   */
  resetAll(){
    switch (this.game.settings.gamemode){
      case ("regular"):{
        this.removeChildren(document.querySelector(".game-board"));
        document.querySelector(".game-board").classList.toggle("hidden");
        break;
      }
      case("graphe"):{
        this.removeChildren(document.querySelector(".graphe-board"));
        document.querySelector(".graphe-board").classList.toggle("hidden")
        break;
      }
    }
    document.querySelector("#abandon").classList.remove("hidden");
    document.querySelector("#show-result").classList.add("hidden");
    this.toggleSetupMenu()
    this.toggleGameArea();
    this.toggleModal(false);
  }

  /**
   * Affiche ou cache l'affichage du menu de sélection pour le jeu
   */
  toggleSetupMenu(){
    document.querySelector(".setup-form").classList.toggle("hidden");
  }

  /**
   * Effectue les modifications sur le DOM à la fin de la partie, c'est-à-dire afficher fenêtre de résultat, cacher le bouton abandonner, afficher le bouton pour afficher la fenetre de résultat
   * @param {Response}result Résultat de la partie renvoyé par le serveur distant. Contient entre autre le score du joueur.
   * @param {string} reason Raison de la fin de partie. Soit "regular" (le joueur a tout découvert), "no-remaining-attempts" (le joueur a utilisé toutes ses tentatives autorisées dans le mode difficile, et "abandon" (le joueur a abandonné)
   */
  endGame(result,reason){
    const modal = document.querySelector("#endgame-modal");
    modal.querySelector("#modal-time").innerText = this.game.chrono.time;
    modal.querySelector("#modal-score").innerText = result.score;
    modal.querySelector("#modal-attemps").innerText = this.game.attemps;
    modal.querySelector("#modal-difficulty").innerText = this.game.settings.difficulty;
    modal.querySelector("#modal-mode").innerText = this.game.settings.gamemode === "regular"?"Memory":"Graphe";
    let message;
    switch (reason){
      case ("regular"):{
        message = "Bravo ! Vous avez gagné";
        break;
      }
      case ("no-remaining-attempts"):{
        message = "Dommage ! Vous avez épuisé toutes vos tentatives";
        break;
      }
      case ("abandon"):{
        message = "Vous avez abandonné !";
        break;
      }
    }
    modal.querySelector(".modal-message").innerText = message;
    document.querySelector("#abandon").classList.add("hidden");
    document.querySelector("#show-result").classList.remove("hidden");
    this.toggleModal();
  }

  /**
   * Affiche ou cache le plateau de jeu.
   */
  toggleGameArea(){
    document.querySelector(".game-area").classList.toggle("hidden");
  }
  /**
   *
   * @param {boolean} state Visibilité de la fenêtre
   */
  toggleModal(state = undefined){
    const modal = document.querySelector("#endgame-modal");
    if (state === undefined){
      modal.classList.toggle("hidden");
    }
    else {
      if (state===true){
        modal.classList.remove("hidden");
      }
      else{
        modal.classList.add("hidden");
      }
    }
  }
  /**
   * Effectue les changements nécessaires pour l'affichage du memory en fonction des indications dans le résultat fourni par le moteur logique du jeu (Game.js)
   * @param {interactionResult} result Résultat d'interactions du joueur renvoyer par le moteur logique du jeu. Les différents cas sont principalement désigné par la nature du résultat (paire correcte, etc...)
   */
  handleCardResult(result){
    if (result.type==="first-selection")this.flipCards(this.getCard(result.element.index))
    else{
      let firstCard = this.getCard(result.first.index);
      let secondCard = this.getCard(result.second.index);
      this.flipCards(secondCard);
      switch (result.type){
        case ("wrong-pair"):{
          this.disableInteraction();
          this.pulse(firstCard);
          this.pulse(secondCard);
          setTimeout(()=>{
            this.flipCards(firstCard,secondCard);
            this.enableInteraction()
          },1000);
          break;
        }
        case ("correct-pair"):{
          firstCard.classList.add("found");
          secondCard.classList.add("found");
          this.pulse(firstCard,true);
          this.pulse(secondCard,true);
        }
      }
    }
  }
  /**
   * Gère l'interaction avec une carte en appelant le moteur logique du jeu et en interprétant les résultats
   * @param {Event} event
   */
  clickCard(event){
    const card = event.target.closest("div.card");
    if (card.classList.contains("found")){
      return;
    }
    const result = this.game.selectElement({index:parseInt(card.dataset["index"]),id : parseInt(card.dataset["id"])});
    console.log(result)
    this.handleCardResult(result);

  }
  /**
   * Met en surbrillance un nœud
   * @param {string} node Le nom du sommet
   */
  highlightNode(node){
    document.querySelector(`.sommet[data-node=${node}]`).classList.toggle("selected");
  }
  /**
   * Marque le sommet comme entièrement découvert, empêchant les interactions avec ce dernier.
   * @param {string}node Le nom du sommet
   */
  discoverNode(node){
    document.querySelector(`.sommet[data-node=${node}]`).classList.add("found")
  }
  /**
   * Gère l'interaction avec un sommet en appelant le moteur logique du jeu et en interprétant les résultats
   * @param {Event} event
   */
  clickNode(event){
    const node = event.target.dataset.node;
    if (event.target.classList.contains("found")){
      return;
    }
    const result = this.game.selectElement(node);
    console.log(result)
    this.handleGraphResult(result);
  }
  /**
   * Affiche l'arête entre deux sommets (à condition qu'elle existe)
   * @param {string} first Le nom du premier sommet
   * @param {string} second Le nom du deuxième sommet
   */
  showEdge(first,second){
    for (let edge of document.querySelectorAll("line")){
      if (edge.dataset["nodes"].includes([first,second].sort().join())){
        edge.classList.remove("hidden");
        return;
      }
    }
  }
  /**
   * Effectue les changements nécessaires pour l'affichage du graphe en fonction des indications dans le résultat fourni par le moteur logique du jeu (Game.js)
   * @param {interactionResult} result
   */
  handleGraphResult(result){
    switch(result.type){
      case("first-selection"):{
        this.highlightNode(result.element); break
      }
      case("correct-pair"):{
        this.highlightNode(result.first)
        this.showEdge(result.first,result.second);
        if (result.first_discovered){this.discoverNode(result.first);}
        if (result.second_discovered){this.discoverNode(result.second)};break
      }
      case("wrong-pair"):{
        this.highlightNode(result.first);break
      }
      case("already-found"):{ // Si le nœud sur lequel on clique
        this.highlightNode(result.first);break
      }
    }
    let allDiscovered = true
    for (let node of this.game.graphe.keys()){
      if (!this.game.isDiscovered(node)){
        allDiscovered=false;
      }
    }
    if (allDiscovered){
      this.disableInteraction();
    }
  }

  /**
   * Crée un élément div de classe card, à partir d'un template.
   * @param {Image}image Un objet de type Image, contenant l'identifiant de l'image, son url et son nom.
   * @param {number}cardIndex L'index du div, permettant de différencier deux cartes ayant la même image.
   * @returns {HTMLDivElement}
   */
  createCard(image,cardIndex){
    const cardTemplate = document.querySelector("#cardTemplate");
    let card = cardTemplate.content.cloneNode(true).querySelector(".card");
    card.dataset["id"] = `${image.id}`;
    card.dataset["index"] = cardIndex;
    let img = card.querySelector(".card-back img");
    img.setAttribute("src",image.url);
    img.setAttribute("alt",image.name);
    card.querySelector(".card-inner").addEventListener("click",(event)=>{if (this.enabled){this.clickCard(event)}});
    return card;
  }
  /**
   * Ajoute toutes les images d'une collection sur le gameBoard. Crée chacune des images et mélange le set, puis les ajoute au DOM.
   * @param {Image[]} images Le set d'image à ajouter.
   */
  createCards(images) {
    const gameBoard = document.querySelector('.game-board');
    const cardElements = [];
    let cardIndex = 0;
    for (let image of images){
      cardElements.push(this.createCard(image,cardIndex++));
      cardElements.push(this.createCard(image,cardIndex++));
    }
    shuffle(cardElements);
    for (let image of cardElements){
      gameBoard.append(image);
    }
  }

  /**
   * Genère les positions (x,y) pour afficher le Graphe. Utilise l'algorithme de positionnement radial, qui place tous les sommets sur un cercle, avec des perturbations (du "bruits")
   * @param {node[]}sommets La liste des sommets à positionner
   * @param {number}largeur La largeur disponible pour dessiner le graphe
   * @param {number}hauteur La hauteur disponible pour dessiner le graphe
   * @returns {Map<node,Coordinate>}
   */
  genererPositions(sommets, largeur, hauteur) {
    /**
     * @type {Map<node,Coordinate>}
     */
    const positions = new Map();
    const test = {"a":{x:1,y:2}}
    const centreX = largeur / 2;
    const centreY = hauteur / 2;

    const marge = 60;

    const rayon = Math.min(largeur, hauteur) / 2 - marge;

    const angleStep = (2 * Math.PI) / sommets.length;

    sommets.forEach((sommet, i) => {
      const angle = i * angleStep;
      const bruit = 30;
      positions.set(sommet, {
        x: centreX + Math.cos(angle) * rayon + (Math.random() * bruit - bruit / 2),
        y: centreY + Math.sin(angle) * rayon + (Math.random() * bruit - bruit / 2)
      });
    });
    return positions;
  }

  createBoard(){
    switch (this.game.settings.gamemode){
      case ("regular"):{
        this.createCards(this.game.getImages())
        document.querySelector(".game-board").classList.toggle("hidden")
        break;
      }
      case ("graphe"):{
        this.createGraphe(this.game.graphe)
        document.querySelector(".graphe-board").classList.toggle("hidden");
      }
    }
  }
  /**
   * Ajoute toutes les images d'une collection sur le gameBoard
   * @param {Map<String,String[]>} graphe
   */
  createGraphe(graphe){
    let grapheElement = document.querySelector("#graphe");
    const positions = this.genererPositions(Array.from(graphe.keys()),document.querySelector(".game-area-header").clientWidth,400);
    const svg = document.querySelector("svg#liens");
    let aretes = [];
    for (const sommet of graphe.keys()) {
      let sommetEl = document.createElement("div");
      sommetEl.classList.toggle("sommet");
      sommetEl.innerText = sommet;
      sommetEl.dataset["node"] = sommet;
      sommetEl.style.left = positions[sommet].x + "px";
      sommetEl.style.top = positions[sommet].y + "px";
      sommetEl.addEventListener("click",(event)=>{if(this.enabled){this.clickNode(event)}})
      grapheElement.append(sommetEl)
      for (let voisin of graphe.get(sommet)) {
        const edge_string = [sommet,voisin].sort().join();
        if (!aretes.includes(edge_string)) { // On ne trace pas plusieurs fois une arête.
          aretes.push(edge_string);
          const ligne = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "line"
          );
          ligne.dataset["nodes"] = edge_string;
          ligne.classList.add("hidden")
          ligne.setAttribute("x1", positions[sommet].x + 25);
          ligne.setAttribute("y1", positions[sommet].y + 25);

          ligne.setAttribute("x2", positions[voisin].x + 25);
          ligne.setAttribute("y2", positions[voisin].y + 25);

          ligne.setAttribute("stroke", "lightgrey");
          ligne.setAttribute("stroke-width", "3");

          svg.appendChild(ligne);
        }
      }
    }
  }
}
/**
 * Voici un exemple de contenu de card permettant de contenir une partie masqué
 * et l'image qui doit être révélée.
 *
 <div class="card-inner">
 <div class="card-front">
 <img src="./assets/images/mask1.jpg" alt="Hidden card">
 </div>
 <div class="card-back hidden">
 <img src="${image.url}" alt="${image.name}">
 </div>
 </div>
 */