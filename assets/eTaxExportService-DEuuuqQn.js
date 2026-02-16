function m(e){const t=new Date().toISOString().replace(/[-:]/g,"").split(".")[0],p={売上高:"AA100",仕入高:"AB100",消耗品費:"AC100",旅費交通費:"AC110",通信費:"AC120",広告宣伝費:"AC130",接待交際費:"AC140",水道光熱費:"AC150",地代家賃:"AC160",外注費:"AC170",減価償却費:"AC180",雑費:"AC190"},o=e.expensesByCategory.map((n,s)=>{const r=p[n.category]||`AC${200+s}`;return`    <${r}>${n.amount}</${r}>`}).join(`
`);return`<?xml version="1.0" encoding="UTF-8"?>
<申告書等送信票等>
  <作成日時>${t}</作成日時>
  <ファイル種別>青色申告決算書</ファイル種別>
  <申告者情報>
    <氏名>${e.name||""}</氏名>
    <住所>${e.address||""}</住所>
  </申告者情報>
  <青色申告決算書>
    <損益計算書>
      <売上金額><AA100>${e.revenue}</AA100></売上金額>
      <必要経費>${o}</必要経費>
      <所得金額>${e.netIncome}</所得金額>
    </損益計算書>
  </青色申告決算書>
</申告書等送信票等>`}function a(e){return`<?xml version="1.0" encoding="UTF-8"?>
<収支内訳書>
  <対象年度>${e.fiscalYear}</対象年度>
  <収入金額><売上金額>${e.revenue}</売上金額></収入金額>
  <差引金額>${e.netIncome}</差引金額>
</収支内訳書>`}function $(e){return`<?xml version="1.0" encoding="UTF-8"?>
<法人税申告書等データ>
    <作成日時>${new Date().toISOString().replace(/[-:]/g,"").split(".")[0]}</作成日時>
    <ファイル種別>法人税申告書</ファイル種別>
    
    <別表一>
        <課税標準額>${e.beppyo1.taxableIncome}</課税標準額>
        <法人税額>${e.beppyo1.corporateTaxAmount}</法人税額>
        <特別控除額>${e.beppyo1.specialTaxCredit}</特別控除額>
        <中間納付額>${e.beppyo1.interimPayment}</中間納付額>
        <差引確定法人税額>${e.beppyo1.corporateTaxAmount-e.beppyo1.specialTaxCredit-e.beppyo1.interimPayment}</差引確定法人税額>
    </别表一>

    <別表四>
        <当期純利益>${e.beppyo4.netIncomeFromPL}</当期純利益>
        <加算項目>
            ${e.beppyo4.additions.map(o=>`
            <項目>
                <摘要>${o.description}</摘要>
                <金額>${o.amount}</金額>
            </項目>`).join("")}
        </加算項目>
        <減算項目>
            ${e.beppyo4.subtractions.map(o=>`
            <項目>
                <摘要>${o.description}</摘要>
                <金額>${o.amount}</金額>
            </項目>`).join("")}
        </減算項目>
        <所得金額>${e.beppyo4.taxableIncome}</所得金額>
    </別表四>

    <別表十五>
        <交際費等の支出額>${e.beppyo15.socialExpenses}</交際費等の支出額>
        <接待飲食費の額>${e.beppyo15.deductibleExpenses}</接待飲食費の額>
        <損金不算入額>${e.beppyo15.excessAmount}</損金不算入額>
    </別表十五>

    <別表十六>
        <資産一覧>
            ${e.beppyo16.assets.map(o=>`
            <資産>
                <名称>${o.name}</名称>
                <取得価額>${o.acquisitionCost}</取得価額>
                <当期償却額>${o.currentDepreciation}</当期償却額>
            </資産>`).join("")}
        </資産一覧>
        <償却超過額>${e.beppyo16.excessAmount}</償却超過額>
    </別表十六>
    
    <備考>Ainanceにて生成 (Corporate Tax Return Draft)</備考>
</法人税申告書等データ>`}function i(e,c,t="application/xml;charset=utf-8"){const p=new Blob(["\uFEFF"+e],{type:t}),o=URL.createObjectURL(p),n=document.createElement("a");n.href=o,n.download=c,document.body.appendChild(n),n.click(),document.body.removeChild(n),setTimeout(()=>URL.revokeObjectURL(o),1e3)}const l=i;export{a,$ as b,i as c,l as d,m as g};
