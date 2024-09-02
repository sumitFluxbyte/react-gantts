import React from "react";
import styles from "./task-list-header.module.css";
import { columnsType } from "../../types/public-types";
export const TaskListHeaderDefault: React.FC<{
  headerHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
  columns: columnsType[];
}> = ({ headerHeight, fontFamily, fontSize, rowWidth, columns }) => {
  return (
    <div
      className={styles.ganttTable+"w-full select-none border-b-2 border-b-gray-200"}
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize,
      }}
    >
      <div
        className={styles.ganttTable_Header}
        style={{
          height: headerHeight - 2,
        }}
      >
        {columns.map((c) => (
          <>
            <div
              className={styles.ganttTable_HeaderItem + " text-center font-semibold text-[#787486]"}
              style={{
                minWidth: c.width ? `${c.width}px` : rowWidth,
              }}
            >
              &nbsp;{c.name}
            </div>
            <div
              className={styles.ganttTable_HeaderSeparator}
              style={{
                height: headerHeight * 0.5,
                marginTop: headerHeight * 0.2,
              }}
            />
          </>
        ))}

    
      </div>
    </div>
  );
};
