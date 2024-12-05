import React, { useEffect } from "react";
import {
  CircularProgress,
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
import { Field, Form, Formik } from "formik";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import WarningIcon from "@material-ui/icons/Warning";
import { ComponentsProps } from "../types";

interface AttributeOption {
  uuid: string;
  attribute_label: string;
  attribute_name: string;
}

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
        inputAttributes:
          (component.settings.inputAttributes as AttributeOption[]) || [],
        targetAttributes:
          (component.settings.targetAttributes as AttributeOption[]) || [],
        rawDataIncomingTopic:
          (component.settings.rawDataIncomingTopic as string) || "",
        modelIngestionTopic:
          (component.settings.modelIngestionTopic as string) || "",
        inferenceTopic: (component.settings.inferenceTopic as string) || "",
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
                    value={values.inputAttributes}
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
                    value={values.targetAttributes}
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

              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <FormLabel>
                      <Typography variant="body2">
                        <span style={{ fontWeight: "bold" }}>
                          Raw Data Incoming Topic
                        </span>
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
                    {values.rawDataIncomingTopic !== "" && (
                      <Tooltip title="Warning: It is not recommended to set this unless you are writing a custom normalizer for this usage.">
                        <WarningIcon
                          color="action"
                          style={{ marginLeft: "4px", color: "orange" }}
                        />
                      </Tooltip>
                    )}
                  </div>
                  <Field
                    size="small"
                    name="rawDataIncomingTopic"
                    component={TextField}
                    variant="outlined"
                    fullWidth
                  />
                </FormControl>
              </Grid>

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

              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <FormLabel>
                      <Typography variant="body2">
                        <span style={{ fontWeight: "bold" }}>
                          Inference Topic
                          {values.targetAttributes.length > 0 ? "*" : ""}
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
                    required={values.targetAttributes.length > 0}
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
