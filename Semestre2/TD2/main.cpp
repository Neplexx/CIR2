#include <iostream>
#include <vector>
#include <array>
#include <stack>
#include <queue>
#include <list>
#include <map>
#include <set>
#include <chrono>

//Partie 2 :

bool estPremier(int nombre) {
	for (int i = 2; i < nombre; i += 1) {
		if (nombre % i == 0) return false;
	}
	return true;
}

int listePremier(std::vector<int> &tab) {
	int n = 1001;
	int compteur = 0;
	for (int i = 2; i <= n; i += 1) {
		if (estPremier(i)) { 
			tab.push_back(i); 
			compteur += 1; 
		}
	}
	return compteur;
}

//Partie 4 et 5 : 

void Non_associatif(std::array<int,5> &array,int boucle) {
	auto debut = std::chrono::high_resolution_clock::now();

	std::vector<int>vecteur = {};
	std::list<int> liste = {};
	std::stack<int> pile = {};
	std::queue<int> file = {};

	for (int i = 0; i < 5; i += 1) {
		vecteur.push_back(array.at(i));
	}
	for (int i = 0; i < boucle; i += 1) {
		for (int i = 0; i < 5; i += 1) {
			liste.push_back(vecteur.back());
			vecteur.pop_back();
		}
		for (int i = 0; i < 5; i += 1) {
			pile.push(liste.back());
			liste.pop_back();
		}
		for (int i = 0; i < 5; i += 1) {
			file.push(pile.top());
			pile.pop();
		}
		for (int i = 0; i < 5; i += 1) {
			vecteur.push_back(file.back());
			file.pop();
		}
	}
	auto fin = std::chrono::high_resolution_clock::now();
	auto duree = std::chrono::duration_cast<std::chrono::microseconds>(fin - debut);

	std::cout << "Non associatif : " << duree.count() / 1000000.0 << " secondes" << std::endl;
}

void associatif(std::map<int, int>& dico, int boucle) {
	auto debut = std::chrono::high_resolution_clock::now();

	std::multimap<int, int> multidico = {};
	std::set<int> set = {};
	std::multiset<int> multiset = {};

	for (auto i = dico.begin(); i != dico.end(); ++i) {
		multidico.insert(*i);
	}
	for (int i = 0; i < boucle; i += 1) {
		for (auto i = multidico.begin(); i != multidico.end(); ++i) {
			set.insert(i->first);
		}
		multidico.clear();

		for (auto i = set.begin(); i != set.end(); ++i) {
			multiset.insert(*i);
		}
		set.clear();

		for (auto i = multiset.begin(); i != multiset.end(); ++i) {
			multidico.insert({ *i, *i * 2 });
		}
		multiset.clear();
	}

	auto fin = std::chrono::high_resolution_clock::now();
	auto duree = std::chrono::duration_cast<std::chrono::microseconds>(fin - debut);

	std::cout << "Associatif : " << duree.count() / 1000000.0 << " secondes" << std::endl;
}

int main() {
	//Partie 2 : 

	std::vector<int> tabPremiers = {};
	int compteur = listePremier(tabPremiers);

	for (int i = 0; i < tabPremiers.size(); i += 1) {
		std::cout << tabPremiers[i] << std::endl;
	}
	std::cout << " "<< std::endl;
	std::cout << "Nombre de nombres premiers : " << compteur << std::endl;
	std::cout << " " << std::endl;

	//Partie 4 et 5 : 

	std::array<int,5> non_associatif = { 5,3,2,7,8 };
	Non_associatif(non_associatif,500000);
	std::cout << " " << std::endl;
	std::map<int, int> dico = {{1, 5}, {2, 3}, {3, 1}, {4,2}, {5, 9}};
	associatif(dico, 500000);
}