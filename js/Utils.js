/**
 * Mélange aléatoirement un Array. Modifie l'Array.
 * @param {Array}array Array qu'on veut mélanger
 */
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
    /**
     * Renvoie un entier compris entre 2 valeurs
     * @param {number}min Valeur minimale
     * @param {number}max Valeur maximale
     * @returns {number}
     */
    static entierAleatoireEntre(min,max){
        return Math.floor(Math.random() * (max-min)+min);
    }
    /**
     * Renvoie un entier compris entre 0 et un nombre maximal
     * @param {number}max Valeur maximale
     * @returns {number}
     */
    static entierAleatoireMax(max){
        return this.entierAleatoireEntre(0,max);
    }
}
export class Subject{
    /**
     * @type {ObserverElement[]}
     */
    observers;
    constructor(){
        this.observers = [];
    }

    /**
     * Ajoute un observateur au sujet, qui sera notifier lors des changements du sujet.
     * @param observer
     */
    subscribe(observer){
        if (!this.observers.includes(observer)){this.observers.push(observer);}
    }
    unsubscribe(observer){
        const index = this.observers.indexOf(observer);
        if (index !== -1){
            this.observers.splice(index, 1);
        }
    }
    /**
     * Notifie tous les observateurs abonnés à ce sujet
     * @param {any}data Données transmises aux observateurs
     */
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

/**
 * Effectue une division, en renvoyant séparément le résultat entier et le reste
 * @param {number}x Dividende
 * @param {number}y Diviseur
 * @returns {[number,number]}
 */
export function divmod(x,y){
    return [Math.floor(x/y),x%y];
}

/**
 * Renvoie une chaine de caractères avec un alignement avec remplissage par des 0 par la gauche. Si on souhaite afficher le nombre 3, avec un remplissage de 3 zeros, on obtiendra 003
 * @param {number}n La nombre à afficher
 * @param {number}nzero Le nombre de zéros à ajouter (moins la taille du nombre)
 * @returns {string}
 */
export function pad(n,nzero){
    if (nzero - `${n}`.length <= 0){
        return `${n}`
    }
    return "0"*(nzero - `${n}`.length) + `${n}`;
}
export class Chronometer extends Subject{
    startTime;
    stopTime;
    intervalId;

    /**
     * Renvoie le temps écoulé depuis le lancement du chronomètre (en secondes)
     * @returns {number} Temps en seconde
     */
    get time(){
        if (this.startTime===undefined){
            return 0/1000
        }
        if (this.stopTime===undefined) {
            return (new Date(Date.now()).getTime() - this.startTime) / 1000;
        }
        else{
            return (this.stopTime - this.startTime) / 1000;
        }
    }
    updateTime(){
        let m = 0,s = 0,ms = 0;
        ms = Math.floor(this.time * 1000);
        [s,ms] = divmod(ms,1000);
        [m,s] = divmod(s,60);
        this.notify(pad(m,2) + ":" + pad(s,2) + ":" + pad(ms,3))
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
    reset(){
        this.startTime = undefined;
        this.stopTime = undefined;
        if (this.intervalId !==undefined){
            clearInterval(this.intervalId);
            this.intervalId = undefined;
        }
        this.updateTime();
    }
    stop(){
        if (this.stopTime===undefined) { // Si stopTime n'est pas défini, le chronomètre n'est pas arrêté
            clearInterval(this.intervalId); // On arrête la vérification périodique.
            this.intervalId = undefined;
            this.updateTime(); // On actualise une dernière fois.
            this.stopTime = new Date(Date.now());
        }
    }
}




