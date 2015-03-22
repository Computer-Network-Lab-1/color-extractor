var mysql = require('mysql');
var cm = require("colormatch")
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: '500px',
});

function rgb2yuv(rgb) {
    var y, u, v, r, g, b;
    r = rgb[0];
    g = rgb[1];
    b = rgb[2];

    y = r * .299000 + g * .587000 + b * .114000
    u = r * -.168736 + g * -.331264 + b * .500000 + 128
    v = r * .500000 + g * -.418688 + b * -.081312 + 128
    return [y, u, v];
}

connection.connect(function(err) {
    var query = connection.query('SELECT id FROM photos', function(err, rows, fields) {
        if (err) throw err;
        var func = function(i) {
            if (i < rows.length) {
                console.log('The file is', './' + rows[i].id + '.jpeg');
                cm.extract.imageMagick('./' + rows[i].id + '.jpeg', function(err, data) {
                    try {
                        data.sort(function(a, b) {
                            return a.percent > b.percent
                        });
                        if (data[0]) {
                            if (data[0].rgb.length === 3) {
                                // var update = connection.query('')
                                yuv = rgb2yuv(data[0].rgb)
                                y = yuv[0];
                                u = yuv[1];
                                v = yuv[2];
                                p = data[0].percent;
                                var update = connection.query('UPDATE photos SET colorY=\'' + y + '\', colorUV=GeomFromText(\'POINT(' + u + ' ' + v + ')\'), percentage=\'' + p + '\' WHERE id=\'' + rows[i].id + '\';');
                                // console.log('UPDATE photos SET colorY=\'' + y + '\', colorUV=GeomFromText(\'POINT(' + u + ' ' + v + ')\'), percentage=\''+p+'\' WHERE id=\'' + rows[i].id + '\';');
                            };
                            console.log(data[0]);
                        } else {
                            console.log('empty');
                        };
                    } catch (err) {
                        console.log(err.message);
                    }
                    func(i + 1);
                });
            } else {
                return;
            };
        }
        func(0);
    });
});
