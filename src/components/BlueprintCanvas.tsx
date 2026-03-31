import { useEffect } from 'react';
import { Layer, Stage, Rect, Text, Group, Line } from 'react-konva';

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

interface Connection {
  id: string;
  fromEntityId: string;
  toEntityId: string;
}

interface BlueprintCanvasProps {
  layout: any;
  onLayoutChange: (newLayout: any) => void;
  onEntitySelect?: (entity: Entity | null) => void;
  onDeleteConnection?: (connId: string) => void;   // 新增：删除轨道回调
}

export default function BlueprintCanvas({ 
  layout, 
  onLayoutChange, 
  onEntitySelect,
  onDeleteConnection 
}: BlueprintCanvasProps) {
  
  const entities: Entity[] = layout?.entities || [];
  const connections: Connection[] = layout?.connections || [];

  const GRID_SIZE = 32;
  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 800;

  // 点击实体（选中或连接）
  const handleEntityClick = (entity: Entity) => {
    onEntitySelect?.(entity);
  };

  return (
    <div className="border border-zinc-700 bg-zinc-950 rounded-xl overflow-hidden shadow-2xl relative">
      <Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
        {/* 网格 */}
        <Layer>
          {Array.from({ length: Math.ceil(CANVAS_WIDTH / GRID_SIZE) + 1 }).map((_, i) => (
            <Rect key={`v-${i}`} x={i * GRID_SIZE} y={0} width={1} height={CANVAS_HEIGHT} fill="#1f2937" />
          ))}
          {Array.from({ length: Math.ceil(CANVAS_HEIGHT / GRID_SIZE) + 1 }).map((_, i) => (
            <Rect key={`h-${i}`} x={0} y={i * GRID_SIZE} width={CANVAS_WIDTH} height={1} fill="#1f2937" />
          ))}
        </Layer>

        {/* 连接线层 - 支持点击删除 */}
        <Layer>
          {connections.map((conn) => {
            const fromEntity = entities.find(e => e.id === conn.fromEntityId);
            const toEntity = entities.find(e => e.id === conn.toEntityId);
            if (!fromEntity || !toEntity) return null;

            const x1 = (fromEntity.x + fromEntity.width / 2) * GRID_SIZE;
            const y1 = (fromEntity.y + fromEntity.height / 2) * GRID_SIZE;
            const x2 = (toEntity.x + toEntity.width / 2) * GRID_SIZE;
            const y2 = (toEntity.y + toEntity.height / 2) * GRID_SIZE;

            return (
              <Line
                key={conn.id}
                points={[x1, y1, x2, y2]}
                stroke="#94a3b8"
                strokeWidth={6}
                lineCap="round"
                lineJoin="round"
                onClick={() => {
                  if (confirm('确定要删除这条轨道吗？')) {
                    onDeleteConnection?.(conn.id);
                  }
                }}
              />
            );
          })}
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
              onClick={() => handleEntityClick(entity)}
              onDragEnd={(e) => {
                const newX = Math.round(e.target.x() / GRID_SIZE);
                const newY = Math.round(e.target.y() / GRID_SIZE);
                const updatedEntities = [...entities];
                updatedEntities[i] = { ...updatedEntities[i], x: newX, y: newY };
                
                onLayoutChange({
                  ...layout,
                  entities: updatedEntities
                });
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