let affichage = document.getElementById("Result");
let boutons = document.querySelectorAll("button"); 
let calcul = "";
let fin = 0;

boutons.forEach(function(bouton) {
    bouton.addEventListener("click", function() {
        let valeur = bouton.id;
        if (valeur === "=") {
            calcul = eval(calcul);
            fin = 1;
            affichage.innerText = "Result : " + calcul;
        } 
        else if (valeur === "C") {
            calcul = "";
            affichage.innerText = "Result : ";
            fin = 0;
        } 
        else {
            if (fin == 1){
                calcul = "";
                affichage.innerText = "Result : ";
                fin = 0;
            }
            calcul += valeur;
            affichage.innerText = "Result : " + calcul;
        }
    });
});

window.addEventListener("keydown", function(event) {
    let touche = event.key;
    if (touche === "Enter") touche = "=";
    if (touche === "Escape") touche = "C";
    if (touche === ",") touche = ".";

    let bouton = document.getElementById(touche);
    if (bouton) {
        bouton.click();
    }
});
