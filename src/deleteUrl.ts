import {google} from 'googleapis';
import secret from '../secret.json';

const excludeList = [
  new RegExp('https://example.com$'),
  new RegExp('https://example.com/hoge$'),
  new RegExp('https://example.com/fuga/*'),
];

// indexing APIを呼ぶためにoAuthでJWTクライアントを取得する
const getOauth2Client = () => {
  const oauth2Client = new google.auth.JWT(
    secret.client_email,
    undefined,
    secret.private_key,
    ['https://www.googleapis.com/auth/indexing'],
    undefined
  );
  return oauth2Client;
};

// 正規表現で消したくないURLを除外するための処理
const checkUrl = ({url}: {url: string}) =>
  excludeList.filter(regexp => regexp.test(url)).length == 0;

const deleteUrls = async (data: {url: string}[]) => {
  const deleteTargets = data.filter(checkUrl);
  if (deleteTargets.length == 0) return [];

  const oauth2Client = getOauth2Client();
  const failedTargets: string[] = [];
  for (const target of deleteTargets) {
    try {
      await google
        .indexing({version: 'v3', auth: oauth2Client})
        .urlNotifications.publish({
          requestBody: {
            type: 'URL_DELETED',
            url: target.url,
          },
        });
      console.log(`url:${target.url} is deleted.`);
    } catch (e) {
      console.log(`url:${target.url} is failed. ${e}`);
      failedTargets.push(target.url);
      continue;
    }
  }

  return deleteTargets.filter(target => !failedTargets.includes(target.url));
};

export default deleteUrls;
