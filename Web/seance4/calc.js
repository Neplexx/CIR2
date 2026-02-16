let affichage = document.getElementById("Result");
let boutons = document.querySelectorAll("button"); // On récupère tous les boutons

let calcul = "";

boutons.forEach(function(bouton) {
    bouton.addEventListener("click", function() {
        let valeur = bouton.id;
        if (valeur === "=") {
            calcul = eval(calcul);
            affichage.innerText = "Result : " + calcul;
        } 
        else if (valeur === "C") {
            calcul = "";
            affichage.innerText = "Result : ";
        } 
        else {
            calcul += valeur;
            affichage.innerText = "Result : " + calcul;
        }
    });
});
