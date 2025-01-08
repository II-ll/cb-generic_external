/**
 * @typedef {{prefix: string, entity_id: string, component_id: string, mfe_settings: Record<string, unknown>}} InstallParams
 * @param {CbServer.BasicReq & {params: InstallParams}} req
 * @param {CbServer.Resp} resp
 */

function cb_install(req, resp) {
  try {
    const item = req.params;
    if (!item.mfe_settings.model_meta.modelIngestionTopic) {
      item.mfe_settings.model_meta.modelIngestionTopic = item.entity_id + '/ingest';
    }
    if (
      item.mfe_settings.model_meta.targetAttributes &&
      item.mfe_settings.model_meta.targetAttributes.length > 0 &&
      !item.mfe_settings.model_meta.inferenceTopic
    ) {
      item.mfe_settings.model_meta.inferenceTopic = item.entity_id + '/infer';
    }
    const payload = {
      operation: 'create',
      componentId: item.component_id,
      entityId: item.entity_id,
      settings: { mfe_data: item.mfe_settings } || { mfe_data: {} },
    };
    var client = new MQTT.Client();
    client.publish('_cb/components/generic_external/updates', JSON.stringify(payload), 2); //qos 2 to ensure delivery
    resp.success('Success');
  } catch (e) {
    resp.error(e);
  }
}
