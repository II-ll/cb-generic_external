/**
 * @typedef {{prefix: string, entity_id: string, component_id: string, mfe_settings: Record<string, unknown>}} InstallParams
 * @param {CbServer.BasicReq & {params: InstallParams}} req
 * @param {CbServer.Resp} resp
 */

function cb_update(_, resp) {
  try {
    const item = JSON.parse(req.params);
    const payload = {
      operation: "update",
      componentId: item.component_id,
      entityId: item.entity_id,
      settings: JSON.parse(item.mfe_settings || "{}"),
    };
    client.publish(COMPONENTS_UPDATE_TOPIC, JSON.stringify(payload), 2); //qos 2 to ensure delivery
    resp.success("Success");
  } catch (e) {
    resp.error(e);
  }
}
