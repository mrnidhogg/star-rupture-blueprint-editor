import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2 } from 'lucide-react';

interface PropertyPanelProps {
    selectedEntity: any;
    onUpdateEntity: (updatedEntity: any) => void;
    onDeleteEntity?: (entityId: string) => void;     // 新增删除回调
}

export default function PropertyPanel({ selectedEntity, onUpdateEntity, onDeleteEntity }: PropertyPanelProps) {
    const [recipes, setRecipes] = useState<any[]>([]);
    const [loadingRecipes, setLoadingRecipes] = useState(false);

    useEffect(() => {
        if (selectedEntity?.type === 'machine' && selectedEntity.machineId) {
            loadRecipesForMachine(selectedEntity.machineId);
        } else {
            setRecipes([]);
        }
    }, [selectedEntity]);

    const loadRecipesForMachine = async (machineId: string) => {
        setLoadingRecipes(true);

        const { data, error } = await supabase
            .from('recipes')
            .select('id, display_name, crafting_time, output_quantity')
            .eq('machine_id', machineId);

        if (error) {
            console.error('加载配方失败:', error);
            setRecipes([]);
        } else {
            setRecipes(data || []);
        }
        setLoadingRecipes(false);
    };

    // 计算每分钟产量
    const calculatePerMinute = (craftingTime: string | number, outputQuantity: number = 1): number => {
        const time = parseFloat(craftingTime as string);
        if (!time || time <= 0) return 0;
        return Math.round((60 / time) * outputQuantity);
    };

    const handleRecipeChange = (recipeId: string) => {
        if (!selectedEntity) return;

        const updated = {
            ...selectedEntity,
            recipeId: recipeId || null
        };

        onUpdateEntity(updated);
    };

    if (!selectedEntity) {
        return (
            <div className="w-80 bg-zinc-900 border-l border-zinc-700 p-6 text-zinc-400">
                <h3 className="text-lg font-semibold mb-4 text-white">属性面板</h3>
                <p>点击画布上的建筑查看详细信息</p>
            </div>
        );
    }

    const isMachine = selectedEntity.type === 'machine';

    return (
        <div className="w-80 bg-zinc-900 border-l border-zinc-700 p-6 overflow-auto">
            <h3 className="text-lg font-semibold mb-6 text-white">建筑属性</h3>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm text-zinc-400 mb-1">建筑名称</label>
                    <div className="bg-zinc-800 px-4 py-3 rounded-lg text-white font-medium">
                        {selectedEntity.displayName || selectedEntity.type}
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-zinc-400 mb-1">网格位置</label>
                    <div className="bg-zinc-800 px-4 py-3 rounded-lg">
                        X: {selectedEntity.x}　Y: {selectedEntity.y}
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-zinc-400 mb-1">旋转角度</label>
                    <select
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white"
                        value={selectedEntity.rotation || 0}
                        onChange={(e) => onUpdateEntity({ ...selectedEntity, rotation: parseInt(e.target.value) })}
                    >
                        <option value={0}>0°</option>
                        <option value={90}>90°</option>
                        <option value={180}>180°</option>
                        <option value={270}>270°</option>
                    </select>
                </div>

                {isMachine && (
                    <div>
                        <label className="block text-sm text-zinc-400 mb-2">生产配方</label>

                        {loadingRecipes ? (
                            <div className="text-zinc-400 py-2">加载配方中...</div>
                        ) : recipes.length > 0 ? (
                            <select
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white"
                                value={selectedEntity.recipeId || ''}
                                onChange={(e) => handleRecipeChange(e.target.value)}
                            >
                                <option value="">-- 请选择生产计划 --</option>
                                {recipes.map((recipe) => {
                                    const perMinute = calculatePerMinute(recipe.crafting_time, recipe.output_quantity || 1);
                                    return (
                                        <option key={recipe.id} value={recipe.id}>
                                            {recipe.display_name} ({perMinute}个/分)
                                        </option>
                                    );
                                })}
                            </select>
                        ) : (
                            <div className="bg-zinc-800 border border-zinc-600 text-zinc-300 px-4 py-3 rounded-lg text-sm">
                                该机器暂无可用配方
                            </div>
                        )}

                        {selectedEntity.recipeId && (
                            <div className="mt-3 text-xs text-emerald-400 flex items-center gap-1">
                                ✓ 已绑定生产计划
                            </div>
                        )}
                    </div>
                )}

                {!isMachine && (
                    <div className="text-sm text-zinc-400 bg-zinc-800 p-4 rounded-lg">
                        当前建筑为运输/仓储类型，暂不支持绑定生产计划
                    </div>
                )}

                {selectedEntity && (
                    <div className="pt-6 border-t border-zinc-700 mt-8">
                        <button
                            onClick={() => {
                                if (confirm(`确定要删除「${selectedEntity.displayName || selectedEntity.type}」吗？`)) {
                                    onDeleteEntity?.(selectedEntity.id);
                                }
                            }}
                            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-medium"
                        >
                            <Trash2 size={18} />
                            删除此建筑
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}