const express = require("express");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const svr = express();

function formJson(res, data = []) {
	return {
		meta: {
			status: res.statusCode
		},
		data
	};
}

svr.get("/search/words", async (req, res) => {
	res.contentType("application/json");
	if(!req.query.keyword) {
		res.status(400);
		return res.json(formJson(res));
	}
	const keyword = encodeURIComponent(req.query.keyword);

	try {
		const api = fetch(`https://jisho.org/api/v1/search/words?keyword=${keyword}`).then(async res => {
			const json = await res.json();
			if(json.data.length === 0) throw 200;
			if(json.meta.status !== 200) throw json.meta.status;
			return json.data;
		});

		const htmlInfo = fetch(`https://jisho.org/search/${keyword}`).then(async res => {
			const data = [], $ = cheerio.load(await res.text());
			$("#primary .exact_block").children("div").each(function() {
				const obj = {
						furigana: [],
						audio: {}
					}, word = $(this);

				word.find(".furigana span").each(function() {
					obj.furigana.push($(this).text().trim());
				});
				word.find("source").each(function() {
					const src = $(this).attr("src"), [,type] = src.match(/\.(\w+)$/);
					if(!type) return;
					obj.audio[type] = `https:${src}`;
				});

				data.push(obj);
			});
			return data;
		});

		const united = await Promise.all([api, htmlInfo]);
		if(united[0].length !== united[1].length) console.error(united);
		for(let i = 0; i < united[0].length; i++) {
			const apiData = united[0][i], htmlData = united[1][i];
			htmlData.invalid = true;
			apiData.japanese[0].furigana = htmlData.furigana;
			apiData.audio = htmlData.audio;
		}

		return res.json(formJson(
			res, united[0].filter(value => !value.invalid)
		));
	} catch(status) {
		if(Number.isInteger(status)) {
			res.status(status);
		} else {
			res.status(500);
			console.error(status);
		}
		return res.json(formJson(res));
	}
	
});

const port = process.env.PORT || 8080;
svr.listen(port, () => {
	console.log("Listening on port", port);
});
