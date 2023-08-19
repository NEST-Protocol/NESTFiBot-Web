import {fetch} from "next/dist/compiled/@edge-runtime/primitives";

export async function POST(request: Request) {
  // get data from request.body
  const {code, jwt} = await request.json()
  if (!code || !jwt) {
    return new Response('Error', {
      status: 400
    })
  }
  // query user from the code
  const {user, message_id} = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/code:${code}`, {
    headers: {
      "Authorization": `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
    },
  })
    .then(response => response.json())
    .then((data: any) => JSON.parse(data.result))

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
  await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/set/auth:${user.id}?exat=${exp}`, {
    method: 'POST',
    headers: {
      "Authorization": `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
    },
    body: jwt,
  })
  const data = await fetch(`https://api.nestfi.net/nestfi/copy/follower/position/info?chainId=56`, {
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

  // 调用telegram接口给用户发消息
  await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/editMessageText`, {
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
