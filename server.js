var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var bodyParser = require('body-parser');
var session = require("express-session");

var config = {
  host:"http://db.imad.hasura-app.io",
  port: "5432",
  user:"sparthcp",
  password:"db-sparthcp-8828",
  database:"sparthcp"
};

var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(session({
  secret: "don't tilt me",
  cookie:{maxAge: 1000 * 3600 * 24 * 30}
}));

var articles={
    'article-one': {
    title: "Article One | Parth Suthar",
    heading: "Article One",
    date: "5th Aug",
    content: `<p>
          This is the content of Article One. This is the content of Article One. This is the content of Article One.
          This is the content of Article One. This is the content of Article One. This is the content of Article One.
          This is the content of Article One. This is the content of Article One. This is the content of Article One.
        </p>
        <p>
          This is the content of Article One. This is the content of Article One. This is the content of Article One.
          This is the content of Article One. This is the content of Article One. This is the content of Article One.
          This is the content of Article One. This is the content of Article One. This is the content of Article One.
        </p>`,
    },
    'article-two':{
        title: "Article Two | Parth Suthar",
    heading: "Article Two",
    date: "5th Aug",
    content: `<p>
          This is the content of Article Two.
        </p>
        <p>
          This is the content of Article Two.
        </p>`
    },
    'article-three':{
        title: "Article Three | Parth Suthar",
    heading: "Article Three",
    date: "5th Aug",
    content: `<p>
          This is the content of Article Three.
        </p>
        <p>
          This is the content of Article Three.
        </p>`
    }
};

function createTemplate(data){
    var title = data.title;
    var heading = data.heading;
    var date = data.date;
    var content = data.content;
    var htmlTemplate = `<html>
                          <head>
                            <title>${title}</title>
                            <meta name="viewport" content="width=device-width, initial-scale=1"/>
                            <link href="/ui/style.css" rel="stylesheet" />
                          </head>
                          <body>
                              <div class="container">
                                <div>
                                  <a href="/">Home</a>
                                </div>
                                <hr>
                                <h3>
                                  ${heading}
                                </h3>
                                <div>
                                  ${date}
                                </div>
                                ${content}
                                <hr/>
                                <div id="enterCommentDiv">
                                <textarea placeholder="add comment..." id='commentArea' rows="5" cols="45"></textarea>
                                <br/>
                                <button id='commentSubmit'>Submit</button><br/>
                                </div>
                                <h5>Comments</h5>
                                <ul id='commentList'>
                                </ul>
                            </div>
                            <script type="text/javascript" src="/ui/article-comments.js"></script>
                          </body>
                        </html>`;

    return htmlTemplate;
}

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

function hash(input, salt){
  var hashed = crypto.pbkdf2Sync(input, salt, 100000, 512, 'sha512');
  return ["pbkdf2sync", "10000", salt, hashed.toString("hex")].join("$");
}

//var salt = "this-is-some-random-string";
app.get('/hash/:input', function(req, res){
  var hashedString = hash(req.params.input, salt);
  res.send(hashedString);
});

var pool = new Pool(config);
app.post('/create-user', function(req, res){
  var username = req.body.username;
  var password = req.body.password;
  var salt = crypto.randomBytes(128).toString('hex');
  var dbString = hash(password, salt);
  pool.query('INSERT INTO "user" (username, password) VALUES ($1, $2)',[username, dbString], function(err, result){
    if(err){
      res.status(500).send(err.toString());
    } else{
      res.send("User added successfully: "+username);
    }
  });
});

app.post('/login', function(req, res){
  var username = req.body.username;
  var password = req.body.password;
  
  pool.query('SELECT * FROM "user" WHERE username = $1',[username], function(err, result){
    if(err){
      res.status(500).send(err.toString());
    } else{
      if(result.rows.length == 0){
        res.status(403).send("username/password invalid");
      } else{
        //match the password
        var dbString = result.rows[0].password;
        var salt = dbString.split('$')[2];
        var hashedPassword = hash(password, salt);
        
        if(hashedPassword === dbString){
          req.session.auth = {userId: result.rows[0].id};
          res.send("Credentials are correct!");
        } else{
          res.status(403).send("username/password invalid");
        }

      }
      res.send("User added successfully: "+username);
    }
  });
});

app.get('/check-login', function(req, res){
  if(req.session && req.session.auth && req.session.auth.userId)
    res.send("You are logged in: "+ req.session.auth.userId);
  else
    res.send("You are logged out.");
});

app.get('/logout', function(req, res){
  delete req.session.auth;
  res.send("Logged out");
});


app.get('/test-db', function(req, res){
  pool.query("SELECT * FROM user", function(err, result){
    if(err){
      res.status(500).send(err.toString());
    } else{
      res.send(JSON.stringify(result));
    }
  });
});

var counter = 0;
app.get('/counter', function(req, res){
  counter++;
  res.send(counter.toString());
});

app.get('/:articleName', function(req, res) {
    var articleName = req.params.articleName;
  res.send(createTemplate(articles[articleName]));
});

// app.get('/article-two', function(req, res) {
//   res.send(createTemplate(articles.articleTwo));
// });

// app.get('/article-three', function(req, res) {
//   res.send(createTemplate(articles.articleThree));
// });

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/parth.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'parth.png'));
});

app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});

app.get('/ui/article-comments.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'article-comments.js'));
});

// Do not change port, otherwise your app won't run on IMAD servers
// Use 8080 only for local development if you already have apache running on 80

var port = 80;
app.listen(port, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
