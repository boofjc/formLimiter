function formLimiter_institutionalTrackingUi() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var institutionalTrackingString = UserProperties.getProperty('institutionalTrackingString');
  var eduSetting = UserProperties.getProperty('eduSetting');
  if (!(institutionalTrackingString)) {
    UserProperties.setProperty('institutionalTrackingString', 'not participating');
  }
  var app = UiApp.createApplication().setTitle('Hello there! Help us track the usage of this script').setHeight(400);
  if ((!(institutionalTrackingString))||(!(eduSetting))) {
    var helptext = app.createLabel("You are most likely seeing this prompt because this is the first time you are using a Google Apps script created by New Visions for Public Schools, 501(c)3. If you are using scripts as part of a school or grant-funded program like New Visions' CloudLab, you may wish to track usage rates with Google Analytics. Entering tracking information here will save it to your user credentials and enable tracking for any other New Visions scripts that use this feature. No personal info will ever be collected.").setStyleAttribute('marginBottom', '10px');
  } else {
    var helptext = app.createLabel("If you are using scripts as part of a school or grant-funded program like New Visions' CloudLab, you may wish to track usage rates with Google Analytics. Entering or modifying tracking information here will save it to your user credentials and enable tracking for any other scripts produced by New Visions for Public Schools, 501(c)3, that use this feature. No personal info will ever be collected.").setStyleAttribute('marginBottom', '10px');
  }
  var panel = app.createVerticalPanel();
  var gridPanel = app.createVerticalPanel().setId("gridPanel").setVisible(false);
  var grid = app.createGrid(4,2).setId('trackingGrid').setStyleAttribute('background', 'whiteSmoke').setStyleAttribute('marginTop', '10px');
  var checkHandler = app.createServerHandler('formLimiter_refreshTrackingGrid').addCallbackElement(panel);
  var checkBox = app.createCheckBox('Participate in institutional usage tracking.  (Only choose this option if you know your institution\'s Google Analytics tracker Id.)').setName('trackerSetting').addValueChangeHandler(checkHandler);  
  var checkBox2 = app.createCheckBox('Let New Visions for Public Schools, 501(c)3 know you\'re an educational user.').setName('eduSetting');  
  if ((institutionalTrackingString == "not participating")||(institutionalTrackingString=='')) {
    checkBox.setValue(false);
  } 
  if (eduSetting=="true") {
    checkBox2.setValue(true);
  }
  var institutionNameFields = [];
  var trackerIdFields = [];
  var institutionNameLabel = app.createLabel('Institution Name');
  var trackerIdLabel = app.createLabel('Google Analytics Tracker Id (UA-########-#)');
  grid.setWidget(0, 0, institutionNameLabel);
  grid.setWidget(0, 1, trackerIdLabel);
  if ((institutionalTrackingString)&&((institutionalTrackingString!='not participating')||(institutionalTrackingString==''))) {
    checkBox.setValue(true);
    gridPanel.setVisible(true);
    var institutionalTrackingObject = Utilities.jsonParse(institutionalTrackingString);
  } else {
    var institutionalTrackingObject = new Object();
  }
  for (var i=1; i<4; i++) {
    institutionNameFields[i] = app.createTextBox().setName('institution-'+i);
    trackerIdFields[i] = app.createTextBox().setName('trackerId-'+i);
    if (institutionalTrackingObject) {
      if (institutionalTrackingObject['institution-'+i]) {
        institutionNameFields[i].setValue(institutionalTrackingObject['institution-'+i]['name']);
        if (institutionalTrackingObject['institution-'+i]['trackerId']) {
          trackerIdFields[i].setValue(institutionalTrackingObject['institution-'+i]['trackerId']);
        }
      }
    }
    grid.setWidget(i, 0, institutionNameFields[i]);
    grid.setWidget(i, 1, trackerIdFields[i]);
  } 
  var help = app.createLabel('Enter up to three institutions, with Google Analytics tracker Id\'s.').setStyleAttribute('marginBottom','5px').setStyleAttribute('marginTop','10px');
  gridPanel.add(help);
  gridPanel.add(grid); 
  panel.add(helptext);
  panel.add(checkBox2);
  panel.add(checkBox);
  panel.add(gridPanel);
  var button = app.createButton("Save settings");
  var saveHandler = app.createServerHandler('formLimiter_saveInstitutionalTrackingInfo').addCallbackElement(panel);
  button.addClickHandler(saveHandler);
  panel.add(button);
  app.add(panel);
  ss.show(app);
  return app;
}

function formLimiter_refreshTrackingGrid(e) {
  var app = UiApp.getActiveApplication();
  var gridPanel = app.getElementById("gridPanel");
  var grid = app.getElementById("trackingGrid");
  var setting = e.parameter.trackerSetting;
  if (setting=="true") {
    gridPanel.setVisible(true);
  } else {
    gridPanel.setVisible(false);
  }
  return app;
}

function formLimiter_saveInstitutionalTrackingInfo(e) {
  var app = UiApp.getActiveApplication();
  var eduSetting = e.parameter.eduSetting;
  var oldEduSetting = UserProperties.getProperty('eduSetting')
  if (eduSetting == "true") {
    UserProperties.setProperty('eduSetting', 'true');
  }
  if ((oldEduSetting)&&(eduSetting=="false")) {
    UserProperties.setProperty('eduSetting', 'false');
  }
  var trackerSetting = e.parameter.trackerSetting;
  if (trackerSetting == "false") {
    UserProperties.setProperty('institutionalTrackingString', 'not participating');
    app.close();
    return app;
  } else {
    var institutionalTrackingObject = new Object;
    for (var i=1; i<4; i++) {
      var checkVal = e.parameter['institution-'+i];
      if (checkVal!='') {
        institutionalTrackingObject['institution-'+i] = new Object();
        institutionalTrackingObject['institution-'+i]['name'] = e.parameter['institution-'+i];
        institutionalTrackingObject['institution-'+i]['trackerId'] = e.parameter['trackerId-'+i];
        if (!(e.parameter['trackerId-'+i])) {
          Browser.msgBox("You entered an institution without a Google Analytics Tracker Id");
          formLimiter_institutionalTrackingUi()
        }
      }
    }
    var institutionalTrackingString = Utilities.jsonStringify(institutionalTrackingObject);
    UserProperties.setProperty('institutionalTrackingString', institutionalTrackingString);
    app.close();
    return app;
  }
}


// This code was borrowed and modified from the Flubaroo Script author Dave Abouav
// It anonymously tracks script usage to Google Analytics, allowing our non-profit to report our impact to funders
// For original source see http://www.edcode.org

function formLimiter_createInstitutionalTrackingUrls(institutionTrackingObject, encoded_page_name, encoded_script_name) {
  for (var key in institutionTrackingObject) {
    var utmcc = formLimiter_createGACookie();
    if (utmcc == null)
    {
      return null;
    }
    var encoded_page_name = encoded_script_name+"/"+encoded_page_name;
    var trackingId = institutionTrackingObject[key].trackerId;
    var ga_url1 = "http://www.google-analytics.com/__utm.gif?utmwv=5.2.2&utmhn=www.formLimiter-analytics.com&utmcs=-&utmul=en-us&utmje=1&utmdt&utmr=0=";
    var ga_url2 = "&utmac="+trackingId+"&utmcc=" + utmcc + "&utmu=DI~";
    var ga_url_full = ga_url1 + encoded_page_name + "&utmp=" + encoded_page_name + ga_url2;
    
    if (ga_url_full)
    {
      try {
        var response = UrlFetchApp.fetch(ga_url_full);
      } catch(err) {
      }
    }
  }
}



function formLimiter_createGATrackingUrl(encoded_page_name)
{
  var utmcc = formLimiter_createGACookie();
  var eduSetting = UserProperties.getProperty('eduSetting');
  if (eduSetting=="true") {
    encoded_page_name = "edu/" + encoded_page_name;
  }
  if (utmcc == null)
  {
    return null;
  }
  
  var ga_url1 = "http://www.google-analytics.com/__utm.gif?utmwv=5.2.2&utmhn=www.formLimiter-analytics.com&utmcs=-&utmul=en-us&utmje=1&utmdt&utmr=0=";
  var ga_url2 = "&utmac=UA-40677834-1&utmcc=" + utmcc + "&utmu=DI~";
  var ga_url_full = ga_url1 + encoded_page_name + "&utmp=" + encoded_page_name + ga_url2;
  
  return ga_url_full;
}


function formLimiter_createSystemTrackingUrls(institutionTrackingObject, encoded_system_name, encoded_execution_name) {
  for (var key in institutionTrackingObject) {
    var utmcc = formLimiter_createGACookie();
    if (utmcc == null)
    {
      return null;
    }
    var trackingId = institutionTrackingObject[key].trackerId;
    var encoded_page_name = encoded_system_name+"/"+encoded_execution_name;
    var ga_url1 = "http://www.google-analytics.com/__utm.gif?utmwv=5.2.2&utmhn=www.cloudlab-systems-analytics.com&utmcs=-&utmul=en-us&utmje=1&utmdt&utmr=0=";
    var ga_url2 = "&utmac="+trackingId+"&utmcc=" + utmcc + "&utmu=DI~";
    var ga_url_full1 = ga_url1 + encoded_page_name + "&utmp=" + encoded_page_name + ga_url2;
    if (ga_url_full1)
    {
      try {
        var response = UrlFetchApp.fetch(ga_url_full1);
      } catch(err) {
      }
    } 
  }
  
  var encoded_page_name = encoded_system_name+"/"+encoded_execution_name;
  var ga_url1 = "http://www.google-analytics.com/__utm.gif?utmwv=5.2.2&utmhn=www.cloudlab-systems-analytics.com&utmcs=-&utmul=en-us&utmje=1&utmdt&utmr=0=";
  var ga_url2 = "&utmac=UA-34521561-1&utmcc=" + utmcc + "&utmu=DI~";
  var ga_url_full2 = ga_url1 + encoded_page_name + "&utmp=" + encoded_page_name + ga_url2;
  if (ga_url_full2)
  {
    try {
      var response = UrlFetchApp.fetch(ga_url_full2);
    } catch(err) {
    }
  }
  
}



function formLimiter_createGACookie()
{
  var a = "";
  var b = "100000000";
  var c = "200000000";
  var d = "";
  
  var dt = new Date();
  var ms = dt.getTime();
  var ms_str = ms.toString();
  
  var formLimiter_uid = UserProperties.getProperty("formLimiter_uid");
  if ((formLimiter_uid == null) || (formLimiter_uid == ""))
  {
    // shouldn't happen unless user explicitly removed flubaroo_uid from properties.
    return null;
  }
  
  a = formLimiter_uid.substring(0,9);
  d = formLimiter_uid.substring(9);
  
  utmcc = "__utma%3D451096098." + a + "." + b + "." + c + "." + d 
  + ".1%3B%2B__utmz%3D451096098." + d + ".1.1.utmcsr%3D(direct)%7Cutmccn%3D(direct)%7Cutmcmd%3D(none)%3B";
  
  return utmcc;
}



function formLimiter_logTimeLimitSet()
{
  var ga_url = formLimiter_createGATrackingUrl("Time%20Limit%20Set");
  if (ga_url)
  {
    try {
      var response = UrlFetchApp.fetch(ga_url);
    } catch(err) {
    }
  }
  var institutionalTrackingObject = formLimiter_getInstitutionalTrackerObject();
  if (institutionalTrackingObject) {
    formLimiter_createInstitutionalTrackingUrls(institutionalTrackingObject,"Time%20Limit%20Set", "formLimiter");
    var systemName = ScriptProperties.getProperty('systemName');
    if (systemName) {
      var encoded_system_name = urlencode(systemName);
      formLimiter_createSystemTrackingUrls(institutionalTrackingObject, encoded_system_name, "Time%20Limit%20Set")
    }
  }
}


function formLimiter_logNumLimitSet()
{
  var ga_url = formLimiter_createGATrackingUrl("Max%20Response%20Limit%20Set");
  if (ga_url)
  {
    try {
      var response = UrlFetchApp.fetch(ga_url);
    } catch(err) {
    }
  }
  var institutionalTrackingObject = formLimiter_getInstitutionalTrackerObject();
  if (institutionalTrackingObject) {
    formLimiter_createInstitutionalTrackingUrls(institutionalTrackingObject,"Max%20Response%20Limit%20Set", "formLimiter");
    var systemName = ScriptProperties.getProperty('systemName');
    if (systemName) {
      var encoded_system_name = urlencode(systemName);
      formLimiter_createSystemTrackingUrls(institutionalTrackingObject, encoded_system_name, "Max%20Response%20Limit%20Set")
    }
  }
}


function formLimiter_logSSValueLimitSet()
{
  var ga_url = formLimiter_createGATrackingUrl("Cell%20Value%20Limit%20Set");
  if (ga_url)
  {
    try {
      var response = UrlFetchApp.fetch(ga_url);
    } catch(err) {
    }
  }
  var institutionalTrackingObject = formLimiter_getInstitutionalTrackerObject();
  if (institutionalTrackingObject) {
    formLimiter_createInstitutionalTrackingUrls(institutionalTrackingObject,"Cell%20Value%20Limit%20Set", "formLimiter");
    var systemName = ScriptProperties.getProperty('systemName');
    if (systemName) {
      var encoded_system_name = urlencode(systemName);
      formLimiter_createSystemTrackingUrls(institutionalTrackingObject, encoded_system_name, "Cell%20Value%20Limit%20Set")
    }
  }
}

function formLimiter_logFormClosed()
{
  var ga_url = formLimiter_createGATrackingUrl("Form%20Closed");
  if (ga_url)
  {
    try {
      var response = UrlFetchApp.fetch(ga_url);
    } catch(err) {
    }
  }
  var institutionalTrackingObject = formLimiter_getInstitutionalTrackerObject();
  if (institutionalTrackingObject) {
    formLimiter_createInstitutionalTrackingUrls(institutionalTrackingObject,"Form%20Closed", "formLimiter");
    var systemName = ScriptProperties.getProperty('systemName');
    if (systemName) {
      var encoded_system_name = urlencode(systemName);
      formLimiter_createSystemTrackingUrls(institutionalTrackingObject, encoded_system_name, "Form%20Closed")
    }
  }
}



function formLimiter_getInstitutionalTrackerObject() {
  var institutionalTrackingString = UserProperties.getProperty('institutionalTrackingString');
  if ((institutionalTrackingString)&&(institutionalTrackingString != "not participating")) {
    var institutionTrackingObject = Utilities.jsonParse(institutionalTrackingString);
    return institutionTrackingObject;
  }
  if (!(institutionalTrackingString)||(institutionalTrackingString='')) {
    formLimiter_institutionalTrackingUi();
    return;
  }
}


function formLimiter_logRepeatInstall()
{
  var ga_url = formLimiter_createGATrackingUrl("Repeat%20Install");
  if (ga_url)
  {
    try {
      var response = UrlFetchApp.fetch(ga_url);
    } catch(err) {
    }
  }
  var institutionalTrackingObject = formLimiter_getInstitutionalTrackerObject();
  if (institutionalTrackingObject) {
    formLimiter_createInstitutionalTrackingUrls(institutionalTrackingObject,"Repeat%20Install", "formLimiter");
    var systemName = ScriptProperties.getProperty('systemName');
    if (systemName) {
      var encoded_system_name = urlencode(systemName);
      formLimiter_createSystemTrackingUrls(institutionalTrackingObject, encoded_system_name, "Repeat%20Install")
    }
  }
}

function formLimiter_logFirstInstall()
{
  var ga_url = formLimiter_createGATrackingUrl("First%20Install");
  if (ga_url)
  {
    try {
      var response = UrlFetchApp.fetch(ga_url);
    } catch(err) {
    }
  }
  var institutionalTrackingObject = formLimiter_getInstitutionalTrackerObject();
  if (institutionalTrackingObject) {
    formLimiter_createInstitutionalTrackingUrls(institutionalTrackingObject,"First%20Install", "formLimiter");
    var systemName = ScriptProperties.getProperty('systemName');
    if (systemName) {
      var encoded_system_name = urlencode(systemName);
      formLimiter_createSystemTrackingUrls(institutionalTrackingObject, encoded_system_name, "First%20Install")
    }
  }
}


function setformLimiterUid()
{ 
  var formLimiter_uid = UserProperties.getProperty("formLimiter_uid");
  if (formLimiter_uid == null || formLimiter_uid == "")
  {
    // user has never installed formLimiter before (in any spreadsheet)
    var dt = new Date();
    var ms = dt.getTime();
    var ms_str = ms.toString();
    
    UserProperties.setProperty("formLimiter_uid", ms_str);
    formLimiter_logFirstInstall();
  }
}


function setformLimiterSid()
{ 
  var formLimiter_sid = ScriptProperties.getProperty("formLimiter_sid");
  if (formLimiter_sid == null || formLimiter_sid == "")
  {
    // user has never installed formLimiter before (in any spreadsheet)
    var dt = new Date();
    var ms = dt.getTime();
    var ms_str = ms.toString();
    ScriptProperties.setProperty("formLimiter_sid", ms_str);
    var formLimiter_uid = UserProperties.getProperty("formLimiter_uid");
    if (formLimiter_uid != null || formLimiter_uid != "") {
      formLimiter_logRepeatInstall();
    }
  }
}
