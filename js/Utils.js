export function shuffle(array) {
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
export class Aleatoire{
    static entierAleatoireEntre(min,max){
        return Math.floor(Math.random() * (max-min)+min);
    }
    static entierAleatoireMax(max){
        return this.entierAleatoireEntre(0,max);
    }
}
export function entierAleatoire(max) {
    return Math.floor(Math.random() * max);
}
export class Subject{
    /**
     * @type {ObserverElement[]}
     */
    observers;
    constructor(){
        this.observers = [];
    }
    subscribe(observer){
        if (!this.observers.includes(observer)){this.observers.push(observer);}
    }
    unsubscribe(observer){
        const index = this.observers.indexOf(observer);
        if (index !== -1){
            this.observers.splice(index, 1);
        }
    }
    notify(data){
        this.observers.forEach(observer=>{observer.update(data)})
    }
}
export class ObserverElement{
    /**
     * @type {HTMLElement}
     */
    element;
    /**
     * @param {HTMLElement} element
     */
    constructor(element){
        this.element = element;
    }

    /**
     * @param {string}data
     */
    update(data){
        this.element.innerHTML = data;
    }
}
export class Chronometer extends Subject{
    startTime;
    stopTime;
    intervalId;
    get time(){
        if (this.startTime===undefined){
            return null
        }
        if (this.stopTime===undefined) {
            return (new Date(Date.now()).getTime() - this.startTime) / 1000;
        }
        else{
            return (this.stopTime - this.startTime) / 1000;
        }
    }
    updateTime(){
        this.notify(this.time)
    }
    start(){
        if (this.startTime===undefined) { // Si startTime n'est pas défini, le chronomètre n'a pas été lancé
            this.startTime = new Date(Date.now());
            this.intervalId = setInterval(()=>{this.updateTime()}, 100);
        }
    }
    resume(){
        if (this.stopTime!==undefined && this.startTime !== undefined) {
            this.stopTime = undefined;
            this.intervalId = setInterval(() => {this.updateTime()}, 100);
        }
    }
    restart(){
        this.startTime = undefined;
        this.stopTime = undefined;
        this.start();
    }
    stop(){
        if (this.stopTime===undefined) { // Si stopTime n'est pas défini, le chronomètre n'est pas arrêté
            clearInterval(this.intervalId); // On arrête la vérification périodique.
            this.updateTime(); // On actualise une dernière fois.
            this.stopTime = new Date(Date.now());
        }
    }
}




