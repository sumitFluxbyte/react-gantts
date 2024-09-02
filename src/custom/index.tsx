import { useEffect, useRef, useState } from "react";
import { Gantt, Task as GanntTask, ViewMode, Task } from "./gantt/src";
import { getTask } from "../api.service";
import UserAvatar from "./userAvatar";
import zoomin from "./svg/zoomin.svg";
import zoomout from "./svg/zoomout.svg";
import refresh from "./svg/refresh.svg";
import Dialog from "./Dialog";
export default function Custom() {
  type GanttTaskExtendedType = GanntTask & {
    subtask?: GanttTaskExtendedType[];
    duration: number;
    assign: any[];
    level: string;
  };
  const [tasks, setTasks] = useState<Task[] | any>();
  const [convertedData, setConvertedData] = useState<any[]>();

  const refetch = () => {
    getTask().then((res) => setTasks(res.data));
  };

  useEffect(() => {
    refetch();
  }, []);
  const [expanded, setExpanded] = useState<string[]>();

  useEffect(() => {
    if (tasks) {
      const taskData: GanttTaskExtendedType[] = tasks
        .filter((t: { parentTaskId: any }) => !t.parentTaskId)
        .sort(
          (
            a: { startDate: string | number | Date },
            b: { startDate: string | number | Date }
          ) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        )
        .map((task: any) => convertTasks(task));
      //console.log("taskData", taskData);
      setConvertedData(sortAndFlattenTask(taskData));
    }
  }, [tasks, expanded]);

  const sortAndFlattenTask = (
    tasks: GanttTaskExtendedType[]
  ): GanttTaskExtendedType[] => {
    const sortedData: GanttTaskExtendedType[] = [];

    const topLevelTasks = tasks.sort(
      (a, b) =>
        new Date(a.start ?? new Date()).getTime() -
        new Date(b.start ?? new Date()).getTime()
    ).filter((t) => !t.project);

    const flattenTasks = (task: GanttTaskExtendedType, level: string) => {
      sortedData.push({ ...task, level }); // Add level to track hierarchy
      if (task.subtask) {
        task.subtask.sort(
          (a, b) =>
            new Date(a.start ?? new Date()).getTime() -
            new Date(b.start ?? new Date()).getTime()
        ).forEach((subtask, index) => {
          const subLevel = `${level}.${index + 1}`; // Create the sub-level index
          flattenTasks(subtask, subLevel); // Recursively flatten subtasks
        });
      }
    };

    topLevelTasks.forEach((task, index) => {
      const level = `${index + 1}`; // Top-level tasks are indexed as 1, 2, 3...
      flattenTasks(task, level);
    });

    return sortedData;
  };

  const convertTasks = (originalTask: any): GanttTaskExtendedType => {
    const startDate = new Date(originalTask.startDate);
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate());
    const endDate = new Date(originalTask.endDate);
    endDate.setHours(0, 0, 0, 0);
    endDate.setDate(endDate.getDate() + 1);
    const dependencies = originalTask.dependencies
      ? originalTask.dependencies
        .filter((e: any) => e.dependentType == "PREDECESSORS")
        .map((dep: { dependendentOnTaskId: any }) => dep.dependendentOnTaskId)
      : [];

    const subtask =
      originalTask.subtasks && originalTask.subtasks.length > 0
        ? originalTask.subtasks
          .sort(
            (
              a: { startDate: string | number | Date },
              b: { startDate: string | number | Date }
            ) =>
              new Date(a.startDate).getTime() -
              new Date(b.startDate).getTime()
          )
          .map((s: any) =>
            convertTasks(
              tasks.find((t: { taskId: any }) => t.taskId == s.taskId)
            )
          )
        : undefined;
    const types = originalTask.milestoneIndicator
      ? "milestone"
      : !subtask?.length
        ? "task"
        : "project";
    return {
      id: originalTask.taskId,
      type: types,
      name: originalTask.taskName,
      start: startDate ?? new Date(),
      end: endDate ?? new Date(),
      progress: originalTask.completionPecentage
        ? parseFloat(originalTask.completionPecentage)
        : 0,
      project: originalTask.parentTaskId ?? null,
      dependencies,
      hideChildren: !expanded?.includes(originalTask.taskId),
      subtask,
      assign: originalTask.assignedUsers,
      duration: originalTask.duration,
      level: '',
      styles: {
        backgroundSelectedColor: originalTask.ganttColor
          ? originalTask.ganttColor
          : types === "project"
            ? "#004dc3"
            : "#7bcb83",
        progressSelectedColor: "#80808088",
        backgroundColor: originalTask.ganttColor
          ? originalTask.ganttColor
          : types === "project"
            ? "#3b82f6"
            : "#8ee997",
        progressColor: "#80808088",
      },
    };
  };
  const [view, setView] = useState(ViewMode.Day);
  function dateFormater(inputDate: Date): string {
    const date = new Date(inputDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${day.toString().padStart(2, "0")}/${month
      .toString()
      .padStart(2, "0")}/${year}`;
  }

  const [removeDepandancy, setRemoveDepandancy] = useState<any>();

  const removeDepandancyFn = () => {
    let temp: any[] = [];
    if (convertedData) {
      convertedData.forEach((e) => {
        if (e.id === removeDepandancy.to.id) {
          e.dependencies = e.dependencies.filter(
            (t: any) => t !== removeDepandancy.from.id
          );
        }
        temp.push(e);
      });
      setConvertedData(temp);
      temp = [];
    }
    setRemoveDepandancy(null);
  };

  const expandToggle = (id: string) => {
    if (expanded?.includes(id)) {
      setExpanded(expanded.filter((t) => t !== id));
    } else {
      setExpanded([...(expanded ?? []), id]);
    }
  };
  const [zoomState, setZoomState] = useState(0);
  const Divref = useRef<HTMLDivElement | null>(null);

  const viewModes = [ViewMode.Day, ViewMode.Week, ViewMode.Month, ViewMode.Year];
  const minZoom = 0;
  const maxZoom = viewModes.length - 1;

  const zoominout = (num: number) => {
    // Ensure zoom level is within bounds
    const newZoomState = Math.max(minZoom, Math.min(num, maxZoom));
    setZoomState(newZoomState);
    setView(viewModes[newZoomState]);
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = (event: WheelEvent) => {
      event.preventDefault();
      if (event.ctrlKey) {
        clearTimeout(timeoutId);

        // Use debounce to handle smooth zooming
        timeoutId = setTimeout(() => {
          if (event.deltaY < 0 && zoomState > minZoom) {
            zoominout(zoomState - 1); // Decrement zoom
          } else if (event.deltaY > 0 && zoomState < maxZoom) {
            zoominout(zoomState + 1); // Increment zoom
          }
        }, 100); // Adjust debounce delay as needed
      }
    };


    const div = Divref.current;
    if (div) {
      div.addEventListener('wheel', handleScroll);
    }

    return () => {
      if (div) {
        div.removeEventListener('wheel', handleScroll);
      }
      clearTimeout(timeoutId);
    };
  }, [zoomState, viewModes, minZoom, maxZoom]);
  function calculateDurations(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let duration = 0;
    const nonWorkingDays = [0, 6];
    const holidays = [
      dateFormater(new Date("2024-08-26")),
      dateFormater(new Date("2024-08-28")),
      dateFormater(new Date("2024-09-01")),
    ];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      const formattedDate = dateFormater(d);
      if (!nonWorkingDays.includes(day) && !holidays.includes(formattedDate)) {
        duration++;
      }
    }

    return duration;
  }
  function updateParentTask(taskList: GanttTaskExtendedType[], parentLevel = "") {
    const subTasks = taskList.filter(task => {
      const taskParentLevel = task.level.slice(0, task.level.lastIndexOf('.'));
      return taskParentLevel === parentLevel;
    });

    subTasks.forEach(task => {
      updateParentTask(taskList, task.level);
    });

    if (parentLevel) {
      const parentTask = taskList.find(t => t.level === parentLevel);

      if (parentTask) {
        let earliestStartDate: string | number | Date | null = null;
        let latestEndDate: string | number | Date | null = null;

        subTasks.forEach(task => {
          if (!earliestStartDate || new Date(task.start) < new Date(earliestStartDate)) {
            earliestStartDate = task.start;
          }
          if (!latestEndDate || new Date(task.end) > new Date(latestEndDate)) {
            latestEndDate = task.end;
          }
        });

        if (earliestStartDate) parentTask.start = earliestStartDate;
        if (latestEndDate) parentTask.end = latestEndDate;
      }
    }

    return taskList;
  }
  function updateTaskDates(convertedData: GanttTaskExtendedType[], task: GanttTaskExtendedType) {
    if (!convertedData) return;
  
    // Update the specific task
    const updatedTasks = convertedData.map((t) => {
      if (t.id !== task.id) return t;
  
      // Calculate the duration based on the start and end date
      const updatedDuration = calculateDurations(task.start, task.end);
      const originalTask = convertedData.find(t => t.id === task.id);
  
      if (originalTask && dateFormater(task.start) === dateFormater(originalTask.start)) {
        const newEndDate = calculateEndDate(task.start, updatedDuration);
        task.end = newEndDate;
      }
  
      return task;
    });
  
    // Update dependent tasks
    const finalTasks = updatedTasks.map(t => {
      if (task.id === t.id) {
        updateDependentTasks(t, updatedTasks);
        return t;
      }
      return t;
    });
  
    setConvertedData(updateParentTask(finalTasks));
  }
  
  function calculateEndDate(startDate: Date, duration: number): Date {
    const endDate = new Date(startDate);
    let daysToAdd = duration;
  
    while (daysToAdd > 0) {
      endDate.setDate(endDate.getDate() + 1);
      if (!isNonWorkingDayOrHoliday(endDate)) {
        daysToAdd--;
      }
    }
    return endDate;
  }
  
  function updateDependentTasks(updatedTask: GanttTaskExtendedType, allTasks: GanttTaskExtendedType[]) {
    const dependentTasks = allTasks.filter(task => task.dependencies?.includes(updatedTask.id));
  
    dependentTasks.forEach(dependentTask => {
      const newStartDate = calculateNextWorkingDay(updatedTask.end);
      dependentTask.start = newStartDate;
      dependentTask.end = calculateEndDate(newStartDate, dependentTask.duration);
  
      // Recursively update tasks that depend on this dependent task
      updateDependentTasks(dependentTask, allTasks);
    });
  }
  
  function calculateNextWorkingDay(startDate: Date): Date {
    const newStartDate = new Date(startDate);
  
    // Skip to the next working day if startDate falls on a non-working day
    while (isNonWorkingDayOrHoliday(newStartDate)) {
      newStartDate.setDate(newStartDate.getDate() + 1);
    }
  
    return newStartDate;
  }
  
  function isNonWorkingDayOrHoliday(date: Date): boolean {
    const day = date.getDay();
    const isWeekend = (day === 0 || day === 6); // 0 = Sunday, 6 = Saturday
  
    const holidays = new Set(["2024-08-26", "2024-08-28", "2024-09-01"]);
    const isHoliday = holidays.has(dateFormater(date));
  
    return isWeekend || isHoliday;
  }
  
  return (
    <div className="" ref={Divref}>
      <div className="flex gap-2 items-center ml-10 justify-between mr-10 mb-2">
        <button onClick={refetch}>
          <img src={refresh} className="w-4 min-w-4" />
        </button>
        <div className="flex items-center gap-3 justify-end">
          <button
            disabled={zoomState === 0}
            onClick={() => zoominout(zoomState - 1)}
          >
            <img
              src={zoomin}
              className={`w-4 min-w-4 ${zoomState === 0 ? "opacity-50" : "opacity-100"
                }`}
            />
          </button>
          <button
            disabled={zoomState == 3}
            onClick={() => zoominout(zoomState + 1)}
          >
            <img
              src={zoomout}
              className={`w-4 min-w-4 ${zoomState === 3 ? "opacity-50" : "opacity-100"
                }`}
            />
          </button>
        </div>
      </div>
      {convertedData && (
        <div className="">
          <Gantt
            projectStartDate={new Date("8/15/2024")}
            projectEndDate={new Date("8/29/2024")}
            columns={[
              {
                field: "name",
                name: "Task Name",
                render(data) {
                  return (
                    <div className={`${data.project ? "" : ""} truncate`}>
                      {data.name}
                    </div>
                  );
                },
              },
              {
                field: "assign",
                name: "Assign",
                width: 70,
                render(data) {
                  return (
                    <div>
                      {data.assign?.slice(0, 4).map((item, index) => {
                        return (
                          <div
                            key={index}
                            className={`${index > 0 ? "-ml-4" : ""}`} // Adjust overlap with negative margin-left
                          >
                            <UserAvatar
                              className="shadow-sm shadow-gray-300 border-2 border-white"
                              user={item.user} />
                          </div>
                        );
                      })}
                    </div>
                  );
                },
              },
              {
                field: "start",
                name: "Start date",
                width: 80,
                render(data) {
                  return <>{dateFormater(data.start)}</>;
                },
              },
              {
                field: "end",
                name: "End date",
                width: 80,
                render(data) {
                  return <div className="">{dateFormater(data.end)}</div>;
                },
              },
            ]}
            onColorChange={(e) => {
              setConvertedData(
                convertedData.map((t) => {
                  if (t.id === e.id) {
                    t.styles = e.styles;
                    return t;
                  } else {
                    return t;
                  }
                })
              );
            }}
            viewMode={view}
            tasks={convertedData}
            preStepsCount={2}
            onDateChange={(e) => {updateTaskDates(convertedData, e as GanttTaskExtendedType)}}
            onProgressChange={(e) => console.log("e", e)}
            onExpanderClick={(e) => expandToggle(e.id)}
            holidays={[
              new Date("8/26/2024"),
              new Date("8/28/2024"),
              new Date("9/1/2024"),
            ]}
            nonWorkingDays={[0, 6]}
            onDepandancyDragEnd={function (
              from: { startTaskID: string; type: string; },
              to: { endTaskID: string; type: string; }
            ): void {
              let temp: any[] = [];
              if (convertedData) {
                if (from.startTaskID !== to.endTaskID) {
                  convertedData.forEach((e) => {
                    if (e.id === to.endTaskID) {
                      e.dependencies.push(from.startTaskID);
                    }
                    temp.push(e);
                  });
                  setConvertedData(temp);
                  temp = [];
                }
              }
            }}
            onDepandanyClick={function (data: any): void {
              setRemoveDepandancy(data);
            }} onDepandancyDraging={function (from: { startTaskID: string; type: string; }, to: { endTaskID: string; type: string; }): void {


            }} />
        </div>
      )}
  

      <Dialog
        isOpen={removeDepandancy}
        onClose={function (): void { }}
        modalClass="flex w-fit rounded-md"
      >
        <div className="w-fit flex flex-col justify-between items-center gap-10 p-5">
          Are you want to delete?
          <div className="flex gap-3">
            <button
              className="py-2 px-3 bg-red-400 rounded-md"
              onClick={() => setRemoveDepandancy(null)}
            >
              {" "}
              cancel{" "}
            </button>
            <button
              className="py-2 px-3 bg-green-400 rounded-md"
              onClick={() => removeDepandancyFn()}
            >
              {" "}
              delete{" "}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
