var localDev = true;
var button = document.getElementById('counterButton');
var counterDisplay = document.getElementById('count');
var requestUrl = "http://sparthcp.imad.hasura-app.io/counter";

button.onclick = function(){
  // change request url to local development server url
  if(localDev){
    requestUrl = "http://localhost/counter";
  }

  // create a request object with url and initialization object
  var counterRequest = new Request(requestUrl,{method:'GET'});

  // fetch the resource, if found successfully, display the text on the page
  fetch(counterRequest).then(function(response){
    if(response.status == 200){
      response.text().then(function(text){
        counterDisplay.innerHTML = text.toString();
      });
    }
    // something went wrong, throw an error
    else throw new Error("Request to counter failed!");
  });
};
//document.onload = fetchCounter();
