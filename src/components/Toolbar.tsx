import React from 'react';

interface ToolbarProps {
  onAddEntity: (type: string, machineId?: string, recipeId?: string, displayName?: string) => void;
}

export default function Toolbar({ onAddEntity }: ToolbarProps) {
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
      name: "加压器 (Pressurizer)",
      displayName: "加压器",
      type: "machine",
      machineId: "cf8a95ba-6edc-408a-b157-31da39851e86",
      color: "#14b8a6"
    },
    {
      name: "初级储物仓库",
      displayName: "初级仓库",
      type: "storage",
      machineId: "72797c78-a24f-4ac7-8156-a4512bd7a96d",
      color: "#3b82f6"
    },
    {
      name: "中级储物仓库",
      displayName: "中级仓库",
      type: "storage",
      machineId: "104edd12-a830-4ec0-b674-713f5858a71a",
      color: "#2563eb"
    },
    {
      name: "轨道连接器",
      displayName: "轨道连接器",
      type: "connector",
      machineId: "1ceb1bf1-bcd2-4c6c-a606-dc2f70ede373",
      color: "#f59e0b"
    },
    {
      name: "货物派发器",
      displayName: "货物派发器",
      type: "dispatcher",
      machineId: "65a3319c-8cb6-4e2e-b672-0734e59b860c",
      color: "#ea580c"
    },
    {
      name: "货物接收器",
      displayName: "货物接收器",
      type: "receiver",
      machineId: "22cb4d7c-2304-4bf0-9e47-27bf57516c0a",
      color: "#c026d3"
    },
  ];

  return (
    <div className="w-72 bg-zinc-900 border-r border-zinc-700 p-5 overflow-auto">
      <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
        🏗️ 建筑库
      </h3>
      
      <div className="space-y-3">
        {buildings.map((item, index) => (
          <div
            key={index}
            className="group bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 hover:border-zinc-500 rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/json', JSON.stringify(item));
            }}
            onClick={() => onAddEntity(item.type, item.machineId, "", item.displayName)}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-7 h-7 rounded-lg flex-shrink-0 shadow-inner"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1">
                <div className="font-medium text-white">{item.name}</div>
                <div className="text-xs text-zinc-400">点击或拖拽到画布</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}