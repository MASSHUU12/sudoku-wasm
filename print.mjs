export function printElement(e) {
    printString(e.innerHTML);
}
export function printString(s) {
    const w = window.open("", "", "height=600,width=800");
    if (w === null) {
        console.error("Print window was unable to open.");
        return;
    }
    w.document.write(`
    <!doctype html>
    <html lang="en">
      <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link href="./reset.css" rel="stylesheet" />
          <link href="./style.css" rel="stylesheet" />
          <style>
            main {
              background-color: #fff;
            }
          </style>
          <title>Sudoku</title>
      </head>
      <body>
          <main>
              <div id="board">
              ${s}
              </div>
          </main>
      </body>
    </html>
  `);
    w.document.close();
    w.onload = function () {
        w.print();
        w.close();
    };
}
//# sourceMappingURL=print.mjs.map