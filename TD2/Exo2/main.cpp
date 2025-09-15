#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    int chiffre;
    cout << "Entrez un chiffre :" << endl;
    cin >> chiffre;
    cout << "Table de : " << chiffre << " :" << endl;
    for (int i = 1; i <= 10; i+=1) {
        cout << setw(2) << chiffre << " x " << setw(2) << i << " = " << setw(2) << chiffre * i << endl;
    }
    return 0;
}