#include <iostream>
#include <string>
#include <algorithm>
#include <vector>

using namespace std;

vector<string> vecteurDeNomsDeVille{ "Lille","Vda" };

void toutesLesPermutations(vector<string> &villes, int debut, int fin)
{
	if (debut == fin) {
		for (int i = 0; i < vecteurDeNomsDeVille.size(); i += 1) {
			cout << villes.at(i) << " ";
		}
		cout << endl;
	}
	else {
		for (int i = debut; i <= fin; i++)
		{
			swap(villes[debut], villes[i]);
			toutesLesPermutations(villes, debut + 1, fin);
			swap(villes[debut], villes[i]);
		}
	}
}

constexpr int codeASCIIde_a = 97;
constexpr int codeASCIIde_A = 65;
constexpr int nombreDeLettres = 26;
constexpr int tailleMinNomVille = 4;
constexpr int tailleMaxNomVille = 12;
constexpr int grainePourLeRand = 1;
constexpr int nombreDeVilles = 4;
constexpr int nombreCombinaisons = 24;
constexpr int tailleCoteCarte = 100;

void génération_villes(vector<string>& vecteur) {
	srand(grainePourLeRand);
	for (int i = 0; i < nombreDeVilles; i += 1) {
		string Ville = "";
		int nbLettresNomVille = tailleMinNomVille + rand() % (tailleMaxNomVille - tailleMinNomVille + 1);
		for (int j = 0; j < nbLettresNomVille; j += 1) {
			if (j == 0) {
				Ville += (codeASCIIde_A + rand() % nombreDeLettres);
			}
			else {
				Ville += (codeASCIIde_a + rand() % nombreDeLettres);
			}
		}
		vecteur.push_back(Ville);
	}
}

int main()
{
	génération_villes(vecteurDeNomsDeVille);
	for (int i = 0; i < vecteurDeNomsDeVille.size(); i+=1) {
		cout << vecteurDeNomsDeVille.at(i) << endl;
	}
	return 0;
}