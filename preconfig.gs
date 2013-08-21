function formLimiter_preconfig() {
  setformLimiterSid()
  // if you are interested in sharing your complete workflow system for others to copy (with script settings)
  // Select the "Generate preconfig()" option in the menu and
  //#######Paste preconfiguration code below before sharing your system for others to copy#######
  
 
  
  
  
  
  
  //#######End preconfiguration code#######
  ScriptProperties.setProperty('preconfigStatus', 'true');
  onOpen();
}


function formLimiter_extractorWindow () {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var properties = ScriptProperties.getProperties();
  var propertyString = '';
  for (var key in properties) {
    if ((properties[key]!='')&&(key!="preconfigStatus")&&(key!="formLimiter_sid")&&(key!="ssId")) {
      var keyProperty = properties[key].replace(/[/\\*]/g, "\\\\");                                     
      propertyString += "   ScriptProperties.setProperty('" + key + "','" + keyProperty + "');\n";
    }
  }
  var app = UiApp.createApplication().setHeight(500).setTitle("Export preconfig() settings");
  var panel = app.createVerticalPanel().setWidth("100%").setHeight("100%");
  var labelText = "Copying a Google Spreadsheet copies scripts along with it, but without any of the script settings saved.  This normally makes it hard to share full, script-enabled Spreadsheet systems. ";
  labelText += " You can solve this problem by pasting the code below into a script file called \"formLimiter_preconfig\" (go to formLimiter in the Script Editor and select \"preconfig.gs\" in the left sidebar) prior to publishing your Spreadsheet for others to copy. \n";
  labelText += " After a user copies your spreadsheet, they will select \"Run initial configuration.\"  This will preconfigure all needed script settings.  If you got this workflow from someone as a copy of a spreadsheet, this has probably already been done for you.";
  var label = app.createLabel(labelText);
  var window = app.createTextArea();
  var codeString = "//This section sets all script properties associated with this formLimiter profile \n";
  codeString +=  "var ssId = SpreadsheetApp.getActiveSpreadsheet().getId();\n";
  codeString +=  "ScriptProperties.setProperty('ssId', ssId);\n";
  codeString += "var preconfigStatus = ScriptProperties.getProperty('preconfigStatus');\n";
  codeString += "if (preconfigStatus!='true') {\n";
  codeString += propertyString; 
  codeString += "};\n";
  codeString += "ScriptProperties.setProperty('preconfigStatus','true');\n";
  codeString += "var ss = SpreadsheetApp.getActiveSpreadsheet();\n";
  codeString += "if (ss.getSheetByName('Forms in same folder')) { \n";
  codeString += "  formLimiter_retrieveformurls(); \n";
  codeString += "} \n";
  codeString += "var properties = ScriptProperties.getProperties();\n";
  codeString += "if (properties.limiterType == 'date and time') {\n"
  codeString += "   formLimiter_deleteFormTrigger();\n";
  codeString += "   var date = new Date(e.parameter.date);\n";
  codeString += "   var amPm = e.parameter.amPm;\n";
  codeString += "   var hour = parseInt(e.parameter.hour);\n";
  codeString += "   var min = parseInt(e.parameter.min);\n";
  codeString += "   var year = date.getYear();\n";
  codeString += "   var month = date.getMonth();\n";
  codeString += "   var day = date.getDate();\n";
  codeString += "   var hour24 = hour;\n";
  codeString += " if ((amPm==\"PM\")&&(hour!=12)) {\n";
  codeString += "   hour24 = hour + 12;\n";
  codeString += " }\n";
  codeString += " if ((amPm==\"AM\")&&(hour==12)) {\n";
  codeString += "   hour24 = 0;\n";
  codeString += " }\n";
  codeString += "   var dateTime = new Date(year, month, day, hour24, min);\n";
  codeString += "   formLimiter_checkSetTimeTrigger(dateTime);\n";
  codeString += "} else if ((properties.limiterType == 'max number of form responses')||(properties.limiterType == 'spreadsheet cell value')) {\n";
  codeString += "   formLimiter_deleteTimeTrigger();\n";
  codeString += "   formLimiter_checkSetFormTrigger();\n";
  codeString += "}\n";
  codeString += "ss.toast('Custom formLimiter preconfiguration ran successfully. Please check formLimiter menu options to confirm system settings.');\n";
  window.setText(codeString).setWidth("100%").setHeight("350px");
  app.add(label);
  panel.add(window);
  app.add(panel);
  ss.show(app);
  return app;
}
