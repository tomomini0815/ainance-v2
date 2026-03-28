function r(e){const c=new Date().toISOString().replace(/[-:]/g,"").split(".")[0],o={売上高:"AA100",仕入高:"AB100",消耗品費:"AC100",旅費交通費:"AC110",通信費:"AC120",広告宣伝費:"AC130",接待交際費:"AC140",水道光熱費:"AC150",地代家賃:"AC160",外注費:"AC170",減価償却費:"AC180",雑費:"AC190"},a=e.expensesByCategory.map((n,i)=>{const t=o[n.category]||`AC${200+i}`;return`    <${t}>${n.amount}</${t}>`}).join(`
`);return`<?xml version="1.0" encoding="UTF-8"?>
<申告書等送信票等>
  <作成日時>${c}</作成日時>
  <ファイル種別>青色申告決算書</ファイル種別>
  <申告者情報>
    <氏名>${e.name||""}</氏名>
    <住所>${e.address||""}</住所>
  </申告者情報>
  <青色申告決算書>
    <損益計算書>
      <売上金額><AA100>${e.revenue}</AA100></売上金額>
      <必要経費>${a}</必要経費>
      <所得金額>${e.netIncome}</所得金額>
    </損益計算書>
  </青色申告決算書>
</申告書等送信票等>`}function l(e){return`<?xml version="1.0" encoding="UTF-8"?>
<収支内訳書>
  <対象年度>${e.fiscalYear}</対象年度>
  <収入金額><売上金額>${e.revenue}</売上金額></収入金額>
  <差引金額>${e.netIncome}</差引金額>
</収支内訳書>`}function p(e){const c=new Date().toISOString().replace(/[-:]/g,"").split(".")[0],o=i=>i.length===0?"":`
`+i.map(t=>`      <項目>
        <摘要>${t.description}</摘要>
        <金額>${t.amount}</金額>
      </項目>`).join(`
`)+`
    `,a=i=>i.length===0?"":`
`+i.map(t=>`      <資産>
        <名称>${t.name}</名称>
        <取得価額>${t.acquisitionCost}</取得価額>
        <当期償却額>${t.currentDepreciation}</当期償却額>
      </資産>`).join(`
`)+`
    `;return`<?xml version="1.0" encoding="UTF-8"?>
<法人税申告書等データ>
  <作成日時>${c}</作成日時>
  <ファイル種別>法人税申告書</ファイル種別>
  
  <別表一>
    <課税標準額>${e.beppyo1.taxableIncome}</課税標準額>
    <法人税額>${e.beppyo1.corporateTaxAmount}</法人税額>
    <特別控除額>${e.beppyo1.specialTaxCredit}</特別控除額>
    <中間納付額>${e.beppyo1.interimPayment}</中間納付額>
    <差引確定法人税額>${e.beppyo1.corporateTaxAmount-e.beppyo1.specialTaxCredit-e.beppyo1.interimPayment}</差引確定法人税額>
  </別表一>

  <別表四>
    <当期純利益>${e.beppyo4.netIncomeFromPL}</当期純利益>
    <加算項目>${o(e.beppyo4.additions)}</加算項目>
    <減算項目>${o(e.beppyo4.subtractions)}</減算項目>
    <所得金額>${e.beppyo4.taxableIncome}</所得金額>
  </別表四>

  <別表十五>
    <交際費等の支出額>${e.beppyo15.socialExpenses}</交際費等の支出額>
    <接待飲食費の額>${e.beppyo15.deductibleExpenses}</接待飲食費の額>
    <損金不算入額>${e.beppyo15.excessAmount}</損金不算入額>
  </別表十五>

  <別表十六>
    <資産一覧>${a(e.beppyo16.assets)}</資産一覧>
    <償却超過額>${e.beppyo16.excessAmount}</償却超過額>
  </別表十六>

  <財務諸表>
    <貸借対照表>
      <流動資産>${e.financialStatements.balanceSheet.currentAssets}</流動資産>
      <固定資産>${e.financialStatements.balanceSheet.fixedAssets}</固定資産>
      <繰延資産>${e.financialStatements.balanceSheet.deferredAssets}</繰延資産>
      <資産合計>${e.financialStatements.balanceSheet.totalAssets}</資産合計>
      <流動負債>${e.financialStatements.balanceSheet.currentLiabilities}</流動負債>
      <固定負債>${e.financialStatements.balanceSheet.fixedLiabilities}</固定負債>
      <負債合計>${e.financialStatements.balanceSheet.totalLiabilities}</負債合計>
      <資本金>${e.financialStatements.balanceSheet.capitalStock}</資本金>
      <資本剰余金>${e.financialStatements.balanceSheet.capitalSurplus}</資本剰余金>
      <利益剰余金>${e.financialStatements.balanceSheet.retainedEarnings}</利益剰余金>
      <自己株式>${e.financialStatements.balanceSheet.treasuryStock}</自己株式>
      <純資産合計>${e.financialStatements.balanceSheet.totalNetAssets}</純資産合計>
      <負債純資産合計>${e.financialStatements.balanceSheet.totalLiabilitiesAndNetAssets}</負債純資産合計>
    </貸借対照表>
    <損益計算書>
      <売上高>${e.financialStatements.incomeStatement.netSales}</売上高>
      <売上原価>${e.financialStatements.incomeStatement.costOfSales}</売上原価>
      <売上総利益>${e.financialStatements.incomeStatement.grossProfit}</売上総利益>
      <販売費及び一般管理費>${e.financialStatements.incomeStatement.sellingGeneralAdminExpenses}</販売費及び一般管理費>
      <営業利益>${e.financialStatements.incomeStatement.operatingIncome}</営業利益>
      <営業外収益>${e.financialStatements.incomeStatement.nonOperatingIncome}</営業外収益>
      <営業外費用>${e.financialStatements.incomeStatement.nonOperatingExpenses}</営業外費用>
      <経常利益>${e.financialStatements.incomeStatement.ordinaryIncome}</経常利益>
      <特別利益>${e.financialStatements.incomeStatement.extraordinaryIncome}</特別利益>
      <特別損失>${e.financialStatements.incomeStatement.extraordinaryLoss}</特別損失>
      <税引前当期純利益>${e.financialStatements.incomeStatement.incomeBeforeTax}</税引前当期純利益>
      <法人税住民税及事業税>${e.financialStatements.incomeStatement.incomeTaxes}</法人税住民税及事業税>
      <当期純利益>${e.financialStatements.incomeStatement.netIncome}</当期純利益>
    </損益計算書>
  </財務諸表>
  
  <備考>Ainanceにて生成 (Corporate Tax Return Draft)</備考>
</法人税申告書等データ>`}function m(e,s,c="application/octet-stream"){const o=new Blob(["\uFEFF"+e],{type:c}),a=URL.createObjectURL(o),n=document.createElement("a");n.href=a,n.setAttribute("download",s),document.body.appendChild(n),n.click(),document.body.removeChild(n),setTimeout(()=>URL.revokeObjectURL(a),6e4)}const S=m;export{l as a,p as b,m as c,S as d,r as g};
