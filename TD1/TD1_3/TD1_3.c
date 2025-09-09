#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>

char minuscule(char text) {
	return tolower(text);
}
int main() {
	char result = minuscule('B');
	printf("%c\n", result);
	return EXIT_SUCCESS;
}