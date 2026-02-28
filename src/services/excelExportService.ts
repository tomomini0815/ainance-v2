/**
 * Excel一括出力サービス
 * 法人税申告に必要な全書類を1つのExcelファイル（複数シート）として出力
 */

import * as XLSX from 'xlsx';
import { CorporateTaxInputData } from '../types/corporateTaxInput';

/**
 * 全ての法人税申告書類を1つのExcelブックとして生成・ダウンロード
 */
export function exportAllToExcel(data: CorporateTaxInputData): void {
    const wb = XLSX.utils.book_new();

    // 1. 別表一: 法人税額計算
    addBeppyo1Sheet(wb, data);

    // 2. 別表二: 同族会社判定
    addBeppyo2Sheet(wb, data);

    // 3. 別表四: 所得金額計算
    addBeppyo4Sheet(wb, data);

    // 4. 別表五(一): 利益積立金額
    addBeppyo5_1Sheet(wb, data);

    // 5. 別表五(二): 租税公課の納付状況
    addBeppyo5_2Sheet(wb, data);

    // 6. 別表十五: 交際費等
    addBeppyo15Sheet(wb, data);

    // 7. 別表十六: 減価償却
    addBeppyo16Sheet(wb, data);

    // 8. 概況説明書
    addBusinessOverviewSheet(wb, data);

    // 9. 財務諸表
    addFinancialStatementsSheet(wb, data);

    // 10. 別表七: 欠損金の繰越控除
    addBeppyo7Sheet(wb, data);

    // 11. 第六号様式: 都道府県民税・事業税
    addForm6Sheet(wb, data);

    // 12. 第二十号様式: 市町村民税
    addForm20Sheet(wb, data);

    // ファイル名の生成
    const companyName = data.companyInfo.corporateName || '法人';
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `${companyName}_法人税申告書_${dateStr}.xlsx`;

    // ダウンロード
    XLSX.writeFile(wb, fileName);
}

// ========== ヘルパー ==========

function addBeppyo1Sheet(wb: XLSX.WorkBook, data: CorporateTaxInputData): void {
    const b1 = data.beppyo1;
    const ci = data.companyInfo;
    const rows = [
        ['別表一（一）　法人税額の計算'],
        [],
        ['法人名', ci.corporateName],
        ['法人番号', ci.corporateNumber],
        ['代表者名', ci.representativeName],
        ['事業年度', `${ci.fiscalYearStart} 〜 ${ci.fiscalYearEnd}`],
        ['資本金の額', ci.capitalAmount],
        [],
        ['【法人税の計算】'],
        ['所得金額又は欠損金額', b1.taxableIncome],
        ['法人税額', b1.corporateTaxAmount],
        ['特別控除額', b1.specialTaxCredit],
        ['中間申告分の法人税額', b1.nationalInterimPayment],
        ['差引確定法人税額', b1.nationalTaxPayable],
        [],
        ['【地方法人税】'],
        ['地方法人税額', b1.localCorporateTaxAmount],
        ['中間申告分', b1.localInterimPayment],
        ['差引確定地方法人税額', b1.localTaxPayable],
        [],
        ['【住民税】'],
        ['都道府県民税（法人税割）', b1.prefecturalTax],
        ['市町村民税（法人税割）', b1.municipalTax],
        ['住民税合計', b1.inhabitantTaxPayable],
        [],
        ['【事業税】'],
        ['事業税', b1.enterpriseTax],
        ['特別法人事業税', b1.specialLocalEnterpriseTax],
        [],
        ['【合計】'],
        ['税額合計', b1.totalTaxAmount],
        ['還付金額', b1.refundAmount],
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws, '別表一');
}

function addBeppyo2Sheet(wb: XLSX.WorkBook, data: CorporateTaxInputData): void {
    const b2 = data.beppyo2;
    const rows: any[][] = [
        ['別表二　同族会社等の判定に関する明細書'],
        [],
        ['発行済株式総数', b2.totalShares],
        ['同族会社判定', b2.isFamilyCompany ? '同族会社に該当' : '非同族会社'],
        [],
        ['【株主一覧】'],
        ['氏名', '住所', '持株数', '代表者との関係'],
    ];
    for (const sh of b2.shareholders) {
        rows.push([sh.name, sh.address, sh.shares, sh.relationship]);
    }
    if (b2.shareholders.length === 0) {
        rows.push(['（未入力）', '', '', '']);
    }
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 20 }, { wch: 30 }, { wch: 12 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws, '別表二');
}

function addBeppyo4Sheet(wb: XLSX.WorkBook, data: CorporateTaxInputData): void {
    const b4 = data.beppyo4;
    const rows: any[][] = [
        ['別表四　所得の金額の計算に関する明細書'],
        [],
        ['当期利益又は当期欠損の額', b4.netIncomeFromPL],
        [],
        ['【加算】'],
        ['損金経理をした法人税及び地方法人税', b4.nonDeductibleTaxes],
        ['損金経理をした住民税', b4.inhabitantTax || 0],
        ['交際費等の損金不算入額', b4.nonDeductibleEntertainment],
        ['減価償却の償却超過額', b4.excessDepreciation],
    ];
    for (const item of b4.otherAdditions) {
        rows.push([item.description, item.amount]);
    }
    const totalAdditions = b4.nonDeductibleTaxes + (b4.inhabitantTax || 0) +
        b4.nonDeductibleEntertainment + b4.excessDepreciation +
        b4.otherAdditions.reduce((s, i) => s + i.amount, 0);
    rows.push(['加算合計', totalAdditions]);
    rows.push([]);
    rows.push(['【減算】']);
    rows.push(['納税充当金から支出した事業税等', b4.deductibleEnterpriseTax]);
    rows.push(['受取配当等の益金不算入額', b4.dividendExclusion]);
    rows.push(['法人税等の還付金', b4.taxRefunds || 0]);
    for (const item of b4.otherSubtractions) {
        rows.push([item.description, item.amount]);
    }
    const totalSubtractions = b4.deductibleEnterpriseTax + b4.dividendExclusion +
        (b4.taxRefunds || 0) + b4.otherSubtractions.reduce((s, i) => s + i.amount, 0);
    rows.push(['減算合計', totalSubtractions]);
    rows.push([]);
    rows.push(['所得金額又は欠損金額', b4.taxableIncome]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 35 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws, '別表四');
}

function addBeppyo5_1Sheet(wb: XLSX.WorkBook, data: CorporateTaxInputData): void {
    const b5 = data.beppyo5;
    const rows: any[][] = [
        ['別表五（一）　利益積立金額及び資本金等の額の計算に関する明細書'],
        [],
        ['【Ⅰ 利益積立金額の計算に関する明細書】'],
        ['区分', '期首現在利益積立金額', '当期の増', '当期の減', '翌期首現在利益積立金額'],
    ];
    for (const item of b5.retainedEarningsItems) {
        rows.push([item.description, item.beginAmount, item.increase, item.decrease, item.endAmount]);
    }
    rows.push([]);
    rows.push(['合計', b5.retainedEarningsBegin, b5.currentIncrease, b5.currentDecrease, b5.totalRetainedEarningsEnd]);
    rows.push([]);
    rows.push(['【Ⅱ 資本金等の額の計算に関する明細書】']);
    rows.push(['区分', '期首現在', '当期の増', '当期の減', '翌期首現在']);
    rows.push(['資本金又は出資金', b5.capitalBegin, b5.capitalIncrease, b5.capitalDecrease, b5.capitalEnd]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 25 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws, '別表五(一)');
}

function addBeppyo5_2Sheet(wb: XLSX.WorkBook, data: CorporateTaxInputData): void {
    const b52 = data.beppyo5_2;
    const rows: any[][] = [
        ['別表五（二）　租税公課の納付状況等に関する明細書'],
        [],
        ['【納付税額】'],
        ['法人税', b52.taxesPayable.corporate],
        ['地方法人税', b52.taxesPayable.localCorporate],
        ['住民税', b52.taxesPayable.inhabitant],
        ['事業税', b52.taxesPayable.enterprise],
        [],
        ['納付済額合計', b52.totalPaid],
        [],
        ['【個別明細】'],
        ['税目', '区分', '金額', '納付日'],
    ];
    for (const item of b52.items) {
        rows.push([item.description, item.category, item.amount, item.paymentDate]);
    }
    if (b52.items.length === 0) {
        rows.push(['（未入力）', '', '', '']);
    }

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 20 }, { wch: 14 }, { wch: 16 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, ws, '別表五(二)');
}

function addBeppyo15Sheet(wb: XLSX.WorkBook, data: CorporateTaxInputData): void {
    const b15 = data.beppyo15;
    const rows = [
        ['別表十五　交際費等の損金算入に関する明細書'],
        [],
        ['支出交際費等の額', b15.socialExpenses || b15.totalEntertainmentExpenses],
        ['うち接待飲食費の額', b15.deductibleExpenses || b15.foodAndDrinkExpenses],
        ['その他の交際費', b15.otherEntertainmentExpenses],
        [],
        ['資本金の額', b15.capitalAmount],
        ['定額控除限度額', b15.deductionLimit],
        ['損金不算入額', b15.excessAmount],
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 25 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws, '別表十五');
}

function addBeppyo16Sheet(wb: XLSX.WorkBook, data: CorporateTaxInputData): void {
    const b16 = data.beppyo16;
    const rows: any[][] = [
        ['別表十六　減価償却資産の償却額の計算に関する明細書'],
        [],
        ['資産名', '取得年月日', '取得価額', '耐用年数', '償却方法', '当期償却額', '償却限度額', '期末帳簿価額'],
    ];
    for (const asset of b16.assets) {
        rows.push([
            asset.name,
            asset.acquisitionDate,
            asset.acquisitionCost,
            asset.usefulLife,
            asset.depreciationMethod,
            asset.currentDepreciation,
            asset.allowableLimit,
            asset.bookValueEnd,
        ]);
    }
    if (b16.assets.length === 0) {
        rows.push(['（未入力）', '', '', '', '', '', '', '']);
    }
    rows.push([]);
    rows.push(['合計', '', '', '', '', b16.totalDepreciation, b16.totalAllowable, '']);
    rows.push(['償却超過額', b16.excessAmount]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, ws, '別表十六');
}

function addBusinessOverviewSheet(wb: XLSX.WorkBook, data: CorporateTaxInputData): void {
    const bo = data.businessOverview;
    const ci = data.companyInfo;
    const rows = [
        ['法人事業概況説明書'],
        [],
        ['法人名', ci.corporateName],
        ['事業種目', ci.businessType],
        ['代表者', ci.representativeName],
        ['所在地', ci.address],
        ['資本金', ci.capitalAmount],
        ['従業員数', ci.employeeCount],
        [],
        ['【損益の状況】'],
        ['売上（収入）金額', bo.sales],
        ['売上原価', bo.costOfSales],
        ['売上総利益', bo.grossProfit],
        ['販売費及び一般管理費', bo.operatingExpenses],
        ['営業利益', bo.operatingIncome],
        ['経常利益', bo.ordinaryIncome],
        ['当期純利益', bo.netIncome],
        [],
        ['【主要経費科目】'],
        ['役員報酬', bo.directorsCompensation],
        ['従業員給与', bo.employeesSalary],
        ['地代家賃', bo.rent],
        ['租税公課', bo.taxesAndDues],
        ['交際費', bo.entertainmentExpenses],
        ['減価償却費', bo.depreciation],
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 25 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws, '概況説明書');
}

function addFinancialStatementsSheet(wb: XLSX.WorkBook, data: CorporateTaxInputData): void {
    const bo = data.businessOverview;
    const b5 = data.beppyo5;
    const ci = data.companyInfo;

    const rows = [
        ['財務諸表'],
        [],
        ['【損益計算書】'],
        ['売上高', bo.sales],
        ['売上原価', bo.costOfSales],
        ['売上総利益', bo.grossProfit],
        ['販売費及び一般管理費', bo.operatingExpenses],
        ['  うち 役員報酬', bo.directorsCompensation],
        ['  うち 給料賃金', bo.employeesSalary],
        ['  うち 地代家賃', bo.rent],
        ['  うち 租税公課', bo.taxesAndDues],
        ['  うち 交際費', bo.entertainmentExpenses],
        ['  うち 減価償却費', bo.depreciation],
        ['営業利益', bo.operatingIncome],
        ['経常利益', bo.ordinaryIncome],
        ['税引前当期純利益', bo.ordinaryIncome],
        ['法人税等', data.beppyo1.totalTaxAmount],
        ['当期純利益', bo.netIncome],
        [],
        ['【貸借対照表（概要）】'],
        ['資本金', ci.capitalAmount],
        ['利益剰余金（期首）', b5.retainedEarningsBegin],
        ['利益剰余金（期末）', b5.totalRetainedEarningsEnd],
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 30 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws, '財務諸表');
}

function addBeppyo7Sheet(wb: XLSX.WorkBook, data: CorporateTaxInputData): void {
    const b7 = data.beppyo7;
    const rows: any[][] = [
        ['別表七（一）　欠損金又は災害損失金の損金算入等に関する明細書'],
        [],
        ['控除前所得金額', b7.preDeductionIncome],
        ['損金算入限度額', b7.deductionLimit],
        [],
        ['【年度別欠損金明細】'],
        ['欠損事業年度', '欠損金額', '前期以前控除済', '当期控除額', '翌期繰越額'],
    ];
    for (const item of b7.items) {
        rows.push([item.fiscalYear, item.originalLoss, item.usedPrior, item.usedCurrent, item.remaining]);
    }
    if (b7.items.length === 0) {
        rows.push(['（繰越欠損金なし）', '', '', '', '']);
    }
    rows.push([]);
    rows.push(['当期損金算入合計', b7.totalDeduction]);
    rows.push(['翌期繰越合計', b7.totalCarryforward]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 22 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, ws, '別表七');
}

function addForm6Sheet(wb: XLSX.WorkBook, data: CorporateTaxInputData): void {
    const f6 = data.form6;
    const ci = data.companyInfo;
    const rows = [
        ['第六号様式　法人都道府県民税・事業税・特別法人事業税申告書'],
        [],
        ['法人名', ci.corporateName],
        ['事業年度', `${ci.fiscalYearStart} 〜 ${ci.fiscalYearEnd}`],
        [],
        ['【事業税（所得割）】'],
        ['課税標準所得', f6.incomeForBusinessTax],
        ['400万円以下 (3.5%)', f6.businessTax400],
        ['400万超800万以下 (5.2%)', f6.businessTax800],
        ['800万超 (7.0%)', f6.businessTaxOver],
        ['事業税合計', f6.businessTaxAmount],
        [],
        ['【特別法人事業税】'],
        ['税率', `${(f6.specialBusinessTaxRate * 100).toFixed(0)}%`],
        ['特別法人事業税額', f6.specialBusinessTaxAmount],
        [],
        ['【都道府県民税】'],
        ['法人税額（課税標準）', f6.corporateTaxBase],
        ['法人税割（税率 ' + (f6.prefecturalTaxRate * 100).toFixed(1) + '%）', f6.prefecturalTaxAmount],
        ['均等割額', f6.prefecturalPerCapita],
        ['都道府県民税合計', f6.totalPrefecturalTax],
        [],
        ['【納付額】'],
        ['中間納付 事業税', f6.interimBusinessTax],
        ['中間納付 都道府県民税', f6.interimPrefecturalTax],
        ['差引納付 事業税', f6.businessTaxPayable],
        ['差引納付 都道府県民税', f6.prefecturalTaxPayable],
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 30 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws, '第六号様式');
}

function addForm20Sheet(wb: XLSX.WorkBook, data: CorporateTaxInputData): void {
    const f20 = data.form20;
    const ci = data.companyInfo;
    const rows = [
        ['第二十号様式　法人市町村民税申告書'],
        [],
        ['法人名', ci.corporateName],
        ['事業年度', `${ci.fiscalYearStart} 〜 ${ci.fiscalYearEnd}`],
        [],
        ['法人税額（課税標準）', f20.corporateTaxBase],
        ['法人税割（税率 ' + (f20.municipalTaxRate * 100).toFixed(1) + '%）', f20.municipalTaxAmount],
        ['均等割額', f20.municipalPerCapita],
        ['市町村民税合計', f20.totalMunicipalTax],
        [],
        ['中間納付額', f20.interimMunicipalTax],
        ['差引納付額', f20.municipalTaxPayable],
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 30 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws, '第二十号様式');
}

