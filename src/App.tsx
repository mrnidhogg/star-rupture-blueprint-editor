import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Factory, AlertTriangle, CheckCircle } from 'lucide-react';
import BlueprintCanvas from './components/BlueprintCanvas';
import Toolbar from './components/Toolbar';
import PropertyPanel from './components/PropertyPanel';

interface DetectionResult {
  errors: string[];
  warnings: string[];
  isValid: boolean;
}

function App() {
  const [blueprint, setBlueprint] = useState<any>(null);
  const [layout, setLayout] = useState<any>(null);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detection, setDetection] = useState<DetectionResult | null>(null);

  useEffect(() => {
    async function fetchBlueprint() {
      const { data, error } = await supabase
        .from('blueprints')
        .select('*')
        .eq('id', '924a74df-c500-4d54-952c-e964d698d79a')
        .single();

      if (error) {
        setError('读取蓝图失败');
      } else {
        setBlueprint(data);
        setLayout(data.layout);
      }
      setLoading(false);
    }
    fetchBlueprint();
    (window as any).deleteConnection = handleDeleteConnection;
    return () => { delete (window as any).deleteConnection; };
  }, [layout]);

  // ==================== 自动检测逻辑 ====================
  const runDetection = (currentLayout: any): DetectionResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!currentLayout?.entities || currentLayout.entities.length === 0) {
      return { errors: ['蓝图中没有任何建筑'], warnings: [], isValid: false };
    }

    const machines = currentLayout.entities.filter((e: any) => e.type === 'machine');
    const connections = currentLayout.connections || [];

    // 检查1: 所有机器是否绑定配方
    const machinesWithoutRecipe = machines.filter((m: any) => !m.recipeId);
    if (machinesWithoutRecipe.length > 0) {
      errors.push(`有 ${machinesWithoutRecipe.length} 台生产建筑未绑定生产配方`);
    }

    // 检查2: 孤立建筑（没有连接任何轨道的机器或仓储）
    const connectedEntityIds = new Set<string>();
    connections.forEach((conn: any) => {
      connectedEntityIds.add(conn.fromEntityId);
      connectedEntityIds.add(conn.toEntityId);
    });

    const isolatedEntities = currentLayout.entities.filter((e: any) =>
      !connectedEntityIds.has(e.id)
    );

    if (isolatedEntities.length > 0) {
      warnings.push(`检测到 ${isolatedEntities.length} 个孤立建筑（未连接轨道）`);
    }

    // 检查3: 建筑重叠（简单检测）
    const positions = new Map();
    currentLayout.entities.forEach((e: any) => {
      const key = `${Math.floor(e.x)},${Math.floor(e.y)}`;
      if (!positions.has(key)) positions.set(key, []);
      positions.get(key).push(e.displayName || e.type);
    });

    positions.forEach((items, pos) => {
      if (items.length > 1) {
        warnings.push(`位置 (${pos}) 有 ${items.length} 个建筑重叠`);
      }
    });

    return {
      errors,
      warnings,
      isValid: errors.length === 0
    };
  };

  const handleAddEntity = (type: string, machineId?: string, recipeId?: string, displayName?: string) => {
    const newEntity = {
      id: 'entity-' + Date.now(),
      type,
      machineId,
      recipeId,
      displayName,
      x: 6,
      y: 5,
      rotation: 0,
      width: type.includes('storage') ? 4 : 3,
      height: type.includes('storage') ? 4 : 3,
    };
    if ((window as any).addEntityToCanvas) {
      (window as any).addEntityToCanvas(newEntity);
    }
  };

  const handleUpdateEntity = (updated: any) => {
    if (!layout) return;
    const newEntities = layout.entities.map((e: any) =>
      e.id === updated.id ? updated : e
    );
    const newLayout = { ...layout, entities: newEntities };
    setLayout(newLayout);
    setSelectedEntity(updated);
  };

  const handleDeleteEntity = (entityId: string) => {
    if (!layout) return;
    const newEntities = layout.entities.filter((e: any) => e.id !== entityId);
    const newConnections = (layout.connections || []).filter(
      (c: any) => c.fromEntityId !== entityId && c.toEntityId !== entityId
    );
    const newLayout = { ...layout, entities: newEntities, connections: newConnections };
    setLayout(newLayout);
    setSelectedEntity(null);   // 删除后取消选中
  };

  const handleDeleteConnection = (connId: string) => {
    if (!layout) return;
    const newConnections = (layout.connections || []).filter((c: any) => c.id !== connId);
    const newLayout = { ...layout, connections: newConnections };
    setLayout(newLayout);
  };

  const saveBlueprint = async () => {
    if (!blueprint || !layout) {
      alert('没有数据可保存');
      return;
    }

    const check = runDetection(layout);
    setDetection(check);

    if (!check.isValid) {
      const confirmSave = confirm(
        `检测到以下问题：\n\n${check.errors.join('\n')}\n\n${check.warnings.join('\n')}\n\n是否仍要保存？`
      );
      if (!confirmSave) return;
    } else if (check.warnings.length > 0) {
      alert(`检测通过，但有以下提醒：\n${check.warnings.join('\n')}`);
    }

    const { error } = await supabase
      .from('blueprints')
      .update({ layout })
      .eq('id', blueprint.id);

    if (error) {
      alert('保存失败：' + error.message);
    } else {
      alert('✅ 蓝图保存成功！');
      setDetection(null);
    }
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">加载中...</div>;
  if (error) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-400">{error}</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      <Toolbar onAddEntity={handleAddEntity} />

      <div className="flex-1 flex flex-col">
        <div className="h-16 border-b border-zinc-700 bg-zinc-900 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Factory className="w-8 h-8 text-emerald-500" />
            <div>
              <h1 className="text-xl font-bold">{blueprint?.name}</h1>
              <p className="text-sm text-zinc-400">{blueprint?.description}</p>
            </div>
          </div>

          <button
            onClick={saveBlueprint}
            className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-lg font-medium flex items-center gap-2"
          >
            💾 保存蓝图
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 p-6 overflow-auto">
            {layout && (
              <BlueprintCanvas
                layout={layout}
                onLayoutChange={setLayout}
                onEntitySelect={setSelectedEntity}
              />
            )}
          </div>

          <PropertyPanel
            selectedEntity={selectedEntity}
            onUpdateEntity={handleUpdateEntity}
            onDeleteEntity={handleDeleteEntity}   // 新增这行
          />
        </div>

        {/* 检测结果提示 */}
        {detection && (
          <div className="absolute bottom-6 right-6 bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md shadow-2xl z-50">
            <div className="flex items-center gap-3 mb-4">
              {detection.isValid ?
                <CheckCircle className="text-emerald-500 w-6 h-6" /> :
                <AlertTriangle className="text-amber-500 w-6 h-6" />
              }
              <span className="text-lg font-semibold">保存前检测结果</span>
            </div>

            {detection.errors.length > 0 && (
              <div className="text-red-400 mb-4 space-y-1">
                {detection.errors.map((err, i) => (
                  <div key={i}>⚠️ {err}</div>
                ))}
              </div>
            )}

            {detection.warnings.length > 0 && (
              <div className="text-amber-400 text-sm space-y-1">
                {detection.warnings.map((w, i) => (
                  <div key={i}>• {w}</div>
                ))}
              </div>
            )}

            {detection.isValid && detection.warnings.length === 0 && (
              <div className="text-emerald-400">✅ 蓝图检测通过，可以安全保存</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;