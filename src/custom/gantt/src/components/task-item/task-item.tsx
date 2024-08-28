import React, { useEffect, useRef, useState } from "react";
import { BarTask } from "../../types/bar-task";
import { GanttContentMoveAction } from "../../types/gantt-task-actions";
import { Bar } from "./bar/bar";
import { BarSmall } from "./bar/bar-small";
import { Milestone } from "./milestone/milestone";
import { Project } from "./project/project";
import style from "./task-list.module.css";
import { Task } from "../../types/public-types";

export type TaskItemProps = {
  startDrag(e: any, data: any): void;
  endDrag(e: any, data: any): void;
  task: BarTask;
  arrowIndent: number;
  taskHeight: number;
  isProgressChangeable: boolean;
  isDateChangeable: boolean;
  isDelete: boolean;
  isSelected: boolean;
  rtl: boolean;
  selectedTasks: Task | BarTask | any;
  onselectionchange: () => void;
  onEventStart: (
    action: GanttContentMoveAction,
    selectedTask: BarTask,
    event?: React.MouseEvent | React.KeyboardEvent
  ) => any;
  pop: string[];
  allow:boolean
};

export const TaskItem: React.FC<TaskItemProps> = (props) => {
  const {
    task,
    arrowIndent,
    isDelete,
    taskHeight,
    isSelected,
    rtl,
    selectedTasks,
    onEventStart,
    onselectionchange,
    pop,
    allow
  } = {
    ...props,
  };
  
  const textRef = useRef<SVGTextElement>(null);
  const [taskItem, setTaskItem] = useState<JSX.Element>(<div />);
  const [isTextInside, setIsTextInside] = useState(true);

  // State for tooltip
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    content: "",
  });

  useEffect(() => {
    switch (task.typeInternal) {
      case "milestone":
        setTaskItem(<Milestone {...props} />);
        break;
      case "project":
        setTaskItem(<Project {...props} />);
        break;
      case "smalltask":
        setTaskItem(<BarSmall {...props} />);
        break;
      default:
        setTaskItem(<Bar {...props} />);
        break;
    }
  }, [task, isSelected]);

  useEffect(() => {
    if (textRef.current) {
      setIsTextInside(textRef.current.getBBox().width < task.x2 - task.x1);
    }
  }, [textRef, task]);

  const getX = () => {
    const width = task.x2 - task.x1;
    const hasChild = task.barChildren.length > 0;
    if (isTextInside) {
      return task.x1 + width * 0.5;
    }
    if (rtl && textRef.current) {
      return (
        task.x1 -
        textRef.current.getBBox().width -
        arrowIndent * +hasChild -
        arrowIndent * 0.2
      );
    } else {
      return task.x1 + width + arrowIndent * +hasChild + arrowIndent * 0.2;
    }
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    setTooltip({
      visible: true,
      x: e.clientX + 10,
      y: e.clientY + 10,
      content: `Task: ${task.name}`,
    });
    onEventStart("mouseenter", task, e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (tooltip.visible) {
      setTooltip({
        ...tooltip,
        x: e.clientX + 10,
        y: e.clientY + 10,
      });
    }
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    setTooltip({
      ...tooltip,
      visible: false,
    });
    onEventStart("mouseleave", task, e);
  };
  const taskref = useRef<SVGAElement | null>(null);
  useEffect(() => {
    if (selectedTasks) {
      if (taskref && task.id === selectedTasks.id) {
        taskref.current?.scrollIntoView({
          inline: "center",
          behavior: "smooth",
        });
        setTimeout(() => {
          onselectionchange();
        }, 1000);
      }
    }
  }, [selectedTasks]);

  return (
    <>
      <g
        ref={taskref}
        onKeyDown={(e) => {
          switch (e.key) {
            case "Delete": {
              if (isDelete) onEventStart("delete", task, e);
              break;
            }
          }
          e.stopPropagation();
        }}
        onContextMenu={(e) => {
          //console.log(e);
          e.preventDefault();
          onEventStart("contextmenu", task, e);
          taskref.current?.focus();
        }}
        onBlur={() => onEventStart("", task)}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={(e) => {
          onEventStart("dblclick", task, e);
        }}
        onClick={(e) => {
          onEventStart("click", task, e);
        }}
        onFocus={() => {
          onEventStart("select", task);
        }}
        className={`group ${
          selectedTasks && selectedTasks.id === task.id
            ? "opacity-100 contrast-100"
            : "opacity-90 "
        } ${selectedTasks === undefined ? " !opacity-100 contrast-100" : " "} ${
          pop.includes(task.id) ? " !opacity-100 contrast-100" : ""
        } duration-50000 transition-opacity`}
      >
        <svg
          fill={allow ? task.styles.backgroundSelectedColor:"#ff000044"}
          id={task.id}
          onMouseUp={(e) =>
            props.endDrag(e, { x: task.x1 - 8, y: task.y + 15 })
          }
          onMouseDown={(e) =>
            props.startDrag(e, { x: task.x1 - 8, y: task.y + 15 })
          }
          className="opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
          x={task.x1 - 28}
          y={task.y - 10}
          z={1000}
          width="50px"
          height="50px"
          viewBox="0 0 20 20"
          data-type={"start"}
          data-taskId={task.id}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            data-type={"start"}
            data-taskId={task.id}
            d="M7.8 10a2.2 2.2 0 0 0 4.4 0 2.2 2.2 0 0 0-4.4 0z"
          />
        </svg>
        {taskItem}
        <svg
          id={task.id}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          fill={allow ? task.styles.backgroundSelectedColor:"#ff000044"}
          onMouseUp={(e) =>
            props.endDrag(e, { x: task.x2 + 8, y: task.y + 15 })
          }
          onMouseDown={(e) =>
            props.startDrag(e, { x: task.x2 + 8, y: task.y + 15 })
          }
          x={task.x2 - 22}
          y={task.y - 10}
          width="50px"
          height="50px"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
          data-type={"end"}
          data-taskId={task.id}
        >
          <path
            data-type={"end"}
            data-taskId={task.id}
            d="M7.8 10a2.2 2.2 0 0 0 4.4 0 2.2 2.2 0 0 0-4.4 0z"
          />
        </svg>
        <text
          x={getX()}
          y={
            task.typeInternal === "project"
              ? task.y + taskHeight * 0.2
              : task.y + taskHeight * 0.5
          }
          className={
            isTextInside
              ? style.barLabel
              : style.barLabel && style.barLabelOutside
          }
          ref={textRef}
        >
          {task.name}
        </text>
      </g>
    </>
  );
};
