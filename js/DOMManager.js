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
  enable(){
    this.enabled = true;
  }
  disable(){
    this.enabled = false;
  }
  flipCard(card){
    card.classList.toggle("flip")
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
          this.enable(); // Si les cartes sont identiques, le joueur peut directement continuer de retourner
          document.dispatchEvent(new PairFound(card.dataset["id"]))
        }
        else{
          console.log("Mauvaise paire")
          setTimeout(()=>{
            this.flipCard(secondCard);
            this.flipCard(card);
            this.enable(); // Si les cartes étaient différentes, on attend qu'elles soient de nouveaux cachées pour laisser le joueur jouer.
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
    card.dataset["state"] = "hidden"
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
    const svg = document.getElementById("liens");
    const ligne = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
    );

    ligne.setAttribute("x1",  25);
    ligne.setAttribute("y1",  25);

    ligne.setAttribute("x2",  50);
    ligne.setAttribute("y2",  50);

    ligne.setAttribute("stroke", "black");
    ligne.setAttribute("stroke-width", "3");

    svg.appendChild(ligne);

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
}
