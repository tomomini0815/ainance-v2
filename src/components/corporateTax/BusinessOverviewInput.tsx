import React from 'react';
import { CorporateTaxInputData } from '../../types/corporateTaxInput';
import { MoneyInput } from '../common/MoneyInput';
import { User, Building, MapPin, Phone, Hash, RefreshCw, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface BusinessType {
    id: string;
    business_type: 'individual' | 'corporation';
    company_name: string;
    tax_number: string;
    address: string;
    phone: string;
    representative_name: string;
    established_date?: string;
}

interface Props {
    data: CorporateTaxInputData;
    onChange: (updates: Partial<CorporateTaxInputData>) => void;
    currentBusinessType?: BusinessType | null;
}

export const BusinessOverviewInput: React.FC<Props> = ({ data, onChange, currentBusinessType }) => {
    const handleChange = (field: keyof typeof data.businessOverview, value: number) => {
        onChange({
            businessOverview: {
                ...data.businessOverview,
                [field]: value
            }
        });
    };

    const handleCompanyInfoChange = (field: any, value: any) => {
        onChange({
            companyInfo: {
                ...data.companyInfo,
                [field]: value
            }
        });
    };

    const handleImportFromProfile = () => {
        if (!currentBusinessType) {
            toast.error('事業所データが見つかりません');
            return;
        }

        if (!window.confirm('現在の事業所設定から基本情報を転記しますか？\n（入力済みの内容は上書きされます）')) {
            return;
        }

        onChange({
            companyInfo: {
                ...data.companyInfo,
                corporateName: currentBusinessType.company_name || '',
                corporateNumber: currentBusinessType.tax_number || '',
                address: currentBusinessType.address || '',
                phoneNumber: currentBusinessType.phone || '',
                representativeName: currentBusinessType.representative_name || '',
            }
        });
        toast.success('基本情報を転記しました');
    };

    return (
        <div className="space-y-8">
            {/* Basic Information Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                        <div className="w-1 h-6 bg-primary rounded-full"></div>
                        基本情報
                    </h3>
                    <button
                        onClick={handleImportFromProfile}
                        disabled={!currentBusinessType}
                        className="text-xs px-3 py-1.5 bg-surface border border-border rounded-lg hover:bg-surface-highlight text-primary flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        登録情報を転記
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface p-6 rounded-xl border border-border shadow-sm">
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-text-muted mb-1.5 flex items-center gap-1.5">
                                <Building className="w-3.5 h-3.5" />
                                法人名
                            </label>
                            <input
                                type="text"
                                value={data.companyInfo.corporateName || ''}
                                onChange={(e) => handleCompanyInfoChange('corporateName', e.target.value)}
                                className="input-base w-full"
                                placeholder="例: 株式会社アイナンス"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-text-muted mb-1.5 flex items-center gap-1.5">
                                <Hash className="w-3.5 h-3.5" />
                                法人番号 (13桁)
                            </label>
                            <input
                                type="text"
                                value={data.companyInfo.corporateNumber || ''}
                                onChange={(e) => handleCompanyInfoChange('corporateNumber', e.target.value)}
                                className="input-base w-full font-mono"
                                placeholder="例: 1234567890123"
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-text-muted mb-1.5 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            納税地 (住所)
                        </label>
                        <input
                            type="text"
                            value={data.companyInfo.address || ''}
                            onChange={(e) => handleCompanyInfoChange('address', e.target.value)}
                            className="input-base w-full"
                            placeholder="例: 東京都千代田区..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-text-muted mb-1.5">税務署名</label>
                        <input
                            type="text"
                            value={data.companyInfo.taxOffice || ''}
                            onChange={(e) => handleCompanyInfoChange('taxOffice', e.target.value)}
                            className="input-base w-full"
                            placeholder="例: 神田"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-text-muted mb-1.5 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            代表者氏名
                        </label>
                        <input
                            type="text"
                            value={data.companyInfo.representativeName || ''}
                            onChange={(e) => handleCompanyInfoChange('representativeName', e.target.value)}
                            className="input-base w-full"
                            placeholder="例: 代表 太郎"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-text-muted mb-1.5 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" />
                            電話番号
                        </label>
                        <input
                            type="text"
                            value={data.companyInfo.phoneNumber || ''}
                            onChange={(e) => handleCompanyInfoChange('phoneNumber', e.target.value)}
                            className="input-base w-full"
                            placeholder="例: 03-1234-5678"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-text-muted mb-1.5">資本金の額</label>
                        <MoneyInput
                            value={data.companyInfo.capitalAmount || 0}
                            onChange={(val) => handleCompanyInfoChange('capitalAmount', val)}
                            className="input-base w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-text-muted mb-1.5">事業種目</label>
                        <input
                            type="text"
                            value={data.companyInfo.businessType || ''}
                            onChange={(e) => handleCompanyInfoChange('businessType', e.target.value)}
                            className="input-base w-full"
                            placeholder="例: 情報通信業"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-text-muted mb-1.5">事業年度 (自)</label>
                            <input
                                type="date"
                                value={data.companyInfo.fiscalYearStart || ''}
                                onChange={(e) => handleCompanyInfoChange('fiscalYearStart', e.target.value)}
                                className="input-base w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-text-muted mb-1.5">事業年度 (至)</label>
                            <input
                                type="date"
                                value={data.companyInfo.fiscalYearEnd || ''}
                                onChange={(e) => handleCompanyInfoChange('fiscalYearEnd', e.target.value)}
                                className="input-base w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:gap-x-8 md:gap-y-4">
                <div className="col-span-2 border-b border-border pb-2 mb-2 font-medium text-primary flex items-center gap-2">
                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                    損益計算書項目
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">売上高</label>
                    <MoneyInput
                        value={data.businessOverview.sales}
                        onChange={(val) => handleChange('sales', val)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">売上原価</label>
                    <MoneyInput
                        value={data.businessOverview.costOfSales}
                        onChange={(val) => handleChange('costOfSales', val)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">売上総利益</label>
                    <MoneyInput
                        value={data.businessOverview.grossProfit}
                        onChange={(val) => handleChange('grossProfit', val)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">販売費及び一般管理費</label>
                    <MoneyInput
                        value={data.businessOverview.operatingExpenses}
                        onChange={(val) => handleChange('operatingExpenses', val)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">営業利益</label>
                    <MoneyInput
                        value={data.businessOverview.operatingIncome}
                        onChange={(val) => handleChange('operatingIncome', val)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">経常利益</label>
                    <MoneyInput
                        value={data.businessOverview.ordinaryIncome}
                        onChange={(val) => handleChange('ordinaryIncome', val)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">当期純利益</label>
                    <MoneyInput
                        value={data.businessOverview.netIncome}
                        onChange={(val) => handleChange('netIncome', val)}
                    />
                </div>

                <div className="col-span-2 border-b border-border pb-2 mb-2 mt-4 font-medium text-primary">主要科目の内訳</div>

                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">役員給与</label>
                    <MoneyInput
                        value={data.businessOverview.directorsCompensation}
                        onChange={(val) => handleChange('directorsCompensation', val)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">従業員給料</label>
                    <MoneyInput
                        value={data.businessOverview.employeesSalary}
                        onChange={(val) => handleChange('employeesSalary', val)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">地代家賃</label>
                    <MoneyInput
                        value={data.businessOverview.rent}
                        onChange={(val) => handleChange('rent', val)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">租税公課</label>
                    <MoneyInput
                        value={data.businessOverview.taxesAndDues}
                        onChange={(val) => handleChange('taxesAndDues', val)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">交際費</label>
                    <MoneyInput
                        value={data.businessOverview.entertainmentExpenses}
                        onChange={(val) => handleChange('entertainmentExpenses', val)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">減価償却費</label>
                    <MoneyInput
                        value={data.businessOverview.depreciation}
                        onChange={(val) => handleChange('depreciation', val)}
                    />
                </div>
            </div>
        </div>
    );
};
