// THIS IS THE QUERY DB AND THIS IS HOW YOU SEARCH
if (document.getElementById("searchButton")){
  var searchButton = document.getElementById("searchButton")
  searchButton.addEventListener("click", function(){
    const itemTitle = document.getElementById("listingsItemName").value
    window.location.href=`/searchItems?q=${itemTitle}`
    })
  }

var claim = document.getElementById('claim')
var trash = document.getElementsByClassName("fa-trash");

Array.from(trash).forEach(function(element) {
      element.addEventListener('click', function(){
        let _id = this.getAttribute('id')

        fetch('deletePost', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            '_id': _id
          })
        }).then(function (response) {
          window.location.reload()
        })
      });
});

Array.from(claim).forEach(function(element) {
      element.addEventListener('click', function(){
        console.log()
        // const name = this.parentNode.parentNode.childNodes[1].innerText
        // const msg = this.parentNode.parentNode.childNodes[3].innerText
        // const thumbUp = parseFloat(this.parentNode.parentNode.childNodes[5].innerText)
        fetch('listings', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            'claimedBy': claimedBy
          })
        })
        .then(response => {
          if (response.ok) return response.json()
        })
        .then(data => {
          console.log(data)
          window.location.reload(true)
        })
      });
});

//form for the food banks
// get the value of that form = city
  // fetch the api
  //
  // I want it to navigate me to shelter-listings page, and show 3 food banks within that city
