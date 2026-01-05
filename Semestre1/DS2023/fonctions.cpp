#include <iostream>
#include<algorithm>
#include "fonctions.hpp"

int* aleatoire(int nombre) {
	if (nombre <= 0) {
		return 0;
	}
	std::vector<int> tableau;
	int* tab = new int[nombre];
	for (int i = 0; i < nombre; i += 1) {
		tab[i] = rand();
	}
	std::sort(tab[0], tab[nombre]);
	std::sort(tableau.begin(), tableau.end());
	return tab;
}

int Polynome::max_degree() {
    return 0;
}
Polynome::Polynome(const Polynome& poly) : polynome_(poly.polynome_) {}

