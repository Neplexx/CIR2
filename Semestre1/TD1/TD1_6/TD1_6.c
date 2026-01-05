#include <stdio.h>

int fonc1(){
	int x = 14, y = 13;
	if (x > y) {
		if (x < 20) {
			x -= 10;
		}
		else {
			x += 10;
		}
	}
	printf("%d\n", x);
	return 0;
}
int fonc2() {
	int x = 4, y = 3;
	x = x + y;
	y = x - y;
	printf("%d\n", y);
	return 0;
}
int fonc3() {
	int x = 0, y = 100;
	int compteur = 0;
	while (x * x <= y) {
		x += 1;
		compteur += 1;
	}
	printf("%d\n", compteur);
	return 0;
}

int main() {
	fonc1();
	fonc2();
	fonc3();
	return 0;
}