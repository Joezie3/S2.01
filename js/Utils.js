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