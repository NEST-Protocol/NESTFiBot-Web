import {fetch} from "next/dist/compiled/@edge-runtime/primitives";

export async function POST(request: Request) {
  // get data from request.body
  const {code, jwt, address} = await request.json()
  if (!code || !jwt) {
    return new Response('Error', {
      status: 400
    })
  }
  // query user from the code
  const user = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/code:${code}`, {
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

  // update jwt in redis
  await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/set/auth:${user.id}?exat=${exp}`, {
    method: 'POST',
    headers: {
      "Authorization": `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
    },
    body: jwt,
  })

  // return a response
  return new Response('Ok', {
    status: 200
  })
}
