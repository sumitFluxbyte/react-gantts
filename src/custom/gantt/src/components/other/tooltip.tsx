import React, { useRef, useEffect, useState } from "react";
import { Task } from "../../types/public-types";
import { BarTask } from "../../types/bar-task";
import styles from "./tooltip.module.css";

export type TooltipProps = {
  task: BarTask;
  arrowIndent: number;
  rtl: boolean;
  svgContainerHeight: number;
  svgContainerWidth: number;
  svgWidth: number;
  headerHeight: number;
  taskListWidth: number;
  rowHeight: number;
  fontSize: string;
  fontFamily: string;
  TooltipContent: React.FC<{
    task: Task;
    fontSize: string;
    fontFamily: string;
  }>;
};

export const Tooltip: React.FC<TooltipProps> = ({
  task,
  arrowIndent,
  fontSize,
  fontFamily,
  TooltipContent,
}) => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const handleMouseMove = (event: MouseEvent) => {
    setMouseX(event.clientX + window.scrollX);
    setMouseY(event.clientY + window.scrollY);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const tooltipStyle = {
    left: `${mouseX - 25}px`, // Offset to avoid covering the mouse pointer
    top: `${mouseY - 25}px`,
  };

  return (
    <div
      ref={tooltipRef}
      className={styles.tooltipDetailsContainer}
      style={tooltipStyle}
    >
      <TooltipContent task={task} fontSize={fontSize} fontFamily={fontFamily} />
    </div>
  );
};

export const StandardTooltipContent: React.FC<{
  task: any;
  fontSize: string;
  fontFamily: string;
}> = ({ task, fontSize, fontFamily }) => {
  const style = {
    fontSize,
    fontFamily,
  };
  return (
    <div className="relative mt-2 p-4 w-64 bg-white text-gray-800 rounded-lg shadow-lg ">
    <h3 className="text-lg font-semibold mb-2">{task.name}</h3>
    
    <div className="flex justify-between text-sm">
      <span>Start Date:</span>
      <span>{task.start.toLocaleDateString()}</span>
    </div>
    
    <div className="flex justify-between text-sm">
      <span>End Date:</span>
      <span>{task.end.toLocaleDateString()}</span>
    </div>
    
    <div className="flex justify-between text-sm">
      <span>Duration:</span>
      <span>{task.duration} days</span>
    </div>
    
    <div className="flex justify-between items-center text-sm mt-0">
      <span>Progress:</span>
      <div className="w-full bg-[#78748649] h-2 rounded-lg overflow-hidden ml-3">
        <div className="bg-[#299d91] h-full" style={{width:`${task.progress}%`}}></div>
      </div>
      <span className="ml-2">{task.progress}%</span>
    </div>
  </div>
    // <div className={styles.tooltipDefaultContainer + " !p-1 shadow-md rounded-md"} >
    //   <div className="relative inline-block">
    //     <div className=" p-2 w-52 bg-white rounded-lg shadow-lg text-gray-800 text-sm z-10">
    //       <div className="font-bold text-lg">{task.name}</div>
    //       <div className="mt-2">
    //         <div className="flex w-full justify-between items-center my-1"><span className="font-medium">Start:</span> {task.start.toLocaleDateString()}</div>
    //         <div className="flex w-full justify-between items-center my-1"><span className="font-medium">End:</span>  {task.end.toLocaleDateString()}</div>
    //         <div className="flex w-full justify-between items-center my-1"><span className="font-medium">Duration:</span>  {task.duration}</div>
    //         <div className="flex w-full justify-between items-center my-1"><span className="font-medium">Complete:</span> {task.progress}%</div>
    //       </div>
    //     </div>
    //   </div>
    // </div >
  );
};
