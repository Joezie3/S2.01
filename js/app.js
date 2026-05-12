import {DOMManager} from './DOMManager.js';
import {Game} from './Game.js';
import {ApiService} from './ApiService.js';


const game = new Game();
const domManager = new DOMManager(game);
document.addEventListener("gameEnd",(event)=>{
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
  console.log(event.target)
  let formData = new FormData(document.querySelector(".game-form"));
  console.log(formData)
  for (const [key,value] of formData){
    console.log(key,value)
  }
  const settings = Object.fromEntries(formData);
  settings["hardcore"] = settings["hardcore"]==="on";
  console.log(settings)

  // Todo À compléter

  try {
    // Todo Spécifier les paramètres de createGame()
    const data = await ApiService.createGame(settings.playername,Number(settings.difficulty));
    console.log('Success:', data, data.id);
    // game.startGame(data.id,gamemode,Number(difficulty),hardcore);
    game.startGame(data.id,settings);
    if (settings.hardcore){
      document.addEventListener("wrong-pair",(event)=>{game.failedAttempt()})
    }
    document.querySelector(".game-area").classList.toggle("hidden")
    switch (settings.gamemode){
      case ("regular"):{
        // game.setImage(imageset)
        domManager.createCards(game.getImages());
        document.querySelector(".game-board").classList.toggle("hidden")
        document.querySelector(".setup-form").classList.toggle("hidden");
        domManager.enable();
        break;
      }
      case ("graphe"):{
        document.querySelector(".setup-form").classList.toggle("hidden");
        console.log("LOL" + game.graphe);
        domManager.createGraphe(game.graphe)
        domManager.enable();
        document.querySelector(".graphe-board").classList.toggle("hidden");
      }
    }



  } catch (error) {
    console.error('Error:', error);
    alert(error.message || 'Erreur lors de la création de la partie');
  }
});
