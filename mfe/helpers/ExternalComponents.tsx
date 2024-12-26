import React, { useEffect } from "react";
import {
  Divider,
  FormControl,
  FormLabel,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { Field, Form, Formik, useFormikContext } from "formik";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import { ComponentsProps } from "../types";

interface AttributeOption {
  uuid: string;
  attribute_label: string;
  attribute_name: string;
}

const RawDataIncomingTopicField = () => {
  const { values, handleChange } = useFormikContext<any>();

  return (
    <FormControl fullWidth margin="normal">
      <div style={{ display: "flex", alignItems: "center" }}>
        <FormLabel>
          <Typography variant="body2">
            <span style={{ fontWeight: "bold" }}>Raw Data Incoming Topic</span>
          </Typography>
        </FormLabel>
        <Tooltip title="This is an optional field. The topic that the normalizer for this component will read data on to be filtered and preprocessed. If blank, it will use data from the default normalizer.">
          <IconButton
            size="small"
            aria-label="help"
            style={{ marginLeft: "4px" }}
          >
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
      <TextField
        size="small"
        name="rawDataIncomingTopic"
        value={values.rawDataIncomingTopic}
        onChange={handleChange}
        variant="outlined"
        fullWidth
      />
      {values.rawDataIncomingTopic !== "" && (
        <div
          style={{ display: "flex", alignItems: "center", marginTop: "4px" }}
        >
          <Typography
            variant="caption"
            color="error"
            style={{ marginRight: "4px" }}
          >
            Warning: Custom Raw Data Topic Set.
          </Typography>
          <Tooltip title="The Generic External component by default filters data in from the default normalizer topic. If you use a custom Raw Data Topic, you will need to build a custom normalizer for your implementation.">
            <IconButton size="small" aria-label="help">
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      )}
    </FormControl>
  );
};

export default function ExternalComponents(props: ComponentsProps) {
  const { schema, component, setValues } = props;

  const attributeOptions: AttributeOption[] = schema.map((item: any) => ({
    uuid: item.uuid,
    attribute_label: item.attribute_label,
    attribute_name: item.attribute_name,
  }));

  return (
    <Formik
      initialValues={{
        schema: (component.settings.inputAttributes as AttributeOption[]) || [],
        settings: {
           targetAttributes:
            (component.settings.targetAttributes as AttributeOption[]) || [],
          rawDataIncomingTopic:
            (component.settings.rawDataIncomingTopic as string) || "",
          modelIngestionTopic: component.settings.modelIngestionTopic as string,
          inferenceTopic: component.settings.inferenceTopic as string,
        },
      }}
      onSubmit={() => {}}
    >
      {({ values, setFieldValue }) => {
        useEffect(() => {
          setValues((v) => ({ ...v, settings: values }));
        }, [values]);

        return (
          <Form>
            <Grid container spacing={2}>
              {/* Input Attributes */}
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <FormLabel>
                      <Typography variant="body2">
                        <span style={{ fontWeight: "bold" }}>
                          Input Attributes*
                        </span>
                      </Typography>
                    </FormLabel>
                    <Tooltip title="This is a required field. Select the input attributes for the component.">
                      <IconButton
                        size="small"
                        aria-label="help"
                        style={{ marginLeft: "4px" }}
                      >
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </div>
                  <Autocomplete
                    multiple
                    size="small"
                    limitTags={6}
                    id="input-attributes" 
                    value={values.schema}
                    options={attributeOptions}
                    onChange={(event, newValue) =>
                      setFieldValue("inputAttributes", newValue)
                    }
                    getOptionSelected={(option, value) =>
                      option.uuid === value.uuid
                    }
                    getOptionLabel={(option) =>
                      option.attribute_label || option.attribute_name
                    }
                    renderInput={(params) => (
                      <TextField {...params} variant="outlined" />
                    )}
                    disableCloseOnSelect
                  />
                </FormControl>
              </Grid>

              {/* Target Attributes */}
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <FormLabel>
                      <Typography variant="body2">
                        <span style={{ fontWeight: "bold" }}>
                          Target Attributes
                        </span>
                      </Typography>
                    </FormLabel>
                    <Tooltip title="This is an optional field. Select the target attributes for the component.">
                      <IconButton
                        size="small"
                        aria-label="help"
                        style={{ marginLeft: "4px" }}
                      >
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </div>
                  <Autocomplete
                    multiple
                    size="small"
                    limitTags={6}
                    id="target-attributes"
                    value={values.settings.targetAttributes}
                    options={attributeOptions}
                    onChange={(event, newValue) =>
                      setFieldValue("targetAttributes", newValue)
                    }
                    getOptionSelected={(option, value) =>
                      option.uuid === value.uuid
                    }
                    getOptionLabel={(option) =>
                      option.attribute_label || option.attribute_name
                    }
                    renderInput={(params) => (
                      <TextField {...params} variant="outlined" />
                    )}
                    disableCloseOnSelect
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              {/* Raw Data Incoming Topic */}
              <Grid item xs={12}>
                <RawDataIncomingTopicField />
              </Grid>

              {/* Model Ingestion Topic */}
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <FormLabel>
                      <Typography variant="body2">
                        <span style={{ fontWeight: "bold" }}>
                          Model Ingestion Topic*
                        </span>
                      </Typography>
                    </FormLabel>
                    <Tooltip title="This is a required field. The topic we will publish to for you to subscribe to, to collect data for training and inference.">
                      <IconButton
                        size="small"
                        aria-label="help"
                        style={{ marginLeft: "4px" }}
                      >
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </div>
                  <Field
                    size="small"
                    name="modelIngestionTopic"
                    component={TextField}
                    variant="outlined"
                    fullWidth
                    required
                  />
                </FormControl>
              </Grid>

              {/* Inference Topic */}
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <FormLabel>
                      <Typography variant="body2">
                        <span style={{ fontWeight: "bold" }}>
                          Inference Topic
                          {values.settings.targetAttributes.length > 0
                            ? "*"
                            : ""}
                        </span>
                      </Typography>
                    </FormLabel>
                    <Tooltip title="This is required if target attributes are selected. The topic you can publish inference results to populate your target attribute(s).">
                      <IconButton
                        size="small"
                        aria-label="help"
                        style={{ marginLeft: "4px" }}
                      >
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </div>
                  <Field
                    size="small"
                    name="inferenceTopic"
                    component={TextField}
                    variant="outlined"
                    fullWidth
                    required={values.settings.targetAttributes.length > 0}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </Form>
        );
      }}
    </Formik>
  );
}
