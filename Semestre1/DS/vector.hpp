#include <iostream>
class Mon_vecteur {
	int size_ = 0;
	float* tab_;
public:
	Mon_vecteur(const int& size);
	int get_size() const;
	float& operator()(const int& ind);
	float operator*(Mon_vecteur& v);
	Mon_vecteur& operator*=(const float& val);
	friend std::ostream& operator<<(std::ostream& os, Mon_vecteur& v);
	~Mon_vecteur();
};
