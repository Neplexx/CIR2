#include "../TD3_2/Point2D.hpp"
#include <vector>

class Polygon {
private:
    std::vector<Point2D> points;

public:
    Polygon() = default;
    Polygon(const std::vector<Point2D>& pts);

    void addPoint(const Point2D& p);
    float area() const;
    void print() const;
};
