#include <stdio.h>
#include <stdlib.h>

int factoriellefor(int chiffre){
	int result = 1;
	for (int i = chiffre; i > 0; i -= 1) {
		result = result * i;
	}
	return result;
}

int factoriellewhile(int chiffre) {
	int result = 1;
	while (chiffre > 0) {
		result = result * chiffre;
		chiffre -= 1;
	}
	return result;
}

int factoriellerec(int chiffre) {
	if (chiffre == 0) {
		return chiffre + 1;
	}
	return factoriellerec(chiffre - 1) * chiffre;
}
int main() {
	printf("%d\n", factoriellefor(5));
	printf("%d\n", factoriellewhile(5));
	printf("%d\n", factoriellerec(5));
	return EXIT_SUCCESS;
}