import {DOMManager} from './DOMManager.js';
import {Game} from './Game.js';
import {ApiService} from './ApiService.js';

const domManager = new DOMManager();
const game = new Game();
document.addEventListener("gameEnd",(event)=>{
  console.log(game.state)
  if (game.state!=="ended") {
    console.log("Fin de la partie, raison :" + event.detail.reason);
    domManager.chrono.stop();
    domManager.disable();
    game.endGame();
  }
})

document.querySelector("#abandon").addEventListener('click',()=>{
  document.dispatchEvent(game.Fin("abandon"));
})
document.querySelector('.game-form').addEventListener('submit', async function (event) {
  event.preventDefault();
  let playername = document.querySelector("#playername").value;
  let difficulty = document.querySelector("#difficulty").value;
  let imageset = document.querySelector("#imageset").value;
  let gamemode = document.querySelector("#gamemode").value;
  let hardcore = document.querySelector("#hardcore").checked;
  // Todo À compléter

  try {
    // Todo Spécifier les paramètres de createGame()
    const data = await ApiService.createGame(playername,Number(difficulty));
    console.log('Success:', data, data.id);
    console.log(hardcore)
    game.startGame(data.id,gamemode,Number(difficulty),hardcore);
    if (hardcore){
      document.addEventListener("wrong-pair",(event)=>{game.failedAttempt()})
    }
    document.querySelector(".game-area").classList.toggle("hidden")
    switch (gamemode){
      case ("regular"):{
        game.setImage(imageset)
        domManager.createCards(game.getImage());
        document.querySelector(".game-board").classList.toggle("hidden")
        document.querySelector(".setup-form").classList.toggle("hidden");
        document.addEventListener("pair-discovered",(event)=>{game.paireDecouverte(event)})
        domManager.enable();
        break;
      }
      case ("graphe"):{
        document.querySelector(".setup-form").classList.toggle("hidden");
        console.log("LOL" + game.graphe);
        domManager.createGraphe(game.graphe)

        document.querySelector(".graphe-board").classList.toggle("hidden");
      }
    }



  } catch (error) {
    console.error('Error:', error);
    alert(error.message || 'Erreur lors de la création de la partie');
  }
});
