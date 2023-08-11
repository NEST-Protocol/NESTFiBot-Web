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

  // 调用telegram接口给用户发消息
  await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/editMessageText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: user.id,
      message_id,
      text: `Welcome to NESTFi, ${user.username}. 

*Address*: ${address}
*Expire at*: ${new Date(exp * 1000).toLocaleString()}.`,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: []
      }
    })
  })
  // return a response
  return new Response('Ok', {
    status: 200
  })
}
