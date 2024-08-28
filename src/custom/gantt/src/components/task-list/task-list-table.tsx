import React, { useMemo } from "react";
import styles from "./task-list-table.module.css";
import { columnsType, Task } from "../../types/public-types";

const localeDateStringCache: any = {};
const toLocaleDateStringFactory =
  (locale: string) =>
  (date: Date, dateTimeOptions: Intl.DateTimeFormatOptions) => {
    const key = date.toString();
    let lds = localeDateStringCache[key];
    if (!lds) {
      lds = date.toLocaleDateString(locale, dateTimeOptions);
      localeDateStringCache[key] = lds;
    }
    return lds;
  };
const dateTimeOptions: Intl.DateTimeFormatOptions = {
  weekday: "short",
  year: "numeric",
  month: "long",
  day: "numeric",
};

export const TaskListTableDefault: React.FC<{
  rowHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
  locale: string;
  tasks: Task[];
  selectedTaskId: string;
  setSelectedTask: (taskId: string) => void;
  onExpanderClick: (task: Task) => void;
  taskSelect: (task: Task) => void;
  columns: columnsType[];
}> = ({
  rowHeight,
  rowWidth,
  tasks,
  fontFamily,
  fontSize,
  locale,
  onExpanderClick,
  columns,
  taskSelect,
}) => {
  return (
    <div
      className={styles.taskListWrapper + "w-full select-none "}
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize,
      }}
    >
      {tasks.map((t: any) => {
        let expanderSymbol = "";
        if (t.hideChildren === false) {
          expanderSymbol = "▼";
        } else if (t.hideChildren === true) {
          expanderSymbol = "▶";
        }
        return (
          <div
            onClick={() => taskSelect(t)}
            className={
              styles.taskListTableRow + " !border-b-2 border-b-gray-500 cursor-pointer"
            }
            style={{ height: rowHeight }}
            key={`${t.id}row`}
          >
            {columns.map((c, index) => {
              return (
                <div
                  className={styles.taskListCell + " last:w-full"}
                  style={{
                    minWidth: c.width ? `${c.width}px` : rowWidth,
                    maxWidth: c.width ? `${c.width}px` : rowWidth,
                  }}
                  title={t.name}
                >
                  <div
                    className={
                      styles.taskListNameWrapper +
                      ` ${t.project ? " ml-5" : ""} `
                    }
                  >
                    {index === 0 && (
                      <div
                        className={
                          expanderSymbol
                            ? styles.taskListExpander
                            : styles.taskListEmptyExpander
                        }
                        onClick={() => onExpanderClick(t)}
                      >
                        {expanderSymbol}
                      </div>
                    )}

                    {c.render ? c.render(t) : `${t[c.field]}`}
                  </div>
                </div>
              );
            })}{" "}
          </div>
        );
      })}
    </div>
  );
};
