// nodemon -x "clear;node"

const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const port = 3000;

app.post("/", async (req, res) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let omitBackground = true;

  let url =
    (req.query && req.query.url) ||
    (req.body && req.body.url) ||
    "data:text/html," + (req.query.html || (req.body && req.body.html));

  await page.goto(url, {
    waitUntil: "networkidle2"
  });

  let options = {
    omitBackground: omitBackground
  };

  let result = null;

  const png = async options => {
    return await page.screenshot(options);
  };

  if (req.is("pdf")) {
    result = await page.pdf(options);
    res.contentType("application/pdf");
  } else if (req.is("png")) {
    res.contentType("image/png");
    result = await png(options);
  } else {
    options["encoding"] = "base64";
    res.contentType("application/json");
    result = {
      image: await png(options)
    };
  }

  await browser.close();
  res.send(result);
});

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
