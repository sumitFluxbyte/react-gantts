import React, { useRef, useEffect, useState } from "react";
import { Task } from "../../types/public-types";
import { BarTask } from "../../types/bar-task";
import styles from "./tooltip.module.css";

export type TooltipProps = {
  task: BarTask;
  endTask: BarTask
  valid:{start:string,end:string} | undefined
};

export const DepandanyTooltip: React.FC<TooltipProps> = ({
  task,
  endTask,
  valid
}) => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  useEffect(() => {
    const ganttElement = document.querySelector<HTMLElement>(".gridBody");
    if (!ganttElement) return;

    const handleMouseMove = (event: MouseEvent) => {
      setMouseX(event.clientX);
      setMouseY(event.clientY);
    };
    ganttElement.addEventListener("mousemove", handleMouseMove);
    return () => {
      ganttElement.removeEventListener("mousemove", handleMouseMove);
    };
  }, []); // Empty dependency array to ensure the effect runs only once
  // console.log("call,DepandanyTooltip");

  const tooltipStyle = {
    left: `${mouseX + 15}px`, // Offset to avoid covering the mouse pointer
    top: `${mouseY - 10}px`,
  };
  return (
    <div
      ref={tooltipRef}
      className={styles.tooltipDetailsContainer}
      style={tooltipStyle}
    >
  
      <StandardTooltipContent task={task} endTask={endTask} valid={valid} />
    </div>
  );
};

export const StandardTooltipContent: React.FC<{
  task: Task;
  endTask: Task
  valid:{start:string,end:string} | undefined


}> = ({ task, endTask,valid }) => {
  const validate = (task: any, startTask: any) => {
    if (!task || !startTask) return false;
    if (valid && valid.start == valid.end) {
      return false
    }
    const startTaskLevel = startTask.level.split(".");
    const currentTaskLevel = task.level.split(".");

    // console.log('Start Task Level:', startTaskLevel);
    // console.log('Current Task Level:', currentTaskLevel);

    // If startTask is a parent, it cannot have a dependency with its own subtasks
    if (isParent(startTaskLevel) && isSubtaskOf(startTaskLevel, currentTaskLevel)) {
      return false;
    }

    // If startTask is a subtask, it cannot have a dependency with its own parent
    if (isSubtask(startTaskLevel) && isParentOf(currentTaskLevel, startTaskLevel)) {
      return false;
    }

    // Parent can have dependencies with another parent's subtasks
    // Subtask can have dependencies with another parent
    if (
      (isParent(startTaskLevel) && !isSubtaskOf(startTaskLevel, currentTaskLevel)) ||
      (isSubtask(startTaskLevel) && !isParentOf(currentTaskLevel, startTaskLevel))
    ) {
      return true;
    }

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

  return (
    <div className={styles.tooltipDefaultContainer + " rounded-md flex flex-row-reverse !p-0 "} style={{ border: `solid 2px ${!validate(endTask, task) ? "red" : "green"}`, backgroundColor: `${!validate(endTask, task) ? "red" : "green"}` }} >
      <div style={{ backgroundColor: `${!validate(endTask, task) ? "red" : "green"}` }} className="text-center text-white font-semibold flex justify-center items-center w-6" >
        <p className="rotate-90">
          {!validate(endTask, task) ? "Invalid" : "Valid"}
        </p>
      </div>
      <div className="bg-white rounded-md p-2 ">
        From
        <br />
        <p className="text-base font-semibold">
          {task.name}
        </p>

        To
        <br />
        <p className="text-base font-semibold">
          {endTask.name}
        </p>
      </div>
    </div>
  );
};
