const mysql = require('mysql')

const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'thresholding'
});

connection.connect((err) => {
if (err) {
    console.error('error connecting: ' + err.stack);
    return;
}
    console.log('connected to database..');
})

module.exports = connection