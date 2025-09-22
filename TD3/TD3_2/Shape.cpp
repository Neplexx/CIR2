#include "shape.hpp"
#include <iostream>

unsigned Shape::global_count_ = 0;

Shape::Shape(const Color& color) : color_(color) {
    count_ = global_count_++;
}

Circle::Circle(const Point2D& center, float radius)
    : center_(center), radius_(radius) {
}

float Circle::get_aera() {
    return 3.14 * radius_ * radius_;
}

void Circle::print_data() {
    cout << "Circle centered at "; center_.print();
    cout << " with radius = " << radius_ << endl;
}

Rectangle::Rectangle(const Point2D& p1, const Point2D& p2)
    : p1_(p1), p2_(p2) {
}

float Rectangle::get_aera() {
    float length = fabs(p2_.getX() - p1_.getX());
    float width = fabs(p2_.getY() - p1_.getY());
    return length * width;
}

void Rectangle::print_data() {
    cout << "Rectangle corners: "; p1_.print(); p2_.print();
}

Square::Square(const Point2D& p1, const Point2D& p2)
    : p1_(p1), p2_(p2) {
}

float Square::get_aera() {
    float side = fabs(p2_.getX() - p1_.getX());
    return side * side;
}

void Square::print_data() {
    cout << "Square corners: "; p1_.print(); p2_.print();
}

Triangle::Triangle(const Point2D& p1, const Point2D& p2, const Point2D& p3)
    : p1_(p1), p2_(p2), p3_(p3) {
}

float Triangle::get_aera() {
    float a = hypot(p2_.getX() - p1_.getX(), p2_.getY() - p1_.getY());
    float b = hypot(p3_.getX() - p2_.getX(), p3_.getY() - p2_.getY());
    float c = hypot(p1_.getX() - p3_.getX(), p1_.getY() - p3_.getY());
    float s = (a + b + c) / 2.0f;
    return sqrt(s * (s - a) * (s - b) * (s - c));
}

void Triangle::print_data() {
    cout << "Triangle points: "; p1_.print(); p2_.print(); p3_.print();
}

