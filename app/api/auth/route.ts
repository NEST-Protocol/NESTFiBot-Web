import {fetch} from "next/dist/compiled/@edge-runtime/primitives";
import {add} from "@noble/hashes/_u64";

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

  // update jwt in redis
  await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/set/auth:${user.id}`, {
    method: 'POST',
    headers: {
      "Authorization": `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
    },
    body: JSON.stringify({
      address: address,
      jwt: jwt,
    }),
  })

  // return a response
  return new Response('Ok', {
    status: 200
  })
}
