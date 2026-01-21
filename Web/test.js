tab = [1,2,3,4,5];
tab2 = [2,5,3,7,8];

function forEach(tab){
    for (i = 0 ; i < tab.length ; i+=1){
        console.log(tab[i]);
    }
}
function f(val){
    val += 5;
    return val;
}
function map(tab){
    for (i = 0; i < tab.length ; i+=1){
        tab [i] = f(tab[i]);
    }
    return tab;
}

function filtre(tab){
    newTab = []
    for (i = 0; i < tab.length ; i +=1){
        if (tab[i] % 2 == 0){
            newTab.push(tab[i]);
        }
    }
    return newTab;
}
tab = filtre(tab);
forEach(tab);

function reduce(tab, valeur = 0){
    for(i = 0; i < tab.length ; i+=1){
        valeur+= tab[i];
    }
    return valeur;
}

valeur = reduce(tab2);
console.log("valeur réduite : ", valeur);


const myArray = [1,2,3,4,5,6,7,8,9,10];

const impair = [];
for (i = 0; i < myArray.length ; i+=1){
    if (myArray[i] % 2 != 0){
        impair.push(myArray[i]);
    }
}
console.log(impair);

const sinus = [];
for (i = 0; i < myArray.length ; i+=1){
    sinus.push(Math.sin(myArray[i]));
}
console.log(sinus);

const square = []
for (i = 0; i < myArray.length ; i+=1){
    square.push(myArray[i]*myArray[i]);
}
console.log(square);

const cube = []
for (i = 0; i < myArray.length ; i+=1){
    cube.push(myArray[i]*myArray[i]*myArray[i]);
}
console.log(cube);

const expo = [];
for (i = 0; i < myArray.length ; i+=1){
    expo.push(Math.exp(myArray[i]));
}
console.log(expo);