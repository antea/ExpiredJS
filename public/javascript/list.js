// Substitutes the current #fridge div with the new text and 
// rebinds the delete buttons.

function rewriteFridge(text) {
  // The fridge table is updated.
  $('#fridge').html(text);
  rebindFridge();
}

function rebindFridge() {
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
      url: $(this).attr('href'),
      success: rewriteFridge
    });
    $(".ui-tooltip").fadeOut();
  });
  $(".imageButton").click(function(ev) {
    ev.preventDefault();
    $("#imageDialog").dialog("open");
    $("#fullimage").attr("src", "/img/" + $(this).attr('name'));
  });
}

$(document).ready(function() {
  $(document).tooltip();
  $("#addDialog").dialog({
    autoOpen: false
  });

  $("#imageDialog").dialog({
    title: 'Full image',
    autoOpen: false,
    resizable: false,
    width: 400,
    height: 300
  })

  $("#inputExpires").datepicker();

  $("#addButton").button();
  $("#addButton").click(function() {
    $("#addDialog").dialog("open");
  });

  $("#addForm").ajaxForm({
    target: '#fridge',
    success: rebindFridge
  });

  $("#addForm").submit(function(ev) {
    $("#addDialog").dialog("close");
    return false;
  });

  // An ajax call loads the fridge HTML fragment.
  $.ajax({
    url: '/fridge',
    type: 'GET',
    success: rewriteFridge
  });
});
