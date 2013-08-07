function formLimiter_whatIs() {
  var imageId = FORMLIMITERIMAGEID;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var url = 'https://drive.google.com/uc?export=download&id='+imageId;
  var app = UiApp.createApplication().setHeight(440);
  var grid = app.createGrid(2, 2);
  var image = app.createImage(url).setWidth("120px").setHeight("120px");
  var label = app.createLabel("formLimiter: Limit the number of responses, set a time limit, or evaluate a cell value to automatically stop accepting responses on a Google form").setStyleAttribute('verticalAlign', 'top').setStyleAttribute('fontSize', '16px');
  grid.setWidget(0, 0, image).setWidget(0, 1, label).setStyleAttribute(0, 1, 'verticalAlign', 'top');
  var html = "Features:";
  html += "<ul><li>Set a maximimum number of responses after which the form automatically stops accepting responses. Great for use with sign ups involving limited-enrollment or quantities.</li>";
  html += "<li>Set a time limit after which the form will stop accepting responses. Great for enforcing submission deadlines</li>";
  html += "<li>Select a cell and set a value to evaluate to turn off the form. Useful in more complex scenarios, such as limiting on a sum of submitted values.</li></ul>";
  var description = app.createHTML(html);
  var sponsorLabel = app.createLabel("Brought to you by");
  var sponsorImage = app.createImage("http://www.youpd.org/sites/default/files/acquia_commons_logo36.png");
  var supportLink = app.createAnchor('Watch the tutorial!', 'http://www.youpd.org/formlimiter');
  var bottomGrid = app.createGrid(3, 1);
  bottomGrid.setWidget(0, 0, sponsorLabel);
  bottomGrid.setWidget(1, 0, sponsorImage);
  bottomGrid.setWidget(2, 0, supportLink);
  app.add(grid);
  app.add(description);
  app.add(bottomGrid);
  ss.show(app)
  return app;
}
