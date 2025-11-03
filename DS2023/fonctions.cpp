#include <iostream>
#include "fonctions.hpp"

int* aleatoire(int nombre) {
	if (nombre <= 0) {
		return 0;
	}
	int* tab = new int[nombre]();
	for (int i = 0; i < nombre; i += 1) {
		tab[i] = rand();
	}
	return tab;
}

int Polynome::max_degree() {
    return 0;
}