/**
 * @param {CbServer.BasicReq} _
 * @param {CbServer.Resp} resp
 */

function cb_teardown(_, resp) {
  resp.success('Success');
}