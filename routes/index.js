const express = require('express');
const router = express.Router();
const mysql = require('mysql')
const dotenv = require('dotenv');
const fs = require('fs/promises');
dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

connection.connect();

/* GET home page. */
router.get('/', async function (req, res, next) {

  const data = await fs.readFile('./current.json', 'utf-8');
  const json = JSON.parse(data);

  const now = new Date();
  const oldDate = new Date(json.day)
  let website = json;

  if (now.getUTCDate() !== oldDate.getUTCDate()
      || now.getUTCMonth() !== oldDate.getUTCMonth()
      || now.getUTCFullYear() !== oldDate.getUTCFullYear()
  ) {
    connection.query('select title, description, url from websites order by RAND() limit 1;', (err, result) => {
      if (err) throw err;
      website = result[0];
      website.day = now;
      fs.writeFile('./current.json', JSON.stringify(website));
      render(res, website);
    });
    connection.end();
    return;
  }
  render(res, website);

});

function render(res, data) {
  res.render('index', {
    title: 'Interesting website of the day',
    website: data,
  });
}

module.exports = router;
