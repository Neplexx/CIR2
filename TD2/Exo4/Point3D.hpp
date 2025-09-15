class Point3D {
private:
	float x, y, z;
public:
	Point3D();
	Point3D(const float& newx, const float& newy, const float& newz);
	void setXYZ(const float& newx, const float& newy, const float& newz);

	void setX(const float& newx);
	void setY(const float& newy);
	void setZ(const float& newz);

	float getX() const;
	float getY() const;
	float getZ() const;

	void print() const;

	float distanceTo(const Point3D& otherPoint3D);
};

