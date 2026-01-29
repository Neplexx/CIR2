#include <iostream>
#include <string>
#include <algorithm>
#include <vector>
#include <tuple>
#include <map>
#include <cmath>

using namespace std;

vector<string> vecteurDeNomsDeVille{};
std::map<std::string, std::tuple<int, int, int>>maMapNomsVillesEtCoordonnees;

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

void generation_villes(vector<string>& vecteur) {
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
		int X = rand();
		int Y = rand();
		auto monTuple = std::make_tuple(i, X, Y);
		maMapNomsVillesEtCoordonnees.insert(maMapNomsVillesEtCoordonnees.begin(), std::pair<string, tuple<int, int, int> >(Ville, monTuple));
	}
}

int distance(int X1, int X2, int Y1, int Y2) {
	int result = pow((X1 - X2), 2) + pow((Y1 - Y2), 2);
	//result = hypot((X1 - X2), (Y1 - Y2));
	return int(sqrt(result));
}
void matriceDistance(std::vector<std::vector<int>>&dist, const std::map<std::string, std::tuple<int, int, int>>maMap){
	int compteur = 0;
	int compteur2 = 0;
	for (auto it : maMap) {
		compteur2 = 0;
		for (auto it2 : maMap) {
			int valeur = distance(get<1>(it.second), get<1>(it2.second), get<2>(it.second), get<2>(it2.second));
			dist[compteur][compteur2] = valeur;
			compteur2 += 1;
		}
		compteur += 1;
	}
}

void permutations(std::vector<std::string> vector) {
	for (int i = 0; i < 4; i+=1) {
		for (int j = 0; j < 4; j+=1) {
			if (j == i) continue;
			for (int k = 0; k < 4; k+=1) {
				if (k == i || k == j) continue;
				for (int l = 0; l < 4; l+=1) {
					if (l == i || l == j || l == k) continue;
					std::cout << vector.at(i) << "\t" << vector.at(j) << "\t" << vector.at(k) << "\t" << vector.at(l) << std::endl;
				}
			}
		}
	}
}

int main()
{
	generation_villes(vecteurDeNomsDeVille);
	for (int i = 0; i < vecteurDeNomsDeVille.size(); i+=1) {
		cout << vecteurDeNomsDeVille.at(i) << endl;
	}

	//Partie 4 :

	for (auto it : maMapNomsVillesEtCoordonnees) {
		std::cout << "" << std::endl;
		std::cout << "Ville : " << it.first << " ;  ID: " << std::get<0>(it.second) << ", X: " << std::get<1>(it.second) << ", Y: " << std::get<2>(it.second) << std::endl;
	}

	//Partie 5 : 

	std::vector<std::vector<int>> DIST(nombreDeVilles, std::vector<int>(nombreDeVilles, 0));
	matriceDistance(DIST, maMapNomsVillesEtCoordonnees);
	
	std::cout << "\nMatrice de distances :" << std::endl;
	for (int i = 0; i < nombreDeVilles; i += 1) {
		for (int j = 0; j < nombreDeVilles; j += 1) {
			std::cout << DIST[i][j] << "\t";
		}
		std::cout << std::endl;
	}

	//Partie 6 : 
	std::cout << "\n" << std::endl;
	permutations(vecteurDeNomsDeVille);


	return 0;
}
