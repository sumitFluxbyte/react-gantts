import React, { useRef, useEffect, useState } from "react";
import { Task } from "../../types/public-types";
import { BarTask } from "../../types/bar-task";
import styles from "./tooltip.module.css";
export type TooltipProps = {
  task: BarTask;
  endTask: BarTask
};

export const DepandanyLineTooltip: React.FC<TooltipProps> = ({
  task,
  endTask

}) => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [mouseX, setMouseX] = useState(task.x1);
  const [mouseY, setMouseY] = useState(task.y);

  useEffect(() => {
    const ganttElement = document.querySelector<HTMLElement>(".gridBody");
    if (!ganttElement) return;

    const handleMouseMove = (event: MouseEvent) => {
      setMouseX(event.clientX);
      setMouseY(event.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
        window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []); // Empty dependency array to ensure the effect runs only once

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
      <StandardTooltipContent task={task} endTask={endTask} />
    </div>
  );
};

export const StandardTooltipContent: React.FC<{
  task: Task;
  endTask: Task

}> = ({ task, endTask }) => {
  return (
    <div className={styles.tooltipDefaultContainer + " rounded-md flex flex-row-reverse !p-0 "}  >
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
