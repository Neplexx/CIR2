#include <iostream>
#include <vector>
#include <string>

// Q1
const int TAILLEDUGRAPHE = 6;
const int INFINI = 9999999;

//Q2
std::vector<std::string> vecSommets;
int arcs[TAILLEDUGRAPHE][TAILLEDUGRAPHE];
int cheminCourt[TAILLEDUGRAPHE][TAILLEDUGRAPHE];
int pointChemin[TAILLEDUGRAPHE][TAILLEDUGRAPHE];


//Q10
void Floyd(int (&arcs)[TAILLEDUGRAPHE][TAILLEDUGRAPHE], int (&cheminCourt)[TAILLEDUGRAPHE][TAILLEDUGRAPHE], int (&pointChemin)[TAILLEDUGRAPHE][TAILLEDUGRAPHE]){
    for (int i = 0 ; i < TAILLEDUGRAPHE ; i+=1){
        for (int j = 0 ; j< TAILLEDUGRAPHE ; j+=1){
            for (int k = 0 ; k < TAILLEDUGRAPHE ; k+=1){
                if (cheminCourt[j][i] + cheminCourt[i][k] < cheminCourt[j][k]){
                    cheminCourt[j][k] = cheminCourt[j][i] + cheminCourt[i][k];
                    pointChemin[j][k] = i;
                }
            }
        }
    }
}

//Q11
void afficherChemin(int sommet1, int sommet2, bool& premier) {
    int suivant = pointChemin[sommet1][sommet2];

    if (suivant == -1 || sommet1 == sommet2 || suivant == sommet1 || suivant == sommet2) return;

    afficherChemin(sommet1, suivant, premier);

    if (premier) {
        std::cout << " par ";
        premier = false;
    }
    else {
        std::cout << " et ";
    }

    std::cout << vecSommets[suivant];
    afficherChemin(suivant, sommet2, premier);
}

//Q14.1
void afficherChemin2(int sommet1, int sommet2, bool& premier) {
    int suivant = pointChemin[sommet1][sommet2];

    if (suivant == -1 || suivant == sommet1 || suivant == sommet2) return;

    afficherChemin2(sommet1, suivant, premier);

    if (premier) {
        std::cout << " \t\t par ";
        premier = false;
    }
    else {
        std::cout << " et ";
    }

    std::cout << vecSommets[suivant];
    afficherChemin2(suivant, sommet2, premier);
}

//Q15.1
void affichagePCCh() {
    for (int i = 0; i < TAILLEDUGRAPHE; i+=1) {
        for (int j = 0; j < TAILLEDUGRAPHE; j+=1) {
            if (i != j && cheminCourt[i][j] != INFINI) {
                std::cout << vecSommets[i] << " " << vecSommets[j] << " avec une distance de " << cheminCourt[i][j];
                bool premier = true;
                afficherChemin2(i, j, premier);
                std::cout << std::endl;
            }
        }
    }
}

int main(){
    //Q4 et Q5
    vecSommets.push_back("Lille");
    vecSommets.push_back("Paris");
    vecSommets.push_back("Bruxelles"); 
    vecSommets.push_back("Montpelier");
    vecSommets.push_back("Berlin");
    vecSommets.push_back("Lyon"); 
    
    //Q6
    for(int i = 0; i < TAILLEDUGRAPHE ; i+=1){
        for (int j = 0 ; j < TAILLEDUGRAPHE ; j+=1){
            arcs[i][j] = 0;
        }
    }

    arcs[0][1] = 221;
    arcs[1][3] = 753;
    arcs[2][0] = 93;
    arcs[2][1] = 310;
    arcs[4][2] = 760;
    arcs[1][5] = 466;
    arcs[0][5] = 691;

    //Q7
    for(int i = 0 ; i < TAILLEDUGRAPHE ; i+=1){
        for (int j = 0 ; j < TAILLEDUGRAPHE ; j+=1){
            if (arcs[i][j] != 0){
                pointChemin[i][j] = i;
                cheminCourt[i][j] = arcs[i][j];
            }
            else {
                pointChemin[i][j] = -1;
                cheminCourt[i][j] = INFINI;
            }
        }
    }
    Floyd(arcs,cheminCourt,pointChemin);

    //Q14.2

    bool premier = true;
    std::cout << "Chemin de Lille à Lyon";
    afficherChemin2(0, 5, premier);
    std::cout << std::endl;

    //Q15.2
    affichagePCCh();


	return 0;
}

