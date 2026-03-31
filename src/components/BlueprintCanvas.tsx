import { useEffect, useRef, useState } from 'react';
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
  path?: number[][];        // 未来支持折线
}

interface BlueprintCanvasProps {
  layout: any;
  onLayoutChange?: (newLayout: any) => void;
  onEntitySelect?: (entity: Entity | null) => void;
}

export default function BlueprintCanvas({
  layout,
  onLayoutChange,
  onEntitySelect
}: BlueprintCanvasProps) {

  const [entities, setEntities] = useState<Entity[]>(layout?.entities || []);
  const [connections, setConnections] = useState<Connection[]>(layout?.connections || []);
  const [selectedForConnection, setSelectedForConnection] = useState<string | null>(null);

  const stageRef = useRef<any>(null);

  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 800;
  const GRID_SIZE = 32;

  // 添加实体
  const addEntity = (newEntity: any) => {
    const entityWithDefaults = {
      ...newEntity,
      id: 'entity-' + Date.now(),
      x: newEntity.x || 6,
      y: newEntity.y || 5,
      width: newEntity.width || 3,
      height: newEntity.height || 3,
      rotation: 0,
    };
    const updatedEntities = [...entities, entityWithDefaults];
    setEntities(updatedEntities);
    onLayoutChange?.({
      ...layout,
      entities: updatedEntities,
      connections: connections
    });
  };

  // 点击实体（选中或开始连接）
  const handleEntityClick = (entity: Entity) => {
    onEntitySelect?.(entity);

    if (selectedForConnection) {
      // 第二次点击 → 创建连接
      if (selectedForConnection !== entity.id) {
        const newConnection: Connection = {
          id: 'conn-' + Date.now(),
          fromEntityId: selectedForConnection,
          toEntityId: entity.id,
        };
        const updatedConnections = [...connections, newConnection];
        setConnections(updatedConnections);
        onLayoutChange?.({
          ...layout,
          entities,
          connections: updatedConnections
        });
      }
      setSelectedForConnection(null);
    } else {
      // 第一次点击 → 准备连接
      setSelectedForConnection(entity.id);
    }
  };

  useEffect(() => {
    (window as any).addEntityToCanvas = addEntity;
    return () => { delete (window as any).addEntityToCanvas; };
  }, [entities, connections, layout, onLayoutChange]);

  useEffect(() => {
    setEntities(layout?.entities || []);
    setConnections(layout?.connections || []);
  }, [layout]);

  return (
    <div className="border border-zinc-700 bg-zinc-950 rounded-xl overflow-hidden shadow-2xl relative">
      <Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT} ref={stageRef}>
        {/* 网格 */}
        <Layer>
          {Array.from({ length: Math.ceil(CANVAS_WIDTH / GRID_SIZE) + 1 }).map((_, i) => (
            <Rect key={`v-${i}`} x={i * GRID_SIZE} y={0} width={1} height={CANVAS_HEIGHT} fill="#1f2937" />
          ))}
          {Array.from({ length: Math.ceil(CANVAS_HEIGHT / GRID_SIZE) + 1 }).map((_, i) => (
            <Rect key={`h-${i}`} x={0} y={i * GRID_SIZE} width={CANVAS_WIDTH} height={1} fill="#1f2937" />
          ))}
        </Layer>

        {/* 连接线层 */}
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
                onClick={() => {
                  if (confirm('确定删除这条轨道吗？')) {
                    // 调用 App 的删除函数（我们后面会暴露）
                    if ((window as any).deleteConnection) {
                      (window as any).deleteConnection(conn.id);
                    }
                  }
                }}
              />
            );
          })}
        </Layer>

        {/* 实体层 */}
        <Layer>
          {entities.map((entity, i) => {
            const isSelectedForConnection = selectedForConnection === entity.id;

            return (
              <Group
                key={entity.id}
                x={entity.x * GRID_SIZE}
                y={entity.y * GRID_SIZE}
                rotation={entity.rotation}
                draggable
                onClick={() => handleEntityClick(entity)}
                onTap={() => handleEntityClick(entity)}
                onDragEnd={(e) => {
                  const newX = Math.round(e.target.x() / GRID_SIZE);
                  const newY = Math.round(e.target.y() / GRID_SIZE);
                  const updated = [...entities];
                  updated[i] = { ...updated[i], x: newX, y: newY };
                  setEntities(updated);
                  onLayoutChange?.({ ...layout, entities: updated, connections });
                }}
              >
                <Rect
                  width={entity.width * GRID_SIZE}
                  height={entity.height * GRID_SIZE}
                  fill={entity.type === 'machine' ? '#10b981' : '#3b82f6'}
                  stroke={isSelectedForConnection ? "#facc15" : "#ffffff"}
                  strokeWidth={isSelectedForConnection ? 5 : 3}
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

      {/* 操作提示 */}
      {selectedForConnection && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-600 text-white px-6 py-2 rounded-full text-sm shadow-lg">
          已选中第一个建筑，请点击第二个建筑完成连接（再次点击可取消）
        </div>
      )}
    </div>
  );
}