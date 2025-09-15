#include "Point3D.hpp"
#include <iostream>
using namespace std;

int main() {
	Point3D p1;
	Point3D p2(10.0f, 20.0f, 30.0f);
	p1.print();
	cout << "Point Z : " << p1.getZ() << endl;
	p2.print();

	cout << "Distance: " << p1.distanceTo(p2) << endl;

	return 0;
}
