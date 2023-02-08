import { Request, Response } from 'express';
import { caught } from '../../helpers/caught/caught';
import { emitRequestLog } from '../../helpers/emit-request-log';
import { smartFetch } from '../../helpers/smart-fetch';

export async function AliProductController(request: Request, response: Response): Promise<void> {
  emitRequestLog(request, response);

  const id = request.params['id'];
  const sku = request.params['skuId'];
  const regex = /<script( ((id="__AER_DATA__")|(type="application\/json")))+>/g;
  const url = `https://aliexpress.ru/item/${id}.html?sku_id=${sku}`;
  const productPage = await smartFetch(response, url, { redirect: 'manual', headers: { Cookie: 'aer_abid=d7c1a20e952d3382; acs_usuc_t=x_csrf=h3mptrpcdbai&acs_rt=5731dcff680548d7894016c1b8156fda; xman_t=WdKb444+rV7lLuOokp7o4/979Y99KZD8k2RVUXjqNw8bK418EAmvR0T5c1mMK9nM; xman_f=zUiy/4SNicgye98ufA4rU5UAgxQo9xxFNBBh7LXPt2m/J+EAGTyXsePS2fHeCMyOb/Q/c/GpvodlN3Mr8gJjoq2mcApcmfv57UCnIx1l1S85LOJ/K0ERUA==; xman_us_f=x_locale=ru_RU&x_l=0&x_c_chg=1&acs_rt=8ed41994199f4eebae4bf6798cbd30b4; intl_locale=ru_RU; aep_usuc_f=site=rus&c_tp=RUB&region=RU&b_locale=ru_RU; tmr_lvid=aeb59649688088788c584066e4d8872b; tmr_lvidTS=1664022900764; _ga=GA1.2.946204556.1664022901; _gid=GA1.2.615163926.1664022901; cna=cue1G+53YT8CAW3DU6ezZroE; _ym_uid=1664022901742148321; _ym_d=1664022901; _ym_isad=2; _ym_visorc=b; xlly_s=1; _gat_UA-164782000-1=1; x5sec=7b2261656272696467653b32223a226432386661373138313030666264626331343332643961356131383532346235434a482b75356b47454f6d302b4a7a4337703679537a444c2b64326d42454144227d; l=eBjjUa1RTS2KEhMSKOfZnurza77TIIRAguPzaNbMiOCP_G1w5sjdB6oehMLeCnMNh6SBR3z1UrspBeYBqI0_xdqp3dNCrwMmn; tfstk=cLIRBNTFOSVkYOax99UDT6UaPc5dZDPpGYOnvMA3MkHQ9IodiosGXiCaPpOww-C..; isg=BKKiEY-eNdN3RikP4k1qCxAY8ygE86YNXBjEuuw73JXAv0I51IHjHaA97-NDrx6l; intl_common_forever=9RKt5XKhn+LJCKI3f5y4UfqnSixBHUe1Yy9aCiPEN0tyPgkOOZv7Rw==; JSESSIONID=F5673B6E0523444A90B4DA81B5D10CE6; tmr_detect=0%7C1664024355398; tmr_reqNum=28' } });
  if (!productPage) {

    return;
  }
  const [parseError, html] = await caught(productPage.text());
  if (parseError) {
    response.status(500).send(parseError);

    return;
  }
  const match = regex.exec(html || '');
  if (!match) {
    response.status(500).send('Cannot match script start');

    return;
  }
  const start = (html || '').substring(regex.lastIndex);
  const end = start.indexOf('</script>');
  const jsonString = start.substring(0, end);
  let json: any = {};
  try {
    json = JSON.parse(jsonString);
  } catch {
    response.status(500).send(`Failed to parse "${jsonString}"`);
  }
  const product = (json?.widgets as Array<any> || [])
    ?.find((obj: any) => obj?.widgetId?.includes?.('ProductContextWidget'))
    ?.props;

  response.send(product);
  // response.send(json);
}

