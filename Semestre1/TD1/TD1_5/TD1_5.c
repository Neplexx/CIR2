#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

int main() {
    char mot[11];
    printf("Joueur 1, entrez un mot (10 caractères max) : ");
    scanf("%10s", mot);

    int longueur = strlen(mot);
    char actuel[11];
    for (int i = 0; i < longueur; i+=1) {
        actuel[i] = '_';
    }
    actuel[longueur] = '\0';

    bool victory = false;
    int essais = 10;

    while (essais > 0 && victory == false) {
        printf("\nVotre avancée : %s", actuel);
        printf("\n%d essais restant :", essais);
        char lettre;
        printf("\nJoueur 2, entrez une lettre : ");
        scanf(" %c", &lettre);

        bool bonne_lettre = false;
        for (int i = 0; i < longueur; i+=1) {
            if (mot[i] == lettre && actuel[i] == '_') {
                actuel[i] = lettre;
                bonne_lettre = true;
            }
        }

        if (!bonne_lettre) {
            essais-=1;
            printf("Mauvaise lettre !");
        }

        if (strcmp(mot, actuel) == 0) {
            victory = true;
        }
    }

    if (victory) {
        printf("\nBravo ! Vous avez trouvé le mot : %s\n", mot);
    }
    else {
        printf("\nPerdu ! Le mot était : %s\n", mot);
    }
    return EXIT_SUCCESS;
}
