cmake_minimum_required(VERSION 3.0)

project(tdesktop-emoji-sprite-generator)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_INCLUDE_CURRENT_DIR ON)
# Instruct CMake to run moc automatically when needed
#set(CMAKE_AUTOMOC ON)

find_package(Qt5 COMPONENTS Core REQUIRED)

add_executable(tdesktop-emoji-sprite-generator
    codegen/common/logging.cpp
    codegen/emoji/data.cpp
    codegen/emoji/data_old.cpp
    codegen/emoji/data_read.cpp
    codegen/emoji/replaces.cpp
    main.cpp
)

target_link_libraries(tdesktop-emoji-sprite-generator Qt5::Core)
