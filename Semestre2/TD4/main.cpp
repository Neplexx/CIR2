#include <iostream>
#include <vector>
#include <string>

const int TAILLEDUGRAPHE = 6;
const int INFINI = 9999999;



void Floyd(int (&arcs)[TAILLEDUGRAPHE][TAILLEDUGRAPHE], int (&cheminCourt)[TAILLEDUGRAPHE][TAILLEDUGRAPHE], int (&pointChemin)[TAILLEDUGRAPHE][TAILLEDUGRAPHE]){
    for (int i = 0 ; i < TAILLEDUGRAPHE ; i+=1){
        for (int j = 0 ; j< TAILLEDUGRAPHE ; j+=1){
            for (int k = 0 ; k < TAILLEDUGRAPHE ; k+=1){
                if (cheminCourt[j][i] + cheminCourt[i][k] < cheminCourt[j][k]){
                    cheminCourt[j][k] = cheminCourt[j][i] + cheminCourt[i][k];
                    pointChemin[i][k] = i;
                }
            }
        }
    }
}

int main(){
    std::vector<std::string> vecSommets;
    int arcs [TAILLEDUGRAPHE][TAILLEDUGRAPHE];
    int cheminCourt [TAILLEDUGRAPHE][TAILLEDUGRAPHE];
    int pointChemin [TAILLEDUGRAPHE][TAILLEDUGRAPHE];

    vecSommets.push_back("Lille");
    vecSommets.push_back("Paris");
    vecSommets.push_back("Bruxelles"); 
    vecSommets.push_back("Montpelier");
    vecSommets.push_back("Berlin");
    vecSommets.push_back("Lyon"); 
    
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
}

