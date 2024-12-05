import React from 'react';
import { ComponentsProps } from "../types";
import ExternalComponents from "../helpers/ExternalComponents";

export default function GenericExternal(props: ComponentsProps) {
  return <ExternalComponents {...props} />;
}