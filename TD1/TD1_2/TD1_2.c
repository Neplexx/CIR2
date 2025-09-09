#include <stdio.h>
#include <stdlib.h>
#include <math.h>

int racines(int a, int b, int c) {
	int delta = (b ^ 2) - (4 * a * c);
	if (delta > 0) {
		int x1 = ((-b) + sqrt(delta)) / (2 * a);
		int x2 = ((-b) - sqrt(delta)) / (2 * a);
		return printf("les racines sont : %d et %d", x1, x2);
	}
	else if (delta == 0) {
		int x = b / (2 * a);
		return printf("la racine est : %d", x);
	}
	else {
		return printf("le polynome n'a pas de racine réelle");
	}
}

int main() {
	racines(1, 4, 1);
	return EXIT_SUCCESS;
}