class Point2D {
private:
    float x, y;
public:
    Point2D();
    Point2D(float &newx, float &newy);

    void setXY(float &newx, float &newy);
    void setX(float& newx);
    void setY(float& newy);

    float getX() const;
    float getY() const;

    void print() const;
};

