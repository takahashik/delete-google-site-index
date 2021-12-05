import dotenv from 'dotenv';
import deleteUrls from './deleteUrl';
import getUrlList from './getUrl';

dotenv.config();

const handler = async () => {
  // 削除対象を取得
  console.log('operation start');
  const data = await getUrlList();
  console.log('delete target');
  console.log(data);
  const deletedData = await deleteUrls(data);
  return deletedData;
};

handler()
  .then(deletedData => {
    console.log('operation complete.');
    console.log(
      `deleted urls:\n ${deletedData.map(deleted => `${deleted.url}\n`)}`
    );
    process.exit(0);
  })
  .catch(e => {
    console.log('operation error.');
    console.error(e);
    process.exit(1);
  });
