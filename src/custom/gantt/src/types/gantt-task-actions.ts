import { BarTask } from "./bar-task";

export type BarMoveAction = "progress" | "end" | "start" | "move";
export type GanttContentMoveAction =
  | "mouseenter"
  | "mouseleave"
  | "delete"
  | "dblclick"
  | "click"
  | "select"
  | ""
  | BarMoveAction
  | "contextmenu"
  | "contextmenuclose"
  | "dragging"
  | "hoverOnDependance";

export type GanttEvent = {
  changedTask?: BarTask;
  originalSelectedTask?: BarTask;
  action: GanttContentMoveAction;
};
