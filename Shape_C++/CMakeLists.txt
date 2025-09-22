if(NOT MSVC)
    link_libraries(m) #to link with libm on Unix 
endif()

add_executable (Shape "shape.cpp" "main.cpp")
