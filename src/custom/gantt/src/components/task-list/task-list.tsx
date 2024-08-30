import React, { useEffect, useRef, useState } from "react";
import { BarTask } from "../../types/bar-task";
import { columnsType, Task } from "../../types/public-types";
import "./index.css"
export type TaskListProps = {
  columns: columnsType[];
  headerHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
  rowHeight: number;
  ganttHeight: number;
  scrollY: number;
  locale: string;
  tasks: Task[];
  taskListRef: React.RefObject<HTMLDivElement>;
  horizontalContainerClass?: string;
  selectedTask: BarTask | undefined;
  setSelectedTask: (task: string) => void;
  onExpanderClick: (task: Task) => void;
  taskSelect: (task: Task) => void;
  taskListWidth:number;
  TaskListHeader: React.FC<{
    headerHeight: number;
    rowWidth: string;
    fontFamily: string;
    fontSize: string;
    columns: columnsType[];
  }>;
  TaskListTable: React.FC<{
    rowHeight: number;
    rowWidth: string;
    fontFamily: string;
    fontSize: string;
    locale: string;
    tasks: Task[];
    selectedTaskId: string;
    columns: columnsType[];
    setSelectedTask: (taskId: string) => void;
    onExpanderClick: (task: Task) => void;
    taskSelect: (task: Task) => void;
  }>;
};

export const TaskList: React.FC<TaskListProps> = ({
  headerHeight,
  fontFamily,
  fontSize,
  rowWidth,
  rowHeight,
  scrollY,
  tasks,
  selectedTask,
  setSelectedTask,
  onExpanderClick,
  taskSelect,
  locale,
  ganttHeight,
  taskListRef,
  horizontalContainerClass,
  TaskListHeader,
  TaskListTable,
  taskListWidth,
  columns,
}) => {

  const horizontalContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (horizontalContainerRef.current) {
      horizontalContainerRef.current.scrollTop = scrollY;
    }
  }, [scrollY]);

 
  const headerProps = {
    headerHeight,
    fontFamily,
    fontSize,
    rowWidth,
    columns,
  };

  const selectedTaskId = selectedTask ? selectedTask.id : "";

  const tableProps = {
    columns,
    rowHeight,
    rowWidth,
    fontFamily,
    fontSize,
    tasks,
    locale,
    selectedTaskId,
    setSelectedTask,
    onExpanderClick,
    taskSelect
  };

  return (
    <div
      ref={taskListRef}
      className="max-w-fit  rmResizeIcon"
      style={{
        width: `${taskListWidth}px`,
        minWidth: `${taskListWidth}px`,
        resize: "horizontal",
        overflow: "hidden",
        position: "relative",
        borderRight: "2px solid #80808011",
      }}
    >
      <TaskListHeader {...headerProps} />
      <div
        ref={horizontalContainerRef}
        className={horizontalContainerClass}
        style={ganttHeight ? { height: ganttHeight } : {}}
      >
        <TaskListTable {...tableProps} />
      </div>
     
    </div>
  );
};
