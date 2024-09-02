import React, { useMemo } from "react";
import styles from "./task-list-table.module.css";
import { columnsType, Task } from "../../types/public-types";
import dropDown from "../../../../svg/dropDown.svg";
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
          let expanderSymbol: any;
          if (t.hideChildren === false) {
            expanderSymbol = <img src={dropDown} className="w-5 min-w-5  rotate-180 font-semibold" />;
          } else if (t.hideChildren === true) {
            expanderSymbol = <img src={dropDown} className="w-5 min-w-5 rotate-90" />;
          }
          return (
            <div
              onClick={() => taskSelect(t)}
              className={
                " !border-b border-b-gray-300/50 cursor-pointer flex items-center"
              }
              style={{ height: rowHeight }}
              key={`${t.id}row`}
            >
              {columns.map((c, index) => {
                console.log(t);

                return (
                  <div
                    className={styles.taskListCell + " last:w-full "}
                    style={{
                      minWidth: c.width ? `${c.width}px` : rowWidth,
                      maxWidth: c.width ? `${c.width}px` : rowWidth,
                    }}
                    title={t.name}
                  >
                    <div
                      className={
                        styles.taskListNameWrapper +
                        ` ${t.subtask?.length ? "font-semibold" : ''} text-[#787486cc]`
                      }
                      style={{
                        marginLeft: `${t.level.split('.').length >1 ?t.level.split('.').length  * 12: 0}px`
                      }}
                    >
                      {index === 0 && (
                        <div
                          className={
                            expanderSymbol
                              ? styles.taskListExpander
                              : styles.taskListEmptyExpander
                          }
                          onClick={() => { onExpanderClick(t) }}
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
