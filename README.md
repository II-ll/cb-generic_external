# Generic External Component

## Overview

The Generic External Component is a flexible component that allows users to integrate their custom models with Intelligent Assets. It provides a pre-built microfrontend where the user can select input attributes, target attributes, and manage data flow through configurable MQTT topics, to enable seamless integration of external models with asset data.

By using this component, developers can integrate their models without the need for custom component development involving microfrontends, service management, nor the need for ClearBlade approval.

There are various methods to publish and subscribe to MQTT topics in your ClearBlade system, such as using the [ClearBlade-Python-SDK](https://github.com/ClearBlade/ClearBlade-Python-SDK)

## Generic External Configuration Fields
You can configure the generic external component from the asset type's page for the asset type you wish to integrate with your model.

### Input Attributes

These are feature attributes you want to use as input for your model. These will be automatically filtered from the asset data in real-time and sent to your specified model ingestion topic.

### Target Attributes (Optional)

You can designate target attributes that will be populated by your model's inference results by publishing to your specified inference topic. These can be any custom attributes you define, such as "Anomaly Score" or "Maintenance Required".

### MQTT Topics

#### Raw Data Incoming Topic (Optional)
- The user may set this to allow use of a custom data normalizer instead of the default asset data normalizer. Setting this is not recommended as it will require you to build a custom normalizer.
- Note: If left blank, data will be sourced from the default normalizer.

#### Model Ingestion Topic (Required)
- Specifies the topic where filtered input attribute data will be published.
- Default: If not specified, defaults to `{AssetTypeID}/ingest`.

#### Inference Topic (Required if Target Attributes are present)
- Defines the topic where model inference results should be published.
- Default: If not specified, defaults to `{AssetTypeID}/infer`.
- The expected format to be published to the inference topic is as follows:
```json
{
  "type": "AssetTypeID",
  "id": "AssetID",
  "last_updated": "2025-01-08T19:02:12.397Z",
  "custom_data": {
    "attribute_name": 2007,
    "other_attribute_name": 123
  }
}
```

## Documentation

For more detailed information on developing and using components, please refer to our [Component Development Guide](https://clearblade.atlassian.net/wiki/spaces/IA/pages/3128557589/Developing+Components).