import React from 'react'
import { Upload } from 'lucide-react'

interface DocumentUploadProps {
    onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUpload }) => {
    return (
        <label className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-surface-highlight transition-colors block">
            <input
                type="file"
                accept="image/*,application/pdf"
                multiple
                onChange={onUpload}
                className="hidden"
            />
            <Upload className="w-8 h-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm font-medium text-text-main">ファイルを選択</p>
            <p className="text-xs text-text-muted">PNG, JPG, PDF対応</p>
        </label>
    )
}

export default DocumentUpload
