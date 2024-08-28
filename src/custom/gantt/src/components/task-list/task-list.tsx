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
    columns:columnsType[];
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
  columns,
}) => {
  
  const horizontalContainerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [taskListWidth, setTaskListWidth] = useState<number | undefined>(250);

  useEffect(() => {
    if (horizontalContainerRef.current) {
      horizontalContainerRef.current.scrollTop = scrollY;
    }
  }, [scrollY]);

  useEffect(() => {
    // Set the initial width to the current width of the task list
    if (taskListRef.current) {
      setTaskListWidth(taskListRef.current.clientWidth);
    }
  }, [taskListRef]);

  const startResizing = (e: React.MouseEvent) => {
    setIsResizing(true);
    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResizing);
  };

  const resize = (e: MouseEvent) => {
    if (taskListRef.current && taskListWidth !== undefined) {
      const newWidth =
      e.clientX - taskListRef.current.getBoundingClientRect().left;
        setTaskListWidth(newWidth);
    }
  };

  const stopResizing = () => {
    setIsResizing(false);
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResizing);
  };

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
      className="max-w-fit min-[200px] rmResizeIcon"
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
      <div
        id="dragbar"
        style={{
          top: 0,
          height: "100%",
          right: 0,
          width: "5px",
          background: "#505050",
          position: "absolute",
          opacity: isResizing ? 1 : .2,
          cursor: "col-resize",
          transition: isResizing
            ? "opacity 0.3s ease-in-out 0.3s"
            : "0.3s ease-in-out 0s, opacity 0.3s ease-in-out 0s",
        }}
        onMouseDown={startResizing}
        onMouseEnter={() => setIsResizing(true)}
        onMouseLeave={() => setIsResizing(false)}
      ></div>
    </div>
  );
};
