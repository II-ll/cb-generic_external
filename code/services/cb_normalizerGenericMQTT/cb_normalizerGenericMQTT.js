/**
 * @typedef {Object} ComponentSettings
 * @property {Object} mfe_data
 * @property {Array<{attribute_name: string}>} mfe_data.input_attributes
 * @property {string} mfe_data.raw_data_incoming_topic
 * @property {string} mfe_data.model_ingestion_topic
 * @property {string} mfe_data.inference_topic
 */

/**
 * @typedef {Object} ComponentData
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
    name: "cb_normalizerGenericMQTT",
    logSetting: LogLevels.INFO,
  });

  /** @type {Object.<string, ComponentData>} */
  var componentDataMap = {};

  var COMPONENTS_UPDATE_TOPIC = "_cb/components/generic_external/updates";

  /**
   * @param {Array<ComponentData>} componentsData
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
        topicsToSubscribe.push(
          component.settings.mfe_data.raw_data_incoming_topic
        );
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
          logger.publishLogWithMQTTLib(
            client,
            LogLevels.DEBUG,
            "Subscribed to topic: " + topic
          );
        })
        .catch(function (error) {
          console.error("Failed to subscribe to topic:", topic, error);
        });
    });
  }

  /**
   * @param {string} topic
   * @param {MQTT.Message} message
   */
  function processMessage(topic, message) {
    try {
      var payload = JSON.parse(message.payload);

      if (topic === COMPONENTS_UPDATE_TOPIC) {
        handleComponentUpdate(payload);
        return;
      }
      if (payload.type) {
        if (
          componentDataMap[payload.type].settings.mfe_data
            .raw_data_incoming_topic === topic ||
          topic === Topics.DefaultNormalizer()
        ) {
          payload.forEach(handleAssetData);
        } else if (
          componentDataMap[payload.type].settings.mfe_data.inference_topic ===
          topic
        ) {
          handleInferenceData(topic, payload);
        } else {
          // component not enabled for asset type
          return;
        }
      } else {
        console.error("Unknown message format:", payload);
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  }

  /**
   * @param {Object} assetData
   */
  function handleAssetData(assetData) {
    var component = componentDataMap[assetData.type];
    if (!component) return;

    var input_attributes = component.settings.mfe_data.input_attributes;
    var model_ingestion_topic =
      component.settings.mfe_data.model_ingestion_topic;
    var commonAttributes = input_attributes
      .map(function (attr) {
        return attr.attribute_name;
      })
      .filter(function (attr) {
        return assetData.custom_data.hasOwnProperty(attr);
      });

    if (commonAttributes.length > 0) {
      var condensedPayload = {
        timestamp: assetData.last_updated,
        asset_type: assetData.type,
        asset: assetData.id,
        input_attributes: {},
      };

      commonAttributes.forEach(function (attr) {
        condensedPayload.input_attributes[attr] = assetData.custom_data[attr];
      });

      client
        .publish(model_ingestion_topic, JSON.stringify(condensedPayload))
        .catch(function (error) {
          console.error("Failed to publish condensed payload:", error);
        });
    }
  }

  /**
   * @param {string} topic
   * @param {Object} inferenceData
   */
  function handleInferenceData(topic, inferenceData) {
    client
      .publish(Topics.AssetLocStatusHistory(), JSON.stringify(inferenceData))
      .catch(function (error) {
        console.error("Failed to publish inference data:", error);
      });
  }

  /**
   * @param {Object} updateData
   */
  function handleComponentUpdate(updateData) {
    var operation = updateData.operation;
    var componentId = updateData.componentId;
    var entityId = updateData.entityId;
    var settings = updateData.settings;

    if (componentId !== "generic_external") {
      return;
    }

    switch (operation) {
      case "create":
      case "update":
        componentDataMap[entityId] = { settings: settings };
        break;
      case "delete":
        delete componentDataMap[entityId];
        break;
    }

    updateSubscriptions();
  }

  // Initialize the service
  function initialize() {
    ClearBladeAsync.Database()
      .query(
        "SELECT entity_id, settings FROM " +
          CollectionName.COMPONENTS +
          " WHERE id = 'generic_external'"
      )
      .then(function (results) {
        var componentsData = results.map(function (row) {
          return {
            entityId: row.entity_id,
            settings: JSON.parse(row.settings),
          };
        });
        updateComponentData(componentsData);
      })
      .catch(function (error) {
        console.error("Failed to query COMPONENTS collection:", error);
        resp.error("Failed to initialize the service");
      });
  }

  initialize();

  logger.publishLogWithMQTTLib(
    client,
    LogLevels.INFO,
    "cb_normalizerGenericMQTT service started"
  );
}
