import React from "react";
import { TaskItemProps } from "../task-item";
import styles from "./project.module.css";

export const Project: React.FC<TaskItemProps> = ({ task, isSelected }) => {
  const barColor = isSelected
    ? task.styles.backgroundSelectedColor
    : task.styles.backgroundColor;
  const processColor = isSelected
    ? task.styles.progressSelectedColor
    : task.styles.progressColor;
  const projectWith = task.x2 - task.x1;

  const projectLeftTriangle = [
    task.x1,
    task.y + task.height / 2 + 5,
    task.x1,
    task.y + task.height,
    task.x1 + 15,
    task.y + task.height / 2 + 5,
  ].join(",");
  const projectRightTriangle = [
    task.x2,
    task.y + task.height / 2 + 5,
    task.x2,
    task.y + task.height,
    task.x2 - 15,
    task.y + task.height / 2 + 5,
  ].join(",");
  //console.log("projectWith", task.progressWidth, projectLeftTriangle);

  return (
    <g tabIndex={0} className={styles.projectWrapper} id={task.id} data-taskId={task.id} data-type="Task">
      {/* <rect
        fill={barColor}
        x={task.x1}
        width={projectWith}
        y={task.y}
        height={task.height}
        rx={task.barCornerRadius}
        ry={task.barCornerRadius}
        className={styles.projectBackground}
      /> */}
      <rect
        data-taskId={task.id} data-type="Task"
        x={task.progressX}
        width={task.progressWidth}
        y={task.y}
        height={task.height / 2 + 5}
        rx={0}
        ry={task.barCornerRadius}
        className="rounded-t-sm"
        fill={barColor}
      />
      <rect
        data-taskId={task.id} data-type="Task"
        fill={barColor + "a4"}
        x={task.x1}
        width={projectWith}
        y={task.y}
        height={task.height / 2 + 5}
        rx={0}
        ry={task.barCornerRadius}
        className={styles.projectTop + " rounded-t-md"}
      />
      {task.progressWidth > 120 && (
        <polygon
          className={styles.projectTop}
          points={projectLeftTriangle}
          fill={barColor}
        />
      )}
      <polygon
        className={styles.projectTop}
        points={projectLeftTriangle}
        fill={barColor + "a4"}
      />
      <polygon
        className={styles.projectTop}
        points={projectRightTriangle}
        fill={barColor + "a4"}
      />
      {task.progressWidth === projectWith && (
        <polygon
          className={styles.projectTop}
          points={projectRightTriangle}
          fill={barColor}
        />
      )}
    </g>
  );
};
