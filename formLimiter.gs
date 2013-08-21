// Written by Andrew Stillman for New Visions for Public Schools
// Published under GNU General Public License, version 3 (GPL-3.0)
// See restrictions at http://www.opensource.org/licenses/gpl-3.0.html
// Support and contact at http://www.youpd.org/formlimiter
var scriptName = "formLimiter"
var scriptTrackingId = "UA-40677834-1"

var HOURS = [12,1,2,3,4,5,6,7,8,9,10,11];
var FORMLIMITERIMAGEID = '0B2vrNcqyzernR1dPa19jX3ZUUEk';

function onInstall() {
  onOpen();
}

function onOpen() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var preconfigStatus = ScriptProperties.getProperty('preconfigStatus');
  var menuItems = [];
  menuItems[0] = {name:'What is formLimiter?',functionName:'formLimiter_whatIs'};
  menuItems[1] = null;
  if (preconfigStatus=="true") {
    menuItems[2] = {name:'Settings',functionName:'formLimiter_settings'};
    menuItems[3] = null;
    menuItems[4] = {name:'Export settings', functionName:'formLimiter_extractorWindow'};
  } else {
    menuItems[2] = {name:'Run initial configuration',functionName:'formLimiter_preconfig'};
  }
  ss.addMenu('formLimiter', menuItems);
}

function formLimiter_settings() {
  var app = UiApp.createApplication().setTitle('formLimiter Settings').setHeight(300);
  var imageId = FORMLIMITERIMAGEID;
  var url = 'https://drive.google.com/uc?export=download&id='+imageId;
  var waitingImage = app.createImage(url).setWidth('150px').setHeight('150px').setStyleAttribute('position', 'absolute').setStyleAttribute('left', '130px').setStyleAttribute('top', '20px').setVisible(false);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var properties = ScriptProperties.getProperties();
  var panel = app.createVerticalPanel().setStyleAttribute('backgroundColor', 'whiteSmoke').setStyleAttribute('padding', '10px');
  var info = app.createLabel('Select when to stop accepting form responses via the settings below')
  var limiterTypeLabel = app.createLabel('Limiter type').setStyleAttribute('marginTop', '15px');
  var datePanel = app.createHorizontalPanel().setId('datePanel').setVisible(false);
  var dateWidget = app.createDateBox().setId('dateWidget').setName('date').setStyleAttribute('marginTop', '15px');
  var hourWidget = app.createListBox().setId('hourWidget').setName('hour').setStyleAttribute('marginTop', '15px');
  var minWidget = app.createListBox().setId('minWidget').setName('min').setStyleAttribute('marginTop', '15px');
  var amPMWidget = app.createListBox().setId('amPmWidget').setName('amPm').setStyleAttribute('marginTop', '15px');
  var numResponsesBox = app.createListBox().setName('numResponses').setId('numResponsesBox').setVisible(false).setStyleAttribute('marginTop', '15px');
  var cellRangeLabel = app.createLabel('Cell (SheetName!A2 format)').setStyleAttribute('marginTop', '15px');
  var cellRangeBox = app.createTextBox().setName('cellRange').setId('cellRangeBox').setStyleAttribute('marginTop', '15px');
  var equalsLabel = app.createLabel('equals').setStyleAttribute('marginTop', '15px');
  var valueBox = app.createTextBox().setName('cellValue').setId('valueBox').setStyleAttribute('marginTop', '15px');
  var cellValuePanel = app.createHorizontalPanel().setId('cellValuePanel').setVisible(false);
  cellValuePanel.add(cellRangeLabel).add(cellRangeBox).add(equalsLabel).add(valueBox);
  for (var j=0; j<HOURS.length; j++) {
    hourWidget.addItem(HOURS[j]);
  }
  for (var k=0; k<60; k++) {
    if (k<10) {
      var min = "0" + k;
    } else {
      var min = '' + k;
    }
    minWidget.addItem(min);
  }
  amPMWidget.addItem("AM").addItem("PM");
  datePanel.add(dateWidget).add(hourWidget).add(minWidget).add(amPMWidget);
  for (var i=0; i<1000; i++) {
    numResponsesBox.addItem(i+1)
  }
  var limiterTypeHandler = app.createServerHandler('formLimiter_refreshLimitType');
  var limiterTypeList = app.createListBox().setName('limiterType').setId('limiterTypeList').setStyleAttribute('marginTop', '15px');
  limiterTypeList.addItem('date and time');
  limiterTypeList.addItem('max number of form responses');
  limiterTypeList.addItem('spreadsheet cell value');
  limiterTypeList.addChangeHandler(limiterTypeHandler);
  panel.add(info);
  panel.add(limiterTypeLabel);
  panel.add(limiterTypeList);
  panel.add(datePanel);
  panel.add(numResponsesBox);
  panel.add(cellValuePanel);
  formLimiter_refreshLimitType();
  var notificationCheckBox = app.createCheckBox("send all Spreadsheet editors a notification when the form limit is reached").setName('notification').setStyleAttribute('marginTop', '25px').setValue(true);
  var notification = ScriptProperties.getProperty('notification');
  if (notification=="false") {
    notificationCheckBox.setValue(false);
  }
  var saveHandler = app.createServerHandler('formLimiter_saveFormLimit').addCallbackElement(panel);
  var button = app.createButton('Save settings', saveHandler).setStyleAttribute('marginTop', '25px');
  var waitingHandler = app.createClientHandler().forTargets(waitingImage).setVisible(true).forTargets(panel).setStyleAttribute('opacity', '0.5');
  button.addClickHandler(waitingHandler);
  panel.add(button);
  panel.add(notificationCheckBox);
  app.add(panel);
  app.add(waitingImage);
  ss.show(app);
  return app;
}


function formLimiter_refreshLimitType(e) {
  var app = UiApp.getActiveApplication();
  var datePanel = app.getElementById('datePanel');
  var dateWidget = app.getElementById('dateWidget');
  var hourWidget = app.getElementById('hourWidget');
  var minWidget = app.getElementById('minWidget');
  var amPmWidget = app.getElementById('amPmWidget');
  var numResponsesBox = app.getElementById('numResponsesBox');
  var cellValuePanel = app.getElementById('cellValuePanel');
  var cellRangeBox = app.getElementById('cellRangeBox');
  var valueBox = app.getElementById('valueBox');
  var limiterTypeList = app.getElementById('limiterTypeList');
  if (e) {
  var limiterType = e.parameter.limiterType;
  if (limiterType == 'date and time') {
    datePanel.setVisible(true);
    cellValuePanel.setVisible(false);
    numResponsesBox.setVisible(false);
  }
  if (limiterType == 'max number of form responses') {
    datePanel.setVisible(false);
    cellValuePanel.setVisible(false);
    numResponsesBox.setVisible(true);
  }
  if (limiterType == 'spreadsheet cell value') {
    datePanel.setVisible(false);
    numResponsesBox.setVisible(false);
    cellValuePanel.setVisible(true);
  }
  } else {
    var properties = ScriptProperties.getProperties();
    if ((properties.limiterType == 'date and time')||(!properties.limiterType)) {
      limiterTypeList.setSelectedIndex(0);
      datePanel.setVisible(true);
      if ((properties.date)&&(properties.date!='')) {
        var date = new Date(properties.date);
        if (properties.hour) {
          var hour = parseInt(properties.hour);
        } else {
          var hour = 12;
        }
        if (properties.min) {
          var min = parseInt(properties.min);
        } else {
          var min = 0;
        }
        var hourIndex = HOURS.indexOf(hour);
        if (properties.amPm) {
          var amPm = properties.amPm;
        } else {
          var amPm = "AM";
        }
        dateWidget.setValue(date);
        hourWidget.setSelectedIndex(hourIndex);
        minWidget.setSelectedIndex(min);
        if (amPm=="PM") {
          amPmWidget.setSelectedIndex(1);
        }
      }
      numResponsesBox.setVisible(false);
    }
    if (properties.limiterType == 'max number of form responses') {
      limiterTypeList.setSelectedIndex(1);
      datePanel.setVisible(false);
      if (properties.numResponses) {
        var index = parseInt(properties.numResponses)-1;
        numResponsesBox.setSelectedIndex(index);
      }
      numResponsesBox.setVisible(true);
    }
    
    if (properties.limiterType == 'spreadsheet cell value') {
      limiterTypeList.setSelectedIndex(2);
      cellValuePanel.setVisible(false);
      if (properties.cellRange) {
        cellRangeBox.setValue(properties.cellRange);
      }
      if (properties.cellValue) {
        valueBox.setValue(properties.cellValue);
      }
      cellValuePanel.setVisible(true);
    }
    
  }
  return app;
}

function formLimiter_checkSendNotification() {
  var notification = ScriptProperties.getProperty('notification');
  var ssId = ScriptProperties.getProperty('ssId');
  if (notification=="true") {
    var ss = SpreadsheetApp.openById(ssId);
    var form = FormApp.openByUrl(ss.getFormUrl());
    var formTitle = form.getTitle();
    var editors = ss.getEditors();
    var editorString = '';
    for (var i=0; i<editors.length; i++) {
      if (editors[i].getEmail()!='') {
        if (i>0) {
          editorString += ",";
        }
        editorString += editors[i].getEmail();
      }
    }
  }
  var body = "This is an automated message to inform you that the formLimiter script has automatically closed your form \"" + formTitle + ".\"";
  body += " You can view results and modify your form settings here: " + ss.getUrl();
  MailApp.sendEmail(editorString, "The form: \"" + formTitle + "\" has been closed", body);
  return;
}


function formLimiter_saveFormLimit(e) {
  setformLimiterSid();
  var app = UiApp.getActiveApplication();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ssId = ss.getId();
  ScriptProperties.setProperty('ssId', ssId);
  var limiterType = e.parameter.limiterType;
  var date = new Date(e.parameter.date);
  var amPm = e.parameter.amPm;
  var hour = parseInt(e.parameter.hour);
  var min = parseInt(e.parameter.min);
  var year = date.getYear();
  var month = date.getMonth();
  var day = date.getDate();
  var hour24 = hour;
  var cellRange = e.parameter.cellRange;
  var cellValue = e.parameter.cellValue;
  if ((amPm=="PM")&&(hour!=12)) {
    hour24 = hour + 12;
  }
  if ((amPm=="AM")&&(hour==12)) {
    hour24 = 0;
  }
  var dateTime = new Date(year, month, day, hour24, min);
  var numResponses = e.parameter.numResponses;
  var notification = e.parameter.notification;
  var properties = new Object();
  properties.limiterType = limiterType;
  properties.notification = notification;
  if ((limiterType=="date and time")&&(date)) {
    properties.date = date;
    properties.amPm = amPm;
    properties.hour = hour;
    properties.min = min;
    properties.cellRange = '';
    properties.cellValue = '';
    properties.numResponses = '';
    formLimiter_deleteFormTrigger();
    formLimiter_checkSetTimeTrigger(dateTime);
    formLimiter_logTimeLimitSet();
  }
  if ((limiterType=="max number of form responses")&&(numResponses)) {
    properties.numResponses = numResponses;
    properties.date = '';
    properties.amPm = '';
    properties.hour = '';
    properties.min = '';
    properties.cellRange = '';
    properties.cellValue = '';
    formLimiter_deleteTimeTrigger();
    formLimiter_checkSetFormTrigger();
    formLimiter_logNumLimitSet();
  }
  if (limiterType=="spreadsheet cell value") {
    properties.date = '';
    properties.amPm = '';
    properties.hour = '';
    properties.min = '';
    properties.numResponses = '';
    properties.cellRange = cellRange;
    try {
      var range = SpreadsheetApp.getActiveSpreadsheet().getRange(cellRange)
      } catch(err) {
        Browser.msgBox("Invalid range");
        return app;
      }
    properties.cellValue = cellValue;
    properties.cellRange = cellRange;
    formLimiter_deleteTimeTrigger();
    formLimiter_checkSetFormTrigger();
    formLimiter_logSSValueLimitSet();
  }
  ScriptProperties.setProperties(properties);
  app.close();
  return app;
}


function formLimiter_closeForm() {
  var ssId = ScriptProperties.getProperty('ssId');
  var ss = SpreadsheetApp.openById(ssId);
  var form = FormApp.openByUrl(ss.getFormUrl());
  form.setAcceptingResponses(false);
  formLimiter_checkSendNotification();
  formLimiter_logFormClosed();
  return;
}

function formLimiter_evaluateNumTrigger() {
  var ssId = ScriptProperties.getProperty("ssId");
  var limiterType = ScriptProperties.getProperty("limiterType");
  if (limiterType=="max number of form responses") {
    var numResponses = parseInt(ScriptProperties.getProperty('numResponses'));
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var activeSheet = ss.getActiveSheet();
    var form = FormApp.openByUrl(ss.getFormUrl());
    var responses = form.getResponses();
    if (responses.length>numResponses) {
      formLimiter_closeForm();
    }
    return;
  }
  if (limiterType=="spreadsheet cell value") {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var cellRange = ScriptProperties.getProperty('cellRange');
    var cellValue = ScriptProperties.getProperty('cellValue');
    var thisCellRange = ss.getRange(cellRange);
    var thisCellValue = thisCellRange.getValue().toString();
    if (thisCellValue==cellValue) {
      formLimiter_closeForm()
    }
    return;
  }
}


function formLimiter_checkSetTimeTrigger(dateTime) {
  formLimiter_deleteTimeTrigger();
  ScriptApp.newTrigger('formLimiter_closeForm').timeBased().at(dateTime).create();
  return;
}

function formLimiter_deleteTimeTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i=0; i<triggers.length; i++) {
    if (triggers[i].getHandlerFunction()=="formLimiter_closeForm") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  return;
}

function formLimiter_deleteFormTrigger() {
   var triggers = ScriptApp.getProjectTriggers();
  for (var i=0; i<triggers.length; i++) {
    if (triggers[i].getHandlerFunction()=="formLimiter_evaluateNumTrigger") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  return;
}

function formLimiter_checkSetFormTrigger() {
  formLimiter_deleteFormTrigger()
  var ssId = ScriptProperties.getProperty('ssId');
  ScriptApp.newTrigger('formLimiter_evaluateNumTrigger').forSpreadsheet(ssId).onFormSubmit().create();
  return;
}
