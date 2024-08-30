import React, { useRef, useEffect, useState } from "react";
import { Task } from "../../types/public-types";
import { BarTask } from "../../types/bar-task";
import styles from "./tooltip.module.css";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../../tooltip";

export type ContextMenuProps = {
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
  remove: () => void;
  onColorChange: (Task: Task) => void;
};

export const ContextManu: React.FC<ContextMenuProps> = ({
  task,
  arrowIndent,
  fontSize,
  fontFamily,
  remove,
  onColorChange,
}) => {
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const handleContextMenu = (event: MouseEvent) => {
    event.preventDefault();
    setMouseX(event.clientX + window.scrollX);
    setMouseY(event.clientY + window.scrollY);
    setIsVisible(true);
  };

  const closeMenu = () => {
    setIsVisible(false);
    remove();
  };
  
  const handleClickOutside = (event: MouseEvent) => {
    if (
      contextMenuRef.current &&
      !contextMenuRef.current.contains(event.target as Node)
    ) {
      closeMenu();
    }
  };

  useEffect(() => {
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const contextMenuStyle = {
    display: isVisible ? "block" : "none",
    left: `${mouseX}px`,
    top: `${mouseY}px`,
  };

  return (
    <div
      ref={contextMenuRef}
      className={styles.contextMenuContainer}
      style={contextMenuStyle}
    >
      <StandardMenuContent
        task={task}
        fontSize={fontSize}
        fontFamily={fontFamily}
        closeMenu={closeMenu}
        left={mouseX}
        top={mouseY}
        onColorChange={onColorChange}
      />
    </div>
  );
};

export const StandardMenuContent: React.FC<{
  task: Task;
  fontSize: string;
  fontFamily: string;
  closeMenu: () => void;
  left: number;
  top: number;
  onColorChange: (data: Task) => void;
}> = ({ task, fontSize, fontFamily, closeMenu, left, top, onColorChange }) => {
  const style = {
    fontSize,
    fontFamily,
    left: `${left - 40}px`,
    top: `${top - 40}px`,
  };
  const colors = [
    { id: "red", color: "#ef4444", title: "Red" },
    { id: "pink", color: "#ec4899", title: "Pink" },
    { id: "purple", color: "#a855f7", title: "Purple" },
    { id: "magenta", color: "#ff4dff", title: "Magenta" },
    { id: "violet", color: "#8b5cf6", title: "Violet" },
    { id: "indigo", color: "#6366f1", title: "Indigo" },
    { id: "blue", color: "#3b82f6", title: "Blue" },
    { id: "cyan", color: "#06b6d4", title: "Cyan" },
    { id: "teal", color: "#14b8a6", title: "Teal" },
    { id: "green", color: "#22c55e", title: "Green" },
    { id: "gantt-green", color: "#15803d", title: "Gantt-green" },
    { id: "lime", color: "#84cc16", title: "Lime" },
    { id: "yellow", color: "#eab308", title: "Yellow" },
    { id: "orange", color: "#f97316", title: "Orange" },
    { id: "deep-orange", color: "#ff7043", title: "Deep-orange" },
    { id: "gray", color: "#6b7280", title: "Gray" },
    { id: "light-gray", color: "#d1d5db", title: "Light-gray" },
    { id: "null", color: "#3b82f6", title: "No color", border: true },
  ];
  const [activeColor, setActiveColor] = useState("");
  const handleColorSelect = (color: string) => {
    setActiveColor(color);
    const findColor = colors.find((c) => c.id == color);
    onColorChange({
      ...task,
      styles: {
        backgroundColor: findColor?.color,
        backgroundSelectedColor: findColor?.color,
        progressColor:"#80808088",
        progressSelectedColor:"#80808088"
      },
    });
  };
  return (
    <div
      className={
        styles.contextMenuDefaultContainer + " absolute bg-white p-2 rounded-md shadow-md"
      }
      style={style}
    >
      <div
        className={
          styles.contextMenuList +
          " flex flex-col gap-2 items-center justify-center"
        }
        autoFocus
        onBlur={closeMenu}
      >
        <div
          className="flex gap-2 items-center w-full"
          onClick={() => alert(`Editing ${task.name}`)}
        >
          <i className="material-icons " style={{ fontSize: "16px" }}>
            &#xe3c9;
          </i>{" "}
          Edit Task
        </div>
        <div
          className="flex gap-2 items-center w-full"
          onClick={() => alert(`Deleting ${task.name}`)}
        >
          {" "}
          <i className="material-icons" style={{ fontSize: "16px" }}>
            &#xe872;
          </i>
          Delete Task
        </div>
        <div
          className="flex gap-2 items-center w-full"
          onClick={() => alert(`Viewing details of ${task.name}`)}
        >
          <i className="material-icons" style={{ fontSize: "16px" }}>
            &#xe3c8;
          </i>
          View Details
        </div>

        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger className="flex gap-1 w-full items-center bg-white">
              <div
                className="flex gap-2 items-center w-full py-2"
                onClick={() => alert(`Viewing details of ${task.name}`)}
              >
                <i className="material-icons" style={{ fontSize: "16px" }}>
                  &#xe40a;
                </i>
                Color
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div className="relative overflow-hidden bg-white rounded-md w-64 h-fit ">
                <ul
                  className="grid grid-cols-6 gap-2 p-2 overflow-auto"
                  role="listbox"
                  aria-activedescendant="active-color"
                >
                  {colors.map((color) => (
                    <li
                      onClick={() => handleColorSelect(color.id)}
                      key={color.id}
                      className={`flex items-center justify-center w-8 h-8 cursor-pointer rounded-full material-icons ${
                        color.border ? "border border-gray-300" : ""
                      }`}
                      style={{ backgroundColor: color.id !=="null"?color.color:"" , }}
                      role="option"
                      aria-selected={
                        color.id === activeColor ? "true" : "false"
                      }
                      data-id={color.id}
                      title={color.title}
                      id={color.id === activeColor ? "active-color" : undefined}
                    >
                      {color.id == "null" ? <i></i> : ""}
                    </li>
                  ))}
                </ul>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
