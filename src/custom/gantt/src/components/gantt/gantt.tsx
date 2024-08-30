import React, {
  useState,
  SyntheticEvent,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { ViewMode, GanttProps, Task } from "../../types/public-types";
import { GridProps } from "../grid/grid";
import { ganttDateRange, seedDates } from "../../helpers/date-helper";
import { CalendarProps } from "../calendar/calendar";
import { TaskGanttContentProps } from "./task-gantt-content";
import { TaskListHeaderDefault } from "../task-list/task-list-header";
import { TaskListTableDefault } from "../task-list/task-list-table";
import { StandardTooltipContent, Tooltip } from "../other/tooltip";
import { VerticalScroll } from "../other/vertical-scroll";
import { TaskListProps, TaskList } from "../task-list/task-list";
import { TaskGantt } from "./task-gantt";
import { BarTask } from "../../types/bar-task";
import { convertToBarTasks } from "../../helpers/bar-helper";
import { GanttEvent } from "../../types/gantt-task-actions";
import { DateSetup } from "../../types/date-setup";
import { HorizontalScroll } from "../other/horizontal-scroll";
import { removeHiddenTasks, sortTasks } from "../../helpers/other-helper";
import styles from "./gantt.module.css";
import { ContextManu } from "../other/contextmanu";
import { DepandanyTooltip } from "../other/depandancyTooltip";
import { DepandanyLineTooltip } from "../other/depandancyLineTooltip";

export const Gantt: React.FunctionComponent<GanttProps> = ({
  tasks,
  headerHeight = 50,
  columnWidth = 60,
  listCellWidth = "155px",
  rowHeight = 50,
  ganttHeight = 0,
  viewMode = ViewMode.Day,
  preStepsCount = 0,
  locale = "en-GB",
  barFill = 60,
  barCornerRadius = 3,
  barProgressColor = "#a3a3ff",
  barProgressSelectedColor = "#8282f5",
  barBackgroundColor = "#b8c2cc",
  barBackgroundSelectedColor = "#aeb8c2",
  projectProgressColor = "#7db59a",
  projectProgressSelectedColor = "#59a985",
  projectBackgroundColor = "#fac465",
  projectBackgroundSelectedColor = "#f7bb53",
  milestoneBackgroundColor = "#f1c453",
  milestoneBackgroundSelectedColor = "#f29e4c",
  rtl = false,
  handleWidth = 8,
  timeStep = 86400000,
  arrowColor = "grey",
  fontFamily = "Arial, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue",
  fontSize = "14px",
  arrowIndent = 20,
  todayColor = "rgba(252, 248, 227, 0.5)",
  viewDate,
  TooltipContent = StandardTooltipContent,
  TaskListHeader = TaskListHeaderDefault,
  TaskListTable = TaskListTableDefault,
  holidays,
  nonWorkingDays,
  onDateChange,
  onProgressChange,
  onDoubleClick,
  onClick,
  onDelete,
  onSelect,
  onExpanderClick,
  onDepandancyDragEnd,
  onDepandanyClick,
  onColorChange,
  columns,
  projectStartDate,
  projectEndDate
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const taskListRef = useRef<HTMLDivElement>(null);
  const [dateSetup, setDateSetup] = useState<DateSetup>(() => {
    const [startDate, endDate] = ganttDateRange(tasks, viewMode, preStepsCount);
    return { viewMode, dates: seedDates(startDate, endDate, viewMode) };
  });
  const [currentViewDate, setCurrentViewDate] = useState<Date | undefined>(
    undefined
  );

  const [taskListWidth, setTaskListWidth] = useState(250);
  const [svgContainerWidth, setSvgContainerWidth] = useState(0);
  const [svgContainerHeight, setSvgContainerHeight] = useState(ganttHeight);
  const [barTasks, setBarTasks] = useState<BarTask[]>([]);
  const [ganttEvent, setGanttEvent] = useState<GanttEvent>({
    action: "",
  });

  const taskHeight = useMemo(
    () => (rowHeight * barFill) / 100,
    [rowHeight, barFill]
  );

  const [selectedTask, setSelectedTask] = useState<BarTask>();
  const [failedTask, setFailedTask] = useState<BarTask | null>(null);

  const svgWidth = dateSetup.dates.length * columnWidth;
  const ganttFullHeight = barTasks.length * rowHeight;

  const [scrollY, setScrollY] = useState(0);
  const [scrollX, setScrollX] = useState(-1);
  const [ignoreScrollEvent, setIgnoreScrollEvent] = useState(false);

  // task change events
  useEffect(() => {
    let filteredTasks: Task[];
    if (onExpanderClick) {
      filteredTasks = removeHiddenTasks(tasks);
    } else {
      filteredTasks = tasks;
    }
    filteredTasks = filteredTasks.sort(sortTasks);
    const [startDate, endDate] = ganttDateRange(
      filteredTasks,
      viewMode,
      preStepsCount
    );
    let newDates = seedDates(startDate, endDate, viewMode);
    if (rtl) {
      newDates = newDates.reverse();
      if (scrollX === -1) {
        setScrollX(newDates.length * columnWidth);
      }
    }
    // setDateSetup({ dates: newDates, viewMode });
    setBarTasks(
      convertToBarTasks(
        filteredTasks,
        newDates,
        columnWidth,
        rowHeight,
        taskHeight,
        barCornerRadius,
        handleWidth,
        rtl,
        barProgressColor,
        barProgressSelectedColor,
        barBackgroundColor,
        barBackgroundSelectedColor,
        projectProgressColor,
        projectProgressSelectedColor,
        projectBackgroundColor,
        projectBackgroundSelectedColor,
        milestoneBackgroundColor,
        milestoneBackgroundSelectedColor
      )
    );
  }, [
    tasks,
    viewMode,
    preStepsCount,
    rowHeight,
    barCornerRadius,
    columnWidth,
    taskHeight,
    handleWidth,
    barProgressColor,
    barProgressSelectedColor,
    barBackgroundColor,
    barBackgroundSelectedColor,
    projectProgressColor,
    projectProgressSelectedColor,
    projectBackgroundColor,
    projectBackgroundSelectedColor,
    milestoneBackgroundColor,
    milestoneBackgroundSelectedColor,
    rtl,
    scrollX,
    onExpanderClick,
  ]);
  useEffect(() => {
    let filteredTasks: Task[];
    if (onExpanderClick) {
      filteredTasks = removeHiddenTasks(tasks);
    } else {
      filteredTasks = tasks;
    }
    filteredTasks = filteredTasks.sort(sortTasks);
    const [startDate, endDate] = ganttDateRange(
      filteredTasks,
      viewMode,
      preStepsCount
    );
    let newDates = seedDates(startDate, endDate, viewMode);
    if (rtl) {
      newDates = newDates.reverse();
      if (scrollX === -1) {
        setScrollX(newDates.length * columnWidth);
      }
    }
    // setDateSetup({ dates: newDates, viewMode });
    if (ViewMode.Day === viewMode) {
      setDateSetup(() => {
        const endDateForInfinite = new Date(endDate);
        endDateForInfinite.setDate(endDateForInfinite.getDate() + 15);
        return {
          viewMode: viewMode,
          dates: seedDates(startDateForInfinite, endDateForInfinite, viewMode),
        };
      });
    }
    if (ViewMode.Week === viewMode) {
      setDateSetup(() => {
        const endDateForInfinite = new Date(endDate);
        endDateForInfinite.setMonth(endDateForInfinite.getMonth() + 30);
        return {
          viewMode: viewMode,
          dates: seedDates(startDateForInfinite, endDateForInfinite, viewMode),
        };
      });
    }
    if (ViewMode.Month === viewMode) {
      setDateSetup(() => {
        const endDateForInfinite = new Date(endDate);
        endDateForInfinite.setMonth(endDateForInfinite.getMonth() + 35);
        return {
          viewMode: viewMode,
          dates: seedDates(startDateForInfinite, endDateForInfinite, viewMode),
        };
      });
    }
    if (ViewMode.Year === viewMode) {
      setDateSetup(() => {
        const endDateForInfinite = new Date(endDate);
        endDateForInfinite.setFullYear(endDateForInfinite.getFullYear() + 25);
        return {
          viewMode: viewMode,
          dates: seedDates(startDateForInfinite, endDateForInfinite, viewMode),
        };
      });
    }
  }, [viewMode]);

  useEffect(() => {
    if (
      viewMode === dateSetup.viewMode &&
      ((viewDate && !currentViewDate) ||
        (viewDate && currentViewDate?.valueOf() !== viewDate.valueOf()))
    ) {
      const dates = dateSetup.dates;
      const index = dates.findIndex(
        (d, i) =>
          viewDate.valueOf() >= d.valueOf() &&
          i + 1 !== dates.length &&
          viewDate.valueOf() < dates[i + 1].valueOf()
      );
      if (index === -1) {
        return;
      }
      setCurrentViewDate(viewDate);
      setScrollX(columnWidth * index);
    }
  }, [
    viewDate,
    columnWidth,
    dateSetup.dates,
    dateSetup.viewMode,
    viewMode,
    currentViewDate,
    setCurrentViewDate,
  ]);
  const [contextManu, setcontextManu] = useState(false);
  useEffect(() => {
    const { changedTask, action } = ganttEvent;
    //console.log("action", action);

    if (changedTask) {
      if (action === "delete") {
        setGanttEvent({ action: "" });
        setBarTasks(barTasks.filter((t) => t.id !== changedTask.id));
      } else if (
        action === "move" ||
        action === "end" ||
        action === "start" ||
        action === "progress"
      ) {
        const prevStateTask = barTasks.find((t) => t.id === changedTask.id);
        if (
          prevStateTask &&
          (prevStateTask.start.getTime() !== changedTask.start.getTime() ||
            prevStateTask.end.getTime() !== changedTask.end.getTime() ||
            prevStateTask.progress !== changedTask.progress)
        ) {
          // actions for change
          const newTaskList = barTasks.map((t) =>
            t.id === changedTask.id ? changedTask : t
          );
          setBarTasks(newTaskList);
        }
      }
    }
  }, [ganttEvent, barTasks]);
  useEffect(() => {
    const { changedTask, action } = ganttEvent;
    if (action === "contextmenu" && changedTask) {
      setcontextManu(true);
      const prevStateTask = barTasks.find((t) => t.id === changedTask.id);
      if (
        prevStateTask &&
        (prevStateTask.start.getTime() !== changedTask.start.getTime() ||
          prevStateTask.end.getTime() !== changedTask.end.getTime() ||
          prevStateTask.progress !== changedTask.progress)
      ) {
        // actions for change
        const newTaskList = barTasks.map((t) =>
          t.id === changedTask.id ? changedTask : t
        );
        setBarTasks(newTaskList);
      }
    }
  }, [ganttEvent]);

  useEffect(() => {
    if (failedTask) {
      setBarTasks(
        barTasks.map((t) => (t.id !== failedTask.id ? t : failedTask))
      );
      setFailedTask(null);
    }
  }, [failedTask, barTasks]);

  useEffect(() => {
    if (!listCellWidth) {
      setTaskListWidth(0);
    }
    if (taskListRef.current) {
      setTaskListWidth(taskListRef.current.offsetWidth);
    }
  }, [taskListRef, listCellWidth, taskHeight]);

  useEffect(() => {
    if (wrapperRef.current) {
      setSvgContainerWidth(wrapperRef.current.offsetWidth - taskListWidth);
    }
  }, [wrapperRef, taskListWidth, taskListRef, taskHeight]);

  useEffect(() => {
    if (ganttHeight) {
      setSvgContainerHeight(ganttHeight + headerHeight);
    } else {
      setSvgContainerHeight(tasks.length * rowHeight + headerHeight);
    }
  }, [ganttHeight, tasks, headerHeight, rowHeight, taskHeight]);

  // scroll events
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (event.shiftKey || event.deltaX) {
        const scrollMove = event.deltaX ? event.deltaX : event.deltaY;
        let newScrollX = scrollX + scrollMove;
        if (newScrollX < 0) {
          newScrollX = 0;
        } else if (newScrollX > svgWidth) {
          newScrollX = svgWidth;
        }
        setScrollX(newScrollX);
        event.preventDefault();
      } else if (ganttHeight) {
        let newScrollY = scrollY + event.deltaY;
        if (newScrollY < 0) {
          newScrollY = 0;
        } else if (newScrollY > ganttFullHeight - ganttHeight) {
          newScrollY = ganttFullHeight - ganttHeight;
        }
        if (newScrollY !== scrollY) {
          setScrollY(newScrollY);
          event.preventDefault();
        }
      }

      setIgnoreScrollEvent(true);
    };

    // subscribe if scroll is necessary
    wrapperRef.current?.addEventListener("wheel", handleWheel, {
      passive: false,
    });
    return () => {
      wrapperRef.current?.removeEventListener("wheel", handleWheel);
    };
  }, [
    wrapperRef,
    scrollY,
    scrollX,
    ganttHeight,
    svgWidth,
    rtl,
    ganttFullHeight,
  ]);

  const handleScrollY = (event: SyntheticEvent<HTMLDivElement>) => {
    if (scrollY !== event.currentTarget.scrollTop && !ignoreScrollEvent) {
      setScrollY(event.currentTarget.scrollTop);
      setIgnoreScrollEvent(true);
    } else {
      setIgnoreScrollEvent(false);
    }
  };
  let [startDateForInfinite, endDateForInfinite] = ganttDateRange(
    tasks,
    viewMode,
    preStepsCount
  );

  const handleScrollX = (event: SyntheticEvent<HTMLDivElement>) => {
    const scrollLeft = event.currentTarget.scrollLeft;
    const scrollWidth = event.currentTarget.scrollWidth;
    const clientWidth = event.currentTarget.clientWidth;
    if (scrollLeft + clientWidth >= scrollWidth - 50) {
      setDateSetup((prev) => {
        endDateForInfinite = new Date(prev.dates[prev.dates.length - 1]);
        const startDateForInfinite = new Date(prev.dates[0]);
        endDateForInfinite.setDate(endDateForInfinite.getDate() + 10);
        return {
          viewMode: prev.viewMode,
          dates: seedDates(startDateForInfinite, endDateForInfinite, viewMode),
        };
      });
    }

    // if (scrollLeft == 0) {
    //   setDateSetup((prev) => {
    //     startDateForInfinite = new Date(prev.dates[0]);
    //     startDateForInfinite.setDate(startDateForInfinite.getDate() - 10);
    //     const endDateForInfinite = new Date(prev.dates[prev.dates.length - 1]);
    //     return {
    //       viewMode: prev.viewMode,
    //       dates: seedDates(startDateForInfinite, endDateForInfinite, viewMode),
    //     };
    //   });
    // }

    if (scrollX !== event.currentTarget.scrollLeft && !ignoreScrollEvent) {
      setScrollX(event.currentTarget.scrollLeft);
      setIgnoreScrollEvent(true);
    } else {
      setIgnoreScrollEvent(false);
    }
  };

  /**
   * Handles arrow keys events and transform it to new scroll
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    let newScrollY = scrollY;
    let newScrollX = scrollX;
    let isX = true;
    switch (event.key) {
      case "Down": // IE/Edge specific value
      case "ArrowDown":
        newScrollY += rowHeight;
        isX = false;
        break;
      case "Up": // IE/Edge specific value
      case "ArrowUp":
        newScrollY -= rowHeight;
        isX = false;
        break;
      case "Left":
      case "ArrowLeft":
        newScrollX -= columnWidth;
        break;
      case "Right": // IE/Edge specific value
      case "ArrowRight":
        newScrollX += columnWidth;
        break;
    }
    if (isX) {
      if (newScrollX < 0) {
        newScrollX = 0;
      } else if (newScrollX > svgWidth) {
        newScrollX = svgWidth;
      }
      setScrollX(newScrollX);
    } else {
      if (newScrollY < 0) {
        newScrollY = 0;
      } else if (newScrollY > ganttFullHeight - ganttHeight) {
        newScrollY = ganttFullHeight - ganttHeight;
      }
      setScrollY(newScrollY);
    }
    setIgnoreScrollEvent(true);
  };

  /**
   * Task select event
   */
  const handleSelectedTask = (taskId: string) => {
    const newSelectedTask = barTasks.find((t) => t.id === taskId);
    const oldSelectedTask = barTasks.find(
      (t) => !!selectedTask && t.id === selectedTask.id
    );
    if (onSelect) {
      if (oldSelectedTask) {
        onSelect(oldSelectedTask, false);
      }
      if (newSelectedTask) {
        onSelect(newSelectedTask, true);
      }
    }
    setSelectedTask(newSelectedTask);
  };
  const handleExpanderClick = (task: Task) => {
    if (onExpanderClick && task.hideChildren !== undefined) {
      onExpanderClick({ ...task, hideChildren: !task.hideChildren });
    }
  };
  // const handleExpanderClick = (task: Task) => {
  //   console.log(task);

  //   // Toggle the hideChildren property of the clicked task
  //   const newHideChildren = !task.hideChildren;

  //   // Function to recursively toggle visibility of children tasks
  //   const toggleChildrenVisibility = (tasks: BarTask[], parentId: string, hide: boolean): BarTask[] => {
  //     return tasks.map((t:any) => {
  //       if (t.project === parentId) { // Check if this task is a child of the current task
  //         t.isVisible = !hide; // Set visibility based on the parent's hide state
  //         if (t.hideChildren !== undefined) {
  //           tasks = toggleChildrenVisibility(tasks, t.id, hide); // Recursively toggle visibility for all children
  //         }
  //       }
  //       return t;
  //     });
  //   };

  //   // Update the visibility of children tasks in the state
  //   setBarTasks(prevTasks => {
  //     // First, toggle the clicked task's hideChildren property
  //     const updatedTasks = prevTasks.map(t => 
  //       t.id === task.id ? { ...t, hideChildren: newHideChildren } : t
  //     );

  //     // Then, recursively update the visibility of its child tasks
  //     return toggleChildrenVisibility(updatedTasks, task.id, newHideChildren);
  //   });
  // };

  const gridProps: GridProps = {
    columnWidth,
    svgWidth,
    tasks: tasks,
    rowHeight,
    dates: dateSetup.dates,
    todayColor,
    rtl,
    sete(data) { },
    setEndDrag(data) { },
    nonWorkingDays,
    holidays,
    projectStartDate,
    projectEndDate,
    viewMode,
  };
  const calendarProps: CalendarProps = {
    dateSetup,
    locale,
    viewMode,
    headerHeight,
    columnWidth,
    fontFamily,
    fontSize,
    rtl,
  };
  const barProps: TaskGanttContentProps & any = {
    tasks: barTasks,
    dates: dateSetup.dates,
    ganttEvent,
    selectedTask,
    rowHeight,
    taskHeight,
    columnWidth,
    arrowColor,
    timeStep,
    fontFamily,
    fontSize,
    arrowIndent,
    svgWidth,
    rtl,
    setGanttEvent,
    setFailedTask,
    setSelectedTask: handleSelectedTask,
    onDateChange,
    onProgressChange,
    onDoubleClick,
    onClick,
    onDelete,
  };
  const [selectedTasks, setSelectedTasks] = useState<Task>();

  const tableProps: TaskListProps = {
    rowHeight,
    rowWidth: listCellWidth,
    fontFamily,
    fontSize,
    tasks: barTasks,
    locale,
    headerHeight,
    scrollY,
    ganttHeight,
    horizontalContainerClass: styles.horizontalContainer,
    selectedTask,
    taskListRef,
    taskListWidth,
    setSelectedTask: handleSelectedTask,
    onExpanderClick: handleExpanderClick,
    TaskListHeader,
    TaskListTable,
    columns,
    taskSelect: (data) => {
      if (data.id === selectedTasks?.id) {
        setSelectedTasks(undefined);
      } else {
        setSelectedTasks(data);
      }
    },
  };
  const [isResizing, setIsResizing] = useState(false);
  useEffect(() => {
    // Set the initial width to the current width of the task list
    if (taskListRef.current) {
      setTaskListWidth(taskListRef.current.clientWidth);
    }
  }, [taskListRef]);

  const startResizing = (e: React.MouseEvent) => {
    setIsResizing(true);
    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResizing);
  };

  const resize = (e: MouseEvent) => {
    if (taskListRef.current && taskListWidth !== undefined) {
      const newWidth =
        e.clientX - taskListRef.current.getBoundingClientRect().left;
      setTaskListWidth(newWidth);
    }
  };

  const stopResizing = () => {
    setIsResizing(false);
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResizing);
  };
  const [valid, setvalid] = useState<{start:string,end:string}>()

  const onDepandancyDraging = (start:string,end:string) =>{
    setvalid({end:end,start:start})
  }
  return (
    <div className="gantt">
      <div
        className={styles.wrapper}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        ref={wrapperRef}

      >
        {listCellWidth &&
          <div className="relative group">
            <TaskList {...tableProps} /> <div
              id="dragbar"
              style={{
                top: 0,
                height: "100%",
                right: 0,
                width: "5px",
                background: "#505050",
                position: "absolute",
                opacity: isResizing ? 1 : .2,
                cursor: "col-resize",
                transition: isResizing
                  ? "opacity 0.3s ease-in-out 0.3s"
                  : "0.3s ease-in-out 0s, opacity 0.3s ease-in-out 0s",
              }}
              onMouseDown={startResizing}
              onMouseEnter={() => setIsResizing(true)}
              onMouseLeave={() => setIsResizing(false)}
            ></div>
            <div id="dragbar"
              className="opacity-0 group-hover:opacity-100 select-none transition-opacity duration-150  rounded-full"
              style={{
                top: "50%",
                height: "40px",
                right: 0,
                width: "40px",
                position: "absolute",
                cursor: "pointer",
                transform: "translate(44%,-15%)",
              }}>

              <div className="flex h-full w-full gap-2 justify-center items-center text-xl text-white bg-gray-300/30 rounded-full font-semibold">
                <div className="text-gray-700 hover:text-emerald-700 " onClick={() => setTaskListWidth(8)}>
                  &lt;
                </div>
                {wrapperRef && wrapperRef.current &&
                  <div className="text-gray-700 hover:text-emerald-700" onClick={() => setTaskListWidth((wrapperRef.current?.clientWidth??250) - 10)}>
                    &gt;
                  </div>
                }
              </div>
            </div>
          </div>}

        <TaskGantt
          gridProps={gridProps}
          calendarProps={calendarProps}
          barProps={barProps}
          ganttHeight={ganttHeight}
          scrollY={scrollY}
          scrollX={scrollX}
          viewMode={viewMode}
          onDepandancyDragEnd={(
            s: { startTaskID: string; type: string },
            e: { endTaskID: string; type: string }
          ) => onDepandancyDragEnd(s, e)}
          onDepandancyDraging={(
            s: { startTaskID: string; type: string },
            e: { endTaskID: string; type: string }
          ) => onDepandancyDraging(s.type, e.type)}
          depandanyData={onDepandanyClick}
          selectedTasks={selectedTasks}
          onselect={function (data: number): void {
            setScrollX(data);
          }}
        />
        {ganttEvent.changedTask && taskHeight && ganttEvent.action == "mouseenter" && (
          <Tooltip
            arrowIndent={arrowIndent}
            rowHeight={rowHeight}
            svgContainerHeight={svgContainerHeight}
            svgContainerWidth={svgContainerWidth}
            fontFamily={fontFamily}
            fontSize={fontSize}
            task={ganttEvent.changedTask}
            headerHeight={headerHeight}
            taskListWidth={taskListWidth}
            TooltipContent={TooltipContent}
            rtl={rtl}
            svgWidth={svgWidth}
          />
        )}
        {ganttEvent.changedTask && ganttEvent.originalSelectedTask && ganttEvent.action === "dragging" && (
          <DepandanyTooltip
            endTask={ganttEvent.changedTask}
            task={ganttEvent.originalSelectedTask}
            valid={valid}

          />
        )}
        {ganttEvent.changedTask && ganttEvent.originalSelectedTask && ganttEvent.action === "hoverOnDependance" && (
          <DepandanyLineTooltip
            endTask={ganttEvent.changedTask}
            task={ganttEvent.originalSelectedTask}
          />
        )}
        {ganttEvent.changedTask && ganttEvent.action === "contextmenu" && (
          <ContextManu
            arrowIndent={arrowIndent}
            rowHeight={rowHeight}
            svgContainerHeight={svgContainerHeight}
            svgContainerWidth={svgContainerWidth}
            fontFamily={fontFamily}
            fontSize={fontSize}
            task={ganttEvent.changedTask}
            headerHeight={headerHeight}
            taskListWidth={taskListWidth}
            rtl={rtl}
            svgWidth={svgWidth}
            onColorChange={onColorChange}
            remove={() => {
              setcontextManu(false);
              setGanttEvent({ action: "" });
            }}
          />
        )}
        <VerticalScroll
          ganttFullHeight={ganttFullHeight}
          ganttHeight={ganttHeight}
          headerHeight={headerHeight}
          scroll={scrollY}
          onScroll={handleScrollY}
          rtl={rtl}
        />
      </div>
      <HorizontalScroll
        svgWidth={svgWidth}
        taskListWidth={taskListWidth}
        scroll={scrollX}
        rtl={rtl}
        onScroll={handleScrollX}
      />
    </div>
  );
};
