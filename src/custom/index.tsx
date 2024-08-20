import { useEffect, useRef, useState } from "react";
import { Gantt, Task as GanttTask } from "./gantt/src";
import { getTask } from "../api.service";

export default function Custom() {
  type GanttTaskExtendedType = GanttTask & {
    subtask?: GanttTaskExtendedType[];
    duration: number;
  };

  const [tasks, setTasks] = useState<GanttTaskExtendedType[]>([]);
  const convertedData = useRef<GanttTaskExtendedType[]>([]);

  const refetch = () => {
    getTask().then((res) => setTasks(res.data));
  };

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      const taskData: GanttTaskExtendedType[] = tasks.map((task) => convertTasks(task));
      convertedData.current = sortAndFlattenTasks(taskData);
    }
  }, [tasks]);

  const sortAndFlattenTasks = (
    tasks: GanttTaskExtendedType[],
    parentTaskId: string | null = null
  ): GanttTaskExtendedType[] => {
    const sortedData: GanttTaskExtendedType[] = [];

    tasks.forEach((task) => {
      if (task.project === parentTaskId) {
        sortedData.push(task);

        if (task.subtask && task.subtask.length > 0) {
          const subtasks = sortAndFlattenTasks(task.subtask, task.id);
          sortedData.push(...subtasks);
        }
      }
    });

    return sortedData;
  };

  const convertTasks = (originalTask: any): GanttTaskExtendedType => {
    const startDate = new Date(originalTask.startDate ?? "");
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(originalTask.endDate ?? new Date());
    endDate.setUTCHours(0, 0, 0, 0);

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
      project: originalTask.parentTaskId ?? null,
      dependencies,
      hideChildren: true,
      subtask,
      duration: calculateDurations(startDate, endDate),
    };
  };

  const calculateDurations = (startDate: Date, endDate: Date): number => {
    const durationInMilliseconds = endDate.getTime() - startDate.getTime();
    return Math.floor(durationInMilliseconds / (1000 * 60 * 60 * 24));
  };

  return (
    <div>
      <button onClick={refetch}>Reload</button>
      {convertedData.current.length > 0 && (
        <Gantt
          tasks={convertedData.current}
          preStepsCount={2}
          onDateChange={(e) => console.log("Date changed:", e)}
          onProgressChange={(e) => console.log("Progress changed:", e)}
        />
      )}
    </div>
  );
}
