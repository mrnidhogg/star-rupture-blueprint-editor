import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Factory } from 'lucide-react';
import BlueprintCanvas from './components/BlueprintCanvas';
import Toolbar from './components/Toolbar';
import PropertyPanel from './components/PropertyPanel';

function App() {
  const [blueprint, setBlueprint] = useState<any>(null);
  const [layout, setLayout] = useState<any>(null);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ... 保持之前的 fetchBlueprint useEffect ...

  useEffect(() => {
    async function fetchBlueprint() {
      const { data, error } = await supabase
        .from('blueprints')
        .select('*')
        .eq('id', '924a74df-c500-4d54-952c-e964d698d79a')
        .single();

      if (error) setError('读取蓝图失败');
      else {
        setBlueprint(data);
        setLayout(data.layout);
      }
      setLoading(false);
    }
    fetchBlueprint();
  }, []);

  const handleAddEntity = (type: string, machineId?: string, recipeId?: string, displayName?: string) => {
    const newEntity = { id: 'entity-' + Date.now(), type, machineId, recipeId, displayName, x: 6, y: 5, rotation: 0, width: 3, height: 3 };
    if ((window as any).addEntityToCanvas) {
      (window as any).addEntityToCanvas(newEntity);
    }
  };

  const handleUpdateEntity = (updated: any) => {
    if (!layout) return;
    const newEntities = layout.entities.map((e: any) => e.id === updated.id ? updated : e);
    const newLayout = { ...layout, entities: newEntities };
    setLayout(newLayout);
    setSelectedEntity(updated);
  };

  const saveBlueprint = async () => {
    if (!blueprint || !layout) return;

    // TODO: 这里后面会加入自动检测
    const { error } = await supabase
      .from('blueprints')
      .update({ layout })
      .eq('id', blueprint.id);

    if (error) alert('保存失败：' + error.message);
    else alert('✅ 保存成功！');
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">加载中...</div>;

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
          <button onClick={saveBlueprint} className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-lg font-medium">
            💾 保存蓝图
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 p-6 overflow-auto">
            {layout && (
              <BlueprintCanvas
                layout={layout}
                onLayoutChange={setLayout}
                onEntitySelect={setSelectedEntity}     // 新增这行
              />
            )}
          </div>

          <PropertyPanel
            selectedEntity={selectedEntity}
            onUpdateEntity={handleUpdateEntity}
          />
        </div>
      </div>
    </div>
  );
}

export default App;