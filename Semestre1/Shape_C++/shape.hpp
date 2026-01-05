#pragma once

#include <iostream>

using std::cout;
using std::endl;

enum class Color : unsigned char
{
    blue = 0,
    green = 1,
    orange = 2,
    brown = 3
};

class Shape
{
private:
    static unsigned global_count_;
    unsigned count_;
    Color color_;

public:
    Shape(const Color &color = Color::green);
    virtual float get_aera() = 0;
    virtual void print_data() = 0;
};

class Rectangle : public Shape
{
protected:
    float length_;
    float width_;

public:
    float get_aera();
    void print_data();
    Rectangle(const float &length, const float &width);
};

class Triangle : public Shape
{
private:
    float length_side1_;
    float length_side2_;
    float length_side3_;

public:
    float get_aera();
    void print_data();
    Triangle(const float &length_side1, const float &length_side2,
             const float &length_side3);
};

class Circle : public Shape
{
private:
    float radius_;
    float get_aera();

public:
    virtual void print_data();
    Circle(const float &radius);
};

class Square : public Rectangle {
public:
    Square(const float &side) : Rectangle(side, side) {}
    float get_aera() override;
    void print_data() override;
};