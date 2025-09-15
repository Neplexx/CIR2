#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <cctype>   // pour tolower
using namespace std;

int main() {
    ifstream fichier("texte.txt");
    if (!fichier.is_open()) {
        cerr << "Erreur : impossible d'ouvrir le fichier !" << endl;
        return 1;
    }

    string ligne;
    int nbLignes = 0, nbMots = 0, nbLettres = 0;
    int freq[26] = { 0 };

    while (getline(fichier, ligne)) {
        nbLignes+=1;

        stringstream ss(ligne);
        string mot;
        while (ss >> mot) {
            nbMots+=1;
            for (char c : mot) {
                if (isalpha(c)) {
                    c = tolower(c);
                    if (c >= 'a' && c <= 'z') {
                        nbLettres += 1;
                        freq[c - 'a'] += 1;
                    }
                }
            }
        }
    }

    fichier.close();

    cout << "Nombre de lignes  : " << nbLignes << endl;
    cout << "Nombre de mots    : " << nbMots << endl;
    cout << "Nombre de lettres : " << nbLettres << endl;

    cout << "\nOccurrences des lettres :" << endl;
    for (int i = 0; i < 26; i++) {
        if (freq[i] > 0) {
            cout << char('a' + i) << " : " << freq[i] << endl;
        }
    }
    return 0;
}

