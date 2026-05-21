import {DOMManager} from './DOMManager.js';
import {Game} from './Game.js';
import {ApiService} from './ApiService.js';
import {Chronometer,ObserverElement} from './Utils.js';


const game = new Game();
const domManager = new DOMManager(game);
document.addEventListener("gameEnd",async (event)=>{
  if (game.state!=="ended") {
    console.log("Fin de la partie, raison :" + event.detail.reason);
    domManager.disableInteraction();
    let result = await game.endGame();
    domManager.endGame(result,event.detail.reason);
  }
})

document.querySelector("#close-modal-button").addEventListener("click",()=>{domManager.toggleModal()})
document.querySelector("#show-result").addEventListener("click",()=>{domManager.toggleModal()});
document.querySelector("#mainpage-modal-button").addEventListener("click",()=>{domManager.resetAll()})
document.querySelector("#abandon").addEventListener('click',()=>{
  document.dispatchEvent(game.Fin("abandon"));
})
document.querySelector('.game-form').addEventListener('submit', async function (event) {
  event.preventDefault();
  // console.log(event.target)
  let formData = new FormData(document.querySelector(".game-form"));
  // console.log(formData)
  // for (const [key,value] of formData){
  //   console.log(key,value)
  // }
  const settings = Object.fromEntries(formData);
  settings["hardcore"] = settings["hardcore"]==="on";
  console.log(settings)
  try {
    const data = await ApiService.createGame(settings.playername,Number(settings.difficulty));
    console.log('Success:', data, data.id);
    game.startGame(data.id,settings);
    if (settings.hardcore){
      document.addEventListener("wrong-pair",(event)=>{game.failedAttempt()})
    }
    domManager.toggleGameArea()
    const gameTimer = document.querySelector(".game-timer");
    game.chrono.subscribe(new ObserverElement(gameTimer));
    game.chrono.reset()

    domManager.createBoard()
    domManager.enableInteraction()
    domManager.toggleSetupMenu()

  } catch (error) {
    console.error('Error:', error);
    alert(error.message || 'Erreur lors de la création de la partie');
  }
});
