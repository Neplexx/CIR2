#include <iostream>
#define multiplier(x, y) ((x) * (y))
using namespace std;

int main() {
	int a;
	int b;
	cout << "Entrez une valeur:" << endl;
	cin >> a;
	cout << "Entrez une autre valeur :" << endl;
	cin >> b;
	cout << multiplier(a + 1, b + 1) << endl;
	return 0;
}
