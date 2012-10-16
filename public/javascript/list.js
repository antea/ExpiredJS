/*
 * We update the fridge table.
 */

function updateFridge() {
  // An ajax call loads the fridge HTML fragment.
  $.ajax({
    url: '/fridge',
    type: 'GET',
    success: function(text) {
      // The fridge table il updated.
      $('#fridge').html(text);
      // The delete buttons are redrawn and rebound
      $(".deleteButton").button({
        icons: {
          primary: "ui-icon-trash"
        },
        text: false
      });
      $(".deleteButton").click(function(ev) {
        ev.preventDefault();
        $.ajax({
          url: $(this).attr('href')
        });
        updateFridge();
      });
    }
  });
}

$(document).ready(function() {
  $(document).tooltip();
  $("#addDialog").dialog({
    autoOpen: false
  });

  $("#inputExpires").datepicker();

  $("#addButton").button();
  $("#addButton").click(function() {
    $("#addDialog").dialog("open");
  });

  $("#addForm").submit(function(ev) {
    updateFridge();
  });

  updateFridge();
});
