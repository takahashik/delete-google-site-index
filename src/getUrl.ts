import {google} from 'googleapis';

const getUrlList = async (): Promise<{url: string}[]> => {
  const apiKey = process.env.SEARCH_API_KEY;
  const searchEngineId = process.env.SEARCH_ENGINE_ID;
  const query = process.env.SEARCH_QUERY;

  google.options({auth: apiKey});
  // 削除対象の件数を取得
  const {
    data: {searchInformation},
  } = await google.customsearch('v1').cse.siterestrict.list({
    cx: searchEngineId,
    q: query,
  });
  const {totalResults} = searchInformation || {totalResults: 0};

  if (isNaN(Number(totalResults))) {
    console.warn(`total result is not number: ${totalResults}`);
    return [];
  }

  // 100件までしかAPIで取得できないのでインデックスの上限を決める
  const totalIndex = Number(totalResults) > 100 ? 100 : Number(totalResults);
  // 10件ずつ取得するので1,11,21...のようなインデックスの配列を作る
  const indexes = [...Array(Number(totalIndex)).keys()].filter(
    index => (index - 1) % 10 === 0
  ) as number[];
  const data: {url: string}[] = [];

  for (const index of indexes) {
    const result = await google.customsearch('v1').cse.siterestrict.list({
      cx: searchEngineId,
      q: query,
      start: index,
    });

    const {
      data: {items},
    } = result;

    // 検索結果と件数に乖離があるので取得できなくなったら処理を止める
    if (!items?.length) break;

    data.push(
      ...(items
        ?.filter(item => item.link)
        .map(item => ({
          url: item.link as string,
        })) || [])
    );
  }

  return data;
};

export default getUrlList;
