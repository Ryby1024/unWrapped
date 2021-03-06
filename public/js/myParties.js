if (!localStorage.getItem("userId")) {
  alert("please log in");
  window.location.href = "/";
}

$("#updateForm").hide();
$("#rsvpList").hide();
$("#guestUpdateList").hide();

$(document).ready(function() {
  let user = localStorage.getItem("userId");

  $.get("/api/parties/" + user).then(function(data) {
    let db = data.dbParties;

    let photo;

    for (let i = 0; i < db.length; i++) {
      switch (db[i].occasion) {
        case "Wedding":
          photo = "imgs/myWedding.jpg";
          break;
        case "Bridal":
          photo = "imgs/myBridal.jpg";
          break;
        case "Baby":
          photo = "imgs/myBaby.jpg";
          break;
        case "Birthday":
          photo = "imgs/myBirthday.jpg";
          break;
        case "Graduation":
          photo = "imgs/myGraduation.jpg";
          break;
        case "Retirement":
          photo = "imgs/myRetirement.jpg";
          break;
        default:
          break;
      }

      let formatDate = moment(db[i].date).format("MMMM Do YYYY");
      let formatTime = moment(db[i].time, "HH:MM").format("LT");

      let thediv = $("<div>")
        .addClass("card m-4")
        .addClass("theCard")
        .attr("style", "width: 18rem;")
        .attr("id", "cardBody")
        .attr("data-aos", "flip-left")
        .attr("data-aos-duration", "1500");

      let theImg = $("<img>")
        .attr("src", photo)
        .attr("alt", "")
        .addClass("card-img-top");

      let divBody = $("<div>").addClass("card-body");

      let pTag = $("<p>")
        .addClass("card-text")
        .addClass("card-text ml-3").html(`Party Name: ${db[i].name} <br> 
                  Occasion: ${db[i].occasion} <br>
                  Location: ${db[i].location}<br>
                  Date: ${formatDate} <br>                  
                  Time: ${formatTime} <br>
                  Party Code: ${db[i].partyCode}`)

      var updateBtn = $("<button>");

      updateBtn.attr("id", db[i].id);
      updateBtn.addClass("update");
      updateBtn.addClass("ml-3");
      updateBtn.addClass("mb-3");
      updateBtn.addClass("btn btn-danger");
      updateBtn.addClass("btn-sm");
      updateBtn.text(" Update ");

      var deleteBtn = $("<button>");

      deleteBtn.attr("id", db[i].id);
      deleteBtn.addClass("delete");
      deleteBtn.addClass("ml-3");
      deleteBtn.addClass("mb-3");
      deleteBtn.addClass("btn btn-danger");
      deleteBtn.addClass("btn-sm");
      deleteBtn.text(" Delete ");

      var rsvpBtn = $("<button>");

      rsvpBtn.attr("id", db[i].id);
      rsvpBtn.addClass("rsvp");
      rsvpBtn.addClass("ml-3");
      rsvpBtn.addClass("mb-3");
      rsvpBtn.addClass("btn btn-danger");
      rsvpBtn.addClass("btn-sm");
      rsvpBtn.text(" RSVPs ");

      let applyUpdate = $("<td class='align-middle'>").html(updateBtn);
      let applydelete = $("<td class='align-middle'>").html(deleteBtn);
      let applyrsvp = $("<td class='align-middle'>").html(rsvpBtn);

      thediv.append(theImg);
      thediv.append(divBody);
      thediv.append(pTag);
      thediv.append(applyrsvp);
      thediv.append(applyUpdate);
      thediv.append(applydelete);
      $("#myParties").append(thediv);
    }
  });

  // updated button and form
  $("#updateSubmit").on("click", function(event) {
    event.preventDefault();

    var updatedInfo = {
      id: $(this).attr("party-id"),
      name: $("#updatedName")
        .val()
        .trim(),
      occasion: $("#updatedType").val(),
      location: $("#updatedLocation")
        .val()
        .trim(),
      date: $("#updatedDate")
        .val()
        .trim(),
      time: $("#updatedTime")
        .val()
        .trim()
    };

    $.ajax({
      method: "PUT",
      url: "/api/parties/update/party",
      data: updatedInfo
    }).then(function(data) {
      window.location.href = "/myParties";
      $(".table").show();
      $(".updateParty").hide();
    });
  });

  // guest info (gift and thank you card) update
  $("#guestUpdate").on("click", function(event) {
    event.preventDefault();

    let updatedInfo = {
      id: $(this).attr("rsvp-id"),
      gift: $("#giftInput")
        .val()
        .trim(),
      thankYou: $("#guestNote").val()
    };

    $.ajax({
      method: "PUT",
      url: "/api/rsvp/updateinfo/",
      data: updatedInfo
    }).then(function(data) {
      localStorage.setItem("guestUpdate", "");
      getRsvpList(localStorage.getItem("partyId"))
      $("#guestUpdateList").hide();
      $("#rsvpList").show();
      $("#giftInput").val("");
      $("#guestNote").val(0);
      
    });
  });

  // rsvp list
  $(document).on("click", ".rsvp", function() {
    $("#norsvp").show();
    $("#rsvpList").show();
    $("#myParties").hide();
    let id = $(this).attr("id");
    localStorage.setItem("partyId", id);
    getRsvpList(id)
  });

  //update guest - gift and thank you
  $(document).on("click", ".updateGuest", function() {
    $("#myParties").hide();
    $("#rsvpList").hide();
    $("#guestUpdateList").show();

    let id = $(this).attr("id");

    $.get("/api/users/update/" + id).then(function(data) {
      let db = data.data;
      $("#guestUpdate").attr("rsvp-id", id)
      $("#guestName").text(`Guest: ${db.User.firstName} ${db.User.lastName}`);
      $("#giftInput").val(db.gift)
    });
  });

  //update method
  $(document).on("click", ".update", function() {
    $("#myParties").hide();
    $("#updateForm").show();
    let id = $(this).attr("id");
    $("#updateSubmit").attr("party-id", id);

    localStorage.setItem("partyId", id);

    $.get("/api/parties/update/" + id).then(function(data) {
      db = data.dbParty;

      $("#updatedName").val(db.name);
      $("#updatedLocation").val(db.location);
      $("#updatedType").val(db.occasion);
      $("#updatedDate").val(db.date);
      $("#updatedTime").val(db.time);
    });
  });

  //delete method
  $(document).on("click", ".delete", function() {
    let id = $(this).attr("id");

    $.ajax({
      method: "DELETE",
      url: "/api/parties/" + id
    }).then(function(data) {
      location.reload();
    });
  });
}); // document ready end bracket


function getRsvpList(id) {
  $.get("/api/rsvp/guests/" + id).then(function(data) {

    $("tbody").empty();   

    let db = data.dbParty;

    for (let i = 0; i < db.length; i++) {

      console.log(db[i])

      $("#norsvp").hide();

      let tRow = $("<tr>");

      let name = db[i].User.firstName + " " + db[i].User.lastName;
      let email = db[i].User.email;
      let address = db[i].User.address;
      let thankYou = "Not Sent";

      if (db[i].thankYou) {
        thankYou = "Sent";
      }

      let guestName = $("<td class='align-middle'>").html(`${name}`);
      let guestEmail = $("<td class='align-middle'>").html(`${email}`);
      let guestAddress = $("<td class='align-middle'>").html(`${address}`);
      let guestGift = $("<td class='align-middle'>").html(db[i].gift);
      let thankYouNote = $("<td class='align-middle'>").html(thankYou);

      var updateBtn = $("<button>");

      updateBtn.attr("id", db[i].id);
      updateBtn.addClass("updateGuest");
      updateBtn.addClass("btn btn-danger");
      updateBtn.addClass("btn-sm");
      updateBtn.text(" Update ");

      let applyUpdate = $("<td class='align-middle'>").html(updateBtn);

      tRow.append(
        guestName,
        guestEmail,
        guestAddress,
        guestGift,
        thankYouNote,
        applyUpdate
      );

      $("#guestList").prepend(tRow);
      
    }
  });
}

function createPDF(data) {

  const doc = new PDFDocument();

  doc.pipe(fs.createWriteStream('output.pdf'));
}