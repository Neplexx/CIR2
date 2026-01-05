#include <stdio.h>
#include <stdlib.h>
#include <time.h>

void tri_bulle(int tab[], int n) {
    int temp;
    for (int i = 0; i < n - 1; i+=1) {
        for (int j = 0; j < n - 1 - i; j+=1) {
            if (tab[j] > tab[j + 1]) {
                temp = tab[j];
                tab[j] = tab[j + 1];
                tab[j + 1] = temp;
            }
        }
    }
}
int main() {
	int tab[20] = { 0 };
	srand(time(NULL));
	for (int i = 0; i < 20; i += 1) {
		int nombre = (rand() % 300) + 1;
		tab[i] = nombre;
	}
	for (int i = 0; i < 20; i += 1) {
		printf("%d ", tab[i]);
	}

    tri_bulle(tab, 20);

    printf("\n\n");
    for (int i = 0; i < 20; i+=1) {
        printf("%d ", tab[i]);
    }
    printf("\n");
	return EXIT_SUCCESS;
}
