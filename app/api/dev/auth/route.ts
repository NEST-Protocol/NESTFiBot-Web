import {fetch} from "next/dist/compiled/@edge-runtime/primitives";
import {dev_hostname} from "../../../misc";
import {Redis} from '@upstash/redis';

const redis_url = process.env.DEV_UPSTASH_REDIS_REST_URL!
const redis_token = process.env.DEV_UPSTASH_REDIS_REST_TOKEN!
const api_hostname = dev_hostname
const bot_token = process.env.DEV_BOT_TOKEN
const chainId = 97

export async function POST(request: Request) {
  // get data from request.body
  const {code, jwt} = await request.json()
  if (!code || !jwt) {
    return new Response('Error', {
      status: 400
    })
  }
  const redis = new Redis({
    url: redis_url,
    token: redis_token,
  })
  let userInfo = await redis.get(`code:${code}`)
  if (!userInfo) {
    return new Response('Error', {
      status: 400
    })
  }
  // @ts-ignore
  const {user, message_id} = userInfo

  if (!user) {
    return new Response('Error', {
      status: 400
    })
  }

  // decode jwt
  const decode = jwt.split('.')[1]
  const decodeJson = JSON.parse(Buffer.from(decode, 'base64').toString())
  const exp = decodeJson.exp
  const address = decodeJson.walletAddress

  // update jwt in redis
  await redis.multi()
    .set(`auth:${user.id}`, jwt, {exat: exp})
    .set(`address:${address}`, user.id, {exat: exp})
    .exec()

  const data = await fetch(`${api_hostname}/nestfi/copy/follower/position/info?chainId=${chainId}`, {
    headers: {
      'Authorization': jwt
    }
  }).then((res) => res.json())
  // @ts-ignore
  const assets = data?.value?.assets || 0
  // @ts-ignore
  const unRealizedPnl = data?.value?.unRealizedPnl || 0
  // @ts-ignore
  const profit = data?.value?.profit || 0

  await fetch(`https://api.telegram.org/bot${bot_token}/editMessageText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: user.id,
      message_id: message_id,
      text: `📊 My Trades
————————————————————
Copy Trading Total Amount: ${assets} NEST
Profit: ${profit} NEST
Unrealized PnL: ${unRealizedPnl} NEST
Address: \`${address}\``,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{text: 'My Account', callback_data: 'cb_account'}],
          [{text: 'My Traders', callback_data: 'cb_kls_p_1'}],
          [{text: 'My Copy Trading', callback_data: 'cb_ps_all_1'}],
        ]
      }
    })
  })
  // return a response
  return new Response('Ok', {
    status: 200
  })
}
