import { getBasePath } from "@clearblade/ia-mfe-core";
import { AppProviders } from "@clearblade/ia-mfe-react";
import { Subscribe } from "@react-rxjs/core";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import singleSpaReact from "single-spa-react";
import GenericExternal from "./GenericExternal";
import { ComponentsProps } from "../types";


function generic_externalRoot(props: ComponentsProps) {
  return (
    <AppProviders>
      <BrowserRouter basename={getBasePath()}>
        <Subscribe>
          <GenericExternal {...props} />
        </Subscribe>
      </BrowserRouter>
    </AppProviders>
  );
}

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: generic_externalRoot,
  errorBoundary(err, info, props) {
    return {err, info, props, type: "error", key: "generic_external"};
  },
});

export const { bootstrap, mount, unmount } = lifecycles;
