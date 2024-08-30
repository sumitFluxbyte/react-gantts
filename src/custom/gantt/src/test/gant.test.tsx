import React from "react";
import { createRoot } from "react-dom/client";
import { Gantt, Task } from "../index";

describe("gantt", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    const root = createRoot(div);
    root.render(
      <Gantt
        columns={[]}
        tasks={[
          {
            start: new Date(2020, 0, 1),
            end: new Date(2020, 2, 2),
            name: "Redesign website",
            id: "Task 0",
            progress: 45,
            type: "task",
          },
        ]}
        onDepandancyDragEnd={function (
          from: { startTaskID: string; type: string; },
          to: { endTaskID: string; type: string; }
        ): void { } } onDepandanyClick={function (data: any): void {
          throw new Error("Function not implemented.");
        } } onColorChange={function (data: Task): void {
          throw new Error("Function not implemented.");
        } } projectStartDate={new Date()} projectEndDate={new Date()} onDepandancyDraging={function (from: { startTaskID: string; type: string; }, to: { endTaskID: string; type: string; }): void {
          throw new Error("Function not implemented.");
        } }      />
    );
  });
});
