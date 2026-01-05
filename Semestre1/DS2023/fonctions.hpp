int* aleatoire(int nombre);

#include <cmath>
#include <vector>
#include <iostream>
#include <fstream>

class Polynome
{
private:
    std::vector<float> polynome_;

public:
    Polynome() {};
    Polynome(const Polynome& poly);
    int max_degree();
    float get_val(const float& val);
    void ajouter_un_monome(const int& degree, const float& coeff);
    friend std::ostream& operator<<(std::ostream& os, const Polynome& poly);
    friend std::istream& operator>>(std::istream& os, const Polynome& poly);
    float operator()(const float& val);
    Polynome operator+(const Polynome& other);
    Polynome operator*(const Polynome& other);
};