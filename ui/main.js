var localDev = true;
var button = document.getElementById('loginSubmit');
//var counterDisplay = document.getElementById('count');
//var requestUrl = "http://sparthcp.imad.hasura-app.io/counter";
var requestUrl = "http://sparthcp.imad.hasura-app.io/login";

// function fetchCounter(){
//   // change request url to local development server url
//   if(localDev){
//     requestUrl = "http://localhost/counter";
//   }

//   // create a request object with url and initialization object
//   var counterRequest = new Request(requestUrl,{method:'GET'});

//   // fetch the resource, if found successfully, display the text on the page
//   fetch(counterRequest).then(function(response){
//     if(response.status == 200){
//       response.text().then(function(text){
//         counterDisplay.innerHTML = text.toString();
//       });
//     }
//     // something went wrong, throw an error
//     else throw new Error("Request to counter failed!");
//   });
// }

// need to move the script in header tag so that it can be loaded before the
// document and hence be able to handle onload event
// document.onload = function(){
//   fetchCounter();
// };
// button.onclick = function(){
//   fetchCounter();
// };

function authenticate(){
  // change request url to local development server url
  if(localDev){
    requestUrl = "http://localhost/login";
  }

  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;

  // set the headers
  var myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');  

  // create a request object with url and initialization object
  var loginRequest = new Request(requestUrl,{method:'POST', headers: myHeaders});

  // fetch the resource, if found successfully, display the text on the page
  fetch(loginRequest).then(function(response){
    if(response.status == 200){
      response.text().then(function(text){
        console.log("Login successful!");
      });
    } else if(response.status === 403){
      console.log(response.status+ ": Invalid username/password");
    } else if(response.status === 500){
      console.log("Something went wrong with the server...");
    }// something went wrong, throw an error
    else throw new Error("Request failed!");
  });
}

button.onclick = function(){
  authenticate();
}