import GanttChart, {
  GanttChartTask,
} from "smart-webcomponents-react/ganttchart";
import "smart-webcomponents-react/source/styles/smart.default.css";
import { getTask } from "../api.service";
import { useEffect, useRef, useState } from "react";
export default function SmartElement() {
  const [rawTask, setRawTask] = useState<any[]>();
  const refetch = () => {
    getTask().then((res) => setRawTask(res.data));
  };
  const taskData = useRef<any[]>();
  useEffect(() => {
    refetch();
  }, []);
  useEffect(() => {
    if (rawTask) {
      rawTask.forEach((task) => {
        task.subtasks = rawTask.filter(
          (subtask) => subtask.parentTaskId === task.taskId
        );
      });

      const topLevelTasks = rawTask.filter(
        (task) => task.parentTaskId === null
      );
      const convertedData = topLevelTasks
        .map((task) => convertTask(task))
        ?.sort(
          (a, b) =>
            new Date(a.dateStart ?? new Date()).getTime() -
            new Date(b.dateStart ?? new Date()).getTime()
        );

      taskData.current = convertedData;
    }
  }, [rawTask]);
  const convertTask = (originalTask: any) => {
    const startDate = new Date(originalTask.startDate ?? "");
    startDate.setUTCHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - 1);
    const endDate = new Date(originalTask.endDate ?? "");
    endDate.setUTCHours(0, 0, 0, 0);
    endDate.setDate(endDate.getDate());
    const convertedTask: GanttChartTask & {
      flag?: string;
      parentTask?: string | null;
      updatedTime?: number;
    } = {
      id: originalTask.taskId,
      minDuration: 1,
      label: originalTask.taskName,
      dateStart: startDate,
      dateEnd: endDate,
      value: originalTask.status,
      duration: calculateDurations(startDate, endDate),
      disableResources: true,
      dragProject: false,
      resources: [
        {
          id: JSON.stringify(
            originalTask.assignedUsers?.length ? originalTask.assignedUsers : []
          ),
        },
      ],
      tasks: [],
      synchronized: originalTask.subtasks.length > 0,
      class: originalTask.milestoneIndicator
        ? "milestone-" + originalTask.flag
        : originalTask.status,
      parentTask: originalTask.parentTaskId,
      progress: originalTask.completionPecentage
        ? Number(Number(originalTask.completionPecentage).toFixed())
        : 0,
      connections:
        originalTask?.dependencies && originalTask?.dependencies?.length > 0
          ? connections(originalTask)
          : [],
      disableResize: Boolean(originalTask.subtasks?.length),
      flag: originalTask.flag,
      type: originalTask.milestoneIndicator ? "milestone" : "project",
    };
    if (originalTask.subtasks) {
      convertedTask.tasks = originalTask.subtasks.map((subtask: any) =>
        convertTask(subtask)
      );
    }

    return convertedTask;
  };
  function calculateDurations(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationInMilliseconds = end.getTime() - start.getTime();
    const millisecondsInSecond = 1000;
    const millisecondsInMinute = millisecondsInSecond * 60;
    const millisecondsInHour = millisecondsInMinute * 60;
    const millisecondsInDay = millisecondsInHour * 24;
    const days = Math.floor(durationInMilliseconds / millisecondsInDay);
    return days;
  }
  const connections = (originalTask: any) => {
    const connections: any[] = [];
    originalTask.dependencies.forEach(
      (dependence: { dependentType: any; dependendentOnTaskId: any }) => {
        if (dependence.dependentType === "SUCCESSORS") {
          connections.push({
            target: dependence.dependendentOnTaskId,
            type: 1,
            value: dependence.dependentType,
          });
        }
      }
    );
    return connections;
  };

  return (
    <div>
      <button onClick={refetch}>reload</button>
      {taskData && (
        <GanttChart
          dataSource={taskData.current}
          autoSchedule={false}
          view={"week"}
          hideResourcePanel
          durationUnit="day"
          snapToNearest
          className="select-none"
        />
      )}
    </div>
  );
}
