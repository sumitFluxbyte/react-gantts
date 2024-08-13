import { useEffect, useRef, useState } from "react";
import { Gantt, Task as GanntTask } from "./gantt/src";
import { getTask } from "../api.service";

export default function Custom() {
  type GanntTaskExtendatetype = GanntTask & {
    subtask?: GanntTaskExtendatetype[];
    duration: number;
  };
  const [tasks, settasks] = useState<any[]>();
  const convertedData = useRef<any[]>();
  const refetch = () => {
    getTask().then((res) => settasks(res.data));
  };
  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    if (tasks) {
      const taskData: GanntTaskExtendatetype[] = [];
      tasks.forEach((e) => {
        taskData.push(convertTasks(e));
        e.subtasks.forEach((t: { taskId: any }) => {
          if (t.taskId == e.parentTaskId) {
            taskData.push(convertTasks(t));
          }
        });
      });
      convertedData.current = sortConvertedData(taskData);
    }
  }, [tasks]);
  const sortConvertedData = (data: GanntTaskExtendatetype[]) => {
    const parentGrope = data.filter((d) => !d.project).map((t) => [t]);
    data
      .filter((d) => d.project)
      .forEach((t) => {
        const findParentGrope = parentGrope.find(
          (pg) => pg.find((p) => !p.project)?.id == t.project
        );
        findParentGrope?.push(t);
      });
    return parentGrope.flat();

    // const sortedData: GanntTaskExtendatetype[] = []
    // const recursion = (dataw: GanntTaskExtendatetype[]) => {
    //   dataw.forEach(e => {
    //     sortedData.push(e)
    //     if (e.subtask && e.subtask?.length > 0) {
    //       recursion(e.subtask)
    //     }
    //   })
    // }

    // recursion(data)
    // console.log(sortedData);
    // return sortedData
  };
  const convertTasks = (originalTask: any): GanntTaskExtendatetype => {
    const startDate = new Date(originalTask.startDate ?? "");
    startDate.setUTCHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate());
    const endDate = new Date(originalTask.endDate ?? new Date());
    endDate.setUTCHours(0, 0, 0, 0);
    endDate.setDate(endDate.getDate());

    // Check if dependencies and subtasks exist and handle accordingly
    const dependencies = originalTask.dependencies
      ? originalTask.dependencies.map(
          (dep: { dependendentOnTaskId: any }) => dep.dependendentOnTaskId
        )
      : [];
    const subtask =
      originalTask.subtasks && originalTask.subtasks.length > 0
        ? originalTask.subtasks.map((s: any) => convertTasks(s))
        : undefined;

    return {
      id: originalTask.taskId,
      type: originalTask.milestoneIndicator
        ? "milestone"
        : !subtask?.length
        ? "task"
        : "project",
      name: originalTask.taskName,
      start: startDate,
      end: endDate,
      progress: originalTask.completionPecentage
        ? parseFloat(originalTask.completionPecentage)
        : 0,
      project: originalTask.parentTaskId ?? undefined,
      dependencies,
      hideChildren: true,
      subtask,
      duration: calculateDurations(startDate, endDate),
    };
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

  return (
    <div>
        <button onClick={refetch}>reload</button>
      {convertedData.current && (
        <Gantt
          tasks={convertedData.current ?? []}
          preStepsCount={2}
          onDateChange={(e) => console.log("e", e)}
          onProgressChange={(e) => console.log("e", e)}
        />
      )}
    </div>
  );
}
