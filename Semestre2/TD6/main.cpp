#include <iostream>
#include <fstream>
#include <vector>
#include <string>

std::string path = "/home/matteo/Bureau/CIR2/Semestre2/TD6/4villes.txt";

int main() {
    std::ifstream fichier1 (path);

    int nbrVilles;
    fichier1>> nbrVilles;

    std::vector<std::string> villes(4);
    std::vector<std::vector<int>> matrice(4, std::vector<int>(4));

    for (int i = 0; i < 4; i+=1) {
        fichier1 >> villes[i];
    }

    for (int i = 0; i < 4; i+=1) {
        for (int j = 0; j < 4; j+=1) {
            fichier1 >> matrice[i][j];
        }
    }

    fichier1.close();

    std::cout << "distance " << villes[0] << " " << villes[1] << " : "  << matrice[0][1] << std::endl;

    return 0;
}
