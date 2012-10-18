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

  var options = {
    target: '#fridge',
    beforeSubmit: function() {},
    success: rebindFridge
  };
  $("#addForm").ajaxForm(options);

  $("#addForm").submit(function(ev) {
    //    ev.preventDefault();
    $("#addDialog").dialog("close");
    //    $(this).ajaxSubmit(options);
    return false;
  });

  // An ajax call loads the fridge HTML fragment.
  $.ajax({
    url: '/fridge',
    type: 'GET',
    success: rewriteFridge
  });
});
