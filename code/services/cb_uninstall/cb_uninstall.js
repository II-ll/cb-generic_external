/**
 * @typedef {{prefix: string, entity_id: string, component_id: string, mfe_settings: Record<string, unknown>}} InstallParams
 * @param {CbServer.BasicReq & {params: InstallParams}} req
 * @param {CbServer.Resp} resp
 */

function cb_uninstall(req, resp) {
  try {
    const item = req.params;
    const payload = {
      operation: "delete",
      componentId: "generic_external",
      entityId: item.entity_id,
    };
    var client = new MQTT.Client();
    client.publish("_cb/components/generic_external/updates", JSON.stringify(payload), 2); //qos 2 to ensure delivery
    resp.success("Success");
  } catch (e) {
    resp.error(e);
  }
}
