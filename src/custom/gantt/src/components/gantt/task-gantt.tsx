import React, { useRef, useEffect, useState } from "react";
import { GridProps, Grid } from "../grid/grid";
import { CalendarProps, Calendar } from "../calendar/calendar";
import { TaskGanttContentProps, TaskGanttContent } from "./task-gantt-content";
import styles from "./gantt.module.css";
import { Task, ViewMode } from "../../types/public-types";

export type TaskGanttProps = {
  gridProps: GridProps;
  calendarProps: CalendarProps;
  barProps: TaskGanttContentProps;
  ganttHeight: number;
  scrollY: number;
  scrollX: number;
  viewMode: ViewMode;
  depandanyData: (data: any) => void;
  onDepandancyDragEnd: (data: any, data2: any) => void;
  selectedTasks: Task | undefined;
  onselect: (data: number) => void;
};
export const TaskGantt: React.FC<TaskGanttProps> = ({
  gridProps,
  calendarProps,
  barProps,
  ganttHeight,
  scrollY,
  scrollX,
  viewMode,
  onDepandancyDragEnd,
  depandanyData,
  selectedTasks,
  onselect,
}) => {
  const ganttSVGRef = useRef<SVGSVGElement>(null);
  const horizontalContainerRef = useRef<HTMLDivElement>(null);
  const verticalGanttContainerRef = useRef<HTMLDivElement>(null);
  const [e, sete] = useState<any>();
  const [endDrag, setEndDrag] = useState<any>();
  const onselectionchange = () => {
    onselect(verticalGanttContainerRef.current?.scrollLeft ?? 0);
  };
  const newBarProps = {
    ...barProps,
    svg: ganttSVGRef,
    e: e,
    endDrag: endDrag,
    onDepandancyDragEnd: onDepandancyDragEnd,
    depandanyData: depandanyData,
    selectedTasks: selectedTasks,
    onselectionchange: onselectionchange,
  };

  useEffect(() => {
    if (horizontalContainerRef.current) {
      horizontalContainerRef.current.scrollTop = scrollY;
    }
  }, [scrollY]);

  useEffect(() => {
    if (verticalGanttContainerRef.current) {
      verticalGanttContainerRef.current.scrollLeft = scrollX;
    }
  }, [scrollX]);

  return (
    <div
      className={styles.ganttVerticalContainer}
      ref={verticalGanttContainerRef}
      dir="ltr"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={gridProps.svgWidth}
        height={calendarProps.headerHeight}
        fontFamily={barProps.fontFamily}
      >
        <Calendar {...calendarProps} />
      </svg>
      <div
        ref={horizontalContainerRef}
        className={styles.horizontalContainer}
        style={
          ganttHeight
            ? { height: ganttHeight, width: gridProps.svgWidth }
            : { width: gridProps.svgWidth }
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={gridProps.svgWidth}
          height={barProps.rowHeight * barProps.tasks.length}
          fontFamily={barProps.fontFamily}
          ref={ganttSVGRef}
        >
          <Grid
            {...gridProps}
            viewMode={viewMode}
            sete={(e) => sete(e)}
            setEndDrag={(e) => setEndDrag(e)}
          />
          <TaskGanttContent {...newBarProps} />
        </svg>
      </div>
    </div>
  );
};
