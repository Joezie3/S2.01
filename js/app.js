import {DOMManager} from './DOMManager.js';
import {Game} from './Game.js';
import {ApiService} from './ApiService.js';
import {ObserverElement} from './Utils.js';

const game = new Game();
const domManager = new DOMManager(game);
/**
 * Termine la partie. Execute toutes les actions de fin de partie, que ce soit pour l'interface ou pour la partie logique
 * @param {{reason:string,showModal:boolean}}detail
 */
async function endGame(detail){
  if (game.state!=="ended") {
    console.log("Fin de la partie, raison :" + detail.reason + "showModal:"+detail.showModal);
    domManager.disableInteraction();
    console.log("PLUS D'INTERACTIONS")
    let result = await game.endGame();
    domManager.endGame(result,detail);
  }
}
/**
 * @listens Game.FinPartie
 */
document.addEventListener("gameEnd",(event)=>{
  event.preventDefault();
  endGame(event.detail);
})
document.querySelector("#close-modal-button").addEventListener("click",()=>{domManager.toggleModal()})
document.querySelector("#show-result").addEventListener("click",()=>{domManager.toggleModal()});
document.querySelectorAll(".restart-button").forEach((button)=>{
  button.addEventListener("click",()=>{
    endGame({reason:"abandon",showModal:false}).then(()=>{
      domManager.resetAll(false);document.querySelector("button[type=submit]").click()
    })
  }
  )
})
document.querySelector("#mainpage-modal-button").addEventListener("click",()=>{domManager.resetAll()})
document.querySelector("#abandon").addEventListener('click',()=>{
  document.dispatchEvent(game.Fin("abandon"));
})
document.querySelector('.game-form').addEventListener('submit', async function (event) {
  event.preventDefault();
  let formData = new FormData(document.querySelector(".game-form"));
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
    game.chrono.subscribe(new ObserverElement(document.querySelector(".game-timer")));
    game.chrono.reset()

    domManager.createBoard()
    domManager.enableInteraction()
    domManager.toggleSetupMenu(false)

  } catch (error) {
    console.error('Error:', error);
    alert(error.message || 'Erreur lors de la création de la partie');
  }
});
