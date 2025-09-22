#include "Point3D.hpp"
#include <iostream>
#include <cmath>
#include <cstdlib>
#include <ctime>
using namespace std;

Point3D::Point3D() {
    srand(static_cast<unsigned>(time(nullptr)));
    x = static_cast<float>(rand()) / RAND_MAX * 100.0f;
    y = static_cast<float>(rand()) / RAND_MAX * 100.0f;
    z = static_cast<float>(rand()) / RAND_MAX * 100.0f;
}

Point3D::Point3D(const float& newx, const float& newy, const float& newz) {
    x = newx;
    y = newy;
    z = newz;
}

void Point3D::setXYZ(const float& newx, const float& newy, const float& newz) {
    x = newx;
    y = newy;
    z = newz;
}
void Point3D::setX(const float& newx) { x = newx; }
void Point3D::setY(const float& newy) { y = newy; }
void Point3D::setZ(const float& newz) { z = newz; }

float Point3D::getX() const { return x; }
float Point3D::getY() const { return y; }
float Point3D::getZ() const { return z; }

void Point3D::print() const {
    cout << "Point3D(" << x << ", " << y << ", " << z << ")" << endl;
}

float Point3D::distanceTo(const Point3D& otherPoint3D) {
    float distanceX = x - otherPoint3D.x;
    float distanceY = y - otherPoint3D.y;
    float distanceZ = z - otherPoint3D.z;
    return sqrt(distanceX * distanceX + distanceY * distanceY + distanceZ * distanceZ);
}
