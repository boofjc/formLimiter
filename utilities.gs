// This code was borrowed and modified from the Flubaroo Script author Dave Abouav
// It anonymously tracks script usage to Google Analytics, allowing our non-profit to report our impact to funders
// For original source see http://www.edcode.org

function formLimiter_logTimeLimitSet()
{
  var systemName = ScriptProperties.getProperty("systemName")
  NVSL.log("Time%20Limit%20Set", scriptName, scriptTrackingId, systemName)
}


function formLimiter_logNumLimitSet()
{
  var systemName = ScriptProperties.getProperty("systemName")
  NVSL.log("Max%20Response%20Limit%20Set", scriptName, scriptTrackingId, systemName)
}


function formLimiter_logSSValueLimitSet()
{
  var systemName = ScriptProperties.getProperty("systemName")
  NVSL.log("Cell%20Value%20Limit%20Set", scriptName, scriptTrackingId, systemName)
}

function formLimiter_logFormClosed()
{
  var systemName = ScriptProperties.getProperty("systemName")
  NVSL.log("Form%20Closed", scriptName, scriptTrackingId, systemName)
}

function formLimiter_logRepeatInstall()
{
  var systemName = ScriptProperties.getProperty("systemName")
  NVSL.log("Repeat%20Install", scriptName, scriptTrackingId, systemName)
}

function formLimiter_logFirstInstall()
{
  var systemName = ScriptProperties.getProperty("systemName")
  NVSL.log("First%20Install", scriptName, scriptTrackingId, systemName)
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
    }else{
      formLimiter_logFirstInstall();
    }
  }
}
