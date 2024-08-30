import React, { useEffect, useRef, useState } from "react";
import { EventOption, Task } from "../../types/public-types";
import { BarTask } from "../../types/bar-task";
import { Arrow } from "../other/arrow";
import { handleTaskBySVGMouseEvent } from "../../helpers/bar-helper";
import { isKeyboardEvent } from "../../helpers/other-helper";
import { TaskItem } from "../task-item/task-item";
import {
  BarMoveAction,
  GanttContentMoveAction,
  GanttEvent,
} from "../../types/gantt-task-actions";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../../tooltip";
import { DepandanyLineTooltip } from "../other/depandancyLineTooltip";
export type TaskGanttContentProps = {
  tasks: BarTask[];
  dates: Date[];
  ganttEvent: GanttEvent;
  selectedTask: BarTask | undefined;
  rowHeight: number;
  columnWidth: number;
  timeStep: number;
  svg?: React.RefObject<SVGSVGElement>;
  svgWidth: number;
  taskHeight: number;
  arrowColor: string;
  arrowIndent: number;
  fontSize: string;
  fontFamily: string;
  rtl: boolean;
  e: any;
  endDrag: any;
  setGanttEvent: (value: GanttEvent) => void;
  setFailedTask: (value: BarTask | null) => void;
  setSelectedTask: (taskId: string) => void;
  depandanyData: (data: any) => void;
  selectedTasks: Task | any;
  onselectionchange: () => void;
  onDepandancyDragEnd: (
    from: { startTaskID: string; type: string },
    to: { endTaskID: string; type: string }
  ) => void;
  onDepandancyDraging: (
    from: { startTaskID: string; type: string },
    to: { endTaskID: string; type: string }
  ) => void;
} & EventOption & { startDrag(e: any): void; endDrag(e: any): void };

export const TaskGanttContent: React.FC<TaskGanttContentProps> = ({
  tasks,
  dates,
  ganttEvent,
  selectedTask,
  rowHeight,
  columnWidth,
  timeStep,
  svg,
  taskHeight,
  arrowColor,
  arrowIndent,
  fontFamily,
  fontSize,
  rtl,
  setGanttEvent,
  setFailedTask,
  setSelectedTask,
  onDateChange,
  onProgressChange,
  onDoubleClick,
  onClick,
  onDelete,
  e,
  endDrag,
  onDepandancyDragEnd,
  depandanyData,
  onselectionchange,
  onDepandancyDraging,
  selectedTasks,
}) => {
  const point = svg?.current?.createSVGPoint();
  const [xStep, setXStep] = useState(0);
  const [initEventX1Delta, setInitEventX1Delta] = useState(0);
  const [isMoving, setIsMoving] = useState(false);

  // create xStep
  useEffect(() => {
    const dateDelta =
      dates[1].getTime() -
      dates[0].getTime() -
      dates[1].getTimezoneOffset() * 60 * 1000 +
      dates[0].getTimezoneOffset() * 60 * 1000;
    const newXStep = (timeStep * columnWidth) / dateDelta;
    setXStep(newXStep);
  }, [columnWidth, dates, timeStep]);

  useEffect(() => {
    const handleMouseMove = async (event: MouseEvent) => {
      if (!ganttEvent.changedTask || !point || !svg?.current) return;
      event.preventDefault();

      point.x = event.clientX;
      const cursor = point.matrixTransform(
        svg?.current.getScreenCTM()?.inverse()
      );

      const { isChanged, changedTask } = handleTaskBySVGMouseEvent(
        cursor.x,
        ganttEvent.action as BarMoveAction,
        ganttEvent.changedTask,
        xStep,
        timeStep,
        initEventX1Delta,
        rtl
      );
      if (isChanged) {
        setGanttEvent({ action: ganttEvent.action, changedTask });
      }
    };

    const handleMouseUp = async (event: MouseEvent) => {
      const { action, originalSelectedTask, changedTask } = ganttEvent;
      if (!changedTask || !point || !svg?.current || !originalSelectedTask)
        return;
      event.preventDefault();

      point.x = event.clientX;
      const cursor = point.matrixTransform(
        svg?.current.getScreenCTM()?.inverse()
      );
      const { changedTask: newChangedTask } = handleTaskBySVGMouseEvent(
        cursor.x,
        action as BarMoveAction,
        changedTask,
        xStep,
        timeStep,
        initEventX1Delta,
        rtl
      );

      const isNotLikeOriginal =
        originalSelectedTask.start !== newChangedTask.start ||
        originalSelectedTask.end !== newChangedTask.end ||
        originalSelectedTask.progress !== newChangedTask.progress;

      // remove listeners
      svg.current.removeEventListener("mousemove", handleMouseMove);
      svg.current.removeEventListener("mouseup", handleMouseUp);
      setGanttEvent({ action: "" });
      setIsMoving(false);

      // custom operation start
      let operationSuccess = true;
      if (
        (action === "move" || action === "end" || action === "start") &&
        onDateChange &&
        isNotLikeOriginal
      ) {
        try {
          const result = await onDateChange(
            newChangedTask,
            newChangedTask.barChildren
          );
          if (result !== undefined) {
            operationSuccess = result;
          }
        } catch (error) {
          operationSuccess = false;
        }
      } else if (onProgressChange && isNotLikeOriginal) {
        try {
          const result = await onProgressChange(
            newChangedTask,
            newChangedTask.barChildren
          );
          if (result !== undefined) {
            operationSuccess = result;
          }
        } catch (error) {
          operationSuccess = false;
        }
      }

      // If operation is failed - return old state
      if (!operationSuccess) {
        setFailedTask(originalSelectedTask);
      }
    };

    if (
      !isMoving &&
      (ganttEvent.action === "move" ||
        ganttEvent.action === "end" ||
        ganttEvent.action === "start" ||
        ganttEvent.action === "progress") &&
      svg?.current
    ) {
      svg.current.addEventListener("mousemove", handleMouseMove);
      svg.current.addEventListener("mouseup", handleMouseUp);
      setIsMoving(true);
    }
  }, [
    ganttEvent,
    xStep,
    initEventX1Delta,
    onProgressChange,
    timeStep,
    onDateChange,
    svg,
    isMoving,
    point,
    rtl,
    setFailedTask,
    setGanttEvent,
  ]);

  /**
   * Method is Start point of task change
   */
  const handleBarEventStart = async (
    action: GanttContentMoveAction,
    task: BarTask,
    event?: React.MouseEvent | React.KeyboardEvent
  ) => {
    if (!event) {
      if (action === "select") {
        setSelectedTask(task.id);
      }
    }
    // Keyboard events
    else if (isKeyboardEvent(event)) {
      if (action === "delete") {
        if (onDelete) {
          try {
            const result = await onDelete(task);
            if (result !== undefined && result) {
              setGanttEvent({ action, changedTask: task });
            }
          } catch (error) {
            console.error("Error on Delete. " + error);
          }
        }
      }
    }
    // Mouse Events
    else if (action === "mouseenter") {
      if (!ganttEvent.action) {
        setGanttEvent({
          action,
          changedTask: task,
          originalSelectedTask: task,
        });
      }
    } else if (action === "mouseleave") {
      if (ganttEvent.action === "mouseenter") {

        setGanttEvent({ action: "" });
      }
    } else if (action === "dblclick") {
      !!onDoubleClick && onDoubleClick(task);
    } else if (action === "click") {
      !!onClick && onClick(task);
    }
    // Change task event start
    else if (action === "move") {
      if (!svg?.current || !point) return;
      point.x = event.clientX;
      const cursor = point.matrixTransform(
        svg.current.getScreenCTM()?.inverse()
      );
      setInitEventX1Delta(cursor.x - task.x1);
      setGanttEvent({
        action,
        changedTask: task,
        originalSelectedTask: task,
      });
    } else {
      setGanttEvent({
        action,
        changedTask: task,
        originalSelectedTask: task,
      });
    }
  };
  const [line, setLine] = useState<any>(null);
  const [dragging, setDragging] = useState<any>(false);
  const [startElement, setStartElement] = useState<Element | null>(null);

  const startDrag = (e: any, data: any) => {
    // const { left, top, width, height } = e.target.getBoundingClientRect();
    setLine({
      x1: data.x,
      y1: data.y,
      x2: data.x,
      y2: data.y,
    });
    setStartElement(e.target);
    setDragging(true);
  };
  useEffect(() => {
    drag(e);
  }, [e]);
  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", (e: any) => {
        if (e.target?.getAttribute("data-type")) {
          setStrock(false)
        } else {
          setStrock(true)
        }
        if (!dragging) {
          setDraggingTask(true)
        }
        onDepandancyDraging(
          {
            startTaskID: startElement?.getAttribute("data-taskId") ?? "",
            type: startElement?.getAttribute("data-type") ?? "",
          },
          {
            endTaskID: e.target?.getAttribute("data-taskId") ?? "",
            type: e.target?.getAttribute("data-type") ?? "",
          }
        );
        console.log({ dragging });


        if (startElement?.getAttribute("data-type") === e.target?.getAttribute("data-type")) {
          if (dragging) {
            setDraggingTask(false)
          }
        } else {
          const task: any = tasks.find((t) => t.id === e.target?.getAttribute("data-type"));
          const startTask: any = tasks.find(
            (t) => t.id === startElement?.getAttribute("data-taskId")
          );
          validate(task, startTask)
        }
      })
      window.addEventListener("mouseup", (e: any) => {
        if (startElement?.getAttribute("data-type") !== e.target?.getAttribute("data-type")) {
          endDragEvent(e, "end")
        }
        setLine(null);
        setDragging(false);
        setStartElement(null);
        setDraggingTask(true)
        setGanttEvent({ action: '' })
      })
    }
    return () => {
      window.removeEventListener("mousemove", (e: any) => {
        if (e.target?.getAttribute("data-type")) {
          setStrock(false)
        } else {
          setStrock(true)
        }
        
      })
      window.removeEventListener("mouseup", (e: any) => {
        if (ganttEvent.action === "dragging") {
          setLine(null);
          setDragging(false);
          setStartElement(null);
          setDraggingTask(true)
          setGanttEvent({ action: '' })
        }
      })
    }
  }, [dragging]);
  useEffect(() => {
    endDragEvent(endDrag);
  }, [endDrag]);
  const [strock, setStrock] = useState(true)
  const ganttContainer = document.querySelector(".gridBody");
  const [draggingTask, setDraggingTask] = useState<boolean>(true);
  const drag = (e: any) => {
    if (dragging) {
      if (ganttContainer) {
        // Update the line position
        setLine((prevLine: any) => ({
          ...prevLine,
          x2: e.clientX - ganttContainer.getBoundingClientRect().left,
          y2: e.clientY - ganttContainer.getBoundingClientRect().top,
        }));

        // Check if the target element has an ID
        let taskId = e.target.getAttribute("id");

        if (!taskId) {
          // If the element doesn't have an ID, get the element behind it
          const elementBehind = document.elementsFromPoint(e.clientX, e.clientY)[1];
          if (elementBehind && elementBehind.getAttribute("id")) {
            taskId = elementBehind.getAttribute("id");
          }
        }

        const task: any = tasks.find((t) => t.id === taskId);
        const startTask: any = tasks.find(
          (t) => t.id === startElement?.getAttribute("data-taskId")
        );
        // console.log(startElement?.getAttribute("data-type") == e.target?.getAttribute("data-type"));


        validate(task, startTask)
      }
    }
  };
  const validate = (task: any, startTask: any) => {
    if (!task || !startTask) return false;

    const startTaskLevel = startTask.level.split(".");
    const currentTaskLevel = task.level.split(".");

    // console.log('Start Task Level:', startTaskLevel);
    // console.log('Current Task Level:', currentTaskLevel);

    setGanttEvent({ action: "dragging", originalSelectedTask: startTask, changedTask: task });

    // If startTask is a parent, it cannot have a dependency with its own subtasks
    if (isParent(startTaskLevel) && isSubtaskOf(startTaskLevel, currentTaskLevel)) {
      setDraggingTask(false);
      return false;
    }

    // If startTask is a subtask, it cannot have a dependency with its own parent
    if (isSubtask(startTaskLevel) && isParentOf(currentTaskLevel, startTaskLevel)) {
      setDraggingTask(false);
      return false;
    }

    // Parent can have dependencies with another parent's subtasks
    // Subtask can have dependencies with another parent
    if (
      (isParent(startTaskLevel) && !isSubtaskOf(startTaskLevel, currentTaskLevel)) ||
      (isSubtask(startTaskLevel) && !isParentOf(currentTaskLevel, startTaskLevel))
    ) {
      setDraggingTask(true);
      return true;
    }

    setDraggingTask(false);
    return false;
  };

  // Helper function to check if a task is a parent task
  const isParent = (taskLevel: string[]): boolean => {
    return taskLevel.length === 1;
  };

  // Helper function to check if a task is a subtask
  const isSubtask = (taskLevel: string[]): boolean => {
    return taskLevel.length > 1;
  };

  // Helper function to check if a task is a subtask of another
  const isSubtaskOf = (parentLevel: string[], subtaskLevel: string[]): boolean => {
    return subtaskLevel.length > parentLevel.length &&
      subtaskLevel.slice(0, parentLevel.length).every((level, index) => level === parentLevel[index]);
  };

  // Helper function to check if a task is a parent of another
  const isParentOf = (parentLevel: string[], subtaskLevel: string[]): boolean => {
    return parentLevel.length < subtaskLevel.length &&
      parentLevel.every((level, index) => level === subtaskLevel[index]);
  };


  const endDragEvent = (e: any, data?: any) => {
    if (dragging) {

      setLine(null);
      setDragging(false);
      setStartElement(null);
      const task: any = tasks.find((t) => t.id === e.target?.getAttribute("data-taskId"));
      const startTask: any = tasks.find(
        (t) => t.id === startElement?.getAttribute("data-taskId")
      );
      if (
        startElement?.getAttribute("data-taskId") &&
        startElement?.getAttribute("data-type") &&
        e.target && validate(task, startTask) && startElement?.getAttribute("data-type") !== e.target?.getAttribute("data-type")
      ) {

        onDepandancyDragEnd(
          {
            startTaskID: startElement?.getAttribute("data-taskId") ?? "",
            type: startElement?.getAttribute("data-type") ?? "",
          },
          {
            endTaskID: e.target?.getAttribute("data-taskId") ?? "",
            type: data ?? e.target?.getAttribute("data-type") ?? "",
          }
        );
      }
    }
    setDraggingTask(true)

  };

  useEffect(() => {
    const reset = () => {
      if (ganttEvent.action === "dragging") {
        setLine(null);
        setDragging(false);
        setStartElement(null);
        setDraggingTask(true)
        setGanttEvent({ action: '' })
      }
    }
    document.addEventListener("mouseup", reset);
    return () => {
      document.removeEventListener("mouseup", reset);
    }
  }, [line]);
  const [pop, setPop] = useState<string[]>([]);

  useEffect(() => {
    const temp: string[] = [];
    const settaskpop = (selectedTasks: any) => {
      for (let element of selectedTasks) {
        temp.push(element.id);
        if (element.barChildren && element.barChildren.length) {
          settaskpop(element.barChildren);
        }
      }
    };
    if (selectedTasks && selectedTasks.barChildren) {
      settaskpop(selectedTasks.barChildren);
    }
    setPop(temp);
  }, [selectedTasks]);

  return (
    <g className="content">
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {line && (
          <line
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={draggingTask ? "#00ff00" : "#ff0000"}
            strokeDasharray={strock ? 5 : 0}
          />
        )}
      </svg>
      <g className="arrows" fill={arrowColor} stroke={arrowColor}>
        {tasks.map((task) => {
          return task.barChildren.map((child) => {
            return (
              <Arrow
                key={`Arrow from ${task.id} to ${tasks[child.index].id}`}
                taskFrom={task}
                taskTo={tasks[child.index]}
                rowHeight={rowHeight}
                taskHeight={taskHeight}
                arrowIndent={arrowIndent}
                rtl={rtl}
                depandanyData={depandanyData}
                setGanttEvent={setGanttEvent}
              />
            );
          });
        })}
      </g>
      <g className="bar" fontFamily={fontFamily} fontSize={fontSize}>
        {tasks.map((task) => {
          return (
            <TaskItem
              selectedTasks={selectedTasks}
              onselectionchange={onselectionchange}
              task={task}
              arrowIndent={arrowIndent}
              taskHeight={taskHeight}
              isProgressChangeable={!!onProgressChange && !task.isDisabled}
              isDateChangeable={!!onDateChange && !task.isDisabled}
              isDelete={!task.isDisabled}
              onEventStart={handleBarEventStart}
              key={task.id}
              isSelected={!!selectedTask && task.id === selectedTask.id}
              rtl={rtl}
              endDrag={(e, data) => endDragEvent(e, data)}
              startDrag={(e, data) => startDrag(e, data)}
              pop={pop}
              allow={draggingTask}
            />
          );
        })}
      </g>
    </g>
  );
};
