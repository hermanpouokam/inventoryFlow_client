"use client";

import React, { useState, useRef } from "react";
import { Stage, Layer, Text } from "react-konva";

export default function InvoiceEditor() {
  const [elements, setElements] = useState([
    {
      id: "title",
      text: "FACTURE",
      x: 50,
      y: 50,
      fontSize: 24,
      fill: "#000",
      draggable: true,
    },
  ]);

  const handleDragEnd = (id: string, e: any) => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === id ? { ...el, x: e.target.x(), y: e.target.y() } : el
      )
    );
  };

  return (
    <Stage width={800} height={600}>
      <Layer>
        {elements.map((el) => (
          <Text
            key={el.id}
            {...el}
            onDragEnd={(e) => handleDragEnd(el.id, e)}
          />
        ))}
      </Layer>
    </Stage>
  );
}
