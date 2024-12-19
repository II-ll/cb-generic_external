/**
 * @typedef {{prefix: string, entity_id: string, component_id: string, mfe_settings: Record<string, unknown>}} InstallParams
 * @param {CbServer.BasicReq & {params: InstallParams}} req
 * @param {CbServer.Resp} resp
 */

function cb_install(req, resp) {
  try {
    const item = req.params;
    const payload = {
      operation: "create",
      componentId: item.component_id,
      entityId: item.entity_id,
      settings: { mfe_data: item.mfe_settings } || { mfe_data: {} },
    };
    var client = new MQTT.Client();
    client.publish("_cb/components/generic_external/updates", JSON.stringify(payload), 2); //TODO: make sure this doesn't cause problems with test
    resp.success("Success");
  } catch (e) {
    resp.error(e);
  }
}
