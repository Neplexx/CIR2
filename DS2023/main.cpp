#include <iostream>
#include <algorithm>
#include "fonctions.hpp"
using namespace std;

int main() {
	int nombre = 10;
	int* tab = aleatoire(nombre);
	sort(tab, tab + nombre);

	for (int i = 0; i < nombre; i += 1) {
		cout << tab[i] << endl;
	}

	delete[] tab;

	return 0;
}