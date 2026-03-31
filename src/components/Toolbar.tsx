import React from 'react';

interface ToolbarProps {
  onAddEntity: (type: string, machineId?: string, recipeId?: string, displayName?: string) => void;
  onToggleConnectMode?: () => void;   // 可选
  isConnectMode?: boolean;            // 可选
}

export default function Toolbar({ 
  onAddEntity, 
  onToggleConnectMode, 
  isConnectMode = false 
}: ToolbarProps) {
  const buildings = [
    {
      name: "冶炼厂 (Smelter)",
      displayName: "冶炼厂",
      type: "machine",
      machineId: "dc1ca951-17a9-47af-91b1-8ca0addf4752",
      color: "#10b981"
    },
    {
      name: "制造厂 (Fabricator)",
      displayName: "制造厂",
      type: "machine",
      machineId: "763a3bf5-d798-4ec8-8933-8e4207840734",
      color: "#8b5cf6"
    },
    {
      name: "熔炉 (Furnace)",
      displayName: "熔炉",
      type: "machine",
      machineId: "9a84bff5-eebe-45c3-acf5-d4e79422e58e",
      color: "#ef4444"
    },
    {
      name: "大型冲压机 (Mega Press)",
      displayName: "大型冲压机",
      type: "machine",
      machineId: "67615ff4-b72a-4122-8dc2-d9ba8f701460",
      color: "#f97316"
    },
    {
      name: "中级制造厂 (Fabricator v.2)",
      displayName: "中级制造厂",
      type: "machine",
      machineId: "e993dafe-a371-4775-b4f8-ca874b67b56e",
      color: "#a855f7"
    },
    {
      name: "初级储物仓库",
      displayName: "初级仓库",
      type: "storage",
      machineId: "72797c78-a24f-4ac7-8156-a4512bd7a96d",
      color: "#3b82f6"
    },
  ];

  return (
    <div className="w-72 bg-zinc-900 border-r border-zinc-700 p-5 overflow-auto">
      <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
        🏗️ 建筑库
      </h3>

      {/* 连接轨道模式按钮 */}
      <button
        onClick={onToggleConnectMode}
        className={`w-full mb-6 py-3.5 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all ${
          isConnectMode 
            ? 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg' 
            : 'bg-zinc-700 hover:bg-zinc-600 text-white'
        }`}
      >
        🔗 {isConnectMode ? '退出连接模式' : '进入连接轨道模式'}
      </button>

      <div className="space-y-3">
        {buildings.map((item, index) => (
          <div
            key={index}
            className="group bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 hover:border-zinc-500 rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all"
            draggable
            onDragStart={(e) => e.dataTransfer.setData('application/json', JSON.stringify(item))}
            onClick={() => onAddEntity(item.type, item.machineId, "", item.displayName)}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-7 h-7 rounded-lg flex-shrink-0 shadow-inner"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1">
                <div className="font-medium text-white">{item.name}</div>
                <div className="text-xs text-zinc-400">点击或拖拽放置</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}