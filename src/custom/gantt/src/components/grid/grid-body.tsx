import React, { ReactChild } from "react";
import { Task, ViewMode } from "../../types/public-types";
import { addToDate } from "../../helpers/date-helper";
import styles from "./grid.module.css";

export type GridBodyProps = {
  tasks: Task[];
  dates: Date[];
  holidays?: Date[];
  projectStartDate?: Date;
  projectEndDate?: Date;
  nonWorkingDays?: number[];
  svgWidth: number;
  rowHeight: number;
  columnWidth: number;
  todayColor: string;
  rtl: boolean;
  viewMode: ViewMode;
};
export const GridBody: React.FC<GridBodyProps> = ({
  tasks,
  dates,
  holidays,
  nonWorkingDays,
  rowHeight,
  svgWidth,
  columnWidth,
  todayColor,
  rtl,
  viewMode,
  projectStartDate,
  projectEndDate,
}) => {
  function dateFormater(inputDate: Date): string {
    const date = new Date(inputDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${day.toString().padStart(2, "0")}/${month
      .toString()
      .padStart(2, "0")}/${year}`;
  }

  let y = 0;
  const gridRows: ReactChild[] = [];
  const rowLines: ReactChild[] = [
    <line
      key="RowLineFirst"
      x="0"
      y1={0}
      x2={svgWidth}
      y2={0}
      className={styles.gridRowLine}
    />,
  ];
  for (const task of tasks) {
    if (!tasks.find(t => t.id == task.project)?.hideChildren) {

      gridRows.push(
        <rect
          key={"Row" + task.id}
          id={task.id}
          x="0"
          y={y}
          width={svgWidth}
          height={rowHeight}
          className={styles.gridRow}
        />
      );
      rowLines.push(
        <line
          key={"RowLine" + task.id}
          x="0"
          id={task.id}
          y1={y + rowHeight}
          x2={svgWidth}
          y2={y + rowHeight}
          className={styles.gridRowLine}
        />

      );
      y += rowHeight;
    }

  }
  let holidayRects: ReactChild[] = [];
  let nonWorkingDayRects: ReactChild[] = [];
  const now = new Date();
  let tickX = 0;
  const ticks: ReactChild[] = [];
  let today: ReactChild = <rect />;
  let EndofProject: ReactChild = <rect />;
  let StartofProject: ReactChild = <rect />;

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    ticks.push(
      <line
        key={date.getTime()}
        x1={tickX}
        y1={0}
        x2={tickX}
        y2={y}
        className={styles.gridTick}
      />
    );
    if (
      (i + 1 !== dates.length &&
        date.getTime() < now.getTime() &&
        dates[i + 1].getTime() >= now.getTime()) ||
      // if current date is last
      (i !== 0 &&
        i + 1 === dates.length &&
        date.getTime() < now.getTime() &&
        addToDate(
          date,
          date.getTime() - dates[i - 1].getTime(),
          "millisecond"
        ).getTime() >= now.getTime())
    ) {
      today = (
        <rect
          x={tickX}
          y={0}
          width={columnWidth}
          height={y}
          fill={"#299d9122"}
          className="bg-slate-300"
        />
      );
    }
    // rtl for today
    if (
      rtl &&
      i + 1 !== dates.length &&
      date.getTime() >= now.getTime() &&
      dates[i + 1].getTime() < now.getTime()
    ) {
      today = (
        <rect
          x={tickX + columnWidth}
          y={0}
          width={columnWidth}
          height={y}
          fill={"#ff676722"}
        />
      );
    }
    if (holidays) {
      if (holidays.map((d) => dateFormater(d)).includes(dateFormater(date))) {
        holidayRects.push(
          <rect
            key={`holiday-${date.getTime()}`}
            x={tickX}
            y={0}
            width={columnWidth}
            height={y}
            fill={"#78748611"} // You can adjust the color as needed
            className={styles.holidayRect}
          />
        );
      }
    }
    if (nonWorkingDays) {
      if (nonWorkingDays.includes(date.getDay())) {
        nonWorkingDayRects.push(
          <rect
            key={`holiday-${date.getTime()}`}
            x={tickX}
            y={0}
            width={columnWidth}
            height={y}
            fill={"#78748611"} // Adjust the color as needed
            className={styles.holidayRect}
          />
        );
      }
    }

    if (projectStartDate) {
      if ((i + 1 !== dates.length &&
        date.getTime() < projectStartDate.getTime() &&
        dates[i + 1].getTime() >= projectStartDate.getTime())) {
        StartofProject = (
          <svg>
            <rect
              key={`projectStart-${date.getTime()}`}
              x={tickX}
              y={0}
              width={2}
              height={y}
              fill={"#fab005"} // Adjust the color as needed
              className={styles.holidayRect}
            />
            <g className={styles.projectStartFlag}>
              <rect
                x={tickX + 1} // Adjust the position to align with the text
                y={0} // Align with the text
                width={80} // Adjust the width as needed to fit the text
                height={20} // Adjust the height as needed
                fill="#fab005" // Background color of the flag
                className={styles.flagBackground} // Optional: Add custom styling class
              />
              <text
                x={tickX + 10} // Adjust the position slightly inside the rectangle
                y={15} // Vertically align the text inside the background
                fill="#FFFFFF" // Text color contrasting the background
                fontSize="12" // Adjust the font size as needed
                className={styles.projectStartText + " select-none"}
              >
                Project Start
              </text>
            </g>
          </svg>
        );
      }
    }
    if (projectEndDate) {
      if (
        (i + 1 !== dates.length &&
          date.getTime() < projectEndDate.getTime() &&
          dates[i + 1].getTime() >= projectEndDate.getTime())
      ) {
        EndofProject = (
          <svg>
            <rect
              key={`projectEnd-${date.getTime()}`}
              x={tickX}
              y={0}
              width={2}
              height={y}
              fill={"#fab005"} // Adjust the color as needed
              className={styles.holidayRect}
            />
            <g className={styles.projectEndFlag}>
              <rect
                x={tickX + 1} // Adjust the position to align with the text
                y={0} // Align with the text
                width={80} // Adjust the width as needed to fit the text
                height={20} // Adjust the height as needed
                fill="#fab005" // Background color of the flag
                className={styles.flagBackground} // Optional: Add custom styling class
              />
              <text
                x={tickX + 10} // Adjust the position slightly inside the rectangle
                y={15} // Vertically align the text inside the background
                fill="#FFFFFF" // Text color contrasting the background
                fontSize="12" // Adjust the font size as needed
                className={styles.projectStartText + " select-none"}
              >
                Project End
              </text>
            </g>
          </svg>
        );
      }
    }
    tickX += columnWidth;
  }
  return (
    <g className="gridBody">
      <g className="rows">{gridRows}</g>
      <g className="rowLines">{rowLines}</g>
      <g className="ticks">{ticks}</g>
      <g className="today">{today}</g>
      <g className="projectStart">{StartofProject}</g>
      <g className="projectEnd">{EndofProject}</g>
      {viewMode !== ViewMode.Year &&
        viewMode !== ViewMode.QuarterYear &&
        viewMode !== ViewMode.Month &&
        viewMode !== ViewMode.Week && <g className="holiday">{holidayRects}</g>}
      {viewMode !== ViewMode.Year &&
        viewMode !== ViewMode.QuarterYear &&
        viewMode !== ViewMode.Month &&
        viewMode !== ViewMode.Week && (
          <g className="nonWorkingDays">{nonWorkingDayRects}</g>
        )}
    </g>
  );
};
