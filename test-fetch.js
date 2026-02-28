async function test() {
    const pdfUrl = 'http://localhost:5173/templates/kakutei1%262.pdf';
    const fontUrl = 'http://localhost:5173/fonts/NotoSansCJKjp-Regular.otf';

    const pdfRes = await fetch(pdfUrl);
    console.log('PDF Status:', pdfRes.status, 'Content-Type:', pdfRes.headers.get('content-type'));

    const fontRes = await fetch(fontUrl);
    console.log('Font Status:', fontRes.status, 'Content-Type:', fontRes.headers.get('content-type'));
}
test();
