import React from 'react';

interface PropertyPanelProps {
  selectedEntity: any;
  onUpdateEntity: (updatedEntity: any) => void;
}

export default function PropertyPanel({ selectedEntity, onUpdateEntity }: PropertyPanelProps) {
  if (!selectedEntity) {
    return (
      <div className="w-80 bg-zinc-900 border-l border-zinc-700 p-6 text-zinc-400">
        <h3 className="text-lg font-semibold mb-4 text-white">属性面板</h3>
        <p>点击画布上的建筑查看详细信息</p>
      </div>
    );
  }

  return (
    <div className="w-80 bg-zinc-900 border-l border-zinc-700 p-6 overflow-auto">
      <h3 className="text-lg font-semibold mb-6 text-white">建筑属性</h3>
      
      <div className="space-y-5">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">建筑类型</label>
          <div className="bg-zinc-800 px-4 py-2.5 rounded-lg">{selectedEntity.displayName || selectedEntity.type}</div>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">位置 (网格坐标)</label>
          <div className="bg-zinc-800 px-4 py-2.5 rounded-lg">
            X: {selectedEntity.x}　Y: {selectedEntity.y}
          </div>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">旋转角度</label>
          <select 
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5"
            value={selectedEntity.rotation || 0}
            onChange={(e) => onUpdateEntity({ ...selectedEntity, rotation: parseInt(e.target.value) })}
          >
            <option value={0}>0°</option>
            <option value={90}>90°</option>
            <option value={180}>180°</option>
            <option value={270}>270°</option>
          </select>
        </div>

        {selectedEntity.type === 'machine' && (
          <div>
            <label className="block text-sm text-zinc-400 mb-1">已绑定配方</label>
            <div className="bg-emerald-950 border border-emerald-800 text-emerald-300 px-4 py-3 rounded-lg text-sm">
              {selectedEntity.recipeId ? '已绑定配方' : '⚠️ 未绑定生产计划'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}