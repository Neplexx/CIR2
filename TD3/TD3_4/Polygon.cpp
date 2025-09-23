#include "Polygon.hpp"
#include <iostream>
#include <cmath>

Polygon::Polygon(const std::vector<Point2D>& pts) : points(pts) {}

void Polygon::addPoint(const Point2D& p) {
    points.push_back(p);
}

float Polygon::area() const {
    if (points.size() < 3) return 0.0f;

    float sum = 0.0f;
    int n = points.size();

    for (int i = 0; i < n; i+=1) {
        const Point2D& p1 = points[i];
        const Point2D& p2 = points[(i + 1) % n];
        sum += (p1.getX() * p2.getY()) - (p2.getX() * p1.getY());
    }

    return std::abs(sum) * 0.5f;
}

void Polygon::print() const {
    std::cout << "Polygon with " << points.size() << " points:" << std::endl;
    for (const auto& p : points) {
        p.print();
    }
    std::cout << "Area = " << area() << std::endl;
}
