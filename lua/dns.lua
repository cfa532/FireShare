local ldb = require("lapp");
local log = require("log");
local var = require("var");
local rsps, err = var.GetVar(request.sid, "lservicescriptpath", "Boot", "requestservice")
log.Debug("requestervice ps =%v, err=%v", rsps, err)

log.Debug("bid=%s sid=%s", request.bid, request.sid)
log.Debug("hostid=%s; hostaddr=%s", request.hostid, request.hostaddr)
local err = var.Act(request.sid, "updateip", request.hostid, request.hostaddr)
log.Debug("act err=%v", err)
return true
