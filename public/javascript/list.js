function updateFridge() {
  $.ajax({
    url: '/fridge',
    type: 'GET',
    success: function(text) {
      $('#fridge').html(text)
    }
  });
}

$(document).ready(function() {
  $(".fridge td").hover(function() {
    $(this).addClass("green");
  }, function() {
    $(this).removeClass("green");
  });

  $("#addDialog").dialog({
    autoOpen: false,
    show: "blind",
    hide: "blind"
  });

  $("#inputExpires").datepicker();

  $("#addButton").button();
  $("#addButton").click(function() {
    $("#addDialog").dialog("open");
  });
  
  $("#addForm").submit(function(ev) {
    ev.preventDefault();
    $("#addDialog").dialog("close");
    var $form = $(this);
    var name = $("#inputName").val();
    var expires = $("#inputExpires").val();
    var url = $form.attr('action');
    $.post(url, {
      'name': name,
      'expires': expires
    }, function(data) {
      updateFridge();
    });
  });
  
  updateFridge();
});
