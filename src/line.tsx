import React, { useState } from 'react';

const ConnectDivsWithLine = () => {
  const [line, setLine] = useState<any>(null);
  const [dragging, setDragging] = useState<any>(false);
  const [startElement, setStartElement] = useState<any>(null);

  const startDrag = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, element: any) => {
    const { left, top, width, height } = element.getBoundingClientRect();
    setLine({
      x1: left + width / 2,
      y1: top + height / 2,
      x2: left + width / 2,
      y2: top + height / 2,
    });
    setStartElement(element);
    setDragging(true);
  };

  const drag = (e: { clientX: any; clientY: any; }) => {
    if (dragging) {
      setLine((prevLine: any) => ({
        ...prevLine,
        x2: e.clientX,
        y2: e.clientY,
      }));
    }
  };

  const endDrag = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, endElement: any ) => {
    if (dragging) {
      if (endElement) {
        const { left, top, width, height } = endElement.getBoundingClientRect();
        setLine((prevLine: any) => ({
          ...prevLine,
          x2: left + width / 2,
          y2: top + height / 2,
        }));
        // //console.log("Connected:", startElement.id, "to", endElement.id);
      } else {
        // Reset line if not connected to a valid end element
        setLine(null);
      }
      setDragging(false);
      setStartElement(null);
    }
  };

  return (
    <div onMouseMove={drag} onMouseUp={(e) => endDrag(e, null)} >
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        {line && (
          <line
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="black"
            strokeWidth="2"
          />
        )}
      </svg>

      <div
        id="startf"
        style={{ position: 'absolute', top: '100px', left: '100px', width: '100px', height: '100px', backgroundColor: 'lightblue' }}
        onMouseDown={(e) => startDrag(e, e.target)}
        onMouseUp={(e) => endDrag(e, e.target)}

      >
        Start
      </div>

      <div
        id="endf"
        style={{ position: 'absolute', top: '300px', left: '300px', width: '100px', height: '100px', backgroundColor: 'lightgreen' }}
        onMouseUp={(e) => endDrag(e, e.target)}
        onMouseDown={(e) => startDrag(e, e.target)}

      >
        End
      </div>
      <div
        id="end3f"
        style={{ position: 'absolute', top: '300px', left: '800px', width: '100px', height: '100px', backgroundColor: 'lightgreen' }}
        onMouseUp={(e) => endDrag(e, e.target)}
        onMouseDown={(e) => startDrag(e, e.target)}

      >
        End3
      </div>
    </div>
  );
};

export default ConnectDivsWithLine;
