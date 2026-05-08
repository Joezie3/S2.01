function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}

class PairFound extends CustomEvent{
  constructor(id) {
    super("pair-discovered",{
      detail:{
        pairId : id
      }
    });
  }
}
class WrongPair extends CustomEvent{
  constructor() {
    super("wrong-pair");
  }
}
class Chronometer{
  startTime;
  started;
  stopped;
  intervalId;
  updateTime(){
    document.querySelector(".game-timer").innerText = (new Date(Date.now()).getTime() - this.startTime.getTime())/1000;
  }
  start(){
    if (!this.started) {
      this.startTime = new Date(Date.now());
      this.started = true;
      this.intervalId = setInterval(()=>{this.updateTime()}, 100);
    }
  }
  stop(){
    clearInterval(this.intervalId);
    this.stopped = true;
  }
}

export class DOMManager {
  chrono = new Chronometer();
  enabled = false;
  graphe;
  enable(){
    this.enabled = true;
  }
  disable(){
    this.enabled = false;
  }
  flipCard(card){
    card.classList.toggle("flip")
  }
  pulse(card,correct){
    card.classList.toggle("pulsing");
    let color = correct?"right":"wrong";
    card.classList.toggle(color);
    setTimeout(()=>{card.classList.toggle(color);card.classList.toggle("pulsing")},1000)

  }
  /**
   * @param {Event}event
   */
  clickImage(event){
    if (!this.enabled){ // Si les actions sont interdites, on ne réagit pas
      return;
    }
    this.chrono.start(); // On lance le chronomètre lorsque la première carte est cliqué. Le chronomètre vérifie qu'il n'est pas déjà lancé, donc les cartes suivantes n'auront pas d'impact dessus.
    let card = event.target.closest(".card");
    if (card.classList.contains("found") || card.classList.contains("selected")){ // Si la carte est déjà retournée, on ne fait rien

    }
    else{
      this.flipCard(card)

      let secondCard;
      for (let tempCard of document.querySelectorAll(".card")){
        if (tempCard.classList.contains("selected")){
          secondCard = tempCard;
          break;
        }
      }
      if (secondCard != null){ // Si c'est la deuxième carte qu'on retourne, on effectue les vérifications
        this.disable(); // On désactive les actions pour éviter que les joueurs clique sur toutes les cartes à la fois avant même qu'elles n'aient pu être retournées pour les cacher.
        console.log("Seconde carte")
        console.log(card)
        secondCard.classList.toggle("selected");
        if (card.dataset["id"] === secondCard.dataset["id"]){
          console.log("Bonne paire");
          secondCard.classList.toggle("found");
          card.classList.toggle("found")
          this.pulse(card,true);
          this.pulse(secondCard,true)
          this.enable(); // Si les cartes sont identiques, le joueur peut directement continuer de retourner
          document.dispatchEvent(new PairFound(card.dataset["id"]))
        }
        else{
          console.log("Mauvaise paire")

          this.pulse(card);
          this.pulse(secondCard);
          setTimeout(()=>{
            this.flipCard(secondCard);
            this.flipCard(card);
            this.enable(); // Si les cartes étaient différentes, on attend qu'elles soient de nouveaux cachées pour laisser le joueur jouer.
            document.dispatchEvent(new WrongPair());
          },1000)
        }
      }
      else{
        console.log("Première carte")
        card.classList.toggle("selected")
      }
    }
  }
  createCard(image){
    const cardTemplate = document.querySelector("#cardTemplate");
    let card = cardTemplate.content.cloneNode(true).querySelector(".card");
    card.dataset["id"] = `${image.id}`;
    //card.dataset["state"] = "hidden"
    let img = card.querySelector(".card-back img");
    img.setAttribute("src",image.url);
    img.setAttribute("alt",image.name);
    card.querySelector(".card-inner").addEventListener("click",(event)=>{this.clickImage(event)});
    return card;
  }
  /**
   * Ajoute toutes les images d'une collection sur le gameBoard
   * @param {Image[]} images
   */
  createCards(images) {

    const gameBoard = document.querySelector('.game-board');
    const cardElements = [];
    for (let image of images){
      cardElements.push(this.createCard(image));
      cardElements.push(this.createCard(image));
    }
    shuffle(cardElements);
    for (let image of cardElements){
      gameBoard.append(image);
    }
    // Todo À Compléter

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

  }
  genererPositions(sommets, largeur, hauteur) {
    console.log(largeur,hauteur)
    const positions = {};

    const centreX = largeur / 2;
    const centreY = hauteur / 2;

    const marge = 60;

    const rayon =
        Math.min(largeur, hauteur) / 2 - marge;


    const angleStep = (2 * Math.PI) / sommets.length;

    sommets.forEach((sommet, i) => {
      const angle = i * angleStep;
      const bruit = 30;
      positions[sommet] = {

        x:
            centreX +
            Math.cos(angle) * rayon +
            (Math.random() * bruit - bruit / 2),

        y:
            centreY +
            Math.sin(angle) * rayon +
            (Math.random() * bruit - bruit / 2)
      };
    });
    return positions;
  }

  clickNode(event){
    let node = event.target;
    if (!node.classList.contains("selected") && !node.classList.contains("found")){ // Si le sommet n'était pas déjà selectionné ou déjà découvert en entier

      let secondNode;
      for (let sommet of document.querySelectorAll(".sommet")) {
        if (sommet.classList.contains("selected")) {
          secondNode = sommet;
        }
      }
      if (secondNode!=null){ // Second sommet

        const edge_string = [node.innerText,secondNode.innerText].sort().join();
        const a_node = edge_string.split(",")[0];
        const b_node = edge_string.split(",")[1];
        if (this.graphe.get(a_node).includes(b_node) && !this.discovered_graphe.get(a_node).includes(b_node)){
          this.discovered_graphe.get(a_node).push(b_node);
          this.discovered_graphe.get(b_node).push(a_node);
          for (let edge of document.querySelectorAll("line")) {
            if (edge.dataset["nodes"].includes(edge_string)) {
              edge.classList.remove("hidden");
            }
          }
          let a_discovered = true;
          let b_discovered = true;
          for (let node of this.graphe.get(a_node)){
            if (!this.discovered_graphe.get(a_node).includes(node)){
              a_discovered = false;
            }
          }
          for (let node of this.graphe.get(b_node)){
            if (!this.discovered_graphe.get(b_node).includes(node)){
              b_discovered = false;
            }
          }
          console.log(this.graphe.get(a_node));
          console.log(this.graphe.get(b_node));
          console.log(this.discovered_graphe.get(a_node));
          console.log(this.discovered_graphe.get(b_node));
          if (a_discovered){
            document.querySelector(`.sommet[data-node=${a_node}]`).classList.add("found");
          }
          if (b_discovered){
            document.querySelector(`.sommet[data-node=${b_node}]`).classList.add("found");
          }
        }
        console.log("FDJDFKSDJ",node,secondNode);
        secondNode.classList.remove("selected");
        node.classList.remove("selected");
        console.log(node.classList.toString());
      }
      else{ // Premier sommet
        node.classList.add("selected")
      }
      console.log(event.target);
    }
  }

  createGraphe(graphe){
    this.graphe = graphe;
    this.discovered_graphe = new Map();
    for (let sommet of this.graphe.keys()){
      this.discovered_graphe.set(sommet,[]);
    }
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
      sommetEl.addEventListener("click",(event)=>{this.clickNode(event)})
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
