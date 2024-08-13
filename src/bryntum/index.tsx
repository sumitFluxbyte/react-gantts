import {
  AssignmentModel,
  CalendarModel,
  CalendarModelConfig,
  DateHelper,
  DependencyModel,
  EventModel,
  ResourceModel,
  TaskModel,
} from "@bryntum/gantt";
import { BryntumGantt } from "@bryntum/gantt-react";
import { useEffect, useState } from "react";
import { getTask } from "../api.service";
function Bryntum() {
  const [rawTask, setRawTask] = useState<any[]>();
  const refetch = () => {
    getTask().then((res) => setRawTask(res.data));
  };

  useEffect(() => {
    refetch();
  }, []);
  const [connection, setConnection] = useState<DependencyModel[]>();
  const [taskData, setTaskData] = useState<any[]>();
  useEffect(() => {
    const connections: DependencyModel[] | any = [];
    rawTask?.filter((t) => {
      t.dependencies.forEach(
        (dependence: { dependentType: string; dependendentOnTaskId: any }) => {
          if (dependence.dependentType === "SUCCESSORS") {
            connections.push({
              fromTask: t.taskId,
              active: true,
              toTask: dependence.dependendentOnTaskId,
            });
          }
        }
      );
    });

    const assignments: AssignmentModel[] | any = [];
    rawTask?.forEach((t) => {
      t.assignedUsers.forEach((u: { user: { userId: any } }) => {
        assignments.push({
          resourceId: u.user.userId,
          eventId: t.taskId,
        });
      });
    });

    const processTasks = (rawData: any[]) => {
      rawData.forEach((task) => {
        task.subtasks = rawData.filter(
          (subtask) => subtask.parentTaskId === task.taskId
        );
      });

      const topLevelTasks = rawData.filter(
        (task) => task.parentTaskId === null
      );

      return topLevelTasks
        .sort(
          (a, b) =>
            new Date(a.startDate ?? new Date()).getTime() -
            new Date(b.startDate ?? new Date()).getTime()
        )
        .map((task) => convertTask(task));
    };
    const convertedData = processTasks(rawTask ?? []);

    setConnection(connections);
    setTaskData(convertedData);
    console.log("call");
  }, [rawTask]);

  const convertTask = (task: any): object | EventModel | TaskModel => {
    return {
      id: task.taskId,
      name: task.taskName,
      parentId: task.parentTaskId,
      note: task.status,
      startDate: DateHelper.add(
        DateHelper.clearTime(new Date(task.startDate ?? "")),
        0,
        "day"
      ),
      duration: task.milestoneIndicator
        ? 0
        : calculateDuration(
            DateHelper.add(
              DateHelper.clearTime(new Date(task.startDate ?? "")),
              0,
              "day"
            ),
            DateHelper.add(
              DateHelper.clearTime(new Date(task.endDate ?? "")),
              0,
              "day"
            )
          ),
      children: task.subtasks
        .sort(
          (a: { startDate: any }, b: { startDate: any }) =>
            new Date(a.startDate ?? new Date()).getTime() -
            new Date(b.startDate ?? new Date()).getTime()
        )
        .map((t: any) => convertTask({ ...t })),
      calendar: "break",
      manuallyScheduled: true,
      iconCls: `${task.flag}  ${
        !task.parentTaskId && !task.subtasks.length ? "!ml-[1.3rem]" : ""
      }`,
      // style: `background:${
      //   TaskStatusEnumValue.NOT_STARTED == task.status
      //     ? "#9f9ca9"
      //     : TaskStatusEnumValue.IN_PROGRESS == task.status
      //     ? "#6592fc"
      //     : TaskStatusEnumValue.COMPLETED == task.status
      //     ? "#7eaa7c"
      //     : ""
      // }`,
      DurationUnit: "day",
      eventColor: task.ganttColor,
      resizable: task.subtasks.length == 0,
      draggable: task.subtasks.length == 0,
      percentDone: task.completionPecentage,
    };
  };
  function calculateDuration(startDate: Date, endDate: Date) {
    let duration = 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    while (start <= end) {
      duration++;
      start.setDate(start.getDate() + 1);
    }

    return duration == 0 ? 1 : duration;
  }
  return (
    <div className="" style={{ height: "100%" }}>
      <button onClick={refetch} >reload</button>
      {taskData && (
        <BryntumGantt
          columns={[
            {
              field: "name",
              type: "name",
            },
          ]}
          tasks={taskData}
          dependencies={connection}
        />
      )}
    </div>
  );
}

export default Bryntum;
