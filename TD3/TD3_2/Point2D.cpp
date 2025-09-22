#include "Point2D.hpp"
#include <iostream>
#include <cstdlib>
#include <ctime>

using namespace std;

Point2D::Point2D() {
    srand(static_cast<unsigned>(time(nullptr)));
    x = static_cast<float>(rand()) / RAND_MAX * 100.0f;
    y = static_cast<float>(rand()) / RAND_MAX * 100.0f;
}
Point2D::Point2D(float& newx, float& newy) {
    x = newx;
    y = newy;
}
void Point2D::setXY(float& newx, float& newy) {
    x = newx;
    y = newy;
}
void Point2D::setX(float& newx) { x = newx; }
void Point2D::setY(float& newy) { y = newy; }

float Point2D::getX() const { return x; }
float Point2D::getY() const { return y; }

void Point2D::print() const {
    cout << "Point2D(" << x << ", " << y << ")" << endl;
}