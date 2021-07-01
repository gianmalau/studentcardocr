const express = require('express');
const multer = require('multer');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser')
const Tesseract = require('tesseract.js')
const Jimp = require('jimp')
const savePixels = require('save-pixels')
const getPixels = require('get-pixels')
const adaptiveThreshold = require('adaptive-threshold')
const mysql = require('./config/mysql');
const {
  time
} = require('console');

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, __dirname + '/images');
    },
    filename: (req, file, callback) => {
      callback(null, `${file.originalname}.${file.mimetype.split('/')[1]}`);
    }
  })
})


//middlewares
app.set('view engine', 'ejs');
app.use(express.urlencoded({
  extended: true
}));
app.use(express.static(__dirname + '/'));
app.use(bodyParser.json({
  limit: '50mb'
}));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));
app.use(express.json());

const PORT = process.env.PORT | 3000;
const {
  createWorker
} = Tesseract
let timer = 0

// intialize worker
const worker = createWorker({
  langPath: "/lang/",
  gzip: false,
  logger: m => {
    // console.log(m)
  }
})

const initialize = async () => {
  await worker.load()
  await worker.loadLanguage("ind")
  await worker.initialize("ind")
  // await worker.setParameters({preserve_interword_spaces: '1'})
}

initialize()

//route
app.get('/', (req, res) => {
  res.render('index');
});

app.post('/upload', upload.single('img_cropped'), async (req, res) => {

  
  let thresholdValue = 127
  
  let startTime = Date.now();
  let refreshInterval = setInterval(function () {
    var elapsedTime = Date.now() - startTime;
    timer = (elapsedTime / 1).toFixed(0);
  });

  const filename = req.file.originalname
  const format = req.file.mimetype.split('/')[1]
  const meanvalue = thresholdValue

  getPixels(`images/${filename}.${format}`, (err, pixels) => {
    if (err) {
      console.error(err)
      return
    }

    // set params here
    const option = {
      size: 41,
      compensation: 46
    }

    let thresholded = adaptiveThreshold(pixels, option)
    savePixels(thresholded, `${format}`).pipe(fs.createWriteStream('images/' + `${filename}.${format}`))
  })

  setTimeout(async () => {
    const image = fs.readFileSync(
      __dirname + '/images/' + `${filename}.${format}`, {
        encoding: null
      }
    )

    const {
      data: {
        text
      }
    } = await worker.recognize(image)

    const char = text.replace(/“|'|!|”|`|-|"|»|~|«|:|,|>|_|;/g, '');
    const data = char.split('\n')
    const fullname = data[0]
    // .replace(/;|.|L|~|5|3|"/g,'')
    const nim = data[1].replace(/ /g, '')

          const jumlah = data[2].split(' ')
          // const serialNumber = data[2].split(' ')[0] + data[2].split(' ')[1]
          // const email = data[2].split(' ')[2]
          let serialNumber = ''
          let email = ''
          let insertQuery = ''
          if (jumlah.length == 3) {
            serialNumber = data[2].split(' ')[0] 
            email = data[2].split(' ')[2] + data[2].split(' ')[1]
            insertQuery = `INSERT INTO students (fullname, email, nim, serial_number) VALUES ('${fullname}', '${email}', '${nim}', '${serialNumber}')`
            // console.log(fullname);
            // console.log(nim);
            // console.log(serialNumber);
            // console.log(email);  
          }
          else if(jumlah.length == 2){
            serialNumber = data[2].split(' ')[0]
            email = data[2].split(' ')[1]
            insertQuery = `INSERT INTO students (fullname, email, nim, serial_number) VALUES ('${fullname}', '${email}', '${nim}', '${serialNumber}')`
            // console.log(fullname);
            // console.log(nim);
            // console.log(serialNumber);
            // console.log(email);  
          }
          else if(jumlah.length == 4){
            serialNumber = data[2].split(' ')[0] + data[2].split(' ')[1] 
            email =  data[2].split(' ')[2] + data[2].split(' ')[3]
            insertQuery = `INSERT INTO students (fullname, email, nim, serial_number) VALUES ('${fullname}', '${email}', '${nim}', '${serialNumber}')`
            // console.log(fullname);
          }
          else if(jumlah.length == 5){
            serialNumber = data[2].split(' ')[0]  
            email = data[2].split(' ')[1] + data[2].split(' ')[2] + data[2].split(' ')[3] + data[2].split(' ')[4]
            insertQuery = `INSERT INTO students (fullname, email, nim, serial_number) VALUES ('${fullname}', '${email}', '${nim}', '${serialNumber}')`
            // console.log(fullname);
          }

          else if(jumlah.length == 6){
            serialNumber = data[2].split(' ')[0] + data[2].split(' ')[1]  
            email = data[2].split(' ')[2] + data[2].split(' ')[3] + data[2].split(' ')[4] + data[2].split(' ')[5]
            insertQuery = `INSERT INTO students (fullname, email, nim, serial_number) VALUES ('${fullname}', '${email}', '${nim}', '${serialNumber}')`
            // console.log(fullname);
          }

          else if(jumlah.length == 7){
            serialNumber = data[2].split(' ')[0] + data[2].split(' ')[1]  
            email = data[2].split(' ')[2] + data[2].split(' ')[3] + data[2].split(' ')[4] + data[2].split(' ')[5] + data[2].split(' ')[6]
            insertQuery = `INSERT INTO students (fullname, email, nim, serial_number) VALUES ('${fullname}', '${email}', '${nim}', '${serialNumber}')`
            // console.log(fullname);
          }

          else if(jumlah.length == 8){
            serialNumber = data[2].split(' ')[0] + data[2].split(' ')[1] + data[2].split(' ')[2] + data[2].split(' ')[3]
            email =   data[2].split(' ')[4] + data[2].split(' ')[5] + data[2].split(' ')[6] + data[2].split(' ')[7]
            insertQuery = `INSERT INTO students (fullname, email, nim, serial_number) VALUES ('${fullname}', '${email}', '${nim}', '${serialNumber}')`
            // console.log(fullname);
          }

          else {
            serialNumber = data[2].split(' ')[0]
            email =  data[2].split(' ')[1]
            email = email.split('@')[0]
            insertQuery = `INSERT INTO students (fullname, email, nim, serial_number) VALUES ('${fullname}', '${email}', '${nim}', '${serialNumber}')`
            // console.log(fullname);
          }

    // const serialNumber = data[2].split(' ')[0].replace(/,|_/g, '.')
    // let email = data[2].split(' ')[0].replace(/_/g, '')
    // email = email.split('@')[0] + '@ui.ac.id'

    // const insertQuery = `INSERT INTO students (fullname, email, nim, serial_number) VALUES ('${fullname}', '${email.split('@')[0]+'@ui.ac.id'}', '${nim}', '${serialNumber}')`

    // const insertQuery = `INSERT INTO students (fullname, email, nim, serial_number) VALUES ('${fullname}', '${email}', '${nim}', '${serialNumber}')`

    mysql.query(insertQuery, function (error, results, fields) {
      if (error) {
        res.json([{
          fullname: '',
          email: '',
          nim: '',
          serial_number: '',
          result: text
        }])
        throw error
      }
      if (results !== undefined) {
        const showQuery = `SELECT * from students WHERE students.id = '${results.insertId}'`
        mysql.query(showQuery, function (error, results, fields) {

          if (error) {
            res.json([{
              fullname: '',
              email: '',
              nim: '',
              serial_number: '',
              result: text
            }])
            throw error
          }
          res.json([{
            fullname: results[0].fullname,
            email: results[0].email,
            nim: results[0].nim,
            serial_number: results[0].serial_number,
            result: text
          }])
        })
      } else {
        res.json([{
          fullname,
          email,
          nim,
          serial_number: serialNumber,
          result: text
        }])
      }

      console.log("timer: ", timer, ' milisec')
      clearInterval(refreshInterval);
      timer = 0

    })

  }, 3000)
});

app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});