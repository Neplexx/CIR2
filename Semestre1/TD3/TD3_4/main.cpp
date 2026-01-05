#include "Polygon.hpp"
#include <iostream>

int main() {
    Point2D A(1.0F, 1.0F), B(4.0F, 1.0F), C(1.0F, 3.0F);
    Polygon triangle({ A,B,C });
    triangle.print();

    Point2D D(4.0F, 3.0F);
    Polygon rectangle({ A,B,D,C });
    rectangle.print();

    return 0;
}
