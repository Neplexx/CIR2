#include "vector.hpp"
#include <iostream>

int main() {
	constexpr int size = 3;
	Mon_vecteur v1(size);
	Mon_vecteur v2(size);
	for (int i = 0; i < v1.get_size(); i += 1) {
		v1(i) = static_cast<float>(i);
		v2(i) = static_cast<float>(i + 1);
	}
	std::cout << "get_size :" << v1.get_size() << std::endl;
	std::cout << "V1 :" << v1 << "V2 :" << v2 << std::endl;
	std::cout << "V1*V2 : " << v1 * v2 << std::endl;
	std::cout << "V2*2 : " << v2 << std::endl;
}
