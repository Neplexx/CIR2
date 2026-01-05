#ifndef SHAPE_HPP
#define SHAPE_HPP

#include <iostream>
#include <cmath>
#include "Point2D.hpp"

using namespace std;

enum class Color : unsigned char
{
    blue = 0,
    green = 1,
    orange = 2,
    brown = 3
};

class Shape {
public:
    Shape(const Color& color = Color());
    virtual float get_aera() = 0;
    virtual void print_data() = 0;
    virtual ~Shape() = default;

protected:
    static unsigned global_count_;
    unsigned count_;
    Color color_;
};

class Circle : public Shape {
public:
    Circle(const Point2D& center, float radius);
    float get_aera() override;
    void print_data() override;

private:
    Point2D center_;
    float radius_;
};

class Rectangle : public Shape {
public:
    Rectangle(const Point2D& p1, const Point2D& p2);
    float get_aera() override;
    void print_data() override;

private:
    Point2D p1_, p2_;
};

class Square : public Shape {
public:
    Square(const Point2D& p1, const Point2D& p2);
    float get_aera() override;
    void print_data() override;

private:
    Point2D p1_, p2_;
};

class Triangle : public Shape {
public:
    Triangle(const Point2D& p1, const Point2D& p2, const Point2D& p3);
    float get_aera() override;
    void print_data() override;

private:
    Point2D p1_, p2_, p3_;
};

#endif

