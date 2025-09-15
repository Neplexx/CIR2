#include "Point3D.hpp"

constexpr size_t numberOfPoints = 10;
class Trajectory {
private:
	Point3D points[numberOfPoints];
public:
	void print();
	Point3D& getPoint(const int& n);
	float getTotalDistance();
};
