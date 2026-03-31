import { useEffect, useRef, useState } from 'react';
import { Layer, Stage, Rect, Text, Group } from 'react-konva';

interface Entity {
  id: string;
  type: string;
  machineId?: string;
  recipeId?: string;
  displayName?: string;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
}

interface BlueprintCanvasProps {
  layout: any;
  onLayoutChange?: (newLayout: any) => void;
}

export default function BlueprintCanvas({ layout, onLayoutChange }: BlueprintCanvasProps) {
  const [entities, setEntities] = useState<Entity[]>(layout?.entities || []);
  const stageRef = useRef<any>(null);

  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 800;
  const GRID_SIZE = 32;
  const gridColor = '#1f2937';

  const addEntity = (newEntity: any) => {
    const entityWithDefaults = {
      ...newEntity,
      id: 'entity-' + Date.now(),
      x: newEntity.x || 5,
      y: newEntity.y || 5,
      width: newEntity.width || 3,
      height: newEntity.height || 3,
      rotation: 0,
    };
    const updated = [...entities, entityWithDefaults];
    setEntities(updated);
    onLayoutChange?.({ ...layout, entities: updated });
  };

  useEffect(() => {
    (window as any).addEntityToCanvas = addEntity;
    return () => { delete (window as any).addEntityToCanvas; };
  }, [entities, layout, onLayoutChange]);

  useEffect(() => {
    setEntities(layout?.entities || []);
  }, [layout]);

  return (
    <div className="border border-zinc-700 bg-zinc-950 rounded-xl overflow-hidden shadow-2xl">
      <Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT} ref={stageRef}>
        {/* 网格 */}
        <Layer>
          {Array.from({ length: Math.ceil(CANVAS_WIDTH / GRID_SIZE) + 1 }).map((_, i) => (
            <Rect key={`v-${i}`} x={i * GRID_SIZE} y={0} width={1} height={CANVAS_HEIGHT} fill={gridColor} />
          ))}
          {Array.from({ length: Math.ceil(CANVAS_HEIGHT / GRID_SIZE) + 1 }).map((_, i) => (
            <Rect key={`h-${i}`} x={0} y={i * GRID_SIZE} width={CANVAS_WIDTH} height={1} fill={gridColor} />
          ))}
        </Layer>

        {/* 实体层 */}
        <Layer>
          {entities.map((entity, i) => (
            <Group
              key={entity.id}
              x={entity.x * GRID_SIZE}
              y={entity.y * GRID_SIZE}
              rotation={entity.rotation}
              draggable
              onDragEnd={(e) => {
                const newX = Math.round(e.target.x() / GRID_SIZE);
                const newY = Math.round(e.target.y() / GRID_SIZE);
                const updated = [...entities];
                updated[i] = { ...updated[i], x: newX, y: newY };
                setEntities(updated);
                onLayoutChange?.({ ...layout, entities: updated });
              }}
            >
              <Rect
                width={entity.width * GRID_SIZE}
                height={entity.height * GRID_SIZE}
                fill={entity.type === 'machine' ? '#10b981' : '#3b82f6'}
                stroke="#ffffff"
                strokeWidth={3}
                cornerRadius={6}
              />
              <Text
                text={entity.displayName || entity.type}
                fontSize={14}
                fill="white"
                align="center"
                verticalAlign="middle"
                width={entity.width * GRID_SIZE}
                height={entity.height * GRID_SIZE}
                padding={10}
              />
            </Group>
          ))}
        </Layer>
      </Stage>
    </div>
  );
}