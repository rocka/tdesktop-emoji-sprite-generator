#include <QFile>
#include <QDebug>
#include <QTextStream>

#include "codegen/emoji/data.h"

int main(int argc, char *argv[])
{
    if (argc < 3) {
        qDebug() << "Not enough arguments! Usage:" << Qt::endl
                 << argv[0] << "/path/to/emoji.txt /path/to/output.txt";
        return 1;
    }
    auto data = codegen::emoji::PrepareData(argv[1], {});
    QFile output(argv[2]);
    output.open(QIODevice::WriteOnly | QIODevice::Text);
    if(!output.isOpen()){
        qDebug() << "Cannot open output file: " << argv[2];
        return 2;
    }
    QTextStream outStream(&output);
    foreach (auto const& emoji, data.list) {
        outStream << emoji.id << Qt::endl;
    }
    return 0;
}
