/**
 * @typedef {Object} ComponentSettings
 * @property {Object} mfe_data
 * @property {Array<string>} mfe_data.input_attributes
 * @property {Array<string>} mfe_data.target_attributes
 * @property {string} mfe_data.raw_data_incoming_topic
 * @property {string} mfe_data.model_ingestion_topic
 * @property {string} mfe_data.inference_topic
 */

/**
 * @typedef {Object} ComponentData
 * @property {ComponentSettings} settings
 */

/**
 * @typedef {Object} ComponentCollectionRow
 * @property {string} entity_id
 * @property {ComponentSettings} settings
 */

/**
 * @typedef {Object} AssetData
 * @property {string} type
 * @property {string} id
 * @property {string} last_updated
 * @property {string[]=} [groupIds] - Optional
 * @property {string[]=} [tags] - Optional
 * @property {string=} latitude - Optional
 * @property {string=} longitude - Optional
 * @property {CustomData} custom_data
 */

/**
 * @typedef {Object} CondensedPayload
 * @property {string} timestamp
 * @property {string} asset_type
 * @property {string} asset
 * @property {CustomData} input_attributes
 */

/**
 * @typedef {Object.<string, string|number|boolean|object>} CustomData
 */

/**
 * @typedef {Object} UpdateData
 * @property {string} operation
 * @property {string} componentId
 * @property {string} entityId
 * @property {ComponentSettings} settings
 */

/**
 * @param {CbServer.BasicReq} _req
 * @param {CbServer.Resp} resp
 */
function cb_normalizerGenericMQTT(_req, resp) {
  var client = new MQTT.Client();
  var logger = new Logger({
    name: 'cb_normalizerGenericMQTT',
    logSetting: LogLevels.INFO,
  });

  /** @type {Object.<string, ComponentData>} */
  var componentDataMap = {};

  var COMPONENTS_UPDATE_TOPIC = '_cb/components/generic_external/updates';

  /**
   * @param {Array<{entityId: string, settings: ComponentSettings}>} componentsData
   */
  function updateComponentData(componentsData) {
    componentDataMap = {};

    componentsData.forEach(function (component) {
      componentDataMap[component.entityId] = component;
    });

    updateSubscriptions();
  }

  function updateSubscriptions() {
    var topicsToSubscribe = [];
    var hasEmptyTopic = false;

    Object.keys(componentDataMap).forEach(function (key) {
      var component = componentDataMap[key];
      if (component.settings.mfe_data.raw_data_incoming_topic) {
        topicsToSubscribe.push(component.settings.mfe_data.raw_data_incoming_topic);
      } else {
        hasEmptyTopic = true;
      }
      topicsToSubscribe.push(component.settings.mfe_data.inference_topic);
    });

    if (hasEmptyTopic) {
      topicsToSubscribe.push(Topics.DefaultNormalizer());
    }

    topicsToSubscribe.push(COMPONENTS_UPDATE_TOPIC);
    topicsToSubscribe.forEach(function (topic) {
      client
        .subscribe(topic, processMessage)
        .then(function () {
          logger.publishLogWithMQTTLib(client, LogLevels.DEBUG, 'Subscribed to topic: ' + topic);
        })
        .catch(function (error) {
          console.error('Failed to subscribe to topic:', topic, error);
        });
    });
  }

  /**
   * @param {string} topic
   * @param {CbServer.MQTTMessage} message
   */
  function processMessage(topic, message) {
    try {
      var rawPayload = JSON.parse(message.payload);
      if (!Array.isArray(rawPayload)) {
        rawPayload = [rawPayload]
      }


      if (topic === COMPONENTS_UPDATE_TOPIC) {
        handleComponentUpdate(rawPayload[0]);
        return;
      }
      rawPayload.forEach(function (/** @type {{ type: string; id: string; last_updated: string; groupIds: string[]; tags: string[]; latitude: string; longitude: string; custom_data: { [x: string]: string | number | boolean | object; }; }} */ payload) {
        if (payload.type && componentDataMap[payload.type] && componentDataMap[payload.type].settings && componentDataMap[payload.type].settings.mfe_data) {
          if (
            componentDataMap[payload.type].settings.mfe_data.raw_data_incoming_topic === topic ||
            topic === Topics.DefaultNormalizer()
          ) {
            handleAssetData(payload);
          } else if (componentDataMap[payload.type].settings.mfe_data.inference_topic === topic) {
            handleInferenceData(payload);
          } else {
            // component not enabled for asset type
            return;
          }
        } else {
          console.error('Unknown message format:', payload);
        }
      });
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }

  /**
   * @param {AssetData} assetData
   */
  function handleAssetData(assetData) {
    var component = componentDataMap[assetData.type];
    if (!component) return;

    var input_attributes = component.settings.mfe_data.input_attributes;
    var model_ingestion_topic = component.settings.mfe_data.model_ingestion_topic;
    var commonAttributes = input_attributes.filter(function (attr) {
      return assetData.custom_data.hasOwnProperty(attr);
    });

    if (commonAttributes.length > 0) {
      /** @type {CondensedPayload} */
      var condensedPayload = {
        timestamp: assetData.last_updated,
        asset_type: assetData.type,
        asset: assetData.id,
        input_attributes: {},
      };
      commonAttributes.forEach(function (attr) {
        condensedPayload.input_attributes[attr] = assetData.custom_data[attr];
      });

      client.publish(model_ingestion_topic, JSON.stringify(condensedPayload)).catch(function (error) {
        console.error('Failed to publish condensed payload:', error);
      });
    }
  }

  /**
   * @param {AssetData} inferenceData
   *
   */
  function handleInferenceData(inferenceData) {
    var component = componentDataMap[inferenceData.type];
    if (!component) return;
    var target_attributes = component.settings.mfe_data.target_attributes;
    var commonAttributes = target_attributes.filter(function (attr) {
      return inferenceData.custom_data.hasOwnProperty(attr);
    });
    if (commonAttributes.length === 0) return;
    //now make an object of commonAttributes but with key=attribute_name and value=attribute_value
    /** @type {CustomData} */
    var custom_data = {};
    commonAttributes.forEach(function (attr) {
      custom_data[attr] = inferenceData.custom_data[attr];
    });

    client
      .publish(
      Topics.AssetLocStatusHistory(inferenceData.id),
      JSON.stringify({
        id: inferenceData.id,
        type: inferenceData.type,
        group_ids: inferenceData.groupIds || ['default'], //then get current time
        last_updated: new Date().toISOString(),
        tags: inferenceData.tags || [],
        custom_data,
        //latitude: 7,
        //longitude: 7,
      })
      )
      .catch(function (error) {
        console.error('Failed to publish inference data:', error);
      });
  }

  /**
   * @param {UpdateData} updateData
   */
  function handleComponentUpdate(updateData) {
    var operation = updateData.operation;
    var componentId = updateData.componentId;
    var entityId = updateData.entityId;
    var settings = updateData.settings;

    if (componentId !== 'generic_external') {
      return;
    }

    switch (operation) {
      case 'create':
      case 'update':
        componentDataMap[entityId] = { settings };
        break;
      case 'delete':
        delete componentDataMap[entityId];
        break;
    }

    updateSubscriptions();
  }

  // Initialize the service
  function initialize() {
    ClearBladeAsync.Database()
      .query('SELECT entity_id, settings FROM ' + CollectionName.COMPONENTS + " WHERE id = 'generic_external'")
      .then(
      /** 
       * @param {unknown[]} results 
       * @returns {void}
       */
      function (results) {
        /** @type {ComponentCollectionRow[]} */
        var typedResults = /** @type {ComponentCollectionRow[]} */ (results);
        var componentsData = typedResults.map(function (row) {
          return {
            entityId: row.entity_id,
            settings: row.settings,
          };
        });
        updateComponentData(componentsData);
      })
      .catch(function (error) {
        console.error('Failed to query COMPONENTS collection:', error);
        resp.error('Failed to initialize the service');
      });
  }

  initialize();

  logger.publishLogWithMQTTLib(client, LogLevels.INFO, 'cb_normalizerGenericMQTT service started');
}
