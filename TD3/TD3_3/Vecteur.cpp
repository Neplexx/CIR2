#include <iostream>
#include "../TD3_2/Point2D.hpp"
#include "Vecteur.hpp"

Point2D Vecteur::somme(Point2D& vecteur1, Point2D& vecteur2) {
    float x = vecteur1.getX() + vecteur2.getX();
    float y = vecteur1.getY() + vecteur2.getY();
    Point2D result = Point2D(x, y);
    return result;

}
Point2D Vecteur::produit(int r�el, Point2D& vecteur) {
    float x = vecteur.getX() * r�el;
    float y = vecteur.getY() * r�el;
    Point2D result = Point2D(x, y);
    return result;
}
bool Vecteur::�gal(Point2D& vecteur1, Point2D& vecteur2) {
    if (vecteur1.getX() == vecteur2.getX() && vecteur1.getY() == vecteur2.getY()) {
        return true;
    }
    else { return false; }
}
