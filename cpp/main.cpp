#include <iostream>
#include <QTextStream>

#include "codegen/emoji/data.h"

int main()
{
    QTextStream out(stdout);
    auto data = codegen::emoji::PrepareData();
    foreach (auto const& emoji, data.list) {
        out << emoji.id << endl;
    }
    return 0;
}
