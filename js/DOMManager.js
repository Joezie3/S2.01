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
  enable(){
    this.enabled = true;
  }
  disable(){
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
  pulse(card,correct){
    card.classList.toggle("pulsing");
    let color = correct?"right":"wrong";
    card.classList.toggle(color);
    setTimeout(()=>{card.classList.toggle(color);card.classList.toggle("pulsing")},1000)

  }
  handleCardResult(result){
    if (result.type==="first-selection")this.flipCards(this.getCard(result.element.index))
    else{
      let firstCard = this.getCard(result.first.index);
      let secondCard = this.getCard(result.second.index);
      this.flipCards(secondCard);
      switch (result.type){
        case ("wrong-pair"):{
          this.disable();
          this.pulse(firstCard);
          this.pulse(secondCard);
          setTimeout(()=>{
            this.flipCards(firstCard,secondCard);
            this.enable()
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
   * Met en surbrillance un noeud
   * @param {string} node Le nom du sommet
   */
  highlightNode(node){
    document.querySelector(`.sommet[data-node=${node}]`).classList.toggle("selected");
  }
  discoverNode(node){
    document.querySelector(`.sommet[data-node=${node}]`).classList.add("found")
  }
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
      case("already-found"):{
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
      this.disable();
    }
  }
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
   * Ajoute toutes les images d'une collection sur le gameBoard
   * @param {Image[]} images
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
  genererPositions(sommets, largeur, hauteur) {
    console.log(largeur,hauteur)
    const positions = {};

    const centreX = largeur / 2;
    const centreY = hauteur / 2;

    const marge = 60;

    const rayon = Math.min(largeur, hauteur) / 2 - marge;

    const angleStep = (2 * Math.PI) / sommets.length;

    sommets.forEach((sommet, i) => {
      const angle = i * angleStep;
      const bruit = 30;
      positions[sommet] = {
        x: centreX + Math.cos(angle) * rayon + (Math.random() * bruit - bruit / 2),
        y: centreY + Math.sin(angle) * rayon + (Math.random() * bruit - bruit / 2)
      };
    });
    return positions;
  }
  showModal(result,reason){
    const modal = document.querySelector("#endgame-modal");
    modal.querySelector("#modal-time").innerText = this.game.chrono.time;
    modal.querySelector("#modal-score").innerText = result.score;
    modal.querySelector("#modal-attemps").innerText = this.game.attemps;
    modal.querySelector("#modal-difficulty").innerText = this.game.settings.difficulty
    modal.querySelector("#modal-mode").innerText = this.game.settings.gamemode === "regular"?"Memory":"Graphe"
    let message;
    switch (reason){
      case ("regular"):{
        message = "Bravo ! Vous avez gagné";break
      }
      case ("no-remaining-attempts"):{
        message = "Dommage ! Vous avez épuisé toutes vos tentatives";break;
      }
      case ("abandon"):{
        message = "Vous avez abandonné !";break;
      }
    }
    modal.querySelector(".modal-message").innerText = message;
    modal.classList.remove("hidden");
  }
  closeModal(){
    const modal = document.querySelector("#endgame-modal").classList.add("hidden");
  }
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