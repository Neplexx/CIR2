#include "../TD3_2/Point2D.hpp"

class Vecteur : public Point2D {
private:
	Point2D point;
public:
	Point2D somme(Point2D &vecteur1, Point2D &vecteur2);
	Point2D produit(int réel, Point2D &vecteur);
	bool égal(Point2D& vecteur1, Point2D& vecteur2);
};


