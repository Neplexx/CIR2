#include "vector.hpp"
#include <iostream>

Mon_vecteur::Mon_vecteur(const int& size) : size_(size), tab_(new float[size]) {}

int Mon_vecteur::get_size() const {
	return size_;
}
float& Mon_vecteur::operator()(const int& ind) {
	return tab_[ind];
}
float Mon_vecteur::operator*(Mon_vecteur& v) {
	float result = 0.0F;
	for (int i = 0; i < size_; i += 1) {
		result += tab_[i] * v.tab_[i];
	}
	return result;
}
Mon_vecteur& Mon_vecteur::operator*=(const float& val) {
	for (int i = 0; i < size_; i += 1) {
		tab_[i] *= val;
	}
	return *this;
}
std::ostream& operator<<(std::ostream& os, Mon_vecteur& v) {
	for (int i = 0; i < v.size_; i+=1) {
		os << v.tab_[i];
		if (i < v.size_ - 1) {
			os << ", ";
		}
	}
	return os;
}
Mon_vecteur::~Mon_vecteur() {
	delete[] tab_;
}