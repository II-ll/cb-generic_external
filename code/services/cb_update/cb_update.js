/**
 * @param {CbServer.BasicReq & {params: InstallParams}} req
 * @param {CbServer.Resp} resp
 */

function cb_update(req, resp) {
  try {
    const item = req.params;
    const payload = {
      operation: "update",
      componentId: item.component_id,
      entityId: item.entity_id,
      settings: { mfe_data: item.mfe_settings } || { mfe_data: {} },
    };
    var client = new MQTT.Client();
    client.publish("_cb/components/generic_external/updates", JSON.stringify(payload), 2); //qos 2 to ensure delivery
    resp.success("Success");
  } catch (e) {
    resp.error(e);
  }
}
