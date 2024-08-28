import React from "react";
import { GridBody, GridBodyProps } from "./grid-body";
import { ViewMode } from "../../types/public-types";

export type GridProps = GridBodyProps & {
  holidays?:Date[]
  nonWorkingDays?:number[]
  sete: (data: any) => void;
  setEndDrag: (data: any) => void;
  viewMode:ViewMode
  projectStartDate:Date
  projectEndDate:Date
};
export const Grid: React.FC<GridProps> = (props) => {
  
  return (
    <g
      className="grid"
      onMouseMove={(e) => props.sete(e)}
      onMouseUp={(e) => props.setEndDrag(e)}
    >
      <GridBody {...props} />
    </g>
  );
};
