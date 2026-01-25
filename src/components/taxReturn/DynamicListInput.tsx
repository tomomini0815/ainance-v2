import React from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';

interface DynamicListInputProps<T> {
    items: T[];
    onAdd: () => void;
    onRemove: (index: number) => void;
    onEdit: (index: number, item: T) => void;
    renderItem: (item: T, index: number) => React.ReactNode;
    title: string;
    description?: string;
    addButtonLabel?: string;
    maxItems?: number;
}

export function DynamicListInput<T>({
    items,
    onAdd,
    onRemove,
    onEdit,
    renderItem,
    title,
    description,
    addButtonLabel = '追加する',
    maxItems,
}: DynamicListInputProps<T>) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h4 className="font-medium text-text-main">{title}</h4>
                    {description && <p className="text-sm text-text-muted">{description}</p>}
                </div>
                {(!maxItems || items.length < maxItems) && (
                    <button
                        onClick={onAdd}
                        className="btn-sm btn-outline flex items-center gap-1"
                        type="button"
                    >
                        <Plus className="w-4 h-4" />
                        {addButtonLabel}
                    </button>
                )}
            </div>

            {items.length === 0 ? (
                <div className="p-4 bg-surface-highlight rounded-lg border border-border border-dashed text-center text-text-muted text-sm">
                    登録データがありません
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div key={index} className="p-3 bg-surface border border-border rounded-lg relative group">
                            <div className="pr-10">
                                {renderItem(item, index)}
                            </div>
                            <div className="absolute top-3 right-3 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => onRemove(index)}
                                    className="p-1.5 text-error hover:bg-error-light rounded transition-colors"
                                    type="button"
                                    title="削除"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
