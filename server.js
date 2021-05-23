require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');
const ejs = require('ejs');
const methodOverride = require('method-override');
const pg = require('pg');
const superagent = require('superagent');
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');
// const client = new pg.Client(process.env.DATABASE_URL);
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });


app.get('/', homePage);
app.get('/searchPage', searchPage);
app.get('/resultPage', resultPage);

app.post('/addToDataBase', addToDataBase);
app.get('/myListPage', myListPage);
app.get('/jobDetailsPage/:id', jobDetailsPage);
app.put('/updateJob/:id', updateJob);
app.delete('/deleteJob/:id', deleteJob);


function updateJob(req, res) {
  const { title, company, location, url, description } = req.body;

  const SQL = `UPDATE jobs SET title=$1,company=$2,location=$3,url=$4,description=$5
  WHERE id=$6;`;
  console.log(title, company, location, url, description, req.params.id)
  const safeValues = [title, company, location, url, description, req.params.id];
  client.query(SQL, safeValues).then(result => {
    res.redirect(`/jobDetailsPage/${req.params.id}`);
  }).catch(e=>
    {
      console.log(e)
    });

}
function deleteJob(req, res) {


  const SQL = `DELETE FROM jobs
  WHERE id=$1;`;
  const safeValues = [req.params.id];
  client.query(SQL, safeValues).then(result => {
   
    res.redirect(`/myListPage`);
  });

}


function jobDetailsPage(req, res) {

  const SQL = 'SELECT  * FROM jobs where id=$1;';
  const safeValues = [req.params.id];
  client.query(SQL, safeValues).then(result => {
    res.render('jobDetailsPage', { data: result.rows });
  });

}
function addToDataBase(req, res) {
  const { title, company, location, url, description } = req.body;
  const SQL = `INSERT INTO jobs (title,company,location,url,description)
  VALUES ($1,$2,$3,$4,$5);`;
  const safeValues = [title, company, location, url, description];
  client.query(SQL, safeValues).then(result => {
    res.redirect('/myListPage');
  });

}
function myListPage(req, res) {
  const SQL = 'SELECT  * FROM jobs;';
  client.query(SQL).then(result => {
    res.render('myListPage', { data: result.rows });
  })

}

function searchPage(req, res) {
  res.render('searchPage');
}
function homePage(req, res) {
  superagent.get('https://jobs.github.com/positions.json?location=usa').then(result => {
    const data = result.body;

    res.render('homePage', {
      data: data.map(ele => {
        return new HomePage(ele);
      })
    })
  })
}
function resultPage(req, res) {
  superagent.get(`https://jobs.github.com/positions.json?description=${req.query.desc}&location=usa`).then(result => {
    const data = result.body;

    res.render('resultPage', {
      data: data
    })
  })
}
function HomePage(data) {
  this.title = data.title;
  this.company = data.company;
  this.location = data.location;
  this.url = data.url;
}
client.connect().then(() => {
  app.listen(PORT, () => {
    console.log(`connect on ${PORT}`);
  })
})