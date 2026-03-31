import { useState } from 'react';
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
  onDeleteConnection?: (connId: string) => void;
  isConnectMode?: boolean;
  onExitConnectMode?: () => void;
}

export default function BlueprintCanvas({
  layout,
  onLayoutChange,
  onEntitySelect,
  onDeleteConnection,
  isConnectMode = false,
  onExitConnectMode
}: BlueprintCanvasProps) {

  const entities: Entity[] = layout?.entities || [];
  const connections: Connection[] = layout?.connections || [];
  const [selectedForConnection, setSelectedForConnection] = useState<string | null>(null);

  const GRID_SIZE = 32;

  const handleEntityClick = (entity: Entity) => {
    onEntitySelect?.(entity);

    if (isConnectMode) {
      if (selectedForConnection) {
        // 第二次点击 → 创建轨道
        if (selectedForConnection !== entity.id) {
          const newConn: Connection = {
            id: 'conn-' + Date.now(),
            fromEntityId: selectedForConnection,
            toEntityId: entity.id,
          };

          onLayoutChange({
            ...layout,
            connections: [...connections, newConn]
          });
        }
        setSelectedForConnection(null);
        onExitConnectMode?.();        // 自动退出连接模式
      } else {
        // 第一次点击
        setSelectedForConnection(entity.id);
      }
    }
  };

  return (
    <div className="border border-zinc-700 bg-zinc-950 rounded-xl overflow-hidden shadow-2xl relative">
      <Stage width={1200} height={800}>
        {/* 网格背景 */}
        <Layer>
          {Array.from({ length: Math.ceil(1200 / GRID_SIZE) + 1 }).map((_, i) => (
            <Rect key={`v-${i}`} x={i * GRID_SIZE} y={0} width={1} height={800} fill="#1f2937" />
          ))}
          {Array.from({ length: Math.ceil(800 / GRID_SIZE) + 1 }).map((_, i) => (
            <Rect key={`h-${i}`} x={0} y={i * GRID_SIZE} width={1200} height={1} fill="#1f2937" />
          ))}
        </Layer>

        {/* 连接线 - 点击删除 */}
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
                strokeWidth={7}
                lineCap="round"
                onClick={() => onDeleteConnection?.(conn.id)}
              />
            );
          })}
        </Layer>

        {/* 实体层 */}
        <Layer>
          {entities.map((entity, i) => {
            const isSelectedForConn = selectedForConnection === entity.id;

            return (
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
                  stroke={isSelectedForConn ? "#facc15" : "#ffffff"}
                  strokeWidth={isSelectedForConn ? 6 : 3}
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
            );
          })}
        </Layer>
      </Stage>

      {/* 连接模式提示 */}
      {isConnectMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-600 text-white px-6 py-3 rounded-full text-sm shadow-lg z-50 font-medium">
          🔗 连接模式 • 点击第一个建筑 → 点击第二个建筑完成连接
        </div>
      )}
    </div>
  );
}